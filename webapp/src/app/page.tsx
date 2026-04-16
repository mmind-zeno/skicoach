import Link from "next/link";
import { PublicSiteHeader } from "@/components/public/PublicSiteHeader";
import { ProductHeroBanner } from "@/components/ui/ProductHeroBanner";
import { ProductPreviewBooking } from "@/components/ui/product-ui-previews";
import { brand } from "@/config/brand";
import { featurePublicBooking } from "@/lib/features";
import { isMaintenanceMode } from "@/lib/maintenance-mode";

const ctaClassPrimary =
  "inline-flex min-h-[48px] w-full items-center justify-center rounded-xl bg-gradient-to-r from-sk-cta to-sk-cta-mid px-5 text-base font-semibold text-white shadow-sm transition hover:from-sk-cta-hover hover:to-sk-cta-mid active:scale-[0.99] sm:w-auto sm:px-6";

const ctaClassSecondary =
  "inline-flex min-h-[48px] w-full items-center justify-center rounded-xl border-2 border-sk-brand/45 bg-white px-5 text-base font-semibold text-sk-brand transition hover:bg-sk-highlight active:scale-[0.99] sm:w-auto sm:px-6";

export default function Home() {
  const maintenance = isMaintenanceMode() && featurePublicBooking();
  return (
    <div className="min-h-screen bg-sk-surface text-sk-ink">
      <PublicSiteHeader />
      <main className="public-safe-x pb-10 pt-2 sm:pb-12 sm:pt-4 md:pt-6">
        <div className="mx-auto max-w-5xl">
          {maintenance ? (
            <div
              className="mb-6 rounded-xl border border-amber-200/80 bg-amber-50 px-4 py-3.5 text-sm text-amber-950"
              role="status"
            >
              <p className="font-medium">{brand.labels.homeMaintenanceBannerText}</p>
              <p className="mt-2">
                <Link
                  href="/wartung"
                  className="inline-flex min-h-[44px] items-center font-semibold text-sk-brand underline hover:text-sk-cta"
                >
                  {brand.labels.homeMaintenanceBannerCta}
                </Link>
              </p>
            </div>
          ) : null}
          <ProductHeroBanner
            title={brand.siteName}
            description={brand.homeLead}
            preview={<ProductPreviewBooking />}
          />
          <div className="mt-2 rounded-2xl border border-sk-outline/25 bg-white p-5 shadow-sk-ambient sm:p-6 md:p-8">
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              {featurePublicBooking() ? (
                <Link href="/buchen" className={ctaClassPrimary}>
                  {brand.labels.requestServiceCta}
                </Link>
              ) : null}
              <Link href="/kalender" className={ctaClassSecondary}>
                {brand.labels.teamLoginHome}
              </Link>
            </div>
          </div>
        </div>
      </main>
      <footer className="public-safe-x public-safe-b border-t border-sk-ink/10 py-8 text-center text-xs text-sk-ink/50">
        <div className="mx-auto flex max-w-5xl flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center sm:gap-x-2">
          <a
            href={`mailto:${brand.supportEmail}`}
            className="inline-flex min-h-[44px] items-center justify-center underline hover:text-sk-brand sm:min-h-0"
          >
            {brand.labels.navContact}
          </a>
          <span className="hidden sm:inline" aria-hidden>
            ·
          </span>
          <Link
            href="/datenschutz"
            className="inline-flex min-h-[44px] items-center justify-center underline hover:text-sk-brand sm:min-h-0"
          >
            {brand.labels.navPrivacy}
          </Link>
          <span className="hidden sm:inline" aria-hidden>
            ·
          </span>
          <Link
            href="/impressum"
            className="inline-flex min-h-[44px] items-center justify-center underline hover:text-sk-brand sm:min-h-0"
          >
            {brand.labels.navImpressum}
          </Link>
        </div>
        <div className="mx-auto mt-4 max-w-5xl text-[10px] leading-relaxed text-sk-ink/60">
          {brand.labels.publicFooterTestProjectLine}
        </div>
        <div className="mx-auto mt-2 max-w-5xl text-[10px] text-sk-ink/60">
          {brand.labels.publicFooterLegalPrefix}{" "}
          {brand.labels.privacyHostingNoteBeforeLink}
          <a
            className="underline hover:text-sk-brand"
            href={brand.labels.privacyHostingNoteLinkUrl}
            target="_blank"
            rel="noreferrer"
          >
            {brand.labels.privacyHostingNoteLinkText}
          </a>
          {brand.labels.privacyHostingNoteAfterLink}
        </div>
      </footer>
    </div>
  );
}
