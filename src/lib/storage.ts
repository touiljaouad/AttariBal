import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getStore } from "@netlify/blobs";

/**
 * Image storage adapters:
 * - R2 is used automatically inside the Cloudflare Worker.
 * - Netlify Blobs remains available as a temporary legacy-read fallback while
 *   existing image objects are copied into R2.
 * - Supabase and local disk remain available for existing non-Cloudflare use.
 */
export type StorageKind = "r2" | "netlify" | "local" | "supabase";

type R2BucketBinding = {
  put(key: string, value: ArrayBuffer | ArrayBufferView | ReadableStream, options?: {
    httpMetadata?: { contentType?: string; cacheControl?: string };
  }): Promise<unknown>;
  get(key: string): Promise<{ body: ReadableStream; httpMetadata?: { contentType?: string } } | null>;
  delete(key: string): Promise<void>;
};

const BLOB_STORE = "product-images";
const LOCAL_PATTERN = /^\/api\/uploads\/[a-f0-9-]+\.(jpg|png|webp)$/i;

function r2Bucket(): R2BucketBinding | null {
  try {
    const { env } = getCloudflareContext();
    return (env as unknown as { PRODUCT_IMAGES?: R2BucketBinding }).PRODUCT_IMAGES ?? null;
  } catch {
    // Normal Next.js development/test runtime has no Worker context.
    return null;
  }
}

export function imageStore() {
  return getStore(BLOB_STORE);
}

function supabaseConfig() {
  const url = process.env.SUPABASE_URL?.replace(/\/+$/, "");
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const bucket = process.env.SUPABASE_STORAGE_BUCKET;
  if (!url || !key || !bucket) return null;
  return { url, key, bucket };
}

export function storageKind(): StorageKind {
  const forced = process.env.IMAGE_STORAGE?.toLowerCase();
  if (forced === "r2" || forced === "netlify" || forced === "local" || forced === "supabase") return forced;
  if (r2Bucket()) return "r2";
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
  const kind = storageKind();

  if (kind === "r2") {
    const bucket = r2Bucket();
    if (!bucket) throw new Error("Cloudflare R2 binding PRODUCT_IMAGES is unavailable.");
    const contentType = extension === "jpg" ? "image/jpeg" : `image/${extension}`;
    const data = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength) as ArrayBuffer;
    await bucket.put(filename, data, {
      httpMetadata: {
        contentType,
        cacheControl: "public, max-age=31536000, immutable",
      },
    });
    return `/api/uploads/${filename}`;
  }

  if (kind === "supabase") {
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

  if (kind === "netlify") {
    const contentType = extension === "jpg" ? "image/jpeg" : `image/${extension}`;
    const data = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength) as ArrayBuffer;
    await imageStore().set(filename, data, { metadata: { contentType } });
    return `/api/uploads/${filename}`;
  }

  const directory = process.env.UPLOAD_DIR || path.join(process.cwd(), "data", "uploads");
  await mkdir(directory, { recursive: true });
  await writeFile(path.join(/* turbopackIgnore: true */ directory, filename), buffer, { flag: "wx" });
  return `/api/uploads/${filename}`;
}

export async function deleteImage(url: string): Promise<void> {
  if (!isAllowedImageUrl(url)) return;

  if (url.startsWith("/api/uploads/")) {
    const filename = url.split("/").pop();
    if (!filename || !LOCAL_PATTERN.test(url)) return;
    const kind = storageKind();
    if (kind === "r2") {
      const bucket = r2Bucket();
      if (bucket) await bucket.delete(filename);
      return;
    }
    if (kind === "netlify") {
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
