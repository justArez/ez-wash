import type {
  LoyaltyCustomer,
  LoyaltyStore,
  RewardOffer,
} from "../models/loyalty.model";
import { db, schema } from "../db/index";
import { sql } from "drizzle-orm";

export async function fetchAllRewards(
  store: LoyaltyStore,
): Promise<RewardOffer[]> {
  let offers: RewardOffer[] = [];
  if (db) {
    try {
      const rows = await db.select().from(schema.rewardOffers);
      if (rows && rows.length > 0) {
        offers = rows.map((r) => ({
          id: r.id,
          title: r.title,
          description: r.description,
          pointsRequired: r.pointsRequired,
          eligibleTiers: r.eligibleTiers || [],
          vehicleTypes: (r.vehicleTypes as any) || undefined,
          createdAt: r.createdAt.toISOString(),
          updatedAt: r.updatedAt.toISOString(),
        }));
      }
    } catch (err) {
      console.warn("Could not query rewards from Postgres DB:", err);
    }
  }

  if (offers.length === 0) {
    offers = store.rewardOffers || [];
  }

  return offers;
}

export async function createRewardOffer(
  store: LoyaltyStore,
  body: Partial<RewardOffer>,
): Promise<RewardOffer> {
  const newOffer: RewardOffer = {
    id: body.id?.trim() || `reward-${Date.now()}`,
    title: body.title?.trim() || "New Reward Offer",
    description: body.description?.trim() || "",
    pointsRequired: body.pointsRequired ?? 100,
    eligibleTiers: body.eligibleTiers || ["silver", "gold", "platinum"],
    vehicleTypes: body.vehicleTypes,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  if (db) {
    try {
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
    } catch (err) {
      console.warn("Could not persist reward offer to Postgres DB:", err);
    }
  }

  store.rewardOffers = store.rewardOffers || [];
  store.rewardOffers.push(newOffer);
  return newOffer;
}

export async function deleteRewardOffer(
  store: LoyaltyStore,
  id: string,
): Promise<boolean> {
  const idx = store.rewardOffers.findIndex((r) => r.id === id);
  if (idx === -1) {
    return false;
  }

  if (db) {
    try {
      await db
        .delete(schema.rewardOffers)
        .where(sql`${schema.rewardOffers.id} = ${id}`);
    } catch (err) {
      console.warn("Could not delete reward offer from Postgres DB:", err);
    }
  }

  store.rewardOffers.splice(idx, 1);
  return true;
}

export function suggestRewards(
  customer: LoyaltyCustomer,
  store: LoyaltyStore,
): RewardOffer[] {
  const now = new Date();
  const eligibleOffers = store.rewardOffers.filter((offer) =>
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
    .map((offer) => ({
      ...offer,
      title: offer.title,
      description: offer.description,
      pointsRequired: offer.pointsRequired,
      eligibleTiers: offer.eligibleTiers,
      vehicleTypes: offer.vehicleTypes,
    }))
    .sort((a, b) => a.pointsRequired - b.pointsRequired)
    .filter(
      (offer, index, arr) =>
        index === arr.findIndex((item) => item.id === offer.id),
    );
}
