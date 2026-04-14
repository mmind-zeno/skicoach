-- Legacy-DBs ohne 0001: Audit-Log-Insert schlägt fehl (Relation fehlt).
-- Idempotent für bestehende Installationen.
CREATE TABLE IF NOT EXISTS "rate_limit_buckets" (
	"bucket_key" text PRIMARY KEY NOT NULL,
	"hit_count" integer NOT NULL,
	"window_expires_at" timestamptz NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "rate_limit_buckets_expires_idx" ON "rate_limit_buckets" ("window_expires_at");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"actor_user_id" uuid REFERENCES "users"("id") ON DELETE SET NULL,
	"action" text NOT NULL,
	"resource" text,
	"metadata" jsonb,
	"client_ip" text,
	"created_at" timestamptz DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "audit_logs_created_at_idx" ON "audit_logs" ("created_at");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "audit_logs_actor_idx" ON "audit_logs" ("actor_user_id");
