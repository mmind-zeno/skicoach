/**
 * Wartungsmodus für öffentliches Buchungsportal (Middleware + Server Components).
 * Setzen: MAINTENANCE_MODE=1 | true | yes | on (case-insensitive).
 */
export function isMaintenanceMode(): boolean {
  const v = process.env.MAINTENANCE_MODE?.trim().toLowerCase();
  return v === "1" || v === "true" || v === "yes" || v === "on";
}
