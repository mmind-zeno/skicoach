"use client";

import { useCallback, useMemo } from "react";
import { Calendar, Views, type SlotInfo, type View } from "react-big-calendar";
import { brand } from "@/config/brand";
import { teacherCalendarStyle } from "@/lib/colors";
import { bookingDateTimesToRange } from "@/lib/datetime";
import { calendarCulture, calendarLocalizer } from "@/lib/locale";
import type { BookingWithDetailsDto, CalendarEventItem } from "../types";
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

const minT = new Date(1972, 0, 1, 7, 0, 0);
const maxT = new Date(1972, 0, 1, 20, 0, 0);

export function CalendarView({
  bookings,
  onSelectEvent,
  onSelectSlot,
  onRangeChange,
}: {
  bookings: BookingWithDetailsDto[];
  onSelectEvent: (b: BookingWithDetailsDto) => void;
  onSelectSlot: (slot: SlotInfo) => void;
  onRangeChange: (
    range: Date[] | { start: Date; end: Date },
    view?: View
  ) => void;
}) {
  const events = useMemo(() => toEvents(bookings), [bookings]);

  const eventPropGetter = useCallback((event: CalendarEventItem) => {
    const b = event.resource;
    const { backgroundColor, color } = teacherCalendarStyle(b.teacher.colorIndex);
    const cancelled = b.status === "storniert";
    return {
      style: {
        backgroundColor,
        borderColor: backgroundColor,
        color,
        opacity: cancelled ? 0.45 : 1,
        borderRadius: "4px",
      },
    };
  }, []);

  return (
    <div className="h-[min(720px,calc(100vh-220px))] min-h-[480px] rounded-lg border border-sk-ink/10 bg-white p-2 shadow-sm">
      <Calendar
        culture={calendarCulture}
        localizer={calendarLocalizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        titleAccessor="title"
        messages={messages}
        views={[Views.DAY, Views.WEEK, Views.MONTH]}
        defaultView={Views.WEEK}
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
