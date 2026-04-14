import { and, eq, gte, lte, lt, gt, ne, sql } from "drizzle-orm";
import {
  availabilityBlocks,
  bookableResources,
  bookings,
  courseTypes,
  guests,
  users,
} from "../../drizzle/schema";
import { parseLocalDateOnly } from "../lib/datetime";
import { getDb } from "../lib/db";
import { NotFoundError, ValidationError } from "../lib/errors";
import type {
  BookingWithDetailsDto,
  CreateBookingInput,
  UpdateBookingInput,
} from "../features/calendar/types";
import type {
  BookingPaymentStatus,
  BookingStatus,
} from "../features/calendar/types";
import { brand } from "../config/brand";

function toTeacherDto(u: typeof users.$inferSelect) {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    colorIndex: u.colorIndex,
  };
}

function toGuestDto(g: typeof guests.$inferSelect) {
  return {
    id: g.id,
    name: g.name,
    email: g.email,
    phone: g.phone,
    niveau: g.niveau,
    language: g.language,
    notes: g.notes,
    company: g.company ?? null,
    crmSource: g.crmSource ?? null,
    createdAt: g.createdAt.toISOString(),
  };
}

function toCourseDto(c: typeof courseTypes.$inferSelect) {
  return {
    id: c.id,
    name: c.name,
    durationMin: c.durationMin,
    priceCHF: c.priceCHF,
    maxParticipants: c.maxParticipants,
    isPublic: c.isPublic,
    isActive: c.isActive,
  };
}

function toBookingDto(
  b: typeof bookings.$inferSelect,
  guest: typeof guests.$inferSelect,
  teacher: typeof users.$inferSelect,
  courseType: typeof courseTypes.$inferSelect
): BookingWithDetailsDto {
  const dateStr =
    b.date instanceof Date
      ? `${b.date.getFullYear()}-${String(b.date.getMonth() + 1).padStart(2, "0")}-${String(b.date.getDate()).padStart(2, "0")}`
      : String(b.date).slice(0, 10);
  return {
    id: b.id,
    teacherId: b.teacherId,
    guestId: b.guestId,
    courseTypeId: b.courseTypeId,
    date: dateStr,
    startTime: b.startTime,
    endTime: b.endTime,
    status: b.status,
    source: b.source,
    notes: b.notes,
    priceCHF: b.priceCHF,
    resourceId: b.resourceId ?? null,
    paymentStatus: (b.paymentStatus ?? "none") as BookingPaymentStatus,
    paymentExternalRef: b.paymentExternalRef ?? null,
    createdAt: b.createdAt.toISOString(),
    guest: toGuestDto(guest),
    teacher: toTeacherDto(teacher),
    courseType: toCourseDto(courseType),
  };
}

async function loadBookingRow(id: string) {
  const row = await getDb().query.bookings.findFirst({
    where: eq(bookings.id, id),
    with: {
      guest: true,
      teacher: true,
      courseType: true,
    },
  });
  return row;
}

export async function findBookingById(id: string): Promise<BookingWithDetailsDto> {
  const row = await loadBookingRow(id);
  if (!row || !row.guest || !row.teacher || !row.courseType) {
    throw new NotFoundError(
      brand.labels.msgEntityNotFound.replace(
        "{entity}",
        brand.labels.appointmentSingular
      )
    );
  }
  return toBookingDto(row, row.guest, row.teacher, row.courseType);
}

export async function findByTeacher(
  teacherId: string,
  dateFrom: Date,
  dateTo: Date
): Promise<BookingWithDetailsDto[]> {
  const db = getDb();
  const rows = await db.query.bookings.findMany({
    where: and(
      eq(bookings.teacherId, teacherId),
      gte(bookings.date, dateFrom),
      lte(bookings.date, dateTo)
    ),
    with: {
      guest: true,
      teacher: true,
      courseType: true,
    },
    orderBy: (b, { asc }) => [asc(b.date), asc(b.startTime)],
  });
  return rows
    .filter((r) => r.guest && r.teacher && r.courseType)
    .map((r) =>
      toBookingDto(r, r.guest!, r.teacher!, r.courseType!)
    );
}

export async function findAllInRange(
  dateFrom: Date,
  dateTo: Date
): Promise<BookingWithDetailsDto[]> {
  const db = getDb();
  const rows = await db.query.bookings.findMany({
    where: and(gte(bookings.date, dateFrom), lte(bookings.date, dateTo)),
    with: {
      guest: true,
      teacher: true,
      courseType: true,
    },
    orderBy: (b, { asc }) => [asc(b.date), asc(b.startTime)],
  });
  return rows
    .filter((r) => r.guest && r.teacher && r.courseType)
    .map((r) =>
      toBookingDto(r, r.guest!, r.teacher!, r.courseType!)
    );
}

export type BookingServiceDb = ReturnType<typeof getDb>;
export type BookingServiceTx = Parameters<
  Parameters<BookingServiceDb["transaction"]>[0]
>[0];

export async function getActiveResourceIdForTeacher(
  db: BookingServiceDb | BookingServiceTx,
  teacherId: string
): Promise<string | null> {
  const [row] = await db
    .select({ id: bookableResources.id })
    .from(bookableResources)
    .where(
      and(
        eq(bookableResources.userId, teacherId),
        eq(bookableResources.isActive, true)
      )
    )
    .limit(1);
  return row?.id ?? null;
}

async function hasAvailabilityBlockOverlapUsingDb(
  db: BookingServiceDb | BookingServiceTx,
  teacherId: string,
  date: Date,
  startTime: string,
  endTime: string
): Promise<boolean> {
  const [hit] = await db
    .select({ c: sql<number>`count(*)::int` })
    .from(availabilityBlocks)
    .where(
      and(
        eq(availabilityBlocks.userId, teacherId),
        eq(availabilityBlocks.blockDate, date),
        lt(availabilityBlocks.startTime, endTime),
        gt(availabilityBlocks.endTime, startTime)
      )
    );
  return (hit?.c ?? 0) > 0;
}

/** Überlappung nur mit nicht stornierten Terminen (expliziter DB-/Tx-Client für Transaktionen). */
export async function hasTimeOverlapUsingDb(
  db: BookingServiceDb | BookingServiceTx,
  teacherId: string,
  date: Date,
  startTime: string,
  endTime: string,
  excludeBookingId?: string
): Promise<boolean> {
  const conditions = [
    eq(bookings.teacherId, teacherId),
    eq(bookings.date, date),
    ne(bookings.status, "storniert"),
    lt(bookings.startTime, endTime),
    gt(bookings.endTime, startTime),
  ];
  if (excludeBookingId) {
    conditions.push(ne(bookings.id, excludeBookingId));
  }
  const [hit] = await db
    .select({ c: sql<number>`count(*)::int` })
    .from(bookings)
    .where(and(...conditions));
  return (hit?.c ?? 0) > 0;
}

/** Überlappung nur mit nicht stornierten Terminen */
export async function hasTimeOverlap(
  teacherId: string,
  date: Date,
  startTime: string,
  endTime: string,
  excludeBookingId?: string
): Promise<boolean> {
  return hasTimeOverlapUsingDb(
    getDb(),
    teacherId,
    date,
    startTime,
    endTime,
    excludeBookingId
  );
}

export async function checkAvailabilityUsingDb(
  db: BookingServiceDb | BookingServiceTx,
  teacherId: string,
  date: Date,
  startTime: string,
  endTime: string,
  excludeBookingId?: string
): Promise<boolean> {
  const overlap = await hasTimeOverlapUsingDb(
    db,
    teacherId,
    date,
    startTime,
    endTime,
    excludeBookingId
  );
  if (overlap) return false;
  const blocked = await hasAvailabilityBlockOverlapUsingDb(
    db,
    teacherId,
    date,
    startTime,
    endTime
  );
  return !blocked;
}

export async function checkAvailability(
  teacherId: string,
  date: Date,
  startTime: string,
  endTime: string,
  excludeBookingId?: string
): Promise<boolean> {
  return checkAvailabilityUsingDb(
    getDb(),
    teacherId,
    date,
    startTime,
    endTime,
    excludeBookingId
  );
}

export async function createBooking(
  input: CreateBookingInput
): Promise<BookingWithDetailsDto> {
  const date = parseLocalDateOnly(input.date);
  const ok = await checkAvailability(
    input.teacherId,
    date,
    input.startTime,
    input.endTime
  );
  if (!ok) {
    throw new ValidationError(
      brand.labels.msgTimeSlotUnavailableForStaff.replace(
        "{staffPlural}",
        brand.labels.staffCollectivePlural
      )
    );
  }

  const db = getDb();
  const course = await db.query.courseTypes.findFirst({
    where: eq(courseTypes.id, input.courseTypeId),
  });
  if (!course || !course.isActive) {
    throw new ValidationError(
      brand.labels.msgInvalidServiceType.replace(
        "{serviceTypeSingular}",
        brand.labels.serviceTypeSingular
      )
    );
  }

  const price = input.priceCHF ?? course.priceCHF;
  const resourceId = await getActiveResourceIdForTeacher(db, input.teacherId);

  const [row] = await db
    .insert(bookings)
    .values({
      teacherId: input.teacherId,
      guestId: input.guestId,
      courseTypeId: input.courseTypeId,
      date,
      startTime: input.startTime,
      endTime: input.endTime,
      notes: input.notes ?? null,
      priceCHF: price,
      source: input.source ?? "intern",
      resourceId,
    })
    .returning();

  if (!row)
    throw new Error(
      brand.labels.msgBookingInsertFailed.replace(
        "{booking}",
        brand.labels.bookingSingular
      )
    );
  return findBookingById(row.id);
}

export async function updateBooking(
  id: string,
  input: UpdateBookingInput
): Promise<BookingWithDetailsDto> {
  const existing = await loadBookingRow(id);
  if (!existing)
    throw new NotFoundError(
      brand.labels.msgEntityNotFound.replace(
        "{entity}",
        brand.labels.appointmentSingular
      )
    );

  const nextTeacher = input.teacherId ?? existing.teacherId;
  const nextDate = input.date
    ? parseLocalDateOnly(input.date)
    : existing.date instanceof Date
      ? existing.date
      : parseLocalDateOnly(String(existing.date).slice(0, 10));
  const nextStart = input.startTime ?? existing.startTime;
  const nextEnd = input.endTime ?? existing.endTime;

  const ok = await checkAvailability(
    nextTeacher,
    nextDate,
    nextStart,
    nextEnd,
    id
  );
  if (!ok) {
    throw new ValidationError(
      brand.labels.msgTimeSlotUnavailableForStaff.replace(
        "{staffPlural}",
        brand.labels.staffCollectivePlural
      )
    );
  }

  const patch: Partial<typeof bookings.$inferInsert> = {};
  if (input.teacherId) {
    patch.teacherId = input.teacherId;
    patch.resourceId = await getActiveResourceIdForTeacher(
      getDb(),
      input.teacherId
    );
  }
  if (input.guestId) patch.guestId = input.guestId;
  if (input.courseTypeId) patch.courseTypeId = input.courseTypeId;
  if (input.date) patch.date = parseLocalDateOnly(input.date);
  if (input.startTime) patch.startTime = input.startTime;
  if (input.endTime) patch.endTime = input.endTime;
  if (input.notes !== undefined) patch.notes = input.notes;
  if (input.priceCHF) patch.priceCHF = input.priceCHF;
  if (input.status) patch.status = input.status;
  if (input.source) patch.source = input.source;
  if (input.paymentStatus !== undefined)
    patch.paymentStatus = input.paymentStatus;
  if (input.paymentExternalRef !== undefined)
    patch.paymentExternalRef = input.paymentExternalRef;

  if (Object.keys(patch).length === 0) {
    return findBookingById(id);
  }

  await getDb().update(bookings).set(patch).where(eq(bookings.id, id));
  return findBookingById(id);
}

export async function updateBookingStatus(
  id: string,
  status: BookingStatus
): Promise<BookingWithDetailsDto> {
  await getDb().update(bookings).set({ status }).where(eq(bookings.id, id));
  return findBookingById(id);
}

export async function deleteBooking(id: string): Promise<void> {
  const res = await getDb()
    .delete(bookings)
    .where(eq(bookings.id, id))
    .returning({ id: bookings.id });
  if (res.length === 0)
    throw new NotFoundError(
      brand.labels.msgEntityNotFound.replace(
        "{entity}",
        brand.labels.appointmentSingular
      )
    );
}
