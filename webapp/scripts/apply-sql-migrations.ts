/**
 * Wendet Journal-Migrationen (.sql) in Reihenfolge an — robust in Docker ohne drizzle-kit-TTY.
 * Gleiche Hash-/Journal-Logik wie drizzle-kit (SHA-256 des gesamten Dateiinhalts).
 */
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import pg from "pg";

type Journal = { entries: { tag: string; when: number }[] };

/** Ab dieser Tag-Zeile wird wieder echtes SQL ausgeführt (ältere Hashes nur eintragen). */
const LEGACY_BASELINE_BEFORE_TAG =
  process.env.LEGACY_AUTO_BASELINE_BEFORE_TAG ?? "0008_platform_extensions";

function splitStatements(sql: string): string[] {
  return sql
    .split(/-->\s*statement-breakpoint\s*/g)
    .map((p) => p.trim())
    .filter(Boolean);
}

async function maybeLegacyBaselineHashes(
  client: pg.PoolClient,
  journal: Journal,
  migDir: string
) {
  const { rows: cntRows } = await client.query(
    `SELECT count(*)::int as c FROM "__drizzle_migrations"`
  );
  if ((cntRows[0]?.c ?? 0) > 0) return;

  const { rows: hasBookings } = await client.query(
    `SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'bookings' LIMIT 1`
  );
  if (!hasBookings.length) return;

  console.log(
    "[migrate] Leeres __drizzle_migrations, Kern-DB vorhanden: trage Hashes vor",
    LEGACY_BASELINE_BEFORE_TAG,
    "ein (ohne SQL)."
  );
  for (const entry of journal.entries) {
    if (entry.tag >= LEGACY_BASELINE_BEFORE_TAG) break;
    const filePath = join(migDir, `${entry.tag}.sql`);
    const sql = readFileSync(filePath, "utf8");
    const hash = createHash("sha256").update(sql).digest("hex");
    await client.query(
      `INSERT INTO "__drizzle_migrations" (hash, created_at)
       SELECT $1::text, $2::bigint
       WHERE NOT EXISTS (SELECT 1 FROM "__drizzle_migrations" WHERE hash = $1::text)`,
      [hash, entry.when]
    );
  }
}

async function main() {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) {
    console.error("DATABASE_URL fehlt");
    process.exit(1);
  }
  const cwd = process.cwd();
  const journalPath = join(cwd, "drizzle/migrations/meta/_journal.json");
  const journal = JSON.parse(readFileSync(journalPath, "utf8")) as Journal;
  const migDir = join(cwd, "drizzle/migrations");

  const pool = new pg.Pool({ connectionString: url, max: 1 });
  const client = await pool.connect();
  try {
    await client.query(`CREATE TABLE IF NOT EXISTS "__drizzle_migrations" (
      id SERIAL PRIMARY KEY,
      hash text NOT NULL,
      created_at bigint
    )`);

    await maybeLegacyBaselineHashes(client, journal, migDir);

    for (const entry of journal.entries) {
      const filePath = join(migDir, `${entry.tag}.sql`);
      const sql = readFileSync(filePath, "utf8");
      const hash = createHash("sha256").update(sql).digest("hex");
      const done = await client.query(
        `SELECT 1 FROM "__drizzle_migrations" WHERE hash = $1 LIMIT 1`,
        [hash]
      );
      if (done.rowCount && done.rowCount > 0) continue;

      const statements = splitStatements(sql);
      await client.query("BEGIN");
      try {
        for (const stmt of statements) {
          await client.query(stmt);
        }
        await client.query(
          `INSERT INTO "__drizzle_migrations" (hash, created_at) VALUES ($1, $2)`,
          [hash, entry.when]
        );
        await client.query("COMMIT");
        console.log("Migration angewendet:", entry.tag);
      } catch (e) {
        await client.query("ROLLBACK");
        throw e;
      }
    }
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((e) => {
  console.error("Migration fehlgeschlagen:", e);
  process.exit(1);
});
