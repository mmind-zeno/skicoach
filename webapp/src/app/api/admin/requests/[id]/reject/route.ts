import { NextResponse } from "next/server";
import { writeAuditLog } from "@/lib/audit-log";
import { requireAdminSession } from "@/lib/auth-helpers";
import { apiErrorResponse } from "@/lib/api-error";
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
    return apiErrorResponse(e, "POST /api/admin/requests/[id]/reject");
  }
}
