-- Wöchentliche Arbeitsfenster (ISO:1=Mo … 7=So). Keine Zeilen = bisheriges Verhalten (Portal-Raster + Sperrzeiten).

CREATE TABLE IF NOT EXISTS "staff_weekly_availability" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
	"day_of_week" integer NOT NULL,
	"start_time" time NOT NULL,
	"end_time" time NOT NULL,
	"created_at" timestamptz DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "staff_weekly_availability_user_day_idx" ON "staff_weekly_availability" ("user_id", "day_of_week");
