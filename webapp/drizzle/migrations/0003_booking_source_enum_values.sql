-- Alte DBs: booking_source ohne 'anfrage' / 'online' → Confirm mit source anfrage schlägt fehl.
-- Idempotent per pg_enum; funktioniert ab PostgreSQL 11 (ADD VALUE in Transaktion/DO).
DO $body$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'public' AND t.typname = 'booking_source' AND e.enumlabel = 'anfrage'
  ) THEN
    ALTER TYPE "public"."booking_source" ADD VALUE 'anfrage';
  END IF;
  IF NOT EXISTS (
    SELECT 1
    FROM pg_enum e
    JOIN pg_type t ON e.enumtypid = t.oid
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'public' AND t.typname = 'booking_source' AND e.enumlabel = 'online'
  ) THEN
    ALTER TYPE "public"."booking_source" ADD VALUE 'online';
  END IF;
END;
$body$;
