import type { NextAuthConfig } from "next-auth";
import { NextResponse } from "next/server";
import { brand } from "@/config/brand";

/**
 * Edge/Middleware-tauglich: kein Drizzle/pg.
 * Nur session/callbacks/authorized hier; Provider liegen in auth.ts.
 */
export const authConfig = {
  trustHost: process.env.AUTH_TRUST_HOST === "true" || process.env.NODE_ENV !== "production",
  pages: {
    signIn: "/login",
  },
  providers: [],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.sub = user.id;
        token.role = (user as { role?: "admin" | "teacher" }).role ?? "teacher";
        if (user.image) token.picture = user.image;
      }
      if (trigger === "update" && session?.user?.image !== undefined) {
        token.picture = session.user.image;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        session.user.role = (token.role as "admin" | "teacher") ?? "teacher";
        if (token.picture) session.user.image = token.picture as string;
      }
      return session;
    },
    authorized({ auth, request }) {
      const path = request.nextUrl.pathname;

      if (
        path === "/" ||
        path.startsWith("/login") ||
        path.startsWith("/buchen") ||
        path.startsWith("/datenschutz") ||
        path.startsWith("/impressum") ||
        path.startsWith("/api/auth") ||
        path.startsWith("/api/public")
      ) {
        return true;
      }

      const protectedPrefixes = [
        "/kalender",
        "/gaeste",
        "/rechnungen",
        "/chat",
        "/admin",
      ];
      const isProtected = protectedPrefixes.some(
        (p) => path === p || path.startsWith(`${p}/`)
      );
      if (isProtected) {
        return !!auth?.user;
      }

      if (path.startsWith("/api/")) {
        if (!auth?.user) {
          return NextResponse.json(
            { error: brand.labels.apiUnauthorized },
            { status: 401 }
          );
        }
        return true;
      }

      return true;
    },
  },
} satisfies NextAuthConfig;
