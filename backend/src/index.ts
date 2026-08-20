import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { db } from "./db/index";
import { registerLoyaltyRoutes } from "./routes/loyalty.route";
import { registerBookingRoutes } from "./routes/booking.route";
import { registerRewardRoutes } from "./routes/rewards.route";
import { registerAdminRoutes } from "./routes/admin.route";
import { registerServiceRoutes } from "./routes/service.route";
import { registerSlotRoutes } from "./routes/slot.route";
import { registerPromotionRoutes } from "./routes/promotion.route";

if (!db) {
  throw new Error(
    "DATABASE_URL is not configured. The API requires a Postgres connection.",
  );
}

const app = new Elysia()
  .use(cors())
  .onRequest(({ request }) => {
    const method = request.method;
    const url = new URL(request.url).pathname;
    console.log(
      `[HTTP INCOMING] 🌐 ${method} ${url} - Timestamp: ${new Date().toISOString()}`,
    );
  })
  .onAfterResponse(({ request, set }) => {
    const method = request.method;
    const url = new URL(request.url).pathname;
    const status = set.status || 200;
    console.log(`[HTTP RESPONSE] 📤 ${method} ${url} - Status: ${status}`);
  })
  .get("/", () => ({
    status: "online",
    service: "EZ-Wash API",
    version: "1.0.0",
    databaseConnected: Boolean(db),
    timestamp: new Date().toISOString(),
  }));

registerLoyaltyRoutes(app);
registerBookingRoutes(app);
registerRewardRoutes(app);
registerPromotionRoutes(app);
registerServiceRoutes(app);
registerSlotRoutes(app);
registerAdminRoutes(app);

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
app.listen(PORT);

console.log(
  `🦊 Elysia is running at http://${app.server?.hostname || "localhost"}:${app.server?.port || PORT}`,
);
if (db) {
  console.log("🐘 Supabase / PostgreSQL: Connected and ready.");
} else {
  console.log("🐘 Supabase / PostgreSQL: Not connected.");
}
