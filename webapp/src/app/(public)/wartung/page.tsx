import Link from "next/link";
import type { Metadata } from "next";
import { brand } from "@/config/brand";
import { isLandingPilotEnabled } from "@/lib/landing-pilot";

export const metadata: Metadata = {
  title: brand.labels.maintenancePageTitle,
  description: brand.labels.maintenancePageMetaDescription,
  alternates: { canonical: "/wartung" },
  robots: { index: false, follow: true },
};

export default function WartungPage() {
  const pilot = isLandingPilotEnabled();

  const card = pilot
    ? "mx-auto max-w-lg rounded-2xl bg-white/92 p-6 shadow-[0_24px_48px_-16px_rgba(0,88,188,0.2)] ring-1 ring-[var(--ascent-primary)]/10 sm:p-8 md:p-10"
    : "mx-auto max-w-lg rounded-2xl border border-sk-outline/25 bg-white p-6 shadow-sk-ambient sm:p-8 md:p-10";

  const badge = pilot
    ? "text-sm font-medium uppercase tracking-wide text-[var(--ascent-primary)]"
    : "text-sm font-medium uppercase tracking-wide text-sk-cta";

  const h1 = pilot
    ? "mt-2 text-2xl font-semibold tracking-tight text-[var(--ascent-on-surface)]"
    : "mt-2 text-2xl font-semibold tracking-tight text-sk-ink";

  const p = pilot
    ? "mt-4 text-sm leading-relaxed text-[var(--ascent-on-surface-variant)]"
    : "mt-4 text-sm leading-relaxed text-sk-ink/80";

  const pMuted = pilot
    ? "mt-4 text-sm leading-relaxed text-[var(--ascent-on-surface-variant)]"
    : "mt-4 text-sm leading-relaxed text-sk-ink/70";

  const mail = pilot
    ? "font-medium text-[var(--ascent-primary)] underline underline-offset-2 hover:opacity-90"
    : "font-medium text-sk-brand underline hover:text-sk-cta";

  const navLink = pilot
    ? "inline-flex min-h-[44px] items-center font-medium text-[var(--ascent-primary)] underline underline-offset-2 hover:opacity-90"
    : "inline-flex min-h-[44px] items-center font-medium text-sk-brand underline hover:text-sk-cta";

  return (
    <div className="public-safe-x min-h-[60vh] px-0 py-12 sm:py-16 md:px-6">
      <main className={card}>
        <p className={badge}>{brand.labels.maintenancePageBadge}</p>
        <h1 className={h1}>{brand.labels.maintenancePageTitle}</h1>
        <p className={p}>{brand.labels.maintenancePageBody}</p>
        <p className={pMuted}>{brand.labels.maintenancePageMagicLinkHint}</p>
        <p className={p}>
          <a href={`mailto:${brand.supportEmail}`} className={mail}>
            {brand.supportEmail}
          </a>
        </p>
        <ul className="mt-6 flex flex-col gap-1 text-sm sm:flex-row sm:flex-wrap sm:gap-4">
          <li>
            <Link href="/datenschutz" className={navLink}>
              {brand.labels.navPrivacy}
            </Link>
          </li>
          <li>
            <Link href="/impressum" className={navLink}>
              {brand.labels.navImpressum}
            </Link>
          </li>
          <li>
            <Link href="/" className={navLink}>
              {brand.labels.navHome}
            </Link>
          </li>
        </ul>
      </main>
    </div>
  );
}
