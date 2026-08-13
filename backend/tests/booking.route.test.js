import { describe, expect, it } from "bun:test";
import { Elysia } from "elysia";
import { registerBookingRoutes } from "../src/routes/booking.route";
function createStore() {
    return {
        customers: [
            {
                id: "customer-1",
                phone: "555-0100",
                licensePlates: ["ABC123"],
                tierId: "member",
                pointsBalance: 0,
                vehicles: [{ plate: "ABC123", model: "Toyota Camry", type: "car" }],
                pointHistory: [],
                bookingHistory: [
                    {
                        id: "booking-1",
                        customerId: "customer-1",
                        vehiclePlate: "ABC123",
                        date: "2099-08-14T12:00:00.000Z",
                        createdAt: "2026-08-13T00:00:00.000Z",
                        appliedPerks: [],
                        status: "confirmed",
                    },
                ],
                lateCancellationWarningCount: 0,
                priorityStatus: "normal",
                createdAt: "2026-08-01T00:00:00.000Z",
                updatedAt: "2026-08-01T00:00:00.000Z",
            },
        ],
        tiers: [],
        rewardOffers: [],
        promotions: [],
        auditLogs: [],
    };
}
describe("booking.route", () => {
    it("cancels an owned booking through the API contract", async () => {
        const app = new Elysia();
        registerBookingRoutes(app, createStore());
        const response = await app.handle(new Request("http://localhost/api/bookings/booking-1/cancel", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ phone: "555-0100" }),
        }));
        expect(response.status).toBe(200);
        expect(await response.json()).toHaveProperty("success", true);
    });
    it("rejects cancellation without the customer phone", async () => {
        const app = new Elysia();
        registerBookingRoutes(app, createStore());
        const response = await app.handle(new Request("http://localhost/api/bookings/booking-1/cancel", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({}),
        }));
        expect(response.status).toBe(400);
    });
});
