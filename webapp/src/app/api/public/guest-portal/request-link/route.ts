import { NextResponse } from "next/server";
import { z } from "zod";
import { brand } from "@/config/brand";
import { apiClientError, apiErrorResponse } from "@/lib/api-error";
import { clientIp, rateLimitGuestPortalLinkRequest } from "@/lib/public-rate-limit";
import { normalizeGuestEmail, signGuestPortalToken } from "@/lib/guest-portal-token";
import {
  findGuestIdByEmail,
} from "@/services/guest-portal.service";
import { getDb } from "@/lib/db";
import { guests } from "../../../../../../drizzle/schema";
import { eq } from "drizzle-orm";
import { sendGuestPortalMagicLink } from "@/lib/mail";

export const dynamic = "force-dynamic";

const bodySchema = z.object({
  email: z.string().email(),
});

export async function POST(request: Request) {
  try {
    const ip = clientIp(request);
    const ok = await rateLimitGuestPortalLinkRequest(ip);
    if (!ok) {
      return apiClientError(
        brand.labels.guestPortalRateLimited,
        429,
        undefined,
        undefined,
        request
      );
    }
    let json: unknown;
    try {
      json = await request.json();
    } catch {
      return apiClientError(
        brand.labels.apiInvalidData,
        400,
        undefined,
        undefined,
        request
      );
    }
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return apiClientError(
        brand.labels.apiInvalidEmail,
        400,
        undefined,
        undefined,
        request
      );
    }
    const norm = normalizeGuestEmail(parsed.data.email);
    const guestId = await findGuestIdByEmail(norm);
    if (guestId) {
      const db = getDb();
      const g = await db.query.guests.findFirst({
        where: eq(guests.id, guestId),
        columns: { name: true },
      });
      const token = await signGuestPortalToken(guestId, norm);
      await sendGuestPortalMagicLink(
        norm,
        g?.name?.trim() || norm,
        token
      );
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    return apiErrorResponse(e, "POST /api/public/guest-portal/request-link", {
      request,
    });
  }
}
