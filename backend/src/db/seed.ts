import { db } from "./index";
import {
  tierSets,
  loyaltyTiers,
  promotions,
  rewardOffers,
  serviceItems,
} from "./schema";

export async function seedDatabase() {
  if (!db) {
    console.warn("DATABASE_URL is not configured. Skipping database seed.");
    return;
  }

  console.log("🌱 Starting database seeding...");

  // 1. Create Default Tier Set
  const defaultTierSetId = "default-tier-set";
  await db
    .insert(tierSets)
    .values({
      id: defaultTierSetId,
      name: "Standard Loyalty Tier Set",
      status: "Active",
      description: "Default loyalty tier progression configuration",
    })
    .onConflictDoNothing();

  // 2. Insert Default Loyalty Tiers
  await db
    .insert(loyaltyTiers)
    .values([
      {
        id: "member",
        name: "Member",
        level: "MEMBER",
        pointThreshold: 0,
        bookingWindowDays: 7,
        pointRate: 1.0,
        multiplier: "1.0x",
        discount: "0%",
        perks: ["basic early access", "standard wash add-on"],
        description:
          "Standard loyalty level with a 7-day booking window and baseline points earning.",
        isActive: true,
        tierSetId: defaultTierSetId,
      },
      {
        id: "silver",
        name: "Silver",
        level: "SILVER",
        pointThreshold: 500,
        bookingWindowDays: 10,
        pointRate: 1.25,
        multiplier: "1.25x",
        discount: "5%",
        perks: ["silver priority booking", "express rinse"],
        description:
          "Silver members receive a 10-day booking window and faster wash options.",
        isActive: true,
        tierSetId: defaultTierSetId,
      },
      {
        id: "gold",
        name: "Gold",
        level: "GOLD",
        pointThreshold: 1500,
        bookingWindowDays: 12,
        pointRate: 1.5,
        multiplier: "1.5x",
        discount: "10%",
        perks: ["gold priority booking", "free premium wax"],
        description:
          "Gold tier increases your booking window and unlocks premium treatment perks.",
        isActive: true,
        tierSetId: defaultTierSetId,
      },
      {
        id: "platinum",
        name: "Platinum",
        level: "PLATINUM",
        pointThreshold: 3000,
        bookingWindowDays: 14,
        pointRate: 2.0,
        multiplier: "2.0x",
        discount: "15%",
        perks: [
          "platinum priority booking",
          "free premium wax",
          "exclusive service bundle",
        ],
        description:
          "Platinum tier gives the longest window and the most generous perks.",
        isActive: true,
        tierSetId: defaultTierSetId,
      },
    ])
    .onConflictDoNothing();

  // 3. Insert Default Promotions
  await db
    .insert(promotions)
    .values([
      {
        id: "promo-membership-1",
        name: "Silver+ Welcome Bonus",
        title: "10% Off Premium Wash",
        description:
          "Silver tier and above receive 10% off a premium wash when booking within their loyalty window.",
        category: "discount",
        discountPercentage: 10,
        pointPrice: 0,
        applicableTiers: ["silver", "gold", "platinum"],
        applicableVehicleModels: [],
        badgeLabel: "10% OFF",
        startDate: new Date("2026-08-01"),
        endDate: new Date("2026-12-31"),
        status: "ACTIVE",
        isActive: true,
      },
      {
        id: "promo-gold-ride",
        name: "Motorcycle Express Treat",
        title: "Free Express Enhancement",
        description:
          "Gold and Platinum motorcycle riders receive a free express enhancement with a premium service.",
        category: "tier_reward",
        discountPercentage: 0,
        pointPrice: 150,
        applicableTiers: ["gold", "platinum"],
        applicableVehicleModels: [],
        badgeLabel: "GOLD & ABOVE",
        startDate: new Date("2026-08-01"),
        endDate: new Date("2026-12-31"),
        status: "ACTIVE",
        isActive: true,
      },
    ])
    .onConflictDoNothing();

  // 4. Insert Default Reward Offers
  await db
    .insert(rewardOffers)
    .values([
      {
        id: "reward-1",
        title: "Free tire shine",
        description:
          "Redeem 200 points for a complimentary tire shine with your next wash.",
        pointsRequired: 200,
        eligibleTiers: ["silver", "gold", "platinum"],
      },
      {
        id: "reward-2",
        title: "Free vacuum add-on",
        description: "Redeem 300 points for a free interior vacuum add-on.",
        pointsRequired: 300,
        eligibleTiers: ["gold", "platinum"],
      },
    ])
    .onConflictDoNothing();

  // 5. Insert Default Service Catalog
  await db
    .insert(serviceItems)
    .values([
      {
        id: "srv-basic-wash",
        name: "Basic Exterior Wash",
        category: "Exterior Wash",
        description:
          "Touchless high-pressure foam wash, wheel rinse, and spot-free air dry.",
        durationMinutes: 20,
        price: 15.0,
        popularityCount: 340,
        status: "ACTIVE",
        features: ["High-pressure rinse", "Foam bath", "Tire shine", "Air dry"],
      },
      {
        id: "srv-deluxe-wash",
        name: "Deluxe Polish & Wax",
        category: "Full Package",
        description:
          "Full exterior wash + clearcoat protection sealant and hand rim polish.",
        durationMinutes: 35,
        price: 30.0,
        popularityCount: 512,
        status: "ACTIVE",
        features: [
          "Everything in Basic",
          "Carnauba wax shield",
          "Underbody chassis spray",
          "Interior quick vacuum",
        ],
      },
      {
        id: "srv-interior-detail",
        name: "Interior Deep Detail",
        category: "Interior Detailing",
        description:
          "Steam sanitation, leather conditioning, dashboard polish, and upholstery extraction.",
        durationMinutes: 50,
        price: 65.0,
        popularityCount: 189,
        status: "ACTIVE",
        features: [
          "Deep steam sanitization",
          "Leather UV protectant",
          "Odor elimination treatment",
          "Glass crystal polish",
        ],
      },
    ])
    .onConflictDoNothing();

  console.log("✅ Database seeding completed.");
}

if (import.meta.main || process.argv[1]?.endsWith("seed.ts")) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("❌ Seed failed:", err);
      process.exit(1);
    });
}
