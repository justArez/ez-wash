import { describe, expect, it } from "bun:test";
import { cancelBooking } from "../src/services/loyalty.service";
import type { LoyaltyStore } from "../src/models/loyalty.model";

function createStore(scheduledDate: string, warningCount = 0): LoyaltyStore {
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
            date: scheduledDate,
            createdAt: "2026-08-13T00:00:00.000Z",
            appliedPerks: [],
            status: "confirmed",
          },
        ],
        lateCancellationWarningCount: warningCount,
        priorityStatus: warningCount >= 3 ? "LOW_PRIORITIED" : "normal",
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

describe("booking cancellation service", () => {
  it("cancels an owned booking without a warning when more than four hours remain", () => {
    const store = createStore("2099-08-14T12:00:00.000Z");

    const result = cancelBooking(store, "555-0100", "booking-1");

    expect(result.success).toBe(true);
    expect(result.isLateCancellation).toBe(false);
    expect(store.customers[0].bookingHistory[0].status).toBe("cancelled");
    expect(store.customers[0].lateCancellationWarningCount).toBe(0);
  });

  it("records a late warning exactly once for a booking within four hours", () => {
    const store = createStore("2099-08-14T12:00:00.000Z");
    const now = new Date("2099-08-14T08:00:00.000Z");

    const first = cancelBooking(store, "555-0100", "booking-1", now);
    const second = cancelBooking(store, "555-0100", "booking-1", now);

    expect(first.isLateCancellation).toBe(true);
    expect(first.warningCount).toBe(1);
    expect(second.warningCount).toBe(1);
    expect(store.customers[0].lateCancellationWarningCount).toBe(1);
  });

  it("marks the customer low prioritied on the third late warning", () => {
    const store = createStore("2099-08-14T12:00:00.000Z", 2);
    const now = new Date("2099-08-14T08:00:00.000Z");

    const result = cancelBooking(store, "555-0100", "booking-1", now);

    expect(result.priorityStatus).toBe("LOW_PRIORITIED");
    expect(store.customers[0].lateCancellationWarningCount).toBe(3);
  });

  it("rejects a booking owned by another customer", () => {
    const store = createStore("2099-08-14T12:00:00.000Z");

    expect(() => cancelBooking(store, "555-9999", "booking-1")).toThrow();
  });

  it("automatically removes LOW_PRIORITIED mark when user completes 3 bookings", () => {
    const store = createStore("2099-08-14T12:00:00.000Z", 3);
    const customer = store.customers[0];
    customer.priorityStatus = "LOW_PRIORITIED";

    // Add 2 more bookings
    customer.bookingHistory.push(
      {
        id: "booking-2",
        customerId: "customer-1",
        vehiclePlate: "ABC123",
        date: "2099-08-15T12:00:00.000Z",
        createdAt: "2026-08-13T00:00:00.000Z",
        appliedPerks: [],
        status: "confirmed",
      },
      {
        id: "booking-3",
        customerId: "customer-1",
        vehiclePlate: "ABC123",
        date: "2099-08-16T12:00:00.000Z",
        createdAt: "2026-08-13T00:00:00.000Z",
        appliedPerks: [],
        status: "confirmed",
      },
    );

    const { adminUpdateBooking } = require("../src/services/booking.service");

    // Complete booking 1
    adminUpdateBooking(store, "booking-1", { status: "completed" });
    expect(customer.priorityStatus).toBe("LOW_PRIORITIED");

    // Complete booking 2
    adminUpdateBooking(store, "booking-2", { status: "completed" });
    expect(customer.priorityStatus).toBe("LOW_PRIORITIED");

    // Complete booking 3
    adminUpdateBooking(store, "booking-3", { status: "completed" });
    expect(customer.priorityStatus).toBe("normal");
    expect(customer.lateCancellationWarningCount).toBe(0);
  });
});
