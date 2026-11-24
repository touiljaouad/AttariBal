import { readFile } from "node:fs/promises";
import path from "node:path";
import { imageStore, storageKind } from "@/lib/storage";

const TYPES: Record<string, string> = { jpg: "image/jpeg", png: "image/png", webp: "image/webp" };

export async function GET(_request: Request, context: { params: Promise<{ filename: string }> }) {
  const { filename } = await context.params;
  if (!/^[a-f0-9-]+\.(jpg|png|webp)$/i.test(filename)) return new Response("Not found", { status: 404 });
  const extension = filename.split(".").pop()!.toLowerCase();
  const headers = {
    "Content-Type": TYPES[extension],
    "Cache-Control": "public, max-age=31536000, immutable",
    "X-Content-Type-Options": "nosniff",
  };
  if (storageKind() === "netlify") {
    try {
      const data = await imageStore().get(filename, { type: "arrayBuffer" });
      if (!data) return new Response("Not found", { status: 404 });
      return new Response(data, { headers });
    } catch {
      return new Response("Not found", { status: 404 });
    }
  }
  const directory = process.env.UPLOAD_DIR || path.join(process.cwd(), "data", "uploads");
  try {
    const bytes = await readFile(path.join(/* turbopackIgnore: true */ directory, filename));
    return new Response(new Uint8Array(bytes), { headers });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
