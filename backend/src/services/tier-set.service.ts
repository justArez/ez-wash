import type { LoyaltyStore, TierSet } from "../models/loyalty.model";
import { TIERS } from "../models/loyalty.model";

export const DEFAULT_TIER_SETS: TierSet[] = [
  {
    id: "default-tier-set",
    name: "Standard Loyalty Tier Set",
    status: "Active",
    description: "Default loyalty tier progression configuration with 4 tiers",
    tiers: [
      {
        id: "tier-member",
        name: "Member",
        level: "MEMBER",
        pointThreshold: 0,
        bookingWindowDays: 7,
        pointRate: 1.0,
        multiplier: "1.0x",
        discount: "0%",
        perks: ["basic early access", "standard wash add-on"],
        description:
          "Standard loyalty level with a 7-day booking window and baseline points earning.",
        isActive: true,
        createdAt: "2026-08-01T00:00:00.000Z",
        updatedAt: "2026-08-01T00:00:00.000Z",
      },
      {
        id: "tier-silver",
        name: "Silver",
        level: "SILVER",
        pointThreshold: 500,
        bookingWindowDays: 10,
        pointRate: 1.25,
        multiplier: "1.25x",
        discount: "5%",
        perks: ["silver priority booking", "express rinse"],
        description:
          "Silver members receive a 10-day booking window and faster wash options.",
        isActive: true,
        createdAt: "2026-08-01T00:00:00.000Z",
        updatedAt: "2026-08-01T00:00:00.000Z",
      },
      {
        id: "tier-gold",
        name: "Gold",
        level: "GOLD",
        pointThreshold: 1500,
        bookingWindowDays: 12,
        pointRate: 1.5,
        multiplier: "1.5x",
        discount: "10%",
        perks: ["gold priority booking", "free premium wax"],
        description:
          "Gold tier increases your booking window and unlocks premium treatment perks.",
        isActive: true,
        createdAt: "2026-08-01T00:00:00.000Z",
        updatedAt: "2026-08-01T00:00:00.000Z",
      },
      {
        id: "tier-platinum",
        name: "Platinum",
        level: "PLATINUM",
        pointThreshold: 3000,
        bookingWindowDays: 14,
        pointRate: 2.0,
        multiplier: "2.0x",
        discount: "15%",
        perks: [
          "platinum priority booking",
          "free premium wax",
          "exclusive service bundle",
        ],
        description:
          "Platinum tier gives the longest window and the most generous perks.",
        isActive: true,
        createdAt: "2026-08-01T00:00:00.000Z",
        updatedAt: "2026-08-01T00:00:00.000Z",
      },
    ],
  },
];

export function ensureTierSets(store: LoyaltyStore): TierSet[] {
  if (!store.tierSets) {
    store.tierSets = [...DEFAULT_TIER_SETS];
  }
  return store.tierSets;
}

export function getAllTierSets(store: LoyaltyStore): TierSet[] {
  return ensureTierSets(store);
}

export function getTierSetById(
  store: LoyaltyStore,
  id: string,
): TierSet | undefined {
  const sets = ensureTierSets(store);
  return sets.find((s) => s.id === id);
}

export function getActiveTierSet(store: LoyaltyStore): TierSet {
  const sets = ensureTierSets(store);
  return sets.find((s) => s.status === "Active") || sets[0];
}

export function createTierSet(
  store: LoyaltyStore,
  data: Partial<TierSet>,
): TierSet {
  const sets = ensureTierSets(store);
  const now = new Date().toISOString();
  const newSet: TierSet = {
    id:
      data.id?.trim() ||
      `tier-set-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    name: data.name?.trim() || "New Tier Set",
    status: data.status || "Inactive",
    description: data.description?.trim() || "",
    tiers: data.tiers || [],
    createdAt: now,
    updatedAt: now,
  };

  // If newly created is active, deactivate others
  if (newSet.status === "Active") {
    sets.forEach((s) => (s.status = "Inactive"));
  }

  sets.push(newSet);
  return newSet;
}

export function updateTierSet(
  store: LoyaltyStore,
  id: string,
  data: Partial<TierSet>,
): TierSet | null {
  const sets = ensureTierSets(store);
  const target = sets.find((s) => s.id === id);
  if (!target) return null;

  if (data.name !== undefined) target.name = data.name;
  if (data.description !== undefined) target.description = data.description;
  if (data.tiers !== undefined) target.tiers = data.tiers;
  if (data.status !== undefined) {
    target.status = data.status;
    if (data.status === "Active") {
      sets.forEach((s) => {
        if (s.id !== id) s.status = "Inactive";
      });
    }
  }

  target.updatedAt = new Date().toISOString();
  return target;
}

export function deleteTierSet(store: LoyaltyStore, id: string): boolean {
  const sets = ensureTierSets(store);
  const index = sets.findIndex((s) => s.id === id);
  if (index === -1) return false;
  sets.splice(index, 1);
  return true;
}
