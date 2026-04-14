import { NextResponse } from "next/server";
import { brand } from "@/config/brand";
import { featureSnapshot } from "@/lib/features";

export const dynamic = "force-dynamic";

/**
 * Öffentlicher Health-Check (Caddy/Monitoring). Keine DB — schnell & ohne Secrets.
 */
export async function GET() {
  const gitSha =
    process.env.VERCEL_GIT_COMMIT_SHA?.trim() ||
    process.env.GIT_COMMIT?.trim() ||
    process.env.NEXT_PUBLIC_GIT_SHA?.trim() ||
    undefined;
  return NextResponse.json({
    ok: true,
    service: brand.serviceSlug,
    version: process.env.NEXT_PUBLIC_APP_VERSION ?? "unknown",
    ...(gitSha ? { gitSha } : {}),
    features: featureSnapshot(),
    ts: new Date().toISOString(),
  });
}
