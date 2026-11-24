import { drizzle } from "drizzle-orm/netlify-db";
import * as schema from "../../db/schema";

// Netlify Database configures the connection automatically at runtime,
// so no connection string is required (and nothing throws at build time).
export const db = drizzle({ schema });
