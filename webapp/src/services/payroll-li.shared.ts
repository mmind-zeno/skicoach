/**
 * Liechtenstein Lohn-Hilfsrechnung (Merkblatt Lohnabrechnung 2026, Teilzeit/geringe Löhne).
 * Keine Rechts- oder Steuerberatung — nur dokumentierte Standardannahmen für die App.
 */

import type { MonthlyHoursReportDto } from "./monthly-hours-report.shared";
import { formatMinutesAsDecimalHours } from "./monthly-hours-report.shared";

/** Primärquelle Regierung FL, Stand Jan. 2026 */
export const LI_PAYROLL_MERKBLATT_PDF_URL =
  "https://www.regierung.li/files/attachments/2026-merkblatt-lohnabrechnung.pdf";

/** Arbeitnehmer-Anteile AHV/IV/FAK/ALV total (Merkblatt Tabelle). */
export const LI_EMPLOYEE_SOCIAL_TOTAL_PCT = 5.4;

/** Arbeitgeber-Anteile total (Merkblatt Tabelle). */
export const LI_EMPLOYER_SOCIAL_TOTAL_PCT = 7.885;

/** Referenz-Wochenstunden für KVG-Beispiel im Merkblatt (100 % Pensum). */
export const LI_REFERENCE_WEEKLY_HOURS = 42;

/**
 * Monatlicher Arbeitgeber-KVG-Anteil proportional Wochenstunden/42 (Merkblatt-Beispiel;
 * Erwachsene: Basis 180.50, Jugendliche: 90.25, Abschnitt 4.2).
 */
export const LI_KVG_EMPLOYER_MONTHLY_FULL_ADULT_CHF = 180.5;
export const LI_KVG_EMPLOYER_MONTHLY_FULL_YOUTH_CHF = 90.25;

/** Pauschal Steuerabzug bei Bruttoerwerb bis 40'000 CHF (Merkblatt 7.1). */
export const LI_WITHHOLDING_TAX_BRACKET_CHF = 40_000;
export const LI_WITHHOLDING_TAX_PCT = 4;

export type StaffKvgAgeBand = "adult" | "youth_16_20";

export interface StaffPayrollProfileDto {
  userId: string;
  grossHourlyRateChf: string | null;
  weeklyHoursForKvg: string | null;
  kvgAgeBand: StaffKvgAgeBand;
  applyWht4pct: boolean;
  merkblattSmallEmploymentAck: boolean;
  ahvNumber: string | null;
  notes: string | null;
}

export interface PayrollHoursSummaryDto {
  month: string;
  teacher: MonthlyHoursReportDto["teacher"];
  productiveMinutes: number;
  internalMinutesTotal: number;
  totalWorkedMinutes: number;
}

export interface PayrollMonthComputationDto {
  productiveDecimalHours: string;
  internalDecimalHours: string;
  totalDecimalHours: string;
  grossChf: string;
  employeeSocialPct: string;
  employeeSocialChf: string;
  employerSocialPct: string;
  employerSocialChf: string;
  employerKvgMonthlyChf: string;
  withholdingTaxChf: string;
  withholdingTaxApplied: boolean;
  projectedAnnualGrossChf: string;
  netPayoutApproxChf: string;
  referenceWeeklyHours: number;
  ratesVersionLabel: string;
}

export interface PayrollMonthReportDto {
  profile: StaffPayrollProfileDto | null;
  hours: PayrollHoursSummaryDto;
  computation: PayrollMonthComputationDto | null;
  warnings: string[];
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function computePayrollMonth(
  totalWorkedMinutes: number,
  profile: StaffPayrollProfileDto
): PayrollMonthComputationDto | null {
  const rateRaw = profile.grossHourlyRateChf
    ? Number.parseFloat(String(profile.grossHourlyRateChf))
    : NaN;
  if (!Number.isFinite(rateRaw) || rateRaw <= 0) return null;

  const whRaw = profile.weeklyHoursForKvg
    ? Number.parseFloat(String(profile.weeklyHoursForKvg))
    : LI_REFERENCE_WEEKLY_HOURS;
  const weeklyH =
    Number.isFinite(whRaw) && whRaw > 0 ? whRaw : LI_REFERENCE_WEEKLY_HOURS;

  const totalH = totalWorkedMinutes / 60;
  const gross = round2(totalH * rateRaw);
  const empSoc = round2(gross * (LI_EMPLOYEE_SOCIAL_TOTAL_PCT / 100));
  const emplSoc = round2(gross * (LI_EMPLOYER_SOCIAL_TOTAL_PCT / 100));
  const kvgBase =
    profile.kvgAgeBand === "youth_16_20"
      ? LI_KVG_EMPLOYER_MONTHLY_FULL_YOUTH_CHF
      : LI_KVG_EMPLOYER_MONTHLY_FULL_ADULT_CHF;
  const kvgMon = round2(kvgBase * (weeklyH / LI_REFERENCE_WEEKLY_HOURS));
  const projectedAnnual = round2(gross * 12);
  const whtApplied =
    profile.applyWht4pct && projectedAnnual <= LI_WITHHOLDING_TAX_BRACKET_CHF;
  const wht = whtApplied ? round2(gross * (LI_WITHHOLDING_TAX_PCT / 100)) : 0;
  const net = round2(gross - empSoc - wht);

  return {
    productiveDecimalHours: "0.00",
    internalDecimalHours: "0.00",
    totalDecimalHours: formatMinutesAsDecimalHours(totalWorkedMinutes),
    grossChf: gross.toFixed(2),
    employeeSocialPct: LI_EMPLOYEE_SOCIAL_TOTAL_PCT.toFixed(3),
    employeeSocialChf: empSoc.toFixed(2),
    employerSocialPct: LI_EMPLOYER_SOCIAL_TOTAL_PCT.toFixed(3),
    employerSocialChf: emplSoc.toFixed(2),
    employerKvgMonthlyChf: kvgMon.toFixed(2),
    withholdingTaxChf: wht.toFixed(2),
    withholdingTaxApplied: whtApplied,
    projectedAnnualGrossChf: projectedAnnual.toFixed(2),
    netPayoutApproxChf: net.toFixed(2),
    referenceWeeklyHours: LI_REFERENCE_WEEKLY_HOURS,
    ratesVersionLabel: "FL Merkblatt Lohnabrechnung 2026 (Januar)",
  };
}

/** Vollständige Stundenaufteilung in der Berechnung (für PDF/Anzeige). */
export function enrichComputationHours(
  computation: PayrollMonthComputationDto,
  hours: Pick<
    MonthlyHoursReportDto,
    "productiveMinutes" | "internalMinutesTotal" | "totalWorkedMinutes"
  >
): PayrollMonthComputationDto {
  return {
    ...computation,
    productiveDecimalHours: formatMinutesAsDecimalHours(hours.productiveMinutes),
    internalDecimalHours: formatMinutesAsDecimalHours(hours.internalMinutesTotal),
    totalDecimalHours: formatMinutesAsDecimalHours(hours.totalWorkedMinutes),
  };
}
