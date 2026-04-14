import Image from "next/image";
import Link from "next/link";
import { brand } from "@/config/brand";
import { stitchImages } from "@/config/stitch-images";
import { featurePublicBooking } from "@/lib/features";

export default function Home() {
  return (
    <div className="min-h-screen bg-sk-surface text-sk-ink">
      <main className="flex items-center px-4 py-10">
        <div className="mx-auto flex w-full max-w-5xl flex-col items-stretch gap-10 lg:flex-row lg:items-center lg:gap-12">
          <div className="order-2 min-w-0 flex-1 rounded-2xl border border-sk-outline/25 bg-white p-8 shadow-sk-ambient lg:order-1">
            <h1 className="text-3xl font-semibold text-sk-brand">{brand.siteName}</h1>
            <p className="mt-3 max-w-xl text-sm text-sk-ink/70">{brand.homeLead}</p>
            <div className="mt-6 flex flex-wrap gap-3 text-sm">
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
          <div className="relative order-1 mx-auto w-full max-w-lg shrink-0 overflow-hidden rounded-2xl border border-sk-outline/20 shadow-sk-ambient lg:order-2 lg:max-w-md">
            <div className="relative aspect-[4/3] w-full bg-sk-container-low">
              <Image
                src={stitchImages.buchungSlotwahl}
                alt="Vorschau Buchungsportal: Kurs und Termin wählen"
                fill
                sizes="(min-width: 1024px) 28rem, 100vw"
                className="object-cover object-top"
                priority
              />
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
        <div className="mt-2 text-[10px] text-sk-ink/60">
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
