"use client";

import { AdminNewRequestToast } from "@/components/admin-new-request-toast";
import { AppToastProvider } from "@/components/app-toast";
import { InternalSidebar } from "@/components/internal-sidebar";

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
  return (
    <AppToastProvider>
      <div className="min-h-screen bg-sk-surface text-sk-ink">
        <InternalSidebar
          isAdmin={isAdmin}
          showInvoices={showInvoices}
          showChat={showChat}
        />
        {isAdmin ? <AdminNewRequestToast /> : null}
        <main className="min-h-screen bg-gradient-to-br from-sk-surface via-sk-surface to-sk-container-low pl-[220px]">
          <div className="mx-auto max-w-[1680px] px-5 py-6 md:px-8 md:py-8 lg:px-10 lg:py-10">
            {children}
          </div>
        </main>
      </div>
    </AppToastProvider>
  );
}
