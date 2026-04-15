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

export const LI_KVG_EMPLOYER_MONTHLY_FULL_ADULT_CHF = 180.5;
export const LI_KVG_EMPLOYER_MONTHLY_FULL_YOUTH_CHF = 90.25;

export const LI_WITHHOLDING_TAX_BRACKET_CHF = 40_000;
export const LI_WITHHOLDING_TAX_PCT = 4;

/** Einzelkomponenten AN (Summe 5,4 %), Merkblatt 2.2. */
export const LI_SOCIAL_EE_PARTS: { key: string; labelDe: string; pct: number }[] = [
  { key: "ahv", labelDe: "AHV AN", pct: 4.025 },
  { key: "iv", labelDe: "IV AN", pct: 0.675 },
  { key: "fak", labelDe: "FAK AN", pct: 0.2 },
  { key: "alv", labelDe: "ALV AN", pct: 0.5 },
];

/** Einzelkomponenten AG (Summe 7,885 %). */
export const LI_SOCIAL_ER_PARTS: { key: string; labelDe: string; pct: number }[] = [
  { key: "ahv", labelDe: "AHV AG", pct: 4.225 },
  { key: "iv", labelDe: "IV AG", pct: 0.675 },
  { key: "fak", labelDe: "FAK AG", pct: 1.9 },
  { key: "vw", labelDe: "Verwaltungskosten AG", pct: 0.585 },
  { key: "alv", labelDe: "ALV AG", pct: 0.5 },
];

export type StaffKvgAgeBand = "adult" | "youth_16_20";

export type WhtAnnualBasisMethod = "manual" | "ytd_plus_current" | "times12";

export interface StaffPayrollProfileDto {
  userId: string;
  /** @deprecated Spiegel produktiv — Rückwärtskompatibilität */
  grossHourlyRateChf: string | null;
  grossHourlyRateProductiveChf: string | null;
  grossHourlyRateInternalChf: string | null;
  estimatedAnnualGrossChf: string | null;
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

export interface PayrollSocialLineDto {
  key: string;
  labelDe: string;
  pct: string;
  chf: string;
}

export interface PayrollMonthComputationDto {
  productiveDecimalHours: string;
  internalDecimalHours: string;
  totalDecimalHours: string;
  hourlyRateProductive: string;
  hourlyRateInternal: string;
  grossProductiveChf: string;
  grossInternalChf: string;
  grossChf: string;
  employeeSocialPct: string;
  employeeSocialChf: string;
  employerSocialPct: string;
  employerSocialChf: string;
  employeeSocialBreakdown: PayrollSocialLineDto[];
  employerSocialBreakdown: PayrollSocialLineDto[];
  employerKvgMonthlyChf: string;
  withholdingTaxChf: string;
  withholdingTaxApplied: boolean;
  /** Für Transparenz: welche Jahresbasis für4 %-Grenze */
  whtAnnualBasisChf: string;
  whtAnnualBasisMethod: WhtAnnualBasisMethod;
  /** Naive Hochrechnung (nur Hinweis) */
  projectedAnnualGrossNaiveChf: string;
  ytdFinalizedGrossBeforeMonthChf: string;
  netPayoutApproxChf: string;
  referenceWeeklyHours: number;
  ratesVersionLabel: string;
}

export interface PayrollSnapshotMetaDto {
  monthYyyyMm: string;
  grossChf: string;
  finalizedAt: string;
  finalizedByUserId: string | null;
  finalizedByName: string | null;
}

export interface PayrollMonthReportDto {
  profile: StaffPayrollProfileDto | null;
  hours: PayrollHoursSummaryDto;
  computation: PayrollMonthComputationDto | null;
  warnings: string[];
  snapshot: PayrollSnapshotMetaDto | null;
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function parseRate(s: string | null | undefined): number | null {
  if (s == null || String(s).trim() === "") return null;
  const n = Number.parseFloat(String(s).replace(",", "."));
  return Number.isFinite(n) && n > 0 ? n : null;
}

function parseMoneyPositive(s: string | null | undefined): number | null {
  if (s == null || String(s).trim() === "") return null;
  const n = Number.parseFloat(String(s).replace(",", "."));
  return Number.isFinite(n) && n > 0 ? n : null;
}

export function resolveProductiveInternalRates(profile: StaffPayrollProfileDto): {
  productive: number | null;
  internal: number | null;
} {
  const p =
    parseRate(profile.grossHourlyRateProductiveChf) ??
    parseRate(profile.grossHourlyRateChf);
  const i = parseRate(profile.grossHourlyRateInternalChf);
  return {
    productive: p,
    internal: i ?? p,
  };
}

export function resolveWhtAnnualBasis(
  estimatedAnnualGross: number | null,
  ytdFinalizedGrossBeforeMonth: number,
  currentMonthGross: number
): { basis: number; method: WhtAnnualBasisMethod } {
  if (estimatedAnnualGross != null && estimatedAnnualGross > 0) {
    return { basis: round2(estimatedAnnualGross), method: "manual" };
  }
  if (ytdFinalizedGrossBeforeMonth > 0) {
    return {
      basis: round2(ytdFinalizedGrossBeforeMonth + currentMonthGross),
      method: "ytd_plus_current",
    };
  }
  return {
    basis: round2(currentMonthGross * 12),
    method: "times12",
  };
}

export function computePayrollMonth(
  productiveMinutes: number,
  internalMinutes: number,
  profile: StaffPayrollProfileDto,
  ytdFinalizedGrossBeforeMonth: number
): PayrollMonthComputationDto | null {
  const { productive: rp, internal: ri } = resolveProductiveInternalRates(profile);
  if (rp == null) return null;

  const prodH = productiveMinutes / 60;
  const intH = internalMinutes / 60;
  const grossP = round2(prodH * rp);
  const grossI = round2(intH * (ri ?? rp));
  const gross = round2(grossP + grossI);

  const whRaw = profile.weeklyHoursForKvg
    ? Number.parseFloat(String(profile.weeklyHoursForKvg))
    : LI_REFERENCE_WEEKLY_HOURS;
  const weeklyH =
    Number.isFinite(whRaw) && whRaw > 0 ? whRaw : LI_REFERENCE_WEEKLY_HOURS;

  const empLines: PayrollSocialLineDto[] = LI_SOCIAL_EE_PARTS.map((row) => {
    const chf = round2(gross * (row.pct / 100));
    return {
      key: row.key,
      labelDe: row.labelDe,
      pct: row.pct.toFixed(3),
      chf: chf.toFixed(2),
    };
  });
  const empSoc = round2(
    empLines.reduce((a, x) => a + Number.parseFloat(x.chf), 0)
  );

  const erLines: PayrollSocialLineDto[] = LI_SOCIAL_ER_PARTS.map((row) => {
    const chf = round2(gross * (row.pct / 100));
    return {
      key: row.key,
      labelDe: row.labelDe,
      pct: row.pct.toFixed(3),
      chf: chf.toFixed(2),
    };
  });
  const emplSoc = round2(
    erLines.reduce((a, x) => a + Number.parseFloat(x.chf), 0)
  );

  const kvgBase =
    profile.kvgAgeBand === "youth_16_20"
      ? LI_KVG_EMPLOYER_MONTHLY_FULL_YOUTH_CHF
      : LI_KVG_EMPLOYER_MONTHLY_FULL_ADULT_CHF;
  const kvgMon = round2(kvgBase * (weeklyH / LI_REFERENCE_WEEKLY_HOURS));

  const estAnnual = parseMoneyPositive(profile.estimatedAnnualGrossChf);

  const { basis: whtBasis, method: whtMethod } = resolveWhtAnnualBasis(
    estAnnual,
    ytdFinalizedGrossBeforeMonth,
    gross
  );
  const whtApplied =
    profile.applyWht4pct && whtBasis <= LI_WITHHOLDING_TAX_BRACKET_CHF;
  const wht = whtApplied ? round2(gross * (LI_WITHHOLDING_TAX_PCT / 100)) : 0;
  const net = round2(gross - empSoc - wht);

  return {
    productiveDecimalHours: formatMinutesAsDecimalHours(productiveMinutes),
    internalDecimalHours: formatMinutesAsDecimalHours(internalMinutes),
    totalDecimalHours: formatMinutesAsDecimalHours(
      productiveMinutes + internalMinutes
    ),
    hourlyRateProductive: rp.toFixed(2),
    hourlyRateInternal: (ri ?? rp).toFixed(2),
    grossProductiveChf: grossP.toFixed(2),
    grossInternalChf: grossI.toFixed(2),
    grossChf: gross.toFixed(2),
    employeeSocialPct: LI_EMPLOYEE_SOCIAL_TOTAL_PCT.toFixed(3),
    employeeSocialChf: empSoc.toFixed(2),
    employerSocialPct: LI_EMPLOYER_SOCIAL_TOTAL_PCT.toFixed(3),
    employerSocialChf: emplSoc.toFixed(2),
    employeeSocialBreakdown: empLines,
    employerSocialBreakdown: erLines,
    employerKvgMonthlyChf: kvgMon.toFixed(2),
    withholdingTaxChf: wht.toFixed(2),
    withholdingTaxApplied: whtApplied,
    whtAnnualBasisChf: whtBasis.toFixed(2),
    whtAnnualBasisMethod: whtMethod,
    projectedAnnualGrossNaiveChf: round2(gross * 12).toFixed(2),
    ytdFinalizedGrossBeforeMonthChf: ytdFinalizedGrossBeforeMonth.toFixed(2),
    netPayoutApproxChf: net.toFixed(2),
    referenceWeeklyHours: LI_REFERENCE_WEEKLY_HOURS,
    ratesVersionLabel: "FL Merkblatt Lohnabrechnung 2026 (Januar)",
  };
}
