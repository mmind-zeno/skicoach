import type { MetadataRoute } from "next";
import { getPublicSiteOrigin } from "@/lib/site-url";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getPublicSiteOrigin();
  const now = new Date();
  const paths = [
    "",
    "/buchen",
    "/buchen/meine-termine",
    "/datenschutz",
    "/impressum",
    "/wartung",
  ];
  return paths.map((path) => ({
    url: path === "" ? `${base}/` : `${base}${path}`,
    lastModified: now,
    changeFrequency: path === "" || path === "/buchen" ? "weekly" : "monthly",
    priority: path === "" ? 1 : path === "/buchen" ? 0.9 : 0.6,
  }));
}
