import { NextResponse } from "next/server";
import { apiClientError, apiErrorResponse } from "@/lib/api-error";
import { requireAuthSession } from "@/lib/auth-helpers";
import { brand } from "@/config/brand";
import { getCalendarContext } from "@/services/calendar-overlays.service";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const session = await requireAuthSession();
    const url = new URL(request.url);
    const from = url.searchParams.get("from");
    const to = url.searchParams.get("to");
    const idsParam = url.searchParams.get("teacherIds");

    if (
      !from ||
      !to ||
      !/^\d{4}-\d{2}-\d{2}$/.test(from) ||
      !/^\d{4}-\d{2}-\d{2}$/.test(to)
    ) {
      return apiClientError(
        brand.labels.apiInvalidData,
        400,
        undefined,
        undefined,
        request
      );
    }

    let teacherIds = idsParam
      ? idsParam
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : [];

    if (session.user.role === "teacher") {
      teacherIds = [session.user.id];
    } else if (teacherIds.length === 0) {
      return apiClientError(
        brand.labels.apiInvalidData,
        400,
        undefined,
        undefined,
        request
      );
    }

    if (teacherIds.length > 40) {
      return apiClientError(
        brand.labels.apiInvalidData,
        400,
        undefined,
        undefined,
        request
      );
    }

    const locale = brand.htmlLang === "en" ? "en" : "de";
    const data = await getCalendarContext(from, to, teacherIds, locale);
    return NextResponse.json(data);
  } catch (e) {
    return apiErrorResponse(e, "GET /api/calendar/overlays", { request });
  }
}
