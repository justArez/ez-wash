import type {
  AdminBooking,
  AdminDashboardData,
  AdminUser,
  AuditLog,
  Booking,
  DashboardMetrics,
  LoyaltyCustomer,
  Promotion,
  ScheduleBlock,
  ServiceItem,
  TierSet,
} from "../models/loyalty.model";
import { getAdminToken } from "./admin-auth.service";

const BASE_URL = "/api/admin";

function getHeaders(token?: string): HeadersInit {
  const adminToken = token || getAdminToken();
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${adminToken}`,
    "x-admin-token": adminToken,
  };
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(errorData.error || `Admin API error (${res.status})`);
  }
  return res.json() as Promise<T>;
}

// -------------------------------------------------------------
// 1. DASHBOARD & METRICS
// -------------------------------------------------------------
export async function fetchAdminDashboardData(): Promise<AdminDashboardData> {
  const res = await fetch(`${BASE_URL}/dashboard/data`, {
    headers: getHeaders(),
  });
  const data = await handleResponse<{
    status: string;
    data: AdminDashboardData;
  }>(res);
  return data.data;
}

export async function fetchAdminMetrics(): Promise<DashboardMetrics> {
  const res = await fetch(`${BASE_URL}/dashboard/metrics`, {
    headers: getHeaders(),
  });
  const data = await handleResponse<{ status: string; data: DashboardMetrics }>(
    res,
  );
  return data.data;
}

// -------------------------------------------------------------
// 2. BOOKINGS
// -------------------------------------------------------------
export async function fetchAdminBookings(options?: {
  query?: string;
  status?: string;
  date?: string;
  serviceId?: string;
}): Promise<AdminBooking[]> {
  const params = new URLSearchParams();
  if (options?.query) params.append("query", options.query);
  if (options?.status && options.status !== "All" && options.status !== "ALL") {
    params.append("status", options.status);
  }
  if (options?.date) params.append("date", options.date);
  if (options?.serviceId) params.append("serviceId", options.serviceId);

  const url = `${BASE_URL}/bookings${params.toString() ? `?${params.toString()}` : ""}`;
  const res = await fetch(url, { headers: getHeaders() });
  const json = await handleResponse<{
    status: string;
    count: number;
    data: any[];
  }>(res);

  // Map backend booking entity to AdminBooking view shape if needed
  return json.data.map((b) => ({
    id: b.id,
    customer:
      b.customerName || `Customer (${b.customerPhone || b.phone || ""})`,
    phone: b.customerPhone || b.phone || "",
    tier: (b.customerTier?.toUpperCase() || "MEMBER") as AdminBooking["tier"],
    vehicle: `${b.vehiclePlate || ""} • ${b.vehicleModel || ""}`.trim(),
    timeSlot: b.timeSlot || b.time || b.date || "Scheduled",
    services: b.serviceName || b.service || "Standard Wash",
    status: (b.status?.toUpperCase() || "PENDING") as AdminBooking["status"],
  }));
}

export async function createAdminBooking(data: {
  phone: string;
  vehiclePlate: string;
  vehicleModel?: string;
  date: string;
  timeSlot?: string;
  serviceId?: string;
  serviceName?: string;
  note?: string;
}): Promise<Booking> {
  const res = await fetch(`${BASE_URL}/bookings`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  const json = await handleResponse<{ status: string; data: Booking }>(res);
  return json.data;
}

export async function updateAdminBooking(
  id: string,
  data: Partial<Booking>,
): Promise<Booking> {
  const res = await fetch(`${BASE_URL}/bookings/${id}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  const json = await handleResponse<{ status: string; data: Booking }>(res);
  return json.data;
}

export async function deleteAdminBooking(id: string): Promise<boolean> {
  const res = await fetch(`${BASE_URL}/bookings/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  const json = await handleResponse<{ status: string; deleted: boolean }>(res);
  return json.deleted;
}

// -------------------------------------------------------------
// 3. SERVICES
// -------------------------------------------------------------
export async function fetchAdminServices(): Promise<ServiceItem[]> {
  const res = await fetch(`${BASE_URL}/services`, { headers: getHeaders() });
  const json = await handleResponse<{
    status: string;
    count: number;
    data: ServiceItem[];
  }>(res);
  return json.data;
}

export async function createAdminService(
  data: Partial<ServiceItem>,
): Promise<ServiceItem> {
  const res = await fetch(`${BASE_URL}/services`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  const json = await handleResponse<{ status: string; data: ServiceItem }>(res);
  return json.data;
}

export async function updateAdminService(
  id: string,
  data: Partial<ServiceItem>,
): Promise<ServiceItem> {
  const res = await fetch(`${BASE_URL}/services/${id}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  const json = await handleResponse<{ status: string; data: ServiceItem }>(res);
  return json.data;
}

export async function deleteAdminService(id: string): Promise<boolean> {
  const res = await fetch(`${BASE_URL}/services/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  const json = await handleResponse<{ status: string; deleted: boolean }>(res);
  return json.deleted;
}

// -------------------------------------------------------------
// 4. PROMOTIONS
// -------------------------------------------------------------
export async function fetchAdminPromotions(): Promise<Promotion[]> {
  const res = await fetch(`${BASE_URL}/promotions`, { headers: getHeaders() });
  const json = await handleResponse<{
    status: string;
    count: number;
    data: Promotion[];
  }>(res);
  return json.data;
}

export async function createAdminPromotion(
  data: Partial<Promotion>,
): Promise<Promotion> {
  const res = await fetch(`${BASE_URL}/promotions`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  const json = await handleResponse<{ status: string; data: Promotion }>(res);
  return json.data;
}

export async function updateAdminPromotion(
  id: string,
  data: Partial<Promotion>,
): Promise<Promotion> {
  const res = await fetch(`${BASE_URL}/promotions/${id}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  const json = await handleResponse<{ status: string; data: Promotion }>(res);
  return json.data;
}

export async function deleteAdminPromotion(id: string): Promise<boolean> {
  const res = await fetch(`${BASE_URL}/promotions/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  const json = await handleResponse<{ status: string; deleted: boolean }>(res);
  return json.deleted;
}

// -------------------------------------------------------------
// 5. TIER SETS & TIERS
// -------------------------------------------------------------
export async function fetchAdminTierSets(): Promise<TierSet[]> {
  const res = await fetch(`${BASE_URL}/tier-sets`, { headers: getHeaders() });
  const json = await handleResponse<{
    status: string;
    count: number;
    data: TierSet[];
  }>(res);
  return json.data;
}

export async function createAdminTierSet(
  data: Partial<TierSet>,
): Promise<TierSet> {
  const res = await fetch(`${BASE_URL}/tier-sets`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  const json = await handleResponse<{ status: string; data: TierSet }>(res);
  return json.data;
}

export async function updateAdminTierSet(
  id: string,
  data: Partial<TierSet>,
): Promise<TierSet> {
  const res = await fetch(`${BASE_URL}/tier-sets/${id}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  const json = await handleResponse<{ status: string; data: TierSet }>(res);
  return json.data;
}

export async function deleteAdminTierSet(id: string): Promise<boolean> {
  const res = await fetch(`${BASE_URL}/tier-sets/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  const json = await handleResponse<{ status: string; deleted: boolean }>(res);
  return json.deleted;
}

// -------------------------------------------------------------
// 6. USERS / CUSTOMERS
// -------------------------------------------------------------
export async function fetchAdminUsers(options?: {
  query?: string;
  tier?: string;
  status?: string;
}): Promise<AdminUser[]> {
  const params = new URLSearchParams();
  if (options?.query) params.append("query", options.query);
  if (options?.tier && options.tier !== "ALL" && options.tier !== "All") {
    params.append("tier", options.tier);
  }
  if (options?.status && options.status !== "ALL" && options.status !== "All") {
    params.append("status", options.status);
  }

  const url = `${BASE_URL}/users${params.toString() ? `?${params.toString()}` : ""}`;
  const res = await fetch(url, { headers: getHeaders() });
  const json = await handleResponse<{
    status: string;
    count: number;
    data: AdminUser[];
  }>(res);
  return json.data;
}

export async function createAdminUser(data: {
  phone: string;
  fullName?: string;
  email?: string;
  tierId?: string;
  pointsBalance?: number;
  initialVehicle?: {
    plate: string;
    model: string;
    type: "car" | "motorcycle" | "suv" | "van";
  };
}): Promise<LoyaltyCustomer> {
  const res = await fetch(`${BASE_URL}/users`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  const json = await handleResponse<{ status: string; data: LoyaltyCustomer }>(
    res,
  );
  return json.data;
}

export async function updateAdminUser(
  id: string,
  data: Partial<LoyaltyCustomer>,
): Promise<LoyaltyCustomer> {
  const res = await fetch(`${BASE_URL}/users/${id}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  const json = await handleResponse<{ status: string; data: LoyaltyCustomer }>(
    res,
  );
  return json.data;
}

export async function adjustAdminUserPoints(
  id: string,
  delta: number,
  reason?: string,
): Promise<{ customer: LoyaltyCustomer; points: number }> {
  const res = await fetch(`${BASE_URL}/users/${id}/adjust-points`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ delta, reason }),
  });
  const json = await handleResponse<{ status: string; data: LoyaltyCustomer }>(
    res,
  );
  return { customer: json.data, points: json.data.pointsBalance };
}

export async function resetAdminUserWarnings(
  id: string,
): Promise<LoyaltyCustomer> {
  const res = await fetch(`${BASE_URL}/users/${id}/reset-warnings`, {
    method: "POST",
    headers: getHeaders(),
  });
  const json = await handleResponse<{ status: string; data: LoyaltyCustomer }>(
    res,
  );
  return json.data;
}

// -------------------------------------------------------------
// 7. AUDIT LOGS
// -------------------------------------------------------------
export async function fetchAuditLogs(): Promise<AuditLog[]> {
  const res = await fetch(`${BASE_URL}/audit-logs`, { headers: getHeaders() });
  const json = await handleResponse<{
    status: string;
    count: number;
    data: AuditLog[];
  }>(res);
  return json.data;
}

// -------------------------------------------------------------
// 8. SCHEDULE & SLOT BLOCKS (Maintenance & Days Off)
// -------------------------------------------------------------
export async function fetchScheduleBlocks(options?: {
  date?: string;
  type?: string;
  bayId?: string;
}): Promise<ScheduleBlock[]> {
  const params = new URLSearchParams();
  if (options?.date) params.append("date", options.date);
  if (options?.type && options.type !== "ALL" && options.type !== "All") {
    params.append("type", options.type);
  }
  if (options?.bayId && options.bayId !== "ALL" && options.bayId !== "All") {
    params.append("bayId", options.bayId);
  }

  const url = `${BASE_URL}/schedule-blocks${params.toString() ? `?${params.toString()}` : ""}`;
  const res = await fetch(url, { headers: getHeaders() });
  const json = await handleResponse<{
    status: string;
    count: number;
    data: ScheduleBlock[];
  }>(res);
  return json.data;
}

export async function createScheduleBlock(data: {
  type: "maintenance" | "day_off" | "holiday" | "custom_block";
  title: string;
  reason?: string;
  startDate: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  bayId?: string;
}): Promise<ScheduleBlock> {
  const res = await fetch(`${BASE_URL}/schedule-blocks`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  const json = await handleResponse<{
    status: string;
    data: ScheduleBlock;
  }>(res);
  return json.data;
}

export async function updateScheduleBlock(
  id: string,
  data: Partial<Omit<ScheduleBlock, "id" | "createdAt" | "updatedAt">>,
): Promise<ScheduleBlock> {
  const res = await fetch(`${BASE_URL}/schedule-blocks/${id}`, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  const json = await handleResponse<{
    status: string;
    data: ScheduleBlock;
  }>(res);
  return json.data;
}

export async function deleteScheduleBlock(id: string): Promise<boolean> {
  const res = await fetch(`${BASE_URL}/schedule-blocks/${id}`, {
    method: "DELETE",
    headers: getHeaders(),
  });
  const json = await handleResponse<{
    status: string;
    deleted: boolean;
  }>(res);
  return json.deleted;
}
