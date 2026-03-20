import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth-helpers";
import { AppError } from "@/lib/errors";
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
    if (e instanceof AppError) {
      return NextResponse.json({ error: e.message }, { status: e.statusCode });
    }
    throw e;
  }
}
