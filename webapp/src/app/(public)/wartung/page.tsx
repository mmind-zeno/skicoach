import Link from "next/link";
import type { Metadata } from "next";
import { brand } from "@/config/brand";

export const metadata: Metadata = {
  title: brand.labels.maintenancePageTitle,
  description: brand.labels.maintenancePageMetaDescription,
  alternates: { canonical: "/wartung" },
  robots: { index: false, follow: true },
};

export default function WartungPage() {
  return (
    <div className="public-safe-x min-h-[60vh] px-0 py-12 sm:py-16 md:px-6">
      <main className="mx-auto max-w-lg rounded-2xl border border-sk-outline/25 bg-white p-6 shadow-sk-ambient sm:p-8 md:p-10">
        <p className="text-sm font-medium uppercase tracking-wide text-sk-cta">
          {brand.labels.maintenancePageBadge}
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-sk-ink">
          {brand.labels.maintenancePageTitle}
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-sk-ink/80">
          {brand.labels.maintenancePageBody}
        </p>
        <p className="mt-4 text-sm leading-relaxed text-sk-ink/70">
          {brand.labels.maintenancePageMagicLinkHint}
        </p>
        <p className="mt-4 text-sm text-sk-ink/80">
          <a
            href={`mailto:${brand.supportEmail}`}
            className="font-medium text-sk-brand underline hover:text-sk-cta"
          >
            {brand.supportEmail}
          </a>
        </p>
        <ul className="mt-6 flex flex-col gap-1 text-sm sm:flex-row sm:flex-wrap sm:gap-4">
          <li>
            <Link
              href="/datenschutz"
              className="inline-flex min-h-[44px] items-center font-medium text-sk-brand underline hover:text-sk-cta"
            >
              {brand.labels.navPrivacy}
            </Link>
          </li>
          <li>
            <Link
              href="/impressum"
              className="inline-flex min-h-[44px] items-center font-medium text-sk-brand underline hover:text-sk-cta"
            >
              {brand.labels.navImpressum}
            </Link>
          </li>
          <li>
            <Link
              href="/"
              className="inline-flex min-h-[44px] items-center font-medium text-sk-brand underline hover:text-sk-cta"
            >
              {brand.labels.navHome}
            </Link>
          </li>
        </ul>
      </main>
    </div>
  );
}
