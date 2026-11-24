import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { settings } from "@/db/schema";
import { jsonError, readJson, requireOriginOrFail } from "@/lib/api";
import { getSessionAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

const schema = z.object({
  instagramUrl: z.string().url().max(300),
  whatsappUrl: z.string().url().max(300),
  phone: z.string().trim().min(3).max(60),
  email: z.string().trim().max(180),
  aboutTitle: z.string().trim().min(2).max(200),
  aboutText: z.string().trim().max(4000),
  instagramNote: z.string().trim().max(1000),
});

export async function PATCH(request: Request) {
  const originError = requireOriginOrFail(request);
  if (originError) return originError;
  const admin = await getSessionAdmin();
  if (!admin) return jsonError("Non autorisé", 401);
  const parsed = schema.safeParse(await readJson(request));
  if (!parsed.success) return jsonError(parsed.error.issues[0]?.message ?? "Données invalides", 400);
  const [row] = await db
    .update(settings)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(settings.id, 1))
    .returning();
  return Response.json(row ?? { ok: true });
}
