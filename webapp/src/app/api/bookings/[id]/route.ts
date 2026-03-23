import { NextResponse } from "next/server";
import type { Session } from "next-auth";
import { brand } from "@/config/brand";
import { auth } from "@/lib/auth";
import { AppError, ForbiddenError, UnauthorizedError } from "@/lib/errors";
import { updateBookingBodySchema } from "@/lib/validators/booking";
import {
  deleteBooking,
  findBookingById,
  updateBooking,
} from "@/services/booking.service";

function assertCanEdit(session: Session, teacherId: string) {
  const uid = session.user?.id;
  if (!uid) throw new UnauthorizedError();
  if (session.user!.role === "admin") return;
  if (uid !== teacherId) throw new ForbiddenError();
}

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: brand.labels.apiUnauthorized },
      { status: 401 }
    );
  }
  const { id } = params;
  try {
    const booking = await findBookingById(id);
    assertCanEdit(session, booking.teacherId);
    return NextResponse.json(booking);
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
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: brand.labels.apiUnauthorized },
      { status: 401 }
    );
  }
  const { id } = params;
  try {
    const existing = await findBookingById(id);
    await assertCanEdit(session, existing.teacherId);
    const json = await request.json();
    const body = updateBookingBodySchema.parse(json);
    if (session.user.role !== "admin" && body.teacherId && body.teacherId !== session.user.id) {
      return NextResponse.json(
        { error: brand.labels.apiForbidden },
        { status: 403 }
      );
    }
    const updated = await updateBooking(id, body);
    return NextResponse.json(updated);
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

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: brand.labels.apiUnauthorized },
      { status: 401 }
    );
  }
  const { id } = params;
  try {
    const existing = await findBookingById(id);
    assertCanEdit(session, existing.teacherId);
    await deleteBooking(id);
    return new NextResponse(null, { status: 204 });
  } catch (e) {
    if (e instanceof AppError) {
      return NextResponse.json({ error: e.message }, { status: e.statusCode });
    }
    throw e;
  }
}
