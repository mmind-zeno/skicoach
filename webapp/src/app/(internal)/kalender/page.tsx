import { ProductHeroBanner } from "@/components/ui/ProductHeroBanner";
import { ProductPreviewCalendar } from "@/components/ui/product-ui-previews";
import { brand } from "@/config/brand";
import { CalendarShell } from "@/features/calendar/components/CalendarShell";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";

export default async function KalenderPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/kalender");
  }

  return (
    <>
      <ProductHeroBanner
        title={brand.labels.navCalendar}
        description={brand.marketingTagline}
        preview={<ProductPreviewCalendar />}
      />
      <Suspense
        fallback={
          <p className="text-sm text-sk-ink/60">
            {brand.labels.navPageLoadingTemplate.replace(
              "{navTitle}",
              brand.labels.navCalendar
            )}
          </p>
        }
      >
        <CalendarShell
          userId={session.user.id}
          isAdmin={session.user.role === "admin"}
        />
      </Suspense>
    </>
  );
}
