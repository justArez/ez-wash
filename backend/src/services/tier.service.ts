import type { LoyaltyStore, LoyaltyTier } from "../models/loyalty.model";
import { TIERS } from "../models/loyalty.model";

function createId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function shouldRunMonthlyEvaluation(
  store: LoyaltyStore,
  today?: string,
) {
  const now = new Date(
    (today ?? new Date().toISOString().split("T")[0]) + "T00:00:00Z",
  );
  if (!store.lastTierEvaluationDate) {
    return true;
  }
  const last = new Date(store.lastTierEvaluationDate + "T00:00:00Z");
  return (
    now.getUTCFullYear() !== last.getUTCFullYear() ||
    now.getUTCMonth() !== last.getUTCMonth()
  );
}

export function getTier(tierId: string, store?: LoyaltyStore) {
  if (store?.tiers?.length) {
    const tier = store.tiers.find(
      (item) => item.id === tierId && item.isActive,
    );
    if (tier) {
      return tier;
    }
  }
  return TIERS[tierId] ?? TIERS.member;
}

export function getAllTiers(store?: LoyaltyStore) {
  return store?.tiers?.length ? store.tiers : Object.values(TIERS);
}

export function getAllowedBookingWindowDays(
  tierId: string,
  store?: LoyaltyStore,
) {
  return getTier(tierId, store).bookingWindowDays;
}

export function getNextBookingWindowDate(
  date: string,
  tierId: string,
  store?: LoyaltyStore,
) {
  const nextDate = new Date(date);
  nextDate.setDate(
    nextDate.getDate() + getAllowedBookingWindowDays(tierId, store),
  );
  return nextDate.toISOString().split("T")[0];
}

export function getAppliedPerks(tierId: string, store?: LoyaltyStore) {
  return getTier(tierId, store).perks;
}

export function createTier(store: LoyaltyStore, data: Partial<LoyaltyTier>) {
  const now = new Date().toISOString();
  const tier: LoyaltyTier = {
    id:
      data.id?.trim() ||
      `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
    name: data.name?.trim() || "New Tier",
    bookingWindowDays: data.bookingWindowDays ?? 7,
    pointRate: data.pointRate ?? 1,
    perks: data.perks ?? [],
    description: data.description?.trim() || "",
    isActive: data.isActive ?? true,
    createdAt: now,
    updatedAt: now,
  };
  store.tiers.push(tier);
  return tier;
}

export function updateTier(
  store: LoyaltyStore,
  tierId: string,
  data: Partial<LoyaltyTier>,
) {
  const tier = store.tiers.find((item) => item.id === tierId);
  if (!tier) {
    return null;
  }
  if (data.name !== undefined) tier.name = data.name;
  if (data.bookingWindowDays !== undefined)
    tier.bookingWindowDays = data.bookingWindowDays;
  if (data.pointRate !== undefined) tier.pointRate = data.pointRate;
  if (data.perks !== undefined) tier.perks = data.perks;
  if (data.description !== undefined) tier.description = data.description;
  if (data.isActive !== undefined) tier.isActive = data.isActive;
  tier.updatedAt = new Date().toISOString();
  return tier;
}

export function deleteTier(store: LoyaltyStore, tierId: string) {
  const index = store.tiers.findIndex((item) => item.id === tierId);
  if (index === -1) {
    return false;
  }
  store.tiers.splice(index, 1);
  return true;
}

export function evaluateCustomerTiers(store: LoyaltyStore, today?: string) {
  const evaluationDate = today ?? new Date().toISOString().split("T")[0];
  const now = new Date(evaluationDate + "T00:00:00Z").toISOString();

  for (const customer of store.customers) {
    const points = customer.pointsBalance;
    const visits = customer.bookingHistory.filter(
      (booking) => booking.status === "confirmed",
    ).length;
    let newTierId = "member";

    if (points >= 500 || visits >= 12) {
      newTierId = "platinum";
    } else if (points >= 300 || visits >= 8) {
      newTierId = "gold";
    } else if (points >= 150 || visits >= 4) {
      newTierId = "silver";
    }

    if (newTierId !== customer.tierId) {
      customer.tierId = newTierId;
      customer.updatedAt = now;
    }
  }

  store.lastTierEvaluationDate = evaluationDate;

  return store.customers.map((customer) => ({
    customerId: customer.id,
    tierId: customer.tierId,
  }));
}
