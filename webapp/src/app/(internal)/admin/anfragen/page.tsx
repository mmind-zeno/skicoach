import { PageHeader } from "@/components/ui/PageHeader";
import { brand } from "@/config/brand";
import { BookingRequestsAdmin } from "@/features/admin/components/BookingRequestsAdmin";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function AdminAnfragenPage() {
  const session = await auth();
  if (!session?.user) redirect("/login?callbackUrl=/admin/anfragen");
  if (session.user.role !== "admin") redirect("/kalender");

  return (
    <div className="p-4 md:p-6">
      <PageHeader title={brand.labels.bookingRequestPlural} />
      <BookingRequestsAdmin />
    </div>
  );
}
