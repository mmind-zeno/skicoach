import { defineConfig } from "drizzle-kit";

/** CLI ohne gesetztes DATABASE_URL: optional DB_NAME aus .env (Fork), sonst skicoach */
const fallbackLocalUrl = `postgresql://localhost:5432/${process.env.DB_NAME?.trim() || "skicoach"}`;

export default defineConfig({
  schema: "./drizzle/schema.ts",
  out: "./drizzle/migrations",
  dialect: "postgresql",
  dbCredentials: {
    url:
      process.env.DATABASE_URL?.trim() ||
      process.env.DRIZZLE_DATABASE_URL?.trim() ||
      fallbackLocalUrl,
  },
});
