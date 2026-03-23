import { NextResponse } from "next/server";
import { brand } from "@/config/brand";
import { requireAuthSession } from "@/lib/auth-helpers";
import { AppError } from "@/lib/errors";
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
    if (e instanceof AppError) {
      return NextResponse.json({ error: e.message }, { status: e.statusCode });
    }
    throw e;
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
    if (e instanceof AppError) {
      return NextResponse.json({ error: e.message }, { status: e.statusCode });
    }
    return NextResponse.json(
      { error: brand.labels.apiInvalidData },
      { status: 400 }
    );
  }
}
