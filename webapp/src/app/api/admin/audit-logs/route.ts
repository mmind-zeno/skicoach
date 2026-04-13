import { desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { auditLogs, users } from "../../../../../drizzle/schema";
import { requireAdminSession } from "@/lib/auth-helpers";
import { apiErrorResponse } from "@/lib/api-error";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

function toIso(d: Date | string): string {
  const date = d instanceof Date ? d : new Date(d);
  if (Number.isNaN(date.getTime())) return String(d);
  return date.toISOString();
}

export async function GET(request: Request) {
  try {
    await requireAdminSession();
    const { searchParams } = new URL(request.url);
    const limit = Math.min(
      Math.max(Number(searchParams.get("limit") ?? "80") || 80, 1),
      200
    );

    const db = getDb();
    const rows = await db
      .select({
        id: auditLogs.id,
        action: auditLogs.action,
        resource: auditLogs.resource,
        metadata: auditLogs.metadata,
        clientIp: auditLogs.clientIp,
        createdAt: auditLogs.createdAt,
        actorEmail: users.email,
      })
      .from(auditLogs)
      .leftJoin(users, eq(auditLogs.actorUserId, users.id))
      .orderBy(desc(auditLogs.createdAt))
      .limit(limit);

    return NextResponse.json(
      rows.map((r) => ({
        id: r.id,
        action: r.action,
        resource: r.resource,
        metadata: r.metadata,
        clientIp: r.clientIp,
        createdAt: toIso(r.createdAt),
        actorEmail: r.actorEmail,
      }))
    );
  } catch (e) {
    return apiErrorResponse(e, "GET /api/admin/audit-logs");
  }
}
