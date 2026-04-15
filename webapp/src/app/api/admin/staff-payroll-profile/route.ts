import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { staffPayrollProfiles, users } from "../../../../../drizzle/schema";
import { apiClientError, apiErrorResponse } from "@/lib/api-error";
import { requireAdminSession } from "@/lib/auth-helpers";
import { brand } from "@/config/brand";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

function optMoneyString(
  v: unknown
): string | null {
  if (v === null || v === undefined || v === "") return null;
  const n = typeof v === "number" ? v : Number.parseFloat(String(v).replace(",", "."));
  return Number.isFinite(n) && n > 0 ? String(n) : null;
}

function optRateString(v: unknown): string | null {
  if (v === null || v === undefined || v === "") return null;
  const n = typeof v === "number" ? v : Number.parseFloat(String(v).replace(",", "."));
  return Number.isFinite(n) && n > 0 ? String(n) : null;
}

const putSchema = z.object({
  userId: z.string().uuid(),
  grossHourlyRateChf: z.union([z.string(), z.number()]).nullable().optional(),
  grossHourlyRateProductiveChf: z.union([z.string(), z.number()]).nullable().optional(),
  grossHourlyRateInternalChf: z.union([z.string(), z.number()]).nullable().optional(),
  estimatedAnnualGrossChf: z.union([z.string(), z.number()]).nullable().optional(),
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

function mapPutToRates(body: z.infer<typeof putSchema>): {
  productive: string | null;
  internal: string | null;
  legacy: string | null;
  annual: string | null;
} {
  const fromNew = optRateString(body.grossHourlyRateProductiveChf);
  const fromOld = optRateString(body.grossHourlyRateChf);
  const productive = fromNew ?? fromOld;
  const internal = optRateString(body.grossHourlyRateInternalChf);
  const annual = optMoneyString(body.estimatedAnnualGrossChf);
  return {
    productive,
    internal,
    legacy: productive,
    annual,
  };
}

function profileJson(
  userId: string,
  row: typeof staffPayrollProfiles.$inferSelect | null
) {
  if (!row) {
    return {
      userId,
      grossHourlyRateChf: null,
      grossHourlyRateProductiveChf: null,
      grossHourlyRateInternalChf: null,
      estimatedAnnualGrossChf: null,
      weeklyHoursForKvg: null,
      kvgAgeBand: "adult" as const,
      applyWht4pct: true,
      merkblattSmallEmploymentAck: false,
      ahvNumber: null,
      notes: null,
    };
  }
  const productive =
    row.grossHourlyRateProductiveChf ?? row.grossHourlyRateChf ?? null;
  return {
    userId: row.userId,
    grossHourlyRateChf: row.grossHourlyRateChf ?? null,
    grossHourlyRateProductiveChf: productive,
    grossHourlyRateInternalChf: row.grossHourlyRateInternalChf ?? null,
    estimatedAnnualGrossChf: row.estimatedAnnualGrossChf ?? null,
    weeklyHoursForKvg: row.weeklyHoursForKvg ?? null,
    kvgAgeBand: row.kvgAgeBand,
    applyWht4pct: row.applyWht4pct,
    merkblattSmallEmploymentAck: row.merkblattSmallEmploymentAck,
    ahvNumber: row.ahvNumber ?? null,
    notes: row.notes ?? null,
  };
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
    return NextResponse.json({ profile: profileJson(userId, row ?? null) });
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

    const { productive, internal, legacy, annual } = mapPutToRates(body);
    const ahv = body.ahvNumber?.trim() || null;
    const notes = body.notes?.trim() || null;
    const weekly = body.weeklyHoursForKvg;

    const values = {
      grossHourlyRateChf: legacy ?? null,
      grossHourlyRateProductiveChf: productive ?? null,
      grossHourlyRateInternalChf: internal ?? null,
      estimatedAnnualGrossChf: annual ?? null,
      weeklyHoursForKvg: weekly ?? null,
      kvgAgeBand: body.kvgAgeBand,
      applyWht4pct: body.applyWht4pct,
      merkblattSmallEmploymentAck: body.merkblattSmallEmploymentAck,
      ahvNumber: ahv,
      notes,
      updatedAt: new Date(),
    };

    if (existing) {
      await db
        .update(staffPayrollProfiles)
        .set(values)
        .where(eq(staffPayrollProfiles.userId, body.userId));
    } else {
      await db.insert(staffPayrollProfiles).values({
        userId: body.userId,
        ...values,
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
