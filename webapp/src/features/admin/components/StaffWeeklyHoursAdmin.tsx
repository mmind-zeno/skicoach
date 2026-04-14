"use client";

import { useAppToast } from "@/components/app-toast";
import { brand } from "@/config/brand";
import { fetchJson } from "@/lib/client-fetch";
import { getUiErrorInfo, type UiErrorInfo } from "@/lib/client-error-message";
import { useEffect, useMemo, useState } from "react";
import useSWR from "swr";

type UserRow = {
  id: string;
  name: string | null;
  email: string;
  role: string;
  isActive: boolean;
};

type WindowRow = {
  id?: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
};

type VacationRow = {
  id?: string;
  startDate: string;
  endDate: string;
  note: string;
};

function f<T>(url: string): Promise<T> {
  return fetchJson<T>(url);
}

function timeInputValue(isoOrHHmmss: string): string {
  const s = String(isoOrHHmmss).trim();
  const m = s.match(/^(\d{2}):(\d{2})/);
  return m ? `${m[1]}:${m[2]}` : "09:00";
}

function toApiTime(v: string): string {
  const t = v.trim();
  return t.length === 5 ? `${t}:00` : t;
}

export function StaffWeeklyHoursAdmin() {
  const { showToast } = useAppToast();
  const { data: users } = useSWR("/api/admin/users", f<UserRow[]>, {
    keepPreviousData: true,
  });

  const teachers = useMemo(
    () =>
      (users ?? []).filter(
        (u) => u.isActive && (u.role === "teacher" || u.role === "admin")
      ),
    [users]
  );

  const [userId, setUserId] = useState("");
  const [draft, setDraft] = useState<WindowRow[]>([]);
  const [err, setErr] = useState<UiErrorInfo | null>(null);
  const [saving, setSaving] = useState(false);
  const [vacDraft, setVacDraft] = useState<VacationRow[]>([]);
  const [savingVac, setSavingVac] = useState(false);

  const weekdayOptions = useMemo(() => {
    const isEn = brand.htmlLang === "en";
    const short = isEn
      ? ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
      : ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
    return short.map((label, i) => ({ day: i + 1, label }));
  }, []);

  const { data: loaded, mutate: reloadWindows } = useSWR(
    userId ? `/api/admin/staff-weekly-availability?userId=${encodeURIComponent(userId)}` : null,
    f<{ windows: { id: string; dayOfWeek: number; startTime: string; endTime: string }[] }>,
    { keepPreviousData: true }
  );

  const { data: loadedVac, mutate: reloadVacation } = useSWR(
    userId ? `/api/admin/staff-vacation?userId=${encodeURIComponent(userId)}` : null,
    f<{
      periods: { id: string; startDate: string; endDate: string; note: string | null }[];
    }>,
    { keepPreviousData: true }
  );

  useEffect(() => {
    if (!userId) {
      setDraft([]);
      return;
    }
    if (!loaded) return;
    setDraft(
      loaded.windows.map((w) => ({
        id: w.id,
        dayOfWeek: w.dayOfWeek,
        startTime: timeInputValue(w.startTime),
        endTime: timeInputValue(w.endTime),
      }))
    );
  }, [userId, loaded]);

  useEffect(() => {
    if (!userId) {
      setVacDraft([]);
      return;
    }
    if (!loadedVac) return;
    setVacDraft(
      loadedVac.periods.map((p) => ({
        id: p.id,
        startDate: p.startDate,
        endDate: p.endDate,
        note: p.note ?? "",
      }))
    );
  }, [userId, loadedVac]);

  if (!users) {
    return (
      <p className="text-sm text-sk-ink/60">{brand.labels.adminUserListLoading}</p>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-sk-ink/70">{brand.labels.adminWeeklyHoursHelp}</p>

      {err ? (
        <p className="text-sm text-red-600" role="alert">
          {err.message}
          {err.requestId ? (
            <span className="block text-xs text-red-700/80">Ref: {err.requestId}</span>
          ) : null}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        <label className="text-sm text-sk-ink/80">
          {brand.labels.adminWeeklyHoursStaffLabel}
          <select
            className="ml-2 rounded border border-sk-ink/15 px-2 py-1.5 text-sk-ink"
            value={userId}
            onChange={(e) => {
              setUserId(e.target.value);
              setErr(null);
            }}
          >
            <option value="">{brand.labels.adminSelectStaffPlaceholder}</option>
            {teachers.map((u) => (
              <option key={u.id} value={u.id}>
                {u.name || u.email}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          className="rounded border border-sk-ink/20 px-2 py-1 text-xs text-sk-brand hover:bg-sk-ink/5"
          disabled={!userId}
          onClick={() => {
            setDraft((d) => [
              ...d,
              { dayOfWeek: 1, startTime: "09:00", endTime: "12:00" },
            ]);
          }}
        >
          {brand.labels.adminWeeklyHoursAddRow}
        </button>
      </div>

      {!userId ? null : !loaded ? (
        <p className="text-sm text-sk-ink/60">{brand.labels.uiLoadingEllipsis}</p>
      ) : draft.length === 0 ? (
        <p className="text-sm text-sk-ink/60">{brand.labels.adminWeeklyHoursEmptyHint}</p>
      ) : (
        <ul className="space-y-2 text-sm">
          {draft.map((row, idx) => (
            <li
              key={`${row.id ?? "new"}-${idx}`}
              className="flex flex-wrap items-center gap-2 rounded border border-sk-ink/10 px-2 py-2"
            >
              <select
                className="rounded border px-1 py-1"
                value={row.dayOfWeek}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setDraft((d) =>
                    d.map((x, i) => (i === idx ? { ...x, dayOfWeek: v } : x))
                  );
                }}
              >
                {weekdayOptions.map((o) => (
                  <option key={o.day} value={o.day}>
                    {o.label}
                  </option>
                ))}
              </select>
              <input
                type="time"
                className="rounded border px-1 py-1"
                value={row.startTime}
                onChange={(e) => {
                  const v = e.target.value;
                  setDraft((d) =>
                    d.map((x, i) => (i === idx ? { ...x, startTime: v } : x))
                  );
                }}
              />
              <span className="text-sk-ink/40">–</span>
              <input
                type="time"
                className="rounded border px-1 py-1"
                value={row.endTime}
                onChange={(e) => {
                  const v = e.target.value;
                  setDraft((d) =>
                    d.map((x, i) => (i === idx ? { ...x, endTime: v } : x))
                  );
                }}
              />
              <button
                type="button"
                className="ml-auto text-xs text-red-600 underline"
                onClick={() => setDraft((d) => d.filter((_, i) => i !== idx))}
              >
                {brand.labels.adminWeeklyHoursRemoveRow}
              </button>
            </li>
          ))}
        </ul>
      )}

      {userId && loaded ? (
        <button
          type="button"
          disabled={saving}
          className="rounded bg-gradient-to-r from-sk-cta to-sk-cta-mid px-4 py-2 text-sm text-white shadow-sm transition hover:from-sk-cta-hover hover:to-sk-cta-mid disabled:opacity-50"
          onClick={async () => {
            setErr(null);
            setSaving(true);
            try {
              await fetchJson("/api/admin/staff-weekly-availability", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  userId,
                  windows: draft.map((w) => ({
                    dayOfWeek: w.dayOfWeek,
                    startTime: toApiTime(w.startTime),
                    endTime: toApiTime(w.endTime),
                  })),
                }),
              });
              void reloadWindows();
              showToast(brand.labels.adminWeeklyHoursSavedToast, "success");
            } catch (e) {
              setErr(getUiErrorInfo(e, brand.labels.adminWeeklyHoursSaveFailed));
            } finally {
              setSaving(false);
            }
          }}
        >
          {brand.labels.adminWeeklyHoursSave}
        </button>
      ) : null}

      <hr className="border-sk-ink/10" />

      <div className="space-y-3">
        <h3 className="text-sm font-medium text-sk-ink">
          {brand.labels.adminVacationSectionTitle}
        </h3>
        <p className="text-sm text-sk-ink/70">{brand.labels.adminVacationHelp}</p>

        {!userId ? null : !loadedVac ? (
          <p className="text-sm text-sk-ink/60">{brand.labels.uiLoadingEllipsis}</p>
        ) : vacDraft.length === 0 ? (
          <p className="text-sm text-sk-ink/60">{brand.labels.adminVacationEmptyHint}</p>
        ) : (
          <ul className="space-y-2 text-sm">
            {vacDraft.map((row, idx) => (
              <li
                key={`${row.id ?? "v"}-${idx}`}
                className="flex flex-wrap items-center gap-2 rounded border border-sk-ink/10 px-2 py-2"
              >
                <input
                  type="date"
                  className="rounded border px-1 py-1"
                  value={row.startDate}
                  onChange={(e) => {
                    const v = e.target.value;
                    setVacDraft((d) =>
                      d.map((x, i) => (i === idx ? { ...x, startDate: v } : x))
                    );
                  }}
                />
                <span className="text-sk-ink/40">–</span>
                <input
                  type="date"
                  className="rounded border px-1 py-1"
                  value={row.endDate}
                  onChange={(e) => {
                    const v = e.target.value;
                    setVacDraft((d) =>
                      d.map((x, i) => (i === idx ? { ...x, endDate: v } : x))
                    );
                  }}
                />
                <input
                  type="text"
                  className="min-w-[8rem] flex-1 rounded border px-2 py-1"
                  placeholder={brand.labels.adminVacationNotePlaceholder}
                  value={row.note}
                  onChange={(e) => {
                    const v = e.target.value;
                    setVacDraft((d) =>
                      d.map((x, i) => (i === idx ? { ...x, note: v } : x))
                    );
                  }}
                />
                <button
                  type="button"
                  className="ml-auto text-xs text-red-600 underline"
                  onClick={() => setVacDraft((d) => d.filter((_, i) => i !== idx))}
                >
                  {brand.labels.adminVacationRemoveRow}
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="rounded border border-sk-ink/20 px-2 py-1 text-xs text-sk-brand hover:bg-sk-ink/5"
            disabled={!userId}
            onClick={() => {
              const today = new Date();
              const y = today.getFullYear();
              const m = String(today.getMonth() + 1).padStart(2, "0");
              const d = String(today.getDate()).padStart(2, "0");
              const iso = `${y}-${m}-${d}`;
              setVacDraft((rows) => [
                ...rows,
                { startDate: iso, endDate: iso, note: "" },
              ]);
            }}
          >
            {brand.labels.adminVacationAddRow}
          </button>
        </div>

        {userId && loadedVac ? (
          <button
            type="button"
            disabled={savingVac}
            className="rounded bg-gradient-to-r from-sk-cta to-sk-cta-mid px-4 py-2 text-sm text-white shadow-sm transition hover:from-sk-cta-hover hover:to-sk-cta-mid disabled:opacity-50"
            onClick={async () => {
              setErr(null);
              setSavingVac(true);
              try {
                await fetchJson("/api/admin/staff-vacation", {
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    userId,
                    periods: vacDraft.map((p) => ({
                      startDate: p.startDate,
                      endDate: p.endDate,
                      note: p.note.trim() || null,
                    })),
                  }),
                });
                void reloadVacation();
                showToast(brand.labels.adminVacationSavedToast, "success");
              } catch (e) {
                setErr(getUiErrorInfo(e, brand.labels.adminVacationSaveFailed));
              } finally {
                setSavingVac(false);
              }
            }}
          >
            {brand.labels.adminVacationSave}
          </button>
        ) : null}
      </div>
    </div>
  );
}
