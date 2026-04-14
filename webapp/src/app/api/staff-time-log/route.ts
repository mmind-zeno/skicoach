import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { staffTimeLogs } from "../../../../drizzle/schema";
import { apiClientError, apiErrorResponse } from "@/lib/api-error";
import { requireAuthSession } from "@/lib/auth-helpers";
import { brand } from "@/config/brand";
import { getDb } from "@/lib/db";
import { parseLocalDateOnly } from "@/lib/datetime";

export const dynamic = "force-dynamic";

const categorySchema = z.enum([
  "buero_verwaltung",
  "vorbereitung",
  "meeting",
  "fortbildung",
  "sonstiges",
]);

const postBodySchema = z.object({
  userId: z.string().uuid(),
  workDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  hours: z.number().min(0.25).max(24),
  category: categorySchema,
  note: z.string().nullable().optional(),
});

export async function POST(request: Request) {
  try {
    const session = await requireAuthSession();
    const json = await request.json();
    const body = postBodySchema.parse(json);

    if (
      session.user.role === "teacher" &&
      body.userId !== session.user.id
    ) {
      return apiClientError(
        brand.labels.apiForbidden,
        403,
        undefined,
        undefined,
        request
      );
    }

    const db = getDb();
    const [row] = await db
      .insert(staffTimeLogs)
      .values({
        userId: body.userId,
        workDate: parseLocalDateOnly(body.workDate),
        hours: body.hours.toFixed(2),
        category: body.category,
        note: body.note?.trim() || null,
      })
      .returning();

    if (!row) {
      return apiClientError(
        brand.labels.apiTechnicalErrorGeneric,
        500,
        undefined,
        undefined,
        request
      );
    }

    return NextResponse.json({
      id: row.id,
      workDate: body.workDate,
      hours: String(row.hours),
      category: row.category,
      note: row.note,
    });
  } catch (e) {
    return apiErrorResponse(e, "POST /api/staff-time-log", {
      handleZod: true,
      badRequestMessage: brand.labels.apiInvalidData,
      request,
    });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await requireAuthSession();
    const id = new URL(request.url).searchParams.get("id");
    if (!id) {
      return apiClientError(
        brand.labels.apiInvalidData,
        400,
        undefined,
        undefined,
        request
      );
    }

    const db = getDb();
    const existing = await db.query.staffTimeLogs.findFirst({
      where: eq(staffTimeLogs.id, id),
    });
    if (!existing) {
      return apiClientError(
        brand.labels.apiNotFound,
        404,
        undefined,
        undefined,
        request
      );
    }

    if (
      session.user.role === "teacher" &&
      existing.userId !== session.user.id
    ) {
      return apiClientError(
        brand.labels.apiForbidden,
        403,
        undefined,
        undefined,
        request
      );
    }

    const delWhere =
      session.user.role === "teacher"
        ? and(eq(staffTimeLogs.id, id), eq(staffTimeLogs.userId, session.user.id))
        : eq(staffTimeLogs.id, id);
    await db.delete(staffTimeLogs).where(delWhere);

    return new NextResponse(null, { status: 204 });
  } catch (e) {
    return apiErrorResponse(e, "DELETE /api/staff-time-log", { request });
  }
}
