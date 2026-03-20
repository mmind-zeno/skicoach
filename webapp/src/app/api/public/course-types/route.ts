import { and, asc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { courseTypes } from "../../../../../drizzle/schema";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const rows = await getDb().query.courseTypes.findMany({
    where: and(eq(courseTypes.isPublic, true), eq(courseTypes.isActive, true)),
    columns: {
      id: true,
      name: true,
      durationMin: true,
      priceCHF: true,
      maxParticipants: true,
    },
    orderBy: [asc(courseTypes.name)],
  });
  return NextResponse.json(rows);
}
