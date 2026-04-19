import { PageHeader } from "@/components/ui/PageHeader";
import { CommunicationHub } from "@/features/admin/components/CommunicationHub";
import { brand } from "@/config/brand";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminCommunicationPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/admin/kommunikation");
  if (session.user.role !== "admin") redirect("/kalender");

  return (
    <>
      <PageHeader title={brand.labels.commsPageTitle} lead={brand.labels.commsPageLead} />
      <CommunicationHub />
    </>
  );
}
