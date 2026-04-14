-- Ferien/Abwesenheit: ganze Tage pro Person (inkl. start_date und end_date).

CREATE TABLE IF NOT EXISTS "staff_vacation_periods" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"note" text,
	"created_at" timestamptz DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "staff_vacation_periods_user_range_idx" ON "staff_vacation_periods" ("user_id", "start_date", "end_date");
