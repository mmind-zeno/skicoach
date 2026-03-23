import { and, count, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { users } from "../../../../../../drizzle/schema";
import { writeAuditLog } from "@/lib/audit-log";
import { requireAdminSession } from "@/lib/auth-helpers";
import { AppError, NotFoundError, ValidationError } from "@/lib/errors";
import { brand } from "@/config/brand";
import { getDb } from "@/lib/db";

const lastActiveAdminBlocked = () =>
  `Der letzte aktive Admin kann nicht deaktiviert oder zum ${brand.labels.staffCollectivePlural} gemacht werden`;

async function assertNotSoleActiveAdmin(userId: string) {
  const db = getDb();
  const target = await db.query.users.findFirst({
    where: eq(users.id, userId),
    columns: { role: true, isActive: true },
  });
  if (!target?.isActive || target.role !== "admin") return;
  const [row] = await db
    .select({ c: count() })
    .from(users)
    .where(and(eq(users.role, "admin"), eq(users.isActive, true)));
  if (Number(row?.c ?? 0) <= 1) {
    throw new ValidationError(lastActiveAdminBlocked());
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await requireAdminSession();
  try {
    const json = await request.json();
    const patch: Partial<typeof users.$inferInsert> = {};
    if (typeof json.isActive === "boolean") {
      if (json.isActive === false && params.id === session.user.id) {
        return NextResponse.json(
          { error: brand.labels.apiAdminSelfDeactivateForbidden },
          { status: 400 }
        );
      }
      if (json.isActive === false) {
        await assertNotSoleActiveAdmin(params.id);
      }
      patch.isActive = json.isActive;
    }
    if (json.role === "admin" || json.role === "teacher") {
      if (json.role === "teacher") {
        await assertNotSoleActiveAdmin(params.id);
      }
      patch.role = json.role;
    }
    if (typeof json.name === "string") patch.name = json.name.trim();
    if (Object.keys(patch).length === 0) {
      return NextResponse.json(
        { error: brand.labels.apiPatchNoFields },
        { status: 400 }
      );
    }
    const res = await getDb()
      .update(users)
      .set(patch)
      .where(eq(users.id, params.id))
      .returning({ id: users.id });
    if (res.length === 0) {
      throw new NotFoundError(brand.labels.apiAdminUserNotFound);
    }
    await writeAuditLog({
      actorUserId: session.user.id,
      action: "admin.user.patch",
      resource: params.id,
      metadata: { patch },
      request,
    });
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof AppError) {
      return NextResponse.json({ error: e.message }, { status: e.statusCode });
    }
    throw e;
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAdminSession();
    if (params.id === session.user.id) {
      return NextResponse.json(
        { error: brand.labels.apiAdminSelfDeactivateForbidden },
        { status: 400 }
      );
    }
    await assertNotSoleActiveAdmin(params.id);
    const res = await getDb()
      .update(users)
      .set({ isActive: false })
      .where(eq(users.id, params.id))
      .returning({ id: users.id });
    if (res.length === 0) {
      return NextResponse.json(
        { error: brand.labels.apiNotFound },
        { status: 404 }
      );
    }
    await writeAuditLog({
      actorUserId: session.user.id,
      action: "admin.user.deactivate",
      resource: params.id,
      request,
    });
    return new NextResponse(null, { status: 204 });
  } catch (e) {
    if (e instanceof AppError) {
      return NextResponse.json({ error: e.message }, { status: e.statusCode });
    }
    throw e;
  }
}
