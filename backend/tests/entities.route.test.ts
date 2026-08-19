import { describe, expect, it } from "bun:test";
import { Elysia } from "elysia";
import type { LoyaltyStore } from "../src/models/loyalty.model";
import { registerServiceRoutes } from "../src/routes/service.route";
import { registerSlotRoutes } from "../src/routes/slot.route";
import { registerPromotionRoutes } from "../src/routes/promotion.route";
import { registerAdminRoutes } from "../src/routes/admin.route";
import { registerLoyaltyRoutes } from "../src/routes/loyalty.route";
import { registerBookingRoutes } from "../src/routes/booking.route";

function setupApp() {
  const store: LoyaltyStore = {
    customers: [
      {
        id: "cust-test-1",
        phone: "555-1234",
        licensePlates: ["ABC1234"],
        tierId: "gold",
        pointsBalance: 500,
        vehicles: [{ plate: "ABC1234", model: "Sedan", type: "car" }],
        pointHistory: [],
        bookingHistory: [
          {
            id: "bk-1",
            customerId: "cust-test-1",
            vehiclePlate: "ABC1234",
            date: "2026-08-25",
            timeSlot: "10:00",
            time: "10:00",
            status: "confirmed",
            appliedPerks: [],
            createdAt: new Date().toISOString(),
          },
        ],
        lateCancellationWarningCount: 0,
        priorityStatus: "normal",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
    tiers: [],
    rewardOffers: [],
    promotions: [
      {
        id: "promo-1",
        name: "Test 10% Discount",
        title: "Test 10% Discount",
        description: "Test description",
        category: "discount",
        discountPercentage: 10,
        pointPrice: 100,
        applicableTiers: ["gold", "platinum"],
        requiredTier: "GOLD",
        applicableVehicleModels: [],
        startDate: "2026-08-01",
        endDate: "2026-12-31",
        status: "ACTIVE",
        isActive: true,
      },
    ],
    auditLogs: [],
  };

  const app = new Elysia();
  registerServiceRoutes(app, store);
  registerSlotRoutes(app, store);
  registerPromotionRoutes(app, store);
  registerLoyaltyRoutes(app, store);
  registerBookingRoutes(app, store);
  registerAdminRoutes(app, store);

  return { app, store };
}

describe("Extended Backend Entity APIs", () => {
  it("should get wash services and individual service details", async () => {
    const { app } = setupApp();

    const res = await app.handle(new Request("http://localhost/api/services"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.status).toBe("success");
    expect(body.data.length).toBeGreaterThan(0);

    const firstId = body.data[0].id;
    const detailRes = await app.handle(
      new Request(`http://localhost/api/services/${firstId}`),
    );
    expect(detailRes.status).toBe(200);
    const detailBody = await detailRes.json();
    expect(detailBody.data.id).toBe(firstId);
  });

  it("should get time slots for a date", async () => {
    const { app } = setupApp();

    const res = await app.handle(
      new Request("http://localhost/api/slots?date=2026-08-25"),
    );
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.status).toBe("success");
    expect(body.data.length).toBeGreaterThan(0);
    expect(body.data[0].date).toBe("2026-08-25");
  });

  it("should claim a promotion voucher deducting points", async () => {
    const { app, store } = setupApp();

    const claimRes = await app.handle(
      new Request("http://localhost/api/promotions/promo-1/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: "555-1234" }),
      }),
    );

    expect(claimRes.status).toBe(200);
    const claimBody = await claimRes.json();
    expect(claimBody.status).toBe("success");
    expect(claimBody.claimedPromo.promoId).toBe("promo-1");
    expect(claimBody.pointsBalance).toBe(400); // 500 - 100

    // Verify claimed vouchers endpoint
    const vouchersRes = await app.handle(
      new Request("http://localhost/api/loyalty/claimed-promos?phone=555-1234"),
    );
    expect(vouchersRes.status).toBe(200);
    const vouchersBody = await vouchersRes.json();
    expect(vouchersBody.count).toBe(1);
    expect(vouchersBody.data[0].promoId).toBe("promo-1");
  });

  it("should get admin dashboard metrics and manage users", async () => {
    const { app } = setupApp();

    // Metrics
    const metricsRes = await app.handle(
      new Request("http://localhost/api/admin/dashboard/metrics", {
        headers: { "x-admin-token": "admin-secret" },
      }),
    );
    expect(metricsRes.status).toBe(200);
    const metricsBody = await metricsRes.json();
    expect(metricsBody.status).toBe("success");
    expect(metricsBody.data.totalRevenueToday).toBeDefined();

    // Users
    const usersRes = await app.handle(
      new Request("http://localhost/api/admin/users", {
        headers: { "x-admin-token": "admin-secret" },
      }),
    );
    expect(usersRes.status).toBe(200);
    const usersBody = await usersRes.json();
    expect(usersBody.count).toBe(1);

    // Adjust points
    const adjustRes = await app.handle(
      new Request(
        "http://localhost/api/admin/users/cust-test-1/adjust-points",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-admin-token": "admin-secret",
          },
          body: JSON.stringify({
            delta: 50,
            reason: "Customer goodwill bonus",
          }),
        },
      ),
    );
    expect(adjustRes.status).toBe(200);
    const adjustBody = await adjustRes.json();
    expect(adjustBody.data.pointsBalance).toBe(550);
  });
});
