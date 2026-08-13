export type VehicleType = "car" | "motorcycle";

export interface Vehicle {
  plate: string;
  model: string;
  type: VehicleType;
}

export interface LoyaltyTier {
  id: string;
  name: string;
  bookingWindowDays: number;
  pointRate: number;
  perks: string[];
  description: string;
}

export interface RewardOffer {
  id: string;
  title: string;
  description: string;
  pointsRequired: number;
  eligibleTiers: string[];
  vehicleTypes?: VehicleType[];
}

export interface ServiceOption {
  id: string;
  label: string;
  price: number;
}

export type AvailableSlot = string;

export interface BookingRequest {
  phone: string;
  vehiclePlate: string;
  requestedDate: string;
}

export interface LinkAccountRequest {
  phone: string;
  plate: string;
  model: string;
  type: VehicleType;
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
  tier: LoyaltyTier;
  pointsBalance: number;
  vehicles: Vehicle[];
  loyaltyTier: LoyaltyTier;
  nextEligibleBookingDate: string;
  appliedPerks: string[];
  lateCancellationWarningCount: number;
  priorityStatus: "normal" | "LOW_PRIORITIED";
  rewardSuggestions: RewardOffer[];
  bookingHistory: Array<{
    id: string;
    vehiclePlate: string;
    vehicleModel?: string;
    service?: string;
    date: string;
    time?: string;
    points?: number;
    status: string;
    cancelledAt?: string;
    isLateCancellation?: boolean;
    appliedPerks: string[];
    note?: string;
  }>;
  pointHistory: Array<{
    id: string;
    type: string;
    amount: number;
    date: string;
    description: string;
  }>;
}
