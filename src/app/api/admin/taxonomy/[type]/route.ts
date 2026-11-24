import { z } from "zod";
import { db } from "@/db";
import { brands, categories } from "@/db/schema";
import { jsonError, readJson, requireOriginOrFail } from "@/lib/api";
import { getSessionAdmin } from "@/lib/auth";
import { slugify } from "@/lib/constants";

export const dynamic = "force-dynamic";

const schema = z.object({ name: z.string().trim().min(2, "Nom trop court").max(80) });
type Context = { params: Promise<{ type: string }> };

function tableFor(type: string) {
  if (type === "categories") return categories;
  if (type === "brands") return brands;
  return null;
}

export async function GET(_request: Request, context: Context) {
  const admin = await getSessionAdmin();
  if (!admin) return jsonError("Non autorisé", 401);
  const table = tableFor((await context.params).type);
  if (!table) return jsonError("Ressource introuvable", 404);
  return Response.json(await db.select().from(table));
}

export async function POST(request: Request, context: Context) {
  const originError = requireOriginOrFail(request);
  if (originError) return originError;
  const admin = await getSessionAdmin();
  if (!admin) return jsonError("Non autorisé", 401);
  const table = tableFor((await context.params).type);
  if (!table) return jsonError("Ressource introuvable", 404);
  const parsed = schema.safeParse(await readJson(request));
  if (!parsed.success) return jsonError(parsed.error.issues[0]?.message ?? "Nom invalide", 400);
  try {
    const [row] = await db
      .insert(table)
      .values({ name: parsed.data.name, slug: slugify(parsed.data.name) })
      .returning();
    return Response.json(row, { status: 201 });
  } catch {
    return jsonError("Cette entrée existe déjà.", 409);
  }
}
