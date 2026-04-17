import type { NextAuthConfig } from "next-auth";
import { NextResponse } from "next/server";
import { brand } from "@/config/brand";
import {
  featureChat,
  featureICal,
  featureInvoices,
  featurePublicBooking,
} from "@/lib/features";

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

      if (path.startsWith("/api/calendar/ical")) {
        if (!featureICal()) {
          return NextResponse.json(
            { error: brand.labels.apiNotFound, code: "NOT_FOUND" },
            { status: 404 }
          );
        }
        return true;
      }

      if (!featurePublicBooking()) {
        const guestPortalBuchen =
          path === "/buchen/meine-termine" ||
          path.startsWith("/buchen/meine-termine/");
        if (
          (path === "/buchen" || path.startsWith("/buchen/")) &&
          !guestPortalBuchen
        ) {
          return NextResponse.redirect(new URL("/", request.url));
        }
        if (
          path.startsWith("/api/public/slots") ||
          path.startsWith("/api/public/availability") ||
          path.startsWith("/api/public/requests") ||
          path.startsWith("/api/public/course-types")
        ) {
          return NextResponse.json(
            { error: brand.labels.apiForbidden, code: "FEATURE_DISABLED" },
            { status: 403 }
          );
        }
      }

      if (auth?.user) {
        if (!featureInvoices() && (path === "/rechnungen" || path.startsWith("/rechnungen/"))) {
          return NextResponse.redirect(new URL("/kalender", request.url));
        }
        if (!featureChat() && (path === "/chat" || path.startsWith("/chat/"))) {
          return NextResponse.redirect(new URL("/kalender", request.url));
        }
        if (!featureInvoices() && path.startsWith("/api/invoices")) {
          return NextResponse.json(
            { error: brand.labels.apiNotFound, code: "NOT_FOUND" },
            { status: 404 }
          );
        }
        if (!featureChat() && path.startsWith("/api/chat")) {
          return NextResponse.json(
            { error: brand.labels.apiNotFound, code: "NOT_FOUND" },
            { status: 404 }
          );
        }
      }

      if (
        path === "/" ||
        path.startsWith("/login") ||
        path.startsWith("/buchen") ||
        path.startsWith("/datenschutz") ||
        path.startsWith("/impressum") ||
        path.startsWith("/wartung") ||
        path.startsWith("/api/auth") ||
        path.startsWith("/api/public")
      ) {
        return true;
      }

      const protectedPrefixes = [
        "/kalender",
        "/gaeste",
        "/rechnungen",
        "/stundenreport",
        "/lohnabrechnung",
        "/chat",
        "/admin",
        "/konto",
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
