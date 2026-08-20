import type { LoyaltyCustomer, RewardOffer } from "../models/loyalty.model";
import { db, schema } from "../db/index";
import { sql } from "drizzle-orm";

export async function fetchAllRewards(): Promise<RewardOffer[]> {
  if (!db) {
    throw new Error("Database connection is not available.");
  }

  const rows = await db.select().from(schema.rewardOffers);
  return rows.map((r) => ({
    id: r.id,
    title: r.title,
    description: r.description,
    pointsRequired: r.pointsRequired,
    eligibleTiers: r.eligibleTiers || [],
    vehicleTypes: (r.vehicleTypes as any) || undefined,
  }));
}

export async function createRewardOffer(
  body: Partial<RewardOffer>,
): Promise<RewardOffer> {
  if (!db) {
    throw new Error("Database connection is not available.");
  }

  const newOffer: RewardOffer = {
    id: body.id?.trim() || `reward-${Date.now()}`,
    title: body.title?.trim() || "New Reward Offer",
    description: body.description?.trim() || "",
    pointsRequired: body.pointsRequired ?? 100,
    eligibleTiers: body.eligibleTiers || ["silver", "gold", "platinum"],
    vehicleTypes: body.vehicleTypes,
  };

  await db
    .insert(schema.rewardOffers)
    .values({
      id: newOffer.id,
      title: newOffer.title,
      description: newOffer.description,
      pointsRequired: newOffer.pointsRequired,
      eligibleTiers: newOffer.eligibleTiers,
      vehicleTypes: newOffer.vehicleTypes,
    })
    .onConflictDoUpdate({
      target: schema.rewardOffers.id,
      set: {
        title: newOffer.title,
        description: newOffer.description,
        pointsRequired: newOffer.pointsRequired,
        eligibleTiers: newOffer.eligibleTiers,
        vehicleTypes: newOffer.vehicleTypes,
        updatedAt: new Date(),
      },
    });

  return newOffer;
}

export async function deleteRewardOffer(id: string): Promise<boolean> {
  if (!db) {
    throw new Error("Database connection is not available.");
  }

  const result = await db
    .delete(schema.rewardOffers)
    .where(sql`${schema.rewardOffers.id} = ${id}`)
    .returning({ id: schema.rewardOffers.id });

  return result.length > 0;
}

export function suggestRewards(
  customer: LoyaltyCustomer,
  rewardOffers: RewardOffer[],
): RewardOffer[] {
  const eligibleOffers = rewardOffers.filter((offer) =>
    offer.eligibleTiers.includes(customer.tierId),
  );

  return eligibleOffers
    .filter((offer) => {
      if (!offer.vehicleTypes || offer.vehicleTypes.length === 0) {
        return true;
      }
      return customer.vehicles.some((vehicle) =>
        offer.vehicleTypes?.includes(vehicle.type),
      );
    })
    .sort((a, b) => a.pointsRequired - b.pointsRequired)
    .filter(
      (offer, index, arr) =>
        index === arr.findIndex((item) => item.id === offer.id),
    );
}
