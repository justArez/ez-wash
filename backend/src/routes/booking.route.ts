import {
  cancelPublicBooking,
  createPublicBooking,
  fetchCustomerBookings,
} from "../services/booking.service";

export function registerBookingRoutes(app: any) {
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
      const result = await createPublicBooking({
        phone,
        vehiclePlate,
        requestedDate,
        serviceId,
        timeSlot: timeSlot || time,
        appliedPromoId,
        note,
      });
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

  app.get("/api/bookings/my-bookings", async (ctx: any) => {
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

    const bookingsData = await fetchCustomerBookings(phone);
    if (!bookingsData) {
      return new Response(JSON.stringify({ error: "Customer not found." }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    return {
      status: "success",
      ...bookingsData,
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
      const result = await cancelPublicBooking(phone, bookingId);
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
