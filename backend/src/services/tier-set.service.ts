import type { TierSet } from "../models/tier.model";
import { db, schema } from "../db/index";
import { sql } from "drizzle-orm";

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
