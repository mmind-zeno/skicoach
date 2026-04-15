import { NextResponse } from "next/server";
import { brand } from "@/config/brand";
import { apiClientError, apiErrorResponse } from "@/lib/api-error";
import { verifyGuestPortalToken } from "@/lib/guest-portal-token";
import {
  assertGuestOwnsInvoice,
} from "@/services/guest-portal.service";
import { generateInvoicePdfBuffer } from "@/services/pdf.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function bearer(request: Request): string | null {
  const h = request.headers.get("authorization");
  if (!h?.toLowerCase().startsWith("bearer ")) return null;
  const t = h.slice(7).trim();
  return t || null;
}

export async function GET(
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
    await assertGuestOwnsInvoice(guestId, params.id);
    const buf = await generateInvoicePdfBuffer(params.id);
    return new NextResponse(new Uint8Array(buf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="rechnung-${params.id}.pdf"`,
      },
    });
  } catch (e) {
    return apiErrorResponse(
      e,
      "GET /api/public/guest-portal/invoices/[id]/pdf",
      { request }
    );
  }
}
