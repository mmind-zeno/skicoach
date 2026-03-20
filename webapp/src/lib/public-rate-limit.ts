import { clientIp } from "./client-ip";
import { consumeRateLimitBucket } from "./rate-limit-db";

export { clientIp };

const buckets = new Map<string, { n: number; reset: number }>();

const WINDOW_MS = 60_000;
const MAX = 60;

/** In-Memory-Limit für häufige öffentliche GETs (Kalender/Slots). */
export function rateLimitPublic(ip: string): boolean {
  const now = Date.now();
  const b = buckets.get(ip);
  if (!b || now > b.reset) {
    buckets.set(ip, { n: 1, reset: now + WINDOW_MS });
    return true;
  }
  if (b.n >= MAX) return false;
  b.n += 1;
  return true;
}

const BOOKING_WINDOW_MS = 60_000;
const BOOKING_MAX = 45;

/**
 * Postgres-basiertes Limit für Buchungsanfragen (mehrere Instanzen).
 * Fallback: gleiches Fenster wie `rateLimitPublic` im Speicher.
 */
export async function rateLimitPublicBookingPost(ip: string): Promise<boolean> {
  try {
    return await consumeRateLimitBucket(
      `public:booking_request:${ip}`,
      BOOKING_MAX,
      BOOKING_WINDOW_MS
    );
  } catch {
    return rateLimitPublic(ip);
  }
}
