-- Manuelle Stundenbuchung (ERP: nicht-produktive / interne Kategorien).

DO $$ BEGIN
 CREATE TYPE "staff_time_log_category" AS ENUM ('buero_verwaltung', 'vorbereitung', 'meeting', 'fortbildung', 'sonstiges');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "staff_time_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
	"work_date" date NOT NULL,
	"hours" numeric(6, 2) NOT NULL,
	"category" staff_time_log_category NOT NULL,
	"note" text,
	"created_at" timestamptz DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "staff_time_logs_user_date_idx" ON "staff_time_logs" ("user_id", "work_date");
