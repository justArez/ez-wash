import type {
  BookingRequest,
  ClaimedPromo,
  DashboardResponse,
  LinkAccountRequest,
  LinkAccountResponse,
  Promotion,
  RewardOffer,
  ServiceItem,
  TimeSlot,
} from "../models/loyalty.model";
import { DEMO_PHONE, initialClaimedPromos } from "./loyalty.mock-data";

const BASE_URL = "";

async function handleJsonResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const rawError = await response.text();
    let message = rawError;
    try {
      const parsed = JSON.parse(rawError);
      if (parsed && typeof parsed === "object" && parsed.error) {
        message = parsed.error;
      }
    } catch {
      // keep rawError
    }
    throw new Error(message || `Request failed with status ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export async function linkLoyaltyAccount(
  request: LinkAccountRequest,
): Promise<LinkAccountResponse> {
  const response = await fetch(`${BASE_URL}/api/loyalty/link`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
  return handleJsonResponse<LinkAccountResponse>(response);
}

export async function checkUsernameAvailability(
  username: string,
): Promise<{ exists: boolean; available: boolean; username: string }> {
  const response = await fetch(
    `${BASE_URL}/api/loyalty/check-username?username=${encodeURIComponent(username.trim())}`,
  );
  return handleJsonResponse<{
    exists: boolean;
    available: boolean;
    username: string;
  }>(response);
}

export async function loginCustomer(
  username: string,
  password?: string,
): Promise<DashboardResponse> {
  return fetchLoyaltyDashboard(username, password);
}

export async function fetchLoyaltyDashboard(
  phoneOrUsername: string,
  password?: string,
): Promise<DashboardResponse> {
  const url = `${BASE_URL}/api/loyalty/dashboard?phone=${encodeURIComponent(phoneOrUsername)}${password ? `&password=${encodeURIComponent(password)}` : ""}`;
  const response = await fetch(url);
  return handleJsonResponse<DashboardResponse>(response);
}

export async function fetchCustomerLookup(phone: string) {
  const response = await fetch(
    `${BASE_URL}/api/loyalty/customer?phone=${encodeURIComponent(phone)}`,
  );
  return handleJsonResponse<{
    id: string;
    phone: string;
    fullName?: string;
    email?: string;
    tier: any;
    tierId: string;
    pointsBalance: number;
    vehicles: any[];
    priorityStatus?: string;
  }>(response);
}

export async function fetchClaimedPromos(
  phone: string,
): Promise<ClaimedPromo[]> {
  try {
    const response = await fetch(
      `${BASE_URL}/api/loyalty/claimed-promos?phone=${encodeURIComponent(phone)}`,
    );
    const data = await handleJsonResponse<{
      status: string;
      count: number;
      data: ClaimedPromo[];
    }>(response);
    return data.data;
  } catch (error) {
    if (phone === DEMO_PHONE || phone.trim().toLowerCase() === "demo") {
      return initialClaimedPromos.filter((p) => p.status === "ACTIVE");
    }
    return [];
  }
}

export async function claimPromo(
  promotionId: string,
  phone: string,
): Promise<{
  success: boolean;
  claimedPromo: ClaimedPromo;
  pointsBalance: number;
  message?: string;
}> {
  const response = await fetch(
    `${BASE_URL}/api/promotions/${encodeURIComponent(promotionId)}/claim`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone }),
    },
  );
  return handleJsonResponse<{
    status: string;
    message: string;
    claimedPromo: ClaimedPromo;
    pointsBalance: number;
    success: boolean;
  }>(response);
}

export async function fetchPublicServices(
  onlyActive = true,
): Promise<ServiceItem[]> {
  const response = await fetch(
    `${BASE_URL}/api/services?onlyActive=${onlyActive}`,
  );
  const data = await handleJsonResponse<{
    status: string;
    count: number;
    data: ServiceItem[];
  }>(response);
  return data.data;
}

export async function fetchPublicPromotions(
  category?: string,
  tier?: string,
): Promise<Promotion[]> {
  const params = new URLSearchParams();
  if (category) params.append("category", category);
  if (tier) params.append("tier", tier);
  const query = params.toString() ? `?${params.toString()}` : "";
  const response = await fetch(`${BASE_URL}/api/promotions${query}`);
  const data = await handleJsonResponse<{
    status: string;
    count: number;
    data: Promotion[];
  }>(response);
  return data.data;
}

export async function fetchPublicSlots(days = 7): Promise<TimeSlot[]> {
  const response = await fetch(`${BASE_URL}/api/slots?days=${days}`);
  const data = await handleJsonResponse<{
    status: string;
    count: number;
    data: TimeSlot[];
  }>(response);
  return data.data;
}

export async function createBooking(request: BookingRequest) {
  const response = await fetch(`${BASE_URL}/api/bookings`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
  return handleJsonResponse<{
    success: boolean;
    booking?: unknown;
    reason?: string;
    nextEligibleBookingDate?: string;
  }>(response);
}

export async function fetchCustomerBookings(phone: string) {
  const response = await fetch(
    `${BASE_URL}/api/bookings/my-bookings?phone=${encodeURIComponent(phone)}`,
  );
  return handleJsonResponse<{
    status: string;
    totalCount: number;
    activeCount: number;
    activeBookings: any[];
    bookingHistory: any[];
  }>(response);
}

export async function fetchUserBookings(identifier: string) {
  const response = await fetch(
    `${BASE_URL}/api/bookings/user?phone=${encodeURIComponent(identifier)}`,
  );
  return handleJsonResponse<{
    status: string;
    totalCount: number;
    activeCount: number;
    activeBookings: any[];
    bookingHistory: any[];
  }>(response);
}

export async function cancelBooking(bookingId: string, phone: string) {
  const response = await fetch(
    `${BASE_URL}/api/bookings/${encodeURIComponent(bookingId)}/cancel`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone }),
    },
  );
  return handleJsonResponse<{
    success: boolean;
    booking: { id: string; status: string; isLateCancellation?: boolean };
    warningCount: number;
    priorityStatus: "normal" | "LOW_PRIORITIED";
    isLateCancellation: boolean;
  }>(response);
}

export async function fetchRewardSuggestions(
  phone: string,
): Promise<RewardOffer[]> {
  const response = await fetch(
    `${BASE_URL}/api/rewards/suggestions?phone=${encodeURIComponent(phone)}`,
  );
  return handleJsonResponse<RewardOffer[]>(response);
}
