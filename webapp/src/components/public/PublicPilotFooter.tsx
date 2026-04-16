import Link from "next/link";
import { brand } from "@/config/brand";

/** Footer für `.landing-pilot` (Startseite + öffentliches Layout). */
export function PublicPilotFooter() {
  return (
    <footer className="public-safe-x public-safe-b py-8 text-center text-xs text-[var(--ascent-on-surface-variant)]">
      <div className="mx-auto flex max-w-5xl flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center sm:gap-x-2">
        <a
          href={`mailto:${brand.supportEmail}`}
          className="inline-flex min-h-[44px] items-center justify-center underline decoration-[var(--ascent-primary)]/35 underline-offset-2 hover:text-[var(--ascent-primary)] sm:min-h-0"
        >
          {brand.labels.navContact}
        </a>
        <span className="hidden sm:inline" aria-hidden>
          ·
        </span>
        <Link
          href="/datenschutz"
          className="inline-flex min-h-[44px] items-center justify-center underline decoration-[var(--ascent-primary)]/35 underline-offset-2 hover:text-[var(--ascent-primary)] sm:min-h-0"
        >
          {brand.labels.navPrivacy}
        </Link>
        <span className="hidden sm:inline" aria-hidden>
          ·
        </span>
        <Link
          href="/impressum"
          className="inline-flex min-h-[44px] items-center justify-center underline decoration-[var(--ascent-primary)]/35 underline-offset-2 hover:text-[var(--ascent-primary)] sm:min-h-0"
        >
          {brand.labels.navImpressum}
        </Link>
      </div>
      <div className="mx-auto mt-4 max-w-5xl text-[10px] leading-relaxed opacity-90">
        {brand.labels.publicFooterTestProjectLine}
      </div>
      <div className="mx-auto mt-2 max-w-5xl text-[10px] opacity-90">
        {brand.labels.publicFooterLegalPrefix}{" "}
        {brand.labels.privacyHostingNoteBeforeLink}
        <a
          className="underline hover:text-[var(--ascent-primary)]"
          href={brand.labels.privacyHostingNoteLinkUrl}
          target="_blank"
          rel="noreferrer"
        >
          {brand.labels.privacyHostingNoteLinkText}
        </a>
        {brand.labels.privacyHostingNoteAfterLink}
      </div>
    </footer>
  );
}
