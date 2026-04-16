import type { Metadata } from "next";
import { brand } from "@/config/brand";
import { PublicPortalPolicies } from "@/components/public/PublicPortalPolicies";
import { GuestPortalPageClient } from "@/features/public-booking/GuestPortalPageClient";
import { getGuestCancelMinHours } from "@/lib/guest-cancel-policy";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: brand.labels.guestPortalPageTitle,
  description: brand.labels.guestPortalPageIntro,
  alternates: { canonical: "/buchen/meine-termine" },
  robots: { index: true, follow: true },
};

export default function MeineTerminePage() {
  const cancelMinHours = getGuestCancelMinHours();
  return (
    <>
      <PublicPortalPolicies cancelMinHours={cancelMinHours} />
      <GuestPortalPageClient cancelMinHours={cancelMinHours} />
    </>
  );
}
