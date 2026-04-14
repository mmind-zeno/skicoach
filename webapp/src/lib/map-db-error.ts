import { brand } from "@/config/brand";

/** Alle bekannten Fehlertexte aus der Kette (Error.message + cause), für Regex/Mapping. */
export function collectErrorChainText(e: unknown, maxDepth = 12): string {
  const parts: string[] = [];
  const seen = new Set<unknown>();
  let cur: unknown = e;
  let depth = 0;
  while (cur != null && depth < maxDepth && !seen.has(cur)) {
    seen.add(cur);
    if (cur instanceof Error) {
      if (cur.message) parts.push(cur.message);
      cur = cur.cause;
    } else if (typeof cur === "object" && cur !== null && "message" in cur) {
      const m = (cur as { message?: unknown }).message;
      if (m != null && String(m)) parts.push(String(m));
      cur =
        "cause" in cur ? (cur as { cause?: unknown }).cause : undefined;
    } else {
      break;
    }
    depth++;
  }
  return parts.join(" | ");
}

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
  if (getPostgresErrorCode(e) === "23503") return true;
  return /violates foreign key constraint/i.test(collectErrorChainText(e));
}

export function isPostgresUniqueViolation(e: unknown): boolean {
  if (getPostgresErrorCode(e) === "23505") return true;
  return /duplicate key value/i.test(collectErrorChainText(e));
}

/** Lesbare Hinweise, wenn Postgres/Drizzle wegen Schema-Drift fehlschlägt. */
export function guestFacingDbMessage(e: unknown): string | null {
  const text = collectErrorChainText(e);
  const pg = getPostgresErrorCode(e);
  if (pg === "23503" || /violates foreign key constraint/i.test(text)) {
    return brand.labels.apiConfirmBookingFkViolation;
  }
  if (pg === "23505" || /duplicate key value/i.test(text)) {
    return brand.labels.msgBookingRequestNoLongerOpen.replace(
      "{bookingRequest}",
      brand.labels.bookingRequestSingular
    );
  }
  if (pg === "22P02" || /invalid input syntax for type uuid/i.test(text)) {
    return brand.labels.apiInvalidData;
  }
  if (/invalid input value for enum/i.test(text)) {
    return brand.labels.apiDbSchemaColumnDrift;
  }
  if (/column .* does not exist/i.test(text)) {
    return brand.labels.apiDbSchemaColumnDrift;
  }
  if (/relation .* does not exist/i.test(text)) {
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
