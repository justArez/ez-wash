import type { Vehicle, VehicleType } from "./vehicle.model";
import type { LoyaltyTier } from "./tier.model";
import type { PointTransaction } from "./point.model";
import type { Booking } from "./booking.model";
import type { RewardOffer, ClaimedPromo } from "./promo.model";

export type PriorityStatus = "normal" | "LOW_PRIORITIED";

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  mostActiveVehicle: string;
  points: number;
  collectedPoints?: number;
  status: "Active" | "Inactive" | "Low Priority";
  tier: "Platinum" | "Gold" | "Silver" | "Member";
}

export interface LoyaltyCustomer {
  id: string;
  phone: string;
  licensePlates: string[];
  tierId: string;
  tierName?: string;
  pointsBalance: number;
  collectedPoints?: number;
  vehicles: Vehicle[];
  pointHistory: PointTransaction[];
  bookingHistory: Booking[];
  lateCancellationWarningCount?: number;
  priorityStatus?: PriorityStatus;
  status?: "Active" | "Inactive" | "Low Priority";
  fullName?: string;
  username?: string;
  email?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type Customer = LoyaltyCustomer;

export interface LoginCredentials {
  username: string;
  password?: string;
}

export interface LinkAccountRequest {
  phone?: string;
  plate?: string;
  model?: string;
  type?: VehicleType;
  username?: string;
  password?: string;
  email?: string;
  fullName?: string;
}

export interface LinkAccountResponse {
  customerId: string;
  phone: string;
  tier: LoyaltyTier;
  pointsBalance: number;
  vehicles: Vehicle[];
  fullName?: string;
  username?: string;
  email?: string;
}

export interface DashboardResponse {
  customerId: string;
  phone: string;
  username?: string;
  fullName?: string;
  email?: string;
  tier: LoyaltyTier;
  pointsBalance: number;
  collectedPoints?: number;
  vehicles: Vehicle[];
  nextEligibleBookingDate: string;
  appliedPerks: string[];
  lateCancellationWarningCount: number;
  priorityStatus: "normal" | "LOW_PRIORITIED";
  rewardSuggestions: RewardOffer[];
  claimedPromos?: ClaimedPromo[];
  bookingHistory: Booking[];
  pointHistory: Array<{
    id: string;
    type: string;
    amount: number;
    date: string;
    description: string;
  }>;
}
