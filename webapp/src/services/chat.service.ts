import { and, asc, desc, eq, isNull, lt, ne, or } from "drizzle-orm";
import { chatChannels, chatMessages, users } from "../../drizzle/schema";
import { ForbiddenError, NotFoundError, ValidationError } from "../lib/errors";
import { getDb } from "../lib/db";

export const MAX_CHAT_MESSAGE_LENGTH = 8000;

export async function assertCanReadChatMessages(opts: {
  channelId?: string | null;
  recipientId?: string | null;
}): Promise<void> {
  const db = getDb();
  if (opts.channelId) {
    const ch = await db.query.chatChannels.findFirst({
      where: eq(chatChannels.id, opts.channelId),
      columns: { id: true },
    });
    if (!ch) throw new NotFoundError("Kanal nicht gefunden");
    return;
  }
  if (opts.recipientId) {
    const u = await db.query.users.findFirst({
      where: eq(users.id, opts.recipientId),
      columns: { id: true, isActive: true },
    });
    if (!u?.isActive) {
      throw new NotFoundError("Gespräch nicht verfügbar");
    }
    return;
  }
  throw new ValidationError("channelId oder recipientId erforderlich");
}

export async function assertCanSendChatMessage(opts: {
  senderId: string;
  channelId?: string | null;
  recipientId?: string | null;
  content: string;
}): Promise<void> {
  if (opts.content.length > MAX_CHAT_MESSAGE_LENGTH) {
    throw new ValidationError(
      `Nachricht zu lang (max. ${MAX_CHAT_MESSAGE_LENGTH} Zeichen)`
    );
  }
  const db = getDb();
  if (opts.channelId) {
    const ch = await db.query.chatChannels.findFirst({
      where: eq(chatChannels.id, opts.channelId),
      columns: { id: true },
    });
    if (!ch) throw new NotFoundError("Kanal nicht gefunden");
    return;
  }
  if (opts.recipientId) {
    if (opts.recipientId === opts.senderId) {
      throw new ValidationError("Keine Direktnachricht an dich selbst");
    }
    const u = await db.query.users.findFirst({
      where: eq(users.id, opts.recipientId),
      columns: { id: true, isActive: true },
    });
    if (!u?.isActive) {
      throw new ForbiddenError("Empfänger nicht verfügbar");
    }
    return;
  }
  throw new ValidationError("channelId oder recipientId erforderlich");
}

export async function ensureGeneralChannel() {
  const db = getDb();
  const existing = await db.query.chatChannels.findFirst({
    where: eq(chatChannels.isGeneral, true),
  });
  if (existing) return existing;
  const [ch] = await db
    .insert(chatChannels)
    .values({ name: "Team", isGeneral: true })
    .returning();
  if (!ch) throw new Error("Kanal konnte nicht erstellt werden");
  return ch;
}

export async function getChannels() {
  const db = getDb();
  return db.query.chatChannels.findMany({
    orderBy: [desc(chatChannels.createdAt)],
  });
}

export async function createChannel(name: string) {
  const db = getDb();
  const [ch] = await db
    .insert(chatChannels)
    .values({ name: name.trim(), isGeneral: false })
    .returning();
  if (!ch) throw new Error("Kanal konnte nicht erstellt werden");
  return ch;
}

export async function getMessages(
  opts:
    | { channelId: string; limit?: number; before?: Date }
    | {
        dmWithUserId: string;
        currentUserId: string;
        limit?: number;
        before?: Date;
      }
) {
  const db = getDb();
  const limit = Math.min(opts.limit ?? 40, 100);

  if ("channelId" in opts) {
    const cond = and(
      eq(chatMessages.channelId, opts.channelId),
      opts.before ? lt(chatMessages.createdAt, opts.before) : undefined
    );
    return db.query.chatMessages.findMany({
      where: cond,
      with: { sender: true },
      orderBy: [desc(chatMessages.createdAt)],
      limit,
    });
  }

  const { dmWithUserId, currentUserId } = opts;
  const cond = and(
    or(
      and(
        eq(chatMessages.senderId, currentUserId),
        eq(chatMessages.recipientId, dmWithUserId)
      ),
      and(
        eq(chatMessages.senderId, dmWithUserId),
        eq(chatMessages.recipientId, currentUserId)
      )
    ),
    opts.before ? lt(chatMessages.createdAt, opts.before) : undefined
  );
  return db.query.chatMessages.findMany({
    where: cond,
    with: { sender: true },
    orderBy: [desc(chatMessages.createdAt)],
    limit,
  });
}

export async function createMessage(input: {
  senderId: string;
  channelId?: string | null;
  recipientId?: string | null;
  content: string;
}) {
  const db = getDb();
  if (!input.channelId && !input.recipientId) {
    throw new ValidationError("channelId oder recipientId erforderlich");
  }
  await assertCanSendChatMessage({
    senderId: input.senderId,
    channelId: input.channelId,
    recipientId: input.recipientId,
    content: input.content,
  });
  const [msg] = await db
    .insert(chatMessages)
    .values({
      senderId: input.senderId,
      channelId: input.channelId ?? null,
      recipientId: input.recipientId ?? null,
      content: input.content.trim(),
    })
    .returning();
  if (!msg) throw new Error("Nachricht konnte nicht gesendet werden");
  return db.query.chatMessages.findFirst({
    where: eq(chatMessages.id, msg.id),
    with: { sender: true },
  });
}

export async function markChannelRead(channelId: string, userId: string) {
  const db = getDb();
  await db
    .update(chatMessages)
    .set({ readAt: new Date() })
    .where(
      and(
        eq(chatMessages.channelId, channelId),
        ne(chatMessages.senderId, userId),
        isNull(chatMessages.readAt)
      )
    );
}

export async function listTeachersForChat() {
  const db = getDb();
  return db.query.users.findMany({
    where: and(eq(users.isActive, true), eq(users.role, "teacher")),
    columns: { id: true, name: true, email: true },
    orderBy: [asc(users.name), asc(users.email)],
  });
}

export async function listAllUsersForChat() {
  const db = getDb();
  return db.query.users.findMany({
    where: eq(users.isActive, true),
    columns: { id: true, name: true, email: true, role: true },
    orderBy: [asc(users.role), asc(users.name), asc(users.email)],
  });
}
