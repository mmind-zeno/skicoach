import {
  addMinutes,
  eachDayOfInterval,
  endOfMonth,
  format,
  startOfMonth,
} from "date-fns";
import { and, eq } from "drizzle-orm";
import { courseTypes, users } from "../../drizzle/schema";
import { parseLocalDateOnly, formatLocalDateISO } from "../lib/datetime";
import { getDb } from "../lib/db";
import { checkAvailability } from "./booking.service";

export type DayAvailability = "free" | "partial" | "full" | "past";

function padTime(d: Date): string {
  return format(d, "HH:mm:ss");
}

/** Raster in Minuten für Tages-Slots */
const SLOT_STEP_MIN = 30;

/**
 * Für jeden Kalendertag im Monat grobe Verfügbarkeit (mind. ein Lehrer / Kursdauer).
 * `partial` = mindestens ein Slot möglich, aber nicht den ganzen Tag frei.
 */
export async function getMonthAvailability(
  courseTypeId: string,
  year: number,
  month: number
): Promise<Record<string, DayAvailability>> {
  const db = getDb();
  const course = await db.query.courseTypes.findFirst({
    where: eq(courseTypes.id, courseTypeId),
  });
  if (!course) return {};

  const teachers = await db.query.users.findMany({
    where: and(eq(users.role, "teacher"), eq(users.isActive, true)),
  });
  if (teachers.length === 0) return {};

  const monthStart = startOfMonth(new Date(year, month - 1, 1));
  const monthEnd = endOfMonth(monthStart);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const out: Record<string, DayAvailability> = {};
  for (const day of eachDayOfInterval({
    start: monthStart,
    end: monthEnd,
  })) {
    const key = formatLocalDateISO(day);
    if (day < today) {
      out[key] = "past";
      continue;
    }
    const slots = await getDaySlotsInternal(
      course.durationMin,
      day,
      teachers.map((t) => t.id)
    );
    const avail = slots.filter((s) => s.available).length;
    if (avail === 0) out[key] = "full";
    else if (avail === slots.length) out[key] = "free";
    else out[key] = "partial";
  }
  return out;
}

export async function getDaySlots(
  courseTypeId: string,
  dateIso: string
): Promise<Array<{ time: string; available: boolean }>> {
  const db = getDb();
  const course = await db.query.courseTypes.findFirst({
    where: eq(courseTypes.id, courseTypeId),
  });
  if (!course) return [];

  const teachers = await db.query.users.findMany({
    where: and(eq(users.role, "teacher"), eq(users.isActive, true)),
  });
  const day = parseLocalDateOnly(dateIso);
  return getDaySlotsInternal(course.durationMin, day, teachers.map((t) => t.id));
}

async function getDaySlotsInternal(
  durationMin: number,
  day: Date,
  teacherIds: string[]
): Promise<Array<{ time: string; available: boolean }>> {
  const slots: Array<{ time: string; available: boolean }> = [];
  const base = new Date(
    day.getFullYear(),
    day.getMonth(),
    day.getDate(),
    7,
    0,
    0,
    0
  );
  const lastStart = new Date(
    day.getFullYear(),
    day.getMonth(),
    day.getDate(),
    20,
    0,
    0,
    0
  );

  for (let t = base; t <= lastStart; t = addMinutes(t, SLOT_STEP_MIN)) {
    const end = addMinutes(t, durationMin);
    if (
      end.getHours() > 20 ||
      (end.getHours() === 20 && end.getMinutes() > 0)
    ) {
      break;
    }
    const startStr = padTime(t);
    const endStr = padTime(end);
    let available = false;
    for (const tid of teacherIds) {
      if (await checkAvailability(tid, day, startStr, endStr)) {
        available = true;
        break;
      }
    }
    slots.push({
      time: format(t, "HH:mm"),
      available,
    });
  }
  return slots;
}
