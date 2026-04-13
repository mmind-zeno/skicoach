import type { Metadata } from "next";
import { brand } from "@/config/brand";

export const metadata: Metadata = {
  title: brand.labels.loginMetadataTitleTemplate.replace(
    "{siteName}",
    brand.siteName
  ),
  description: brand.labels.loginMetadataDescriptionTemplate.replace(
    "{teamLoginHome}",
    brand.labels.teamLoginHome
  ),
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
