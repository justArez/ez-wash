import postgres from "postgres";
import * as dotenv from "dotenv";
import { resolve } from "path";

// Load backend/.env
dotenv.config({ path: resolve(import.meta.dirname, "../../.env") });
if (!process.env.DATABASE_URL) {
  dotenv.config();
}

async function testConnection() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    console.error("❌ DATABASE_URL is not defined in .env");
    process.exit(1);
  }

  console.log("🔄 Attempting to connect to Supabase PostgreSQL database...");

  try {
    const sql = postgres(connectionString, {
      prepare: false,
      connect_timeout: 10,
    });

    const result =
      await sql`SELECT NOW() as current_time, version() as version;`;
    console.log("✅ Successfully connected to Supabase!");
    console.log(`🕒 Server Time: ${result[0].current_time}`);
    console.log(`🐘 Postgres Version: ${result[0].version.split(" on ")[0]}`);

    await sql.end();
    process.exit(0);
  } catch (error: any) {
    console.error("❌ Database connection failed:");
    console.error(error.message || error);
    process.exit(1);
  }
}

testConnection();
