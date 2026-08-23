import type { Vehicle } from "./vehicle.model";
import type { PointTransaction } from "./point.model";
import type { Booking } from "./booking.model";
import type { ClaimedPromo } from "./promo.model";

export type PriorityStatus = "normal" | "LOW_PRIORITIED";

export interface LoyaltyCustomer {
  id: string;
  phone: string;
  licensePlates: string[];
  tierId: string;
  tierName?: string;
  pointsBalance: number; // Redeemable points for claiming rewards & promos
  collectedPoints?: number; // Lifetime collected points (used for user tier calculation)
  vehicles: Vehicle[];
  pointHistory: PointTransaction[];
  bookingHistory: Booking[];
  claimedPromos?: ClaimedPromo[];
  lateCancellationWarningCount?: number;
  priorityStatus?: PriorityStatus;
  status?: "Active" | "Inactive" | "Low Priority";
  fullName?: string;
  username?: string;
  password?: string;
  email?: string;
  createdAt: string;
  updatedAt: string;
}

export type Customer = LoyaltyCustomer;
