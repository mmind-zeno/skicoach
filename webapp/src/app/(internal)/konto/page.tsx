import { AccountPasswordForm } from "@/features/auth/components/AccountPasswordForm";
import { PageHeader } from "@/components/ui/PageHeader";
import { brand } from "@/config/brand";
import { auth } from "@/lib/auth";
import { isLandingPilotEnabled } from "@/lib/landing-pilot";
import { redirect } from "next/navigation";

export default async function KontoPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/konto");
  }

  const ascent = isLandingPilotEnabled();

  const cardClass = ascent
    ? "rounded-2xl border border-[var(--ascent-primary)]/15 bg-white/95 p-6 shadow-[0_16px_40px_-20px_rgba(0,88,188,0.2)] ring-1 ring-[var(--ascent-primary)]/10 sm:p-8"
    : "rounded-2xl border border-sk-outline/20 bg-white p-6 shadow-sk-ambient sm:p-8";

  const leadClass = ascent
    ? "mb-6 text-sm text-[var(--ascent-on-surface-variant)]"
    : "mb-6 text-sm text-sk-ink/75";

  const h2Class = ascent
    ? "text-lg font-semibold text-[var(--ascent-on-surface)]"
    : "text-lg font-semibold text-sk-ink";

  return (
    <>
      <PageHeader title={brand.labels.accountPageTitle} />
      <div className={cardClass}>
        <h2 className={h2Class}>{brand.labels.accountPasswordSectionTitle}</h2>
        <p className={leadClass}>{brand.labels.accountPasswordSectionLead}</p>
        <AccountPasswordForm ascent={ascent} />
      </div>
    </>
  );
}
