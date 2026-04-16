import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { brand } from "@/config/brand";
import { getPublicSiteOrigin } from "@/lib/site-url";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
  display: "swap",
});

const siteOrigin = getPublicSiteOrigin();
const ogLocale = brand.htmlLang === "en" ? "en_US" : "de_DE";

export const metadata: Metadata = {
  metadataBase: new URL(`${siteOrigin}/`),
  title: {
    default: brand.siteName,
    template: `%s · ${brand.siteName}`,
  },
  description: brand.marketingTagline,
  applicationName: brand.siteName,
  openGraph: {
    type: "website",
    locale: ogLocale,
    siteName: brand.siteName,
    title: brand.siteName,
    description: brand.marketingTagline,
    url: siteOrigin,
  },
  twitter: {
    card: "summary",
    title: brand.siteName,
    description: brand.marketingTagline,
  },
  appleWebApp: {
    capable: true,
    title: brand.siteName,
    statusBarStyle: "default",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#305f9b" },
    { media: "(prefers-color-scheme: dark)", color: "#181c20" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang={brand.htmlLang}>
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
