import { PageHeader } from "@/components/ui/PageHeader";
import { GuestsPageClient } from "@/features/guests/components/GuestsPageClient";

export default function GaestePage() {
  return (
    <div className="p-4 md:p-6">
      <PageHeader title="Gäste" />
      <GuestsPageClient />
    </div>
  );
}
