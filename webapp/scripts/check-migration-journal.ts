/**
 * Prüft, dass jeder Journal-Eintrag eine passende .sql-Datei hat (ohne DB).
 *   cd webapp && npx tsx scripts/check-migration-journal.ts
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

type Journal = { entries: { tag: string }[] };

async function main() {
  const cwd = process.cwd();
  const journalPath = join(cwd, "drizzle/migrations/meta/_journal.json");
  const journal = JSON.parse(readFileSync(journalPath, "utf8")) as Journal;
  const migDir = join(cwd, "drizzle/migrations");
  const missing: string[] = [];
  for (const { tag } of journal.entries) {
    const p = join(migDir, `${tag}.sql`);
    if (!existsSync(p)) missing.push(tag);
  }
  if (missing.length) {
    console.error("Journal ohne SQL-Datei:", missing.join(", "));
    process.exit(1);
  }
  console.log("Journal OK:", journal.entries.length, "Migrationen");
}

main();
