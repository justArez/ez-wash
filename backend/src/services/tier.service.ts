import type { LoyaltyTier } from "../models/tier.model";
import { TIERS } from "../models/tier.model";
import { db, schema } from "../db/index";
import { sql, eq } from "drizzle-orm";

export function shouldRunMonthlyEvaluation(
  lastEvaluationDate?: string,
  today?: string,
): boolean {
  const now = new Date(
    (today ?? new Date().toISOString().split("T")[0]) + "T00:00:00Z",
  );
  if (!lastEvaluationDate) {
    return true;
  }
  const last = new Date(lastEvaluationDate + "T00:00:00Z");
  return (
    now.getUTCFullYear() !== last.getUTCFullYear() ||
    now.getUTCMonth() !== last.getUTCMonth()
  );
}

export function getTier(tierId: string): LoyaltyTier {
  return TIERS[tierId] ?? TIERS.member;
}

export async function fetchAllTiers(): Promise<LoyaltyTier[]> {
  if (!db) {
    throw new Error("Database connection is not available.");
  }

  const rows = await db.select().from(schema.loyaltyTiers);
  if (rows.length === 0) {
    return Object.values(TIERS);
  }

  return rows.map((r) => ({
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

export async function createTierItem(
  data: Partial<LoyaltyTier>,
): Promise<LoyaltyTier> {
  if (!db) {
    throw new Error("Database connection is not available.");
  }

  const now = new Date().toISOString();
  const tier: LoyaltyTier = {
    id:
      data.id?.trim() ||
      `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
    name: data.name?.trim() || "New Tier",
    level: data.level,
    bookingWindowDays: data.bookingWindowDays ?? 7,
    pointRate: data.pointRate ?? 1,
    multiplier: data.multiplier,
    discount: data.discount,
    perks: data.perks ?? [],
    description: data.description?.trim() || "",
    isActive: data.isActive ?? true,
    createdAt: now,
    updatedAt: now,
  };

  await db
    .insert(schema.loyaltyTiers)
    .values({
      id: tier.id,
      name: tier.name,
      level: tier.level,
      pointThreshold: data.pointThreshold || 0,
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

  return tier;
}

export async function updateTierItem(
  tierId: string,
  data: Partial<LoyaltyTier>,
): Promise<LoyaltyTier | null> {
  if (!db) {
    throw new Error("Database connection is not available.");
  }

  const rows = await db
    .select()
    .from(schema.loyaltyTiers)
    .where(eq(schema.loyaltyTiers.id, tierId))
    .limit(1);
  if (rows.length === 0) return null;
  const existing = rows[0];

  const updated = {
    name: data.name ?? existing.name,
    level: data.level ?? existing.level,
    bookingWindowDays: data.bookingWindowDays ?? existing.bookingWindowDays,
    pointRate: data.pointRate ?? existing.pointRate,
    multiplier: data.multiplier ?? existing.multiplier,
    discount: data.discount ?? existing.discount,
    perks: data.perks ?? existing.perks,
    description: data.description ?? existing.description,
    isActive: data.isActive ?? existing.isActive,
  };

  await db
    .update(schema.loyaltyTiers)
    .set({ ...updated, updatedAt: new Date() })
    .where(eq(schema.loyaltyTiers.id, tierId));

  return {
    id: tierId,
    name: updated.name,
    level: (updated.level as any) || undefined,
    bookingWindowDays: updated.bookingWindowDays,
    pointRate: updated.pointRate,
    multiplier: updated.multiplier || undefined,
    discount: updated.discount || undefined,
    perks: updated.perks || [],
    description: updated.description,
    isActive: updated.isActive,
    createdAt: existing.createdAt.toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export async function deleteTierItem(tierId: string): Promise<boolean> {
  if (!db) {
    throw new Error("Database connection is not available.");
  }

  const result = await db
    .delete(schema.loyaltyTiers)
    .where(eq(schema.loyaltyTiers.id, tierId))
    .returning({ id: schema.loyaltyTiers.id });

  return result.length > 0;
}

export function getAllowedBookingWindowDays(tierId: string) {
  return getTier(tierId).bookingWindowDays;
}

export function getNextBookingWindowDate(date: string, tierId: string) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + getAllowedBookingWindowDays(tierId));
  return nextDate.toISOString().split("T")[0];
}

export function getAppliedPerks(tierId: string) {
  return getTier(tierId).perks;
}

export async function evaluateCustomerTiers(
  today?: string,
): Promise<{ customerId: string; tierId: string }[]> {
  if (!db) {
    throw new Error("Database connection is not available.");
  }

  const evaluationDate = today ?? new Date().toISOString().split("T")[0];
  const now = new Date(evaluationDate + "T00:00:00Z");

  const customers = await db.select().from(schema.loyaltyCustomers);
  const results: { customerId: string; tierId: string }[] = [];

  for (const customer of customers) {
    const visitRows = await db
      .select({ id: schema.bookings.id })
      .from(schema.bookings)
      .where(
        sql`${schema.bookings.customerId} = ${customer.id} AND (${schema.bookings.status} = 'confirmed' OR ${schema.bookings.status} = 'completed')`,
      );
    const visits = visitRows.length;
    const points = customer.collectedPoints ?? customer.pointsBalance;

    let newTierId = "member";
    if (points >= 500 || visits >= 12) {
      newTierId = "platinum";
    } else if (points >= 300 || visits >= 8) {
      newTierId = "gold";
    } else if (points >= 150 || visits >= 4) {
      newTierId = "silver";
    }

    if (newTierId !== customer.tierId) {
      await db
        .update(schema.loyaltyCustomers)
        .set({ tierId: newTierId, updatedAt: now })
        .where(eq(schema.loyaltyCustomers.id, customer.id));
    }

    results.push({ customerId: customer.id, tierId: newTierId });
  }

  return results;
}
