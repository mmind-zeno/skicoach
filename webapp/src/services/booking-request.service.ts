import { desc, eq, sql } from "drizzle-orm";
import {
  bookingRequests,
  bookings,
  courseTypes,
  guests,
} from "../../drizzle/schema";
import { parseLocalDateOnly } from "../lib/datetime";
import { getDb } from "../lib/db";
import { NotFoundError, ValidationError } from "../lib/errors";
import {
  sendAdminNewRequest,
  sendBookingConfirmed,
  sendBookingRequestConfirmation,
} from "../lib/mail";
import { checkAvailability } from "./booking.service";
import { findOrCreateByEmail } from "./guest.service";
import { brand } from "../config/brand";

export async function createPublicRequest(input: {
  courseTypeId: string;
  date: string;
  startTime: string;
  guestName: string;
  guestEmail: string;
  guestPhone?: string | null;
  guestNiveau: "anfaenger" | "fortgeschritten" | "experte";
  message?: string | null;
}) {
  const db = getDb();
  const [row] = await db
    .insert(bookingRequests)
    .values({
      courseTypeId: input.courseTypeId,
      date: parseLocalDateOnly(input.date),
      startTime: normalizeTime(input.startTime),
      guestName: input.guestName.trim(),
      guestEmail: input.guestEmail.trim().toLowerCase(),
      guestPhone: input.guestPhone?.trim() || null,
      guestNiveau: input.guestNiveau,
      message: input.message?.trim() || null,
      status: "neu",
    })
    .returning();
  if (!row) {
    throw new Error(
      brand.labels.msgBookingRequestInsertFailed.replace(
        "{bookingRequest}",
        brand.labels.bookingRequestSingular
      )
    );
  }
  const course = await db.query.courseTypes.findFirst({
    where: eq(courseTypes.id, input.courseTypeId),
  });
  void sendBookingRequestConfirmation(
    row.guestEmail,
    row.guestName
  ).catch(() => {});
  void sendAdminNewRequest({
    guestName: row.guestName,
    guestEmail: row.guestEmail,
    courseName: course?.name ?? brand.labels.serviceSingular,
    date: input.date,
    startTime: input.startTime,
    requestId: row.id,
  }).catch(() => {});
  return row;
}

function normalizeTime(t: string): string {
  if (t.length === 5) return `${t}:00`;
  return t;
}

export async function findAllRequests(status?: string) {
  const db = getDb();
  return db.query.bookingRequests.findMany({
    where:
      status && ["neu", "bestaetigt", "abgelehnt"].includes(status)
        ? eq(
            bookingRequests.status,
            status as "neu" | "bestaetigt" | "abgelehnt"
          )
        : undefined,
    with: { courseType: true },
    orderBy: [desc(bookingRequests.createdAt)],
  });
}

export async function findRequestById(id: string) {
  const db = getDb();
  const r = await db.query.bookingRequests.findFirst({
    where: eq(bookingRequests.id, id),
    with: { courseType: true, booking: true },
  });
  if (!r) {
    throw new NotFoundError(
      brand.labels.msgEntityNotFound.replace(
        "{entity}",
        brand.labels.bookingRequestSingular
      )
    );
  }
  return r;
}

export async function confirmRequest(
  requestId: string,
  teacherId: string,
  handledByUserId?: string | null
) {
  const db = getDb();
  const req = await findRequestById(requestId);
  if (req.status !== "neu") {
    throw new ValidationError(
      brand.labels.msgBookingRequestNoLongerOpen.replace(
        "{bookingRequest}",
        brand.labels.bookingRequestSingular
      )
    );
  }
  const date = req.date instanceof Date ? req.date : parseLocalDateOnly(String(req.date).slice(0, 10));
  const ok = await checkAvailability(
    teacherId,
    date,
    req.startTime,
    endTimeFromStart(req.startTime, req.courseType?.durationMin ?? 60)
  );
  if (!ok) {
    throw new ValidationError(
      `${brand.labels.staffCollectivePlural} zu diesem Zeitpunkt nicht verfügbar`
    );
  }

  const guest = await findOrCreateByEmail(req.guestEmail, req.guestName);
  if (req.guestPhone && !guest.phone) {
    await db
      .update(guests)
      .set({ phone: req.guestPhone })
      .where(eq(guests.id, guest.id));
  }

  const price = req.courseType?.priceCHF ?? "0";
  const endTime = endTimeFromStart(req.startTime, req.courseType?.durationMin ?? 60);

  const [booking] = await db
    .insert(bookings)
    .values({
      teacherId,
      guestId: guest.id,
      courseTypeId: req.courseTypeId,
      date,
      startTime: req.startTime,
      endTime,
      status: "geplant",
      source: "anfrage",
      notes: req.message,
      priceCHF: price,
    })
    .returning();

  if (!booking) {
    throw new Error(
      brand.labels.msgBookingInsertFailed.replace(
        "{booking}",
        brand.labels.bookingSingular
      )
    );
  }

  await db
    .update(bookingRequests)
    .set({
      status: "bestaetigt",
      bookingId: booking.id,
      handledBy: handledByUserId ?? null,
      handledAt: new Date(),
    })
    .where(eq(bookingRequests.id, requestId));

  void sendBookingConfirmed(req.guestEmail, req.guestName, {
    date: String(req.date).slice(0, 10),
    startTime: req.startTime.slice(0, 5),
    courseName: req.courseType?.name ?? brand.labels.serviceSingular,
  }).catch(() => {});

  return booking;
}

function endTimeFromStart(startTime: string, durationMin: number): string {
  const [h, m, s] = startTime.split(":").map(Number);
  const start = new Date(2000, 0, 1, h, m, s || 0);
  start.setMinutes(start.getMinutes() + durationMin);
  const hh = String(start.getHours()).padStart(2, "0");
  const mm = String(start.getMinutes()).padStart(2, "0");
  const ss = String(start.getSeconds()).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
}

export async function rejectRequest(requestId: string, reason?: string | null) {
  const db = getDb();
  const req = await findRequestById(requestId);
  if (req.status !== "neu") {
    throw new ValidationError(
      brand.labels.msgBookingRequestNoLongerOpen.replace(
        "{bookingRequest}",
        brand.labels.bookingRequestSingular
      )
    );
  }
  await db
    .update(bookingRequests)
    .set({
      status: "abgelehnt",
      rejectReason: reason?.trim() || null,
    })
    .where(eq(bookingRequests.id, requestId));
  return findRequestById(requestId);
}

export async function countNewRequests(): Promise<number> {
  const db = getDb();
  const [r] = await db
    .select({ c: sql<number>`count(*)::int` })
    .from(bookingRequests)
    .where(eq(bookingRequests.status, "neu"));
  return Number(r?.c ?? 0);
}
