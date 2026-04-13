import { and, eq, or } from "drizzle-orm";
import { NextResponse } from "next/server";
import { users } from "../../../../drizzle/schema";
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

  const rows = await getDb().query.users.findMany({
    where: and(
      eq(users.isActive, true),
      or(eq(users.role, "teacher"), eq(users.role, "admin"))
    ),
    columns: {
      id: true,
      name: true,
      email: true,
      colorIndex: true,
    },
    orderBy: (u, { asc }) => [asc(u.name), asc(u.email)],
  });

  return NextResponse.json(rows);
}
