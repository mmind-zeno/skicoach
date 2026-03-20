import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { courseTypes } from "../../../../../../drizzle/schema";
import { writeAuditLog } from "@/lib/audit-log";
import { requireAdminSession } from "@/lib/auth-helpers";
import { getDb } from "@/lib/db";

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
    return NextResponse.json({ error: "Keine Felder" }, { status: 400 });
  }
  const res = await getDb()
    .update(courseTypes)
    .set(patch)
    .where(eq(courseTypes.id, params.id))
    .returning();
  if (res.length === 0) {
    return NextResponse.json({ error: "Nicht gefunden" }, { status: 404 });
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
      return NextResponse.json({ error: "Kurstyp nicht gefunden" }, { status: 404 });
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
      return NextResponse.json(
        {
          error:
            "Kurstyp ist noch mit Buchungen oder Anfragen verknüpft und kann nicht gelöscht werden.",
        },
        { status: 409 }
      );
    }
    throw e;
  }
}
