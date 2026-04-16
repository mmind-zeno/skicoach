import type { MetadataRoute } from "next";
import { brand } from "@/config/brand";

/** PWA-Light: Installationshinweis & theme-color (Icons optional / Fork). */
export default function manifest(): MetadataRoute.Manifest {
  const short =
    brand.siteName.length <= 12
      ? brand.siteName
      : brand.siteName.slice(0, 12).trimEnd();
  return {
    name: brand.siteName,
    short_name: short,
    description: brand.marketingTagline,
    start_url: "/",
    display: "standalone",
    background_color: "#f7f9fe",
    theme_color: "#305f9b",
    lang: brand.htmlLang,
    orientation: "portrait-primary",
  };
}
