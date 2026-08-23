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
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminTierDefinition {
  id: string;
  level: string;
  pointThreshold: number;
  multiplier: string;
  discount: string;
  description: string;
  perks: string[];
}

export interface TierSet {
  id: string;
  name: string;
  status: "Active" | "Inactive";
  description: string;
  tiers: AdminTierDefinition[];
  createdAt?: string;
  updatedAt?: string;
}

export type AdminTierSet = TierSet;

export type AdminTier = "PLATINUM" | "GOLD" | "SILVER" | "MEMBER";
