import Link from "next/link";
import { PublicPilotFooter } from "@/components/public/PublicPilotFooter";
import { PublicSiteHeader } from "@/components/public/PublicSiteHeader";
import { brand } from "@/config/brand";
import { isLandingPilotEnabled } from "@/lib/landing-pilot";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pilot = isLandingPilotEnabled();

  if (pilot) {
    return (
      <div className="landing-pilot min-h-screen bg-[var(--ascent-surface)] text-[var(--ascent-on-surface)]">
        <a href="#public-main" className="skip-to-main">
          {brand.labels.navSkipToContent}
        </a>
        <PublicSiteHeader landingPilot />
        <div id="public-main" tabIndex={-1} className="outline-none">
          {children}
        </div>
        <PublicPilotFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sk-surface text-sk-ink">
      <a href="#public-main" className="skip-to-main">
        {brand.labels.navSkipToContent}
      </a>
      <PublicSiteHeader />
      <div id="public-main" tabIndex={-1} className="outline-none">
        {children}
      </div>
      <footer className="public-safe-x public-safe-b mt-12 border-t border-sk-outline/20 py-8 text-center text-xs text-sk-ink/50 md:mt-16">
        <div className="mx-auto flex max-w-5xl flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center sm:gap-x-2 sm:gap-y-1">
          <a
            href={`mailto:${brand.supportEmail}`}
            className="inline-flex min-h-[44px] items-center justify-center font-medium underline hover:text-sk-brand sm:min-h-0"
          >
            {brand.labels.navContact}
          </a>
          <span className="hidden text-sk-ink/30 sm:inline" aria-hidden>
            ·
          </span>
          <Link
            href="/datenschutz"
            className="inline-flex min-h-[44px] items-center justify-center underline hover:text-sk-brand sm:min-h-0"
          >
            {brand.labels.navPrivacy}
          </Link>
          <span className="hidden text-sk-ink/30 sm:inline" aria-hidden>
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
