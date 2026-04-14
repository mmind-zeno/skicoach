import { and, eq, gte, lte } from "drizzle-orm";
import { bookings, staffTimeLogs, users } from "../../drizzle/schema";
import { coerceSqlTimeForBooking, parseLocalDateOnly } from "../lib/datetime";
import { getDb } from "../lib/db";
import type {
  MonthlyHoursBookingLine,
  MonthlyHoursReportDto,
  MonthlyHoursTimeLogLine,
  StaffTimeLogCategory,
} from "./monthly-hours-report.shared";

export type {
  MonthlyHoursBookingLine,
  MonthlyHoursReportDto,
  MonthlyHoursTimeLogLine,
  StaffTimeLogCategory,
} from "./monthly-hours-report.shared";

export { formatMinutesAsDecimalHours } from "./monthly-hours-report.shared";

function timeToMinutes(t: string): number {
  const c = coerceSqlTimeForBooking(t);
  const [h, m, s] = c.split(":").map(Number);
  return h * 60 + m + (s || 0) / 60;
}

function bookingDurationMinutes(startTime: string, endTime: string): number {
  return Math.max(0, Math.round(timeToMinutes(endTime) - timeToMinutes(startTime)));
}

function ymd(d: Date): string {
  const y = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${mo}-${day}`;
}

export async function buildMonthlyHoursReport(
  userId: string,
  monthYyyyMm: string
): Promise<MonthlyHoursReportDto | null> {
  if (!/^\d{4}-\d{2}$/.test(monthYyyyMm)) return null;
  const [y, mo] = monthYyyyMm.split("-").map(Number);
  const start = parseLocalDateOnly(
    `${y}-${String(mo).padStart(2, "0")}-01`
  );
  const lastDay = new Date(y, mo, 0).getDate();
  const end = parseLocalDateOnly(
    `${y}-${String(mo).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`
  );

  const db = getDb();
  const teacher = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });
  if (!teacher) return null;

  const bookingRows = await db.query.bookings.findMany({
    where: and(
      eq(bookings.teacherId, userId),
      gte(bookings.date, start),
      lte(bookings.date, end)
    ),
    with: { courseType: true, guest: true },
    orderBy: (b, { asc }) => [asc(b.date), asc(b.startTime)],
  });

  let productiveMinutes = 0;
  let cancelledBookingCount = 0;
  const bookingLines: MonthlyHoursBookingLine[] = [];

  for (const b of bookingRows) {
    const st = String(b.startTime);
    const et = String(b.endTime);
    const mins = bookingDurationMinutes(st, et);
    const dateStr =
      b.date instanceof Date ? ymd(b.date) : String(b.date).slice(0, 10);
    if (b.status === "storniert") {
      cancelledBookingCount += 1;
      continue;
    }
    productiveMinutes += mins;
    const guest = b.guest;
    const course = b.courseType;
    bookingLines.push({
      bookingId: b.id,
      date: dateStr,
      startTime: coerceSqlTimeForBooking(st).slice(0, 5),
      endTime: coerceSqlTimeForBooking(et).slice(0, 5),
      minutes: mins,
      guestName: guest?.name ?? "—",
      courseName: course?.name ?? "—",
      status: b.status,
    });
  }

  const logRows = await db
    .select()
    .from(staffTimeLogs)
    .where(
      and(
        eq(staffTimeLogs.userId, userId),
        gte(staffTimeLogs.workDate, start),
        lte(staffTimeLogs.workDate, end)
      )
    );

  const emptyCats: Record<StaffTimeLogCategory, number> = {
    buero_verwaltung: 0,
    vorbereitung: 0,
    meeting: 0,
    fortbildung: 0,
    sonstiges: 0,
  };

  const internalByCategory = { ...emptyCats };
  const timeLogs: MonthlyHoursTimeLogLine[] = [];

  for (const row of logRows) {
    const h = Number.parseFloat(String(row.hours));
    const mins = Math.round(h * 60);
    const cat = row.category as StaffTimeLogCategory;
    internalByCategory[cat] += mins;
    const wd =
      row.workDate instanceof Date
        ? ymd(row.workDate)
        : String(row.workDate).slice(0, 10);
    timeLogs.push({
      id: row.id,
      workDate: wd,
      hours: String(row.hours),
      category: cat,
      note: row.note ?? null,
    });
  }

  const internalMinutesTotal = Object.values(internalByCategory).reduce(
    (a, b) => a + b,
    0
  );

  return {
    month: monthYyyyMm,
    teacher: {
      id: teacher.id,
      name: teacher.name,
      email: teacher.email,
    },
    productiveMinutes,
    internalByCategory,
    internalMinutesTotal,
    totalWorkedMinutes: productiveMinutes + internalMinutesTotal,
    bookingLines,
    timeLogs,
    cancelledBookingCount,
  };
}
