import { z } from "zod";

const timeRe = /^([01]?\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/;
const dateRe = /^\d{4}-\d{2}-\d{2}$/;

export const createBookingBodySchema = z.object({
  teacherId: z.string().uuid(),
  guestId: z.string().uuid(),
  courseTypeId: z.string().uuid(),
  date: z.string().regex(dateRe),
  startTime: z.string().regex(timeRe),
  endTime: z.string().regex(timeRe),
  notes: z.string().nullable().optional(),
  priceCHF: z.string().optional(),
  source: z.enum(["intern", "anfrage", "online"]).optional(),
});

export const updateBookingBodySchema = z.object({
  teacherId: z.string().uuid().optional(),
  guestId: z.string().uuid().optional(),
  courseTypeId: z.string().uuid().optional(),
  date: z.string().regex(dateRe).optional(),
  startTime: z.string().regex(timeRe).optional(),
  endTime: z.string().regex(timeRe).optional(),
  notes: z.string().nullable().optional(),
  priceCHF: z.string().optional(),
  status: z.enum(["geplant", "durchgefuehrt", "storniert"]).optional(),
  source: z.enum(["intern", "anfrage", "online"]).optional(),
});

export const listBookingsQuerySchema = z.object({
  dateFrom: z.string().regex(dateRe),
  dateTo: z.string().regex(dateRe),
  teacherId: z.string().uuid().optional(),
  all: z.enum(["0", "1"]).optional(),
});
