import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Öffentlicher Health-Check (Caddy/Monitoring). Keine DB — schnell & ohne Secrets.
 */
export async function GET() {
  return NextResponse.json({
    ok: true,
    service: "skicoach-webapp",
    version: process.env.NEXT_PUBLIC_APP_VERSION ?? "unknown",
    ts: new Date().toISOString(),
  });
}
