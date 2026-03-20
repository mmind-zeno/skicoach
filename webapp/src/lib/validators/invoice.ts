import { z } from "zod";

export const createInvoiceBodySchema = z.object({
  bookingId: z.string().uuid(),
});

export const patchInvoiceBodySchema = z.object({
  status: z.enum(["offen", "bezahlt", "storniert"]).optional(),
});
