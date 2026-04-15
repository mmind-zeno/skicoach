import { NextResponse } from "next/server";
import { z } from "zod";
import { apiClientError, apiErrorResponse } from "@/lib/api-error";
import { requireAdminSession } from "@/lib/auth-helpers";
import { brand } from "@/config/brand";
import {
  buildPayrollMonthReport,
  deletePayrollMonthSnapshot,
  finalizePayrollMonthSnapshot,
} from "@/services/payroll-li.service";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  userId: z.string().uuid(),
  month: z.string().regex(/^\d{4}-\d{2}$/),
});

export async function POST(request: Request) {
  try {
    const session = await requireAdminSession();
    const json = await request.json();
    const body = bodySchema.parse(json);
    const report = await finalizePayrollMonthSnapshot(
      body.userId,
      body.month,
      session.user.id
    );
    if (!report) {
      return apiClientError(
        brand.labels.payrollSnapshotNoComputation,
        400,
        undefined,
        undefined,
        request
      );
    }
    return NextResponse.json(report);
  } catch (e) {
    return apiErrorResponse(e, "POST /api/admin/payroll-snapshot", {
      handleZod: true,
      badRequestMessage: brand.labels.apiInvalidData,
      request,
    });
  }
}

export async function DELETE(request: Request) {
  try {
    await requireAdminSession();
    const url = new URL(request.url);
    const userId = url.searchParams.get("userId");
    const month = url.searchParams.get("month");
    if (!userId || !month || !/^\d{4}-\d{2}$/.test(month)) {
      return apiClientError(
        brand.labels.apiInvalidData,
        400,
        undefined,
        undefined,
        request
      );
    }
    const ok = await deletePayrollMonthSnapshot(userId, month);
    if (!ok) {
      return apiClientError(
        brand.labels.payrollSnapshotNotFound,
        404,
        undefined,
        undefined,
        request
      );
    }
    const report = await buildPayrollMonthReport(userId, month);
    return NextResponse.json(report ?? { ok: true });
  } catch (e) {
    return apiErrorResponse(e, "DELETE /api/admin/payroll-snapshot", { request });
  }
}
