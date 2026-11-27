import { randomBytes } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { getCloudflareContext } from "@opennextjs/cloudflare";

const TOKEN_FILE = path.join(process.cwd(), "data", "setup-token");
let cached: string | null = null;

/**
 * Resolves the one-time setup token used to create the first administrator.
 *
 * Priority:
 *   1. Cloudflare Worker runtime secret
 *   2. process.env (local development / other Node.js hosts)
 *   3. data/setup-token — generated once and persisted where writable
 *
 * The token is never returned to the browser; it is only compared against the
 * value submitted to the setup endpoint.
 */
export async function getSetupToken(): Promise<string | null> {
  // Read the binding from the active Worker request environment. In Workers,
  // this is the authoritative source for dashboard-configured runtime secrets.
  try {
    const runtimeEnv = getCloudflareContext().env as unknown as Record<string, unknown>;
    const runtimeToken = runtimeEnv.ADMIN_SETUP_TOKEN;
    if (typeof runtimeToken === "string" && runtimeToken.length > 0) {
      return runtimeToken;
    }
  } catch {
    // getCloudflareContext is unavailable outside the Cloudflare runtime.
  }

  if (process.env.ADMIN_SETUP_TOKEN) return process.env.ADMIN_SETUP_TOKEN;
  if (cached) return cached;

  try {
    const existing = (await readFile(TOKEN_FILE, "utf8")).trim();
    if (existing.length >= 32) {
      cached = existing;
      return cached;
    }
  } catch {
    /* file not created yet */
  }

  const token = randomBytes(24).toString("hex");
  try {
    await mkdir(path.dirname(TOKEN_FILE), { recursive: true });
    await writeFile(TOKEN_FILE, token, { mode: 0o600 });
    cached = token;
    console.info(`[setup] Jeton de configuration généré et stocké dans ${TOKEN_FILE}`);
    return cached;
  } catch {
    return null;
  }
}
