import type { LoyaltyTierLevel } from "./tier.model";
import type { VehicleType } from "./vehicle.model";

export type PromotionCategory =
  | "discount"
  | "points_bonus"
  | "new_member"
  | "tier_reward"
  | "service_addon";

export type PromotionType =
  | "bonus_points" // Adds bonus points upon booking completion
  | "booking_discount" // Adds percentage or fixed discount to total of booking
  | "service_discount" // Adds discount to specific selected services
  | "day_of_week_discount" // Adds discount on specific days of week (e.g. Wednesday wash)
  | "dedicated_day_discount" // Adds discount on a dedicated calendar date / special holiday
  | "tier_reward"
  | "new_member";

export type PromotionStatus = "ACTIVE" | "INACTIVE" | "EXPIRED";
export type ClaimedPromoStatus = "ACTIVE" | "USED" | "EXPIRED";

export interface Promotion {
  id: string;
  name: string;
  title?: string;
  promoName?: string;
  description: string;
  category?: PromotionCategory;
  promoType?: PromotionType;
  bonusPoints?: number;
  discountPercentage?: number;
  discountAmount?: number;
  applicableServiceIds?: string[];
  applicableDaysOfWeek?: number[]; // 0=Sunday, 1=Monday, ..., 6=Saturday
  dedicatedDate?: string; // YYYY-MM-DD
  pointPrice?: number | string;
  loyaltyPointsRequired?: number;
  loyaltyPointsValue?: number;
  applicableTiers: string[];
  applicableVehicleModels: string[];
  requiredTier?: LoyaltyTierLevel | string;
  tierGroup?: string;
  perkType?: string;
  badgeLabel?: string;
  bannerImage?: string;
  terms?: string;
  isInfiniteUse?: boolean;
  isInifiteUse?: boolean;
  validityDays?: number;
  startDate: string;
  endDate: string;
  validUntil?: string;
  validRange?: string;
  status?: PromotionStatus;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ClaimedPromo {
  id: string;
  promoId: string;
  customerId?: string;
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

export interface RewardOffer {
  id: string;
  title: string;
  description: string;
  pointsRequired: number;
  eligibleTiers: string[];
  vehicleTypes?: VehicleType[];
}
