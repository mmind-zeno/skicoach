import { and, eq, or } from "drizzle-orm";
import { NextResponse } from "next/server";
import { users } from "../../../../drizzle/schema";
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
