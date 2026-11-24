import { z } from "zod";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { admins } from "@/db/schema";
import { checkOrigin, clientIp, jsonError, rateLimit, readJson, requireOriginOrFail } from "@/lib/api";
import { createSession, verifyPassword } from "@/lib/auth";

export const dynamic = "force-dynamic";

const schema = z.object({ email: z.string().trim().toLowerCase().email().max(180), password: z.string().min(1).max(200) });

export async function POST(request: Request) {
  const originError = requireOriginOrFail(request);
  if (originError) return originError;
  if (!checkOrigin(request)) return jsonError("Origine invalide", 403);
  if (!rateLimit(`login:${clientIp(request)}`, 6, 15 * 60 * 1000)) return jsonError("Trop de tentatives. Réessayez dans 15 minutes.", 429);

  const parsed = schema.safeParse(await readJson(request));
  if (!parsed.success) return jsonError("Email ou mot de passe invalide.", 400);

  const [admin] = await db.select().from(admins).where(eq(admins.email, parsed.data.email)).limit(1);
  if (!admin || !verifyPassword(parsed.data.password, admin.passwordHash)) {
    return jsonError("Email ou mot de passe incorrect.", 401);
  }
  await createSession(admin.id);
  return Response.json({ ok: true });
}
