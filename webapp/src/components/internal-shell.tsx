"use client";

import { AdminNewRequestToast } from "@/components/admin-new-request-toast";
import { AppToastProvider } from "@/components/app-toast";
import { InternalSidebar } from "@/components/internal-sidebar";
import { brand } from "@/config/brand";
import { useState } from "react";

export function InternalShell({
  ascent = false,
  isAdmin,
  showInvoices = true,
  showChat = true,
  children,
}: {
  ascent?: boolean;
  isAdmin: boolean;
  showInvoices?: boolean;
  showChat?: boolean;
  children: React.ReactNode;
}) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const rootClass = ascent
    ? "app-ascent min-h-screen bg-[var(--ascent-surface)] text-[var(--ascent-on-surface)]"
    : "min-h-screen bg-sk-surface text-sk-ink";

  const overlayClass = ascent
    ? "fixed inset-0 z-20 bg-[var(--ascent-on-surface)]/35 md:hidden"
    : "fixed inset-0 z-20 bg-sk-ink/40 md:hidden";

  const headerClass = ascent
    ? "sticky top-0 z-30 flex items-center gap-3 border-b border-[var(--ascent-primary)]/12 bg-[var(--ascent-surface)]/95 px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top,0px))] backdrop-blur-md md:hidden"
    : "sticky top-0 z-30 flex items-center gap-3 border-b border-sk-outline/15 bg-sk-surface/95 px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top,0px))] backdrop-blur-md md:hidden";

  const menuBtnClass = ascent
    ? "rounded-lg border border-[var(--ascent-primary)]/18 bg-white px-3 py-2 text-sm font-medium text-[var(--ascent-on-surface)] shadow-sm active:scale-[0.98]"
    : "rounded-lg border border-sk-ink/15 bg-white px-3 py-2 text-sm font-medium text-sk-ink shadow-sm active:scale-[0.98]";

  const siteTitleClass = ascent
    ? "text-sm font-semibold text-[var(--ascent-primary)]"
    : "text-sm font-semibold text-sk-brand";

  const mainClass = ascent
    ? "min-h-screen bg-gradient-to-br from-[var(--ascent-surface)] via-[var(--ascent-surface)] to-[var(--ascent-container-low)] md:pl-[220px]"
    : "min-h-screen bg-gradient-to-br from-sk-surface via-sk-surface to-sk-container-low md:pl-[220px]";

  return (
    <AppToastProvider>
      <div className={rootClass}>
        <InternalSidebar
          ascent={ascent}
          isAdmin={isAdmin}
          showInvoices={showInvoices}
          showChat={showChat}
          mobileOpen={mobileNavOpen}
          onNavigate={() => setMobileNavOpen(false)}
        />
        {mobileNavOpen ? (
          <button
            type="button"
            className={overlayClass}
            aria-label={brand.labels.uiClose}
            onClick={() => setMobileNavOpen(false)}
          />
        ) : null}
        <header className={headerClass}>
          <button
            type="button"
            className={menuBtnClass}
            onClick={() => setMobileNavOpen(true)}
          >
            {brand.labels.internalMobileMenuOpen}
          </button>
          <span className={siteTitleClass}>{brand.siteName}</span>
        </header>
        {isAdmin ? <AdminNewRequestToast /> : null}
        <main className={mainClass}>
          <div className="mx-auto max-w-[1680px] px-4 py-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:px-5 md:px-8 md:py-8 lg:px-10 lg:py-10">
            {children}
          </div>
        </main>
      </div>
    </AppToastProvider>
  );
}
