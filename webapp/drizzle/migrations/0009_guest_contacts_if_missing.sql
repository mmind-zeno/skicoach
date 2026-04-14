-- Nach Legacy-Baseline (Hashes ohne SQL) kann guest_contacts fehlen, obwohl 0002 als angewendet gilt.
CREATE TABLE IF NOT EXISTS "guest_contacts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"guest_id" uuid NOT NULL,
	"author_user_id" uuid,
	"kind" text DEFAULT 'note' NOT NULL,
	"body" text NOT NULL,
	"created_at" timestamptz DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "guest_contacts" ADD CONSTRAINT "guest_contacts_guest_id_guests_id_fk" FOREIGN KEY ("guest_id") REFERENCES "public"."guests"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "guest_contacts" ADD CONSTRAINT "guest_contacts_author_user_id_users_id_fk" FOREIGN KEY ("author_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "guest_contacts_guest_created_idx" ON "guest_contacts" ("guest_id","created_at");
