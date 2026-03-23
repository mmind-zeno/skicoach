import { PageHeader } from "@/components/ui/PageHeader";
import { brand } from "@/config/brand";
import { AdminHome } from "@/features/admin/components/AdminHome";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/admin");
  if (session.user.role !== "admin") redirect("/kalender");

  return (
    <div className="p-4 md:p-6">
      <PageHeader title={brand.labels.navAdmin} />
      <AdminHome />
    </div>
  );
}
