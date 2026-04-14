import Link from "next/link";
import { ProductHeroBanner } from "@/components/ui/ProductHeroBanner";
import { ProductPreviewBooking } from "@/components/ui/product-ui-previews";
import { brand } from "@/config/brand";
import { featurePublicBooking } from "@/lib/features";

export default function Home() {
  return (
    <div className="min-h-screen bg-sk-surface text-sk-ink">
      <main className="px-4 py-10">
        <div className="mx-auto max-w-5xl">
          <ProductHeroBanner
            title={brand.siteName}
            description={brand.homeLead}
            preview={<ProductPreviewBooking />}
          />
          <div className="mt-2 rounded-2xl border border-sk-outline/25 bg-white p-6 shadow-sk-ambient md:p-8">
            <div className="flex flex-wrap gap-3 text-sm">
              {featurePublicBooking() ? (
                <Link
                  href="/buchen"
                  className="rounded-lg bg-gradient-to-r from-sk-cta to-sk-cta-mid px-4 py-2 text-white shadow-sm transition hover:from-sk-cta-hover hover:to-sk-cta-mid"
                >
                  {brand.labels.requestServiceCta}
                </Link>
              ) : null}
              <Link
                href="/kalender"
                className="rounded-lg border border-sk-brand/40 px-4 py-2 text-sk-brand hover:bg-sk-highlight"
              >
                {brand.labels.teamLoginHome}
              </Link>
            </div>
          </div>
        </div>
      </main>
      <footer className="border-t border-sk-ink/10 py-6 text-center text-xs text-sk-ink/50">
        <a href={`mailto:${brand.supportEmail}`} className="underline hover:text-sk-brand">
          {brand.labels.navContact}
        </a>
        {" · "}
        <Link href="/datenschutz" className="underline hover:text-sk-brand">
          {brand.labels.navPrivacy}
        </Link>
        {" · "}
        <Link href="/impressum" className="underline hover:text-sk-brand">
          {brand.labels.navImpressum}
        </Link>
        <div className="mt-2 text-[10px] leading-relaxed text-sk-ink/60">
          {brand.labels.publicFooterTestProjectLine}
        </div>
        <div className="mt-1 text-[10px] text-sk-ink/60">
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
