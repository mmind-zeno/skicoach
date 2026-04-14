import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { staffPayrollProfiles, users } from "../../../../../drizzle/schema";
import { apiClientError, apiErrorResponse } from "@/lib/api-error";
import { requireAdminSession } from "@/lib/auth-helpers";
import { brand } from "@/config/brand";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

const putSchema = z.object({
  userId: z.string().uuid(),
  grossHourlyRateChf: z
    .union([z.string(), z.number()])
    .nullable()
    .optional()
    .transform((v) => {
      if (v === null || v === undefined || v === "") return null;
      const n = typeof v === "number" ? v : Number.parseFloat(String(v).replace(",", "."));
      return Number.isFinite(n) ? String(n) : null;
    }),
  weeklyHoursForKvg: z
    .union([z.string(), z.number()])
    .nullable()
    .optional()
    .transform((v) => {
      if (v === null || v === undefined || v === "") return null;
      const n = typeof v === "number" ? v : Number.parseFloat(String(v).replace(",", "."));
      return Number.isFinite(n) && n > 0 ? String(n) : null;
    }),
  kvgAgeBand: z.enum(["adult", "youth_16_20"]),
  applyWht4pct: z.boolean(),
  merkblattSmallEmploymentAck: z.boolean(),
  ahvNumber: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
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
    const row = await db.query.staffPayrollProfiles.findFirst({
      where: eq(staffPayrollProfiles.userId, userId),
    });
    if (!row) {
      return NextResponse.json({
        profile: {
          userId,
          grossHourlyRateChf: null,
          weeklyHoursForKvg: null,
          kvgAgeBand: "adult" as const,
          applyWht4pct: true,
          merkblattSmallEmploymentAck: false,
          ahvNumber: null,
          notes: null,
        },
      });
    }
    return NextResponse.json({
      profile: {
        userId: row.userId,
        grossHourlyRateChf: row.grossHourlyRateChf ?? null,
        weeklyHoursForKvg: row.weeklyHoursForKvg ?? null,
        kvgAgeBand: row.kvgAgeBand,
        applyWht4pct: row.applyWht4pct,
        merkblattSmallEmploymentAck: row.merkblattSmallEmploymentAck,
        ahvNumber: row.ahvNumber ?? null,
        notes: row.notes ?? null,
      },
    });
  } catch (e) {
    return apiErrorResponse(e, "GET /api/admin/staff-payroll-profile", { request });
  }
}

export async function PUT(request: Request) {
  try {
    await requireAdminSession();
    const json = await request.json();
    const body = putSchema.parse(json);

    const db = getDb();
    const u = await db.query.users.findFirst({ where: eq(users.id, body.userId) });
    if (!u) {
      return apiClientError(
        brand.labels.apiNotFound,
        404,
        undefined,
        undefined,
        request
      );
    }

    const existing = await db.query.staffPayrollProfiles.findFirst({
      where: eq(staffPayrollProfiles.userId, body.userId),
    });

    const ahv = body.ahvNumber?.trim() || null;
    const notes = body.notes?.trim() || null;
    const gross = body.grossHourlyRateChf;
    const weekly = body.weeklyHoursForKvg;

    if (existing) {
      await db
        .update(staffPayrollProfiles)
        .set({
          grossHourlyRateChf: gross ?? null,
          weeklyHoursForKvg: weekly ?? null,
          kvgAgeBand: body.kvgAgeBand,
          applyWht4pct: body.applyWht4pct,
          merkblattSmallEmploymentAck: body.merkblattSmallEmploymentAck,
          ahvNumber: ahv,
          notes,
          updatedAt: new Date(),
        })
        .where(eq(staffPayrollProfiles.userId, body.userId));
    } else {
      await db.insert(staffPayrollProfiles).values({
        userId: body.userId,
        grossHourlyRateChf: gross ?? null,
        weeklyHoursForKvg: weekly ?? null,
        kvgAgeBand: body.kvgAgeBand,
        applyWht4pct: body.applyWht4pct,
        merkblattSmallEmploymentAck: body.merkblattSmallEmploymentAck,
        ahvNumber: ahv,
        notes,
      });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    return apiErrorResponse(e, "PUT /api/admin/staff-payroll-profile", {
      handleZod: true,
      badRequestMessage: brand.labels.apiInvalidData,
      request,
    });
  }
}
