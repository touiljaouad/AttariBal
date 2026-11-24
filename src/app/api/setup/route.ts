import { z } from "zod";
import { db } from "@/db";
import { activityLog, admins } from "@/db/schema";
import { clientIp, constantTimeEqual, jsonError, rateLimit, readJson } from "@/lib/api";
import { adminsExist, createSession, hashPassword } from "@/lib/auth";
import { getSetupToken } from "@/lib/setup-token";

export const dynamic = "force-dynamic";

const schema = z.object({
  token: z.string().min(1),
  email: z.string().trim().toLowerCase().email().max(180),
  password: z.string().min(10).max(200),
});

export async function GET() {
  const exists = await adminsExist();
  const token = await getSetupToken();
  return Response.json({ available: !exists, tokenConfigured: Boolean(token) });
}

export async function POST(request: Request) {
  if (!checkSetupRate(request)) return jsonError("Trop de tentatives. Réessayez plus tard.", 429);
  if (await adminsExist()) return jsonError("L'administrateur existe déjà.", 409);

  const configured = await getSetupToken();
  if (!configured) return jsonError("Impossible de lire le jeton de configuration sur le serveur.", 503);

  const body = await readJson(request);
  const parsed = schema.safeParse(body);
  if (!parsed.success) return jsonError("Email invalide ou mot de passe trop court (10 caractères minimum).", 400);
  if (!constantTimeEqual(parsed.data.token.trim(), configured)) return jsonError("Jeton de configuration invalide.", 403);

  const [admin] = await db
    .insert(admins)
    .values({ email: parsed.data.email, passwordHash: hashPassword(parsed.data.password) })
    .returning({ id: admins.id });
  await db.insert(activityLog).values({ adminId: admin.id, action: "setup", entity: "admin", details: "Compte administrateur initial créé" });
  await createSession(admin.id);
  return Response.json({ ok: true });
}

function checkSetupRate(request: Request) {
  return rateLimit(`setup:${clientIp(request)}`, 5, 15 * 60 * 1000);
}
