import { and, gte, lt, lte } from "drizzle-orm";
import { bookings, invoices } from "../../drizzle/schema";
import { parseLocalDateOnly } from "../lib/datetime";
import { getDb } from "../lib/db";

export type AccountingCsvRow = {
  satzart: string;
  umsatzdatum: string;
  belegfeld1: string;
  buchungstext: string;
  bruttobetrag: string;
  waehrung: string;
  konto: string;
  gegenkonto: string;
  steuersatz: string;
  gastname: string;
  lehrkraft: string;
  status: string;
};

/**
 * Jahresabschluss-Light: eine Zeile pro Buchung und pro Rechnung (DateV-ähnliche Spalten).
 * Hinweis: Konto/Gegenkonto sind Platzhalter — vom Steuerberater zu mappen.
 */
export async function listAccountingLightCsvRows(
  year: string
): Promise<AccountingCsvRow[]> {
  const y = Number.parseInt(year, 10);
  if (!Number.isFinite(y) || y < 2000 || y > 2100) {
    throw new Error("invalid_year");
  }
  const from = parseLocalDateOnly(`${y}-01-01`);
  const to = parseLocalDateOnly(`${y}-12-31`);
  const db = getDb();

  const bookingRows = await db.query.bookings.findMany({
    where: and(gte(bookings.date, from), lte(bookings.date, to)),
    with: { guest: true, teacher: true, courseType: true },
    orderBy: (b, { asc }) => [asc(b.date), asc(b.startTime)],
    limit: 50_000,
  });

  const invoiceRows = await db.query.invoices.findMany({
    where: and(
      gte(invoices.issuedAt, new Date(Date.UTC(y, 0, 1))),
      lt(invoices.issuedAt, new Date(Date.UTC(y + 1, 0, 1)))
    ),
    with: { guest: true },
    orderBy: (i, { asc }) => [asc(i.issuedAt)],
    limit: 50_000,
  });

  const out: AccountingCsvRow[] = [];

  for (const b of bookingRows) {
    const d =
      b.date instanceof Date
        ? `${b.date.getFullYear()}-${String(b.date.getMonth() + 1).padStart(2, "0")}-${String(b.date.getDate()).padStart(2, "0")}`
        : String(b.date).slice(0, 10);
    out.push({
      satzart: "BUCHUNG",
      umsatzdatum: d,
      belegfeld1: b.id,
      buchungstext: `${b.courseType?.name ?? "Kurs"} · ${b.guest?.name ?? ""}`.slice(
        0,
        120
      ),
      bruttobetrag: String(b.priceCHF),
      waehrung: "CHF",
      konto: "",
      gegenkonto: "",
      steuersatz: "",
      gastname: b.guest?.name ?? "",
      lehrkraft: b.teacher?.name ?? b.teacher?.email ?? "",
      status: b.status,
    });
  }

  for (const inv of invoiceRows) {
    const issued = inv.issuedAt;
    const d = `${issued.getFullYear()}-${String(issued.getMonth() + 1).padStart(2, "0")}-${String(issued.getDate()).padStart(2, "0")}`;
    out.push({
      satzart: "RECHNUNG",
      umsatzdatum: d,
      belegfeld1: inv.invoiceNumber,
      buchungstext: `Rechnung ${inv.invoiceNumber} · ${inv.guest?.name ?? ""}`.slice(
        0,
        120
      ),
      bruttobetrag: String(inv.amountCHF),
      waehrung: "CHF",
      konto: "",
      gegenkonto: "",
      steuersatz: String(inv.vatPercent),
      gastname: inv.guest?.name ?? "",
      lehrkraft: "",
      status: inv.status,
    });
  }

  out.sort((a, b) => {
    const c = a.umsatzdatum.localeCompare(b.umsatzdatum);
    if (c !== 0) return c;
    return a.satzart.localeCompare(b.satzart);
  });

  return out;
}
