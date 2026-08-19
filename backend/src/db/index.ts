import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as dotenv from "dotenv";
import * as schema from "./schema";

dotenv.config();

const connectionString = process.env.DATABASE_URL;

// If DATABASE_URL is provided, initialize postgres client with prepared statement disabled for Supabase PgBouncer/transaction pooler support
const client = connectionString
  ? postgres(connectionString, { prepare: false })
  : null;

export const db = client ? drizzle(client, { schema }) : null;

export { schema };
