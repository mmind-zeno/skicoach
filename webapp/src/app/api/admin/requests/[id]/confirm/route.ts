import { NextResponse } from "next/server";
import { writeAuditLog } from "@/lib/audit-log";
import { requireAdminSession } from "@/lib/auth-helpers";
import { AppError } from "@/lib/errors";
import { confirmRequest } from "@/services/booking-request.service";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await requireAdminSession();
  try {
    const json = await request.json();
    const teacherId = typeof json.teacherId === "string" ? json.teacherId : "";
    if (!teacherId) {
      return NextResponse.json({ error: "teacherId fehlt" }, { status: 400 });
    }
    const booking = await confirmRequest(
      params.id,
      teacherId,
      session.user.id
    );
    await writeAuditLog({
      actorUserId: session.user.id,
      action: "admin.booking_request.confirm",
      resource: params.id,
      metadata: { bookingId: booking.id, teacherId },
      request,
    });
    return NextResponse.json(booking);
  } catch (e) {
    if (e instanceof AppError) {
      return NextResponse.json({ error: e.message }, { status: e.statusCode });
    }
    return NextResponse.json({ error: "Fehler" }, { status: 400 });
  }
}
