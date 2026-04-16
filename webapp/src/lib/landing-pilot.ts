/**
 * Stitch „Atmospheric Ascent“ — begrenzter Pilot nur Startseite (`/`).
 *
 * - Produktion: aus bis `NEXT_PUBLIC_LANDING_PILOT=true` (oder `1`) gesetzt ist.
 * - Entwicklung: standardmäßig an, außer `NEXT_PUBLIC_LANDING_PILOT=false` (oder `0`).
 */
export function isLandingPilotEnabled(): boolean {
  const v = process.env.NEXT_PUBLIC_LANDING_PILOT?.trim().toLowerCase();
  if (v === "0" || v === "false" || v === "off") return false;
  if (v === "1" || v === "true" || v === "on") return true;
  return process.env.NODE_ENV === "development";
}
