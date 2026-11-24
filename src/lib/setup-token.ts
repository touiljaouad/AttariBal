import { randomBytes } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const TOKEN_FILE = path.join(process.cwd(), "data", "setup-token");
let cached: string | null = null;

/**
 * Resolves the one-time setup token used to create the first administrator.
 *
 * Priority:
 *   1. ADMIN_SETUP_TOKEN environment variable (recommended for production)
 *   2. data/setup-token — generated once on the server and persisted
 *
 * The file fallback keeps setup reachable on hosts that regenerate the `.env`
 * file on every restart. The token never leaves the server: it is never sent to
 * the browser, only compared against the value typed on /setup.
 */
export async function getSetupToken(): Promise<string | null> {
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
