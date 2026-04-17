import bcrypt from "bcrypt";

export const PASSWORD_MIN_LENGTH = 10;

const SALT_ROUNDS = 12;

/** Hash für Timing-Vergleich, falls Nutzer/Zeile fehlt (bcrypt von „dummy“). */
const DUMMY_BCRYPT =
  "$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.UVzKuJ3yHYTHHK";

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

export async function verifyPassword(
  plain: string,
  passwordHash: string | null | undefined
): Promise<boolean> {
  const hash = passwordHash ?? DUMMY_BCRYPT;
  return bcrypt.compare(plain, hash);
}

export async function verifyPasswordDummy(plain: string): Promise<void> {
  await bcrypt.compare(plain, DUMMY_BCRYPT);
}
