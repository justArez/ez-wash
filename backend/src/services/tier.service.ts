import type { LoyaltyStore, LoyaltyTier } from "../models/loyalty.model";
import { TIERS } from "../models/loyalty.model";
import { db, schema } from "../db/index";
import { sql } from "drizzle-orm";

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

export async function fetchAllTiers(
  store?: LoyaltyStore,
): Promise<LoyaltyTier[]> {
  let tiers: LoyaltyTier[] = [];
  if (db) {
    try {
      const rows = await db.select().from(schema.loyaltyTiers);
      if (rows && rows.length > 0) {
        tiers = rows.map((r) => ({
          id: r.id,
          name: r.name,
          level: (r.level as any) || undefined,
          pointThreshold: r.pointThreshold,
          bookingWindowDays: r.bookingWindowDays,
          pointRate: r.pointRate,
          multiplier: r.multiplier || undefined,
          discount: r.discount || undefined,
          perks: r.perks || [],
          description: r.description,
          isActive: r.isActive,
          createdAt: r.createdAt.toISOString(),
          updatedAt: r.updatedAt.toISOString(),
        }));
      }
    } catch (err) {
      console.warn("Could not load tiers from Postgres DB:", err);
    }
  }

  if (tiers.length === 0) {
    tiers = getAllTiers(store);
  }

  return tiers;
}

export async function createTierItem(
  store: LoyaltyStore,
  data: Partial<LoyaltyTier>,
): Promise<LoyaltyTier> {
  const tier = createTier(store, data);

  if (db) {
    try {
      await db
        .insert(schema.loyaltyTiers)
        .values({
          id: tier.id,
          name: tier.name,
          level: tier.level,
          pointThreshold: tier.pointThreshold || 0,
          bookingWindowDays: tier.bookingWindowDays || 7,
          pointRate: tier.pointRate || 1.0,
          multiplier: tier.multiplier,
          discount: tier.discount,
          perks: tier.perks || [],
          description: tier.description || "",
          isActive: tier.isActive !== false,
        })
        .onConflictDoUpdate({
          target: schema.loyaltyTiers.id,
          set: {
            name: tier.name,
            level: tier.level,
            pointThreshold: tier.pointThreshold || 0,
            bookingWindowDays: tier.bookingWindowDays || 7,
            pointRate: tier.pointRate || 1.0,
            multiplier: tier.multiplier,
            discount: tier.discount,
            perks: tier.perks || [],
            description: tier.description || "",
            isActive: tier.isActive !== false,
            updatedAt: new Date(),
          },
        });
    } catch (err) {
      console.warn("Could not persist tier to Postgres DB:", err);
    }
  }

  return tier;
}

export async function updateTierItem(
  store: LoyaltyStore,
  tierId: string,
  data: Partial<LoyaltyTier>,
): Promise<LoyaltyTier | null> {
  const tier = updateTier(store, tierId, data);
  if (!tier) return null;

  if (db) {
    try {
      await db
        .update(schema.loyaltyTiers)
        .set({
          name: tier.name,
          level: tier.level,
          pointThreshold: tier.pointThreshold || 0,
          bookingWindowDays: tier.bookingWindowDays || 7,
          pointRate: tier.pointRate || 1.0,
          multiplier: tier.multiplier,
          discount: tier.discount,
          perks: tier.perks || [],
          description: tier.description || "",
          isActive: tier.isActive !== false,
          updatedAt: new Date(),
        })
        .where(sql`${schema.loyaltyTiers.id} = ${tierId}`);
    } catch (err) {
      console.warn("Could not update tier in Postgres DB:", err);
    }
  }

  return tier;
}

export async function deleteTierItem(
  store: LoyaltyStore,
  tierId: string,
): Promise<boolean> {
  const success = deleteTier(store, tierId);
  if (!success) return false;

  if (db) {
    try {
      await db
        .delete(schema.loyaltyTiers)
        .where(sql`${schema.loyaltyTiers.id} = ${tierId}`);
    } catch (err) {
      console.warn("Could not delete tier from Postgres DB:", err);
    }
  }

  return true;
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
    // User tier is evaluated using collectedPoints (lifetime collected points)
    const points = customer.collectedPoints ?? customer.pointsBalance;
    const visits = customer.bookingHistory.filter(
      (booking) =>
        booking.status === "confirmed" || booking.status === "completed",
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
