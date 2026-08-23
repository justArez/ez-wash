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

export interface AuditLog {
  id: string;
  actor: string;
  actionType: string;
  entityType: string;
  entityId: string;
  timestamp: string;
  details: string;
}
