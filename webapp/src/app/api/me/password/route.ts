import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { users } from "../../../../../drizzle/schema";
import { brand } from "@/config/brand";
import { apiClientError, apiErrorResponse } from "@/lib/api-error";
import { requireAuthSession } from "@/lib/auth-helpers";
import { getDb } from "@/lib/db";
import {
  PASSWORD_MIN_LENGTH,
  hashPassword,
  verifyPassword,
} from "@/lib/password-hash";

export const dynamic = "force-dynamic";

export async function PATCH(request: Request) {
  const session = await requireAuthSession();
  try {
    const json = (await request.json()) as Record<string, unknown>;
    const newPassword =
      typeof json.newPassword === "string" ? json.newPassword : "";
    const confirmPassword =
      typeof json.confirmPassword === "string" ? json.confirmPassword : "";
    const currentPassword =
      typeof json.currentPassword === "string" ? json.currentPassword : "";

    if (newPassword.length < PASSWORD_MIN_LENGTH) {
      return apiClientError(
        brand.labels.accountPasswordTooShort,
        400,
        "PASSWORD_TOO_SHORT",
        undefined,
        request
      );
    }
    if (newPassword !== confirmPassword) {
      return apiClientError(
        brand.labels.accountPasswordMismatch,
        400,
        "PASSWORD_MISMATCH",
        undefined,
        request
      );
    }

    const db = getDb();
    const row = await db.query.users.findFirst({
      where: eq(users.id, session.user.id),
      columns: { passwordHash: true },
    });

    if (row?.passwordHash) {
      if (!currentPassword) {
        return apiClientError(
          brand.labels.accountPasswordCurrentRequired,
          400,
          "CURRENT_PASSWORD_REQUIRED",
          undefined,
          request
        );
      }
      const ok = await verifyPassword(currentPassword, row.passwordHash);
      if (!ok) {
        return apiClientError(
          brand.labels.accountPasswordCurrentWrong,
          400,
          "CURRENT_PASSWORD_WRONG",
          undefined,
          request
        );
      }
    }

    const passwordHash = await hashPassword(newPassword);
    await db
      .update(users)
      .set({ passwordHash })
      .where(eq(users.id, session.user.id));

    return NextResponse.json({ ok: true });
  } catch (e) {
    return apiErrorResponse(e, "PATCH /api/me/password", {
      fallbackMessage: brand.labels.uiSaveFailed,
      request,
    });
  }
}
