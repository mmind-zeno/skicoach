import { NextResponse } from "next/server";
import { brand } from "@/config/brand";
import { clientIp, rateLimitPublic } from "@/lib/public-rate-limit";
import { getMonthAvailability } from "@/services/availability.service";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const ip = clientIp(request);
  if (!rateLimitPublic(ip)) {
    return NextResponse.json(
      { error: brand.labels.apiTooManyRequests },
      { status: 429 }
    );
  }
  const { searchParams } = new URL(request.url);
  const courseTypeId = searchParams.get("courseTypeId");
  const month = searchParams.get("month");
  if (!courseTypeId || !month || !/^\d{4}-\d{2}$/.test(month)) {
    return NextResponse.json(
      { error: brand.labels.apiPublicAvailabilityParamsRequired },
      { status: 400 }
    );
  }
  const [y, m] = month.split("-").map(Number);
  const availability = await getMonthAvailability(courseTypeId, y, m);
  return NextResponse.json({ availability });
}
