import { PageHeader } from "@/components/ui/PageHeader";
import { InvoicesPageClient } from "@/features/invoices/components/InvoicesPageClient";

export default function RechnungenPage() {
  return (
    <div className="p-4 md:p-6">
      <PageHeader title="Rechnungen" />
      <InvoicesPageClient />
    </div>
  );
}
