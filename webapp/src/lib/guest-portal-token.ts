import { SignJWT, jwtVerify } from "jose";

function getSecretBytes(): Uint8Array {
  const s =
    process.env.GUEST_PORTAL_SECRET?.trim() ||
    process.env.NEXTAUTH_SECRET?.trim() ||
    process.env.AUTH_SECRET?.trim();
  if (!s) {
    throw new Error("GUEST_PORTAL_SECRET or NEXTAUTH_SECRET required for guest portal");
  }
  return new TextEncoder().encode(s);
}

export function normalizeGuestEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function signGuestPortalToken(
  guestId: string,
  emailNorm: string
): Promise<string> {
  return new SignJWT({ em: emailNorm })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(guestId)
    .setExpirationTime("7d")
    .setIssuedAt()
    .sign(getSecretBytes());
}

export async function verifyGuestPortalToken(
  token: string
): Promise<{ guestId: string; emailNorm: string }> {
  const { payload } = await jwtVerify(token, getSecretBytes());
  const guestId = typeof payload.sub === "string" ? payload.sub : "";
  const emailNorm =
    typeof payload.em === "string" ? payload.em : "";
  if (!guestId) {
    throw new Error("invalid_token");
  }
  return { guestId, emailNorm };
}
