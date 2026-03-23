import { NextResponse } from "next/server";
import { brand } from "@/config/brand";
import { requireAuthSession } from "@/lib/auth-helpers";
import { AppError } from "@/lib/errors";
import { patchInvoiceBodySchema } from "@/lib/validators/invoice";
import {
  cancelInvoice,
  canAccessInvoice,
  findById,
  markAsPaid,
} from "@/services/invoice.service";

export async function GET(
  _request: Request,
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
      return NextResponse.json(
        { error: brand.labels.apiForbidden },
        { status: 403 }
      );
    }
    return NextResponse.json(await findById(params.id));
  } catch (e) {
    if (e instanceof AppError) {
      return NextResponse.json({ error: e.message }, { status: e.statusCode });
    }
    throw e;
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
      return NextResponse.json(
        { error: brand.labels.apiForbidden },
        { status: 403 }
      );
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
    return NextResponse.json(
      { error: brand.labels.apiNothingToUpdate },
      { status: 400 }
    );
  } catch (e) {
    if (e instanceof AppError) {
      return NextResponse.json({ error: e.message }, { status: e.statusCode });
    }
    return NextResponse.json(
      { error: brand.labels.apiInvalidData },
      { status: 400 }
    );
  }
}
