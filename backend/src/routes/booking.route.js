import { cancelBooking, createBooking } from "../services/loyalty.service";
import { saveStore } from "../storage";
export function registerBookingRoutes(app, store) {
    app.post("/api/bookings", async (ctx) => {
        const { phone, vehiclePlate, requestedDate } = (await ctx.body);
        if (!phone || !vehiclePlate || !requestedDate) {
            return new Response(JSON.stringify({ error: "Missing required fields." }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }
        try {
            const result = createBooking(store, phone, vehiclePlate, requestedDate);
            saveStore(store);
            return result;
        }
        catch (error) {
            return new Response(JSON.stringify({
                error: error instanceof Error ? error.message : "Booking failed.",
            }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }
    });
    app.post("/api/bookings/:bookingId/cancel", async (ctx) => {
        const { phone } = (await ctx.body);
        const bookingId = ctx.params?.bookingId;
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
        }
        catch (error) {
            const message = error instanceof Error ? error.message : "Cancellation failed.";
            const status = message.includes("not found") ? 404 : 400;
            return new Response(JSON.stringify({ error: message }), {
                status,
                headers: { "Content-Type": "application/json" },
            });
        }
    });
    return app;
}
