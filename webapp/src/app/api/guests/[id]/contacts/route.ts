import { NextResponse } from "next/server";
import { brand } from "@/config/brand";
import { requireAuthSession } from "@/lib/auth-helpers";
import { AppError } from "@/lib/errors";
import { createGuestContactBodySchema } from "@/lib/validators/guest-contact";
import { addGuestContact } from "@/services/guest.service";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await requireAuthSession();
  try {
    const json = await request.json();
    const body = createGuestContactBodySchema.parse(json);
    const entry = await addGuestContact(
      params.id,
      session.user.id,
      body.kind,
      body.body
    );
    return NextResponse.json(entry, { status: 201 });
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
