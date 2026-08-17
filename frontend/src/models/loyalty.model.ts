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

export type AdminTier = "PLATINUM" | "GOLD" | "SILVER" | "MEMBER";

export type AdminBookingStatus =
  | "PENDING"
  | "CONFIRMED"
  | "COMPLETED"
  | "CANCELLED";

export interface AdminBooking {
  id: string;
  customer: string;
  phone: string;
  tier: AdminTier;
  vehicle: string;
  timeSlot: string;
  services: string;
  status: AdminBookingStatus;
}

export type AdminPromotionTier = AdminTier | "GENERAL";

export type AdminPromotionStatus = "ACTIVE" | "INACTIVE" | "EXPIRED";

export interface AdminPromotion {
  id: string;
  promoName: string;
  description: string;
  tierRequired: AdminPromotionTier;
  pointPrice: number | string;
  status: AdminPromotionStatus;
  validRange: string;
}

export type AdminServiceCategory =
  | "Exterior Wash"
  | "Interior Detailing"
  | "Full Package"
  | "Add-on";

export interface AdminService {
  id: string;
  name: string;
  category: AdminServiceCategory;
  description: string;
  durationMinutes: number;
  price: number;
  popularityCount: number;
  status: "ACTIVE" | "INACTIVE";
  features: string[];
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

export interface AdminTierSet {
  id: string;
  name: string;
  status: "Active" | "Inactive";
  description: string;
  tiers: AdminTierDefinition[];
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  mostActiveVehicle: string;
  points: number;
  status: "Active" | "Inactive" | "Low Priority";
  tier: "Platinum" | "Gold" | "Silver" | "Member";
}

export interface AdminDashboardMetrics {
  totalRevenueToday: string;
  activeBookings: number;
  availableSlots: number;
  bayOccupancy: string;
}

export interface AdminWeeklyBooking {
  day: string;
  count: number;
}

export interface AdminBayStatus {
  bay: string;
  type: string;
  status: "active" | "maintenance";
  eta: string;
}

export interface AdminRecentActivity {
  name: string;
  phone: string;
  vehicle: string;
  service: string;
  time: string;
  status: "Completed" | "In Progress" | "Cancelled";
}

export interface AdminDashboardData {
  metrics: AdminDashboardMetrics;
  weeklyBookings: AdminWeeklyBooking[];
  bayStatus: AdminBayStatus[];
  recentActivity: AdminRecentActivity[];
}

export * from "./promo.model";

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
