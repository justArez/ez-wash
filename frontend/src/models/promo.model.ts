import type { LoyaltyTierLevel } from "./tier.model";

export const TIER_RANK: Record<string, number> = {
  member: 0,
  Member: 0,
  MEMBER: 0,
  silver: 1,
  Silver: 1,
  SILVER: 1,
  gold: 2,
  Gold: 2,
  GOLD: 2,
  platinum: 3,
  Platinum: 3,
  PLATINUM: 3,
};

export type ClaimedPromoStatus = "ACTIVE" | "USED" | "EXPIRED";

export type PromotionType =
  | "bonus_points"
  | "booking_discount"
  | "service_discount"
  | "day_of_week_discount"
  | "dedicated_day_discount"
  | "tier_reward"
  | "new_member";

export interface GlobalPromotion {
  id: string;
  title: string;
  description: string;
  promoType?: PromotionType;
  discountPercentage?: number;
  discountAmount?: number;
  bonusPoints?: number;
  applicableServiceIds?: string[];
  applicableDaysOfWeek?: number[]; // 0=Sun, 1=Mon, ..., 6=Sat
  dedicatedDate?: string;
  badgeLabel?: string;
  isInfiniteUse?: boolean;
  isInifiteUse?: boolean;
  validUntil: string;
  isActive: boolean;
}

export interface ClaimablePromo {
  id: string;
  title: string;
  description: string;
  promoType?: PromotionType;
  discountPercentage?: number;
  discountAmount?: number;
  bonusPoints?: number;
  applicableServiceIds?: string[];
  applicableDaysOfWeek?: number[];
  dedicatedDate?: string;
  pointPrice: number;
  requiredTier: LoyaltyTierLevel;
  tierGroup:
    | "SILVER TIER & ABOVE"
    | "GOLD TIER & ABOVE"
    | "PLATINUM TIER"
    | "MEMBER TIER";
  perkType: string;
  validityDays?: number;
}

export interface ClaimedPromo {
  id: string;
  promoId: string;
  title: string;
  description?: string;
  claimedAt: string;
  validUntil: string;
  status: ClaimedPromoStatus;
  perkIdentifier: string;
  promoType?: PromotionType;
  discountPercentage?: number;
  discountAmount?: number;
  bonusPoints?: number;
  applicableServiceIds?: string[];
}

export type PromoButtonState =
  | { type: "CLAIMABLE"; pointPrice: number }
  | { type: "LACKS_TIER"; requiredTier: LoyaltyTierLevel }
  | { type: "INSUFFICIENT_PTS"; pointPrice: number; deficit: number }
  | { type: "ALREADY_CLAIMED" }
  | { type: "UNAUTHENTICATED" };

import type { VehicleType } from "./vehicle.model";
import type { AdminTier } from "./tier.model";

export type AdminPromotionTier = AdminTier | "GENERAL";
export type AdminPromotionStatus = "ACTIVE" | "INACTIVE" | "EXPIRED";
export type PromotionStatus = AdminPromotionStatus;
export type PromotionCategory =
  | "discount"
  | "points_bonus"
  | "new_member"
  | "tier_reward"
  | "service_addon";

export interface Promotion {
  id: string;
  name: string;
  title?: string;
  promoName?: string;
  description: string;
  category?: PromotionCategory;
  promoType?: PromotionType;
  discountPercentage?: number;
  discountAmount?: number;
  bonusPoints?: number;
  applicableServiceIds?: string[];
  applicableDaysOfWeek?: number[];
  dedicatedDate?: string;
  pointPrice?: number | string;
  loyaltyPointsRequired?: number;
  loyaltyPointsValue?: number;
  applicableTiers?: string[];
  tierRequired?: AdminPromotionTier;
  applicableVehicleModels?: string[];
  requiredTier?: LoyaltyTierLevel | string;
  tierGroup?: string;
  perkType?: string;
  badgeLabel?: string;
  bannerImage?: string;
  terms?: string;
  isInfiniteUse?: boolean;
  isInifiteUse?: boolean;
  validityDays?: number;
  startDate?: string;
  endDate?: string;
  validUntil?: string;
  validRange?: string;
  status?: PromotionStatus;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AdminPromotion {
  id: string;
  promoName: string;
  description: string;
  tierRequired: AdminPromotionTier;
  pointPrice: number | string;
  status: AdminPromotionStatus;
  validRange: string;
}

export interface RewardOffer {
  id: string;
  title: string;
  description: string;
  pointsRequired: number;
  eligibleTiers: string[];
  vehicleTypes?: VehicleType[];
}
