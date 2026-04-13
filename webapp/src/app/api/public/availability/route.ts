import { NextResponse } from "next/server";
import { brand } from "@/config/brand";
import { apiClientError } from "@/lib/api-error";
import { clientIp, rateLimitPublic } from "@/lib/public-rate-limit";
import { getMonthAvailability } from "@/services/availability.service";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const ip = clientIp(request);
  if (!rateLimitPublic(ip)) {
    return apiClientError(brand.labels.apiTooManyRequests, 429, undefined, undefined, request);
  }
  const { searchParams } = new URL(request.url);
  const courseTypeId = searchParams.get("courseTypeId");
  const month = searchParams.get("month");
  if (!courseTypeId || !month || !/^\d{4}-\d{2}$/.test(month)) {
    return apiClientError(
      brand.labels.apiPublicAvailabilityParamsRequired,
      400,
      "INVALID_INPUT",
      undefined,
      request
    );
  }
  const [y, m] = month.split("-").map(Number);
  const availability = await getMonthAvailability(courseTypeId, y, m);
  return NextResponse.json({ availability });
}
