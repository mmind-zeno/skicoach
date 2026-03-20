import { NextResponse } from "next/server";
import { requireAuthSession } from "@/lib/auth-helpers";
import { AppError } from "@/lib/errors";
import { genericApiErrorMessage } from "@/lib/map-db-error";
import { createGuestFullBodySchema } from "@/lib/validators/guest-full";
import { createGuestBodySchema } from "@/lib/validators/guest";
import { createGuest, findAll } from "@/services/guest.service";

export async function GET(request: Request) {
  try {
    await requireAuthSession();
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") ?? searchParams.get("search") ?? undefined;
    const niveau = searchParams.get("niveau") ?? undefined;
    const limit = Math.min(Number(searchParams.get("limit") ?? "200") || 200, 500);
    const rows = await findAll(q, niveau ?? undefined, limit);
    return NextResponse.json(rows);
  } catch (e) {
    if (e instanceof AppError) {
      return NextResponse.json({ error: e.message }, { status: e.statusCode });
    }
    console.error("[GET /api/guests]", e);
    return NextResponse.json(
      { error: genericApiErrorMessage(e) },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await requireAuthSession();
    const json = await request.json();
    const full = createGuestFullBodySchema.safeParse(json);
    if (full.success) {
      const d = full.data;
      const g = await createGuest({
        name: d.name,
        email: d.email ?? null,
        phone: d.phone ?? null,
        niveau: d.niveau,
        language: d.language,
        notes: d.notes ?? null,
        company: d.company?.trim() || null,
        crmSource: d.crmSource?.trim() || null,
      });
      return NextResponse.json(g, { status: 201 });
    }
    const quick = createGuestBodySchema.safeParse(json);
    if (!quick.success) {
      return NextResponse.json({ error: "Ungültige Daten" }, { status: 400 });
    }
    const qd = quick.data;
    const g = await createGuest({
      name: qd.name,
      email: qd.email ?? null,
      phone: qd.phone ?? null,
    });
    return NextResponse.json(g, { status: 201 });
  } catch (e) {
    if (e instanceof AppError) {
      return NextResponse.json({ error: e.message }, { status: e.statusCode });
    }
    console.error("[POST /api/guests]", e);
    return NextResponse.json(
      { error: genericApiErrorMessage(e) },
      { status: 500 }
    );
  }
}
