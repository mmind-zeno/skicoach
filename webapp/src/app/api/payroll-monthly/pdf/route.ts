import { NextResponse } from "next/server";
import { apiClientError, apiErrorResponse } from "@/lib/api-error";
import { requireAuthSession } from "@/lib/auth-helpers";
import { brand } from "@/config/brand";
import { generatePayrollPdfBuffer } from "@/services/pdf.service";
import { buildPayrollMonthReport } from "@/services/payroll-li.service";

export const runtime = "nodejs";
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
    if (!report || !report.computation) {
      return apiClientError(
        brand.labels.payrollPdfNoComputation,
        400,
        undefined,
        undefined,
        request
      );
    }

    const buf = await generatePayrollPdfBuffer(report);
    const safeMonth = month.replace(/[^\d-]/g, "");
    const fn = `lohnabrechnung-${safeMonth}-${userId.slice(0, 8)}.pdf`;
    return new NextResponse(new Uint8Array(buf), {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${fn}"`,
      },
    });
  } catch (e) {
    return apiErrorResponse(e, "GET /api/payroll-monthly/pdf", { request });
  }
}
