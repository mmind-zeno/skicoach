"use client";

import { AdminNewRequestToast } from "@/components/admin-new-request-toast";
import { AppToastProvider } from "@/components/app-toast";
import { InternalSidebar } from "@/components/internal-sidebar";
import { brand } from "@/config/brand";
import { useState } from "react";

export function InternalShell({
  isAdmin,
  showInvoices = true,
  showChat = true,
  children,
}: {
  isAdmin: boolean;
  showInvoices?: boolean;
  showChat?: boolean;
  children: React.ReactNode;
}) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <AppToastProvider>
      <div className="min-h-screen bg-sk-surface text-sk-ink">
        <InternalSidebar
          isAdmin={isAdmin}
          showInvoices={showInvoices}
          showChat={showChat}
          mobileOpen={mobileNavOpen}
          onNavigate={() => setMobileNavOpen(false)}
        />
        {mobileNavOpen ? (
          <button
            type="button"
            className="fixed inset-0 z-20 bg-sk-ink/40 md:hidden"
            aria-label={brand.labels.uiClose}
            onClick={() => setMobileNavOpen(false)}
          />
        ) : null}
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-sk-outline/15 bg-sk-surface/95 px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top,0px))] backdrop-blur-md md:hidden">
          <button
            type="button"
            className="rounded-lg border border-sk-ink/15 bg-white px-3 py-2 text-sm font-medium text-sk-ink shadow-sm active:scale-[0.98]"
            onClick={() => setMobileNavOpen(true)}
          >
            {brand.labels.internalMobileMenuOpen}
          </button>
          <span className="text-sm font-semibold text-sk-brand">{brand.siteName}</span>
        </header>
        {isAdmin ? <AdminNewRequestToast /> : null}
        <main className="min-h-screen bg-gradient-to-br from-sk-surface via-sk-surface to-sk-container-low md:pl-[220px]">
          <div className="mx-auto max-w-[1680px] px-4 py-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:px-5 md:px-8 md:py-8 lg:px-10 lg:py-10">
            {children}
          </div>
        </main>
      </div>
    </AppToastProvider>
  );
}
