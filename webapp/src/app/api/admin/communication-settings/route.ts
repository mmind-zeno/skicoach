import { NextResponse } from "next/server";
import { brand } from "@/config/brand";
import { requireAdminSession } from "@/lib/auth-helpers";
import { apiErrorResponse, apiClientError } from "@/lib/api-error";
import { patchCommunicationSettingsSchema } from "@/lib/validators/admin-communication";
import {
  getCommunicationSettings,
  updateCommunicationSettings,
  resetCommunicationSettingsToEnv,
} from "@/services/communication-settings.service";
import { countNewsletterRecipients } from "@/services/newsletter.service";

export async function GET() {
  await requireAdminSession();
  try {
    const settings = await getCommunicationSettings();
    const newsletterRecipientCount = await countNewsletterRecipients();
    return NextResponse.json({ ...settings, newsletterRecipientCount });
  } catch (e) {
    return apiErrorResponse(e, "GET /api/admin/communication-settings");
  }
}

export async function PATCH(request: Request) {
  await requireAdminSession();
  try {
    const json = await request.json();
    const body = patchCommunicationSettingsSchema.safeParse(json);
    if (!body.success) {
      return apiClientError(brand.labels.apiInvalidData, 400, "INVALID_INPUT");
    }
    const updated = await updateCommunicationSettings(body.data);
    const newsletterRecipientCount = await countNewsletterRecipients();
    return NextResponse.json({ ...updated, newsletterRecipientCount });
  } catch (e) {
    return apiErrorResponse(e, "PATCH /api/admin/communication-settings", {
      handleZod: true,
      badRequestMessage: brand.labels.apiInvalidData,
    });
  }
}

export async function DELETE() {
  await requireAdminSession();
  try {
    await resetCommunicationSettingsToEnv();
    const settings = await getCommunicationSettings();
    const newsletterRecipientCount = await countNewsletterRecipients();
    return NextResponse.json({ ...settings, newsletterRecipientCount });
  } catch (e) {
    return apiErrorResponse(e, "DELETE /api/admin/communication-settings");
  }
}
