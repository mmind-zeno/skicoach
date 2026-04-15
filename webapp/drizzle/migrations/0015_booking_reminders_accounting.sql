-- Erinnerungs-Mail-Log (kein Doppelversand pro Buchung/Kanal).

CREATE TABLE IF NOT EXISTS "booking_reminder_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"booking_id" uuid NOT NULL REFERENCES "bookings"("id") ON DELETE CASCADE,
	"channel" text NOT NULL DEFAULT 'email',
	"created_at" timestamptz DEFAULT now() NOT NULL,
	CONSTRAINT "booking_reminder_log_booking_channel_unique" UNIQUE("booking_id", "channel")
);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "booking_reminder_log_booking_id_idx" ON "booking_reminder_log" ("booking_id");
