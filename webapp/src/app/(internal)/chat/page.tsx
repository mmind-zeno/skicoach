import { PageHeader } from "@/components/ui/PageHeader";
import { ChatLayout } from "@/features/chat/components/ChatLayout";

export default function ChatPage() {
  return (
    <div className="p-4 md:p-6">
      <PageHeader title="Chat" />
      <p className="mb-4 text-sm text-sk-ink/70">
        Team-Kanäle und Direktnachrichten. Mit laufendem{" "}
        <code className="rounded bg-sk-surface px-1">server.ts</code>{" "}
        erscheint oben im Chat <strong>Live (Socket.io)</strong>; sonst
        automatisches Polling.
      </p>
      <ChatLayout />
    </div>
  );
}
