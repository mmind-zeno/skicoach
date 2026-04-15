import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { users } from "../../../../../drizzle/schema";
import { apiClientError, apiErrorResponse } from "@/lib/api-error";
import { requireAdminSession } from "@/lib/auth-helpers";
import { brand } from "@/config/brand";
import { getDb } from "@/lib/db";
import { listPayrollSnapshotsForYearCsvRows } from "@/services/payroll-li.service";

export const dynamic = "force-dynamic";

function escCell(s: string): string {
  return `"${s.replace(/"/g, '""')}"`;
}

export async function GET(request: Request) {
  try {
    await requireAdminSession();
    const url = new URL(request.url);
    const year = url.searchParams.get("year");
    const userId = url.searchParams.get("userId");
    if (!year || !/^\d{4}$/.test(year) || !userId) {
      return apiClientError(
        brand.labels.apiInvalidData,
        400,
        undefined,
        undefined,
        request
      );
    }
    const db = getDb();
    const u = await db.query.users.findFirst({ where: eq(users.id, userId) });
    if (!u) {
      return apiClientError(
        brand.labels.apiNotFound,
        404,
        undefined,
        undefined,
        request
      );
    }
    const rows = await listPayrollSnapshotsForYearCsvRows(userId, year);
    const header = [
      "month",
      "gross_chf",
      "finalized_at",
      "finalized_by",
      "person_email",
    ];
    const lines = [
      header.map(escCell).join(","),
      ...rows.map((r) =>
        [
          r.month,
          r.grossChf,
          r.finalizedAt,
          r.finalizedBy,
          u.email,
        ]
          .map((c) => escCell(c))
          .join(",")
      ),
    ];
    const csv = lines.join("\n");
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="payroll-snapshots-${year}-${userId.slice(0, 8)}.csv"`,
      },
    });
  } catch (e) {
    return apiErrorResponse(e, "GET /api/admin/payroll-export", { request });
  }
}
