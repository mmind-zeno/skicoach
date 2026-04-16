import type { MetadataRoute } from "next";
import { getPublicSiteOrigin } from "@/lib/site-url";

export default function robots(): MetadataRoute.Robots {
  const origin = getPublicSiteOrigin();
  const host = origin.replace(/^https?:\/\//, "");
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin",
          "/admin/",
          "/kalender",
          "/gaeste",
          "/rechnungen",
          "/chat",
          "/stundenreport",
          "/lohnabrechnung",
          "/login",
          "/api/",
        ],
      },
    ],
    sitemap: `${origin}/sitemap.xml`,
    host,
  };
}
