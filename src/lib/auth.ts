import { createHash, randomBytes, scryptSync, timingSafeEqual } from "node:crypto";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { and, eq, gt } from "drizzle-orm";
import { db } from "@/db";
import { admins, sessions } from "@/db/schema";

export const SESSION_COOKIE = "ataribal_session";
const SESSION_DAYS = 30;

export function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derived = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${derived}`;
}

export function verifyPassword(password: string, stored: string) {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash || hash.length !== 128) return false;
  const expected = Buffer.from(hash, "hex");
  const actual = scryptSync(password, salt, 64);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

export function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

export async function createSession(adminId: number) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);
  await db.insert(sessions).values({ tokenHash: hashToken(token), adminId, expiresAt });
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    // Only mark Secure when the browser actually reached us over HTTPS;
    // otherwise the cookie is silently dropped and the owner cannot log in.
    secure: await isSecureRequest(),
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
  return token;
}

async function isSecureRequest() {
  const store = await headers();
  const proto = store.get("x-forwarded-proto")?.split(",")[0]?.trim().toLowerCase();
  if (proto) return proto === "https";
  return process.env.NODE_ENV === "production" && !process.env.ALLOW_INSECURE_COOKIES;
}

export async function destroySession() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) await db.delete(sessions).where(eq(sessions.tokenHash, hashToken(token)));
  store.delete(SESSION_COOKIE);
}

export type SessionAdmin = { id: number; email: string; role: string };

export async function getSessionAdmin(): Promise<SessionAdmin | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const rows = await db
    .select({ id: admins.id, email: admins.email, role: admins.role })
    .from(sessions)
    .innerJoin(admins, eq(admins.id, sessions.adminId))
    .where(and(eq(sessions.tokenHash, hashToken(token)), gt(sessions.expiresAt, new Date())))
    .limit(1);
  return rows[0] ?? null;
}

export async function requireAdminPage(): Promise<SessionAdmin> {
  const admin = await getSessionAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}

export async function adminsExist() {
  const rows = await db.select({ id: admins.id }).from(admins).limit(1);
  return rows.length > 0;
}
