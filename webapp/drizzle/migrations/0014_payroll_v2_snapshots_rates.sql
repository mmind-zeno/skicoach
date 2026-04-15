-- Zwei Stundenlöhne, geschätztes Jahresbrutto, freigegebene Monats-Snapshots (YTD für Quellensteuer).

ALTER TABLE "staff_payroll_profiles" ADD COLUMN IF NOT EXISTS "gross_hourly_rate_productive_chf" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "staff_payroll_profiles" ADD COLUMN IF NOT EXISTS "gross_hourly_rate_internal_chf" numeric(10, 2);--> statement-breakpoint
ALTER TABLE "staff_payroll_profiles" ADD COLUMN IF NOT EXISTS "estimated_annual_gross_chf" numeric(12, 2);--> statement-breakpoint

UPDATE "staff_payroll_profiles"
SET "gross_hourly_rate_productive_chf" = "gross_hourly_rate_chf"
WHERE "gross_hourly_rate_productive_chf" IS NULL AND "gross_hourly_rate_chf" IS NOT NULL;--> statement-breakpoint

CREATE TABLE IF NOT EXISTS "payroll_month_snapshots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
	"month_yyyy_mm" text NOT NULL,
	"gross_chf" numeric(12, 2) NOT NULL,
	"snapshot_json" jsonb NOT NULL,
	"finalized_at" timestamptz DEFAULT now() NOT NULL,
	"finalized_by" uuid REFERENCES "users"("id") ON DELETE SET NULL,
	CONSTRAINT "payroll_month_snapshots_user_month_unique" UNIQUE("user_id", "month_yyyy_mm")
);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "payroll_month_snapshots_user_month_idx" ON "payroll_month_snapshots" ("user_id", "month_yyyy_mm");
