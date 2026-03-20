import { InternalShell } from "@/components/internal-shell";
import { SessionProvider } from "@/components/session-provider";
import { auth } from "@/lib/auth";

export default async function InternalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const isAdmin = session?.user?.role === "admin";

  return (
    <SessionProvider session={session}>
      <InternalShell isAdmin={isAdmin}>{children}</InternalShell>
    </SessionProvider>
  );
}
