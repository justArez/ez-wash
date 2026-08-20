import type { TierSet } from "../models/loyalty.model";
import { db, schema } from "../db/index";
import { sql } from "drizzle-orm";

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

async function loadTierSetWithTiers(
  row: typeof schema.tierSets.$inferSelect,
): Promise<TierSet> {
  const tierRows = await db!
    .select()
    .from(schema.loyaltyTiers)
    .where(sql`${schema.loyaltyTiers.tierSetId} = ${row.id}`);

  return {
    id: row.id,
    name: row.name,
    status: row.status as any,
    description: row.description || "",
    tiers: tierRows.map((t) => ({
      id: t.id,
      name: t.name,
      level: t.level as any,
      pointThreshold: t.pointThreshold,
      bookingWindowDays: t.bookingWindowDays,
      pointRate: t.pointRate,
      multiplier: t.multiplier || undefined,
      discount: t.discount || undefined,
      perks: t.perks || [],
      description: t.description,
      isActive: t.isActive,
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
    })),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function fetchAllTierSets(): Promise<TierSet[]> {
  if (!db) {
    throw new Error("Database connection is not available.");
  }

  const rows = await db.select().from(schema.tierSets);
  return Promise.all(rows.map((r) => loadTierSetWithTiers(r)));
}

export async function fetchTierSetById(
  id: string,
): Promise<TierSet | undefined> {
  if (!db) {
    throw new Error("Database connection is not available.");
  }

  const rows = await db
    .select()
    .from(schema.tierSets)
    .where(sql`${schema.tierSets.id} = ${id}`)
    .limit(1);

  if (!rows || rows.length === 0) {
    return undefined;
  }

  return loadTierSetWithTiers(rows[0]);
}

export async function createTierSetItem(
  data: Partial<TierSet>,
): Promise<TierSet> {
  if (!db) {
    throw new Error("Database connection is not available.");
  }

  const id =
    data.id?.trim() ||
    `tier-set-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
  const name = data.name?.trim() || "New Tier Set";
  const status = data.status || "Inactive";
  const description = data.description?.trim() || "";

  if (status === "Active") {
    await db
      .update(schema.tierSets)
      .set({ status: "Inactive", updatedAt: new Date() });
  }

  await db
    .insert(schema.tierSets)
    .values({ id, name, status, description })
    .onConflictDoUpdate({
      target: schema.tierSets.id,
      set: { name, status, description, updatedAt: new Date() },
    });

  return (await fetchTierSetById(id))!;
}

export async function updateTierSetItem(
  id: string,
  data: Partial<TierSet>,
): Promise<TierSet | null> {
  if (!db) {
    throw new Error("Database connection is not available.");
  }

  const existing = await fetchTierSetById(id);
  if (!existing) return null;

  if (data.status === "Active") {
    await db
      .update(schema.tierSets)
      .set({ status: "Inactive", updatedAt: new Date() })
      .where(sql`${schema.tierSets.id} != ${id}`);
  }

  await db
    .update(schema.tierSets)
    .set({
      name: data.name ?? existing.name,
      status: data.status ?? existing.status,
      description: data.description ?? existing.description,
      updatedAt: new Date(),
    })
    .where(sql`${schema.tierSets.id} = ${id}`);

  return fetchTierSetById(id) as Promise<TierSet>;
}

export async function deleteTierSetItem(id: string): Promise<boolean> {
  if (!db) {
    throw new Error("Database connection is not available.");
  }

  const result = await db
    .delete(schema.tierSets)
    .where(sql`${schema.tierSets.id} = ${id}`)
    .returning({ id: schema.tierSets.id });

  return result.length > 0;
}

export async function getActiveTierSet(): Promise<TierSet | undefined> {
  if (!db) {
    throw new Error("Database connection is not available.");
  }

  const rows = await db
    .select()
    .from(schema.tierSets)
    .where(sql`${schema.tierSets.status} = 'Active'`)
    .limit(1);

  if (!rows || rows.length === 0) return undefined;
  return loadTierSetWithTiers(rows[0]);
}
