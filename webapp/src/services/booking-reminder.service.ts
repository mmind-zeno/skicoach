import { and, eq, gte, lte } from "drizzle-orm";
import { bookingReminderLog, bookings } from "../../drizzle/schema";
import { parseLocalDateOnly } from "../lib/datetime";
import { getDb } from "../lib/db";
import { sendBookingReminderNotification } from "../lib/mail";

function reminderHours(): number {
  const n = Number.parseFloat(process.env.REMINDER_HOURS_BEFORE?.trim() ?? "24");
  return Number.isFinite(n) && n > 0 ? n : 24;
}

function windowHours(): number {
  const n = Number.parseFloat(process.env.REMINDER_WINDOW_HOURS?.trim() ?? "0.75");
  return Number.isFinite(n) && n > 0 ? n : 0.75;
}

/**
 * Server-Intervall: Termine ca. REMINDER_HOURS_BEFORE vor Start (Fenster für Poll-Takt).
 */
export async function runDueBookingReminders(): Promise<{
  scanned: number;
  sent: number;
}> {
  if (
    process.env.REMINDER_EMAIL_ENABLED === "false" ||
    process.env.REMINDER_EMAIL_ENABLED === "0"
  ) {
    return { scanned: 0, sent: 0 };
  }

  const H = reminderHours();
  const win = windowHours();
  const db = getDb();
  const now = new Date();

  const today = parseLocalDateOnly(
    `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`
  );
  const until = new Date(today);
  until.setDate(until.getDate() + 3);

  const rows = await db.query.bookings.findMany({
    where: and(
      eq(bookings.status, "geplant"),
      gte(bookings.date, today),
      lte(bookings.date, until)
    ),
    with: { guest: true, teacher: true, courseType: true },
    limit: 800,
  });

  let sent = 0;
  for (const r of rows) {
    if (!r.guest?.email?.trim()) continue;
    if (r.guest.bookingReminderOptIn === false) continue;
    const day =
      r.date instanceof Date
        ? r.date
        : parseLocalDateOnly(String(r.date).slice(0, 10));
    const t = String(r.startTime);
    const [hh, mm] = t.split(":").map((x) => Number.parseInt(x, 10));
    const startLocal = new Date(day);
    startLocal.setHours(hh || 0, mm || 0, 0, 0);
    const hoursUntil = (startLocal.getTime() - now.getTime()) / 3600000;
    if (hoursUntil <= 0 || hoursUntil > H || hoursUntil < H - win) continue;

    const exists = await db.query.bookingReminderLog.findFirst({
      where: and(
        eq(bookingReminderLog.bookingId, r.id),
        eq(bookingReminderLog.channel, "email")
      ),
    });
    if (exists) continue;

    const dateStr =
      r.date instanceof Date
        ? `${r.date.getFullYear()}-${String(r.date.getMonth() + 1).padStart(2, "0")}-${String(r.date.getDate()).padStart(2, "0")}`
        : String(r.date).slice(0, 10);

    try {
      await sendBookingReminderNotification({
        to: r.guest.email.trim(),
        guestName: r.guest.name,
        courseName: r.courseType?.name ?? "—",
        date: dateStr,
        startTime: t.slice(0, 5),
        teacherName: r.teacher?.name ?? r.teacher?.email ?? "",
        guestPhone: r.guest.phone?.trim() ?? null,
      });
      await db.insert(bookingReminderLog).values({
        bookingId: r.id,
        channel: "email",
      });
      sent += 1;
    } catch {
      // ohne Log bei Fehler — nächster Lauf erneut
    }
  }

  return { scanned: rows.length, sent };
}
