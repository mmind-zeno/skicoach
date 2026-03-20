import type { Session } from "next-auth";
import { auth } from "./auth";
import { ForbiddenError, UnauthorizedError } from "./errors";

export type AuthedSession = Session & {
  user: NonNullable<Session["user"]> & { id: string; role: "admin" | "teacher" };
};

export async function requireAuthSession(): Promise<AuthedSession> {
  const session = await auth();
  const id = session?.user?.id;
  const role = session?.user?.role;
  if (!session?.user || !id || !role) {
    throw new UnauthorizedError();
  }
  return session as AuthedSession;
}

export async function requireAdminSession(): Promise<AuthedSession> {
  const s = await requireAuthSession();
  if (s.user.role !== "admin") throw new ForbiddenError();
  return s;
}
