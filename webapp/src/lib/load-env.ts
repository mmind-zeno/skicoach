import { config } from "dotenv";
import { resolve } from "node:path";

/**
 * Für Custom Server (`server.ts`): .env vor anderen App-Imports laden.
 * Next.js lädt .env.local selbst; beim direkten `tsx server.ts` nicht.
 */
config({ path: resolve(process.cwd(), ".env.local") });
config({ path: resolve(process.cwd(), ".env") });
