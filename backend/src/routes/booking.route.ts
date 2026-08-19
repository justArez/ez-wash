import {
  cancelBooking,
  createBooking,
  findCustomer,
} from "../services/loyalty.service";
import { getServiceById } from "../services/service.service";
import { saveStore } from "../storage";
import type { LoyaltyStore } from "../models/loyalty.model";

export function registerBookingRoutes(app: any, store: LoyaltyStore) {
  app.post("/api/bookings", async (ctx: any) => {
    const body = (await ctx.body) as {
      phone: string;
      vehiclePlate: string;
      requestedDate: string;
      serviceId?: string;
      timeSlot?: string;
      time?: string;
      appliedPromoId?: string;
      note?: string;
    };

    const {
      phone,
      vehiclePlate,
      requestedDate,
      serviceId,
      timeSlot,
      time,
      appliedPromoId,
      note,
    } = body || {};

    if (!phone || !vehiclePlate || !requestedDate) {
      return new Response(
        JSON.stringify({
          error:
            "Missing required fields (phone, vehiclePlate, requestedDate).",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    try {
      const result = createBooking(store, phone, vehiclePlate, requestedDate);
      if (result.success && result.booking) {
        if (serviceId) {
          result.booking.serviceId = serviceId;
          const srv = getServiceById(store, serviceId);
          if (srv) {
            result.booking.serviceName = srv.name;
            result.booking.service = srv.name;
            result.booking.durationMinutes = srv.durationMinutes;
          }
        }
        if (timeSlot || time) {
          result.booking.timeSlot = timeSlot || time;
          result.booking.time = timeSlot || time;
        }
        if (appliedPromoId) result.booking.appliedPromoId = appliedPromoId;
        if (note) result.booking.note = note;
      }
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

  app.get("/api/bookings/my-bookings", (ctx: any) => {
    const phone = ctx.query?.phone as string | undefined;
    if (!phone) {
      return new Response(
        JSON.stringify({ error: "Phone query parameter is required." }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const customer = findCustomer(store, phone);
    if (!customer) {
      return new Response(JSON.stringify({ error: "Customer not found." }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const history = (customer.bookingHistory || []).slice().reverse();
    const active = history.filter(
      (b) => b.status === "confirmed" || b.status === "pending",
    );

    return {
      status: "success",
      totalCount: history.length,
      activeCount: active.length,
      activeBookings: active,
      bookingHistory: history,
    };
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
