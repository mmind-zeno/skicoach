import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { courseTypes } from "../../../../../../drizzle/schema";
import { writeAuditLog } from "@/lib/audit-log";
import { requireAdminSession } from "@/lib/auth-helpers";
import { apiClientError, apiErrorResponse } from "@/lib/api-error";
import { brand } from "@/config/brand";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

function isPostgresFkViolation(e: unknown): boolean {
  const code = (x: unknown) =>
    typeof x === "object" &&
    x !== null &&
    "code" in x &&
    (x as { code?: string }).code === "23503";
  if (code(e)) return true;
  if (typeof e === "object" && e !== null && "cause" in e) {
    return code((e as { cause?: unknown }).cause);
  }
  return false;
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  await requireAdminSession();
  const json = await request.json();
  const patch: Partial<typeof courseTypes.$inferInsert> = {};
  if (typeof json.name === "string") patch.name = json.name.trim();
  if (Number.isFinite(Number(json.durationMin))) {
    patch.durationMin = Number(json.durationMin);
  }
  if (json.priceCHF != null) patch.priceCHF = String(json.priceCHF);
  if (Number.isFinite(Number(json.maxParticipants))) {
    patch.maxParticipants = Number(json.maxParticipants);
  }
  if (typeof json.isPublic === "boolean") patch.isPublic = json.isPublic;
  if (typeof json.isActive === "boolean") patch.isActive = json.isActive;
  if (Object.keys(patch).length === 0) {
    return apiClientError(brand.labels.apiPatchNoFields, 400, "INVALID_INPUT");
  }
  const res = await getDb()
    .update(courseTypes)
    .set(patch)
    .where(eq(courseTypes.id, params.id))
    .returning();
  if (res.length === 0) {
    return apiClientError(brand.labels.apiNotFound, 404);
  }
  return NextResponse.json(res[0]);
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await requireAdminSession();
  try {
    const res = await getDb()
      .delete(courseTypes)
      .where(eq(courseTypes.id, params.id))
      .returning({ id: courseTypes.id });
    if (res.length === 0) {
      return apiClientError(
        brand.labels.msgEntityNotFound.replace(
          "{entity}",
          brand.labels.serviceTypeSingular
        ),
        404,
        undefined,
        undefined,
        request
      );
    }
    await writeAuditLog({
      actorUserId: session.user.id,
      action: "admin.course_type.delete",
      resource: params.id,
      request,
    });
    return new NextResponse(null, { status: 204 });
  } catch (e: unknown) {
    if (isPostgresFkViolation(e)) {
      return apiClientError(
        brand.labels.apiAdminCourseTypeDeleteBlockedTemplate
          .replace("{serviceTypeSingular}", brand.labels.serviceTypeSingular)
          .replace("{bookingPlural}", brand.labels.bookingPlural)
          .replace("{bookingRequestPlural}", brand.labels.bookingRequestPlural),
        409
      );
    }
    return apiErrorResponse(e, "DELETE /api/admin/course-types/[id]");
  }
}
