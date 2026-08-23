export type VehicleType = "car" | "motorcycle" | "suv" | "van";

export interface Vehicle {
  plate: string;
  model: string;
  type: VehicleType;
  lastWashDate?: string;
}

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

export interface AdminTierDefinition {
  id: string;
  level: string;
  pointThreshold: number;
  multiplier: string;
  discount: string;
  description: string;
  perks: string[];
}

export type AdminTier = "PLATINUM" | "GOLD" | "SILVER" | "MEMBER";

export type AdminBookingStatus =
  | "PENDING"
  | "CONFIRMED"
  | "COMPLETED"
  | "CANCELLED";

export type BookingStatus =
  | "confirmed"
  | "blocked"
  | "cancelled"
  | "completed"
  | "pending"
  | "CONFIRMED"
  | "PENDING"
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

export interface Booking {
  id: string;
  customerId: string;
  customerName?: string;
  customerPhone?: string;
  customerTier?: string;
  vehiclePlate: string;
  vehicleModel?: string;
  vehicleType?: VehicleType;
  serviceId?: string;
  serviceName?: string;
  service?: string;
  date: string;
  time?: string;
  timeSlot?: string;
  durationMinutes?: number;
  bayId?: string;
  createdAt: string;
  updatedAt?: string;
  appliedPerks: string[];
  appliedPromoId?: string;
  points?: number;
  pointsEarned?: number;
  pointsSpent?: number;
  status: BookingStatus;
  cancelledAt?: string;
  isLateCancellation?: boolean;
  note?: string;
}

export type SlotStatus =
  | "available"
  | "booked"
  | "maintenance"
  | "unavailable"
  | "peak";

export interface TimeSlot {
  id: string;
  date: string;
  time: string;
  displayTime?: string;
  duration: number;
  status: SlotStatus;
  capacity: number;
  currentBookings: number;
  dayOfWeek?: string;
  dayDisplayDate?: string;
  bayId?: string;
}

export interface TimeSlotWithComputedFields extends TimeSlot {
  isAvailable: boolean;
  isPast: boolean;
  slotLabel: string;
  timeLabel: string;
}

export type ServiceOption = {
  id: string;
  label: string;
  price: number;
};

export type AdminServiceCategory =
  | "Exterior Wash"
  | "Interior Detailing"
  | "Full Package"
  | "Add-on";

export type ServiceCategory = AdminServiceCategory;

export interface ServiceItem {
  id: string;
  name: string;
  category: ServiceCategory;
  description: string;
  durationMinutes: number;
  price: number;
  popularityCount: number;
  status: "ACTIVE" | "INACTIVE";
  isActive?: boolean;
  features: string[];
  label?: string;
}

export type AdminService = ServiceItem;

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
  discountPercentage?: number;
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

export interface PointTransaction {
  id: string;
  type: "earn" | "spend" | "expire";
  amount: number;
  date: string;
  description: string;
}

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

export type PriorityStatus = "normal" | "LOW_PRIORITIED";

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

export interface DashboardMetrics {
  totalRevenueToday: string;
  activeBookings: number;
  availableSlots: number;
  bayOccupancy: string;
  bayOccupancyRate?: number;
}

export type AdminDashboardMetrics = DashboardMetrics;

export interface AdminWeeklyBooking {
  day: string;
  count: number;
  revenue?: number;
}

export type WeeklyBookingStat = AdminWeeklyBooking;

export interface AdminBayStatus {
  bay: string;
  bayId?: string;
  name?: string;
  type: string;
  status: "active" | "maintenance";
  eta: string;
  currentBookingId?: string;
}

export type BayStatus = AdminBayStatus;

export interface AdminRecentActivity {
  id?: string;
  name: string;
  phone: string;
  vehicle: string;
  service: string;
  time: string;
  status: "Completed" | "In Progress" | "Cancelled";
  timestamp?: string;
}

export type RecentActivity = AdminRecentActivity;

export interface AdminDashboardData {
  metrics: DashboardMetrics;
  weeklyBookings: WeeklyBookingStat[];
  bayStatus: BayStatus[];
  recentActivity: RecentActivity[];
}

export interface ScheduleBlock {
  id: string;
  type: "maintenance" | "day_off" | "holiday" | "custom_block";
  title: string;
  reason?: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  startTime?: string; // HH:MM
  endTime?: string; // HH:MM
  bayId?: string; // 'all', '1', '2', '3', '4'
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
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

export * from "./promo.model";

export type AvailableSlot = string;

export interface BookingRequest {
  phone: string;
  vehiclePlate: string;
  requestedDate: string;
  serviceId?: string;
  time?: string;
  appliedPromoId?: string;
}

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
