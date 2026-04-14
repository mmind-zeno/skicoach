-- Legacy-DBs ohne 0002: INSERT mit company/crm_source → "column does not exist".
ALTER TABLE "public"."guests" ADD COLUMN IF NOT EXISTS "company" text;
--> statement-breakpoint
ALTER TABLE "public"."guests" ADD COLUMN IF NOT EXISTS "crm_source" text;
