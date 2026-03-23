import { NextResponse } from "next/server";
import { brand } from "@/config/brand";

export const dynamic = "force-dynamic";

/**
 * Öffentlicher Health-Check (Caddy/Monitoring). Keine DB — schnell & ohne Secrets.
 */
export async function GET() {
  return NextResponse.json({
    ok: true,
    service: brand.serviceSlug,
    version: process.env.NEXT_PUBLIC_APP_VERSION ?? "unknown",
    ts: new Date().toISOString(),
  });
}
