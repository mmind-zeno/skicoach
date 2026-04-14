import { PageHeader } from "@/components/ui/PageHeader";
import { brand } from "@/config/brand";
import { InvoicesPageClient } from "@/features/invoices/components/InvoicesPageClient";

export default function RechnungenPage() {
  return (
    <>
      <PageHeader title={brand.labels.navInvoices} />
      <InvoicesPageClient />
    </>
  );
}
