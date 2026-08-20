import postgres from "postgres";
import * as dotenv from "dotenv";
import { readdirSync, readFileSync } from "fs";
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
    // Ensure migrations table exists
    await sql`
      CREATE TABLE IF NOT EXISTS "__drizzle_migrations" (
        id SERIAL PRIMARY KEY,
        hash text NOT NULL,
        created_at bigint
      );
    `;

    const migrationsDir = resolve(import.meta.dirname, "./migrations");
    const migrationFiles = readdirSync(migrationsDir)
      .filter((f) => f.endsWith(".sql"))
      .sort();

    const applied = await sql`SELECT hash FROM "__drizzle_migrations"`;
    const appliedSet = new Set(applied.map((r) => r.hash));

    for (const file of migrationFiles) {
      if (appliedSet.has(file)) {
        console.log(`⏩ Skipping already applied migration: ${file}`);
        continue;
      }

      console.log(`📦 Applying migration: ${file}...`);
      const migrationSql = readFileSync(resolve(migrationsDir, file), "utf8");
      const statements = migrationSql
        .split("--> statement-breakpoint")
        .map((s) => s.trim())
        .filter(Boolean);

      for (const statement of statements) {
        try {
          await sql.unsafe(statement);
        } catch (stmtError: any) {
          // If type/table already exists on first migration run, skip safely
          if (
            stmtError?.message?.includes("already exists") ||
            stmtError?.message?.includes("duplicate key")
          ) {
            console.log(`ℹ️  Notice: ${stmtError.message}`);
          } else {
            throw stmtError;
          }
        }
      }

      await sql`
        INSERT INTO "__drizzle_migrations" (hash, created_at)
        VALUES (${file}, ${Date.now()});
      `;
      console.log(`✅ Applied: ${file}`);
    }

    console.log("✅ All migrations processed successfully on Supabase!");

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
