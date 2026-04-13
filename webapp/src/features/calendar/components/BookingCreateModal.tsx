"use client";

import { addMinutes, format } from "date-fns";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAppToast } from "@/components/app-toast";
import { formatLocalDateISO } from "@/lib/datetime";
import { brand } from "@/config/brand";
import { fetchJson } from "@/lib/client-fetch";
import { getUiErrorMessage } from "@/lib/client-error-message";
import type { CourseTypeDto } from "../types";
import type { TeacherLegendItem } from "./TeacherLegend";

function toTimeApi(d: Date): string {
  return format(d, "HH:mm:ss");
}

export function BookingCreateModal({
  open,
  slotStart,
  slotEnd,
  defaultTeacherId,
  prefillGuestId,
  isAdmin,
  teachers,
  onClose,
  onCreated,
}: {
  open: boolean;
  slotStart: Date | null;
  slotEnd: Date | null;
  defaultTeacherId: string;
  prefillGuestId: string | null;
  isAdmin: boolean;
  teachers: TeacherLegendItem[];
  onClose: () => void;
  onCreated: () => void;
}) {
  const { showToast } = useAppToast();
  const [teacherId, setTeacherId] = useState(defaultTeacherId);
  const [guestQuery, setGuestQuery] = useState("");
  const [guestOptions, setGuestOptions] = useState<
    { id: string; name: string; email: string | null }[]
  >([]);
  const [guestId, setGuestId] = useState<string | null>(null);
  const [courseTypes, setCourseTypes] = useState<CourseTypeDto[]>([]);
  const [courseTypeId, setCourseTypeId] = useState<string>("");
  const [notes, setNotes] = useState("");
  const [priceOverride, setPriceOverride] = useState("");
  const [saving, setSaving] = useState(false);
  const [warn, setWarn] = useState<string | null>(null);
  const [guestSearchError, setGuestSearchError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setTeacherId(defaultTeacherId);
    setNotes("");
    setPriceOverride("");
    setWarn(null);
    setGuestSearchError(null);
    setGuestOptions([]);
    if (prefillGuestId) {
      void (async () => {
        try {
          const g = await fetchJson<{
            id: string;
            name: string;
            email: string | null;
          }>(`/api/guests/${prefillGuestId}`);
          setGuestId(g.id);
          setGuestQuery(
            g.email ? `${g.name} — ${g.email}` : g.name
          );
        } catch {
          setGuestQuery("");
          setGuestId(null);
          setWarn(brand.labels.bookingModalGuestPrefetchFailed);
        }
      })();
    } else {
      setGuestQuery("");
      setGuestId(null);
    }
  }, [open, defaultTeacherId, prefillGuestId]);

  useEffect(() => {
    if (!open) return;
    void (async () => {
      try {
        const data = await fetchJson<CourseTypeDto[]>("/api/course-types");
        setCourseTypes(data);
        setCourseTypeId((prev) =>
          prev && data.some((c) => c.id === prev) ? prev : data[0]?.id ?? ""
        );
      } catch {
        setCourseTypes([]);
        setCourseTypeId("");
        setWarn(brand.labels.bookingModalCourseTypesLoadFailed);
      }
    })();
  }, [open]);

  const selectedCourse = useMemo(
    () => courseTypes.find((c) => c.id === courseTypeId),
    [courseTypes, courseTypeId]
  );

  const computedEnd = useMemo(() => {
    if (!slotStart || !selectedCourse) return slotEnd;
    return addMinutes(slotStart, selectedCourse.durationMin);
  }, [slotStart, slotEnd, selectedCourse]);

  const searchGuests = useCallback(async (q: string) => {
    if (q.trim().length < 2) {
      setGuestOptions([]);
      setGuestSearchError(null);
      return;
    }
    try {
      const rows = await fetchJson<
        { id: string; name: string; email: string | null }[]
      >(
        `/api/guests?q=${encodeURIComponent(q.trim())}&limit=30`
      );
      setGuestOptions(rows);
      setGuestSearchError(null);
    } catch {
      setGuestOptions([]);
      setGuestSearchError(brand.labels.bookingModalGuestSearchFailed);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      void searchGuests(guestQuery);
    }, 280);
    return () => clearTimeout(t);
  }, [guestQuery, searchGuests]);

  async function createQuickGuest() {
    const name = guestQuery.trim();
    if (name.length < 2) {
      setWarn(
        brand.labels.bookingModalQuickGuestMinCharsTemplate.replace(
          "{client}",
          brand.labels.clientSingular
        )
      );
      return;
    }
    try {
      const g = await fetchJson<{ id: string }>("/api/guests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      setGuestId(g.id);
      setWarn(null);
    } catch {
      setWarn(
        brand.labels.bookingModalGuestCreateFailedTemplate.replace(
          "{client}",
          brand.labels.clientSingular
        )
      );
    }
  }

  async function submit() {
    if (!slotStart || !computedEnd) {
      setWarn(brand.labels.bookingModalInvalidSlot);
      return;
    }
    if (!guestId) {
      setWarn(
        brand.labels.bookingModalPickClientOrNewTemplate.replace(
          "{client}",
          brand.labels.clientSingular
        )
      );
      return;
    }
    if (!courseTypeId) {
      setWarn(
        brand.labels.bookingModalPickCourseTypeTemplate.replace(
          "{courseType}",
          brand.labels.serviceTypeSingular
        )
      );
      return;
    }
    setSaving(true);
    setWarn(null);
    try {
      const body = {
        teacherId,
        guestId,
        courseTypeId,
        date: formatLocalDateISO(slotStart),
        startTime: toTimeApi(slotStart),
        endTime: toTimeApi(computedEnd),
        notes: notes.trim() || undefined,
        priceCHF: priceOverride.trim() || undefined,
        source: "intern" as const,
      };
      await fetchJson("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      showToast(
        brand.labels.bookingCreatedToastTemplate.replace(
          "{appointmentSingular}",
          brand.labels.appointmentSingular
        ),
        "success"
      );
      onCreated();
      onClose();
    } catch (e) {
      setWarn(getUiErrorMessage(e, brand.labels.uiSaveFailed));
    } finally {
      setSaving(false);
    }
  }

  if (!open || !slotStart) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/35 p-4 sm:items-center">
      <div
        className="w-full max-w-md rounded-t-xl bg-white p-5 shadow-xl sm:rounded-xl"
        role="dialog"
        aria-labelledby="booking-create-title"
      >
        <h2 id="booking-create-title" className="text-lg font-semibold text-sk-ink">
          {brand.labels.bookingModalNewAppointmentTitleTemplate.replace(
            "{appointment}",
            brand.labels.appointmentSingular
          )}
        </h2>
        <p className="mt-1 text-sm text-sk-ink/70">
          {formatLocalDateISO(slotStart)} · {format(slotStart, "HH:mm")}–
          {format(computedEnd ?? slotStart, "HH:mm")}
        </p>

        <div className="mt-4 max-h-[60vh] space-y-3 overflow-y-auto">
          {isAdmin ? (
            <label className="block text-sm text-sk-ink">
              {brand.labels.staffSingular}
              <select
                className="mt-1 w-full rounded border border-sk-ink/20 px-2 py-2 text-sk-ink"
                value={teacherId}
                onChange={(e) => setTeacherId(e.target.value)}
              >
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name ?? t.email}
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          <label className="block text-sm text-sk-ink">
            {brand.labels.serviceTypeSingular}
            <select
              className="mt-1 w-full rounded border border-sk-ink/20 px-2 py-2 text-sk-ink"
              value={courseTypeId}
              onChange={(e) => setCourseTypeId(e.target.value)}
            >
              {courseTypes.map((c) => (
                <option key={c.id} value={c.id}>
                  {brand.labels.bookingModalCourseTypeOptionTemplate
                    .replace("{name}", c.name)
                    .replace("{durationMin}", String(c.durationMin))
                    .replace("{priceCHF}", c.priceCHF)}
                </option>
              ))}
            </select>
          </label>

          <div className="text-sm text-sk-ink">
            <span className="font-medium">{brand.labels.clientSingular}</span>
            <input
              type="search"
              className="mt-1 w-full rounded border border-sk-ink/20 px-2 py-2 text-sk-ink"
              placeholder={brand.labels.placeholderClientSearchModal}
              value={guestQuery}
              onChange={(e) => {
                setGuestQuery(e.target.value);
                setGuestId(null);
              }}
            />
            {guestId ? (
              <p className="mt-1 text-xs text-emerald-700">
                {brand.labels.bookingModalClientSelectedTemplate.replace(
                  "{client}",
                  brand.labels.clientSingular
                )}
              </p>
            ) : null}
            {guestSearchError ? (
              <p className="mt-1 text-xs text-red-600" role="alert">
                {guestSearchError}
              </p>
            ) : null}
            {guestOptions.length > 0 ? (
              <ul className="mt-1 max-h-32 overflow-auto rounded border border-sk-ink/10">
                {guestOptions.map((g) => (
                  <li key={g.id}>
                    <button
                      type="button"
                      className="w-full px-2 py-1.5 text-left text-sm hover:bg-sk-surface"
                      onClick={() => {
                        setGuestId(g.id);
                        setGuestQuery(g.name);
                        setGuestOptions([]);
                      }}
                    >
                      {g.name}
                      {g.email ? (
                        <span className="text-sk-ink/50"> — {g.email}</span>
                      ) : null}
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
            <button
              type="button"
              className="mt-2 text-xs font-medium text-sk-brand underline"
              onClick={() => void createQuickGuest()}
            >
              {brand.labels.bookingModalQuickCreateGuestTemplate.replace(
                "{client}",
                brand.labels.clientSingular
              )}
            </button>
          </div>

          <label className="block text-sm text-sk-ink">
            {brand.labels.fieldNotes}
            <textarea
              className="mt-1 w-full rounded border border-sk-ink/20 px-2 py-2 text-sk-ink"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </label>

          <label className="block text-sm text-sk-ink">
            {brand.labels.bookingModalPriceChfOptionalLabel}
            <input
              type="text"
              className="mt-1 w-full rounded border border-sk-ink/20 px-2 py-2 text-sk-ink"
              placeholder={selectedCourse?.priceCHF ?? ""}
              value={priceOverride}
              onChange={(e) => setPriceOverride(e.target.value)}
            />
          </label>
        </div>

        {warn ? (
          <p className="mt-3 text-sm text-red-700" role="alert">
            {warn}
          </p>
        ) : null}

        <div className="mt-5 flex justify-end gap-2 border-t border-sk-ink/10 pt-4">
          <button
            type="button"
            className="rounded px-3 py-2 text-sm text-sk-ink hover:bg-sk-surface"
            onClick={onClose}
          >
            {brand.labels.uiCancel}
          </button>
          <button
            type="button"
            disabled={saving}
            className="rounded bg-sk-brand px-3 py-2 text-sm font-medium text-white hover:bg-sk-hover disabled:opacity-50"
            onClick={() => void submit()}
          >
            {saving
              ? brand.labels.uiSaveInProgress
              : brand.labels.uiSave}
          </button>
        </div>
      </div>
    </div>
  );
}
