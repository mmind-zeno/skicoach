import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { courseTypes } from "../../../../drizzle/schema";
import { brand } from "@/config/brand";
import { auth } from "@/lib/auth";
import { apiClientError } from "@/lib/api-error";
import { getDb } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return apiClientError(brand.labels.apiUnauthorized, 401);
  }

  const rows = await getDb().query.courseTypes.findMany({
    where: eq(courseTypes.isActive, true),
    orderBy: (c, { asc }) => [asc(c.name)],
  });

  return NextResponse.json(
    rows.map((c) => ({
      id: c.id,
      name: c.name,
      durationMin: c.durationMin,
      priceCHF: c.priceCHF,
      maxParticipants: c.maxParticipants,
      isPublic: c.isPublic,
      isActive: c.isActive,
    }))
  );
}
