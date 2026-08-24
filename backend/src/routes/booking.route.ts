import {
  cancelPublicBooking,
  createPublicBooking,
  fetchCustomerBookings,
  submitBookingDeposit,
} from "../services/booking.service";
import { uploadObject } from "../services/storage.service";

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

    const { phone, vehiclePlate, requestedDate } = body || {};

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
      return await createPublicBooking(body);
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

    try {
      const result = await fetchCustomerBookings(phone);
      if (!result) {
        return new Response(JSON.stringify({ error: "Customer not found." }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }

      return {
        status: "success",
        ...result,
      };
    } catch (error) {
      return new Response(
        JSON.stringify({
          error:
            error instanceof Error
              ? error.message
              : "Failed to fetch bookings.",
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
      return await cancelPublicBooking(phone, bookingId);
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

  app.put("/api/bookings/:bookingId/deposit", async (ctx: any) => {
    const { phone, depositImageUrl } = (await ctx.body) as {
      phone?: string;
      depositImageUrl?: string;
    };
    const bookingId = ctx.params?.bookingId as string | undefined;

    if (!bookingId || !phone || !depositImageUrl) {
      return new Response(
        JSON.stringify({
          error: "bookingId, phone and depositImageUrl are required.",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    try {
      const booking = await submitBookingDeposit({
        bookingId,
        phone,
        depositImageUrl,
      });
      return {
        status: "success",
        data: booking,
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Deposit submission failed.";
      const status = message.includes("not found") ? 404 : 400;
      return new Response(JSON.stringify({ error: message }), {
        status,
        headers: { "Content-Type": "application/json" },
      });
    }
  });

  app.post("/api/bookings/:bookingId/deposit/upload", async (ctx: any) => {
    const bookingId = ctx.params?.bookingId as string | undefined;

    if (!bookingId) {
      return new Response(
        JSON.stringify({ error: "bookingId is required." }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const body = (await ctx.body) as { phone?: string; file?: File };
    const phone = body?.phone;
    const file = body?.file;

    if (!phone || !file || typeof file === "string") {
      return new Response(
        JSON.stringify({ error: "phone and file are required." }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    if (!file.type?.startsWith("image/")) {
      return new Response(
        JSON.stringify({ error: "Only image uploads are allowed." }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const MAX_BYTES = 5 * 1024 * 1024;
    if (file.size > MAX_BYTES) {
      return new Response(
        JSON.stringify({ error: "Image must be 5 MB or smaller." }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    try {
      const extension = file.name?.split(".").pop()?.toLowerCase() || "jpg";
      const key = `${bookingId}/${Date.now()}.${extension}`;
      const bytes = new Uint8Array(await file.arrayBuffer());
      const publicUrl = await uploadObject(key, bytes, file.type);

      const booking = await submitBookingDeposit({
        bookingId,
        phone,
        depositImageUrl: publicUrl,
      });

      return {
        status: "success",
        data: booking,
      };
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Deposit upload failed.";
      const status = message.includes("not found") ? 404 : 400;
      return new Response(JSON.stringify({ error: message }), {
        status,
        headers: { "Content-Type": "application/json" },
      });
    }
  });

  return app;
}
