import { eq, lt } from "drizzle-orm";
import { rateLimitBuckets } from "../../drizzle/schema";
import { getDb } from "./db";

const CLEANUP_PROBABILITY = 0.03;

function isUniqueViolation(e: unknown): boolean {
  const code = (x: unknown) =>
    typeof x === "object" &&
    x !== null &&
    "code" in x &&
    (x as { code?: string }).code === "23505";
  if (code(e)) return true;
  if (typeof e === "object" && e !== null && "cause" in e) {
    return code((e as { cause?: unknown }).cause);
  }
  return false;
}

/**
 * Erhöht Zähler im Fenster atomar. `false` = Limit erreicht (kein weiterer Hit).
 * Nach `windowMs` ab dem letzten Start des Buckets wird zurückgesetzt (siehe Ablauf-Logik unten).
 */
export async function consumeRateLimitBucket(
  bucketKey: string,
  maxHits: number,
  windowMs: number
): Promise<boolean> {
  if (maxHits < 1) return false;
  const windowEnd = new Date(Date.now() + windowMs);

  return getDb().transaction(async (tx) => {
    if (Math.random() < CLEANUP_PROBABILITY) {
      await tx
        .delete(rateLimitBuckets)
        .where(lt(rateLimitBuckets.windowExpiresAt, new Date()));
    }

    let rows = await tx
      .select()
      .from(rateLimitBuckets)
      .where(eq(rateLimitBuckets.bucketKey, bucketKey))
      .for("update");

    let row = rows[0];
    const now = new Date();

    if (!row) {
      try {
        await tx.insert(rateLimitBuckets).values({
          bucketKey,
          hitCount: 1,
          windowExpiresAt: windowEnd,
        });
        return true;
      } catch (e) {
        if (!isUniqueViolation(e)) throw e;
        rows = await tx
          .select()
          .from(rateLimitBuckets)
          .where(eq(rateLimitBuckets.bucketKey, bucketKey))
          .for("update");
        row = rows[0];
        if (!row) throw e;
      }
    }

    if (row.windowExpiresAt < now) {
      await tx
        .update(rateLimitBuckets)
        .set({ hitCount: 1, windowExpiresAt: windowEnd })
        .where(eq(rateLimitBuckets.bucketKey, bucketKey));
      return true;
    }

    if (row.hitCount >= maxHits) {
      return false;
    }

    await tx
      .update(rateLimitBuckets)
      .set({ hitCount: row.hitCount + 1 })
      .where(eq(rateLimitBuckets.bucketKey, bucketKey));
    return true;
  });
}
