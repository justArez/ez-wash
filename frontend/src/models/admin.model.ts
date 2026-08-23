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

export interface AuditLog {
  id: string;
  actor: string;
  actionType: string;
  entityType: string;
  entityId: string;
  timestamp: string;
  details: string;
}
