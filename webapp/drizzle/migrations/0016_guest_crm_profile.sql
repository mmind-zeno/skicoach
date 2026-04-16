ALTER TABLE "guests" ADD COLUMN IF NOT EXISTS "salutation" text;--> statement-breakpoint
ALTER TABLE "guests" ADD COLUMN IF NOT EXISTS "street" text;--> statement-breakpoint
ALTER TABLE "guests" ADD COLUMN IF NOT EXISTS "postal_code" text;--> statement-breakpoint
ALTER TABLE "guests" ADD COLUMN IF NOT EXISTS "city" text;--> statement-breakpoint
ALTER TABLE "guests" ADD COLUMN IF NOT EXISTS "country" text;--> statement-breakpoint
ALTER TABLE "guests" ADD COLUMN IF NOT EXISTS "date_of_birth" date;--> statement-breakpoint
ALTER TABLE "guests" ADD COLUMN IF NOT EXISTS "gender" text;--> statement-breakpoint
ALTER TABLE "guests" ADD COLUMN IF NOT EXISTS "nationality" text;--> statement-breakpoint
ALTER TABLE "guests" ADD COLUMN IF NOT EXISTS "height_cm" integer;--> statement-breakpoint
ALTER TABLE "guests" ADD COLUMN IF NOT EXISTS "weight_kg" integer;--> statement-breakpoint
ALTER TABLE "guests" ADD COLUMN IF NOT EXISTS "shoe_size_eu" text;--> statement-breakpoint
ALTER TABLE "guests" ADD COLUMN IF NOT EXISTS "emergency_contact_name" text;--> statement-breakpoint
ALTER TABLE "guests" ADD COLUMN IF NOT EXISTS "emergency_contact_phone" text;--> statement-breakpoint
ALTER TABLE "guests" ADD COLUMN IF NOT EXISTS "medical_notes" text;--> statement-breakpoint
ALTER TABLE "guests" ADD COLUMN IF NOT EXISTS "preferred_contact_channel" text;--> statement-breakpoint
ALTER TABLE "guests" ADD COLUMN IF NOT EXISTS "marketing_opt_in" boolean DEFAULT false NOT NULL;--> statement-breakpoint
