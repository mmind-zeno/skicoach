import { PageHeader } from "@/components/ui/PageHeader";
import { brand } from "@/config/brand";
import { ChatLayout } from "@/features/chat/components/ChatLayout";

export default function ChatPage() {
  return (
    <div className="p-4 md:p-6">
      <PageHeader title={brand.labels.navChat} />
      <p className="mb-4 text-sm text-sk-ink/70">
        {brand.labels.navTeam}-Kanäle und Direktnachrichten. Mit laufendem{" "}
        <code className="rounded bg-sk-surface px-1">server.ts</code>{" "}
        erscheint oben im Chat{" "}
        <strong>{brand.labels.chatConnectionLive}</strong>; sonst automatisches{" "}
        {brand.labels.chatConnectionPolling}.
      </p>
      <ChatLayout />
    </div>
  );
}
