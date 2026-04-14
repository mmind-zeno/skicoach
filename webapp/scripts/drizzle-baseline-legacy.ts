/**
 * Markiert alle Migrationen aus `drizzle/migrations/meta/_journal.json` als bereits
 * angewendet, ohne SQL auszuführen — für Legacy-DBs, deren Schema manuell dem Stand
 * entspricht, aber `__drizzle_migrations` leer ist (sonst schlägt `drizzle-kit migrate` fehl).
 *
 * Voraussetzung: Tabellen wirklich angelegt / angeglichen. Danach normale `db:migrate`-Läufe.
 *
 *   cd webapp && npx tsx scripts/drizzle-baseline-legacy.ts
 */
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import pg from "pg";

type Journal = {
  entries: { tag: string; when: number }[];
};

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

  const client = new pg.Client({ connectionString: url });
  await client.connect();
  await client.query(`
    CREATE TABLE IF NOT EXISTS "__drizzle_migrations" (
      id SERIAL PRIMARY KEY,
      hash text NOT NULL,
      created_at bigint
    );
  `);

  for (const entry of journal.entries) {
    const filePath = join(migDir, `${entry.tag}.sql`);
    const sql = readFileSync(filePath, "utf8");
    const hash = createHash("sha256").update(sql).digest("hex");
    const existing = await client.query(
      `SELECT 1 FROM "__drizzle_migrations" WHERE hash = $1 LIMIT 1`,
      [hash]
    );
    if (existing.rowCount === 0) {
      await client.query(
        `INSERT INTO "__drizzle_migrations" (hash, created_at) VALUES ($1, $2)`,
        [hash, entry.when]
      );
      console.log("baseline:", entry.tag);
    }
  }

  await client.end();
  console.log("Baseline fertig.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
