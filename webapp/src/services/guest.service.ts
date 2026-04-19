import { and, desc, eq, ilike, or, sql } from "drizzle-orm";
import { bookings, guestContacts, guests, users } from "../../drizzle/schema";
import { getDb } from "../lib/db";
import { NotFoundError, ValidationError } from "../lib/errors";
import type {
  CreateGuestInput,
  Guest,
  GuestBookingSummary,
  GuestContactEntry,
  GuestContactKind,
  GuestGender,
  GuestListItem,
  GuestPreferredContactChannel,
  GuestWithBookings,
  UpdateGuestInput,
} from "../features/guests/types";
import { brand } from "../config/brand";

function rowCreatedAtToIso(value: unknown): string {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString();
  }
  const d =
    typeof value === "string" || typeof value === "number"
      ? new Date(value)
      : new Date(NaN);
  if (!Number.isNaN(d.getTime())) return d.toISOString();
  return new Date().toISOString();
}

function dateOfBirthToIso(value: unknown): string | null {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}/.test(value)) {
    return value.slice(0, 10);
  }
  return null;
}

function parseGender(value: string | null): GuestGender | null {
  if (!value) return null;
  if (
    value === "weiblich" ||
    value === "maennlich" ||
    value === "divers" ||
    value === "unbekannt"
  ) {
    return value;
  }
  return null;
}

function parseChannel(
  value: string | null
): GuestPreferredContactChannel | null {
  if (!value) return null;
  if (
    value === "email" ||
    value === "phone" ||
    value === "sms" ||
    value === "whatsapp"
  ) {
    return value;
  }
  return null;
}

export function toGuest(row: typeof guests.$inferSelect): Guest {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    niveau: row.niveau,
    language: row.language,
    notes: row.notes,
    company: row.company ?? null,
    crmSource: row.crmSource ?? null,
    salutation: row.salutation ?? null,
    street: row.street ?? null,
    postalCode: row.postalCode ?? null,
    city: row.city ?? null,
    country: row.country ?? null,
    dateOfBirth: dateOfBirthToIso(row.dateOfBirth),
    gender: parseGender(row.gender),
    nationality: row.nationality ?? null,
    heightCm: row.heightCm ?? null,
    weightKg: row.weightKg ?? null,
    shoeSizeEu: row.shoeSizeEu ?? null,
    emergencyContactName: row.emergencyContactName ?? null,
    emergencyContactPhone: row.emergencyContactPhone ?? null,
    medicalNotes: row.medicalNotes ?? null,
    preferredContactChannel: parseChannel(row.preferredContactChannel),
    marketingOptIn: row.marketingOptIn ?? false,
    bookingReminderOptIn: row.bookingReminderOptIn ?? true,
    createdAt: rowCreatedAtToIso(row.createdAt),
  };
}

function mapContactRow(
  c: typeof guestContacts.$inferSelect,
  author: { name: string | null; email: string } | null | undefined
): GuestContactEntry {
  const kind = (["note", "call", "email", "meeting"] as const).includes(
    c.kind as GuestContactKind
  )
    ? (c.kind as GuestContactKind)
    : "note";
  return {
    id: c.id,
    kind,
    body: c.body,
    createdAt: c.createdAt.toISOString(),
    authorName: author?.name ?? author?.email ?? null,
  };
}

export async function listGuestsForSelect(
  search?: string,
  limit = 40
): Promise<Guest[]> {
  const rows = await findAll(search, undefined, limit);
  return rows.map((row) => {
    const { lastBookingDate, bookingCount, ...guest } = row;
    void lastBookingDate;
    void bookingCount;
    return guest;
  });
}

export async function findAll(
  search?: string,
  niveau?: string,
  limit = 200
): Promise<GuestListItem[]> {
  const db = getDb();
  const q = search?.trim();
  const niv = niveau?.trim();

  const searchClause = q
    ? or(
        ilike(guests.name, `%${q}%`),
        ilike(guests.email, `%${q}%`),
        ilike(guests.phone, `%${q}%`),
        ilike(guests.company, `%${q}%`),
        ilike(guests.city, `%${q}%`),
        ilike(guests.postalCode, `%${q}%`),
        ilike(guests.street, `%${q}%`),
        ilike(guests.nationality, `%${q}%`)
      )
    : undefined;

  const whereClause = and(
    searchClause,
    niv ? eq(guests.niveau, niv as (typeof guests.niveau.enumValues)[number]) : undefined
  );

  const rows = await db
    .select({
      guest: guests,
      lastBookingDate: sql<string | null>`(
        select max(${bookings.date}::text) from ${bookings}
        where ${bookings.guestId} = ${guests.id}
      )`,
      bookingCount: sql<number>`(
        select count(*)::int from ${bookings}
        where ${bookings.guestId} = ${guests.id}
      )`,
    })
    .from(guests)
    .where(whereClause)
    .orderBy(desc(guests.createdAt))
    .limit(limit);

  return rows.map((r) => ({
    ...toGuest(r.guest),
    lastBookingDate: r.lastBookingDate,
    bookingCount: r.bookingCount ?? 0,
  }));
}

export async function getGuestById(id: string): Promise<Guest> {
  const row = await getDb().query.guests.findFirst({
    where: eq(guests.id, id),
  });
  if (!row)
    throw new NotFoundError(
      brand.labels.msgEntityNotFound.replace(
        "{entity}",
        brand.labels.clientSingular
      )
    );
  return toGuest(row);
}

export async function findByIdWithBookings(id: string): Promise<GuestWithBookings> {
  const db = getDb();
  const row = await db.query.guests.findFirst({
    where: eq(guests.id, id),
    with: {
      bookings: {
        columns: {
          id: true,
          teacherId: true,
          guestId: true,
          courseTypeId: true,
          date: true,
          startTime: true,
          endTime: true,
          status: true,
          source: true,
          notes: true,
          priceCHF: true,
          createdAt: true,
        },
        with: {
          courseType: true,
          teacher: true,
        },
        orderBy: [desc(bookings.date), desc(bookings.startTime)],
      },
      invoices: true,
    },
  });
  if (!row)
    throw new NotFoundError(
      brand.labels.msgEntityNotFound.replace(
        "{entity}",
        brand.labels.clientSingular
      )
    );

  const contactRows = await db.query.guestContacts.findMany({
    where: eq(guestContacts.guestId, id),
    orderBy: [desc(guestContacts.createdAt)],
    limit: 80,
    with: { author: true },
  });

  const openInvoices = row.invoices.filter((i) => i.status === "offen").length;

  const bookingSummaries: GuestBookingSummary[] = row.bookings.map((b) => {
    const d =
      b.date instanceof Date
        ? `${b.date.getFullYear()}-${String(b.date.getMonth() + 1).padStart(2, "0")}-${String(b.date.getDate()).padStart(2, "0")}`
        : String(b.date).slice(0, 10);
    return {
      id: b.id,
      date: d,
      startTime: b.startTime,
      endTime: b.endTime,
      status: b.status,
      source: b.source,
      priceCHF: b.priceCHF,
      courseTypeName: b.courseType?.name ?? "—",
      teacherName: b.teacher?.name ?? b.teacher?.email ?? null,
    };
  });

  const contacts: GuestContactEntry[] = contactRows.map((c) =>
    mapContactRow(c, c.author)
  );

  return {
    ...toGuest(row),
    bookings: bookingSummaries,
    openInvoicesCount: openInvoices,
    contacts,
  };
}

function dateInputToDb(value: string | null | undefined): Date | null {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const d = new Date(`${value}T12:00:00.000Z`);
  return Number.isNaN(d.getTime()) ? null : d;
}

function buildInsertValues(
  input: CreateGuestInput
): typeof guests.$inferInsert {
  return {
    name: input.name.trim(),
    email: input.email?.trim() || null,
    phone: input.phone?.trim() || null,
    niveau: input.niveau ?? "anfaenger",
    language: input.language ?? brand.defaultGuestLanguage,
    notes: input.notes?.trim() || null,
    company: input.company?.trim() || null,
    crmSource: input.crmSource?.trim() || null,
    salutation: input.salutation?.trim() || null,
    street: input.street?.trim() || null,
    postalCode: input.postalCode?.trim() || null,
    city: input.city?.trim() || null,
    country: input.country?.trim() || null,
    dateOfBirth: dateInputToDb(input.dateOfBirth ?? null),
    gender: input.gender ?? null,
    nationality: input.nationality?.trim() || null,
    heightCm: input.heightCm ?? null,
    weightKg: input.weightKg ?? null,
    shoeSizeEu: input.shoeSizeEu?.trim() || null,
    emergencyContactName: input.emergencyContactName?.trim() || null,
    emergencyContactPhone: input.emergencyContactPhone?.trim() || null,
    medicalNotes: input.medicalNotes?.trim() || null,
    preferredContactChannel: input.preferredContactChannel ?? null,
    marketingOptIn: input.marketingOptIn ?? false,
    bookingReminderOptIn: input.bookingReminderOptIn ?? true,
  };
}

export async function createGuest(input: CreateGuestInput): Promise<Guest> {
  const db = getDb();
  const values = buildInsertValues(input);
  const [row] = await db.insert(guests).values(values).returning();
  if (!row) {
    throw new ValidationError(
      `${brand.labels.clientSingular} konnte nicht angelegt werden`
    );
  }
  return toGuest(row);
}

export async function createGuestQuick(input: {
  name: string;
  email?: string | null;
  phone?: string | null;
}): Promise<Guest> {
  return createGuest({
    name: input.name,
    email: input.email,
    phone: input.phone,
  });
}

export async function updateGuest(id: string, input: UpdateGuestInput): Promise<Guest> {
  await getGuestById(id);
  const patch: Partial<typeof guests.$inferInsert> = {};
  if (input.name !== undefined) patch.name = input.name.trim();
  if (input.email !== undefined) patch.email = input.email?.trim() || null;
  if (input.phone !== undefined) patch.phone = input.phone?.trim() || null;
  if (input.niveau !== undefined) patch.niveau = input.niveau;
  if (input.language !== undefined) patch.language = input.language;
  if (input.notes !== undefined) patch.notes = input.notes?.trim() || null;
  if (input.company !== undefined) patch.company = input.company?.trim() || null;
  if (input.crmSource !== undefined)
    patch.crmSource = input.crmSource?.trim() || null;
  if (input.salutation !== undefined)
    patch.salutation = input.salutation?.trim() || null;
  if (input.street !== undefined) patch.street = input.street?.trim() || null;
  if (input.postalCode !== undefined)
    patch.postalCode = input.postalCode?.trim() || null;
  if (input.city !== undefined) patch.city = input.city?.trim() || null;
  if (input.country !== undefined)
    patch.country = input.country?.trim() || null;
  if (input.dateOfBirth !== undefined)
    patch.dateOfBirth = dateInputToDb(input.dateOfBirth);
  if (input.gender !== undefined) patch.gender = input.gender;
  if (input.nationality !== undefined)
    patch.nationality = input.nationality?.trim() || null;
  if (input.heightCm !== undefined) patch.heightCm = input.heightCm;
  if (input.weightKg !== undefined) patch.weightKg = input.weightKg;
  if (input.shoeSizeEu !== undefined)
    patch.shoeSizeEu = input.shoeSizeEu?.trim() || null;
  if (input.emergencyContactName !== undefined)
    patch.emergencyContactName = input.emergencyContactName?.trim() || null;
  if (input.emergencyContactPhone !== undefined)
    patch.emergencyContactPhone = input.emergencyContactPhone?.trim() || null;
  if (input.medicalNotes !== undefined)
    patch.medicalNotes = input.medicalNotes?.trim() || null;
  if (input.preferredContactChannel !== undefined)
    patch.preferredContactChannel = input.preferredContactChannel;
  if (input.marketingOptIn !== undefined)
    patch.marketingOptIn = input.marketingOptIn;
  if (input.bookingReminderOptIn !== undefined)
    patch.bookingReminderOptIn = input.bookingReminderOptIn;

  if (Object.keys(patch).length === 0) return getGuestById(id);
  await getDb().update(guests).set(patch).where(eq(guests.id, id));
  return getGuestById(id);
}

export async function addGuestContact(
  guestId: string,
  authorUserId: string,
  kind: GuestContactKind,
  body: string
): Promise<GuestContactEntry> {
  await getGuestById(guestId);
  const db = getDb();
  const [row] = await db
    .insert(guestContacts)
    .values({
      guestId,
      authorUserId,
      kind,
      body: body.trim(),
    })
    .returning();
  if (!row) {
    throw new Error(brand.labels.apiGuestContactSaveFailed);
  }
  const author = await db.query.users.findFirst({
    where: eq(users.id, authorUserId),
    columns: { name: true, email: true },
  });
  return mapContactRow(row, author ?? undefined);
}

export async function deleteGuest(id: string): Promise<void> {
  const db = getDb();
  const hasBookings = await db.query.bookings.findFirst({
    where: eq(bookings.guestId, id),
    columns: { id: true },
  });
  if (hasBookings) {
    throw new ValidationError(
      brand.labels.msgGuestHasBookingsNoDelete
        .replace("{client}", brand.labels.clientSingular)
        .replace("{bookings}", brand.labels.bookingPlural)
    );
  }
  const res = await db.delete(guests).where(eq(guests.id, id)).returning({ id: guests.id });
  if (res.length === 0)
    throw new NotFoundError(
      brand.labels.msgEntityNotFound.replace(
        "{entity}",
        brand.labels.clientSingular
      )
    );
}

export async function findOrCreateByEmail(
  email: string,
  name: string
): Promise<Guest> {
  const normalized = email.trim().toLowerCase();
  const existing = await getDb().query.guests.findFirst({
    where: eq(guests.email, normalized),
  });
  if (existing) {
    return toGuest(existing);
  }
  return createGuest({
    name: name.trim(),
    email: normalized,
  });
}
