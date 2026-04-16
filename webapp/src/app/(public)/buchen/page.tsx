import type { Metadata } from "next";
import { PublicPilotPageHero } from "@/components/public/PublicPilotPageHero";
import { ProductHeroBanner } from "@/components/ui/ProductHeroBanner";
import { ProductPreviewBooking } from "@/components/ui/product-ui-previews";
import { PublicPortalPolicies } from "@/components/public/PublicPortalPolicies";
import { brand } from "@/config/brand";
import { BookingWizard } from "@/features/booking-public/BookingWizard";
import { getGuestCancelMinHours } from "@/lib/guest-cancel-policy";
import { isLandingPilotEnabled } from "@/lib/landing-pilot";

export const metadata: Metadata = {
  title: brand.labels.requestServiceCta,
  description: brand.marketingTagline,
  alternates: { canonical: "/buchen" },
};

export default function BuchenPage() {
  const cancelMinHours = getGuestCancelMinHours();
  const pilot = isLandingPilotEnabled();

  if (pilot) {
    return (
      <div className="min-h-0">
        <div className="public-safe-x pt-5 sm:pt-7 md:px-6 md:pt-9">
          <PublicPilotPageHero
            atmosphere="booking"
            title={brand.labels.requestServiceCta}
            description={brand.homeLead}
            preview={<ProductPreviewBooking />}
          />
        </div>
        <PublicPortalPolicies cancelMinHours={cancelMinHours} />
        <BookingWizard pilot />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sk-surface">
      <div className="border-b border-sk-outline/20 public-safe-x pt-6 sm:pt-8 md:px-6 md:pt-10">
        <ProductHeroBanner
          title={brand.labels.requestServiceCta}
          description={brand.homeLead}
          preview={<ProductPreviewBooking />}
        />
      </div>
      <PublicPortalPolicies cancelMinHours={cancelMinHours} />
      <BookingWizard pilot={false} />
    </div>
  );
}
