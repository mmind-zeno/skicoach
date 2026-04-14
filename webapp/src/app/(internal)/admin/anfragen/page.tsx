import { ProductHeroBanner } from "@/components/ui/ProductHeroBanner";
import { ProductPreviewAdminRequests } from "@/components/ui/product-ui-previews";
import { brand } from "@/config/brand";
import { BookingRequestsAdmin } from "@/features/admin/components/BookingRequestsAdmin";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminAnfragenPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/admin/anfragen");
  if (session.user.role !== "admin") redirect("/kalender");

  return (
    <>
      <ProductHeroBanner
        title={brand.labels.bookingRequestPlural}
        description={brand.marketingTagline}
        preview={<ProductPreviewAdminRequests />}
      />
      <BookingRequestsAdmin />
    </>
  );
}
