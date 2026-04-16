import type { Metadata } from "next";
import { PublicPilotPageHero } from "@/components/public/PublicPilotPageHero";
import { PublicPortalPolicies } from "@/components/public/PublicPortalPolicies";
import { GuestPortalPageClient } from "@/features/public-booking/GuestPortalPageClient";
import { brand } from "@/config/brand";
import { getGuestCancelMinHours } from "@/lib/guest-cancel-policy";
import { isLandingPilotEnabled } from "@/lib/landing-pilot";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: brand.labels.guestPortalPageTitle,
  description: brand.labels.guestPortalPageIntro,
  alternates: { canonical: "/buchen/meine-termine" },
  robots: { index: true, follow: true },
};

export default function MeineTerminePage() {
  const cancelMinHours = getGuestCancelMinHours();
  const pilot = isLandingPilotEnabled();
  return (
    <>
      {pilot ? (
        <div className="public-safe-x pt-5 sm:pt-7 md:px-6 md:pt-9">
          <PublicPilotPageHero
            title={brand.labels.guestPortalPageTitle}
            description={brand.labels.guestPortalPageIntro}
          />
        </div>
      ) : null}
      <PublicPortalPolicies cancelMinHours={cancelMinHours} />
      <GuestPortalPageClient
        cancelMinHours={cancelMinHours}
        pilot={pilot}
      />
    </>
  );
}
