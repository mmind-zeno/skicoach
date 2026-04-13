import { config } from "dotenv";
import { resolve } from "node:path";
import pg from "pg";

config({ path: resolve(process.cwd(), ".env.local") });
config({ path: resolve(process.cwd(), ".env") });

const url = process.env.DATABASE_URL;
if (!url) {
  console.error(
    "DATABASE_URL is not set (check .env / .env.local in the webapp folder)."
  );
  process.exit(1);
}

const pool = new pg.Pool({ connectionString: url });

async function main() {
  const client = await pool.connect();
  try {
    await client.query("SELECT 1");
    console.log("PostgreSQL: connection OK.\n");

    const tables = await client.query<{ table_name: string }>(
      `SELECT table_name FROM information_schema.tables
       WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
       ORDER BY table_name`
    );

    console.log(`Tables (${tables.rows.length}):`);
    for (const { table_name } of tables.rows) {
      if (!/^[a-z_][a-z0-9_]*$/.test(table_name)) continue;
      const c = await client.query(
        `SELECT COUNT(*)::int AS n FROM ${client.escapeIdentifier(table_name)}`
      );
      console.log(`  ${table_name}: ${c.rows[0].n}`);
    }
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
