import Link from "next/link";
import { brand } from "@/config/brand";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-sk-surface text-sk-ink">
      <header className="border-b border-black/[0.08] bg-white">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-2 px-4 py-3">
          <Link href="/" className="font-medium text-sk-brand">
            {brand.siteName}
          </Link>
          <nav className="flex flex-wrap items-center gap-4 text-sm text-sk-brand/90">
            <Link href="/buchen" className="hover:text-sk-brand">
              {brand.labels.requestServiceCta}
            </Link>
            <Link href="/login" className="hover:text-sk-brand">
              {brand.labels.teamLoginNav}
            </Link>
            <Link href="/" className="hover:text-sk-brand">
              {brand.labels.navHome}
            </Link>
            <Link href="/datenschutz" className="hover:text-sk-brand">
              {brand.labels.navPrivacy}
            </Link>
            <Link href="/impressum" className="hover:text-sk-brand">
              {brand.labels.navImpressum}
            </Link>
          </nav>
        </div>
      </header>
      {children}
      <footer className="mt-12 border-t border-sk-ink/10 py-6 text-center text-xs text-sk-ink/50">
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
