import { NextResponse } from "next/server";
import { brand } from "@/config/brand";
import { requireAuthSession } from "@/lib/auth-helpers";
import { apiErrorResponse } from "@/lib/api-error";
import { createInvoiceBodySchema } from "@/lib/validators/invoice";
import { createFromBooking, findAll } from "@/services/invoice.service";

export async function GET(request: Request) {
  const session = await requireAuthSession();
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") ?? undefined;
  const guestId = searchParams.get("guestId") ?? undefined;
  try {
    if (session.user.role === "admin") {
      const teacherId = searchParams.get("teacherId") ?? undefined;
      const list = await findAll({ status, guestId, teacherId });
      return NextResponse.json(list);
    }
    const list = await findAll({
      status,
      guestId,
      teacherId: session.user.id,
    });
    return NextResponse.json(list);
  } catch (e) {
    return apiErrorResponse(e, "GET /api/invoices");
  }
}

export async function POST(request: Request) {
  await requireAuthSession();
  try {
    const json = await request.json();
    const body = createInvoiceBodySchema.parse(json);
    const inv = await createFromBooking(body.bookingId);
    return NextResponse.json(inv, { status: 201 });
  } catch (e) {
    return apiErrorResponse(e, "POST /api/invoices", {
      handleZod: true,
      badRequestMessage: brand.labels.apiInvalidData,
    });
  }
}
