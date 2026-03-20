import { NextResponse } from "next/server";
import { requireAdminSession, requireAuthSession } from "@/lib/auth-helpers";
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
    return NextResponse.json({ error: "Name zu kurz" }, { status: 400 });
  }
  const ch = await createChannel(name);
  return NextResponse.json(ch, { status: 201 });
}
