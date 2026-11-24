import { clientIp, jsonError, rateLimit, requireOriginOrFail } from "@/lib/api";
import { getSessionAdmin } from "@/lib/auth";
import { saveImage, storageKind } from "@/lib/storage";

export const dynamic = "force-dynamic";

const MAX_BYTES = 8 * 1024 * 1024;
const TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export async function POST(request: Request) {
  const originError = requireOriginOrFail(request);
  if (originError) return originError;
  const admin = await getSessionAdmin();
  if (!admin) return jsonError("Non autorisé", 401);
  if (!rateLimit(`upload:${clientIp(request)}`, 60, 60 * 1000)) return jsonError("Trop d'uploads. Réessayez plus tard.", 429);

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return jsonError("Formulaire invalide", 400);
  }
  const file = form.get("file");
  if (!(file instanceof File)) return jsonError("Aucun fichier fourni", 400);
  const extension = TYPES[file.type];
  if (!extension) return jsonError("Format non autorisé : utilisez JPG, PNG ou WebP.", 415);
  if (file.size > MAX_BYTES) return jsonError("Image trop volumineuse (8 Mo maximum).", 413);
  if (file.size === 0) return jsonError("Fichier vide.", 400);

  const bytes = Buffer.from(await file.arrayBuffer());
  const signature = bytes.subarray(0, 4).toString("hex");
  const validSignature =
    extension === "jpg"
      ? signature.startsWith("ffd8")
      : extension === "png"
        ? signature.startsWith("89504e47")
        : signature === "52494646" && bytes.subarray(8, 12).toString("ascii") === "WEBP";
  if (!validSignature) return jsonError("Le contenu du fichier ne correspond pas à son type.", 415);

  try {
    const url = await saveImage(bytes, extension);
    return Response.json({ url, name: file.name, size: file.size, storage: storageKind() });
  } catch (error) {
    const detail = error instanceof Error ? error.message : "unknown";
    console.error("[uploads] storage failure:", detail);
    return jsonError(
      storageKind() === "supabase"
        ? "Échec de l'envoi vers le stockage distant. Vérifiez la configuration Supabase."
        : "Échec de l'enregistrement de l'image sur le serveur.",
      502,
    );
  }
}
