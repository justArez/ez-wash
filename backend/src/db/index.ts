import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as dotenv from "dotenv";
import { resolve } from "path";
import * as schema from "./schema";

// Load .env from backend folder or root
dotenv.config({ path: resolve(import.meta.dirname, "../../.env") });
if (!process.env.DATABASE_URL) {
  dotenv.config();
}

const connectionString = process.env.DATABASE_URL;

// If DATABASE_URL is provided, initialize postgres client with prepared statement disabled for Supabase PgBouncer/transaction pooler support.
// idle_timeout/max_lifetime are set below the pooler's own idle timeout so stale
// connections are recycled by the client instead of being killed server-side and
// surfacing as "socket hang up" errors on the next query.
const client = connectionString
  ? postgres(connectionString, {
      prepare: false,
      connect_timeout: 10,
      idle_timeout: 20,
      max_lifetime: 60 * 30,
      onnotice: () => {},
    })
  : null;

export const db = client ? drizzle(client, { schema }) : null;

export { schema };
