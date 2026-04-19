import { NextResponse } from "next/server";
import { brand } from "@/config/brand";
import { requireAdminSession } from "@/lib/auth-helpers";
import { apiErrorResponse, apiClientError } from "@/lib/api-error";
import { createNewsletterDraftSchema } from "@/lib/validators/admin-communication";
import {
  createNewsletterDraft,
  listNewsletterCampaigns,
} from "@/services/newsletter.service";

export async function GET() {
  await requireAdminSession();
  try {
    const campaigns = await listNewsletterCampaigns(50);
    return NextResponse.json(campaigns);
  } catch (e) {
    return apiErrorResponse(e, "GET /api/admin/newsletter/campaigns");
  }
}

export async function POST(request: Request) {
  const session = await requireAdminSession();
  try {
    const json = await request.json();
    const body = createNewsletterDraftSchema.safeParse(json);
    if (!body.success) {
      return apiClientError(brand.labels.apiInvalidData, 400, "INVALID_INPUT");
    }
    const row = await createNewsletterDraft({
      subject: body.data.subject,
      htmlBody: body.data.htmlBody,
      createdByUserId: session.user.id!,
    });
    return NextResponse.json(row, { status: 201 });
  } catch (e) {
    return apiErrorResponse(e, "POST /api/admin/newsletter/campaigns", {
      handleZod: true,
      badRequestMessage: brand.labels.apiInvalidData,
    });
  }
}
