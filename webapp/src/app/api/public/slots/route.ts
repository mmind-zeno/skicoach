import { NextResponse } from "next/server";
import { brand } from "@/config/brand";
import { apiClientError } from "@/lib/api-error";
import { clientIp, rateLimitPublic } from "@/lib/public-rate-limit";
import { getDaySlots } from "@/services/availability.service";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const ip = clientIp(request);
  if (!rateLimitPublic(ip)) {
    return apiClientError(brand.labels.apiTooManyRequests, 429, undefined, undefined, request);
  }
  const { searchParams } = new URL(request.url);
  const courseTypeId = searchParams.get("courseTypeId");
  const date = searchParams.get("date");
  if (!courseTypeId || !date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return apiClientError(
      brand.labels.apiPublicSlotsParamsRequired,
      400,
      "INVALID_INPUT",
      undefined,
      request
    );
  }
  const slots = await getDaySlots(courseTypeId, date);
  return NextResponse.json({ slots });
}
