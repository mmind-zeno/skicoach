import { NextResponse } from "next/server";
import { clientIp, rateLimitPublic } from "@/lib/public-rate-limit";
import { getDaySlots } from "@/services/availability.service";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const ip = clientIp(request);
  if (!rateLimitPublic(ip)) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }
  const { searchParams } = new URL(request.url);
  const courseTypeId = searchParams.get("courseTypeId");
  const date = searchParams.get("date");
  if (!courseTypeId || !date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json(
      { error: "courseTypeId und date (YYYY-MM-DD) erforderlich" },
      { status: 400 }
    );
  }
  const slots = await getDaySlots(courseTypeId, date);
  return NextResponse.json({ slots });
}
