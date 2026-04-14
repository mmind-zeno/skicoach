import { eq } from "drizzle-orm";
import { staffPayrollProfiles } from "../../drizzle/schema";
import { getDb } from "../lib/db";
import { buildMonthlyHoursReport } from "./monthly-hours-report.service";
import {
  computePayrollMonth,
  enrichComputationHours,
  type PayrollMonthReportDto,
  type StaffPayrollProfileDto,
} from "./payroll-li.shared";

export type {
  PayrollMonthReportDto,
  StaffPayrollProfileDto,
} from "./payroll-li.shared";

export {
  LI_PAYROLL_MERKBLATT_PDF_URL,
  LI_EMPLOYEE_SOCIAL_TOTAL_PCT,
  LI_EMPLOYER_SOCIAL_TOTAL_PCT,
} from "./payroll-li.shared";

function rowToProfileDto(row: typeof staffPayrollProfiles.$inferSelect): StaffPayrollProfileDto {
  return {
    userId: row.userId,
    grossHourlyRateChf: row.grossHourlyRateChf ?? null,
    weeklyHoursForKvg: row.weeklyHoursForKvg ?? null,
    kvgAgeBand: row.kvgAgeBand,
    applyWht4pct: row.applyWht4pct,
    merkblattSmallEmploymentAck: row.merkblattSmallEmploymentAck,
    ahvNumber: row.ahvNumber ?? null,
    notes: row.notes ?? null,
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

  const warnings: string[] = [];
  if (!profile) {
    warnings.push(
      "Kein Lohnstammprofil: Admin muss Bruttolohn pro Stunde hinterlegen."
    );
  } else if (
    !profile.grossHourlyRateChf ||
    Number.parseFloat(profile.grossHourlyRateChf) <= 0
  ) {
    warnings.push("Bruttostundenlohn fehlt oder ist ungültig — keine Berechnung.");
  }
  if (profile && !profile.merkblattSmallEmploymentAck) {
    warnings.push(
      "Merkblatt betrifft u. a. Jahreslöhne unter CHF 14'700 (keine BVG-Pflicht) — Anwendbarkeit prüfen."
    );
  }

  let computation = profile ? computePayrollMonth(hoursReport.totalWorkedMinutes, profile) : null;
  if (computation) {
    computation = enrichComputationHours(computation, {
      productiveMinutes: hoursReport.productiveMinutes,
      internalMinutesTotal: hoursReport.internalMinutesTotal,
      totalWorkedMinutes: hoursReport.totalWorkedMinutes,
    });
  }

  const projected = computation
    ? Number.parseFloat(computation.projectedAnnualGrossChf)
    : 0;
  if (
    profile?.applyWht4pct &&
    Number.isFinite(projected) &&
    projected > 40_000
  ) {
    warnings.push(
      "Bei Jahresbrutto über CHF 40'000 ist der pauschale Steuerabzug von 4 % i. d. R. nicht mehr zutreffend (Merkblatt 7.1)."
    );
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
  };
}
