"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { brand } from "@/config/brand";

const navLinkClass =
  "flex min-h-[48px] items-center rounded-xl px-4 text-base font-medium text-sk-ink transition active:bg-sk-highlight/90 hover:bg-sk-highlight";

const navLinkClassPilot =
  "flex min-h-[48px] items-center rounded-xl px-4 text-base font-medium text-[var(--ascent-on-surface)] transition active:opacity-90 hover:bg-[var(--ascent-container-low)]";

export function PublicSiteHeader({
  landingPilot = false,
}: {
  /** Stitch „Atmospheric Ascent“ — nur in Kombination mit `.landing-pilot` auf der Startseite. */
  landingPilot?: boolean;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const links = [
    { href: "/buchen", label: brand.labels.requestServiceCta },
    { href: "/buchen/meine-termine", label: brand.labels.navGuestAppointments },
    { href: "/login", label: brand.labels.teamLoginNav },
    { href: "/", label: brand.labels.navHome },
    { href: "/datenschutz", label: brand.labels.navPrivacy },
    { href: "/impressum", label: brand.labels.navImpressum },
  ] as const;

  const headerClass = landingPilot
    ? "sticky top-0 z-40 bg-white/70 shadow-[0_8px_40px_-16px_rgba(0,88,188,0.14)] backdrop-blur-xl backdrop-saturate-150 supports-[backdrop-filter]:bg-white/65"
    : "sticky top-0 z-40 border-b border-sk-outline/15 bg-white/90 shadow-[0_8px_30px_-12px_rgba(24,28,32,0.12)] backdrop-blur-xl backdrop-saturate-150 supports-[backdrop-filter]:bg-white/80";

  const logoClass = landingPilot
    ? "min-h-[44px] min-w-0 shrink truncate py-2 pr-2 text-base font-bold tracking-tight text-[var(--ascent-primary)] md:text-lg"
    : "min-h-[44px] min-w-0 shrink truncate py-2 pr-2 text-base font-semibold tracking-tight text-sk-brand md:text-lg";

  const desktopNavClass = landingPilot
    ? "hidden flex-wrap items-center justify-end gap-x-4 gap-y-1 text-sm font-semibold md:flex"
    : "hidden flex-wrap items-center justify-end gap-x-4 gap-y-1 text-sm font-medium text-sk-brand/90 md:flex";

  const desktopLinkClass = landingPilot
    ? "rounded-lg py-2 text-[var(--ascent-on-surface-variant)] transition hover:text-[var(--ascent-primary)]"
    : "rounded-lg py-2 transition hover:text-sk-cta";

  const menuBtnClass = landingPilot
    ? "flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-xl bg-[var(--ascent-container-low)] px-3 text-sm font-semibold text-[var(--ascent-on-surface)] shadow-sm active:scale-[0.98] md:hidden [touch-action:manipulation]"
    : "flex min-h-[44px] min-w-[44px] shrink-0 items-center justify-center rounded-xl border border-sk-outline/35 bg-white px-3 text-sm font-semibold text-sk-ink shadow-sm active:scale-[0.98] md:hidden [touch-action:manipulation]";

  return (
    <header className={headerClass}>
      <div className="public-safe-x public-safe-t mx-auto flex max-w-5xl items-center justify-between gap-3 py-2.5 md:px-6 md:py-3.5">
        <Link href="/" className={logoClass}>
          {brand.siteName}
        </Link>
        <nav
          className={desktopNavClass}
          aria-label={brand.labels.publicMainNavAria}
        >
          {links.map(({ href, label }) => (
            <Link key={href} href={href} className={desktopLinkClass}>
              {label}
            </Link>
          ))}
        </nav>
        <button
          type="button"
          className={menuBtnClass}
          aria-expanded={open}
          aria-controls="public-mobile-nav"
          aria-label={
            open ? brand.labels.uiClose : brand.labels.internalMobileMenuOpen
          }
          onClick={() => setOpen((v) => !v)}
        >
          {open ? "×" : brand.labels.internalMobileMenuOpen}
        </button>
      </div>
      {open ? (
        <div
          id="public-mobile-nav"
          className={
            landingPilot
              ? "fixed inset-0 z-50 flex flex-col bg-[var(--ascent-surface)] md:hidden"
              : "fixed inset-0 z-50 flex flex-col bg-white md:hidden"
          }
          role="dialog"
          aria-modal="true"
          aria-label={brand.labels.internalMobileMenuOpen}
        >
          <div
            className={
              landingPilot
                ? "public-safe-x flex items-center justify-between py-3 shadow-[0_1px_0_0_rgba(0,88,188,0.08)]"
                : "public-safe-x flex items-center justify-between border-b border-sk-outline/15 py-3"
            }
          >
            <span
              className={
                landingPilot
                  ? "min-w-0 truncate pl-1 text-base font-bold text-[var(--ascent-primary)]"
                  : "min-w-0 truncate pl-1 text-base font-semibold text-sk-brand"
              }
            >
              {brand.siteName}
            </span>
            <button
              type="button"
              className={
                landingPilot
                  ? "mr-1 flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-2xl leading-none text-[var(--ascent-on-surface)] [touch-action:manipulation]"
                  : "mr-1 flex min-h-[44px] min-w-[44px] items-center justify-center rounded-xl text-2xl leading-none text-sk-ink [touch-action:manipulation]"
              }
              aria-label={brand.labels.uiClose}
              onClick={() => setOpen(false)}
            >
              ×
            </button>
          </div>
          <nav
            className="public-safe-x flex flex-1 flex-col gap-1 overflow-y-auto pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-2"
            aria-label={brand.labels.publicMainNavAria}
          >
            {links.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={landingPilot ? navLinkClassPilot : navLinkClass}
                onClick={() => setOpen(false)}
              >
                {label}
              </Link>
            ))}
          </nav>
        </div>
      ) : null}
    </header>
  );
}
