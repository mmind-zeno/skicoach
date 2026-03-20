import { NextResponse } from "next/server";
import { clientIp, rateLimitPublicBookingPost } from "@/lib/public-rate-limit";
import { publicBookingRequestSchema } from "@/lib/validators/public-request";
import { createPublicRequest } from "@/services/booking-request.service";
import { turnstileRequired, verifyTurnstileToken } from "@/lib/turnstile";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const ip = clientIp(request);
  if (!(await rateLimitPublicBookingPost(ip))) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }
  try {
    const json = await request.json();
    const body = publicBookingRequestSchema.parse(json);
    if (body.website) {
      return NextResponse.json({ success: true, requestId: "ignored" });
    }
    if (turnstileRequired()) {
      const ok = await verifyTurnstileToken(body.turnstileToken, ip);
      if (!ok) {
        return NextResponse.json(
          { error: "Sicherheitsprüfung fehlgeschlagen" },
          { status: 400 }
        );
      }
    }
    const row = await createPublicRequest({
      courseTypeId: body.courseTypeId,
      date: body.date,
      startTime: body.startTime,
      guestName: body.guestName,
      guestEmail: body.guestEmail,
      guestPhone: body.guestPhone || null,
      guestNiveau: body.guestNiveau,
      message: body.message || null,
    });
    return NextResponse.json({ success: true, requestId: row.id });
  } catch {
    return NextResponse.json({ error: "Ungültige Daten" }, { status: 400 });
  }
}
