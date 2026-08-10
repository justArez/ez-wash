export type VehicleType = "car" | "motorcycle";

export interface Vehicle {
  plate: string;
  model: string;
  type: VehicleType;
  lastWashDate?: string;
}

export type LoyaltyTierId = string;

export interface LoyaltyTier {
  id: string;
  name: string;
  bookingWindowDays: number;
  pointRate: number;
  perks: string[];
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PointTransaction {
  id: string;
  type: "earn" | "spend" | "expire";
  amount: number;
  date: string;
  description: string;
}

export interface Booking {
  id: string;
  customerId: string;
  vehiclePlate: string;
  date: string;
  createdAt: string;
  appliedPerks: string[];
  status: "confirmed" | "blocked";
  note?: string;
}

export interface RewardOffer {
  id: string;
  title: string;
  description: string;
  pointsRequired: number;
  eligibleTiers: string[];
  vehicleTypes?: VehicleType[];
}

export interface Promotion {
  id: string;
  name: string;
  description: string;
  applicableTiers: string[];
  applicableVehicleModels: string[];
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface AuditLog {
  id: string;
  actor: string;
  actionType: string;
  entityType: string;
  entityId: string;
  timestamp: string;
  details: string;
}

export interface LoyaltyCustomer {
  id: string;
  phone: string;
  licensePlates: string[];
  tierId: string;
  pointsBalance: number;
  vehicles: Vehicle[];
  pointHistory: PointTransaction[];
  bookingHistory: Booking[];
  fullName?: string;
  username?: string;
  email?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LoyaltyStore {
  customers: LoyaltyCustomer[];
  tiers: LoyaltyTier[];
  rewardOffers: RewardOffer[];
  promotions: Promotion[];
  auditLogs: AuditLog[];
  lastTierEvaluationDate?: string;
}

export const TIERS: Record<LoyaltyTierId, LoyaltyTier> = {
  member: {
    id: "member",
    name: "Member",
    bookingWindowDays: 7,
    pointRate: 1,
    perks: ["basic early access", "standard wash add-on"],
    description:
      "Standard loyalty level with a 7-day booking window and baseline points earning.",
    isActive: true,
    createdAt: "2026-08-10T00:00:00.000Z",
    updatedAt: "2026-08-10T00:00:00.000Z",
  },
  silver: {
    id: "silver",
    name: "Silver",
    bookingWindowDays: 10,
    pointRate: 1.25,
    perks: ["silver priority booking", "express rinse"],
    description:
      "Silver members receive a 10-day booking window and faster wash options.",
    isActive: true,
    createdAt: "2026-08-10T00:00:00.000Z",
    updatedAt: "2026-08-10T00:00:00.000Z",
  },
  gold: {
    id: "gold",
    name: "Gold",
    bookingWindowDays: 12,
    pointRate: 1.5,
    perks: ["gold priority booking", "free premium wax"],
    description:
      "Gold tier increases your booking window and unlocks premium treatment perks.",
    isActive: true,
    createdAt: "2026-08-10T00:00:00.000Z",
    updatedAt: "2026-08-10T00:00:00.000Z",
  },
  platinum: {
    id: "platinum",
    name: "Platinum",
    bookingWindowDays: 14,
    pointRate: 2,
    perks: [
      "platinum priority booking",
      "free premium wax",
      "exclusive service bundle",
    ],
    description:
      "Platinum tier gives the longest window and the most generous perks.",
    isActive: true,
    createdAt: "2026-08-10T00:00:00.000Z",
    updatedAt: "2026-08-10T00:00:00.000Z",
  },
};

export const DEFAULT_PROMOTIONS: Promotion[] = [
  {
    id: "promo-membership-1",
    name: "Silver+ Welcome Bonus",
    description:
      "Silver tier and above receive 10% off a premium wash when booking within their loyalty window.",
    applicableTiers: ["silver", "gold", "platinum"],
    applicableVehicleModels: [],
    startDate: "2026-08-01",
    endDate: "2026-12-31",
    isActive: true,
  },
  {
    id: "promo-gold-ride",
    name: "Motorcycle Express Treat",
    description:
      "Gold and Platinum motorcycle riders receive a free express enhancement with a premium service.",
    applicableTiers: ["gold", "platinum"],
    applicableVehicleModels: [],
    startDate: "2026-08-01",
    endDate: "2026-12-31",
    isActive: true,
  },
];

export const DEFAULT_REWARD_OFFERS: RewardOffer[] = [
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
  {
    id: "reward-3",
    title: "10% discount on premium wash",
    description:
      "Redeem 150 points for a 10% discount on a premium wash package.",
    pointsRequired: 150,
    eligibleTiers: ["member", "silver", "gold", "platinum"],
  },
  {
    id: "reward-4",
    title: "Motorcycle express treatment",
    description: "Redeem 120 points for a motorcycle express service boost.",
    pointsRequired: 120,
    eligibleTiers: ["member", "silver", "gold", "platinum"],
    vehicleTypes: ["motorcycle"],
  },
];
