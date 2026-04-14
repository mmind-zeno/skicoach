-- Vervollständigt fehlende PostgreSQL-Enum-Labels (alte/manuelle DBs).
-- Confirm setzt u.a. booking_request_status = 'bestaetigt' und booking_source = 'anfrage'.
DO $body$
DECLARE
  labels text[];
  lbl text;
BEGIN
  -- user_role
  labels := ARRAY['admin', 'teacher'];
  FOREACH lbl IN ARRAY labels LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_enum e
      JOIN pg_type t ON e.enumtypid = t.oid
      JOIN pg_namespace n ON n.oid = t.typnamespace
      WHERE n.nspname = 'public' AND t.typname = 'user_role' AND e.enumlabel = lbl
    ) THEN
      EXECUTE format('ALTER TYPE %I.%I ADD VALUE %L', 'public', 'user_role', lbl);
    END IF;
  END LOOP;

  -- guest_niveau
  labels := ARRAY['anfaenger', 'fortgeschritten', 'experte'];
  FOREACH lbl IN ARRAY labels LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_enum e
      JOIN pg_type t ON e.enumtypid = t.oid
      JOIN pg_namespace n ON n.oid = t.typnamespace
      WHERE n.nspname = 'public' AND t.typname = 'guest_niveau' AND e.enumlabel = lbl
    ) THEN
      EXECUTE format('ALTER TYPE %I.%I ADD VALUE %L', 'public', 'guest_niveau', lbl);
    END IF;
  END LOOP;

  -- booking_status
  labels := ARRAY['geplant', 'durchgefuehrt', 'storniert'];
  FOREACH lbl IN ARRAY labels LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_enum e
      JOIN pg_type t ON e.enumtypid = t.oid
      JOIN pg_namespace n ON n.oid = t.typnamespace
      WHERE n.nspname = 'public' AND t.typname = 'booking_status' AND e.enumlabel = lbl
    ) THEN
      EXECUTE format('ALTER TYPE %I.%I ADD VALUE %L', 'public', 'booking_status', lbl);
    END IF;
  END LOOP;

  -- booking_source
  labels := ARRAY['intern', 'anfrage', 'online'];
  FOREACH lbl IN ARRAY labels LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_enum e
      JOIN pg_type t ON e.enumtypid = t.oid
      JOIN pg_namespace n ON n.oid = t.typnamespace
      WHERE n.nspname = 'public' AND t.typname = 'booking_source' AND e.enumlabel = lbl
    ) THEN
      EXECUTE format('ALTER TYPE %I.%I ADD VALUE %L', 'public', 'booking_source', lbl);
    END IF;
  END LOOP;

  -- booking_request_status (häufig: 'bestaetigt' fehlt in Legacy-DBs)
  labels := ARRAY['neu', 'bestaetigt', 'abgelehnt'];
  FOREACH lbl IN ARRAY labels LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_enum e
      JOIN pg_type t ON e.enumtypid = t.oid
      JOIN pg_namespace n ON n.oid = t.typnamespace
      WHERE n.nspname = 'public' AND t.typname = 'booking_request_status' AND e.enumlabel = lbl
    ) THEN
      EXECUTE format('ALTER TYPE %I.%I ADD VALUE %L', 'public', 'booking_request_status', lbl);
    END IF;
  END LOOP;

  -- invoice_status
  labels := ARRAY['offen', 'bezahlt', 'storniert'];
  FOREACH lbl IN ARRAY labels LOOP
    IF NOT EXISTS (
      SELECT 1 FROM pg_enum e
      JOIN pg_type t ON e.enumtypid = t.oid
      JOIN pg_namespace n ON n.oid = t.typnamespace
      WHERE n.nspname = 'public' AND t.typname = 'invoice_status' AND e.enumlabel = lbl
    ) THEN
      EXECUTE format('ALTER TYPE %I.%I ADD VALUE %L', 'public', 'invoice_status', lbl);
    END IF;
  END LOOP;
END;
$body$;
