import { z } from "zod";

function optionalEmail() {
  return z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? undefined : v),
    z.string().email().optional()
  );
}

function optionalTrimmedString(max: number) {
  return z.preprocess(
    (v) => (v === "" || v === null || v === undefined ? undefined : v),
    z.string().max(max).optional()
  );
}

export const createGuestBodySchema = z.object({
  name: z.string().min(1).max(200),
  email: optionalEmail(),
  phone: optionalTrimmedString(40),
});
