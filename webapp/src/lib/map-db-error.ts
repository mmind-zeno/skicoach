import { brand } from "@/config/brand";

/** Postgres-Fehlercode aus Drizzle/pg (inkl. verschachteltes `cause`). */
export function getPostgresErrorCode(e: unknown): string | undefined {
  const walk = (x: unknown): string | undefined => {
    if (typeof x === "object" && x !== null && "code" in x) {
      const c = (x as { code?: unknown }).code;
      if (typeof c === "string" && c.length > 0) return c;
    }
    if (typeof x === "object" && x !== null && "cause" in x) {
      return walk((x as { cause?: unknown }).cause);
    }
    return undefined;
  };
  return walk(e);
}

export function isPostgresFkViolation(e: unknown): boolean {
  return getPostgresErrorCode(e) === "23503";
}

/** Lesbare Hinweise, wenn Postgres/Drizzle wegen Schema-Drift fehlschlägt. */
export function guestFacingDbMessage(e: unknown): string | null {
  const msg = e instanceof Error ? e.message : String(e);
  const pg = getPostgresErrorCode(e);
  if (pg === "23503") {
    return brand.labels.apiConfirmBookingFkViolation;
  }
  if (pg === "22P02") {
    return brand.labels.apiInvalidData;
  }
  if (/invalid input value for enum/i.test(msg)) {
    return brand.labels.apiDbSchemaColumnDrift;
  }
  if (/column .* does not exist/i.test(msg)) {
    return brand.labels.apiDbSchemaColumnDrift;
  }
  if (/relation .* does not exist/i.test(msg)) {
    return brand.labels.apiDbSchemaRelationDriftTemplate.replace(
      "{navAuditLog}",
      brand.labels.navAuditLog
    );
  }
  return null;
}

export function genericApiErrorMessage(e: unknown): string {
  const drift = guestFacingDbMessage(e);
  if (drift) return drift;
  return brand.labels.apiTechnicalErrorGeneric;
}
