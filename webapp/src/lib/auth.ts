import NextAuth from "next-auth";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { eq } from "drizzle-orm";
import Resend from "next-auth/providers/resend";
import { authConfig } from "./auth.config";
import { clientIp } from "./client-ip";
import { getDb } from "./db";
import { consumeRateLimitBucket } from "./rate-limit-db";
import { authAdapterTables, users } from "../../drizzle/schema";
import { magicLinkHtml, magicLinkText } from "./auth-email-templates";
import { UnauthorizedError, ForbiddenError } from "./errors";
import type { Session } from "next-auth";

async function enforceMagicLinkRateLimits(
  request: Request,
  email: string
): Promise<void> {
  const ip = clientIp(request);
  const normalized = email.trim().toLowerCase();
  const minuteSlot = Math.floor(Date.now() / 60_000);
  const hourSlot = Math.floor(Date.now() / 3_600_000);
  try {
    const ipOk = await consumeRateLimitBucket(
      `signin:ip:${ip}:${minuteSlot}`,
      14,
      60_000
    );
    if (!ipOk) {
      throw new Error(
        "Zu viele Anmeldeversuche von diesem Netzwerk. Bitte später erneut."
      );
    }
    const emailOk = await consumeRateLimitBucket(
      `signin:email:${normalized}:${hourSlot}`,
      10,
      3_600_000
    );
    if (!emailOk) {
      throw new Error(
        "Zu viele Anmeldeversuche für diese E-Mail. Bitte später erneut."
      );
    }
  } catch (e) {
    if (e instanceof Error && e.message.startsWith("Zu viele")) throw e;
  }
}

const resendEmail = Resend({
  apiKey: process.env.RESEND_API_KEY ?? "",
  from: process.env.RESEND_FROM_EMAIL ?? "skicoach@localhost",
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    {
      ...resendEmail,
      async sendVerificationRequest(params) {
        await enforceMagicLinkRateLimits(params.request, params.identifier);
        const { identifier: to, provider, url, theme } = params;
        const { host } = new URL(url);
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${provider.apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: provider.from,
            to,
            subject: `Anmeldung bei ${host}`,
            html: magicLinkHtml({ url, host, theme }),
            text: magicLinkText({ url, host }),
          }),
        });
        if (!res.ok) {
          throw new Error("Resend error: " + JSON.stringify(await res.json()));
        }
      },
    },
  ],
  adapter: DrizzleAdapter(getDb(), authAdapterTables),
  useSecureCookies: process.env.NODE_ENV === "production",
  callbacks: {
    ...authConfig.callbacks,
    async signIn({ user }) {
      if (!user?.email) {
        return false;
      }
      // E-Mail-Provider: signIn läuft vor createUser — neuer Nutzer hat noch keine Zeile.
      const row = await getDb().query.users.findFirst({
        where: eq(users.email, user.email),
        columns: { isActive: true },
      });
      // Nur-Einladung später: hier `return false`, wenn keine Zeile existieren darf.
      if (!row) {
        return true;
      }
      return row.isActive;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.sub = user.id;
        let role = (user as { role?: "admin" | "teacher" }).role;
        if (!role && user.id) {
          const row = await getDb().query.users.findFirst({
            where: eq(users.id, user.id),
            columns: { role: true },
          });
          role = row?.role ?? undefined;
        }
        token.role = role ?? "teacher";
        if (user.image) token.picture = user.image;
      }
      if (trigger === "update" && session?.user?.image !== undefined) {
        token.picture = session.user.image;
      }
      return token;
    },
  },
});

export async function getSession(): Promise<Session | null> {
  return auth();
}

export async function requireAuth(): Promise<Session> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new UnauthorizedError();
  }
  return session;
}

export async function requireAdmin(): Promise<Session> {
  const session = await requireAuth();
  if (session.user.role !== "admin") {
    throw new ForbiddenError();
  }
  return session;
}
