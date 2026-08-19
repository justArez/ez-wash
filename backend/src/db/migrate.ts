import { migrate } from "drizzle-orm/postgres-js/migrator";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as dotenv from "dotenv";
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

  console.log("🚀 Syncing schema with Supabase database...");
  const sql = postgres(connectionString, { max: 1, prepare: false });

  // Clean stale empty tables to ensure clean drizzle migration baseline
  await sql.unsafe(`
    DROP TABLE IF EXISTS "bookings" CASCADE;
    DROP TABLE IF EXISTS "vehicles" CASCADE;
    DROP TABLE IF EXISTS "point_transactions" CASCADE;
    DROP TABLE IF EXISTS "claimed_promos" CASCADE;
    DROP TABLE IF EXISTS "redemptions" CASCADE;
    DROP TABLE IF EXISTS "rewards" CASCADE;
    DROP TABLE IF EXISTS "reward_offers" CASCADE;
    DROP TABLE IF EXISTS "promotions" CASCADE;
    DROP TABLE IF EXISTS "service_items" CASCADE;
    DROP TABLE IF EXISTS "services" CASCADE;
    DROP TABLE IF EXISTS "loyalty_customers" CASCADE;
    DROP TABLE IF EXISTS "customers" CASCADE;
    DROP TABLE IF EXISTS "loyalty_tiers" CASCADE;
    DROP TABLE IF EXISTS "tier_sets" CASCADE;
    DROP TABLE IF EXISTS "audit_logs" CASCADE;
    DROP TABLE IF EXISTS "__drizzle_migrations" CASCADE;
    
    DROP TYPE IF EXISTS "public"."vehicle_type" CASCADE;
    DROP TYPE IF EXISTS "public"."priority_status" CASCADE;
    DROP TYPE IF EXISTS "public"."booking_status" CASCADE;
    DROP TYPE IF EXISTS "public"."promotion_status" CASCADE;
    DROP TYPE IF EXISTS "public"."claimed_promo_status" CASCADE;
    DROP TYPE IF EXISTS "public"."transaction_type" CASCADE;
  `);

  const db = drizzle(sql);

  try {
    await migrate(db, {
      migrationsFolder: resolve(import.meta.dirname, "./migrations"),
    });
    console.log("✅ All migrations applied successfully!");
    await sql.end();
    process.exit(0);
  } catch (error) {
    console.error("❌ Migration failed:", error);
    await sql.end();
    process.exit(1);
  }
}

runMigrations();
