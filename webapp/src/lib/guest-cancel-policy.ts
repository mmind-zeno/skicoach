/** Mindest-Stunden vor Termin für Online-Storno (Gastportal). */
export function getGuestCancelMinHours(): number {
  const raw = process.env.GUEST_CANCEL_MIN_HOURS_BEFORE?.trim();
  const n = raw ? Number.parseInt(raw, 10) : 24;
  return Number.isFinite(n) && n >= 0 ? n : 24;
}
