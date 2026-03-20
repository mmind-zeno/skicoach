import { z } from "zod";

export const publicBookingRequestSchema = z.object({
  courseTypeId: z.string().uuid(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z.string().min(4).max(8),
  guestName: z.string().min(2).max(100),
  guestEmail: z.string().email(),
  guestPhone: z.string().max(40).optional().or(z.literal("")),
  guestNiveau: z.enum(["anfaenger", "fortgeschritten", "experte"]),
  message: z.string().max(500).optional().or(z.literal("")),
  website: z.string().max(200).optional().or(z.literal("")),
  turnstileToken: z.string().max(4000).optional().or(z.literal("")),
});
