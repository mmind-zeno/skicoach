import "./src/lib/load-env";
import { createServer } from "node:http";
import { parse } from "node:url";
import { getToken } from "next-auth/jwt";
import next from "next";
import { Server } from "socket.io";
import { createMessage } from "./src/services/chat.service";

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOSTNAME ?? "0.0.0.0";
const port = Number(process.env.PORT) || 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

const chatSocketSendLimits = new Map<string, { n: number; reset: number }>();

function rateLimitChatSocketSend(userId: string): boolean {
  const MAX = 48;
  const WIN = 60_000;
  const now = Date.now();
  const b = chatSocketSendLimits.get(userId);
  if (!b || now > b.reset) {
    chatSocketSendLimits.set(userId, { n: 1, reset: now + WIN });
    return true;
  }
  if (b.n >= MAX) return false;
  b.n += 1;
  return true;
}

type MsgOut = {
  id: string;
  channelId: string | null;
  recipientId: string | null;
  senderId: string;
  content: string;
  createdAt: string;
  readAt: string | null;
  sender: { id: string; name: string | null; email: string } | null;
};

function toWire(
  msg: NonNullable<Awaited<ReturnType<typeof createMessage>>>
): MsgOut {
  return {
    id: msg.id,
    channelId: msg.channelId,
    recipientId: msg.recipientId,
    senderId: msg.senderId,
    content: msg.content,
    createdAt: msg.createdAt.toISOString(),
    readAt: msg.readAt?.toISOString() ?? null,
    sender: msg.sender
      ? {
          id: msg.sender.id,
          name: msg.sender.name,
          email: msg.sender.email,
        }
      : null,
  };
}

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url ?? "", true);
    void handle(req, res, parsedUrl);
  });

  const corsOrigin =
    process.env.NEXTAUTH_URL ||
    process.env.AUTH_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    true;

  const io = new Server(httpServer, {
    path: "/socket.io",
    cors: {
      origin: dev ? true : corsOrigin,
      credentials: true,
    },
  });

  io.use(async (socket, next) => {
    try {
      const cookie = socket.handshake.headers.cookie ?? "";
      const secret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;
      if (!secret) {
        next(new Error("missing_auth_secret"));
        return;
      }
      const token = await getToken({
        req: { headers: { cookie } },
        secret,
      });
      const sub = token?.sub;
      if (!sub) {
        next(new Error("unauthorized"));
        return;
      }
      (socket.data as { userId: string }).userId = sub;
      next();
    } catch {
      next(new Error("unauthorized"));
    }
  });

  io.on("connection", (socket) => {
    const userId = (socket.data as { userId: string }).userId;
    void socket.join(`u:${userId}`);

    socket.on("join:channel", (channelId: unknown) => {
      if (typeof channelId === "string") void socket.join(`c:${channelId}`);
    });

    socket.on("leave:channel", (channelId: unknown) => {
      if (typeof channelId === "string") void socket.leave(`c:${channelId}`);
    });

    socket.on(
      "message:send",
      async (
        payload: {
          channelId?: string;
          recipientId?: string;
          content?: string;
        },
        ack?: (err: Error | null, msg?: MsgOut) => void
      ) => {
        try {
          if (!rateLimitChatSocketSend(userId)) {
            throw new Error("rate_limited");
          }
          const content =
            typeof payload?.content === "string" ? payload.content.trim() : "";
          if (content.length < 1) throw new Error("empty");
          const channelId =
            typeof payload?.channelId === "string"
              ? payload.channelId
              : undefined;
          const recipientId =
            typeof payload?.recipientId === "string"
              ? payload.recipientId
              : undefined;
          if (!channelId && !recipientId) throw new Error("target");

          const msg = await createMessage({
            senderId: userId,
            channelId: channelId ?? null,
            recipientId: recipientId ?? null,
            content,
          });
          if (!msg) throw new Error("save_failed");

          const out = toWire(msg);

          if (channelId) {
            io.to(`c:${channelId}`).emit("message:new", out);
          } else if (recipientId) {
            io.to(`u:${recipientId}`).emit("message:new", out);
            io.to(`u:${userId}`).emit("message:new", out);
          }

          ack?.(null, out);
        } catch (e) {
          ack?.(e instanceof Error ? e : new Error("send_failed"));
        }
      }
    );
  });

  httpServer.listen(port, hostname, () => {
    // eslint-disable-next-line no-console
    console.log(`> Ready on http://${hostname}:${port} (Next + Socket.io)`);
  });
});
