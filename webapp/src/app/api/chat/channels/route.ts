import { NextResponse } from "next/server";
import { brand } from "@/config/brand";
import { requireAdminSession, requireAuthSession } from "@/lib/auth-helpers";
import { apiClientError } from "@/lib/api-error";
import { createChannel, ensureGeneralChannel, getChannels } from "@/services/chat.service";

export async function GET() {
  await requireAuthSession();
  await ensureGeneralChannel();
  const list = await getChannels();
  return NextResponse.json(list);
}

export async function POST(request: Request) {
  await requireAdminSession();
  const json = await request.json();
  const name = typeof json.name === "string" ? json.name : "";
  if (name.length < 2) {
    return apiClientError(
      brand.labels.apiChatChannelNameTooShort,
      400,
      "INVALID_INPUT",
      undefined,
      request
    );
  }
  const ch = await createChannel(name);
  return NextResponse.json(ch, { status: 201 });
}
