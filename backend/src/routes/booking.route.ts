import { createBooking } from "../services/loyalty.service";
import { saveStore } from "../storage";
import type { LoyaltyStore } from "../models/loyalty.model";

export function registerBookingRoutes(app: any, store: LoyaltyStore) {
  app.post("/api/bookings", async (ctx: any) => {
    const { phone, vehiclePlate, requestedDate } = (await ctx.body) as {
      phone: string;
      vehiclePlate: string;
      requestedDate: string;
    };

    if (!phone || !vehiclePlate || !requestedDate) {
      return new Response(
        JSON.stringify({ error: "Missing required fields." }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    try {
      const result = createBooking(store, phone, vehiclePlate, requestedDate);
      saveStore(store);
      return result;
    } catch (error) {
      return new Response(
        JSON.stringify({
          error: error instanceof Error ? error.message : "Booking failed.",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }
  });

  return app;
}
