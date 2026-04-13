import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth-helpers";
import { apiErrorResponse } from "@/lib/api-error";
import { findRequestById } from "@/services/booking-request.service";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  await requireAdminSession();
  try {
    const r = await findRequestById(params.id);
    return NextResponse.json(r);
  } catch (e) {
    return apiErrorResponse(e, "GET /api/admin/requests/[id]");
  }
}
