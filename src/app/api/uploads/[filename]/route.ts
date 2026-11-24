import { imageStore, storageKind } from "@/lib/storage";
import { getCloudflareContext } from "@opennextjs/cloudflare";

const TYPES: Record<string, string> = { jpg: "image/jpeg", png: "image/png", webp: "image/webp" };

type R2Object = { body: ReadableStream; httpMetadata?: { contentType?: string } };
type R2BucketBinding = { get(key: string): Promise<R2Object | null> };

export async function GET(_request: Request, context: { params: Promise<{ filename: string }> }) {
  const { filename } = await context.params;
  if (!/^[a-f0-9-]+\.(jpg|png|webp)$/i.test(filename)) return new Response("Not found", { status: 404 });
  const extension = filename.split(".").pop()!.toLowerCase();
  const headers = {
    "Content-Type": TYPES[extension],
    "Cache-Control": "public, max-age=31536000, immutable",
    "X-Content-Type-Options": "nosniff",
  };

  if (storageKind() === "r2") {
    try {
      const { env } = getCloudflareContext();
      const bucket = (env as unknown as { PRODUCT_IMAGES: R2BucketBinding }).PRODUCT_IMAGES;
      const object = await bucket?.get(filename);
      if (object) {
        if (object.httpMetadata?.contentType) headers["Content-Type"] = object.httpMetadata.contentType as typeof headers["Content-Type"];
        return new Response(object.body, { headers });
      }
    } catch {
      return new Response("Not found", { status: 404 });
    }

    // During cutover, older product photos may still exist in Netlify Blobs.
    try {
      const legacy = await imageStore().get(filename, { type: "arrayBuffer" });
      if (legacy) return new Response(legacy, { headers });
    } catch {
      // No legacy Netlify store configured; continue to the normal 404.
    }
    return new Response("Not found", { status: 404 });
  }

  if (storageKind() === "netlify") {
    try {
      const data = await imageStore().get(filename, { type: "arrayBuffer" });
      if (!data) return new Response("Not found", { status: 404 });
      return new Response(data, { headers });
    } catch {
      return new Response("Not found", { status: 404 });
    }
  }

  return new Response("Not found", { status: 404 });
}
