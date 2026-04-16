import { and, eq, inArray, sql } from "drizzle-orm";
import { bookings, guests, invoices } from "../../drizzle/schema";
import { getDb } from "../lib/db";
import { normalizeGuestEmail } from "../lib/guest-portal-token";
import { bookingDateTimesToRange } from "../lib/datetime";
import { updateBooking } from "./booking.service";
import { brand } from "../config/brand";
import { getGuestCancelMinHours } from "../lib/guest-cancel-policy";
import { NotFoundError, ValidationError } from "../lib/errors";

export async function findGuestIdByEmail(email: string): Promise<string | null> {
  const norm = normalizeGuestEmail(email);
  if (!norm) return null;
  const db = getDb();
  const row = await db
    .select({ id: guests.id })
    .from(guests)
    .where(sql`lower(trim(${guests.email})) = ${norm}`)
    .limit(1);
  return row[0]?.id ?? null;
}

export type GuestPortalBookingRow = {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  courseName: string;
  teacherName: string;
  priceCHF: string;
  invoiceId: string | null;
  invoiceNumber: string | null;
};

export async function listGuestBookings(
  guestId: string
): Promise<GuestPortalBookingRow[]> {
  const db = getDb();
  const rows = await db.query.bookings.findMany({
    where: eq(bookings.guestId, guestId),
    with: { courseType: true, teacher: true },
    orderBy: (b, { desc, asc }) => [desc(b.date), asc(b.startTime)],
    limit: 200,
  });
  const bookingIds = rows.map((r) => r.id);
  const invRows =
    bookingIds.length === 0
      ? []
      : await db
          .select({
            bookingId: invoices.bookingId,
            id: invoices.id,
            invoiceNumber: invoices.invoiceNumber,
          })
          .from(invoices)
          .where(inArray(invoices.bookingId, bookingIds));
  const invByBooking = new Map(
    invRows.map((i) => [i.bookingId, i] as const)
  );
  return rows.map((r) => {
    const d =
      r.date instanceof Date
        ? `${r.date.getFullYear()}-${String(r.date.getMonth() + 1).padStart(2, "0")}-${String(r.date.getDate()).padStart(2, "0")}`
        : String(r.date).slice(0, 10);
    const inv = invByBooking.get(r.id);
    return {
      id: r.id,
      date: d,
      startTime: String(r.startTime).slice(0, 5),
      endTime: String(r.endTime).slice(0, 5),
      status: r.status,
      courseName: r.courseType?.name ?? "—",
      teacherName: r.teacher?.name ?? r.teacher?.email ?? "—",
      priceCHF: String(r.priceCHF),
      invoiceId: inv?.id ?? null,
      invoiceNumber: inv?.invoiceNumber ?? null,
    };
  });
}

export async function assertGuestOwnsBooking(
  guestId: string,
  bookingId: string
): Promise<void> {
  const db = getDb();
  const row = await db.query.bookings.findFirst({
    where: and(eq(bookings.id, bookingId), eq(bookings.guestId, guestId)),
    columns: { id: true },
  });
  if (!row) {
    throw new NotFoundError(
      brand.labels.msgEntityNotFound.replace(
        "{entity}",
        brand.labels.bookingSingular
      )
    );
  }
}

export async function guestCancelBooking(
  guestId: string,
  bookingId: string
): Promise<void> {
  await assertGuestOwnsBooking(guestId, bookingId);
  const db = getDb();
  const row = await db.query.bookings.findFirst({
    where: eq(bookings.id, bookingId),
  });
  if (!row || row.status === "storniert") {
    throw new ValidationError(brand.labels.guestPortalAlreadyCancelled);
  }
  const { start } = bookingDateTimesToRange(
    row.date,
    String(row.startTime),
    String(row.endTime)
  );
  const hoursLeft = (start.getTime() - Date.now()) / 3600000;
  if (hoursLeft < getGuestCancelMinHours()) {
    throw new ValidationError(
      brand.labels.guestPortalCancelTooLateTemplate.replace(
        "{hours}",
        String(getGuestCancelMinHours())
      )
    );
  }
  await updateBooking(bookingId, { status: "storniert" });
}

export async function assertGuestOwnsInvoice(
  guestId: string,
  invoiceId: string
): Promise<void> {
  const db = getDb();
  const row = await db.query.invoices.findFirst({
    where: and(eq(invoices.id, invoiceId), eq(invoices.guestId, guestId)),
    columns: { id: true },
  });
  if (!row) {
    throw new NotFoundError(
      brand.labels.msgEntityNotFound.replace(
        "{entity}",
        brand.labels.invoiceSingular
      )
    );
  }
}
