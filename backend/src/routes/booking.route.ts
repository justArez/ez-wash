import { cancelBooking, createBooking } from "../services/loyalty.service";
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

  app.post("/api/bookings/:bookingId/cancel", async (ctx: any) => {
    const { phone } = (await ctx.body) as { phone?: string };
    const bookingId = ctx.params?.bookingId as string | undefined;
    if (!phone || !bookingId) {
      return new Response(JSON.stringify({ error: "Phone is required." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    try {
      const result = cancelBooking(store, phone, bookingId);
      saveStore(store);
      return result;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Cancellation failed.";
      const status = message.includes("not found") ? 404 : 400;
      return new Response(JSON.stringify({ error: message }), {
        status,
        headers: { "Content-Type": "application/json" },
      });
    }
  });

  return app;
}
