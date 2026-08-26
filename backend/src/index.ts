import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";
import { CloudflareAdapter } from "elysia/adapter/cloudflare-worker";
import { db, initDb } from "./db/index";
import { registerLoyaltyRoutes } from "./routes/loyalty.route";
import { registerBookingRoutes } from "./routes/booking.route";
import { registerRewardRoutes } from "./routes/rewards.route";
import { registerAdminRoutes } from "./routes/admin.route";
import { registerServiceRoutes } from "./routes/service.route";
import { registerSlotRoutes } from "./routes/slot.route";
import { registerPromotionRoutes } from "./routes/promotion.route";

if (typeof process === "undefined") {
  globalThis.process = { env: {} } as any;
}

let isDbInitialized = false;
const injectEnvVariablesOnce = (cfEnv: Record<string, string>) => {
  if (isDbInitialized) return;

  if (!cfEnv.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL is not configured. The API cannot connect to the database.",
    );
  }

  initDb(cfEnv.DATABASE_URL);
  Object.assign(process.env, cfEnv);
  isDbInitialized = true;

  console.log(
    "🐘 Supabase / PostgreSQL: Connected and ready via Cloudflare Env.",
  );
};

const app = new Elysia({
  name: "EZ-Wash API",
  adapter: CloudflareAdapter,
})
  .use(cors())
  .derive(({ request }) => {
    return {};
  })
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
  .onError(({ error, request, set }) => {
    const url = new URL(request.url).pathname;
    console.error(`[HTTP ERROR] 💥 ${request.method} ${url}:`, error);
    set.status = 500;
    return {
      error: error instanceof Error ? error.message : "Internal server error.",
    };
  })
  .get("/", () => ({
    status: "online",
    service: "EZ-Wash API",
    version: "1.0.0",
    databaseConnected: isDbInitialized,
    timestamp: new Date().toISOString(),
  }));

registerLoyaltyRoutes(app);
registerBookingRoutes(app);
registerRewardRoutes(app);
registerPromotionRoutes(app);
registerServiceRoutes(app);
registerSlotRoutes(app);
registerAdminRoutes(app);

// const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
// app.listen(PORT);

console.log(
  `🦊 Elysia is running at http://${app.server?.hostname || "localhost"}:${app.server?.port || 3000}`,
);
if (db) {
  console.log("🐘 Supabase / PostgreSQL: Connected and ready.");
} else {
  console.log("🐘 Supabase / PostgreSQL: Not connected.");
}

app.compile();

console.log(
  "🦊 Elysia Application successfully compiled for Cloudflare Workers.",
);

export default {
  async fetch(request: Request, env: Record<string, string>, ctx: any) {
    if (!isDbInitialized) {
      const databaseUrl = env.DATABASE_URL || process.env.DATABASE_URL;
      if (!databaseUrl) {
        return new Response(
          JSON.stringify({
            error:
              "DATABASE_URL is missing from Cloudflare environment variables.",
          }),
          { status: 500, headers: { "Content-Type": "application/json" } },
        );
      }
      initDb(databaseUrl);
      Object.assign(process.env, env);
      isDbInitialized = true;
      console.log(
        "🐘 Supabase / PostgreSQL: Connection established on hot request.",
      );
    }
    return (app.fetch as any)(request, env, ctx);
  },
};
