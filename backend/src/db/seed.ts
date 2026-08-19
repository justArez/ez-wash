import { db } from "./index";
import {
  tierSets,
  loyaltyTiers,
  promotions,
  rewardOffers,
  serviceItems,
  loyaltyCustomers,
  vehicles,
  bookings,
} from "./schema";
import { writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";
import { fileURLToPath } from "url";
import {
  TIERS,
  DEFAULT_PROMOTIONS,
  DEFAULT_REWARD_OFFERS,
} from "../models/loyalty.model";
import { DEFAULT_SERVICES } from "../services/service.service";
import { DEFAULT_TIER_SETS } from "../services/tier-set.service";

const __dirname = fileURLToPath(new URL("./", import.meta.url));
const DATA_DIR = join(__dirname, "..", "..", "data");
const STORE_PATH = join(DATA_DIR, "loyalty-store.json");

export async function seedDatabase() {
  console.log("🌱 Seeding JSON store data...");

  const seedStoreData = {
    customers: [
      {
        id: "cust-test-1",
        phone: "555-1234",
        fullName: "Alex Rivera",
        username: "alex_driver",
        email: "alex@example.com",
        licensePlates: ["ABC1234"],
        tierId: "gold",
        tierName: "Gold",
        pointsBalance: 1750,
        vehicles: [
          {
            plate: "ABC1234",
            model: "Tesla Model 3",
            type: "car",
          },
        ],
        pointHistory: [
          {
            id: "pt-1",
            type: "earn",
            amount: 250,
            date: "2026-08-15T10:00:00.000Z",
            description: "Deluxe Polish & Wax booking completion",
          },
          {
            id: "pt-2",
            type: "earn",
            amount: 50,
            date: "2026-08-19T14:30:00.000Z",
            description: "Customer goodwill loyalty bonus",
          },
        ],
        bookingHistory: [
          {
            id: "bk-1",
            customerId: "cust-test-1",
            customerName: "Alex Rivera",
            customerPhone: "555-1234",
            vehiclePlate: "ABC1234",
            serviceId: "srv-deluxe-wash",
            serviceName: "Deluxe Polish & Wax",
            date: "2026-08-20",
            timeSlot: "09:30",
            time: "09:30",
            duration: 30,
            status: "confirmed",
            appliedPerks: ["gold priority booking", "free premium wax"],
            createdAt: "2026-08-19T10:00:00.000Z",
          },
          {
            id: "bk-2",
            customerId: "cust-test-1",
            customerName: "Alex Rivera",
            customerPhone: "555-1234",
            vehiclePlate: "ABC1234",
            serviceId: "srv-basic-wash",
            serviceName: "Basic Exterior Wash",
            date: "2026-08-22",
            timeSlot: "14:00",
            time: "14:00",
            duration: 30,
            status: "confirmed",
            appliedPerks: [],
            createdAt: "2026-08-19T11:00:00.000Z",
          },
        ],
        claimedPromos: [
          {
            id: "cp-1",
            promoId: "promo-membership-1",
            title: "10% Off Premium Wash",
            claimedAt: "2026-08-10T08:00:00.000Z",
            validUntil: "2026-12-31T23:59:59.000Z",
            status: "ACTIVE",
            perkIdentifier: "10% OFF",
          },
        ],
        lateCancellationWarningCount: 0,
        priorityStatus: "normal",
        status: "Active",
        createdAt: "2026-08-01T00:00:00.000Z",
        updatedAt: "2026-08-19T14:30:00.000Z",
      },
      {
        id: "cust-test-2",
        phone: "555-9876",
        fullName: "Sarah Connor",
        username: "sarah_c",
        email: "sarah@example.com",
        licensePlates: ["XYZ5678"],
        tierId: "platinum",
        tierName: "Platinum",
        pointsBalance: 3400,
        vehicles: [
          {
            plate: "XYZ5678",
            model: "Porsche Taycan",
            type: "car",
          },
        ],
        pointHistory: [
          {
            id: "pt-3",
            type: "earn",
            amount: 500,
            date: "2026-08-16T12:00:00.000Z",
            description: "Ceramic Shield Detailing completion",
          },
        ],
        bookingHistory: [
          {
            id: "bk-3",
            customerId: "cust-test-2",
            customerName: "Sarah Connor",
            customerPhone: "555-9876",
            vehiclePlate: "XYZ5678",
            serviceId: "srv-ceramic-coating",
            serviceName: "Ceramic Shield Detailing",
            date: "2026-08-20",
            timeSlot: "11:00",
            time: "11:00",
            duration: 30,
            status: "confirmed",
            appliedPerks: ["platinum priority booking", "free premium wax"],
            createdAt: "2026-08-19T09:00:00.000Z",
          },
          {
            id: "bk-4",
            customerId: "cust-test-2",
            customerName: "Sarah Connor",
            customerPhone: "555-9876",
            vehiclePlate: "XYZ5678",
            serviceId: "srv-interior-detail",
            serviceName: "Interior Deep Detail",
            date: "2026-08-21",
            timeSlot: "15:30",
            time: "15:30",
            duration: 30,
            status: "confirmed",
            appliedPerks: [],
            createdAt: "2026-08-19T09:30:00.000Z",
          },
        ],
        claimedPromos: [],
        lateCancellationWarningCount: 0,
        priorityStatus: "normal",
        status: "Active",
        createdAt: "2026-08-01T00:00:00.000Z",
        updatedAt: "2026-08-19T10:00:00.000Z",
      },
      {
        id: "cust-test-3",
        phone: "555-5555",
        fullName: "Mike Chen",
        username: "mike_rider",
        email: "mike@example.com",
        licensePlates: ["MOTO99"],
        tierId: "silver",
        tierName: "Silver",
        pointsBalance: 620,
        vehicles: [
          {
            plate: "MOTO99",
            model: "Ducati Monster",
            type: "motorcycle",
          },
        ],
        pointHistory: [
          {
            id: "pt-4",
            type: "earn",
            amount: 120,
            date: "2026-08-14T11:00:00.000Z",
            description: "Basic Wash completion",
          },
        ],
        bookingHistory: [
          {
            id: "bk-5",
            customerId: "cust-test-3",
            customerName: "Mike Chen",
            customerPhone: "555-5555",
            vehiclePlate: "MOTO99",
            serviceId: "srv-basic-wash",
            serviceName: "Basic Exterior Wash",
            date: "2026-08-20",
            timeSlot: "10:30",
            time: "10:30",
            duration: 30,
            status: "confirmed",
            appliedPerks: ["express rinse"],
            createdAt: "2026-08-19T08:00:00.000Z",
          },
        ],
        claimedPromos: [],
        lateCancellationWarningCount: 0,
        priorityStatus: "normal",
        status: "Active",
        createdAt: "2026-08-05T00:00:00.000Z",
        updatedAt: "2026-08-19T08:00:00.000Z",
      },
    ],
    tiers: Object.values(TIERS),
    tierSets: DEFAULT_TIER_SETS,
    services: DEFAULT_SERVICES,
    rewardOffers: DEFAULT_REWARD_OFFERS,
    promotions: [
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
        startDate: "2026-08-01",
        endDate: "2026-12-31",
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
        startDate: "2026-08-01",
        endDate: "2026-12-31",
        status: "ACTIVE",
        isActive: true,
      },
      {
        id: "promo-weekend-wax",
        name: "Weekend Carnauba Wax Special",
        title: "Free Carnauba Wax Upgrade",
        description:
          "Book any Saturday or Sunday Deluxe Wash and get upgraded with premium Carnauba wax protection.",
        category: "service_addon",
        discountPercentage: 15,
        pointPrice: 100,
        applicableTiers: ["member", "silver", "gold", "platinum"],
        applicableVehicleModels: [],
        badgeLabel: "WEEKEND SPECIAL",
        startDate: "2026-08-01",
        endDate: "2026-12-31",
        status: "ACTIVE",
        isActive: true,
      },
    ],
    auditLogs: [
      {
        id: "log-1",
        timestamp: "2026-08-19T14:30:00.000Z",
        actor: "admin",
        actionType: "seed",
        entityType: "system",
        entityId: "system",
        details:
          "Initial system seeding with 30-min operating slots (09:00 - 17:00)",
      },
    ],
    lastTierEvaluationDate: new Date().toISOString().split("T")[0],
  };

  if (!existsSync(DATA_DIR)) {
    mkdirSync(DATA_DIR, { recursive: true });
  }
  writeFileSync(STORE_PATH, JSON.stringify(seedStoreData, null, 2), "utf8");
  console.log("✅ JSON Store seeded at:", STORE_PATH);

  // PostgreSQL / Drizzle Seeding
  if (!db) {
    console.log(
      "ℹ️  DATABASE_URL is not set. Skipped PostgreSQL Drizzle seed (JSON file store active).",
    );
    return;
  }

  console.log("🌱 Starting PostgreSQL database seeding via Drizzle...");

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
      {
        id: "srv-ceramic-coating",
        name: "Ceramic Shield Detailing",
        category: "Full Package",
        description:
          "Ultimate paint protection with multi-layer nano-ceramic coating and rain repel.",
        durationMinutes: 75,
        price: 120.0,
        popularityCount: 95,
        status: "ACTIVE",
        features: [
          "Full exterior & interior",
          "9H Ceramic paint sealant",
          "Rain-X windshield coating",
          "6-month shine warranty",
        ],
      },
    ])
    .onConflictDoNothing();

  await db
    .insert(loyaltyCustomers)
    .values([
      {
        id: "cust-test-1",
        phone: "555-1234",
        fullName: "Alex Rivera",
        username: "alex_driver",
        email: "alex@example.com",
        tierId: "gold",
        pointsBalance: 1750,
        lateCancellationWarningCount: 0,
        priorityStatus: "normal",
        status: "Active",
      },
      {
        id: "cust-test-2",
        phone: "555-9876",
        fullName: "Sarah Connor",
        username: "sarah_c",
        email: "sarah@example.com",
        tierId: "platinum",
        pointsBalance: 3400,
        lateCancellationWarningCount: 0,
        priorityStatus: "normal",
        status: "Active",
      },
    ])
    .onConflictDoNothing();

  await db
    .insert(vehicles)
    .values([
      {
        id: "veh-1",
        customerId: "cust-test-1",
        plate: "ABC1234",
        model: "Tesla Model 3",
        type: "car",
      },
      {
        id: "veh-2",
        customerId: "cust-test-2",
        plate: "XYZ5678",
        model: "Porsche Taycan",
        type: "car",
      },
    ])
    .onConflictDoNothing();

  await db
    .insert(bookings)
    .values([
      {
        id: "bk-1",
        customerId: "cust-test-1",
        vehiclePlate: "ABC1234",
        serviceId: "srv-deluxe-wash",
        date: new Date("2026-08-20T09:30:00Z"),
        timeSlot: "09:30",
        durationMinutes: 30,
        status: "confirmed",
        pointsEarned: 250,
        pointsSpent: 0,
        appliedPerks: ["gold priority booking", "free premium wax"],
      },
      {
        id: "bk-2",
        customerId: "cust-test-1",
        vehiclePlate: "ABC1234",
        serviceId: "srv-basic-wash",
        date: new Date("2026-08-22T14:00:00Z"),
        timeSlot: "14:00",
        durationMinutes: 30,
        status: "confirmed",
        pointsEarned: 100,
        pointsSpent: 0,
        appliedPerks: [],
      },
    ])
    .onConflictDoNothing();

  console.log("✅ PostgreSQL Database seeding completed.");
}

if (import.meta.main || process.argv[1]?.endsWith("seed.ts")) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("❌ Seed failed:", err);
      process.exit(1);
    });
}
