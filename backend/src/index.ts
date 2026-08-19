import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { loadStore } from "./storage";
import { registerLoyaltyRoutes } from "./routes/loyalty.route";
import { registerBookingRoutes } from "./routes/booking.route";
import { registerRewardRoutes } from "./routes/rewards.route";
import { registerAdminRoutes } from "./routes/admin.route";
import { registerServiceRoutes } from "./routes/service.route";
import { registerSlotRoutes } from "./routes/slot.route";
import { registerPromotionRoutes } from "./routes/promotion.route";

const store = loadStore();

const app = new Elysia().use(cors()).get("/", () => ({
  status: "online",
  service: "EZ-Wash API",
  version: "1.0.0",
  timestamp: new Date().toISOString(),
}));

registerLoyaltyRoutes(app, store);
registerBookingRoutes(app, store);
registerRewardRoutes(app, store);
registerPromotionRoutes(app, store);
registerServiceRoutes(app, store);
registerSlotRoutes(app, store);
registerAdminRoutes(app, store);

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
app.listen(PORT);

console.log(
  `🦊 Elysia is running at http://${app.server?.hostname || "localhost"}:${app.server?.port || PORT}`,
);
