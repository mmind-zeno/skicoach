import { ProductHeroBanner } from "@/components/ui/ProductHeroBanner";
import { brand } from "@/config/brand";
import { MonthlyHoursReportPanel } from "@/features/reports/MonthlyHoursReportPanel";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function StundenreportPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/stundenreport");
  }

  const isAdmin = session.user.role === "admin";

  return (
    <>
      <ProductHeroBanner
        title={brand.labels.monthlyHoursReportTitle}
        description={brand.labels.monthlyHoursReportIntro}
        preview={
          <div className="rounded-xl border border-sk-ink/10 bg-white/80 px-4 py-6 text-center text-sm text-sk-ink/60">
            {brand.labels.monthlyHoursMonthLabel} · {brand.labels.monthlyHoursProductive}{" "}
            + {brand.labels.monthlyHoursInternalTotal}
          </div>
        }
      />
      <MonthlyHoursReportPanel isAdmin={isAdmin} />
    </>
  );
}
