import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { staffWeeklyAvailability, users } from "../../../../../drizzle/schema";
import { apiClientError, apiErrorResponse } from "@/lib/api-error";
import { requireAdminSession } from "@/lib/auth-helpers";
import { brand } from "@/config/brand";
import { getDb } from "@/lib/db";
import { coerceSqlTimeForBooking, ensureTimeWithSeconds } from "@/lib/datetime";

export const dynamic = "force-dynamic";

const windowSchema = z.object({
  dayOfWeek: z.number().int().min(1).max(7),
  startTime: z.string().min(4),
  endTime: z.string().min(4),
});

const putBodySchema = z.object({
  userId: z.string().uuid(),
  windows: z.array(windowSchema).max(64),
});

function assertWindowOrder(startTime: string, endTime: string): boolean {
  const a = ensureTimeWithSeconds(startTime);
  const b = ensureTimeWithSeconds(endTime);
  return a < b;
}

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
      .from(staffWeeklyAvailability)
      .where(eq(staffWeeklyAvailability.userId, userId));
    return NextResponse.json({
      windows: rows.map((r) => ({
        id: r.id,
        dayOfWeek: r.dayOfWeek,
        startTime: coerceSqlTimeForBooking(r.startTime),
        endTime: coerceSqlTimeForBooking(r.endTime),
      })),
    });
  } catch (e) {
    return apiErrorResponse(e, "GET /api/admin/staff-weekly-availability", {
      request,
    });
  }
}

export async function PUT(request: Request) {
  try {
    await requireAdminSession();
    const json = await request.json();
    const body = putBodySchema.parse(json);

    for (const w of body.windows) {
      if (!assertWindowOrder(w.startTime, w.endTime)) {
        return apiClientError(
          brand.labels.adminWeeklyHoursInvalidWindow,
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
        .delete(staffWeeklyAvailability)
        .where(eq(staffWeeklyAvailability.userId, body.userId));
      if (body.windows.length > 0) {
        await tx.insert(staffWeeklyAvailability).values(
          body.windows.map((w) => ({
            userId: body.userId,
            dayOfWeek: w.dayOfWeek,
            startTime: ensureTimeWithSeconds(w.startTime),
            endTime: ensureTimeWithSeconds(w.endTime),
          }))
        );
      }
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    return apiErrorResponse(e, "PUT /api/admin/staff-weekly-availability", {
      handleZod: true,
      badRequestMessage: brand.labels.apiInvalidData,
      request,
    });
  }
}
