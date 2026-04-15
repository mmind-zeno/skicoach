import { NextResponse } from "next/server";
import { apiClientError, apiErrorResponse } from "@/lib/api-error";
import { requireAdminSession } from "@/lib/auth-helpers";
import { brand } from "@/config/brand";
import { listAccountingLightCsvRows } from "@/services/accounting-light.service";

export const dynamic = "force-dynamic";

function escCell(s: string): string {
  return `"${s.replace(/"/g, '""')}"`;
}

export async function GET(request: Request) {
  try {
    await requireAdminSession();
    const url = new URL(request.url);
    const year = url.searchParams.get("year");
    if (!year || !/^\d{4}$/.test(year)) {
      return apiClientError(
        brand.labels.apiInvalidData,
        400,
        undefined,
        undefined,
        request
      );
    }
    const rows = await listAccountingLightCsvRows(year);
    const header = [
      "satzart",
      "umsatzdatum",
      "belegfeld1",
      "buchungstext",
      "bruttobetrag",
      "waehrung",
      "konto",
      "gegenkonto",
      "steuersatz",
      "gastname",
      "lehrkraft",
      "status",
    ];
    const lines = [
      header.map(escCell).join(","),
      ...rows.map((r) =>
        [
          r.satzart,
          r.umsatzdatum,
          r.belegfeld1,
          r.buchungstext,
          r.bruttobetrag,
          r.waehrung,
          r.konto,
          r.gegenkonto,
          r.steuersatz,
          r.gastname,
          r.lehrkraft,
          r.status,
        ]
          .map((c) => escCell(c))
          .join(",")
      ),
    ];
    const csv = lines.join("\n");
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="accounting-${year}.csv"`,
      },
    });
  } catch (e) {
    return apiErrorResponse(e, "GET /api/admin/accounting-export", { request });
  }
}
