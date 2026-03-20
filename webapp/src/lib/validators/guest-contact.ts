import { z } from "zod";

export const guestContactKindSchema = z.enum([
  "note",
  "call",
  "email",
  "meeting",
]);

export const createGuestContactBodySchema = z.object({
  kind: guestContactKindSchema.optional().default("note"),
  body: z.string().min(1).max(5000),
});
