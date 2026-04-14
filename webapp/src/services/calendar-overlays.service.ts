import { and, gte, inArray, lte } from "drizzle-orm";
import {
  availabilityBlocks,
  staffVacationPeriods,
  staffWeeklyAvailability,
  users,
} from "../../drizzle/schema";
import {
  calendarDateFromStored,
  coerceSqlTimeForBooking,
  formatLocalDateISO,
  parseLocalDateOnly,
} from "../lib/datetime";
import { getDb } from "../lib/db";

export type CalendarOverlayKind = "vacation" | "block";

export interface CalendarOverlayDto {
  id: string;
  kind: CalendarOverlayKind;
  teacherId: string;
  teacherName: string;
  colorIndex: number;
  title: string;
  note: string | null;
  start: string;
  end: string;
}

export interface WeeklySummaryLineDto {
  teacherId: string;
  teacherName: string;
  colorIndex: number;
  lines: string[];
}

const CAL_DAY_START_H = 7;
const CAL_DAY_END_H = 20;

function dayWindowLocal(d: Date): { start: Date; end: Date } {
  return {
    start: new Date(d.getFullYear(), d.getMonth(), d.getDate(), CAL_DAY_START_H, 0, 0),
    end: new Date(d.getFullYear(), d.getMonth(), d.getDate(), CAL_DAY_END_H, 0, 0),
  };
}

function eachDateInclusive(from: Date, to: Date): Date[] {
  const out: Date[] = [];
  const cur = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const end = new Date(to.getFullYear(), to.getMonth(), to.getDate());
  while (cur <= end) {
    out.push(new Date(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return out;
}

const DAY_SHORT_DE = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
const DAY_SHORT_EN = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export async function getCalendarContext(
  dateFromStr: string,
  dateToStr: string,
  teacherIds: string[],
  locale: "de" | "en"
): Promise<{ overlays: CalendarOverlayDto[]; weeklySummaries: WeeklySummaryLineDto[] }> {
  const dateFrom = parseLocalDateOnly(dateFromStr);
  const dateTo = parseLocalDateOnly(dateToStr);
  if (dateFrom > dateTo) return { overlays: [], weeklySummaries: [] };
  if (teacherIds.length === 0) return { overlays: [], weeklySummaries: [] };

  const db = getDb();
  const dayLabels = locale === "en" ? DAY_SHORT_EN : DAY_SHORT_DE;

  const teachers = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      colorIndex: users.colorIndex,
    })
    .from(users)
    .where(inArray(users.id, teacherIds));

  const nameById = new Map(
    teachers.map((t) => [t.id, t.name?.trim() || t.email])
  );
  const colorById = new Map(teachers.map((t) => [t.id, t.colorIndex ?? 0]));

  const overlays: CalendarOverlayDto[] = [];

  const vacations = await db
    .select()
    .from(staffVacationPeriods)
    .where(
      and(
        inArray(staffVacationPeriods.userId, teacherIds),
        lte(staffVacationPeriods.startDate, dateTo),
        gte(staffVacationPeriods.endDate, dateFrom)
      )
    );

  for (const v of vacations) {
    const vs = calendarDateFromStored(v.startDate);
    const ve = calendarDateFromStored(v.endDate);
    const clipStart = vs > dateFrom ? vs : dateFrom;
    const clipEnd = ve < dateTo ? ve : dateTo;
    const teacherName = nameById.get(v.userId) ?? "";
    const colorIndex = colorById.get(v.userId) ?? 0;
    const vacLabel =
      locale === "en" ? `${teacherName} — time off` : `${teacherName} — Ferien`;
    for (const d of eachDateInclusive(clipStart, clipEnd)) {
      const { start, end } = dayWindowLocal(d);
      overlays.push({
        id: `vac-${v.id}-${formatLocalDateISO(d)}`,
        kind: "vacation",
        teacherId: v.userId,
        teacherName,
        colorIndex,
        title: v.note?.trim() ? `${vacLabel} (${v.note.trim()})` : vacLabel,
        note: v.note ?? null,
        start: start.toISOString(),
        end: end.toISOString(),
      });
    }
  }

  const blocks = await db
    .select()
    .from(availabilityBlocks)
    .where(
      and(
        inArray(availabilityBlocks.userId, teacherIds),
        gte(availabilityBlocks.blockDate, dateFrom),
        lte(availabilityBlocks.blockDate, dateTo)
      )
    );

  for (const b of blocks) {
    const bd = calendarDateFromStored(b.blockDate);
    const [sh, sm, ss] = coerceSqlTimeForBooking(b.startTime)
      .split(":")
      .map(Number);
    const [eh, em, es] = coerceSqlTimeForBooking(b.endTime)
      .split(":")
      .map(Number);
    const start = new Date(
      bd.getFullYear(),
      bd.getMonth(),
      bd.getDate(),
      sh,
      sm,
      ss || 0
    );
    const end = new Date(
      bd.getFullYear(),
      bd.getMonth(),
      bd.getDate(),
      eh,
      em,
      es || 0
    );
    const teacherName = nameById.get(b.userId) ?? "";
    const colorIndex = colorById.get(b.userId) ?? 0;
    const blockLabel =
      locale === "en" ? `${teacherName} — blocked` : `${teacherName} — gesperrt`;
    overlays.push({
      id: `blk-${b.id}`,
      kind: "block",
      teacherId: b.userId,
      teacherName,
      colorIndex,
      title: b.note?.trim() ? `${blockLabel} (${b.note})` : blockLabel,
      note: b.note ?? null,
      start: start.toISOString(),
      end: end.toISOString(),
    });
  }

  const windows = await db
    .select()
    .from(staffWeeklyAvailability)
    .where(inArray(staffWeeklyAvailability.userId, teacherIds));

  const weeklySummaries: WeeklySummaryLineDto[] = teacherIds.map((tid) => {
    const wRows = windows.filter((w) => w.userId === tid);
    const teacherName = nameById.get(tid) ?? "";
    const colorIndex = colorById.get(tid) ?? 0;
    if (wRows.length === 0) {
      return {
        teacherId: tid,
        teacherName,
        colorIndex,
        lines: [
          locale === "en"
            ? "Default portal grid 07:00–20:00"
            : "Standard-Portalraster 07:00–20:00",
        ],
      };
    }
    const sorted = [...wRows].sort(
      (a, b) =>
        a.dayOfWeek - b.dayOfWeek ||
        String(a.startTime).localeCompare(String(b.startTime))
    );
    const lines = sorted.map((w) => {
      const st = coerceSqlTimeForBooking(w.startTime).slice(0, 5);
      const en = coerceSqlTimeForBooking(w.endTime).slice(0, 5);
      return `${dayLabels[w.dayOfWeek - 1]} ${st}–${en}`;
    });
    return { teacherId: tid, teacherName, colorIndex, lines };
  });

  return { overlays, weeklySummaries };
}
