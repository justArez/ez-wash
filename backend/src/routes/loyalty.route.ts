import { getTier } from "../services/tier.service";
import { buildDashboard, linkAccount } from "../services/loyalty.service";
import { saveStore } from "../storage";
import type { LoyaltyStore } from "../models/loyalty.model";

export function registerLoyaltyRoutes(app: any, store: LoyaltyStore) {
  app.post("/api/loyalty/link", async (ctx: any) => {
    const { phone, plate, model, type } = (await ctx.body) as {
      phone: string;
      plate: string;
      model: string;
      type: "car" | "motorcycle";
    };

    if (!phone || !plate || !model || !type) {
      return new Response(
        JSON.stringify({ error: "Missing required fields." }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const customer = linkAccount(store, phone, plate, model, type);
    saveStore(store);
    const tier = getTier(customer.tierId);

    return {
      customerId: customer.id,
      phone: customer.phone,
      tier,
      pointsBalance: customer.pointsBalance,
      vehicles: customer.vehicles,
    };
  });

  app.get("/api/loyalty/dashboard", (ctx: any) => {
    const phone = ctx.query?.phone as string | undefined;
    if (!phone) {
      return new Response(
        JSON.stringify({ error: "Phone query is required." }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const dashboard = buildDashboard(store, phone);
    if (!dashboard) {
      return new Response(JSON.stringify({ error: "Customer not found." }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    return dashboard;
  });

  return app;
}
