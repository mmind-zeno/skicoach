import { NextResponse } from "next/server";
import { brand } from "@/config/brand";
import { featureICal } from "@/lib/features";
import { signIcalFeedToken } from "@/lib/ical-feed-token";
import { auth } from "@/lib/auth";

function requestOrigin(request: Request): string {
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (fromEnv) {
    try {
      return new URL(fromEnv).origin;
    } catch {
      /* fall through */
    }
  }
  const host =
    request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  const proto = request.headers.get("x-forwarded-proto") ?? "https";
  if (host) {
    return `${proto}://${host}`;
  }
  return "http://localhost:3000";
}

export async function GET(request: Request) {
  if (!featureICal()) {
    return NextResponse.json(
      { error: brand.labels.apiNotFound, code: "NOT_FOUND" },
      { status: 404 }
    );
  }

  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: brand.labels.apiUnauthorized, code: "UNAUTHORIZED" },
      { status: 401 }
    );
  }

  const token = signIcalFeedToken(session.user.id);
  const origin = requestOrigin(request);
  const path = `/api/calendar/ical?token=${encodeURIComponent(token)}`;
  const httpsUrl = `${origin}${path}`;
  const parsed = new URL(httpsUrl);
  const webcalUrl = `webcal://${parsed.host}${parsed.pathname}${parsed.search}`;

  return NextResponse.json({
    data: {
      httpsUrl,
      webcalUrl,
      approxValidDays: 365,
    },
  });
}
