"use client";

import { io, type Socket } from "socket.io-client";

let socket: Socket | null = null;

/** Singleton; nur im Browser. Pfad muss zum Server (`/socket.io`) passen. */
export function getChatSocket(): Socket | null {
  if (typeof window === "undefined") return null;
  if (!socket) {
    const base =
      typeof process.env.NEXT_PUBLIC_APP_URL === "string" &&
      process.env.NEXT_PUBLIC_APP_URL.length > 0
        ? process.env.NEXT_PUBLIC_APP_URL
        : undefined;
    socket = io(base, {
      path: "/socket.io",
      withCredentials: true,
      autoConnect: false,
      transports: ["websocket", "polling"],
    });
  }
  return socket;
}

export function disconnectChatSocket(): void {
  if (!socket) return;
  socket.removeAllListeners();
  socket.disconnect();
  socket = null;
}
