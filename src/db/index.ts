import { getCloudflareContext } from "@opennextjs/cloudflare";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { cache } from "react";
import * as schema from "../../db/schema";

type CloudflareBindings = {
  HYPERDRIVE: { connectionString: string };
};

function createDb() {
  const { env } = getCloudflareContext();
  const bindings = env as unknown as CloudflareBindings;
  if (!bindings.HYPERDRIVE?.connectionString) {
    throw new Error("Cloudflare Hyperdrive is not configured.");
  }
  const pool = new Pool({
    connectionString: bindings.HYPERDRIVE.connectionString,
    // Workers must not reuse a PostgreSQL connection across requests.
    max: 1,
    maxUses: 1,
  });
  return drizzle({ client: pool, schema });
}

/** A Drizzle client scoped to the current request. */
export const getDb = cache(createDb);

/**
 * Compatibility proxy keeps existing query call-sites intact while resolving
 * the request-scoped client lazily. Do not move getDb() to module scope.
 */
type Database = ReturnType<typeof createDb>;
export const db = new Proxy({} as Database, {
  get(_target, property) {
    const client = getDb();
    const value = Reflect.get(client, property, client) as unknown;
    return typeof value === "function" ? value.bind(client) : value;
  },
});
