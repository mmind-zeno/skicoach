import { PageHeader } from "@/components/ui/PageHeader";
import { AdminAuditLogClient } from "@/features/admin/components/AdminAuditLogClient";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminAuditPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/admin/audit");
  if (session.user.role !== "admin") redirect("/kalender");

  return (
    <div className="p-4 md:p-6">
      <PageHeader title="Audit-Protokoll" />
      <p className="mb-4 text-sm text-sk-ink/70">
        Letzte sicherheitsrelevante Admin-Aktionen (Einladungen, Nutzer, Kurstypen,
        Buchungsanfragen).
      </p>
      <AdminAuditLogClient />
    </div>
  );
}
