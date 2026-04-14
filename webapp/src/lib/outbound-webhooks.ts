import { eq } from "drizzle-orm";
import { outboundWebhooks } from "../../drizzle/schema";
import { getDb } from "./db";
import { featureWebhooks } from "./features";

/**
 * POST JSON { event, payload, ts } an alle aktiven URLs (n8n, eigene Worker).
 * Fehler werden geschluckt — Hooks dürfen den Hauptpfad nicht brechen.
 */
export async function dispatchOutboundWebhooks(
  event: string,
  payload: Record<string, unknown>
): Promise<void> {
  if (!featureWebhooks()) return;
  let hooks: { url: string; secret: string | null }[] = [];
  try {
    const db = getDb();
    hooks = await db
      .select({
        url: outboundWebhooks.url,
        secret: outboundWebhooks.secret,
      })
      .from(outboundWebhooks)
      .where(eq(outboundWebhooks.isActive, true));
  } catch {
    return;
  }
  const body = JSON.stringify({
    event,
    payload,
    ts: new Date().toISOString(),
  });
  await Promise.allSettled(
    hooks.map((h) =>
      fetch(h.url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(h.secret ? { "X-Webhook-Secret": h.secret } : {}),
        },
        body,
        signal: AbortSignal.timeout(10_000),
      })
    )
  );
}
