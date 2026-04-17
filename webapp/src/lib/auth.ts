import NextAuth from "next-auth";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import { eq } from "drizzle-orm";
import Credentials from "next-auth/providers/credentials";
import Resend from "next-auth/providers/resend";
import { authConfig } from "./auth.config";
import { clientIp } from "./client-ip";
import { getDb } from "./db";
import { consumeRateLimitBucket } from "./rate-limit-db";
import { authAdapterTables, users } from "../../drizzle/schema";
import { magicLinkHtml, magicLinkText } from "./auth-email-templates";
import { brand, getAuthResendFromEmail } from "@/config/brand";
import { UnauthorizedError, ForbiddenError } from "./errors";
import { verifyPassword, verifyPasswordDummy } from "./password-hash";
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
      throw new Error(brand.labels.authSignInRateLimitIp);
    }
    const emailOk = await consumeRateLimitBucket(
      `signin:email:${normalized}:${hourSlot}`,
      10,
      3_600_000
    );
    if (!emailOk) {
      throw new Error(brand.labels.authSignInRateLimitEmail);
    }
  } catch (e) {
    if (
      e instanceof Error &&
      (e.message === brand.labels.authSignInRateLimitIp ||
        e.message === brand.labels.authSignInRateLimitEmail)
    ) {
      throw e;
    }
  }
}

async function authorizePasswordCredentials(
  rawEmail: unknown,
  rawPassword: unknown
): Promise<{
  id: string;
  email: string;
  name?: string | null;
  role: "admin" | "teacher";
} | null> {
  const email =
    typeof rawEmail === "string" ? rawEmail.trim().toLowerCase() : "";
  const password = typeof rawPassword === "string" ? rawPassword : "";
  if (!email.includes("@") || password.length < 1) {
    return null;
  }

  try {
    const hourSlot = Math.floor(Date.now() / 3_600_000);
    const rateOk = await consumeRateLimitBucket(
      `signin:pw:${email}:${hourSlot}`,
      40,
      3_600_000
    );
    if (!rateOk) {
      return null;
    }
  } catch {
    /* Rate-Limit-DB optional — Login nicht hart blockieren */
  }

  const row = await getDb().query.users.findFirst({
    where: eq(users.email, email),
    columns: {
      id: true,
      email: true,
      name: true,
      role: true,
      passwordHash: true,
    },
  });

  if (!row?.passwordHash) {
    await verifyPasswordDummy(password);
    return null;
  }

  const valid = await verifyPassword(password, row.passwordHash);
  if (!valid) {
    return null;
  }

  return {
    id: row.id,
    email: row.email,
    name: row.name,
    role: row.role,
  };
}

const resendEmail = Resend({
  apiKey: process.env.RESEND_API_KEY ?? "",
  from: getAuthResendFromEmail(),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      id: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => authorizePasswordCredentials(
        credentials?.email,
        credentials?.password
      ),
    }),
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
