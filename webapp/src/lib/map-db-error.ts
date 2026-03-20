/** Lesbare Hinweise, wenn Postgres/Drizzle wegen Schema-Drift fehlschlägt. */
export function guestFacingDbMessage(e: unknown): string | null {
  const msg = e instanceof Error ? e.message : String(e);
  if (/column .* does not exist/i.test(msg)) {
    return "Datenbank-Schema ist nicht aktuell. Bitte auf dem Server Migrationen ausführen (npm run db:migrate im App-Container).";
  }
  if (/relation .* does not exist/i.test(msg)) {
    return "Datenbank-Schema ist nicht aktuell. Bitte Migrationen ausführen (z. B. 0001_rate_limit_audit für das Audit-Protokoll).";
  }
  return null;
}

export function genericApiErrorMessage(e: unknown): string {
  return guestFacingDbMessage(e) ?? "Ein technischer Fehler ist aufgetreten.";
}
