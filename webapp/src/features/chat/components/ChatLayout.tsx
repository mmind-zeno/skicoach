"use client";

import { useSession } from "next-auth/react";
import { useCallback, useEffect, useRef, useState } from "react";
import useSWR from "swr";
import { brand } from "@/config/brand";
import { appDateTimeLocale } from "@/lib/locale";
import { fetchJson } from "@/lib/client-fetch";
import { getUiErrorMessage } from "@/lib/client-error-message";
import { disconnectChatSocket, getChatSocket } from "@/lib/socket";

type Channel = { id: string; name: string; isGeneral: boolean };
type ChatUser = { id: string; name: string | null; email: string; role: string };
type Msg = {
  id: string;
  channelId: string | null;
  recipientId: string | null;
  content: string;
  senderId: string;
  createdAt: string;
  sender: { id: string; name: string | null; email: string } | null;
};

function f<T>(url: string): Promise<T> {
  return fetchJson<T>(url);
}

function appendDedupe(prev: Msg[] | undefined, msg: Msg): Msg[] {
  if (!prev?.length) return [msg];
  if (prev.some((m) => m.id === msg.id)) return prev;
  return [...prev, msg];
}

export function ChatLayout() {
  const { data: session } = useSession();
  const [channelId, setChannelId] = useState<string | null>(null);
  const [dmUserId, setDmUserId] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [sendErr, setSendErr] = useState<string | null>(null);
  const [sockLive, setSockLive] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data: channels } = useSWR<Channel[]>("/api/chat/channels", f, {
    refreshInterval: 60_000,
    keepPreviousData: true,
  });
  const { data: users } = useSWR<ChatUser[]>("/api/chat/users", f, {
    refreshInterval: 60_000,
    keepPreviousData: true,
  });

  const msgKey =
    channelId != null
      ? `/api/chat/messages?channelId=${channelId}`
      : dmUserId != null
        ? `/api/chat/messages?recipientId=${dmUserId}`
        : null;

  const pollMs = sockLive ? 45_000 : 4_000;
  const { data: messages, mutate } = useSWR<Msg[]>(msgKey, f, {
    refreshInterval: pollMs,
    keepPreviousData: true,
  });

  useEffect(() => {
    const s = getChatSocket();
    if (!s) return;
    const onConnect = () => setSockLive(true);
    const onDisconnect = () => setSockLive(false);
    s.on("connect", onConnect);
    s.on("disconnect", onDisconnect);
    s.connect();
    if (s.connected) setSockLive(true);
    return () => {
      s.off("connect", onConnect);
      s.off("disconnect", onDisconnect);
      disconnectChatSocket();
      setSockLive(false);
    };
  }, []);

  useEffect(() => {
    const s = getChatSocket();
    if (!s?.connected || !channels?.length) return;
    for (const c of channels) {
      s.emit("join:channel", c.id);
    }
    return () => {
      if (!s.connected) return;
      for (const c of channels) {
        s.emit("leave:channel", c.id);
      }
    };
  }, [channels, sockLive]);

  useEffect(() => {
    if (!channelId && !dmUserId) return;
    const s = getChatSocket();
    if (!s) return;
    const handler = (msg: Msg) => {
      const uid = session?.user?.id;
      if (!uid) return;
      const channelHit =
        channelId != null &&
        msg.channelId === channelId &&
        msg.recipientId == null;
      const dmHit =
        dmUserId != null &&
        msg.channelId == null &&
        msg.recipientId != null &&
        ((msg.senderId === dmUserId && msg.recipientId === uid) ||
          (msg.senderId === uid && msg.recipientId === dmUserId));
      if (channelHit || dmHit) {
        void mutate((prev) => appendDedupe(prev, msg), { revalidate: false });
      }
    };
    s.on("message:new", handler);
    return () => void s.off("message:new", handler);
  }, [channelId, dmUserId, session?.user?.id, mutate]);

  useEffect(() => {
    if (channels?.length && channelId == null && dmUserId == null) {
      const gen = channels.find((c) => c.isGeneral) ?? channels[0];
      setChannelId(gen.id);
    }
  }, [channels, channelId, dmUserId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendHttp = useCallback(async () => {
    if (!text.trim() || !session?.user?.id) return;
    const body = channelId
      ? { channelId, content: text.trim() }
      : { recipientId: dmUserId, content: text.trim() };
    try {
      const saved = await fetchJson<Msg>("/api/chat/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      setSendErr(null);
      setText("");
      void mutate((prev) => appendDedupe(prev, saved), { revalidate: false });
    } catch (e) {
      setSendErr(getUiErrorMessage(e, brand.labels.uiErrorGeneric));
    }
  }, [text, channelId, dmUserId, session?.user?.id, mutate]);

  const send = useCallback(async () => {
    if (!text.trim() || !session?.user?.id) return;
    const s = getChatSocket();
    const payload = channelId
      ? { channelId, content: text.trim() }
      : { recipientId: dmUserId ?? undefined, content: text.trim() };
    if (!channelId && !dmUserId) return;

    if (s?.connected) {
      s.emit(
        "message:send",
        payload,
        (err: Error | null, saved?: Msg) => {
          if (err) {
            void sendHttp();
            return;
          }
          if (saved) {
            setSendErr(null);
            setText("");
            void mutate((prev) => appendDedupe(prev, saved), {
              revalidate: false,
            });
          }
        }
      );
      return;
    }
    await sendHttp();
  }, [text, channelId, dmUserId, session?.user?.id, mutate, sendHttp]);

  return (
    <div className="flex h-[min(680px,calc(100vh-10rem))] min-h-[420px] flex-col rounded-lg border border-sk-ink/10 bg-white shadow-sm">
      <div className="flex items-center justify-end border-b border-sk-ink/10 px-3 py-1.5 text-[11px] text-sk-ink/60">
        <span
          className={
            sockLive
              ? "rounded-full bg-emerald-100 px-2 py-0.5 text-emerald-900"
              : "rounded-full bg-sk-surface px-2 py-0.5 text-sk-ink/70"
          }
        >
          {sockLive
            ? brand.labels.chatConnectionLive
            : brand.labels.chatConnectionPolling}
        </span>
      </div>
      <div className="flex min-h-0 flex-1">
        <aside className="w-52 shrink-0 border-r border-sk-ink/10 p-2 text-sm">
          <div className="font-medium text-sk-ink/70">
            {brand.labels.chatChannelsHeading}
          </div>
          <ul className="mt-1 space-y-1">
            {channels?.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  className={`w-full rounded px-2 py-1.5 text-left ${
                    channelId === c.id && !dmUserId
                      ? "bg-sk-brand text-white"
                      : "hover:bg-sk-surface"
                  }`}
                  onClick={() => {
                    setChannelId(c.id);
                    setDmUserId(null);
                  }}
                >
                  {c.name}
                </button>
              </li>
            ))}
          </ul>
          <div className="mt-4 font-medium text-sk-ink/70">
            {brand.labels.chatDirectHeading}
          </div>
          <ul className="mt-1 max-h-40 space-y-1 overflow-y-auto">
            {users?.map((u) => (
              <li key={u.id}>
                <button
                  type="button"
                  className={`w-full rounded px-2 py-1.5 text-left text-xs ${
                    dmUserId === u.id
                      ? "bg-sk-brand text-white"
                      : "hover:bg-sk-surface"
                  }`}
                  onClick={() => {
                    setDmUserId(u.id);
                    setChannelId(null);
                  }}
                >
                  {u.name ?? u.email}
                </button>
              </li>
            ))}
          </ul>
        </aside>
        <div className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-3">
            {messages?.length === 0 && (channelId || dmUserId) ? (
              <p className="py-6 text-center text-sm text-sk-ink/50">
                {brand.labels.chatEmptyConversationHint}
              </p>
            ) : null}
            {messages?.map((m) => {
              const mine = m.senderId === session?.user?.id;
              return (
                <div
                  key={m.id}
                  className={`flex ${mine ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
                      mine
                        ? "bg-sk-brand text-white"
                        : "bg-sk-surface text-sk-ink"
                    }`}
                  >
                    {!mine ? (
                      <div className="mb-1 text-xs opacity-70">
                        {m.sender?.name ?? m.sender?.email ?? "?"}
                      </div>
                    ) : null}
                    <div className="whitespace-pre-wrap">{m.content}</div>
                    <div className="mt-1 text-[10px] opacity-60">
                      {new Date(m.createdAt).toLocaleString(appDateTimeLocale)}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>
          <div className="border-t border-sk-ink/10 p-2">
            {sendErr ? (
              <p className="mb-2 text-xs text-red-600" role="alert">
                {sendErr}
              </p>
            ) : null}
            <div className="flex gap-2">
              <textarea
                className="min-h-[40px] flex-1 resize-none rounded border border-sk-ink/20 px-2 py-2 text-sm"
                placeholder={brand.labels.chatComposerPlaceholder}
                value={text}
                rows={2}
                onChange={(e) => {
                  setText(e.target.value);
                  if (sendErr) setSendErr(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    void send();
                  }
                }}
              />
              <button
                type="button"
                className="self-end rounded bg-sk-brand px-3 py-2 text-sm text-white hover:bg-sk-hover"
                onClick={() => void send()}
              >
                {brand.labels.chatSendButton}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
