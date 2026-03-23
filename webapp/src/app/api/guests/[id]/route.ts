import { NextResponse } from "next/server";
import { brand } from "@/config/brand";
import { requireAdminSession, requireAuthSession } from "@/lib/auth-helpers";
import { AppError } from "@/lib/errors";
import { updateGuestBodySchema } from "@/lib/validators/guest-full";
import {
  deleteGuest,
  findByIdWithBookings,
  updateGuest,
} from "@/services/guest.service";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  await requireAuthSession();
  try {
    const guest = await findByIdWithBookings(params.id);
    return NextResponse.json(guest);
  } catch (e) {
    if (e instanceof AppError) {
      return NextResponse.json({ error: e.message }, { status: e.statusCode });
    }
    throw e;
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  await requireAuthSession();
  try {
    const json = await request.json();
    const body = updateGuestBodySchema.parse(json);
    const guest = await updateGuest(params.id, {
      name: body.name,
      email: body.email,
      phone: body.phone,
      niveau: body.niveau,
      language: body.language,
      notes: body.notes,
      company: body.company,
      crmSource: body.crmSource,
    });
    return NextResponse.json(guest);
  } catch (e) {
    if (e instanceof AppError) {
      return NextResponse.json({ error: e.message }, { status: e.statusCode });
    }
    return NextResponse.json(
      { error: brand.labels.apiInvalidData },
      { status: 400 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  await requireAdminSession();
  try {
    await deleteGuest(params.id);
    return new NextResponse(null, { status: 204 });
  } catch (e) {
    if (e instanceof AppError) {
      return NextResponse.json({ error: e.message }, { status: e.statusCode });
    }
    throw e;
  }
}
