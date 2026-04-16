import { brand } from "@/config/brand";

/**
 * Kanonische Basis-URL ohne trailing slash — für Metadata, Sitemap, robots.
 * Reihenfolge: NEXT_PUBLIC_APP_URL → NEXTAUTH_URL → https://{siteDomain}
 */
export function getPublicSiteOrigin(): string {
  const raw =
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    process.env.NEXTAUTH_URL?.trim() ||
    "";
  if (raw) return raw.replace(/\/+$/, "");
  return `https://${brand.siteDomain}`;
}
