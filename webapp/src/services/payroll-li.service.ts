import { and, asc, eq, gte, lt, sum } from "drizzle-orm";
import {
  payrollMonthSnapshots,
  staffPayrollProfiles,
  users,
} from "../../drizzle/schema";
import { getDb } from "../lib/db";
import { buildMonthlyHoursReport } from "./monthly-hours-report.service";
import {
  computePayrollMonth,
  resolveProductiveInternalRates,
  type PayrollMonthReportDto,
  type PayrollSnapshotMetaDto,
  type StaffPayrollProfileDto,
} from "./payroll-li.shared";

export type {
  PayrollMonthReportDto,
  StaffPayrollProfileDto,
  PayrollSnapshotMetaDto,
} from "./payroll-li.shared";

export {
  LI_PAYROLL_MERKBLATT_PDF_URL,
  LI_EMPLOYEE_SOCIAL_TOTAL_PCT,
  LI_EMPLOYER_SOCIAL_TOTAL_PCT,
} from "./payroll-li.shared";

function rowToProfileDto(row: typeof staffPayrollProfiles.$inferSelect): StaffPayrollProfileDto {
  const productive =
    row.grossHourlyRateProductiveChf ?? row.grossHourlyRateChf ?? null;
  return {
    userId: row.userId,
    grossHourlyRateChf: row.grossHourlyRateChf ?? null,
    grossHourlyRateProductiveChf: productive,
    grossHourlyRateInternalChf: row.grossHourlyRateInternalChf ?? null,
    estimatedAnnualGrossChf: row.estimatedAnnualGrossChf ?? null,
    weeklyHoursForKvg: row.weeklyHoursForKvg ?? null,
    kvgAgeBand: row.kvgAgeBand,
    applyWht4pct: row.applyWht4pct,
    merkblattSmallEmploymentAck: row.merkblattSmallEmploymentAck,
    ahvNumber: row.ahvNumber ?? null,
    notes: row.notes ?? null,
  };
}

async function sumYtdFinalizedGrossBeforeMonth(
  userId: string,
  monthYyyyMm: string
): Promise<number> {
  const year = monthYyyyMm.slice(0, 4);
  const yearStart = `${year}-01`;
  const db = getDb();
  const rows = await db
    .select({ total: sum(payrollMonthSnapshots.grossChf) })
    .from(payrollMonthSnapshots)
    .where(
      and(
        eq(payrollMonthSnapshots.userId, userId),
        gte(payrollMonthSnapshots.monthYyyyMm, yearStart),
        lt(payrollMonthSnapshots.monthYyyyMm, monthYyyyMm)
      )
    );
  const raw = rows[0]?.total;
  const n =
    raw == null ? 0 : Number.parseFloat(String(raw));
  return Number.isFinite(n) ? Math.round(n * 100) / 100 : 0;
}

async function loadSnapshotMeta(
  userId: string,
  monthYyyyMm: string
): Promise<PayrollSnapshotMetaDto | null> {
  const db = getDb();
  const row = await db.query.payrollMonthSnapshots.findFirst({
    where: and(
      eq(payrollMonthSnapshots.userId, userId),
      eq(payrollMonthSnapshots.monthYyyyMm, monthYyyyMm)
    ),
    with: { finalizedByUser: true },
  });
  if (!row) return null;
  const fin = row.finalizedByUser;
  return {
    monthYyyyMm: row.monthYyyyMm,
    grossChf: String(row.grossChf),
    finalizedAt: row.finalizedAt.toISOString(),
    finalizedByUserId: row.finalizedBy ?? null,
    finalizedByName: fin?.name ?? fin?.email ?? null,
  };
}

export async function buildPayrollMonthReport(
  userId: string,
  monthYyyyMm: string
): Promise<PayrollMonthReportDto | null> {
  const hoursReport = await buildMonthlyHoursReport(userId, monthYyyyMm);
  if (!hoursReport) return null;

  const db = getDb();
  const row = await db.query.staffPayrollProfiles.findFirst({
    where: eq(staffPayrollProfiles.userId, userId),
  });
  const profile = row ? rowToProfileDto(row) : null;

  const ytd = await sumYtdFinalizedGrossBeforeMonth(userId, monthYyyyMm);
  const snapshot = await loadSnapshotMeta(userId, monthYyyyMm);

  const warnings: string[] = [];
  if (!profile) {
    warnings.push(
      "Kein Lohnstammprofil: Admin muss Bruttolohn pro Stunde hinterlegen."
    );
  } else {
    const { productive } = resolveProductiveInternalRates(profile);
    if (productive == null) {
      warnings.push(
        "Bruttostundenlohn (produktiv) fehlt oder ist ungültig — keine Berechnung."
      );
    }
  }
  if (profile && !profile.merkblattSmallEmploymentAck) {
    warnings.push(
      "Merkblatt betrifft u. a. Jahreslöhne unter CHF 14'700 (keine BVG-Pflicht) — Anwendbarkeit prüfen."
    );
  }

  const computation = profile
    ? computePayrollMonth(
        hoursReport.productiveMinutes,
        hoursReport.internalMinutesTotal,
        profile,
        ytd
      )
    : null;

  if (computation) {
    const grossN = Number.parseFloat(computation.grossChf);
    if (
      hoursReport.totalWorkedMinutes === 0 &&
      Number.isFinite(grossN) &&
      grossN === 0
    ) {
      warnings.push(
        "Keine gearbeiteten Stunden in diesem Monat — Bruttolohn und Abzüge sind null (kein Auszahlungsbedarf)."
      );
    }
    if (
      computation.whtAnnualBasisMethod === "times12" &&
      !profile?.estimatedAnnualGrossChf
    ) {
      warnings.push(
        "Jahresbasis für Quellensteuer: aktuell 12 × Monatsbrutto (grob). Bei Saison oder Eintritt/Austritt geschätztes Jahresbrutto im Stamm pflegen oder Vormonate freigeben (YTD)."
      );
    }
    if (
      profile?.applyWht4pct &&
      Number.parseFloat(computation.whtAnnualBasisChf) > 40_000
    ) {
      warnings.push(
        "Geschätztes Jahresbrutto über CHF 40'000 — pauschaler Steuerabzug 4 % ist i. d. R. nicht mehr zutreffend (Merkblatt 7.1)."
      );
    }
  }

  return {
    profile,
    hours: {
      month: hoursReport.month,
      teacher: hoursReport.teacher,
      productiveMinutes: hoursReport.productiveMinutes,
      internalMinutesTotal: hoursReport.internalMinutesTotal,
      totalWorkedMinutes: hoursReport.totalWorkedMinutes,
    },
    computation,
    warnings,
    snapshot,
  };
}

export async function finalizePayrollMonthSnapshot(
  userId: string,
  monthYyyyMm: string,
  actorUserId: string
): Promise<PayrollMonthReportDto | null> {
  const report = await buildPayrollMonthReport(userId, monthYyyyMm);
  if (!report?.computation) return null;

  const db = getDb();
  const payload = {
    hours: report.hours,
    computation: report.computation,
    profileSnapshot: report.profile,
    finalizedAt: new Date().toISOString(),
  };

  const existing = await db.query.payrollMonthSnapshots.findFirst({
    where: and(
      eq(payrollMonthSnapshots.userId, userId),
      eq(payrollMonthSnapshots.monthYyyyMm, monthYyyyMm)
    ),
  });

  if (existing) {
    await db
      .update(payrollMonthSnapshots)
      .set({
        grossChf: report.computation.grossChf,
        snapshotJson: payload as Record<string, unknown>,
        finalizedAt: new Date(),
        finalizedBy: actorUserId,
      })
      .where(eq(payrollMonthSnapshots.id, existing.id));
  } else {
    await db.insert(payrollMonthSnapshots).values({
      userId,
      monthYyyyMm,
      grossChf: report.computation.grossChf,
      snapshotJson: payload as Record<string, unknown>,
      finalizedBy: actorUserId,
    });
  }

  return buildPayrollMonthReport(userId, monthYyyyMm);
}

export async function deletePayrollMonthSnapshot(
  userId: string,
  monthYyyyMm: string
): Promise<boolean> {
  const db = getDb();
  const del = await db
    .delete(payrollMonthSnapshots)
    .where(
      and(
        eq(payrollMonthSnapshots.userId, userId),
        eq(payrollMonthSnapshots.monthYyyyMm, monthYyyyMm)
      )
    )
    .returning({ id: payrollMonthSnapshots.id });
  return del.length > 0;
}

export async function listPayrollSnapshotsForYearCsvRows(
  userId: string,
  year: string
): Promise<
  { month: string; grossChf: string; finalizedAt: string; finalizedBy: string }[]
> {
  if (!/^\d{4}$/.test(year)) return [];
  const start = `${year}-01`;
  const end = `${year}-13`;
  const db = getDb();
  const rows = await db
    .select()
    .from(payrollMonthSnapshots)
    .where(
      and(
        eq(payrollMonthSnapshots.userId, userId),
        gte(payrollMonthSnapshots.monthYyyyMm, start),
        lt(payrollMonthSnapshots.monthYyyyMm, end)
      )
    )
    .orderBy(asc(payrollMonthSnapshots.monthYyyyMm));

  const out: {
    month: string;
    grossChf: string;
    finalizedAt: string;
    finalizedBy: string;
  }[] = [];
  for (const r of rows) {
    let fin = "";
    if (r.finalizedBy) {
      const u = await db.query.users.findFirst({
        where: eq(users.id, r.finalizedBy),
      });
      fin = u?.email ?? r.finalizedBy;
    }
    out.push({
      month: r.monthYyyyMm,
      grossChf: String(r.grossChf),
      finalizedAt:
        r.finalizedAt instanceof Date
          ? r.finalizedAt.toISOString()
          : String(r.finalizedAt),
      finalizedBy: fin,
    });
  }
  return out;
}
