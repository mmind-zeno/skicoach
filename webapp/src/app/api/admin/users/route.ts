import { asc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { users } from "../../../../../drizzle/schema";
import { writeAuditLog } from "@/lib/audit-log";
import { requireAdminSession } from "@/lib/auth-helpers";
import { AppError } from "@/lib/errors";
import { getDb } from "@/lib/db";
import { sendTeacherInviteMagicLink } from "@/lib/invite-magic-link";
import { consumeRateLimitBucket } from "@/lib/rate-limit-db";
import { brand } from "@/config/brand";

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
      return NextResponse.json(
        { error: brand.labels.apiAdminInviteRateLimited },
        { status: 429 }
      );
    }

    const json = await request.json();
    const email = typeof json.email === "string" ? json.email.trim().toLowerCase() : "";
    const name =
      typeof json.name === "string" && json.name.trim()
        ? json.name.trim()
        : email.split("@")[0] ?? brand.labels.staffSingular;
    if (!email.includes("@")) {
      return NextResponse.json(
        { error: brand.labels.apiInvalidEmail },
        { status: 400 }
      );
    }
    const db = getDb();
    const exists = await db.query.users.findFirst({
      where: eq(users.email, email),
    });
    if (exists) {
      return NextResponse.json(
        {
          error: brand.labels.apiAdminUserExists,
          code: "USER_EXISTS",
        },
        { status: 409 }
      );
    }
    await db.insert(users).values({
      email,
      name,
      role: "teacher",
      isActive: true,
    });
    await sendTeacherInviteMagicLink({ email, name });
    await writeAuditLog({
      actorUserId: session.user.id,
      action: "admin.user.invite_teacher",
      resource: email,
      metadata: { name },
      request,
    });
    return NextResponse.json({ ok: true, email }, { status: 201 });
  } catch (e) {
    if (e instanceof AppError) {
      return NextResponse.json({ error: e.message }, { status: e.statusCode });
    }
    return NextResponse.json(
      { error: brand.labels.apiInviteFailed },
      { status: 500 }
    );
  }
}
