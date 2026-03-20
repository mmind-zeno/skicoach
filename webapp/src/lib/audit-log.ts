import { auditLogs } from "../../drizzle/schema";
import { getDb } from "./db";
import { clientIp } from "./client-ip";

export async function writeAuditLog(input: {
  actorUserId: string;
  action: string;
  resource?: string | null;
  metadata?: Record<string, unknown> | null;
  request?: Request | null;
}): Promise<void> {
  try {
    await getDb().insert(auditLogs).values({
      actorUserId: input.actorUserId,
      action: input.action,
      resource: input.resource ?? null,
      metadata: input.metadata ?? null,
      clientIp: input.request ? clientIp(input.request) : null,
    });
  } catch {
    // Audit darf Hauptfluss nicht brechen
  }
}
