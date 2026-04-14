-- Lohnstammdaten (FL Merkblatt Lohnabrechnung 2026 — Hilfsrechnung, keine Steuerberatung).

DO $$ BEGIN
 CREATE TYPE "staff_kvg_age_band" AS ENUM ('adult', 'youth_16_20');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "staff_payroll_profiles" (
	"user_id" uuid PRIMARY KEY NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
	"gross_hourly_rate_chf" numeric(10, 2),
	"weekly_hours_for_kvg" numeric(6, 2),
	"kvg_age_band" staff_kvg_age_band DEFAULT 'adult' NOT NULL,
	"apply_wht_4pct" boolean DEFAULT true NOT NULL,
	"merkblatt_small_employment_ack" boolean DEFAULT false NOT NULL,
	"ahv_number" text,
	"notes" text,
	"created_at" timestamptz DEFAULT now() NOT NULL,
	"updated_at" timestamptz DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "staff_payroll_profiles_updated_at_idx" ON "staff_payroll_profiles" ("updated_at");
