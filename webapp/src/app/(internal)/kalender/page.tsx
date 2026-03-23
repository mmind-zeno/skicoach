import { PageHeader } from "@/components/ui/PageHeader";
import { brand } from "@/config/brand";
import { CalendarShell } from "@/features/calendar/components/CalendarShell";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Suspense } from "react";

export default async function KalenderPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/kalender");
  }

  return (
    <div className="p-4 md:p-6">
      <PageHeader title={brand.labels.navCalendar} />
      <Suspense
        fallback={
          <p className="text-sm text-sk-ink/60">
            {brand.labels.navCalendar} wird geladen…
          </p>
        }
      >
        <CalendarShell
          userId={session.user.id}
          isAdmin={session.user.role === "admin"}
        />
      </Suspense>
    </div>
  );
}
