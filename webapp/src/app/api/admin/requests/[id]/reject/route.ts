import { NextResponse } from "next/server";
import { brand } from "@/config/brand";
import { writeAuditLog } from "@/lib/audit-log";
import { requireAdminSession } from "@/lib/auth-helpers";
import { apiClientError, apiErrorResponse } from "@/lib/api-error";
import { isUuid } from "@/lib/validators/uuid";
import { rejectRequest } from "@/services/booking-request.service";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await requireAdminSession();
  try {
    const requestId = params.id?.trim() ?? "";
    if (!isUuid(requestId)) {
      return apiClientError(
        brand.labels.apiInvalidData,
        400,
        "INVALID_INPUT",
        undefined,
        request
      );
    }
    const raw = await request.json().catch(() => null);
    const json =
      raw && typeof raw === "object" && raw !== null
        ? (raw as Record<string, unknown>)
        : {};
    const reason =
      typeof json.reason === "string" ? json.reason : undefined;
    const r = await rejectRequest(requestId, reason);
    await writeAuditLog({
      actorUserId: session.user.id,
      action: "admin.booking_request.reject",
      resource: requestId,
      metadata: reason ? { reason } : null,
      request,
    });
    return NextResponse.json(r);
  } catch (e) {
    return apiErrorResponse(e, "POST /api/admin/requests/[id]/reject", {
      request,
    });
  }
}
