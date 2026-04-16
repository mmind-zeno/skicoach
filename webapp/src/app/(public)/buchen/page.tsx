import { ProductHeroBanner } from "@/components/ui/ProductHeroBanner";
import { ProductPreviewBooking } from "@/components/ui/product-ui-previews";
import { PublicPortalPolicies } from "@/components/public/PublicPortalPolicies";
import { brand } from "@/config/brand";
import { BookingWizard } from "@/features/booking-public/BookingWizard";
import { getGuestCancelMinHours } from "@/lib/guest-cancel-policy";

export default function BuchenPage() {
  const cancelMinHours = getGuestCancelMinHours();
  return (
    <div className="min-h-screen bg-sk-surface">
      <div className="border-b border-sk-outline/20 px-4 pt-8 md:px-6 md:pt-10">
        <ProductHeroBanner
          title={brand.labels.requestServiceCta}
          description={brand.homeLead}
          preview={<ProductPreviewBooking />}
        />
      </div>
      <PublicPortalPolicies cancelMinHours={cancelMinHours} />
      <BookingWizard />
    </div>
  );
}
