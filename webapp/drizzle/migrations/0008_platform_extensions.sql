-- P1: buchbare Ressourcen, Sperrzeiten | P2: Zahlungsfelder | P3: ausgehende Webhooks
-- Idempotent für Legacy-DBs.

CREATE TABLE IF NOT EXISTS "bookable_resources" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"user_id" uuid REFERENCES "users"("id") ON DELETE SET NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamptz DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "bookable_resources_user_id_unique" ON "bookable_resources" ("user_id") WHERE "user_id" IS NOT NULL;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "availability_blocks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
	"block_date" date NOT NULL,
	"start_time" time NOT NULL,
	"end_time" time NOT NULL,
	"note" text,
	"created_at" timestamptz DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "availability_blocks_user_date_idx" ON "availability_blocks" ("user_id", "block_date");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "outbound_webhooks" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"url" text NOT NULL,
	"secret" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamptz DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "resource_id" uuid REFERENCES "bookable_resources"("id") ON DELETE SET NULL;
--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "payment_status" text DEFAULT 'none' NOT NULL;
--> statement-breakpoint
ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "payment_external_ref" text;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "bookings_resource_id_idx" ON "bookings" ("resource_id");
--> statement-breakpoint
INSERT INTO "bookable_resources" ("name", "user_id", "is_active")
SELECT COALESCE(NULLIF(TRIM(u."name"), ''), u."email"), u."id", u."is_active"
FROM "users" u
WHERE NOT EXISTS (
	SELECT 1 FROM "bookable_resources" br WHERE br."user_id" = u."id"
);
--> statement-breakpoint
UPDATE "bookings" b
SET "resource_id" = br."id"
FROM "bookable_resources" br
WHERE br."user_id" = b."teacher_id" AND b."resource_id" IS NULL;
