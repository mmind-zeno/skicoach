import { NextResponse } from "next/server";
import { brand } from "@/config/brand";
import { requireAuthSession } from "@/lib/auth-helpers";
import { apiClientError, apiErrorResponse } from "@/lib/api-error";
import { consumeRateLimitBucket } from "@/lib/rate-limit-db";
import {
  assertCanReadChatMessages,
  createMessage,
  getMessages,
} from "@/services/chat.service";

export async function GET(request: Request) {
  const session = await requireAuthSession();
  try {
    const { searchParams } = new URL(request.url);
    const channelId = searchParams.get("channelId");
    const recipientId = searchParams.get("recipientId");
    const limit = Number(searchParams.get("limit") ?? "40") || 40;
    const before = searchParams.get("before");
    const beforeDate = before ? new Date(before) : undefined;

    if (channelId) {
      await assertCanReadChatMessages({ channelId });
      const rows = await getMessages({
        channelId,
        limit,
        before:
          beforeDate && !Number.isNaN(beforeDate.getTime())
            ? beforeDate
            : undefined,
      });
      const mapped = rows.reverse().map((m) => ({
        id: m.id,
        channelId: m.channelId,
        recipientId: m.recipientId,
        senderId: m.senderId,
        content: m.content,
        createdAt: m.createdAt.toISOString(),
        readAt: m.readAt?.toISOString() ?? null,
        sender: m.sender
          ? {
              id: m.sender.id,
              name: m.sender.name,
              email: m.sender.email,
            }
          : null,
      }));
      return NextResponse.json(mapped);
    }

    if (recipientId) {
      await assertCanReadChatMessages({ recipientId });
      const rows = await getMessages({
        dmWithUserId: recipientId,
        currentUserId: session.user.id,
        limit,
        before:
          beforeDate && !Number.isNaN(beforeDate.getTime())
            ? beforeDate
            : undefined,
      });
      const mapped = rows.reverse().map((m) => ({
        id: m.id,
        channelId: m.channelId,
        recipientId: m.recipientId,
        senderId: m.senderId,
        content: m.content,
        createdAt: m.createdAt.toISOString(),
        readAt: m.readAt?.toISOString() ?? null,
        sender: m.sender
          ? {
              id: m.sender.id,
              name: m.sender.name,
              email: m.sender.email,
            }
          : null,
      }));
      return NextResponse.json(mapped);
    }

    return apiClientError(
      brand.labels.apiChatChannelOrRecipientRequired,
      400,
      "INVALID_INPUT",
      undefined,
      request
    );
  } catch (e) {
    return apiErrorResponse(e, "GET /api/chat/messages", { request });
  }
}

export async function POST(request: Request) {
  const session = await requireAuthSession();
  try {
    let allowed = true;
    try {
      allowed = await consumeRateLimitBucket(
        `chat:send:${session.user.id}`,
        90,
        60_000
      );
    } catch {
      allowed = true;
    }
    if (!allowed) {
      return apiClientError(brand.labels.apiTooManyRequests, 429, undefined, undefined, request);
    }

    const json = await request.json();
    const content = typeof json.content === "string" ? json.content.trim() : "";
    if (content.length < 1) {
      return apiClientError(
        brand.labels.apiChatEmptyMessage,
        400,
        "INVALID_INPUT",
        undefined,
        request
      );
    }
    const channelId =
      typeof json.channelId === "string" ? json.channelId : undefined;
    const recipientId =
      typeof json.recipientId === "string" ? json.recipientId : undefined;
    const msg = await createMessage({
      senderId: session.user.id,
      channelId: channelId ?? null,
      recipientId: recipientId ?? null,
      content,
    });
    return NextResponse.json({
      id: msg!.id,
      channelId: msg!.channelId,
      recipientId: msg!.recipientId,
      senderId: msg!.senderId,
      content: msg!.content,
      createdAt: msg!.createdAt.toISOString(),
      readAt: msg!.readAt?.toISOString() ?? null,
      sender: msg!.sender
        ? {
            id: msg!.sender.id,
            name: msg!.sender.name,
            email: msg!.sender.email,
          }
        : null,
    });
  } catch (e) {
    return apiErrorResponse(e, "POST /api/chat/messages", { request });
  }
}
