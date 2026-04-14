import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { staffVacationPeriods, users } from "../../../../../drizzle/schema";
import { apiClientError, apiErrorResponse } from "@/lib/api-error";
import { requireAdminSession } from "@/lib/auth-helpers";
import { brand } from "@/config/brand";
import { getDb } from "@/lib/db";
import { calendarDateFromStored, parseLocalDateOnly } from "@/lib/datetime";

export const dynamic = "force-dynamic";

const periodSchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  note: z.string().nullable().optional(),
});

const putBodySchema = z.object({
  userId: z.string().uuid(),
  periods: z.array(periodSchema).max(40),
});

export async function GET(request: Request) {
  try {
    await requireAdminSession();
    const userId = new URL(request.url).searchParams.get("userId");
    if (!userId) {
      return apiClientError(
        brand.labels.apiInvalidData,
        400,
        undefined,
        undefined,
        request
      );
    }
    const db = getDb();
    const rows = await db
      .select()
      .from(staffVacationPeriods)
      .where(eq(staffVacationPeriods.userId, userId));
    return NextResponse.json({
      periods: rows.map((r) => ({
        id: r.id,
        startDate: rowDateToYmd(r.startDate),
        endDate: rowDateToYmd(r.endDate),
        note: r.note,
      })),
    });
  } catch (e) {
    return apiErrorResponse(e, "GET /api/admin/staff-vacation", { request });
  }
}

function rowDateToYmd(v: unknown): string {
  if (v instanceof Date) {
    const cd = calendarDateFromStored(v);
    const y = cd.getFullYear();
    const mo = String(cd.getMonth() + 1).padStart(2, "0");
    const day = String(cd.getDate()).padStart(2, "0");
    return `${y}-${mo}-${day}`;
  }
  return String(v).slice(0, 10);
}

export async function PUT(request: Request) {
  try {
    await requireAdminSession();
    const json = await request.json();
    const body = putBodySchema.parse(json);

    for (const p of body.periods) {
      const a = parseLocalDateOnly(p.startDate);
      const b = parseLocalDateOnly(p.endDate);
      if (a > b) {
        return apiClientError(
          brand.labels.adminVacationInvalidRange,
          400,
          undefined,
          undefined,
          request
        );
      }
      const days =
        (b.getTime() - a.getTime()) / (24 * 60 * 60 * 1000) + 1;
      if (days > 370) {
        return apiClientError(
          brand.labels.adminVacationSpanTooLong,
          400,
          undefined,
          undefined,
          request
        );
      }
    }

    const db = getDb();
    const user = await db.query.users.findFirst({
      where: eq(users.id, body.userId),
    });
    if (!user) {
      return apiClientError(
        brand.labels.apiNotFound,
        404,
        undefined,
        undefined,
        request
      );
    }

    await db.transaction(async (tx) => {
      await tx
        .delete(staffVacationPeriods)
        .where(eq(staffVacationPeriods.userId, body.userId));
      if (body.periods.length > 0) {
        await tx.insert(staffVacationPeriods).values(
          body.periods.map((p) => ({
            userId: body.userId,
            startDate: parseLocalDateOnly(p.startDate),
            endDate: parseLocalDateOnly(p.endDate),
            note: p.note?.trim() || null,
          }))
        );
      }
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    return apiErrorResponse(e, "PUT /api/admin/staff-vacation", {
      handleZod: true,
      badRequestMessage: brand.labels.apiInvalidData,
      request,
    });
  }
}
