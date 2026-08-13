import { describe, expect, it } from "bun:test";
import { createPromotion, updatePromotion, deletePromotion, getAllPromotions, } from "../src/services/promotion.service";
describe("promotion.service", () => {
    it("should manage promotions in the store", () => {
        const store = {
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
});
