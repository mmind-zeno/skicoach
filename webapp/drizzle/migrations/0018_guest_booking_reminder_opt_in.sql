ALTER TABLE "guests" ADD COLUMN IF NOT EXISTS "booking_reminder_opt_in" boolean DEFAULT true NOT NULL;--> statement-breakpoint
