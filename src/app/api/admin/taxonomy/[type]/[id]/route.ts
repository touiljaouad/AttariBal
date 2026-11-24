import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { brands, categories } from "@/db/schema";
import { jsonError, readJson, requireOriginOrFail } from "@/lib/api";
import { getSessionAdmin } from "@/lib/auth";
import { slugify } from "@/lib/constants";

export const dynamic = "force-dynamic";

const schema = z.object({ name: z.string().trim().min(2).max(80) });
type Context = { params: Promise<{ type: string; id: string }> };

function tableFor(type: string) {
  if (type === "categories") return categories;
  if (type === "brands") return brands;
  return null;
}

export async function PATCH(request: Request, context: Context) {
  const originError = requireOriginOrFail(request);
  if (originError) return originError;
  const admin = await getSessionAdmin();
  if (!admin) return jsonError("Non autorisé", 401);
  const { type, id: rawId } = await context.params;
  const id = Number(rawId);
  const table = tableFor(type);
  if (!table || !Number.isInteger(id)) return jsonError("Ressource introuvable", 404);
  const parsed = schema.safeParse(await readJson(request));
  if (!parsed.success) return jsonError("Nom invalide", 400);
  try {
    const [row] = await db
      .update(table)
      .set({ name: parsed.data.name, slug: slugify(parsed.data.name) })
      .where(eq(table.id, id))
      .returning();
    return row ? Response.json(row) : jsonError("Introuvable", 404);
  } catch {
    return jsonError("Ce nom existe déjà.", 409);
  }
}

export async function DELETE(_request: Request, context: Context) {
  const admin = await getSessionAdmin();
  if (!admin) return jsonError("Non autorisé", 401);
  const { type, id: rawId } = await context.params;
  const id = Number(rawId);
  const table = tableFor(type);
  if (!table || !Number.isInteger(id)) return jsonError("Ressource introuvable", 404);
  await db.delete(table).where(eq(table.id, id));
  return Response.json({ ok: true });
}
