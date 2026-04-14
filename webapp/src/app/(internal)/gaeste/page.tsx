import { ProductHeroBanner } from "@/components/ui/ProductHeroBanner";
import { ProductPreviewGuestList } from "@/components/ui/product-ui-previews";
import { brand } from "@/config/brand";
import { GuestsPageClient } from "@/features/guests/components/GuestsPageClient";

export default function GaestePage() {
  return (
    <>
      <ProductHeroBanner
        title={brand.labels.clientPlural}
        description={brand.marketingTagline}
        preview={<ProductPreviewGuestList />}
      />
      <GuestsPageClient />
    </>
  );
}
