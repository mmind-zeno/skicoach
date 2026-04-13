import { and, count, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { users } from "../../../../../../drizzle/schema";
import { writeAuditLog } from "@/lib/audit-log";
import { requireAdminSession } from "@/lib/auth-helpers";
import { NotFoundError, ValidationError } from "@/lib/errors";
import { apiClientError, apiErrorResponse } from "@/lib/api-error";
import { brand } from "@/config/brand";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

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
        return apiClientError(
          brand.labels.apiAdminSelfDeactivateForbidden,
          400,
          "INVALID_INPUT",
          undefined,
          request
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
      return apiClientError(
        brand.labels.apiPatchNoFields,
        400,
        "INVALID_INPUT",
        undefined,
        request
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
    return apiErrorResponse(e, "PATCH /api/admin/users/[id]", { request });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAdminSession();
    if (params.id === session.user.id) {
      return apiClientError(
        brand.labels.apiAdminSelfDeactivateForbidden,
        400,
        "INVALID_INPUT",
        undefined,
        request
      );
    }
    await assertNotSoleActiveAdmin(params.id);
    const res = await getDb()
      .update(users)
      .set({ isActive: false })
      .where(eq(users.id, params.id))
      .returning({ id: users.id });
    if (res.length === 0) {
      return apiClientError(brand.labels.apiNotFound, 404, undefined, undefined, request);
    }
    await writeAuditLog({
      actorUserId: session.user.id,
      action: "admin.user.deactivate",
      resource: params.id,
      request,
    });
    return new NextResponse(null, { status: 204 });
  } catch (e) {
    return apiErrorResponse(e, "DELETE /api/admin/users/[id]", { request });
  }
}
