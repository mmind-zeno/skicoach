import { ProductHeroBanner } from "@/components/ui/ProductHeroBanner";
import { brand } from "@/config/brand";
import { PayrollMonthPanel } from "@/features/reports/PayrollMonthPanel";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function LohnabrechnungPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/lohnabrechnung");
  }

  const isAdmin = session.user.role === "admin";

  return (
    <>
      <ProductHeroBanner
        title={brand.labels.payrollPageTitle}
        description={brand.labels.payrollPageIntro}
        preview={
          <div className="rounded-xl border border-sk-ink/10 bg-white/80 px-4 py-6 text-center text-sm text-sk-ink/60">
            {brand.labels.monthlyHoursMonthLabel} · {brand.labels.payrollRowGross} · PDF
          </div>
        }
      />
      <PayrollMonthPanel isAdmin={isAdmin} />
    </>
  );
}
