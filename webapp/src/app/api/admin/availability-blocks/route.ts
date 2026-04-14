import { and, eq, gte, lte } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { availabilityBlocks } from "../../../../../drizzle/schema";
import { apiClientError, apiErrorResponse } from "@/lib/api-error";
import { requireAdminSession } from "@/lib/auth-helpers";
import { brand } from "@/config/brand";
import { getDb } from "@/lib/db";
import { parseLocalDateOnly } from "@/lib/datetime";

export const dynamic = "force-dynamic";

const postBodySchema = z.object({
  userId: z.string().uuid(),
  blockDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z.string().min(4),
  endTime: z.string().min(4),
  note: z.string().nullable().optional(),
});

function normalizeTime(t: string): string {
  if (t.length === 5) return `${t}:00`;
  return t;
}

export async function GET(request: Request) {
  try {
    await requireAdminSession();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const month = searchParams.get("month");
    if (!userId || !month || !/^\d{4}-\d{2}$/.test(month)) {
      return apiClientError(
        brand.labels.apiInvalidData,
        400,
        undefined,
        undefined,
        request
      );
    }
    const [y, mo] = month.split("-").map(Number);
    const lastDay = new Date(Date.UTC(y, mo, 0)).getUTCDate();
    const start = parseLocalDateOnly(
      `${y}-${String(mo).padStart(2, "0")}-01`
    );
    const end = parseLocalDateOnly(
      `${y}-${String(mo).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`
    );
    const db = getDb();
    const rows = await db
      .select()
      .from(availabilityBlocks)
      .where(
        and(
          eq(availabilityBlocks.userId, userId),
          gte(availabilityBlocks.blockDate, start),
          lte(availabilityBlocks.blockDate, end)
        )
      );
    return NextResponse.json({
      blocks: rows.map((r) => ({
        id: r.id,
        userId: r.userId,
        blockDate:
          r.blockDate instanceof Date
            ? r.blockDate.toISOString().slice(0, 10)
            : String(r.blockDate).slice(0, 10),
        startTime: r.startTime,
        endTime: r.endTime,
        note: r.note,
        createdAt: r.createdAt.toISOString(),
      })),
    });
  } catch (e) {
    return apiErrorResponse(e, "GET /api/admin/availability-blocks", {
      request,
    });
  }
}

export async function POST(request: Request) {
  try {
    await requireAdminSession();
    const json = await request.json();
    const body = postBodySchema.parse(json);
    const db = getDb();
    const [row] = await db
      .insert(availabilityBlocks)
      .values({
        userId: body.userId,
        blockDate: parseLocalDateOnly(body.blockDate),
        startTime: normalizeTime(body.startTime),
        endTime: normalizeTime(body.endTime),
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
      userId: row.userId,
      blockDate: body.blockDate,
      startTime: row.startTime,
      endTime: row.endTime,
      note: row.note,
    });
  } catch (e) {
    return apiErrorResponse(e, "POST /api/admin/availability-blocks", {
      handleZod: true,
      badRequestMessage: brand.labels.apiInvalidData,
      request,
    });
  }
}

export async function DELETE(request: Request) {
  try {
    await requireAdminSession();
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
    const res = await db
      .delete(availabilityBlocks)
      .where(eq(availabilityBlocks.id, id))
      .returning({ id: availabilityBlocks.id });
    if (res.length === 0) {
      return apiClientError(
        brand.labels.apiNotFound,
        404,
        undefined,
        undefined,
        request
      );
    }
    return new NextResponse(null, { status: 204 });
  } catch (e) {
    return apiErrorResponse(e, "DELETE /api/admin/availability-blocks", {
      request,
    });
  }
}
