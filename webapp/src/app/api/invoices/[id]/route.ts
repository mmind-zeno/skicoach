import { NextResponse } from "next/server";
import { brand } from "@/config/brand";
import { requireAuthSession } from "@/lib/auth-helpers";
import { apiClientError, apiErrorResponse } from "@/lib/api-error";
import { patchInvoiceBodySchema } from "@/lib/validators/invoice";
import {
  cancelInvoice,
  canAccessInvoice,
  findById,
  markAsPaid,
} from "@/services/invoice.service";

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
    return NextResponse.json(await findById(params.id));
  } catch (e) {
    return apiErrorResponse(e, "GET /api/invoices/[id]", { request });
  }
}

export async function PATCH(
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
    const json = await request.json();
    const body = patchInvoiceBodySchema.parse(json);
    if (body.status === "bezahlt") {
      const inv = await markAsPaid(params.id);
      return NextResponse.json(inv);
    }
    if (body.status === "storniert") {
      const inv = await cancelInvoice(params.id);
      return NextResponse.json(inv);
    }
    return apiClientError(
      brand.labels.apiNothingToUpdate,
      400,
      "INVALID_INPUT",
      undefined,
      request
    );
  } catch (e) {
    return apiErrorResponse(e, "PATCH /api/invoices/[id]", {
      handleZod: true,
      badRequestMessage: brand.labels.apiInvalidData,
      request,
    });
  }
}
