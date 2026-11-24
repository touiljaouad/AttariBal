import { timingSafeEqual } from "node:crypto";

export function jsonError(message: string, status = 400) {
  return Response.json({ error: message }, { status });
}

export async function readJson<T = Record<string, unknown>>(request: Request): Promise<T | null> {
  try {
    return (await request.json()) as T;
  } catch {
    return null;
  }
}

/**
 * CSRF protection for state-changing requests.
 * Uses Sec-Fetch-Site when available and otherwise compares the browser Origin
 * against the public host (proxy-aware), because `request.url` can point at the
 * internal host when the app runs behind a reverse proxy or preview tunnel.
 */
export function checkOrigin(request: Request) {
  const secFetchSite = request.headers.get("sec-fetch-site");
  if (secFetchSite === "cross-site") return false;
  if (secFetchSite === "same-origin" || secFetchSite === "none") return true;

  const origin = request.headers.get("origin");
  if (!origin) return true;

  const forwardedHost = request.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
  const hostHeader = request.headers.get("host");
  const siteUrlHost = process.env.NEXT_PUBLIC_SITE_URL
    ? safeHost(process.env.NEXT_PUBLIC_SITE_URL)
    : null;

  const publicHosts = [forwardedHost, hostHeader, siteUrlHost].filter(
    (value): value is string => Boolean(value),
  );

  try {
    const originHost = new URL(origin).host;
    if (publicHosts.length > 0) return publicHosts.includes(originHost);
    return new URL(request.url).host === originHost;
  } catch {
    return false;
  }
}

function safeHost(value: string) {
  try {
    return new URL(value).host;
  } catch {
    return null;
  }
}

export function constantTimeEqual(a: string, b: string) {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

/** Lightweight in-process limiter; use Redis/shared store for multi-instance production. */
export function rateLimit(key: string, max: number, windowMs: number) {
  const now = Date.now();
  const current = buckets.get(key);
  if (current && current.resetAt > now) {
    if (current.count >= max) return false;
    current.count += 1;
    return true;
  }
  buckets.set(key, { count: 1, resetAt: now + windowMs });
  if (buckets.size > 5000) {
    for (const [k, v] of buckets) if (v.resetAt <= now) buckets.delete(k);
  }
  return true;
}

export function clientIp(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
}

export function requireOriginOrFail(request: Request) {
  return checkOrigin(request) ? null : jsonError("Requête refusée (origine invalide).", 403);
}
