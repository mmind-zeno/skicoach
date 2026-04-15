import { NextResponse } from "next/server";
import { brand } from "@/config/brand";
import { apiClientError, apiErrorResponse } from "@/lib/api-error";
import { verifyGuestPortalToken } from "@/lib/guest-portal-token";
import { guestCancelBooking } from "@/services/guest-portal.service";

export const dynamic = "force-dynamic";

function bearer(request: Request): string | null {
  const h = request.headers.get("authorization");
  if (!h?.toLowerCase().startsWith("bearer ")) return null;
  const t = h.slice(7).trim();
  return t || null;
}

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const token = bearer(request);
    if (!token) {
      return apiClientError(
        brand.labels.guestPortalInvalidToken,
        401,
        undefined,
        undefined,
        request
      );
    }
    let guestId: string;
    try {
      const v = await verifyGuestPortalToken(token);
      guestId = v.guestId;
    } catch {
      return apiClientError(
        brand.labels.guestPortalInvalidToken,
        401,
        undefined,
        undefined,
        request
      );
    }
    await guestCancelBooking(guestId, params.id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return apiErrorResponse(e, "POST .../guest-portal/bookings/[id]/cancel", {
      request,
    });
  }
}
