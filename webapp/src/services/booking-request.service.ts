import { and, desc, eq, or, sql } from "drizzle-orm";
import {
  bookingRequests,
  bookings,
  courseTypes,
  guests,
  users,
} from "../../drizzle/schema";
import {
  calendarDateFromStored,
  coerceSqlTimeForBooking,
  parseLocalDateOnly,
} from "../lib/datetime";
import { getDb } from "../lib/db";
import {
  NotFoundError,
  unwrapValidationError,
  ValidationError,
} from "../lib/errors";
import {
  isPostgresFkViolation,
  isPostgresUniqueViolation,
} from "../lib/map-db-error";
import {
  sendAdminNewRequest,
  sendBookingConfirmed,
  sendBookingRequestConfirmation,
} from "../lib/mail";
import {
  checkAvailability,
  checkAvailabilityUsingDb,
  getActiveResourceIdForTeacher,
} from "./booking.service";
import { dispatchOutboundWebhooks } from "../lib/outbound-webhooks";
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
  void dispatchOutboundWebhooks("booking.request.created", {
    requestId: row.id,
    courseTypeId: row.courseTypeId,
    date: input.date,
    startTime: input.startTime,
    guestEmail: row.guestEmail,
  });
  return row;
}

function normalizeTime(t: string): string {
  if (t.length === 5) return `${t}:00`;
  return t;
}

/** Dezimal für `price_chf` — vermeidet ungültige Strings aus der DB. */
function normalizePriceChfString(raw: unknown): string {
  if (raw == null) return "0.00";
  const s = String(raw).trim().replace(",", ".");
  const n = Number(s);
  if (!Number.isFinite(n) || n < 0) return "0.00";
  return n.toFixed(2);
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

  const assignable = await db.query.users.findFirst({
    where: and(
      eq(users.id, teacherId),
      eq(users.isActive, true),
      or(eq(users.role, "teacher"), eq(users.role, "admin"))
    ),
    columns: { id: true },
  });
  if (!assignable) {
    throw new ValidationError(brand.labels.apiConfirmTeacherNotAssignable);
  }

  const courseRow = await db.query.courseTypes.findFirst({
    where: eq(courseTypes.id, req.courseTypeId),
  });
  if (!courseRow || !courseRow.isActive) {
    throw new ValidationError(
      brand.labels.msgInvalidServiceType.replace(
        "{serviceTypeSingular}",
        brand.labels.serviceTypeSingular
      )
    );
  }

  const durationMin = courseRow.durationMin;
  if (!Number.isFinite(durationMin) || durationMin < 1) {
    throw new ValidationError(brand.labels.msgCourseDurationInvalid);
  }

  const date = calendarDateFromStored(req.date);
  const startT = coerceSqlTimeForBooking(req.startTime);
  const endT = endTimeFromStart(startT, durationMin);
  const ok = await checkAvailability(teacherId, date, startT, endT);
  if (!ok) {
    throw new ValidationError(
      brand.labels.msgStaffUnavailableAtSlot.replace(
        "{staffPlural}",
        brand.labels.staffPlural
      )
    );
  }

  const guest = await findOrCreateByEmail(req.guestEmail, req.guestName);
  if (req.guestPhone && !guest.phone) {
    await db
      .update(guests)
      .set({ phone: req.guestPhone })
      .where(eq(guests.id, guest.id));
  }

  const price = normalizePriceChfString(courseRow.priceCHF);
  const endTime = endT;

  const startTimeForMail = startT;

  try {
    const booking = await db.transaction(async (tx) => {
      const [locked] = await tx
        .select({
          id: bookingRequests.id,
          status: bookingRequests.status,
        })
        .from(bookingRequests)
        .where(eq(bookingRequests.id, requestId))
        .for("update");

      if (!locked) {
        throw new NotFoundError(
          brand.labels.msgEntityNotFound.replace(
            "{entity}",
            brand.labels.bookingRequestSingular
          )
        );
      }
      if (locked.status !== "neu") {
        throw new ValidationError(
          brand.labels.msgBookingRequestNoLongerOpen.replace(
            "{bookingRequest}",
            brand.labels.bookingRequestSingular
          )
        );
      }

      const stillFree = await checkAvailabilityUsingDb(
        tx,
        teacherId,
        date,
        startT,
        endT
      );
      if (!stillFree) {
        throw new ValidationError(
          brand.labels.msgStaffUnavailableAtSlot.replace(
            "{staffPlural}",
            brand.labels.staffPlural
          )
        );
      }

      const resourceId = await getActiveResourceIdForTeacher(tx, teacherId);

      const [b] = await tx
        .insert(bookings)
        .values({
          teacherId,
          guestId: guest.id,
          courseTypeId: req.courseTypeId,
          date,
          startTime: startT,
          endTime,
          status: "geplant",
          source: "anfrage",
          notes: req.message ?? null,
          priceCHF: price,
          resourceId,
        })
        .returning();

      if (!b) {
        throw new Error(
          brand.labels.msgBookingInsertFailed.replace(
            "{booking}",
            brand.labels.bookingSingular
          )
        );
      }

      const [upd] = await tx
        .update(bookingRequests)
        .set({
          status: "bestaetigt",
          bookingId: b.id,
          handledBy: handledByUserId ?? null,
          handledAt: new Date(),
        })
        .where(
          and(
            eq(bookingRequests.id, requestId),
            eq(bookingRequests.status, "neu")
          )
        )
        .returning({ id: bookingRequests.id });

      if (!upd) {
        throw new ValidationError(
          brand.labels.msgBookingRequestNoLongerOpen.replace(
            "{bookingRequest}",
            brand.labels.bookingRequestSingular
          )
        );
      }

      return b;
    });

    void sendBookingConfirmed(req.guestEmail, req.guestName, {
      date: String(req.date).slice(0, 10),
      startTime: startTimeForMail.slice(0, 5),
      courseName: courseRow.name ?? brand.labels.serviceSingular,
    }).catch(() => {});

    void dispatchOutboundWebhooks("booking.confirmed", {
      bookingId: booking.id,
      requestId: req.id,
      guestEmail: req.guestEmail,
      teacherId,
      courseTypeId: req.courseTypeId,
      date: String(req.date).slice(0, 10),
      startTime: startTimeForMail.slice(0, 5),
    });

    return booking;
  } catch (e) {
    const unwrapped = unwrapValidationError(e);
    if (unwrapped) throw unwrapped;
    if (e instanceof ValidationError) throw e;
    if (isPostgresFkViolation(e)) {
      throw new ValidationError(brand.labels.apiConfirmBookingFkViolation);
    }
    if (isPostgresUniqueViolation(e)) {
      throw new ValidationError(
        brand.labels.msgBookingRequestNoLongerOpen.replace(
          "{bookingRequest}",
          brand.labels.bookingRequestSingular
        )
      );
    }
    throw e;
  }
}

function endTimeFromStart(startTime: string, durationMin: number): string {
  const [h, m, s] = startTime.split(":").map(Number);
  if (
    ![h, m, s || 0].every((n) => Number.isFinite(n)) ||
    !Number.isFinite(durationMin)
  ) {
    throw new ValidationError(brand.labels.bookingModalInvalidSlot);
  }
  const start = new Date(2000, 0, 1, h, m, s || 0);
  if (Number.isNaN(start.getTime())) {
    throw new ValidationError(brand.labels.bookingModalInvalidSlot);
  }
  start.setMinutes(start.getMinutes() + durationMin);
  const hh = String(start.getHours()).padStart(2, "0");
  const mm = String(start.getMinutes()).padStart(2, "0");
  const ss = String(start.getSeconds()).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
}

export async function rejectRequest(requestId: string, reason?: string | null) {
  const db = getDb();
  await db.transaction(async (tx) => {
    const [locked] = await tx
      .select({
        id: bookingRequests.id,
        status: bookingRequests.status,
      })
      .from(bookingRequests)
      .where(eq(bookingRequests.id, requestId))
      .for("update");

    if (!locked) {
      throw new NotFoundError(
        brand.labels.msgEntityNotFound.replace(
          "{entity}",
          brand.labels.bookingRequestSingular
        )
      );
    }
    if (locked.status !== "neu") {
      throw new ValidationError(
        brand.labels.msgBookingRequestNoLongerOpen.replace(
          "{bookingRequest}",
          brand.labels.bookingRequestSingular
        )
      );
    }

    const [upd] = await tx
      .update(bookingRequests)
      .set({
        status: "abgelehnt",
        rejectReason: reason?.trim() || null,
      })
      .where(
        and(
          eq(bookingRequests.id, requestId),
          eq(bookingRequests.status, "neu")
        )
      )
      .returning({ id: bookingRequests.id });

    if (!upd) {
      throw new ValidationError(
        brand.labels.msgBookingRequestNoLongerOpen.replace(
          "{bookingRequest}",
          brand.labels.bookingRequestSingular
        )
      );
    }
  });
  const result = await findRequestById(requestId);
  void dispatchOutboundWebhooks("booking.request.rejected", {
    requestId,
    guestEmail: result.guestEmail,
    courseTypeId: result.courseTypeId,
  });
  return result;
}

export async function countNewRequests(): Promise<number> {
  const db = getDb();
  const [r] = await db
    .select({ c: sql<number>`count(*)::int` })
    .from(bookingRequests)
    .where(eq(bookingRequests.status, "neu"));
  return Number(r?.c ?? 0);
}
