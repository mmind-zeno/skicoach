"use client";

import { useCallback, useLayoutEffect, useMemo, useState } from "react";
import { Calendar, Views, type SlotInfo, type View } from "react-big-calendar";
import { brand } from "@/config/brand";
import { teacherCalendarStyle } from "@/lib/colors";
import { bookingDateTimesToRange } from "@/lib/datetime";
import { calendarCulture, calendarLocalizer } from "@/lib/locale";
import type {
  BookingWithDetailsDto,
  CalendarEventItem,
  CalendarOverlayResource,
} from "../types";
import "../calendar.css";

const messages = {
  next: brand.labels.calNext,
  previous: brand.labels.calPrevious,
  today: brand.labels.calToday,
  month: brand.labels.calMonth,
  week: brand.labels.calWeek,
  day: brand.labels.calDay,
  agenda: brand.labels.calAgenda,
  date: brand.labels.calDate,
  time: brand.labels.calTime,
  event: brand.labels.appointmentSingular,
  showMore: (total: number) =>
    `+${total} ${brand.labels.calShowMoreSuffix}`,
};

function toEvents(rows: BookingWithDetailsDto[]): CalendarEventItem[] {
  return rows.map((b) => {
    const { start, end } = bookingDateTimesToRange(
      b.date,
      b.startTime,
      b.endTime
    );
    return {
      id: b.id,
      title: `${b.guest.name} · ${b.courseType.name}`,
      start,
      end,
      resource: b,
    };
  });
}

function isOverlayResource(
  r: BookingWithDetailsDto | CalendarOverlayResource
): r is CalendarOverlayResource {
  return "kind" in r && (r.kind === "vacation" || r.kind === "block");
}

const minT = new Date(1972, 0, 1, 7, 0, 0);
const maxT = new Date(1972, 0, 1, 20, 0, 0);

export function CalendarView({
  bookings,
  overlayEvents = [],
  onSelectEvent,
  onSelectSlot,
  onRangeChange,
}: {
  bookings: BookingWithDetailsDto[];
  overlayEvents?: CalendarEventItem[];
  onSelectEvent: (b: BookingWithDetailsDto | CalendarOverlayResource) => void;
  onSelectSlot: (slot: SlotInfo) => void;
  onRangeChange: (
    range: Date[] | { start: Date; end: Date },
    view?: View
  ) => void;
}) {
  const [view, setView] = useState<View>(Views.WEEK);

  useLayoutEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(max-width: 767px)").matches) {
      setView(Views.DAY);
    }
  }, []);

  const events = useMemo(
    () => [...toEvents(bookings), ...overlayEvents],
    [bookings, overlayEvents]
  );

  const eventPropGetter = useCallback((event: CalendarEventItem) => {
    const r = event.resource;
    if (isOverlayResource(r)) {
      if (r.kind === "vacation") {
        return {
          style: {
            backgroundColor: "#fecdd3",
            borderColor: "#fb7185",
            color: "#881337",
            opacity: 0.88,
            borderRadius: "6px",
            borderStyle: "dashed",
            borderWidth: 2,
            fontWeight: 600,
            fontSize: "0.8rem",
          },
        };
      }
      const { backgroundColor } = teacherCalendarStyle(r.colorIndex);
      return {
        style: {
          backgroundColor: "#e2e8f0",
          borderColor: backgroundColor,
          color: "#1e293b",
          opacity: 0.82,
          borderRadius: "6px",
          borderStyle: "dotted",
          borderWidth: 2,
          fontWeight: 600,
          fontSize: "0.8rem",
        },
      };
    }
    const { backgroundColor, color } = teacherCalendarStyle(r.teacher.colorIndex);
    const cancelled = r.status === "storniert";
    return {
      style: {
        backgroundColor,
        borderColor: backgroundColor,
        color,
        opacity: cancelled ? 0.45 : 1,
        borderRadius: "8px",
      },
    };
  }, []);

  return (
    <div className="sk-calendar-host sk-surface-card h-[min(720px,calc(100dvh-12rem))] min-h-[min(480px,70dvh)] max-md:h-[min(640px,calc(100dvh-9rem))] max-md:min-h-[min(400px,55dvh)] p-3 md:p-4">
      <Calendar
        culture={calendarCulture}
        localizer={calendarLocalizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        titleAccessor="title"
        messages={messages}
        views={[Views.DAY, Views.WEEK, Views.MONTH, Views.AGENDA]}
        view={view}
        onView={setView}
        min={minT}
        max={maxT}
        scrollToTime={minT}
        selectable
        step={30}
        timeslots={2}
        eventPropGetter={eventPropGetter}
        onSelectEvent={(ev) => {
          onSelectEvent((ev as CalendarEventItem).resource);
        }}
        onSelectSlot={onSelectSlot}
        onRangeChange={onRangeChange}
      />
    </div>
  );
}
