"use client";

import { useCallback, useMemo } from "react";
import {
  Calendar,
  dateFnsLocalizer,
  Views,
  type SlotInfo,
  type View,
} from "react-big-calendar";
import { format, getDay, startOfWeek } from "date-fns";
import { de } from "date-fns/locale";
import { teacherCalendarStyle } from "@/lib/colors";
import { bookingDateTimesToRange } from "@/lib/datetime";
import type { BookingWithDetailsDto, CalendarEventItem } from "../types";
import "../calendar.css";

const localizer = dateFnsLocalizer({
  format,
  startOfWeek: (d: Date) => startOfWeek(d, { weekStartsOn: 1 }),
  getDay,
  locales: { de },
});

const messages = {
  next: "Weiter",
  previous: "Zurück",
  today: "Heute",
  month: "Monat",
  week: "Woche",
  day: "Tag",
  agenda: "Agenda",
  date: "Datum",
  time: "Zeit",
  event: "Termin",
  showMore: (total: number) => `+${total} mehr`,
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
        culture="de"
        localizer={localizer}
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
