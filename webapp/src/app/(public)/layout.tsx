import Link from "next/link";
import { brand } from "@/config/brand";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-sk-surface text-sk-ink">
      <header className="sticky top-0 z-40 border-b border-sk-outline/15 bg-white/75 shadow-[0_8px_30px_-12px_rgba(24,28,32,0.12)] backdrop-blur-xl backdrop-saturate-150">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-2 px-4 py-3.5 md:px-6">
          <Link
            href="/"
            className="text-sm font-semibold tracking-tight text-sk-brand md:text-base"
          >
            {brand.siteName}
          </Link>
          <nav className="flex max-w-[min(100%,22rem)] flex-wrap items-center justify-end gap-x-3 gap-y-2 text-sm text-sk-brand/90 sm:max-w-none md:justify-start">
            <Link href="/buchen" className="transition hover:text-sk-cta">
              {brand.labels.requestServiceCta}
            </Link>
            <Link
              href="/buchen/meine-termine"
              className="transition hover:text-sk-cta"
            >
              {brand.labels.navGuestAppointments}
            </Link>
            <Link href="/login" className="transition hover:text-sk-cta">
              {brand.labels.teamLoginNav}
            </Link>
            <Link href="/" className="transition hover:text-sk-cta">
              {brand.labels.navHome}
            </Link>
            <Link href="/datenschutz" className="transition hover:text-sk-cta">
              {brand.labels.navPrivacy}
            </Link>
            <Link href="/impressum" className="transition hover:text-sk-cta">
              {brand.labels.navImpressum}
            </Link>
          </nav>
        </div>
      </header>
      {children}
      <footer className="mt-16 border-t border-sk-outline/20 py-8 text-center text-xs text-sk-ink/50">
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
