"use client";

import { useAppToast } from "@/components/app-toast";
import { brand } from "@/config/brand";
import { fetchJson } from "@/lib/client-fetch";
import { getUiErrorInfo } from "@/lib/client-error-message";
import {
  formatMinutesAsDecimalHours,
  type MonthlyHoursReportDto,
  type StaffTimeLogCategory,
} from "@/services/monthly-hours-report.shared";
import { useSession } from "next-auth/react";
import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";

const CATEGORIES: StaffTimeLogCategory[] = [
  "buero_verwaltung",
  "vorbereitung",
  "meeting",
  "fortbildung",
  "sonstiges",
];

function categoryLabel(c: StaffTimeLogCategory): string {
  const L = brand.labels;
  const map: Record<StaffTimeLogCategory, string> = {
    buero_verwaltung: L.timeLogCategoryBueroVerwaltung,
    vorbereitung: L.timeLogCategoryVorbereitung,
    meeting: L.timeLogCategoryMeeting,
    fortbildung: L.timeLogCategoryFortbildung,
    sonstiges: L.timeLogCategorySonstiges,
  };
  return map[c];
}

function minutesToHm(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
}

function buildCsv(report: MonthlyHoursReportDto): string {
  const rows: string[][] = [
    ["Monatsreport", report.month],
    ["Person", report.teacher.name ?? "", report.teacher.email],
    [],
    [
      brand.labels.monthlyHoursProductive,
      formatMinutesAsDecimalHours(report.productiveMinutes),
    ],
  ];
  for (const c of CATEGORIES) {
    const m = report.internalByCategory[c];
    if (m > 0) {
      rows.push([categoryLabel(c), formatMinutesAsDecimalHours(m)]);
    }
  }
  rows.push(
    [
      brand.labels.monthlyHoursInternalTotal,
      formatMinutesAsDecimalHours(report.internalMinutesTotal),
    ],
    [
      brand.labels.monthlyHoursTotalWorked,
      formatMinutesAsDecimalHours(report.totalWorkedMinutes),
    ],
    [],
    [brand.labels.monthlyHoursBookingsDetail],
    [
      brand.labels.monthlyHoursDate,
      brand.labels.monthlyHoursTime,
      brand.labels.monthlyHoursGuest,
      brand.labels.monthlyHoursCourse,
      brand.labels.monthlyHoursDuration,
    ]
  );
  for (const b of report.bookingLines) {
    rows.push([
      b.date,
      `${b.startTime}-${b.endTime}`,
      b.guestName,
      b.courseName,
      minutesToHm(b.minutes),
    ]);
  }
  rows.push([], [brand.labels.monthlyHoursManualEntries]);
  rows.push([
    brand.labels.monthlyHoursDate,
    brand.labels.monthlyHoursCategory,
    brand.labels.monthlyHoursHoursAbbr,
    brand.labels.monthlyHoursNote,
  ]);
  for (const t of report.timeLogs) {
    rows.push([t.workDate, categoryLabel(t.category), t.hours, t.note ?? ""]);
  }
  return rows
    .map((r) =>
      r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
    )
    .join("\n");
}

type UserRow = {
  id: string;
  name: string | null;
  email: string;
  role: string;
  isActive: boolean;
};

export function MonthlyHoursReportPanel({ isAdmin }: { isAdmin: boolean }) {
  const { data: session } = useSession();
  const { showToast } = useAppToast();
  const [month, setMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });
  const [userId, setUserId] = useState("");
  const [err, setErr] = useState<string | null>(null);

  const [newDate, setNewDate] = useState("");
  const [newHours, setNewHours] = useState("1");
  const [newCategory, setNewCategory] =
    useState<StaffTimeLogCategory>("buero_verwaltung");
  const [newNote, setNewNote] = useState("");
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

  useEffect(() => {
    if (!month) return;
    const [y, mo] = month.split("-").map(Number);
    const d = new Date(y, mo - 1, 1);
    setNewDate(
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`
    );
  }, [month]);

  const reportUrl =
    userId && month
      ? `/api/monthly-hours-report?month=${encodeURIComponent(month)}&userId=${encodeURIComponent(userId)}`
      : null;

  const {
    data: report,
    error: reportError,
    mutate: mutReport,
    isLoading,
  } = useSWR(reportUrl, (url) => fetchJson<MonthlyHoursReportDto>(url), {
    keepPreviousData: true,
  });

  useEffect(() => {
    if (reportError) {
      setErr(getUiErrorInfo(reportError, brand.labels.monthlyHoursLoadError).message);
    } else {
      setErr(null);
    }
  }, [reportError]);

  return (
    <div className="space-y-6 text-sm text-sk-ink">
      <p className="text-sk-ink/75">{brand.labels.monthlyHoursReportIntro}</p>

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
            className="sk-field rounded border border-sk-ink/15 px-2 py-1.5"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
          />
        </label>
        {isAdmin ? (
          <label className="flex flex-col gap-1">
            <span className="text-xs text-sk-ink/60">
              {brand.labels.monthlyHoursSelectStaff}
            </span>
            <select
              className="sk-field max-w-xs rounded border border-sk-ink/15 px-2 py-1.5"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
            >
              {teachers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name || u.email}
                </option>
              ))}
            </select>
          </label>
        ) : null}
        <button
          type="button"
          className="rounded border border-sk-ink/20 px-3 py-1.5 text-sk-brand hover:bg-sk-ink/5 disabled:opacity-40"
          disabled={!report}
          onClick={() => {
            if (!report) return;
            const csv = buildCsv(report);
            const blob = new Blob([`\uFEFF${csv}`], {
              type: "text/csv;charset=utf-8",
            });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            const safe = (report.teacher.email || "report").replace(
              /[^a-z0-9@-]/gi,
              "_"
            );
            a.download = `stunden-${report.month}-${safe}.csv`;
            a.click();
            URL.revokeObjectURL(url);
          }}
        >
          {brand.labels.monthlyHoursExportCsv}
        </button>
      </div>

      {isLoading && !report ? (
        <p className="text-sk-ink/60">{brand.labels.uiLoadingEllipsis}</p>
      ) : null}

      {report ? (
        <>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg border border-sk-ink/10 bg-sk-surface/80 p-3">
              <div className="text-xs text-sk-ink/55">
                {brand.labels.monthlyHoursProductive}
              </div>
              <div className="mt-1 text-lg font-semibold tabular-nums">
                {formatMinutesAsDecimalHours(report.productiveMinutes)}{" "}
                {brand.labels.monthlyHoursHoursAbbr}
              </div>
              <div className="text-xs text-sk-ink/50">
                ({minutesToHm(report.productiveMinutes)})
              </div>
            </div>
            <div className="rounded-lg border border-sk-ink/10 bg-sk-surface/80 p-3">
              <div className="text-xs text-sk-ink/55">
                {brand.labels.monthlyHoursInternalTotal}
              </div>
              <div className="mt-1 text-lg font-semibold tabular-nums">
                {formatMinutesAsDecimalHours(report.internalMinutesTotal)}{" "}
                {brand.labels.monthlyHoursHoursAbbr}
              </div>
              <ul className="mt-2 space-y-0.5 text-xs text-sk-ink/65">
                {CATEGORIES.map((c) =>
                  report.internalByCategory[c] > 0 ? (
                    <li key={c}>
                      {categoryLabel(c)}:{" "}
                      {formatMinutesAsDecimalHours(report.internalByCategory[c])}{" "}
                      {brand.labels.monthlyHoursHoursAbbr}
                    </li>
                  ) : null
                )}
              </ul>
            </div>
            <div className="rounded-lg border border-sk-brand/25 bg-sk-brand/5 p-3">
              <div className="text-xs text-sk-ink/55">
                {brand.labels.monthlyHoursTotalWorked}
              </div>
              <div className="mt-1 text-lg font-semibold tabular-nums text-sk-brand">
                {formatMinutesAsDecimalHours(report.totalWorkedMinutes)}{" "}
                {brand.labels.monthlyHoursHoursAbbr}
              </div>
            </div>
          </div>

          <p className="text-xs text-sk-ink/55">
            {brand.labels.monthlyHoursCancelledBookings}:{" "}
            {report.cancelledBookingCount}
          </p>

          <div>
            <h3 className="mb-2 font-medium text-sk-ink">
              {brand.labels.monthlyHoursBookingsDetail}
            </h3>
            <div className="overflow-x-auto rounded border border-sk-ink/10">
              <table className="w-full min-w-[520px] text-left text-xs">
                <thead className="bg-sk-ink/5 text-sk-ink/65">
                  <tr>
                    <th className="px-2 py-2">{brand.labels.monthlyHoursDate}</th>
                    <th className="px-2 py-2">{brand.labels.monthlyHoursTime}</th>
                    <th className="px-2 py-2">{brand.labels.monthlyHoursGuest}</th>
                    <th className="px-2 py-2">{brand.labels.monthlyHoursCourse}</th>
                    <th className="px-2 py-2">{brand.labels.monthlyHoursDuration}</th>
                  </tr>
                </thead>
                <tbody>
                  {report.bookingLines.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-2 py-4 text-center text-sk-ink/50"
                      >
                        —
                      </td>
                    </tr>
                  ) : (
                    report.bookingLines.map((b) => (
                      <tr key={b.bookingId} className="border-t border-sk-ink/5">
                        <td className="px-2 py-1.5 tabular-nums">{b.date}</td>
                        <td className="px-2 py-1.5 tabular-nums">
                          {b.startTime}–{b.endTime}
                        </td>
                        <td className="px-2 py-1.5">{b.guestName}</td>
                        <td className="px-2 py-1.5">{b.courseName}</td>
                        <td className="px-2 py-1.5 tabular-nums">
                          {minutesToHm(b.minutes)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h3 className="mb-2 font-medium text-sk-ink">
              {brand.labels.monthlyHoursManualEntries}
            </h3>
            <div className="overflow-x-auto rounded border border-sk-ink/10">
              <table className="w-full min-w-[480px] text-left text-xs">
                <thead className="bg-sk-ink/5 text-sk-ink/65">
                  <tr>
                    <th className="px-2 py-2">{brand.labels.monthlyHoursDate}</th>
                    <th className="px-2 py-2">{brand.labels.monthlyHoursCategory}</th>
                    <th className="px-2 py-2">{brand.labels.monthlyHoursHoursAbbr}</th>
                    <th className="px-2 py-2">{brand.labels.monthlyHoursNote}</th>
                    <th className="px-2 py-2">{brand.labels.monthlyHoursActions}</th>
                  </tr>
                </thead>
                <tbody>
                  {report.timeLogs.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-2 py-4 text-center text-sk-ink/50"
                      >
                        —
                      </td>
                    </tr>
                  ) : (
                    report.timeLogs.map((t) => (
                      <tr key={t.id} className="border-t border-sk-ink/5">
                        <td className="px-2 py-1.5 tabular-nums">{t.workDate}</td>
                        <td className="px-2 py-1.5">{categoryLabel(t.category)}</td>
                        <td className="px-2 py-1.5 tabular-nums">{t.hours}</td>
                        <td className="px-2 py-1.5 text-sk-ink/75">
                          {t.note ?? "—"}
                        </td>
                        <td className="px-2 py-1.5">
                          <button
                            type="button"
                            className="text-red-600 underline"
                            onClick={async () => {
                              try {
                                await fetchJson(
                                  `/api/staff-time-log?id=${encodeURIComponent(t.id)}`,
                                  { method: "DELETE" }
                                );
                                void mutReport();
                                showToast(
                                  brand.labels.monthlyHoursDeletedToast,
                                  "success"
                                );
                              } catch (e) {
                                setErr(
                                  getUiErrorInfo(e, brand.labels.uiErrorGeneric)
                                    .message
                                );
                              }
                            }}
                          >
                            {brand.labels.monthlyHoursDelete}
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-3 flex flex-wrap items-end gap-2 rounded border border-sk-ink/10 bg-sk-surface/50 p-3">
              <input
                type="date"
                className="rounded border px-2 py-1"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
              />
              <input
                type="number"
                min={0.25}
                max={24}
                step={0.25}
                className="w-24 rounded border px-2 py-1 tabular-nums"
                value={newHours}
                onChange={(e) => setNewHours(e.target.value)}
              />
              <select
                className="rounded border px-2 py-1"
                value={newCategory}
                onChange={(e) =>
                  setNewCategory(e.target.value as StaffTimeLogCategory)
                }
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {categoryLabel(c)}
                  </option>
                ))}
              </select>
              <input
                type="text"
                className="min-w-[8rem] flex-1 rounded border px-2 py-1"
                placeholder={brand.labels.monthlyHoursNote}
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
              />
              <button
                type="button"
                disabled={saving || !userId || !newDate}
                className="rounded bg-gradient-to-r from-sk-cta to-sk-cta-mid px-3 py-1.5 text-white disabled:opacity-50"
                onClick={async () => {
                  const h = Number.parseFloat(newHours);
                  if (Number.isNaN(h) || h < 0.25 || h > 24) return;
                  setSaving(true);
                  setErr(null);
                  try {
                    await fetchJson("/api/staff-time-log", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        userId,
                        workDate: newDate,
                        hours: h,
                        category: newCategory,
                        note: newNote.trim() || null,
                      }),
                    });
                    setNewNote("");
                    void mutReport();
                    showToast(brand.labels.monthlyHoursSavedToast, "success");
                  } catch (e) {
                    setErr(
                      getUiErrorInfo(e, brand.labels.uiErrorGeneric).message
                    );
                  } finally {
                    setSaving(false);
                  }
                }}
              >
                {brand.labels.monthlyHoursAddEntry}
              </button>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
