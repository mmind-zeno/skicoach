import { brand } from "@/config/brand";

/** Lesbare Hinweise, wenn Postgres/Drizzle wegen Schema-Drift fehlschlägt. */
export function guestFacingDbMessage(e: unknown): string | null {
  const msg = e instanceof Error ? e.message : String(e);
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
  return (
    guestFacingDbMessage(e) ?? brand.labels.apiTechnicalErrorGeneric
  );
}
