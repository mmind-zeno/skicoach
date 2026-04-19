WITH ranked AS (
  SELECT id, ROW_NUMBER() OVER (PARTITION BY booking_id ORDER BY created_at ASC) AS rn
  FROM booking_reminder_log
)
DELETE FROM booking_reminder_log WHERE id IN (SELECT id FROM ranked WHERE rn > 1);--> statement-breakpoint
DROP INDEX IF EXISTS "booking_reminder_log_booking_channel_unique";--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "booking_reminder_log_booking_id_unique" ON "booking_reminder_log" ("booking_id");--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "app_settings" (
	"key" text PRIMARY KEY NOT NULL,
	"value" text NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "newsletter_campaigns" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"subject" text NOT NULL,
	"html_body" text NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"sent_at" timestamp with time zone,
	"recipient_count" integer DEFAULT 0 NOT NULL,
	"sent_count" integer DEFAULT 0 NOT NULL,
	"created_by_user_id" uuid REFERENCES "users"("id") ON DELETE SET NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "newsletter_campaigns_created_at_idx" ON "newsletter_campaigns" ("created_at");--> statement-breakpoint
