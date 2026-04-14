"use client";

import { useAppToast } from "@/components/app-toast";
import { brand } from "@/config/brand";
import { fetchJson } from "@/lib/client-fetch";
import { getUiErrorInfo } from "@/lib/client-error-message";
import {
  LI_PAYROLL_MERKBLATT_PDF_URL,
  type PayrollMonthReportDto,
  type StaffKvgAgeBand,
  type StaffPayrollProfileDto,
} from "@/services/payroll-li.shared";
import { formatMinutesAsDecimalHours } from "@/services/monthly-hours-report.shared";
import { useSession } from "next-auth/react";
import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";

type UserRow = {
  id: string;
  name: string | null;
  email: string;
  role: string;
  isActive: boolean;
};

export function PayrollMonthPanel({ isAdmin }: { isAdmin: boolean }) {
  const { data: session } = useSession();
  const { showToast } = useAppToast();
  const [month, setMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });
  const [userId, setUserId] = useState("");
  const [err, setErr] = useState<string | null>(null);

  const [hourly, setHourly] = useState("");
  const [weeklyH, setWeeklyH] = useState("");
  const [kvgBand, setKvgBand] = useState<StaffKvgAgeBand>("adult");
  const [wht, setWht] = useState(true);
  const [merkAck, setMerkAck] = useState(false);
  const [ahv, setAhv] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const { data: users } = useSWR(
    isAdmin ? "/api/admin/users" : null,
    (url) => fetchJson<UserRow[]>(url),
    { keepPreviousData: true }
  );

  const teachers = useMemo(
    () =>
      (users ?? []).filter(
        (u) => u.isActive && (u.role === "teacher" || u.role === "admin")
      ),
    [users]
  );

  useEffect(() => {
    if (!isAdmin && session?.user?.id) {
      setUserId(session.user.id);
    }
  }, [isAdmin, session?.user?.id]);

  useEffect(() => {
    if (!isAdmin || teachers.length === 0 || userId) return;
    setUserId(teachers[0].id);
  }, [isAdmin, teachers, userId]);

  const reportUrl =
    userId && month
      ? `/api/payroll-monthly?month=${encodeURIComponent(month)}&userId=${encodeURIComponent(userId)}`
      : null;

  const {
    data: report,
    error: reportError,
    mutate: mutReport,
  } = useSWR(reportUrl, (url) => fetchJson<PayrollMonthReportDto>(url), {
    keepPreviousData: true,
  });

  const profileUrl =
    isAdmin && userId
      ? `/api/admin/staff-payroll-profile?userId=${encodeURIComponent(userId)}`
      : null;

  const { data: profilePack, mutate: mutProfile } = useSWR(
    profileUrl,
    (url) => fetchJson<{ profile: StaffPayrollProfileDto }>(url),
    { keepPreviousData: true }
  );

  useEffect(() => {
    const p = profilePack?.profile;
    if (!p || !isAdmin) return;
    setHourly(p.grossHourlyRateChf ?? "");
    setWeeklyH(p.weeklyHoursForKvg ?? "");
    setKvgBand(p.kvgAgeBand);
    setWht(p.applyWht4pct);
    setMerkAck(p.merkblattSmallEmploymentAck);
    setAhv(p.ahvNumber ?? "");
    setNotes(p.notes ?? "");
  }, [profilePack, isAdmin]);

  useEffect(() => {
    if (reportError) {
      setErr(getUiErrorInfo(reportError, brand.labels.payrollLoadError).message);
    } else {
      setErr(null);
    }
  }, [reportError]);

  const pdfHref =
    userId && month
      ? `/api/payroll-monthly/pdf?month=${encodeURIComponent(month)}&userId=${encodeURIComponent(userId)}`
      : null;

  return (
    <div className="space-y-6 text-sm text-sk-ink">
      <p className="text-sk-ink/80">{brand.labels.payrollPageIntro}</p>
      <p className="text-xs text-sk-ink/65">
        <a
          href={LI_PAYROLL_MERKBLATT_PDF_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sk-brand underline"
        >
          {brand.labels.payrollMerkblattLinkLabel}
        </a>
      </p>
      <ul className="list-inside list-disc text-xs text-sk-ink/70">
        {brand.labels.payrollLegalBullets.split(". ").filter(Boolean).map((s) => (
          <li key={s.slice(0, 40)}>{s.trim().endsWith(".") ? s.trim() : `${s.trim()}.`}</li>
        ))}
      </ul>

      {err ? (
        <p className="text-red-600" role="alert">
          {err}
        </p>
      ) : null}

      <div className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1">
          <span className="text-xs text-sk-ink/60">
            {brand.labels.monthlyHoursMonthLabel}
          </span>
          <input
            type="month"
            className="rounded border border-sk-ink/15 px-2 py-1.5"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
          />
        </label>
        {isAdmin ? (
          <label className="flex min-w-[200px] flex-col gap-1">
            <span className="text-xs text-sk-ink/60">
              {brand.labels.monthlyHoursSelectStaff}
            </span>
            <select
              className="rounded border border-sk-ink/15 px-2 py-1.5"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
            >
              {teachers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name ?? u.email}
                </option>
              ))}
            </select>
          </label>
        ) : null}
      </div>

      {isAdmin && userId ? (
        <div className="rounded-xl border border-sk-ink/10 bg-white/70 p-4 shadow-sm">
          <h3 className="mb-3 text-sm font-semibold text-sk-ink">
            {brand.labels.payrollProfileHeading}
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1">
              <span className="text-xs text-sk-ink/60">
                {brand.labels.payrollHourlyGrossLabel}
              </span>
              <input
                className="rounded border px-2 py-1.5"
                inputMode="decimal"
                value={hourly}
                onChange={(e) => setHourly(e.target.value)}
                placeholder="0.00"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs text-sk-ink/60">
                {brand.labels.payrollWeeklyHoursKvgLabel}
              </span>
              <input
                className="rounded border px-2 py-1.5"
                inputMode="decimal"
                value={weeklyH}
                onChange={(e) => setWeeklyH(e.target.value)}
                placeholder="42"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs text-sk-ink/60">
                {brand.labels.payrollKvgAgeLabel}
              </span>
              <select
                className="rounded border px-2 py-1.5"
                value={kvgBand}
                onChange={(e) => setKvgBand(e.target.value as StaffKvgAgeBand)}
              >
                <option value="adult">{brand.labels.payrollKvgAgeAdult}</option>
                <option value="youth_16_20">{brand.labels.payrollKvgAgeYouth}</option>
              </select>
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs text-sk-ink/60">
                {brand.labels.payrollAhvNumberLabel}
              </span>
              <input
                className="rounded border px-2 py-1.5"
                value={ahv}
                onChange={(e) => setAhv(e.target.value)}
              />
            </label>
            <label className="flex flex-col gap-1 sm:col-span-2">
              <span className="text-xs text-sk-ink/60">
                {brand.labels.payrollNotesLabel}
              </span>
              <input
                className="rounded border px-2 py-1.5"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </label>
            <label className="flex items-center gap-2 sm:col-span-2">
              <input
                type="checkbox"
                checked={wht}
                onChange={(e) => setWht(e.target.checked)}
              />
              <span>{brand.labels.payrollApplyWhtLabel}</span>
            </label>
            <label className="flex items-start gap-2 sm:col-span-2">
              <input
                type="checkbox"
                checked={merkAck}
                onChange={(e) => setMerkAck(e.target.checked)}
                className="mt-1"
              />
              <span>{brand.labels.payrollMerkblattAckLabel}</span>
            </label>
          </div>
          <button
            type="button"
            disabled={saving || !userId}
            className="mt-4 rounded bg-sk-brand px-4 py-2 text-sm text-white disabled:opacity-50"
            onClick={async () => {
              setSaving(true);
              try {
                await fetchJson("/api/admin/staff-payroll-profile", {
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    userId,
                    grossHourlyRateChf: hourly.trim() || null,
                    weeklyHoursForKvg: weeklyH.trim() || null,
                    kvgAgeBand: kvgBand,
                    applyWht4pct: wht,
                    merkblattSmallEmploymentAck: merkAck,
                    ahvNumber: ahv.trim() || null,
                    notes: notes.trim() || null,
                  }),
                });
                showToast(brand.labels.payrollProfileSavedToast, "success");
                void mutProfile();
                void mutReport();
              } catch (e) {
                showToast(
                  getUiErrorInfo(e, brand.labels.payrollProfileSaveFailed).message,
                  "error"
                );
              } finally {
                setSaving(false);
              }
            }}
          >
            {brand.labels.payrollSaveProfile}
          </button>
        </div>
      ) : null}

      {report?.warnings?.length ? (
        <div
          className="rounded-lg border border-amber-200 bg-amber-50/90 px-3 py-2 text-xs text-amber-950"
          role="status"
        >
          <ul className="list-inside list-disc space-y-1">
            {report.warnings.map((w) => (
              <li key={w}>{w}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {report?.computation ? (
        <div className="space-y-3 rounded-xl border border-sk-ink/10 bg-white/80 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-sm font-semibold">{brand.labels.payrollPdfTitle}</h3>
            {pdfHref ? (
              <a
                href={pdfHref}
                className="rounded bg-gradient-to-r from-sk-cta to-sk-cta-mid px-3 py-1.5 text-xs font-medium text-white"
              >
                {brand.labels.payrollDownloadPdf}
              </a>
            ) : null}
          </div>
          <table className="w-full text-xs">
            <tbody className="divide-y divide-sk-ink/10">
              <tr>
                <td className="py-1 text-sk-ink/70">{brand.labels.monthlyHoursProductive}</td>
                <td className="py-1 text-right tabular-nums">
                  {formatMinutesAsDecimalHours(report.hours.productiveMinutes)} h
                </td>
              </tr>
              <tr>
                <td className="py-1 text-sk-ink/70">{brand.labels.monthlyHoursInternalTotal}</td>
                <td className="py-1 text-right tabular-nums">
                  {formatMinutesAsDecimalHours(report.hours.internalMinutesTotal)} h
                </td>
              </tr>
              <tr>
                <td className="py-1 font-medium">{brand.labels.monthlyHoursTotalWorked}</td>
                <td className="py-1 text-right font-medium tabular-nums">
                  {report.computation.totalDecimalHours} h
                </td>
              </tr>
              <tr>
                <td className="py-1 font-medium">{brand.labels.payrollRowGross}</td>
                <td className="py-1 text-right font-medium tabular-nums">
                  CHF {report.computation.grossChf}
                </td>
              </tr>
              <tr>
                <td className="py-1 text-sk-ink/75">
                  {brand.labels.payrollRowEmployeeSocial} (
                  {report.computation.employeeSocialPct}%)
                </td>
                <td className="py-1 text-right tabular-nums text-red-700">
                  − CHF {report.computation.employeeSocialChf}
                </td>
              </tr>
              <tr>
                <td className="py-1 text-sk-ink/75">{brand.labels.payrollRowWht}</td>
                <td className="py-1 text-right tabular-nums text-red-700">
                  − CHF {report.computation.withholdingTaxChf}
                </td>
              </tr>
              <tr>
                <td className="py-1 font-medium">{brand.labels.payrollRowNetApprox}</td>
                <td className="py-1 text-right font-semibold tabular-nums">
                  CHF {report.computation.netPayoutApproxChf}
                </td>
              </tr>
              <tr>
                <td className="py-1 text-sk-ink/75">
                  {brand.labels.payrollRowEmployerSocial} (
                  {report.computation.employerSocialPct}%)
                </td>
                <td className="py-1 text-right tabular-nums">
                  CHF {report.computation.employerSocialChf}
                </td>
              </tr>
              <tr>
                <td className="py-1 text-sk-ink/75">
                  {brand.labels.payrollRowKvgEmployerMonth}
                </td>
                <td className="py-1 text-right tabular-nums">
                  CHF {report.computation.employerKvgMonthlyChf}
                </td>
              </tr>
            </tbody>
          </table>
          <p className="text-[10px] text-sk-ink/55">{report.computation.ratesVersionLabel}</p>
        </div>
      ) : report && !report.computation ? (
        <p className="text-sm text-sk-ink/60">{brand.labels.payrollPdfNoComputation}</p>
      ) : !report && !reportError ? (
        <p className="text-sk-ink/50">{brand.labels.navSessionLoadingEllipsis}</p>
      ) : null}
    </div>
  );
}
