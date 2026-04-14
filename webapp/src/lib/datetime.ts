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

/**
 * Kalendertag für DB-Abfragen (`bookings.date`, Verfügbarkeit).
 * Postgres `date` wird von node-pg oft als `Date` an **UTC-Mitternacht**
 * des Kalendertags geliefert — `getUTC*` liefert den richtigen Tag unabhängig
 * von der lokalen Zeitzone.
 */
export function calendarDateFromStored(value: Date | string): Date {
  if (typeof value === "string") {
    return parseLocalDateOnly(value.slice(0, 10));
  }
  return new Date(
    value.getUTCFullYear(),
    value.getUTCMonth(),
    value.getUTCDate()
  );
}

/** `HH:mm` → `HH:mm:ss` für konsistente Zeit-Vergleiche in SQL */
export function ensureTimeWithSeconds(t: string): string {
  const s = t.trim();
  if (s.length === 5 && s[2] === ":") return `${s}:00`;
  return s;
}

/**
 * DB-/API-Rückgabe für `time` kann String, Date oder Treiber-Artefakt sein.
 */
export function coerceSqlTimeForBooking(value: unknown): string {
  if (value == null) return "00:00:00";
  if (typeof value === "string") {
    const s = value.trim();
    if (!s) return "00:00:00";
    return ensureTimeWithSeconds(s);
  }
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    const hh = String(value.getHours()).padStart(2, "0");
    const mm = String(value.getMinutes()).padStart(2, "0");
    const ss = String(value.getSeconds()).padStart(2, "0");
    return `${hh}:${mm}:${ss}`;
  }
  const str = String(value);
  const m = str.match(/\b(\d{1,2}:\d{2}(?::\d{2})?)\b/);
  if (m) return ensureTimeWithSeconds(m[1]);
  return ensureTimeWithSeconds(str);
}
