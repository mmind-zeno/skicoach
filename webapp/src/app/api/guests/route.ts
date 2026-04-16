import { NextResponse } from "next/server";
import { brand } from "@/config/brand";
import { requireAuthSession } from "@/lib/auth-helpers";
import { apiClientError, apiErrorResponse } from "@/lib/api-error";
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
    return apiErrorResponse(e, "GET /api/guests");
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
        salutation: d.salutation?.trim() || null,
        street: d.street?.trim() || null,
        postalCode: d.postalCode?.trim() || null,
        city: d.city?.trim() || null,
        country: d.country?.trim() || null,
        dateOfBirth: d.dateOfBirth ?? null,
        gender: d.gender ?? null,
        nationality: d.nationality?.trim() || null,
        heightCm: d.heightCm ?? null,
        weightKg: d.weightKg ?? null,
        shoeSizeEu: d.shoeSizeEu?.trim() || null,
        emergencyContactName: d.emergencyContactName?.trim() || null,
        emergencyContactPhone: d.emergencyContactPhone?.trim() || null,
        medicalNotes: d.medicalNotes?.trim() || null,
        preferredContactChannel: d.preferredContactChannel ?? null,
        marketingOptIn: d.marketingOptIn ?? false,
      });
      return NextResponse.json(g, { status: 201 });
    }
    const quick = createGuestBodySchema.safeParse(json);
    if (!quick.success) {
      return apiClientError(brand.labels.apiInvalidData, 400, "INVALID_INPUT");
    }
    const qd = quick.data;
    const g = await createGuest({
      name: qd.name,
      email: qd.email ?? null,
      phone: qd.phone ?? null,
    });
    return NextResponse.json(g, { status: 201 });
  } catch (e) {
    return apiErrorResponse(e, "POST /api/guests");
  }
}
