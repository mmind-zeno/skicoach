import { NextResponse } from "next/server";
import { brand } from "@/config/brand";
import { writeAuditLog } from "@/lib/audit-log";
import { requireAdminSession } from "@/lib/auth-helpers";
import { apiClientError, apiErrorResponse } from "@/lib/api-error";
import { confirmRequest } from "@/services/booking-request.service";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await requireAdminSession();
  try {
    const json = (await request.json().catch(() => null)) as unknown;
    const body =
      json && typeof json === "object" && json !== null
        ? (json as Record<string, unknown>)
        : {};
    const teacherId =
      typeof body.teacherId === "string" ? body.teacherId.trim() : "";
    if (!teacherId) {
      return apiClientError(
        brand.labels.apiAdminTeacherIdMissing,
        400,
        "INVALID_INPUT",
        undefined,
        request
      );
    }
    const booking = await confirmRequest(
      params.id,
      teacherId,
      session.user.id
    );
    await writeAuditLog({
      actorUserId: session.user.id,
      action: "admin.booking_request.confirm",
      resource: params.id,
      metadata: { bookingId: booking.id, teacherId },
      request,
    });
    return NextResponse.json(booking);
  } catch (e) {
    return apiErrorResponse(e, "POST /api/admin/requests/[id]/confirm", { request });
  }
}
