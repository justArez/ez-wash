import { describe, expect, it } from "bun:test";
import {
  createPromotion,
  updatePromotion,
  deletePromotion,
  getAllPromotions,
  claimPromotion,
} from "../src/services/promotion.service";
import type {
  LoyaltyStore,
  Promotion,
  LoyaltyCustomer,
} from "../src/models/loyalty.model";

describe("promotion.service", () => {
  it("should manage promotions in the store", () => {
    const store: LoyaltyStore = {
      customers: [],
      tiers: [],
      rewardOffers: [],
      promotions: [],
      auditLogs: [],
      lastTierEvaluationDate: "2026-08-01",
    };

    const promo = createPromotion(store, {
      name: "Silver Bonus",
      description: "A promo for Silver tier.",
      applicableTiers: ["silver"],
      applicableVehicleModels: ["Sedan"],
      startDate: "2026-08-01",
      endDate: "2026-09-01",
      isActive: true,
    });

    expect(store.promotions.length).toBe(1);
    expect(promo.name).toBe("Silver Bonus");

    const updated = updatePromotion(store, promo.id, { isActive: false });
    expect(updated).not.toBeNull();
    expect(updated?.isActive).toBe(false);

    const promotions = getAllPromotions(store);
    expect(promotions[0].id).toBe(promo.id);

    const deleted = deletePromotion(store, promo.id);
    expect(deleted).toBe(true);
    expect(store.promotions.length).toBe(0);
  });

  it("should enforce claiming a promotion only once per user", () => {
    const customer: LoyaltyCustomer = {
      id: "cust-test-1",
      phone: "555-1234",
      tierId: "gold",
      pointsBalance: 1000,
      collectedPoints: 1000,
      vehicles: [],
      pointHistory: [],
      bookingHistory: [],
      lateCancellationWarningCount: 0,
      priorityStatus: "normal",
      status: "Active",
      createdAt: "2026-08-01T00:00:00Z",
      updatedAt: "2026-08-01T00:00:00Z",
    };

    const store: LoyaltyStore = {
      customers: [customer],
      tiers: [],
      rewardOffers: [],
      promotions: [],
      auditLogs: [],
      lastTierEvaluationDate: "2026-08-01",
    };

    const promo = createPromotion(store, {
      id: "promo-one-time",
      name: "One Time Perk",
      pointPrice: 200,
      requiredTier: "GOLD",
      category: "tier_reward",
      isActive: true,
    });

    // First claim should succeed
    const firstClaim = claimPromotion(store, "555-1234", promo.id);
    expect(firstClaim.success).toBe(true);
    expect(firstClaim.pointsBalance).toBe(800);

    // Second claim should fail with already claimed message
    const secondClaim = claimPromotion(store, "555-1234", promo.id);
    expect(secondClaim.success).toBe(false);
    expect(secondClaim.message).toContain("already claimed");
  });
});
