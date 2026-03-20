import { and, desc, eq, gte, lte, sql } from "drizzle-orm";
import { bookings, invoices } from "../../drizzle/schema";
import { getDb } from "../lib/db";
import { NotFoundError, ValidationError } from "../lib/errors";
import type { Invoice, InvoiceWithDetails } from "../features/invoices/types";

function parseInvoiceNumber(num: string): { year: number; seq: number } | null {
  const m = /^(\d{4})-(\d+)$/.exec(num);
  if (!m) return null;
  return { year: Number(m[1]), seq: Number(m[2]) };
}

export async function generateNextNumber(year: number): Promise<string> {
  const db = getDb();
  const prefix = `${year}-`;
  const rows = await db
    .select({ invoiceNumber: invoices.invoiceNumber })
    .from(invoices)
    .where(sql`${invoices.invoiceNumber} like ${prefix + "%"}`)
    .orderBy(desc(invoices.invoiceNumber))
    .limit(1);
  let next = 1;
  if (rows[0]?.invoiceNumber) {
    const p = parseInvoiceNumber(rows[0].invoiceNumber);
    if (p && p.year === year) next = p.seq + 1;
  }
  return `${year}-${String(next).padStart(4, "0")}`;
}

export async function findAll(filters?: {
  status?: string;
  guestId?: string;
  teacherId?: string;
}): Promise<InvoiceWithDetails[]> {
  const db = getDb();
  const rows = await db.query.invoices.findMany({
    where: and(
      filters?.status &&
        ["offen", "bezahlt", "storniert"].includes(filters.status)
        ? eq(
            invoices.status,
            filters.status as "offen" | "bezahlt" | "storniert"
          )
        : undefined,
      filters?.guestId ? eq(invoices.guestId, filters.guestId) : undefined
    ),
    with: {
      booking: {
        with: {
          guest: true,
          courseType: true,
          teacher: true,
        },
      },
      guest: true,
    },
    orderBy: [desc(invoices.issuedAt)],
  });

  let list = rows.filter((r) => r.booking && r.guest);
  if (filters?.teacherId) {
    list = list.filter((r) => r.booking!.teacherId === filters.teacherId);
  }

  return list.map((r) => {
    const b = r.booking!;
    const g = r.guest!;
    const d =
      b.date instanceof Date
        ? `${b.date.getFullYear()}-${String(b.date.getMonth() + 1).padStart(2, "0")}-${String(b.date.getDate()).padStart(2, "0")}`
        : String(b.date).slice(0, 10);
    return {
      id: r.id,
      invoiceNumber: r.invoiceNumber,
      bookingId: r.bookingId,
      guestId: r.guestId,
      amountCHF: r.amountCHF,
      vatPercent: r.vatPercent,
      status: r.status,
      pdfUrl: r.pdfUrl,
      issuedAt: r.issuedAt.toISOString(),
      paidAt: r.paidAt?.toISOString() ?? null,
      dueDate: r.dueDate
        ? r.dueDate instanceof Date
          ? formatDateOnly(r.dueDate)
          : String(r.dueDate).slice(0, 10)
        : null,
      guestName: g.name,
      guestEmail: g.email,
      bookingDate: d,
      courseName: b.courseType?.name ?? "—",
      teacherName: b.teacher?.name ?? b.teacher?.email ?? null,
    };
  });
}

function formatDateOnly(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export async function findById(id: string): Promise<InvoiceWithDetails> {
  const db = getDb();
  const r = await db.query.invoices.findFirst({
    where: eq(invoices.id, id),
    with: {
      booking: {
        with: {
          guest: true,
          courseType: true,
          teacher: true,
        },
      },
      guest: true,
    },
  });
  if (!r?.booking || !r.guest) throw new NotFoundError("Rechnung nicht gefunden");
  const b = r.booking;
  const g = r.guest;
  const d =
    b.date instanceof Date
      ? `${b.date.getFullYear()}-${String(b.date.getMonth() + 1).padStart(2, "0")}-${String(b.date.getDate()).padStart(2, "0")}`
      : String(b.date).slice(0, 10);
  return {
    id: r.id,
    invoiceNumber: r.invoiceNumber,
    bookingId: r.bookingId,
    guestId: r.guestId,
    amountCHF: r.amountCHF,
    vatPercent: r.vatPercent,
    status: r.status,
    pdfUrl: r.pdfUrl,
    issuedAt: r.issuedAt.toISOString(),
    paidAt: r.paidAt?.toISOString() ?? null,
    dueDate: r.dueDate
      ? r.dueDate instanceof Date
        ? formatDateOnly(r.dueDate)
        : String(r.dueDate).slice(0, 10)
      : null,
    guestName: g.name,
    guestEmail: g.email,
    bookingDate: d,
    courseName: b.courseType?.name ?? "—",
    teacherName: b.teacher?.name ?? b.teacher?.email ?? null,
  };
}

export async function createFromBooking(bookingId: string): Promise<Invoice> {
  const db = getDb();
  const existing = await db.query.invoices.findFirst({
    where: eq(invoices.bookingId, bookingId),
  });
  if (existing) {
    throw new ValidationError("Für diese Buchung existiert bereits eine Rechnung");
  }
  const b = await db.query.bookings.findFirst({
    where: eq(bookings.id, bookingId),
    with: { guest: true },
  });
  if (!b) throw new NotFoundError("Buchung nicht gefunden");

  const year = new Date().getFullYear();
  const invoiceNumber = await generateNextNumber(year);

  const [row] = await db
    .insert(invoices)
    .values({
      invoiceNumber,
      bookingId: b.id,
      guestId: b.guestId,
      amountCHF: b.priceCHF,
      vatPercent: "7.7",
      status: "offen",
    })
    .returning();

  if (!row) throw new Error("Rechnung konnte nicht erstellt werden");
  return toInvoiceDto(row);
}

function toInvoiceDto(r: typeof invoices.$inferSelect): Invoice {
  return {
    id: r.id,
    invoiceNumber: r.invoiceNumber,
    bookingId: r.bookingId,
    guestId: r.guestId,
    amountCHF: r.amountCHF,
    vatPercent: r.vatPercent,
    status: r.status,
    pdfUrl: r.pdfUrl,
    issuedAt: r.issuedAt.toISOString(),
    paidAt: r.paidAt?.toISOString() ?? null,
    dueDate: r.dueDate
      ? r.dueDate instanceof Date
        ? formatDateOnly(r.dueDate)
        : String(r.dueDate).slice(0, 10)
      : null,
  };
}

export async function markAsPaid(id: string): Promise<Invoice> {
  const db = getDb();
  await db
    .update(invoices)
    .set({ status: "bezahlt", paidAt: new Date() })
    .where(eq(invoices.id, id));
  const row = await db.query.invoices.findFirst({ where: eq(invoices.id, id) });
  if (!row) throw new NotFoundError("Rechnung nicht gefunden");
  return toInvoiceDto(row);
}

export async function cancelInvoice(id: string): Promise<Invoice> {
  const db = getDb();
  await db
    .update(invoices)
    .set({ status: "storniert" })
    .where(eq(invoices.id, id));
  const row = await db.query.invoices.findFirst({ where: eq(invoices.id, id) });
  if (!row) throw new NotFoundError("Rechnung nicht gefunden");
  return toInvoiceDto(row);
}

export async function monthStats(year: number, month: number): Promise<{
  openCHF: number;
  paidCHF: number;
}> {
  const db = getDb();
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 0, 23, 59, 59);
  const rows = await db.query.invoices.findMany({
    where: and(
      gte(invoices.issuedAt, start),
      lte(invoices.issuedAt, end)
    ),
  });
  let openCHF = 0;
  let paidCHF = 0;
  for (const r of rows) {
    const amt = Number(r.amountCHF);
    if (r.status === "offen") openCHF += amt;
    if (r.status === "bezahlt") paidCHF += amt;
  }
  return { openCHF, paidCHF };
}

export async function canAccessInvoice(
  invoiceId: string,
  userId: string,
  role: "admin" | "teacher"
): Promise<boolean> {
  if (role === "admin") return true;
  const db = getDb();
  const inv = await db.query.invoices.findFirst({
    where: eq(invoices.id, invoiceId),
    with: { booking: true },
  });
  return inv?.booking?.teacherId === userId;
}
