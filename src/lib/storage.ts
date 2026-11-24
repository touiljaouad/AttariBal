import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { getStore } from "@netlify/blobs";

/**
 * Pluggable persistent image storage.
 *
 *   - "netlify"   (default) stores images in Netlify Blobs and serves them
 *                 through /api/uploads/<filename>. Required on Netlify, where
 *                 the server filesystem is read-only and not persistent.
 *   - "local"     writes to UPLOAD_DIR or <project>/data/uploads and serves
 *                 through /api/uploads/<filename>. Used when UPLOAD_DIR is set
 *                 (VPS / Docker with a persistent volume).
 *   - "supabase"  uploads to a Supabase Storage bucket over its REST API. Use
 *                 this on serverless hosts (Vercel) where the filesystem is
 *                 ephemeral and uploaded photos would otherwise disappear.
 *
 * Selection is automatic when Supabase credentials are present, and can be
 * forced with IMAGE_STORAGE=netlify|local|supabase.
 */

export type StorageKind = "netlify" | "local" | "supabase";

const BLOB_STORE = "product-images";

export function imageStore() {
  return getStore(BLOB_STORE);
}

const LOCAL_PATTERN = /^\/api\/uploads\/[a-f0-9-]+\.(jpg|png|webp)$/i;

function supabaseConfig() {
  const url = process.env.SUPABASE_URL?.replace(/\/+$/, "");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const bucket = process.env.SUPABASE_STORAGE_BUCKET;
  if (!url || !key || !bucket) return null;
  return { url, key, bucket };
}

export function storageKind(): StorageKind {
  const forced = process.env.IMAGE_STORAGE?.toLowerCase();
  if (forced === "netlify" || forced === "local" || forced === "supabase") return forced;
  if (supabaseConfig()) return "supabase";
  return process.env.UPLOAD_DIR ? "local" : "netlify";
}

/** Only accept URLs produced by our own storage backends. */
export function isAllowedImageUrl(url: string): boolean {
  if (LOCAL_PATTERN.test(url)) return true;
  const config = supabaseConfig();
  if (!config) return false;
  try {
    const parsed = new URL(url);
    const prefix = `${config.url}/storage/v1/object/public/${config.bucket}/`;
    return parsed.protocol === "https:" && url.startsWith(prefix);
  } catch {
    return false;
  }
}

export async function saveImage(buffer: Buffer, extension: string): Promise<string> {
  const filename = `${randomUUID()}.${extension}`;

  if (storageKind() === "supabase") {
    const config = supabaseConfig();
    if (!config) throw new Error("Supabase storage is not configured.");
    const contentType = extension === "jpg" ? "image/jpeg" : `image/${extension}`;
    const response = await fetch(`${config.url}/storage/v1/object/${config.bucket}/${filename}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.key}`,
        "Content-Type": contentType,
        "x-upsert": "true",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
      body: new Uint8Array(buffer),
    });
    if (!response.ok) {
      throw new Error(`Supabase upload failed (${response.status}): ${await safeText(response)}`);
    }
    return `${config.url}/storage/v1/object/public/${config.bucket}/${filename}`;
  }

  if (storageKind() === "netlify") {
    const contentType = extension === "jpg" ? "image/jpeg" : `image/${extension}`;
    const data = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength) as ArrayBuffer;
    await imageStore().set(filename, data, { metadata: { contentType } });
    return `/api/uploads/${filename}`;
  }

  const directory = process.env.UPLOAD_DIR || path.join(process.cwd(), "data", "uploads");
  await mkdir(directory, { recursive: true });
  // wx: never overwrite an existing file.
  await writeFile(path.join(/* turbopackIgnore: true */ directory, filename), buffer, { flag: "wx" });
  return `/api/uploads/${filename}`;
}

export async function deleteImage(url: string): Promise<void> {
  if (!isAllowedImageUrl(url)) return;

  if (url.startsWith("/api/uploads/")) {
    const filename = url.split("/").pop();
    if (!filename || !LOCAL_PATTERN.test(url)) return;
    if (storageKind() === "netlify") {
      try {
        await imageStore().delete(filename);
      } catch {
        /* best-effort cleanup */
      }
      return;
    }
    const directory = process.env.UPLOAD_DIR || path.join(process.cwd(), "data", "uploads");
    try {
      await unlink(path.join(/* turbopackIgnore: true */ directory, filename));
    } catch {
      /* already absent */
    }
    return;
  }

  const config = supabaseConfig();
  if (!config) return;
  const objectPath = url.replace(`${config.url}/storage/v1/object/public/${config.bucket}/`, "");
  if (!objectPath || objectPath.includes("..")) return;
  try {
    await fetch(`${config.url}/storage/v1/object/${config.bucket}/${objectPath}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${config.key}` },
    });
  } catch {
    /* best-effort cleanup */
  }
}

async function safeText(response: Response) {
  try {
    return (await response.text()).slice(0, 300);
  } catch {
    return "unreadable response";
  }
}
