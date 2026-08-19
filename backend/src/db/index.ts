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

// If DATABASE_URL is provided, initialize postgres client with prepared statement disabled for Supabase PgBouncer/transaction pooler support
const client = connectionString
  ? postgres(connectionString, { prepare: false, connect_timeout: 10 })
  : null;

export const db = client ? drizzle(client, { schema }) : null;

export { schema };
