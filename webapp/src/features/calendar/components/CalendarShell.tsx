"use client";

import { endOfWeek, startOfWeek } from "date-fns";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { SlotInfo } from "react-big-calendar";
import useSWR from "swr";
import { useBookings } from "../hooks/useBookings";
import type { BookingWithDetailsDto } from "../types";
import { BookingCreateModal } from "./BookingCreateModal";
import { BookingDetailPanel } from "./BookingDetailPanel";
import { CalendarView } from "./CalendarView";
import { TeacherLegend, type TeacherLegendItem } from "./TeacherLegend";
import { brand } from "@/config/brand";
import { FetchJsonError, fetchJson } from "@/lib/client-fetch";

async function teachersFetcher(url: string): Promise<TeacherLegendItem[]> {
  try {
    return await fetchJson<TeacherLegendItem[]>(url);
  } catch (e) {
    const status = e instanceof FetchJsonError ? e.status : 0;
    throw new Error(
      e instanceof Error
        ? e.message
        : `${brand.labels.staffCollectivePlural}liste (${status})`
    );
  }
}

function normalizeRange(
  range: Date[] | { start: Date; end: Date }
): { start: Date; end: Date } {
  if (Array.isArray(range)) {
    if (range.length === 0) {
      const s = startOfWeek(new Date(), { weekStartsOn: 1 });
      return { start: s, end: endOfWeek(s, { weekStartsOn: 1 }) };
    }
    return { start: range[0], end: range[range.length - 1] };
  }
  return { start: range.start, end: range.end };
}

export function CalendarShell({
  userId,
  isAdmin,
}: {
  userId: string;
  isAdmin: boolean;
}) {
  const searchParams = useSearchParams();
  const prefillGuestId = searchParams.get("guestId");

  const [range, setRange] = useState<{ start: Date; end: Date }>(() => {
    const s = startOfWeek(new Date(), { weekStartsOn: 1 });
    return { start: s, end: endOfWeek(s, { weekStartsOn: 1 }) };
  });
  const [showAll, setShowAll] = useState(isAdmin);
  const [filterTeacherId, setFilterTeacherId] = useState<string | null>(null);
  const {
    data: teachers = [],
    error: teachersError,
    isLoading: teachersLoading,
  } = useSWR<TeacherLegendItem[]>("/api/teachers", teachersFetcher, {
    revalidateOnFocus: true,
    keepPreviousData: true,
  });
  const [selected, setSelected] = useState<BookingWithDetailsDto | null>(null);
  const [slot, setSlot] = useState<SlotInfo | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    if (teachers.length === 0) return;
    if (!isAdmin) {
      setFilterTeacherId(userId);
      return;
    }
    if (showAll) return;
    setFilterTeacherId((prev) => {
      if (prev && teachers.some((t) => t.id === prev)) return prev;
      return teachers[0].id;
    });
  }, [teachers, isAdmin, userId, showAll]);

  const effectiveTeacherId = useMemo(() => {
    if (isAdmin && showAll) return null;
    if (isAdmin && !showAll) return filterTeacherId;
    return userId;
  }, [isAdmin, showAll, filterTeacherId, userId]);

  const rangeForFetch =
    !isAdmin || (isAdmin && showAll) || (isAdmin && !showAll && filterTeacherId)
      ? range
      : null;

  const { bookings, mutate, isLoading, error } = useBookings(rangeForFetch, {
    isAdmin,
    showAll,
    teacherId: effectiveTeacherId,
  });

  const handleRangeChange = useCallback(
    (r: Date[] | { start: Date; end: Date }) => {
      setRange(normalizeRange(r));
    },
    []
  );

  const defaultTeacherForModal =
    (isAdmin && filterTeacherId) || userId || teachers[0]?.id || userId;

  return (
    <div className="flex flex-col gap-4">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <TeacherLegend teachers={teachers} />
        <div className="flex flex-col gap-2 text-sm text-sk-ink">
          {teachersLoading ? (
            <p className="text-sk-ink/60">
              {brand.labels.staffCollectiveListLoadingTemplate.replace(
                "{staffCollectivePlural}",
                brand.labels.staffCollectivePlural
              )}
            </p>
          ) : null}
          {teachersError ? (
            <p className="text-red-700" role="alert">
              {(teachersError as Error).message}
            </p>
          ) : null}
          {!teachersLoading && !teachersError && teachers.length === 0 ? (
            <p className="text-sk-ink/60">
              {brand.labels.staffListEmptyTemplate
                .replace("{staffPlural}", brand.labels.staffPlural)
                .replace(
                  "{staffCollectivePlural}",
                  brand.labels.staffCollectivePlural
                )
                .replace("{navAdmin}", brand.labels.navAdmin)}
            </p>
          ) : null}
          {isAdmin ? (
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={showAll}
                onChange={(e) => setShowAll(e.target.checked)}
              />
              {brand.labels.calendarFilterShowAllStaffTemplate.replace(
                "{staffCollectivePlural}",
                brand.labels.staffCollectivePlural
              )}
            </label>
          ) : null}
          {isAdmin && !showAll ? (
            <label className="flex flex-col gap-1">
              <span className="text-sk-ink/70">
                {brand.labels.calendarFilterTeacherByTemplate.replace(
                  "{staffSingular}",
                  brand.labels.staffSingular
                )}
              </span>
              <select
                className="max-w-xs rounded border border-sk-ink/20 px-2 py-2"
                value={filterTeacherId ?? ""}
                onChange={(e) => setFilterTeacherId(e.target.value || null)}
              >
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name ?? t.email}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
        </div>
      </header>

      {error ? (
        <p className="text-sm text-red-700" role="alert">
          {error.message}
        </p>
      ) : null}
      {isLoading && !bookings.length ? (
        <p className="text-sm text-sk-ink/60">
          Lade {brand.labels.appointmentPlural}…
        </p>
      ) : null}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px] lg:items-start">
        <CalendarView
          bookings={bookings}
          onRangeChange={handleRangeChange}
          onSelectEvent={(b) => {
            setSelected(b);
            setModalOpen(false);
            setSlot(null);
          }}
          onSelectSlot={(s) => {
            setSlot(s);
            setModalOpen(true);
            setSelected(null);
          }}
        />
        {selected ? (
          <div className="fixed inset-x-0 bottom-0 z-20 max-h-[55vh] overflow-y-auto rounded-t-xl border border-sk-ink/10 bg-white p-4 shadow-[0_-8px_30px_rgba(0,0,0,0.12)] lg:relative lg:max-h-none lg:rounded-none lg:border-l lg:shadow-none">
            <BookingDetailPanel
              booking={selected}
              isAdmin={isAdmin}
              onClose={() => setSelected(null)}
              onUpdated={(patch) => {
                void mutate();
                if (patch) setSelected(patch);
              }}
            />
          </div>
        ) : (
          <div className="hidden text-sm text-sk-ink/50 lg:block">
            {brand.labels.calendarPickAppointmentHintTemplate.replace(
              "{appointment}",
              brand.labels.appointmentSingular
            )}
          </div>
        )}
      </div>

      <BookingCreateModal
        open={modalOpen}
        slotStart={slot?.start ?? null}
        slotEnd={slot?.end ?? null}
        defaultTeacherId={defaultTeacherForModal}
        prefillGuestId={prefillGuestId}
        isAdmin={isAdmin}
        teachers={teachers}
        onClose={() => {
          setModalOpen(false);
          setSlot(null);
        }}
        onCreated={() => void mutate()}
      />
    </div>
  );
}
