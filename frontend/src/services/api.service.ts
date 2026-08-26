/**
 * API Service - Handles all API communication for the homepage
 * Feature: 004-homepage-shadcn-redesign
 *
 * Provides utilities for:
 * - Fetch with timeout and error handling
 * - Exponential backoff retry logic
 * - Response caching
 */

import type {
  PromotionsResponse,
  TimeSlotsResponse,
  Promotion,
  TimeSlot,
} from "../types/homepage.types";

/**
 * API Configuration
 */
const API_CONFIG = {
  BASE_URL: "/api",
  TIMEOUT: 5000, // 5 seconds
  MAX_RETRIES: 3,
  RETRY_DELAYS: [1000, 2000, 4000], // 1s, 2s, 4s exponential backoff
  CACHE_DURATION: {
    PROMOTIONS: 10 * 60 * 1000, // 10 minutes
    SLOTS: 5 * 60 * 1000, // 5 minutes
  },
};

/**
 * Cache storage for API responses
 */
interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const cache = new Map<string, CacheEntry<unknown>>();

/**
 * Fetch with timeout
 */
async function fetchWithTimeout(
  url: string,
  options?: RequestInit,
  timeout = API_CONFIG.TIMEOUT,
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === "AbortError") {
      throw new Error(`Request timeout after ${timeout}ms`, { cause: error });
    }
    throw error;
  }
}

/**
 * Retry logic with exponential backoff
 */
async function fetchWithRetry<T>(
  url: string,
  options?: RequestInit,
  maxRetries = API_CONFIG.MAX_RETRIES,
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetchWithTimeout(url, options);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      // Don't retry on the last attempt
      if (attempt < maxRetries) {
        const delayMs = API_CONFIG.RETRY_DELAYS[attempt];
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }

  throw lastError || new Error("Unknown error during fetch");
}

/**
 * Get cached data if available and not expired
 */
function getCachedData<T>(cacheKey: string): T | null {
  const entry = cache.get(cacheKey) as CacheEntry<T> | undefined;
  if (!entry) return null;

  // Determine cache duration based on key
  const cacheDuration = cacheKey.includes("promotions")
    ? API_CONFIG.CACHE_DURATION.PROMOTIONS
    : API_CONFIG.CACHE_DURATION.SLOTS;

  const isExpired = Date.now() - entry.timestamp > cacheDuration;
  if (isExpired) {
    cache.delete(cacheKey);
    return null;
  }

  return entry.data;
}

/**
 * Set cache entry
 */
function setCachedData<T>(cacheKey: string, data: T): void {
  cache.set(cacheKey, {
    data,
    timestamp: Date.now(),
  });
}

/**
 * Clear a specific cache entry
 */
export function clearCache(cacheKey: string): void {
  cache.delete(cacheKey);
}

/**
 * Clear all cache
 */
export function clearAllCache(): void {
  cache.clear();
}

/**
 * Fetch active promotions from API
 */
export async function fetchPromotions(): Promise<Promotion[]> {
  const cacheKey = "promotions";
  const cached = getCachedData<Promotion[]>(cacheKey);

  if (cached) {
    return cached;
  }

  try {
    const url = `${API_CONFIG.BASE_URL}/promotions`;
    const response = await fetchWithRetry<PromotionsResponse>(
      url,
      undefined,
      0,
    );

    if (response.status === "success" && response.data) {
      const mappedPromos: Promotion[] = response.data.map((p: any) => ({
        id: p.id,
        name: p.name || p.title || "Special Promotion",
        title: p.title || p.name,
        promoName: p.promoName || p.name,
        description: p.description || "",
        discountPercentage: p.discountPercentage ?? 0,
        discountAmount: p.discountAmount ?? 0,
        bonusPoints: p.bonusPoints ?? 0,
        loyaltyPointsRequired:
          p.loyaltyPointsRequired ??
          (typeof p.pointPrice === "number"
            ? p.pointPrice
            : Number(p.pointPrice) || 0),
        loyaltyPointsValue: p.loyaltyPointsValue ?? (p.bonusPoints || 100),
        pointPrice:
          typeof p.pointPrice === "number"
            ? p.pointPrice
            : Number(p.pointPrice) || (p.loyaltyPointsRequired ?? 0),
        requiredTier: p.requiredTier,
        applicableTiers: p.applicableTiers || [],
        tierGroup: p.tierGroup,
        perkType: p.perkType,
        badgeLabel: p.badgeLabel,
        expiryDate: p.expiryDate || p.validUntil || p.endDate || "2026-12-31",
        category: p.category || "discount",
        terms: p.terms || "Standard loyalty terms and conditions apply.",
        isActive: p.isActive !== false,
        createdAt: p.createdAt || new Date().toISOString(),
        updatedAt: p.updatedAt || new Date().toISOString(),
      }));

      setCachedData(cacheKey, mappedPromos);
      return mappedPromos;
    }

    throw new Error(response.message || "Failed to fetch promotions");
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unknown error fetching promotions";
    console.warn(
      "[API] Promotions endpoint unavailable; using local mock data:",
      message,
    );
    throw new Error(message, { cause: error });
  }
}

/**
 * Fetch available time slots for next N days
 */
export async function fetchSlots(days: number = 7): Promise<TimeSlot[]> {
  const cacheKey = `slots_${days}`;
  const cached = getCachedData<TimeSlot[]>(cacheKey);

  if (cached) {
    return cached;
  }

  try {
    const url = `${API_CONFIG.BASE_URL}/slots?days=${days}`;
    const response = await fetchWithRetry<TimeSlotsResponse>(url, undefined, 0);

    if (response.status === "success" && response.data) {
      setCachedData(cacheKey, response.data);
      return response.data;
    }

    throw new Error(response.message || "Failed to fetch slots");
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error fetching slots";
    console.error("[API] Slots endpoint unavailable:", message);
    throw new Error(message, { cause: error });
  }
}

/**
 * Create a booking for a time slot (authenticated endpoint)
 */
export async function createBooking(
  slotId: string,
  userId: string,
): Promise<{ success: boolean; bookingId: string }> {
  try {
    const url = `${API_CONFIG.BASE_URL}/bookings`;
    const response = await fetchWithRetry<any>(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        slotId,
        userId,
      }),
    });

    if (response.status === "success") {
      clearCache(`slots_7`); // Invalidate slots cache after booking
      return {
        success: true,
        bookingId: response.data?.id || "",
      };
    }

    throw new Error(response.message || "Failed to create booking");
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error creating booking";
    console.error("[API Error] Booking:", message);
    throw new Error(`Failed to create booking: ${message}`, { cause: error });
  }
}

/**
 * Refresh slots cache immediately
 */
export async function refreshSlotsCache(days: number = 7): Promise<TimeSlot[]> {
  clearCache(`slots_${days}`);
  return fetchSlots(days);
}

/**
 * Refresh promotions cache immediately
 */
export async function refreshPromotionsCache(): Promise<Promotion[]> {
  clearCache("promotions");
  return fetchPromotions();
}
