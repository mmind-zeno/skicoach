import { PageHeader } from "@/components/ui/PageHeader";
import { brand } from "@/config/brand";
import { AdminAuditLogClient } from "@/features/admin/components/AdminAuditLogClient";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminAuditPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/admin/audit");
  if (session.user.role !== "admin") redirect("/kalender");

  return (
    <>
      <PageHeader title={brand.labels.navAuditLog} />
      <p className="mb-6 text-sm text-sk-ink/70">
        Letzte sicherheitsrelevante Admin-Aktionen (Einladungen, Nutzer,{" "}
        {brand.labels.serviceTypePlural}, {brand.labels.bookingRequestPlural}).
      </p>
      <AdminAuditLogClient />
    </>
  );
}
