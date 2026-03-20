import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth-helpers";
import { countNewRequests } from "@/services/booking-request.service";

export async function GET() {
  await requireAdminSession();
  const count = await countNewRequests();
  return NextResponse.json({ count });
}
