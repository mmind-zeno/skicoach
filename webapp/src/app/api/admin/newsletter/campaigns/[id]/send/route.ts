import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth-helpers";
import { apiErrorResponse } from "@/lib/api-error";
import { sendNewsletterCampaign } from "@/services/newsletter.service";

export async function POST(
  _request: Request,
  { params }: { params: { id: string } }
) {
  await requireAdminSession();
  try {
    const row = await sendNewsletterCampaign(params.id);
    return NextResponse.json(row);
  } catch (e) {
    return apiErrorResponse(e, "POST /api/admin/newsletter/campaigns/[id]/send");
  }
}
