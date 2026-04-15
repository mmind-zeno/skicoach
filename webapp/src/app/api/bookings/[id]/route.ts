import { NextResponse } from "next/server";
import type { Session } from "next-auth";
import { brand } from "@/config/brand";
import { auth } from "@/lib/auth";
import { ForbiddenError, UnauthorizedError } from "@/lib/errors";
import { apiClientError, apiErrorResponse } from "@/lib/api-error";
import { updateBookingBodySchema } from "@/lib/validators/booking";
import { eq } from "drizzle-orm";
import { users } from "../../../../../drizzle/schema";
import { getDb } from "@/lib/db";
import { sendTeacherSubstitutionNotifications } from "@/lib/mail";
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
    const oldTeacherId = existing.teacherId;
    const updated = await updateBooking(id, body);
    if (
      session.user.role === "admin" &&
      body.teacherId &&
      body.teacherId !== oldTeacherId
    ) {
      const db = getDb();
      const [oldT, newT] = await Promise.all([
        db.query.users.findFirst({
          where: eq(users.id, oldTeacherId),
          columns: { email: true, name: true },
        }),
        db.query.users.findFirst({
          where: eq(users.id, body.teacherId),
          columns: { email: true, name: true },
        }),
      ]);
      void sendTeacherSubstitutionNotifications({
        guestEmail: updated.guest.email,
        guestName: updated.guest.name,
        oldTeacherEmail: oldT?.email ?? null,
        oldTeacherName: oldT?.name?.trim() || oldT?.email || "—",
        newTeacherEmail: newT?.email ?? null,
        newTeacherName: newT?.name?.trim() || newT?.email || "—",
        courseName: updated.courseType.name,
        date: updated.date,
        startTime: updated.startTime.slice(0, 5),
      });
    }
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
