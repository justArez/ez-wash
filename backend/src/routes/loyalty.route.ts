import { getAllTiers, getTier } from "../services/tier.service";
import {
  buildDashboard,
  findCustomer,
  linkAccount,
} from "../services/loyalty.service";
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
    const tier = getTier(customer.tierId, store);

    return {
      customerId: customer.id,
      phone: customer.phone,
      tier,
      loyaltyTier: tier,
      pointsBalance: customer.pointsBalance,
      vehicles: customer.vehicles,
      fullName: customer.fullName,
      email: customer.email,
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

  // Quick lookup endpoint for booking modal auto-fill
  app.get("/api/loyalty/customer", (ctx: any) => {
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

    const tier = getTier(customer.tierId, store);

    return {
      id: customer.id,
      phone: customer.phone,
      fullName: customer.fullName,
      email: customer.email,
      tier,
      tierId: customer.tierId,
      pointsBalance: customer.pointsBalance,
      vehicles: customer.vehicles,
      priorityStatus: customer.priorityStatus,
    };
  });

  // Get claimed promo vouchers for customer
  app.get("/api/loyalty/claimed-promos", (ctx: any) => {
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

    return {
      status: "success",
      count: (customer.claimedPromos || []).length,
      data: customer.claimedPromos || [],
    };
  });

  // Public tiers catalog
  app.get("/api/tiers", () => {
    const tiers = getAllTiers(store);
    return {
      status: "success",
      count: tiers.length,
      data: tiers,
    };
  });

  return app;
}
