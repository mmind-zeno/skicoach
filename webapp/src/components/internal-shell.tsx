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
        <main className="pl-[220px]">{children}</main>
      </div>
    </AppToastProvider>
  );
}
