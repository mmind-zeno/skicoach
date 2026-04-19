import { asc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { users } from "../../../../../drizzle/schema";
import { writeAuditLog } from "@/lib/audit-log";
import { requireAdminSession } from "@/lib/auth-helpers";
import { apiClientError, apiErrorResponse } from "@/lib/api-error";
import { getDb } from "@/lib/db";
import { sendTeacherInviteMagicLink } from "@/lib/invite-magic-link";
import { consumeRateLimitBucket } from "@/lib/rate-limit-db";
import { brand } from "@/config/brand";

export const dynamic = "force-dynamic";

export async function GET() {
  await requireAdminSession();
  const rows = await getDb().query.users.findMany({
    orderBy: [asc(users.email)],
    columns: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
  });
  return NextResponse.json(rows);
}

export async function POST(request: Request) {
  const session = await requireAdminSession();
  try {
    let allowed = true;
    try {
      allowed = await consumeRateLimitBucket(
        `admin:invite_teacher:${session.user.id}`,
        45,
        3_600_000
      );
    } catch {
      allowed = true;
    }
    if (!allowed) {
      return apiClientError(
        brand.labels.apiAdminInviteRateLimited,
        429,
        undefined,
        undefined,
        request
      );
    }

    const json = await request.json();
    const email = typeof json.email === "string" ? json.email.trim().toLowerCase() : "";
    const name =
      typeof json.name === "string" && json.name.trim()
        ? json.name.trim()
        : email.split("@")[0] ?? brand.labels.staffSingular;
    const roleRaw = json.role;
    const role =
      roleRaw === "admin" || roleRaw === "teacher" ? roleRaw : "teacher";
    if (!email.includes("@")) {
      return apiClientError(
        brand.labels.apiInvalidEmail,
        400,
        "INVALID_INPUT",
        undefined,
        request
      );
    }
    if (
      roleRaw !== undefined &&
      roleRaw !== "admin" &&
      roleRaw !== "teacher"
    ) {
      return apiClientError(
        brand.labels.apiInvalidRole,
        400,
        "INVALID_INPUT",
        undefined,
        request
      );
    }
    const db = getDb();
    const exists = await db.query.users.findFirst({
      where: eq(users.email, email),
    });
    if (exists) {
      return apiClientError(
        brand.labels.apiAdminUserExists,
        409,
        "USER_EXISTS",
        undefined,
        request
      );
    }
    await db.insert(users).values({
      email,
      name,
      role,
      isActive: true,
    });
    await sendTeacherInviteMagicLink({ email, name });
    await writeAuditLog({
      actorUserId: session.user.id,
      action: "admin.user.invite",
      resource: email,
      metadata: { name, role },
      request,
    });
    return NextResponse.json({ ok: true, email }, { status: 201 });
  } catch (e) {
    return apiErrorResponse(e, "POST /api/admin/users", {
      fallbackMessage: brand.labels.apiInviteFailed,
      request,
    });
  }
}
