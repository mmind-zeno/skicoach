import { eq } from "drizzle-orm";
import { users, verificationTokens } from "../../drizzle/schema";
import { getDb } from "./db";
import { NotFoundError, ValidationError } from "./errors";
import { sendTeacherInviteMagicLinkEmail } from "./mail";

const MAX_AGE_SEC = 24 * 60 * 60;

function randomTokenHex(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return Array.from(bytes, (b) => ("0" + b.toString(16)).slice(-2)).join("");
}

async function sha256Hex(message: string): Promise<string> {
  const data = new TextEncoder().encode(message);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function resolveAppOrigin(): string {
  const raw =
    process.env.AUTH_URL ??
    process.env.NEXTAUTH_URL ??
    process.env.NEXT_PUBLIC_APP_URL;
  if (!raw?.trim()) {
    throw new Error(
      "AUTH_URL, NEXTAUTH_URL oder NEXT_PUBLIC_APP_URL muss gesetzt sein für Einladungs-E-Mails."
    );
  }
  return new URL(raw).origin;
}

async function insertMagicLoginToken(
  emailRaw: string,
  callbackPath: string
): Promise<{ magicUrl: string; expires: Date }> {
  const secret = process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET / NEXTAUTH_SECRET fehlt.");
  }

  const email = emailRaw.trim().toLowerCase();
  const origin = resolveAppOrigin();
  const path = callbackPath.startsWith("/") ? callbackPath : `/${callbackPath}`;
  const callbackUrl = `${origin}${path}`;
  const plainToken = randomTokenHex();
  const tokenHash = await sha256Hex(`${plainToken}${secret}`);
  const expires = new Date(Date.now() + MAX_AGE_SEC * 1000);

  const db = getDb();
  await db.insert(verificationTokens).values({
    identifier: email,
    token: tokenHash,
    expires,
  });

  const magicUrl = `${origin}/api/auth/callback/resend?${new URLSearchParams({
    callbackUrl,
    token: plainToken,
    email,
  })}`;

  return { magicUrl, expires };
}

/**
 * Einmal-Login-URL (24h) ohne E-Mail — nur für Bootstrap/Notfall (CLI, geschützter Zugang zum Server).
 */
export async function issueMagicLoginUrlForEmail(
  email: string,
  options?: { callbackPath?: string }
): Promise<{ url: string; expiresAt: Date }> {
  const db = getDb();
  const normalized = email.trim().toLowerCase();
  const row = await db.query.users.findFirst({
    where: eq(users.email, normalized),
  });
  if (!row) {
    throw new NotFoundError("Nutzer mit dieser E-Mail nicht gefunden");
  }
  if (!row.isActive) {
    throw new ValidationError("Nutzer ist deaktiviert — zuerst wieder aktivieren");
  }
  const { magicUrl, expires } = await insertMagicLoginToken(
    row.email,
    options?.callbackPath ?? "/kalender"
  );
  return { url: magicUrl, expiresAt: expires };
}

/**
 * Sendet denselben Magic-Link wie NextAuth/Resend, ohne `signIn()` im Route Handler
 * (vermeidet Set-Cookie auf der Admin-Antwort).
 */
async function deliverMagicLoginLink(
  emailRaw: string,
  displayName: string
): Promise<void> {
  const email = emailRaw.trim().toLowerCase();
  const origin = resolveAppOrigin();
  const { magicUrl } = await insertMagicLoginToken(email, "/kalender");

  await sendTeacherInviteMagicLinkEmail(
    email,
    displayName.trim(),
    magicUrl,
    `${origin}/login`
  );
}

export async function sendTeacherInviteMagicLink(input: {
  email: string;
  name: string;
}): Promise<void> {
  await deliverMagicLoginLink(input.email, input.name);
}

/** Bestehenden Nutzer per E-Mail — kein neuer DB-Eintrag. */
export async function resendTeacherMagicLink(email: string): Promise<void> {
  const db = getDb();
  const normalized = email.trim().toLowerCase();
  const row = await db.query.users.findFirst({
    where: eq(users.email, normalized),
  });
  if (!row) {
    throw new NotFoundError("Nutzer mit dieser E-Mail nicht gefunden");
  }
  if (!row.isActive) {
    throw new ValidationError("Nutzer ist deaktiviert — zuerst wieder aktivieren");
  }
  const label = row.name?.trim() || row.email.split("@")[0] || "Lehrkraft";
  await deliverMagicLoginLink(row.email, label);
}
