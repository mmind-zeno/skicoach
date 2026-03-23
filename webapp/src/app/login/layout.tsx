import type { Metadata } from "next";
import { brand } from "@/config/brand";

export const metadata: Metadata = {
  title: `Anmelden · ${brand.siteName}`,
  description: `${brand.labels.teamLoginHome} per Magic-Link`,
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
