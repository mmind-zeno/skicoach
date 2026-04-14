import { NextResponse } from "next/server";
import { brand } from "@/config/brand";
import { requireAuthSession } from "@/lib/auth-helpers";
import { apiClientError, apiErrorResponse } from "@/lib/api-error";
import { canAccessInvoice } from "@/services/invoice.service";
import { generateInvoicePdfBuffer } from "@/services/pdf.service";

export const runtime = "nodejs";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await requireAuthSession();
  try {
    const ok = await canAccessInvoice(
      params.id,
      session.user.id,
      session.user.role
    );
    if (!ok) {
      return apiClientError(brand.labels.apiForbidden, 403, undefined, undefined, request);
    }
    const buf = await generateInvoicePdfBuffer(params.id);
    return new NextResponse(new Uint8Array(buf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="rechnung-${params.id}.pdf"`,
      },
    });
  } catch (e) {
    return apiErrorResponse(e, "GET /api/invoices/[id]/pdf", { request });
  }
}
