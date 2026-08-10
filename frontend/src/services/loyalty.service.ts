import type {
  BookingRequest,
  DashboardResponse,
  LinkAccountRequest,
  LinkAccountResponse,
  RewardOffer,
} from "../models/loyalty.model";

const BASE_URL = "http://localhost:3000";

async function handleJsonResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const error = await response.text();
    throw new Error(error || `Request failed with status ${response.status}`);
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

export async function fetchLoyaltyDashboard(
  phone: string,
): Promise<DashboardResponse> {
  const response = await fetch(
    `${BASE_URL}/api/loyalty/dashboard?phone=${encodeURIComponent(phone)}`,
  );
  return handleJsonResponse<DashboardResponse>(response);
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

export async function fetchRewardSuggestions(
  phone: string,
): Promise<RewardOffer[]> {
  const response = await fetch(
    `${BASE_URL}/api/rewards/suggestions?phone=${encodeURIComponent(phone)}`,
  );
  return handleJsonResponse<RewardOffer[]>(response);
}
