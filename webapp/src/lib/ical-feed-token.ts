import { createHmac, timingSafeEqual } from "node:crypto";

function feedSecret(): string {
  return (
    process.env.ICAL_FEED_SECRET?.trim() ||
    process.env.AUTH_SECRET?.trim() ||
    "dev-ical-secret-change-me"
  );
}

/** Öffentlicher Feed-Link: `/api/calendar/ical?token=…` */
export function signIcalFeedToken(
  userId: string,
  ttlSec = 60 * 60 * 24 * 365
): string {
  const exp = Math.floor(Date.now() / 1000) + ttlSec;
  const secret = feedSecret();
  const sig = createHmac("sha256", secret)
    .update(`${userId}.${exp}`)
    .digest("hex");
  const raw = `${userId}.${exp}.${sig}`;
  return Buffer.from(raw, "utf8").toString("base64url");
}

export function verifyIcalFeedToken(
  token: string
): { userId: string } | null {
  let decoded: string;
  try {
    decoded = Buffer.from(token, "base64url").toString("utf8");
  } catch {
    return null;
  }
  const parts = decoded.split(".");
  if (parts.length !== 3) return null;
  const [userId, expStr, sig] = parts;
  if (!userId || !expStr || !sig) return null;
  const exp = Number(expStr);
  if (!Number.isFinite(exp) || exp < Math.floor(Date.now() / 1000))
    return null;
  const secret = feedSecret();
  const expected = createHmac("sha256", secret)
    .update(`${userId}.${expStr}`)
    .digest("hex");
  try {
    if (
      expected.length !== sig.length ||
      !timingSafeEqual(Buffer.from(expected), Buffer.from(sig))
    ) {
      return null;
    }
  } catch {
    return null;
  }
  return { userId };
}
