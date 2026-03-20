import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Anmelden · skicoach",
  description: "Team-Login per Magic-Link",
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
