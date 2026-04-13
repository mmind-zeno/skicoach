"use client";

import { AdminNewRequestToast } from "@/components/admin-new-request-toast";
import { AppToastProvider } from "@/components/app-toast";
import { InternalSidebar } from "@/components/internal-sidebar";

export function InternalShell({
  isAdmin,
  children,
}: {
  isAdmin: boolean;
  children: React.ReactNode;
}) {
  return (
    <AppToastProvider>
      <div className="min-h-screen bg-sk-surface text-sk-ink">
        <InternalSidebar isAdmin={isAdmin} />
        {isAdmin ? <AdminNewRequestToast /> : null}
        <main className="pl-[220px]">{children}</main>
      </div>
    </AppToastProvider>
  );
}
