import { NextResponse } from "next/server";
import { brand } from "@/config/brand";
import { requireAdminSession, requireAuthSession } from "@/lib/auth-helpers";
import { apiErrorResponse } from "@/lib/api-error";
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
    return apiErrorResponse(e, "GET /api/guests/[id]");
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
      salutation: body.salutation,
      street: body.street,
      postalCode: body.postalCode,
      city: body.city,
      country: body.country,
      dateOfBirth: body.dateOfBirth,
      gender: body.gender,
      nationality: body.nationality,
      heightCm: body.heightCm,
      weightKg: body.weightKg,
      shoeSizeEu: body.shoeSizeEu,
      emergencyContactName: body.emergencyContactName,
      emergencyContactPhone: body.emergencyContactPhone,
      medicalNotes: body.medicalNotes,
      preferredContactChannel: body.preferredContactChannel,
      marketingOptIn: body.marketingOptIn,
      bookingReminderOptIn: body.bookingReminderOptIn,
    });
    return NextResponse.json(guest);
  } catch (e) {
    return apiErrorResponse(e, "PATCH /api/guests/[id]", {
      handleZod: true,
      badRequestMessage: brand.labels.apiInvalidData,
    });
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
    return apiErrorResponse(e, "DELETE /api/guests/[id]");
  }
}
