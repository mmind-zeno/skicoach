import { NextResponse } from "next/server";
import { brand } from "@/config/brand";
import { verifyIcalFeedToken } from "@/lib/ical-feed-token";
import { findByTeacher } from "@/services/booking.service";
import type { BookingWithDetailsDto } from "@/features/calendar/types";

export const dynamic = "force-dynamic";

function calendarHostname(): string {
  const base = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (base) {
    try {
      return new URL(base).hostname || brand.siteDomain;
    } catch {
      /* fall through */
    }
  }
  return brand.siteDomain;
}

function formatIcsDateTime(dateYmd: string, timeHms: string): string {
  const d = dateYmd.replace(/-/g, "");
  const tRaw = timeHms.length >= 8 ? timeHms.slice(0, 8) : `${timeHms}:00`;
  const t = tRaw.replace(/:/g, "").slice(0, 6);
  return `${d}T${t}`;
}

function escapeIcsText(s: string): string {
  return s
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\n/g, "\\n");
}

function bookingLines(
  booking: BookingWithDetailsDto,
  domain: string
): string[] {
  const uid = `${booking.id}@${domain}`;
  const dtstamp =
    new Date().toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const summary = `${booking.guest.name} — ${booking.courseType.name}`.replace(
    /\n/g,
    " "
  );
  const start = formatIcsDateTime(booking.date, booking.startTime);
  const end = formatIcsDateTime(booking.date, booking.endTime);
  return [
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${dtstamp}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    `SUMMARY:${escapeIcsText(summary)}`,
    "END:VEVENT",
  ];
}

export async function GET(request: Request) {
  const token = new URL(request.url).searchParams.get("token") ?? "";
  const parsed = verifyIcalFeedToken(token);
  if (!parsed) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const from = new Date();
  const to = new Date();
  to.setUTCDate(to.getUTCDate() + 180);

  const rows = (await findByTeacher(parsed.userId, from, to)).filter(
    (b) => b.status !== "storniert"
  );
  const domain = calendarHostname();

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    `PRODID:-//${domain}//bookings//DE`,
    "CALSCALE:GREGORIAN",
    ...rows.flatMap((b) => bookingLines(b, domain)),
    "END:VCALENDAR",
  ];

  return new NextResponse(lines.join("\r\n"), {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Cache-Control": "private, max-age=300",
    },
  });
}
