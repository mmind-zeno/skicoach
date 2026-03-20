import { parseISO } from "date-fns";

/** `YYYY-MM-DD` → lokales Datum (00:00) */
export function parseLocalDateOnly(isoDate: string): Date {
  const [y, m, d] = isoDate.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function formatLocalDateISO(d: Date): string {
  const y = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${mo}-${day}`;
}

/** Buchung aus DB: `date` + `time`-Strings → lokale `Date` für den Kalender */
export function bookingDateTimesToRange(
  dateVal: Date | string,
  startTime: string,
  endTime: string
): { start: Date; end: Date } {
  const d =
    typeof dateVal === "string"
      ? parseLocalDateOnly(dateVal.slice(0, 10))
      : new Date(
          dateVal.getFullYear(),
          dateVal.getMonth(),
          dateVal.getDate()
        );
  const [sh, sm, ss] = startTime.split(":").map(Number);
  const [eh, em, es] = endTime.split(":").map(Number);
  const start = new Date(
    d.getFullYear(),
    d.getMonth(),
    d.getDate(),
    sh,
    sm,
    ss || 0
  );
  const end = new Date(
    d.getFullYear(),
    d.getMonth(),
    d.getDate(),
    eh,
    em,
    es || 0
  );
  return { start, end };
}

export function parseFlexibleDate(input: string | Date): Date {
  if (input instanceof Date) return input;
  if (/^\d{4}-\d{2}-\d{2}$/.test(input)) {
    return parseLocalDateOnly(input);
  }
  return parseISO(input);
}
