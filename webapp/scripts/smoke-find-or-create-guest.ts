/**
 * Smoke: findOrCreateByEmail (Confirm-Pfad) — z. B. im Container:
 *   npx tsx scripts/smoke-find-or-create-guest.ts
 */
import { config } from "dotenv";
import { resolve } from "node:path";
import { findOrCreateByEmail } from "../src/services/guest.service";

config({ path: resolve(process.cwd(), ".env.local") });
config({ path: resolve(process.cwd(), ".env") });

const email = `smoke-${Date.now()}@invalid.local`;

findOrCreateByEmail(email, "Smoke Guest")
  .then((g) => {
    console.log("SMOKE_OK", g.id, g.email);
    process.exit(0);
  })
  .catch((e) => {
    console.error("SMOKE_FAIL", e);
    process.exit(1);
  });
