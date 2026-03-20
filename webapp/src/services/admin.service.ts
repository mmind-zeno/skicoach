import { and, eq, gte, lte, sql } from "drizzle-orm";
import { bookings, guests, users } from "../../drizzle/schema";
import { getDb } from "../lib/db";

export async function getStats() {
  const db = getDb();
  const now = new Date();
  const startMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  const [bookRow] = await db
    .select({ c: sql<number>`count(*)::int` })
    .from(bookings)
    .where(
      and(gte(bookings.date, startMonth), lte(bookings.date, endMonth))
    );

  const bookingRows = await db.query.bookings.findMany({
    where: and(gte(bookings.date, startMonth), lte(bookings.date, endMonth)),
    columns: { priceCHF: true, status: true },
  });
  let revenue = 0;
  for (const b of bookingRows) {
    if (b.status !== "storniert") revenue += Number(b.priceCHF);
  }

  const [teachRow] = await db
    .select({ c: sql<number>`count(*)::int` })
    .from(users)
    .where(and(eq(users.role, "teacher"), eq(users.isActive, true)));

  const [guestRow] = await db
    .select({ c: sql<number>`count(*)::int` })
    .from(guests);

  return {
    bookingsThisMonth: Number(bookRow?.c ?? 0),
    revenueThisMonth: revenue,
    activeTeachers: Number(teachRow?.c ?? 0),
    totalGuests: Number(guestRow?.c ?? 0),
  };
}

export async function getRevenueByTeacher(year: number, month: number) {
  const db = getDb();
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59);
  const rows = await db.query.bookings.findMany({
    where: and(gte(bookings.date, start), lte(bookings.date, end)),
    with: { teacher: true },
    columns: { priceCHF: true, status: true, teacherId: true },
  });
  const map = new Map<
    string,
    { teacher: string; revenue: number; bookingCount: number }
  >();
  for (const b of rows) {
    if (b.status === "storniert") continue;
    const id = b.teacherId;
    const name = b.teacher?.name ?? b.teacher?.email ?? id;
    const cur = map.get(id) ?? { teacher: name, revenue: 0, bookingCount: 0 };
    cur.revenue += Number(b.priceCHF);
    cur.bookingCount += 1;
    map.set(id, cur);
  }
  return Array.from(map.values()).sort((a, b) => b.revenue - a.revenue);
}

export async function getBookingsByMonth(year: number) {
  const db = getDb();
  const start = new Date(year, 0, 1);
  const end = new Date(year, 11, 31, 23, 59, 59);
  const rows = await db.query.bookings.findMany({
    where: and(gte(bookings.date, start), lte(bookings.date, end)),
    columns: { date: true },
  });
  const counts = Array.from({ length: 12 }, (_, i) => ({ month: i + 1, count: 0 }));
  for (const b of rows) {
    const d = b.date instanceof Date ? b.date : new Date(String(b.date));
    if (d.getFullYear() === year) {
      counts[d.getMonth()].count += 1;
    }
  }
  return counts;
}
