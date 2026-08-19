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

export interface PointTransaction {
  id: string;
  type: "earn" | "spend" | "expire";
  amount: number;
  date: string;
  description: string;
}

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

export type ServiceCategory =
  | "Exterior Wash"
  | "Interior Detailing"
  | "Full Package"
  | "Add-on";

export interface ServiceItem {
  id: string;
  name: string;
  category: ServiceCategory;
  description: string;
  durationMinutes: number;
  price: number;
  popularityCount?: number;
  status: "ACTIVE" | "INACTIVE";
  isActive?: boolean;
  features: string[];
  label?: string;
}

export type PromotionCategory =
  | "discount"
  | "points_bonus"
  | "new_member"
  | "tier_reward"
  | "service_addon";

export type PromotionStatus = "ACTIVE" | "INACTIVE" | "EXPIRED";
export type ClaimedPromoStatus = "ACTIVE" | "USED" | "EXPIRED";

export interface Promotion {
  id: string;
  name: string;
  title?: string;
  description: string;
  category?: PromotionCategory;
  discountPercentage?: number;
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
}

export interface RewardOffer {
  id: string;
  title: string;
  description: string;
  pointsRequired: number;
  eligibleTiers: string[];
  vehicleTypes?: VehicleType[];
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

export type PriorityStatus = "normal" | "LOW_PRIORITIED";

export interface LoyaltyCustomer {
  id: string;
  phone: string;
  licensePlates: string[];
  tierId: string;
  tierName?: string;
  pointsBalance: number;
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

export interface DashboardMetrics {
  totalRevenueToday: string | number;
  activeBookings: number;
  availableSlots: number;
  bayOccupancy: string;
  bayOccupancyRate?: number;
}

export interface WeeklyBookingStat {
  day: string;
  count: number;
  revenue?: number;
}

export interface BayStatus {
  bay: string;
  bayId?: string;
  name?: string;
  type: string;
  status: "active" | "maintenance" | "occupied";
  eta: string;
  currentBookingId?: string;
}

export interface RecentActivity {
  id?: string;
  name: string;
  phone: string;
  vehicle: string;
  service: string;
  time: string;
  status: "Completed" | "In Progress" | "Cancelled" | "Confirmed";
  timestamp?: string;
}

export interface AdminDashboardData {
  metrics: DashboardMetrics;
  weeklyBookings: WeeklyBookingStat[];
  bayStatus: BayStatus[];
  recentActivity: RecentActivity[];
}

export interface LoyaltyStore {
  customers: LoyaltyCustomer[];
  tiers: LoyaltyTier[];
  tierSets?: TierSet[];
  services?: ServiceItem[];
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
