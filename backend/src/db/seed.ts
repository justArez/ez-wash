import postgres from "postgres";
import * as dotenv from "dotenv";
import { resolve } from "path";

dotenv.config({ path: resolve(import.meta.dirname, "../../.env") });
if (!process.env.DATABASE_URL) {
  dotenv.config();
}

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("❌ DATABASE_URL is required to seed database.");
  process.exit(1);
}

const sql = postgres(connectionString, { prepare: false });

const PROMOTIONS = [
  {
    id: "promo-welcome-wash",
    name: "Welcome First Wash: 20% Off",
    title: "Welcome First Wash: 20% Off",
    description: "Get 20% off your total booking price on any appointment.",
    category: "discount",
    promo_type: "booking_discount",
    discount_percentage: 20,
    discount_amount: null,
    bonus_points: 0,
    applicable_service_ids: null,
    applicable_days_of_week: null,
    dedicated_date: null,
    point_price: 0,
    applicable_tiers: [],
    applicable_vehicle_models: [],
    badge_label: "20% OFF",
    banner_image: null,
    terms:
      "Applies to total booking amount. Cannot be combined with other offers.",
    is_infinite_use: false,
    start_date: new Date("2026-01-01T00:00:00Z"),
    end_date: new Date("2026-12-31T23:59:59Z"),
    status: "ACTIVE",
    is_active: true,
  },
  {
    id: "promo-double-pts-boost",
    name: "Double Points Loyalty Boost",
    title: "Double Points Loyalty Boost",
    description: "Earn +80 bonus loyalty points on your completed booking.",
    category: "points_bonus",
    promo_type: "bonus_points",
    discount_percentage: 0,
    discount_amount: null,
    bonus_points: 80,
    applicable_service_ids: null,
    applicable_days_of_week: null,
    dedicated_date: null,
    point_price: 0,
    applicable_tiers: [],
    applicable_vehicle_models: [],
    badge_label: "Loyalty Boost",
    banner_image: null,
    terms: "Bonus points credited upon wash completion.",
    is_infinite_use: false,
    start_date: new Date("2026-01-01T00:00:00Z"),
    end_date: new Date("2026-12-31T23:59:59Z"),
    status: "ACTIVE",
    is_active: true,
  },
  {
    id: "promo-save-5-dollars",
    name: "$5 Off Any Total Wash",
    title: "$5 Off Any Total Wash",
    description:
      "Flat $5 instant discount applied to your total booking price.",
    category: "discount",
    promo_type: "booking_discount",
    discount_percentage: 0,
    discount_amount: 5,
    bonus_points: 0,
    applicable_service_ids: null,
    applicable_days_of_week: null,
    dedicated_date: null,
    point_price: 0,
    applicable_tiers: [],
    applicable_vehicle_models: [],
    badge_label: "$5 OFF",
    banner_image: null,
    terms: "Flat $5 discount on total booking.",
    is_infinite_use: false,
    start_date: new Date("2026-01-01T00:00:00Z"),
    end_date: new Date("2026-12-31T23:59:59Z"),
    status: "ACTIVE",
    is_active: true,
  },
  {
    id: "promo-silver-voucher-10",
    name: "Silver+ 10% Total Booking Voucher",
    title: "Silver+ 10% Total Booking Voucher",
    description: "Redeem 150 points for a 10% discount on your entire booking.",
    category: "tier_reward",
    promo_type: "booking_discount",
    discount_percentage: 10,
    discount_amount: null,
    bonus_points: 0,
    applicable_service_ids: null,
    applicable_days_of_week: null,
    dedicated_date: null,
    point_price: 150,
    applicable_tiers: ["silver", "gold", "platinum"],
    applicable_vehicle_models: [],
    badge_label: "Silver+ Reward",
    banner_image: null,
    terms: "Silver tier and above. Applies to total booking price.",
    is_infinite_use: false,
    start_date: new Date("2026-01-01T00:00:00Z"),
    end_date: new Date("2026-12-31T23:59:59Z"),
    status: "ACTIVE",
    is_active: true,
  },
  {
    id: "promo-gold-voucher-15",
    name: "Gold+ 15% Total Booking Voucher",
    title: "Gold+ 15% Total Booking Voucher",
    description:
      "Redeem 300 points for a 15% discount on your total booking bill.",
    category: "tier_reward",
    promo_type: "booking_discount",
    discount_percentage: 15,
    discount_amount: null,
    bonus_points: 0,
    applicable_service_ids: null,
    applicable_days_of_week: null,
    dedicated_date: null,
    point_price: 300,
    applicable_tiers: ["gold", "platinum"],
    applicable_vehicle_models: [],
    badge_label: "Gold+ Exclusive",
    banner_image: null,
    terms: "Gold tier and above. Applies to total booking price.",
    is_infinite_use: false,
    start_date: new Date("2026-01-01T00:00:00Z"),
    end_date: new Date("2026-12-31T23:59:59Z"),
    status: "ACTIVE",
    is_active: true,
  },
  {
    id: "promo-platinum-voucher-25",
    name: "Platinum 25% Total Booking Voucher",
    title: "Platinum 25% Total Booking Voucher",
    description: "Redeem 500 points for 25% off your entire car wash visit.",
    category: "tier_reward",
    promo_type: "booking_discount",
    discount_percentage: 25,
    discount_amount: null,
    bonus_points: 0,
    applicable_service_ids: null,
    applicable_days_of_week: null,
    dedicated_date: null,
    point_price: 500,
    applicable_tiers: ["platinum"],
    applicable_vehicle_models: [],
    badge_label: "Platinum Elite",
    banner_image: null,
    terms: "Platinum tier only. 25% off total booking price.",
    is_infinite_use: false,
    start_date: new Date("2026-01-01T00:00:00Z"),
    end_date: new Date("2026-12-31T23:59:59Z"),
    status: "ACTIVE",
    is_active: true,
  },
];

async function seed() {
  console.log("🧹 Cleaning old promo data...");
  try {
    // Delete existing claimed promos and promotions
    await sql`DELETE FROM claimed_promos;`;
    console.log("   ✓ Cleaned claimed_promos table.");

    await sql`DELETE FROM promotions;`;
    console.log("   ✓ Cleaned promotions table.");

    console.log("🌱 Seeding total booking-oriented promotions...");
    for (const promo of PROMOTIONS) {
      await sql`
        INSERT INTO promotions (
          id,
          name,
          title,
          description,
          category,
          promo_type,
          discount_percentage,
          discount_amount,
          bonus_points,
          applicable_service_ids,
          applicable_days_of_week,
          dedicated_date,
          point_price,
          applicable_tiers,
          applicable_vehicle_models,
          badge_label,
          banner_image,
          terms,
          is_infinite_use,
          start_date,
          end_date,
          status,
          is_active,
          created_at,
          updated_at
        ) VALUES (
          ${promo.id},
          ${promo.name},
          ${promo.title},
          ${promo.description},
          ${promo.category},
          ${promo.promo_type},
          ${promo.discount_percentage},
          ${promo.discount_amount},
          ${promo.bonus_points},
          ${promo.applicable_service_ids},
          ${promo.applicable_days_of_week},
          ${promo.dedicated_date},
          ${promo.point_price},
          ${promo.applicable_tiers},
          ${promo.applicable_vehicle_models},
          ${promo.badge_label},
          ${promo.banner_image},
          ${promo.terms},
          ${promo.is_infinite_use ?? false},
          ${promo.start_date},
          ${promo.end_date},
          ${promo.status},
          ${promo.is_active},
          NOW(),
          NOW()
        );
      `;
      console.log(`   ✓ Seeded: ${promo.name} (${promo.id})`);
    }

    console.log("🎉 Promo seeding completed successfully!");
  } catch (err: any) {
    console.error("❌ Error seeding promotions:", err.message);
  } finally {
    await sql.end({ timeout: 1 });
  }
}

seed();
