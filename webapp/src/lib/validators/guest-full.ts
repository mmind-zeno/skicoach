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

function optionalNullableTrimmedString(max: number) {
  return z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? null : v),
    z.union([z.string().max(max), z.null()]).optional()
  );
}

function optionalNullableDateIso() {
  return z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? null : v),
    z.union([
        z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        z.null(),
      ])
      .optional()
  );
}

const guestGenderSchema = z.enum([
  "weiblich",
  "maennlich",
  "divers",
  "unbekannt",
]);

const preferredChannelSchema = z.enum([
  "email",
  "phone",
  "sms",
  "whatsapp",
]);

function optionalNullableGender() {
  return z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? null : v),
    z.union([guestGenderSchema, z.null()]).optional()
  );
}

function optionalNullableChannel() {
  return z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? null : v),
    z.union([preferredChannelSchema, z.null()]).optional()
  );
}

function optionalNullableInt(min: number, max: number) {
  return z.preprocess((v) => {
    if (v === "" || v === null || v === undefined) return null;
    return v;
  }, z.union([z.coerce.number().int().min(min).max(max), z.null()]).optional());
}

const crmProfileFields = {
  salutation: optionalNullableTrimmedString(40),
  street: optionalNullableTrimmedString(200),
  postalCode: optionalNullableTrimmedString(20),
  city: optionalNullableTrimmedString(120),
  country: optionalNullableTrimmedString(56),
  dateOfBirth: optionalNullableDateIso(),
  gender: optionalNullableGender(),
  nationality: optionalNullableTrimmedString(80),
  heightCm: optionalNullableInt(50, 260),
  weightKg: optionalNullableInt(20, 250),
  shoeSizeEu: optionalNullableTrimmedString(12),
  emergencyContactName: optionalNullableTrimmedString(120),
  emergencyContactPhone: optionalNullableTrimmedString(40),
  medicalNotes: optionalNullableTrimmedString(2000),
  preferredContactChannel: optionalNullableChannel(),
  marketingOptIn: z.boolean().optional(),
};

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
  ...crmProfileFields,
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
  salutation: optionalTrimmedString(40),
  street: optionalTrimmedString(200),
  postalCode: optionalTrimmedString(20),
  city: optionalTrimmedString(120),
  country: optionalTrimmedString(56),
  dateOfBirth: z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? undefined : v),
    z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()
  ),
  gender: z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? undefined : v),
    guestGenderSchema.optional()
  ),
  nationality: optionalTrimmedString(80),
  heightCm: z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? undefined : v),
    z.coerce.number().int().min(50).max(260).optional()
  ),
  weightKg: z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? undefined : v),
    z.coerce.number().int().min(20).max(250).optional()
  ),
  shoeSizeEu: optionalTrimmedString(12),
  emergencyContactName: optionalTrimmedString(120),
  emergencyContactPhone: optionalTrimmedString(40),
  medicalNotes: optionalTrimmedString(2000),
  preferredContactChannel: z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? undefined : v),
    preferredChannelSchema.optional()
  ),
  marketingOptIn: z.boolean().optional(),
});
