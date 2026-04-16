import { InternalShell } from "@/components/internal-shell";
import { SessionProvider } from "@/components/session-provider";
import { auth } from "@/lib/auth";
import { featureChat, featureInvoices } from "@/lib/features";
import { isLandingPilotEnabled } from "@/lib/landing-pilot";

export default async function InternalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const isAdmin = session?.user?.role === "admin";
  const ascent = isLandingPilotEnabled();

  return (
    <SessionProvider session={session}>
      <InternalShell
        ascent={ascent}
        isAdmin={isAdmin}
        showInvoices={featureInvoices()}
        showChat={featureChat()}
      >
        {children}
      </InternalShell>
    </SessionProvider>
  );
}
