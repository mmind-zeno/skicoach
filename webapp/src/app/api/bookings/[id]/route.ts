import { NextResponse } from "next/server";
import type { Session } from "next-auth";
import { brand } from "@/config/brand";
import { auth } from "@/lib/auth";
import { ForbiddenError, UnauthorizedError } from "@/lib/errors";
import { apiClientError, apiErrorResponse } from "@/lib/api-error";
import { updateBookingBodySchema } from "@/lib/validators/booking";
import {
  deleteBooking,
  findBookingById,
  updateBooking,
} from "@/services/booking.service";

export const dynamic = "force-dynamic";

function assertCanEdit(session: Session, teacherId: string) {
  const uid = session.user?.id;
  if (!uid) throw new UnauthorizedError();
  if (session.user!.role === "admin") return;
  if (uid !== teacherId) throw new ForbiddenError();
}

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return apiClientError(brand.labels.apiUnauthorized, 401, undefined, undefined, request);
  }
  const { id } = params;
  try {
    const booking = await findBookingById(id);
    assertCanEdit(session, booking.teacherId);
    return NextResponse.json(booking);
  } catch (e) {
    return apiErrorResponse(e, "GET /api/bookings/[id]", { request });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return apiClientError(brand.labels.apiUnauthorized, 401, undefined, undefined, request);
  }
  const { id } = params;
  try {
    const existing = await findBookingById(id);
    await assertCanEdit(session, existing.teacherId);
    const json = await request.json();
    const body = updateBookingBodySchema.parse(json);
    if (session.user.role !== "admin" && body.teacherId && body.teacherId !== session.user.id) {
      return apiClientError(brand.labels.apiForbidden, 403, undefined, undefined, request);
    }
    if (
      session.user.role !== "admin" &&
      (body.paymentStatus !== undefined || body.paymentExternalRef !== undefined)
    ) {
      return apiClientError(brand.labels.apiForbidden, 403, undefined, undefined, request);
    }
    const updated = await updateBooking(id, body);
    return NextResponse.json(updated);
  } catch (e) {
    return apiErrorResponse(e, "PATCH /api/bookings/[id]", {
      handleZod: true,
      badRequestMessage: brand.labels.apiInvalidData,
      request,
    });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return apiClientError(brand.labels.apiUnauthorized, 401, undefined, undefined, request);
  }
  const { id } = params;
  try {
    const existing = await findBookingById(id);
    assertCanEdit(session, existing.teacherId);
    await deleteBooking(id);
    return new NextResponse(null, { status: 204 });
  } catch (e) {
    return apiErrorResponse(e, "DELETE /api/bookings/[id]", { request });
  }
}
