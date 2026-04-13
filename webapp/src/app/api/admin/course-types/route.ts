import { asc } from "drizzle-orm";
import { NextResponse } from "next/server";
import { brand } from "@/config/brand";
import { courseTypes } from "../../../../../drizzle/schema";
import { writeAuditLog } from "@/lib/audit-log";
import { apiClientError } from "@/lib/api-error";
import { requireAdminSession } from "@/lib/auth-helpers";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  await requireAdminSession();
  const rows = await getDb().query.courseTypes.findMany({
    orderBy: [asc(courseTypes.name)],
  });
  return NextResponse.json(rows);
}

export async function POST(request: Request) {
  const session = await requireAdminSession();
  const json = await request.json();
  const name = typeof json.name === "string" ? json.name.trim() : "";
  const durationMin = Number(json.durationMin);
  const priceCHF = String(json.priceCHF ?? "0");
  const maxParticipants = Number(json.maxParticipants ?? 1);
  if (!name || !Number.isFinite(durationMin) || durationMin < 1) {
    return apiClientError(brand.labels.apiInvalidData, 400, "INVALID_INPUT");
  }
  const [row] = await getDb()
    .insert(courseTypes)
    .values({
      name,
      durationMin,
      priceCHF,
      maxParticipants: Number.isFinite(maxParticipants) ? maxParticipants : 1,
      isPublic: !!json.isPublic,
      isActive: json.isActive !== false,
    })
    .returning();
  if (row) {
    await writeAuditLog({
      actorUserId: session.user.id,
      action: "admin.course_type.create",
      resource: row.id,
      metadata: { name: row.name },
      request,
    });
  }
  return NextResponse.json(row, { status: 201 });
}
