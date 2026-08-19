import postgres from "postgres";
import * as dotenv from "dotenv";
import { readFileSync } from "fs";
import { resolve } from "path";

dotenv.config({ path: resolve(import.meta.dirname, "../../.env") });
if (!process.env.DATABASE_URL) {
  dotenv.config();
}

async function runMigrations() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("❌ DATABASE_URL is not set.");
    process.exit(1);
  }

  console.log("🚀 Executing schema migration on Supabase database...");
  const sql = postgres(connectionString, {
    max: 1,
    prepare: false,
    connect_timeout: 15,
  });

  try {
    const migrationSql = readFileSync(
      resolve(import.meta.dirname, "./migrations/0000_redundant_epoch.sql"),
      "utf8",
    );

    const statements = migrationSql
      .split("--> statement-breakpoint")
      .map((s) => s.trim())
      .filter(Boolean);

    for (const statement of statements) {
      await sql.unsafe(statement);
    }

    console.log("✅ All tables and enums created successfully on Supabase!");

    // Verify tables
    const tables = await sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name;
    `;
    console.log("📋 Current tables in Supabase public schema:");
    tables.forEach((t) => console.log(`  - ${t.table_name}`));

    await sql.end();
    process.exit(0);
  } catch (error: any) {
    console.error("❌ Migration execution error:", error?.message || error);
    await sql.end();
    process.exit(1);
  }
}

runMigrations();
