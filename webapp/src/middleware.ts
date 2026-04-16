import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { isMaintenanceMode } from "@/lib/maintenance-mode";

export function middleware(request: NextRequest) {
  if (!isMaintenanceMode()) {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;

  // Nur exakter Health-Pfad (kein Prefix-Leak auf z. B. fiktive /api/public/health/*).
  if (pathname === "/api/public/health") {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/public/")) {
    return NextResponse.json(
      {
        error:
          "Das Buchungsportal ist vorübergehend nicht erreichbar. Bitte später erneut versuchen.",
        code: "maintenance",
      },
      {
        status: 503,
        headers: {
          "Retry-After": "120",
          "Cache-Control": "no-store",
        },
      }
    );
  }

  if (pathname === "/buchen" || pathname.startsWith("/buchen/")) {
    const url = request.nextUrl.clone();
    url.pathname = "/wartung";
    // Query absichtlich entfernen: Token aus E-Mails nicht in Referrer/Logs der Wartungs-URL.
    url.search = "";
    return NextResponse.redirect(url, 307);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/buchen", "/buchen/:path*", "/api/public/:path*"],
};
