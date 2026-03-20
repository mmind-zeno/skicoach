import { NextResponse } from "next/server";
import { requireAuthSession } from "@/lib/auth-helpers";
import { monthStats } from "@/services/invoice.service";

export async function GET(request: Request) {
  await requireAuthSession();
  const { searchParams } = new URL(request.url);
  const year = Number(searchParams.get("year") ?? new Date().getFullYear());
  const month = Number(
    searchParams.get("month") ?? new Date().getMonth() + 1
  );
  const s = await monthStats(year, month);
  return NextResponse.json(s);
}
