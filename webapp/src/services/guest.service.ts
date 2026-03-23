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
  GuestListItem,
  GuestWithBookings,
  UpdateGuestInput,
} from "../features/guests/types";
import { brand } from "../config/brand";

function toGuest(row: typeof guests.$inferSelect): Guest {
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
    createdAt: row.createdAt.toISOString(),
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
  return rows.map(
    (row): Guest => ({
      id: row.id,
      name: row.name,
      email: row.email,
      phone: row.phone,
      niveau: row.niveau,
      language: row.language,
      notes: row.notes,
      company: row.company,
      crmSource: row.crmSource,
      createdAt: row.createdAt,
    })
  );
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
        ilike(guests.company, `%${q}%`)
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

export async function createGuest(input: CreateGuestInput): Promise<Guest> {
  const db = getDb();
  const [row] = await db
    .insert(guests)
    .values({
      name: input.name.trim(),
      email: input.email?.trim() || null,
      phone: input.phone?.trim() || null,
      niveau: input.niveau ?? "anfaenger",
      language: input.language ?? "de",
      notes: input.notes?.trim() || null,
      company: input.company?.trim() || null,
      crmSource: input.crmSource?.trim() || null,
    })
    .returning();
  if (!row)
    throw new Error(
      `${brand.labels.clientSingular} konnte nicht angelegt werden`
    );
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
  if (input.crmSource !== undefined) patch.crmSource = input.crmSource?.trim() || null;
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
  if (existing) return toGuest(existing);
  return createGuest({
    name: name.trim(),
    email: normalized,
  });
}
