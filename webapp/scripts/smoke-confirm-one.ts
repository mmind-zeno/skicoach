/**
 * Ruft confirmRequest für die neueste offene Anfrage auf (nur Server/Debug).
 *   node node_modules/tsx/dist/cli.mjs scripts/smoke-confirm-one.ts
 */
import { config } from "dotenv";
import { and, desc, eq, or } from "drizzle-orm";
import { resolve } from "node:path";
import { bookingRequests, users } from "../drizzle/schema";
import { getDb } from "../src/lib/db";
import { confirmRequest } from "../src/services/booking-request.service";
import { collectErrorChainText, getPostgresErrorCode } from "../src/lib/map-db-error";

config({ path: resolve(process.cwd(), ".env.local") });
config({ path: resolve(process.cwd(), ".env") });

async function main() {
  const db = getDb();
  const [req] = await db
    .select({ id: bookingRequests.id })
    .from(bookingRequests)
    .where(eq(bookingRequests.status, "neu"))
    .orderBy(desc(bookingRequests.createdAt))
    .limit(1);
  const [u] = await db
    .select({ id: users.id })
    .from(users)
    .where(
      and(
        eq(users.isActive, true),
        or(eq(users.role, "teacher"), eq(users.role, "admin"))
      )
    )
    .limit(1);
  if (!req?.id) {
    console.error("SMOKE_CONFIRM_SKIP: keine Anfrage mit status=neu");
    process.exit(0);
  }
  if (!u?.id) {
    console.error("SMOKE_CONFIRM_FAIL: kein aktiver User");
    process.exit(1);
  }
  try {
    const b = await confirmRequest(req.id, u.id, u.id);
    console.log("SMOKE_CONFIRM_OK", b.id);
  } catch (e) {
    console.error("SMOKE_CONFIRM_FAIL", getPostgresErrorCode(e), collectErrorChainText(e));
    process.exit(1);
  }
}

main();
