import { NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/auth-helpers";
import {
  getBookingsByMonth,
  getRevenueByTeacher,
  getStats,
} from "@/services/admin.service";

export async function GET(request: Request) {
  await requireAdminSession();
  const { searchParams } = new URL(request.url);
  const year = Number(searchParams.get("year") ?? new Date().getFullYear());
  const month = Number(
    searchParams.get("month") ?? new Date().getMonth() + 1
  );
  const stats = await getStats();
  const byTeacher = await getRevenueByTeacher(year, month);
  const byMonth = await getBookingsByMonth(year);
  return NextResponse.json({ stats, byTeacher, byMonth });
}
