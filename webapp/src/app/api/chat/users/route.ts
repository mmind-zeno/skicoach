import { NextResponse } from "next/server";
import { requireAuthSession } from "@/lib/auth-helpers";
import { listAllUsersForChat } from "@/services/chat.service";

export async function GET() {
  const session = await requireAuthSession();
  const rows = await listAllUsersForChat();
  return NextResponse.json(
    rows
      .filter((u) => u.id !== session.user.id)
      .map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
      }))
  );
}
