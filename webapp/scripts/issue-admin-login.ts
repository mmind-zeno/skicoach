/**
 * Legt sicher einen Admin-Nutzer an (Standard: admin@skicoach.li) und gibt eine
 * Magic-Login-URL aus (24h, gleicher Mechanismus wie E-Mail-Login — ohne Resend).
 *
 * Env: DATABASE_URL, AUTH_SECRET|NEXTAUTH_SECRET, AUTH_URL|NEXTAUTH_URL|NEXT_PUBLIC_APP_URL
 * Optional: ADMIN_BOOTSTRAP_EMAIL, ADMIN_BOOTSTRAP_NAME, SEED_EMAIL_DOMAIN oder
 * NEXT_PUBLIC_SITE_DOMAIN (Default-Admin: admin@<Domain>, wenn ADMIN_BOOTSTRAP_EMAIL fehlt)
 *
 * Ausführung: npm run admin:login-url
 */
import { config } from "dotenv";
import { eq } from "drizzle-orm";
import { resolve } from "node:path";
import { users } from "../drizzle/schema";
import { getDb } from "../src/lib/db";
import { issueMagicLoginUrlForEmail } from "../src/lib/invite-magic-link";

config({ path: resolve(process.cwd(), ".env.local") });
config({ path: resolve(process.cwd(), ".env") });

const bootstrapDomain =
  process.env.SEED_EMAIL_DOMAIN?.trim() ||
  process.env.NEXT_PUBLIC_SITE_DOMAIN?.trim() ||
  "skicoach.li";
const email = (
  process.env.ADMIN_BOOTSTRAP_EMAIL ?? `admin@${bootstrapDomain}`
)
  .trim()
  .toLowerCase();
const displayName = (process.env.ADMIN_BOOTSTRAP_NAME ?? "Admin").trim();

async function ensureAdminUser() {
  const db = getDb();
  const existing = await db.query.users.findFirst({
    where: eq(users.email, email),
  });
  if (existing) {
    if (existing.role !== "admin" || !existing.isActive) {
      await db
        .update(users)
        .set({ role: "admin", isActive: true })
        .where(eq(users.id, existing.id));
    }
    return;
  }
  await db.insert(users).values({
    email,
    name: displayName,
    role: "admin",
    colorIndex: 0,
    isActive: true,
    emailVerified: new Date(),
  });
}

async function main() {
  await ensureAdminUser();
  const { url, expiresAt } = await issueMagicLoginUrlForEmail(email, {
    callbackPath: "/admin",
  });
  console.log(
    JSON.stringify(
      {
        email,
        expiresAt: expiresAt.toISOString(),
        magicLoginUrl: url,
      },
      null,
      2
    )
  );
  console.error(
    "\nNote: this URL grants access (same as email magic link). Valid ~24h — treat as secret."
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
