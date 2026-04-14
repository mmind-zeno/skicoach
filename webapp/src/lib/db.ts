import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { dbSchema } from "../../drizzle/schema";

const globalForDb = globalThis as unknown as { pool: Pool | undefined };

export function getPool() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set");
  }
  if (!globalForDb.pool) {
    globalForDb.pool = new Pool({
      connectionString: url,
      max: 15,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 10_000,
    });
  }
  return globalForDb.pool;
}

export function getDb() {
  return drizzle(getPool(), { schema: dbSchema });
}
