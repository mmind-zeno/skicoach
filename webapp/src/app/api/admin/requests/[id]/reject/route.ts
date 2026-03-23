import { NextResponse } from "next/server";
import { brand } from "@/config/brand";
import { writeAuditLog } from "@/lib/audit-log";
import { requireAdminSession } from "@/lib/auth-helpers";
import { AppError } from "@/lib/errors";
import { rejectRequest } from "@/services/booking-request.service";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await requireAdminSession();
  try {
    const json = await request.json().catch(() => ({}));
    const reason =
      typeof json.reason === "string" ? json.reason : undefined;
    const r = await rejectRequest(params.id, reason);
    await writeAuditLog({
      actorUserId: session.user.id,
      action: "admin.booking_request.reject",
      resource: params.id,
      metadata: reason ? { reason } : null,
      request,
    });
    return NextResponse.json(r);
  } catch (e) {
    if (e instanceof AppError) {
      return NextResponse.json({ error: e.message }, { status: e.statusCode });
    }
    return NextResponse.json(
      { error: brand.labels.uiErrorGeneric },
      { status: 400 }
    );
  }
}
