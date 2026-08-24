import type { VehicleType } from "./vehicle.model";

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
  depositImageUrl?: string;
  depositSubmittedAt?: string;
}
