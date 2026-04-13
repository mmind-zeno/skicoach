import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth-helpers";
import { findAllRequests } from "@/services/booking-request.service";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  await requireAdminSession();
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") ?? undefined;
  const rows = await findAllRequests(status);
  return NextResponse.json(rows);
}
