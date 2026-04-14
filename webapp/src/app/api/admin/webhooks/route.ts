import { desc } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { outboundWebhooks } from "../../../../../drizzle/schema";
import { apiClientError, apiErrorResponse } from "@/lib/api-error";
import { requireAdminSession } from "@/lib/auth-helpers";
import { brand } from "@/config/brand";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

const postBodySchema = z.object({
  url: z.string().url(),
  secret: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
});

export async function GET(request: Request) {
  try {
    await requireAdminSession();
    const db = getDb();
    const rows = await db
      .select({
        id: outboundWebhooks.id,
        url: outboundWebhooks.url,
        isActive: outboundWebhooks.isActive,
        createdAt: outboundWebhooks.createdAt,
        hasSecret: outboundWebhooks.secret,
      })
      .from(outboundWebhooks)
      .orderBy(desc(outboundWebhooks.createdAt));
    return NextResponse.json({
      webhooks: rows.map((r) => ({
        id: r.id,
        url: r.url,
        isActive: r.isActive,
        createdAt: r.createdAt.toISOString(),
        hasSecret: Boolean(r.hasSecret),
      })),
    });
  } catch (e) {
    return apiErrorResponse(e, "GET /api/admin/webhooks", { request });
  }
}

export async function POST(request: Request) {
  try {
    await requireAdminSession();
    const json = await request.json();
    const body = postBodySchema.parse(json);
    const db = getDb();
    const [row] = await db
      .insert(outboundWebhooks)
      .values({
        url: body.url.trim(),
        secret: body.secret?.trim() || null,
        isActive: body.isActive ?? true,
      })
      .returning({
        id: outboundWebhooks.id,
        url: outboundWebhooks.url,
        isActive: outboundWebhooks.isActive,
      });
    if (!row) {
      return apiClientError(
        brand.labels.apiTechnicalErrorGeneric,
        500,
        undefined,
        undefined,
        request
      );
    }
    return NextResponse.json(row);
  } catch (e) {
    return apiErrorResponse(e, "POST /api/admin/webhooks", {
      handleZod: true,
      badRequestMessage: brand.labels.apiInvalidData,
      request,
    });
  }
}
