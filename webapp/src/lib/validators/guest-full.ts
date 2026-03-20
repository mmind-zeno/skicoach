import { z } from "zod";

function optionalTrimmedString(max: number) {
  return z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? undefined : v),
    z.string().max(max).optional()
  );
}

function optionalEmail() {
  return z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? undefined : v),
    z.string().email().optional()
  );
}

export const updateGuestBodySchema = z.object({
  name: z.string().min(1).max(200).optional(),
  email: z.preprocess(
    (v) => (v === "" || v === null ? null : v),
    z.union([z.string().email(), z.null()]).optional()
  ),
  phone: z.preprocess(
    (v) => (v === "" || v === null ? null : v),
    z.union([z.string().max(40), z.null()]).optional()
  ),
  niveau: z.enum(["anfaenger", "fortgeschritten", "experte"]).optional(),
  language: optionalTrimmedString(10),
  notes: z.preprocess(
    (v) => (v === "" || v === null ? null : v),
    z.union([z.string(), z.null()]).optional()
  ),
  company: z.preprocess(
    (v) => (v === "" || v === null ? null : v),
    z.union([z.string().max(200), z.null()]).optional()
  ),
  crmSource: z.preprocess(
    (v) => (v === "" || v === null ? null : v),
    z.union([z.string().max(120), z.null()]).optional()
  ),
});

export const createGuestFullBodySchema = z.object({
  name: z.string().min(1).max(200),
  email: optionalEmail(),
  phone: optionalTrimmedString(40),
  niveau: z.enum(["anfaenger", "fortgeschritten", "experte"]).optional(),
  language: optionalTrimmedString(10),
  notes: optionalTrimmedString(10_000),
  company: optionalTrimmedString(200),
  crmSource: optionalTrimmedString(120),
});
