import { NextResponse } from "next/server";
import { brand } from "@/config/brand";
import { writeAuditLog } from "@/lib/audit-log";
import { requireAdminSession } from "@/lib/auth-helpers";
import { apiClientError, apiErrorResponse } from "@/lib/api-error";
import { resendTeacherMagicLink } from "@/lib/invite-magic-link";
import { consumeRateLimitBucket } from "@/lib/rate-limit-db";

export async function POST(request: Request) {
  const session = await requireAdminSession();
  try {
    let allowed = true;
    try {
      allowed = await consumeRateLimitBucket(
        `admin:resend_invite:${session.user.id}`,
        35,
        3_600_000
      );
    } catch {
      allowed = true;
    }
    if (!allowed) {
      return apiClientError(
        brand.labels.apiAdminInviteRateLimited,
        429,
        undefined,
        undefined,
        request
      );
    }

    const json = await request.json();
    const email = typeof json.email === "string" ? json.email.trim().toLowerCase() : "";
    if (!email.includes("@")) {
      return apiClientError(
        brand.labels.apiInvalidEmail,
        400,
        "INVALID_INPUT",
        undefined,
        request
      );
    }
    await resendTeacherMagicLink(email);
    await writeAuditLog({
      actorUserId: session.user.id,
      action: "admin.user.resend_invite",
      resource: email,
      request,
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    return apiErrorResponse(e, "POST /api/admin/users/resend-invite", { request });
  }
}
