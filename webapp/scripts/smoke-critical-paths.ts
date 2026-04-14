/**
 * Leichte Schema-Smoke-Tests (ohne App-Server): kritische Spalten nach Migration.
 *
 *   cd webapp && npx tsx scripts/smoke-critical-paths.ts
 */
import pg from "pg";

const REQUIRED: { table: string; column: string }[] = [
  { table: "bookings", column: "payment_status" },
  { table: "bookings", column: "resource_id" },
  { table: "bookable_resources", column: "id" },
  { table: "availability_blocks", column: "user_id" },
  { table: "outbound_webhooks", column: "url" },
];

async function main() {
  const url = process.env.DATABASE_URL?.trim();
  if (!url) {
    console.warn("DATABASE_URL fehlt — Smoke übersprungen.");
    return;
  }
  const client = new pg.Client({ connectionString: url });
  await client.connect();
  try {
    for (const { table, column } of REQUIRED) {
      const r = await client.query(
        `SELECT 1 FROM information_schema.columns
         WHERE table_schema = 'public' AND table_name = $1 AND column_name = $2`,
        [table, column]
      );
      if (r.rowCount === 0) {
        throw new Error(
          `Erwartete Spalte fehlt: ${table}.${column} — npm run db:migrate ausführen.`
        );
      }
    }
    console.log("Smoke OK: Plattform-Spalten vorhanden.");
  } finally {
    await client.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
