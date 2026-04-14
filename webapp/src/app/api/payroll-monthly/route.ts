import { NextResponse } from "next/server";
import { apiClientError, apiErrorResponse } from "@/lib/api-error";
import { requireAuthSession } from "@/lib/auth-helpers";
import { brand } from "@/config/brand";
import { buildPayrollMonthReport } from "@/services/payroll-li.service";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const session = await requireAuthSession();
    const url = new URL(request.url);
    const month = url.searchParams.get("month");
    let userId = url.searchParams.get("userId");

    if (!month || !/^\d{4}-\d{2}$/.test(month)) {
      return apiClientError(
        brand.labels.apiInvalidData,
        400,
        undefined,
        undefined,
        request
      );
    }

    if (session.user.role === "teacher") {
      userId = session.user.id;
    } else if (!userId) {
      return apiClientError(
        brand.labels.apiInvalidData,
        400,
        undefined,
        undefined,
        request
      );
    }

    const report = await buildPayrollMonthReport(userId, month);
    if (!report) {
      return apiClientError(
        brand.labels.apiNotFound,
        404,
        undefined,
        undefined,
        request
      );
    }

    return NextResponse.json(report);
  } catch (e) {
    return apiErrorResponse(e, "GET /api/payroll-monthly", { request });
  }
}
