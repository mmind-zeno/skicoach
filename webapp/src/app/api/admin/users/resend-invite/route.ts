import { NextResponse } from "next/server";
import { brand } from "@/config/brand";
import { writeAuditLog } from "@/lib/audit-log";
import { requireAdminSession } from "@/lib/auth-helpers";
import { AppError } from "@/lib/errors";
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
      return NextResponse.json(
        { error: brand.labels.apiAdminInviteRateLimited },
        { status: 429 }
      );
    }

    const json = await request.json();
    const email = typeof json.email === "string" ? json.email.trim().toLowerCase() : "";
    if (!email.includes("@")) {
      return NextResponse.json(
        { error: brand.labels.apiInvalidEmail },
        { status: 400 }
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
    if (e instanceof AppError) {
      return NextResponse.json({ error: e.message }, { status: e.statusCode });
    }
    return NextResponse.json(
      {
        error:
          e instanceof Error ? e.message : brand.labels.apiResendInviteFailed,
      },
      { status: 500 }
    );
  }
}
