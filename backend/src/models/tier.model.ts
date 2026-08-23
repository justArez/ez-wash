export type LoyaltyTierLevel =
  | "MEMBER"
  | "SILVER"
  | "GOLD"
  | "PLATINUM"
  | "member"
  | "silver"
  | "gold"
  | "platinum";

export type LoyaltyTierId = string;

export interface LoyaltyTier {
  id: string;
  name: string;
  level?: LoyaltyTierLevel;
  pointThreshold?: number;
  bookingWindowDays: number;
  pointRate: number;
  multiplier?: string;
  discount?: string;
  perks: string[];
  description: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TierSet {
  id: string;
  name: string;
  status: "Active" | "Inactive";
  description: string;
  tiers: LoyaltyTier[];
  createdAt?: string;
  updatedAt?: string;
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
