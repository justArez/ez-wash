import { describe, expect, it } from "bun:test";
import { evaluateCustomerTiers, createTier, updateTier, deleteTier, shouldRunMonthlyEvaluation, } from "../src/services/tier.service";
import { TIERS } from "../src/models/loyalty.model";
describe("tier.service", () => {
    it("should create, update, and delete a tier", () => {
        const store = {
            customers: [],
            tiers: [],
            rewardOffers: [],
            promotions: [],
            auditLogs: [],
            lastTierEvaluationDate: "2026-07-01",
        };
        const tier = createTier(store, {
            name: "Test Tier",
            bookingWindowDays: 9,
            pointRate: 1.1,
            perks: ["early access"],
            description: "A test tier",
            isActive: true,
        });
        expect(store.tiers.length).toBe(1);
        expect(tier.name).toBe("Test Tier");
        expect(tier.bookingWindowDays).toBe(9);
        const updated = updateTier(store, tier.id, {
            pointRate: 2,
            perks: ["express"],
        });
        expect(updated).not.toBeNull();
        expect(updated?.pointRate).toBe(2);
        expect(updated?.perks).toEqual(["express"]);
        const deleted = deleteTier(store, tier.id);
        expect(deleted).toBe(true);
        expect(store.tiers.length).toBe(0);
    });
    it("should evaluate customer tiers monthly", () => {
        const customer = {
            id: "cust-1",
            phone: "555-0001",
            licensePlates: ["AAA111"],
            tierId: "member",
            pointsBalance: 200,
            vehicles: [{ plate: "AAA111", model: "Sedan", type: "car" }],
            pointHistory: [],
            bookingHistory: [
                {
                    id: "booking-1",
                    customerId: "cust-1",
                    vehiclePlate: "AAA111",
                    date: "2026-08-01",
                    createdAt: "2026-08-01T00:00:00.000Z",
                    appliedPerks: [],
                    status: "confirmed",
                },
            ],
            createdAt: "2026-07-01T00:00:00.000Z",
            updatedAt: "2026-07-01T00:00:00.000Z",
        };
        const store = {
            customers: [customer],
            tiers: Object.values(TIERS),
            rewardOffers: [],
            promotions: [],
            auditLogs: [],
            lastTierEvaluationDate: "2026-07-01",
        };
        expect(shouldRunMonthlyEvaluation(store, "2026-07-15")).toBe(false);
        expect(shouldRunMonthlyEvaluation(store, "2026-08-01")).toBe(true);
        const results = evaluateCustomerTiers(store, "2026-08-01");
        expect(results[0].tierId).toBe("silver");
        expect(store.lastTierEvaluationDate).toBe("2026-08-01");
    });
});
