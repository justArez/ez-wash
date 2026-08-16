import {
  createTier,
  deleteTier,
  getAllTiers,
  updateTier,
} from "../services/tier.service";
import {
  createPromotion,
  deletePromotion,
  getAllPromotions,
  updatePromotion,
} from "../services/promotion.service";
import { logAudit } from "../services/audit.service";
import { saveStore } from "../storage";
import type {
  LoyaltyStore,
  LoyaltyTier,
  Promotion,
} from "../models/loyalty.model";

const ADMIN_TOKEN = process.env.ADMIN_TOKEN || "admin-secret";

function getHeaderValue(ctx: any, key: string) {
  const headers = ctx.headers ?? ctx.request?.headers;
  if (!headers) {
    return undefined;
  }
  if (typeof headers.get === "function") {
    return headers.get(key);
  }
  return headers[key] || headers[key.toLowerCase()];
}

function requireAdmin(ctx: any) {
  const authHeader = getHeaderValue(ctx, "authorization");
  const token =
    authHeader?.split("Bearer ")?.[1] || getHeaderValue(ctx, "x-admin-token");
  if (token !== ADMIN_TOKEN) {
    return new Response(
      JSON.stringify({ error: "Unauthorized admin access." }),
      {
        status: 401,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
  return null;
}

export function registerAdminRoutes(app: any, store: LoyaltyStore) {
  app.post("/api/admin/login", async (ctx: any) => {
    const body = (await ctx.body) as { token?: string };
    const token = body?.token?.trim();

    if (!token) {
      return new Response(
        JSON.stringify({ error: "Admin token is required." }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    if (token !== ADMIN_TOKEN) {
      return new Response(JSON.stringify({ error: "Invalid admin token." }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    return {
      success: true,
      adminUserInfo: {
        token,
        role: "admin",
        username: "Administrator",
      },
    };
  });

  app.get("/api/admin/tiers", (ctx: any) => {
    const authError = requireAdmin(ctx);
    if (authError) return authError;
    return { tiers: getAllTiers(store) };
  });

  app.post("/api/admin/tiers", async (ctx: any) => {
    const authError = requireAdmin(ctx);
    if (authError) return authError;

    const body = (await ctx.body) as Partial<LoyaltyTier>;
    const required = [
      "name",
      "bookingWindowDays",
      "pointRate",
      "perks",
      "description",
      "isActive",
    ];
    for (const field of required) {
      if (body[field as keyof LoyaltyTier] === undefined) {
        return new Response(
          JSON.stringify({ error: `${field} is required.` }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          },
        );
      }
    }

    const tier = createTier(store, body as LoyaltyTier);
    logAudit(store, {
      actor: "admin",
      actionType: "create-tier",
      entityType: "tier",
      entityId: tier.id,
      details: `Created tier ${tier.name}`,
    });

    saveStore(store);
    return { tier };
  });

  app.put("/api/admin/tiers/:tierId", async (ctx: any) => {
    const authError = requireAdmin(ctx);
    if (authError) return authError;

    const tierId = ctx.params.tierId as string;
    const body = (await ctx.body) as Partial<LoyaltyTier>;
    const tier = updateTier(store, tierId, body as Partial<LoyaltyTier>);
    if (!tier) {
      return new Response(JSON.stringify({ error: "Tier not found." }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    logAudit(store, {
      actor: "admin",
      actionType: "update-tier",
      entityType: "tier",
      entityId: tier.id,
      details: `Updated tier ${tier.name}`,
    });

    saveStore(store);
    return { tier };
  });

  app.delete("/api/admin/tiers/:tierId", (ctx: any) => {
    const authError = requireAdmin(ctx);
    if (authError) return authError;

    const tierId = ctx.params.tierId as string;
    const success = deleteTier(store, tierId);
    if (!success) {
      return new Response(JSON.stringify({ error: "Tier not found." }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    logAudit(store, {
      actor: "admin",
      actionType: "delete-tier",
      entityType: "tier",
      entityId: tierId,
      details: `Deleted tier ${tierId}`,
    });

    saveStore(store);
    return { deleted: success };
  });

  app.get("/api/admin/promotions", (ctx: any) => {
    const authError = requireAdmin(ctx);
    if (authError) return authError;
    return { promotions: getAllPromotions(store) };
  });

  app.post("/api/admin/promotions", async (ctx: any) => {
    const authError = requireAdmin(ctx);
    if (authError) return authError;

    const body = (await ctx.body) as Partial<Promotion>;
    const required = [
      "name",
      "description",
      "applicableTiers",
      "startDate",
      "endDate",
      "isActive",
    ];
    for (const field of required) {
      if (body[field as keyof Promotion] === undefined) {
        return new Response(
          JSON.stringify({ error: `${field} is required.` }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          },
        );
      }
    }

    const promotion = createPromotion(store, body);
    logAudit(store, {
      actor: "admin",
      actionType: "create-promotion",
      entityType: "promotion",
      entityId: promotion.id,
      details: `Created promotion ${promotion.name}`,
    });

    saveStore(store);
    return { promotion };
  });

  app.put("/api/admin/promotions/:promotionId", async (ctx: any) => {
    const authError = requireAdmin(ctx);
    if (authError) return authError;

    const promotionId = ctx.params.promotionId as string;
    const body = (await ctx.body) as Partial<Promotion>;
    const promotion = updatePromotion(store, promotionId, body);
    if (!promotion) {
      return new Response(JSON.stringify({ error: "Promotion not found." }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    logAudit(store, {
      actor: "admin",
      actionType: "update-promotion",
      entityType: "promotion",
      entityId: promotion.id,
      details: `Updated promotion ${promotion.name}`,
    });

    saveStore(store);
    return { promotion };
  });

  app.delete("/api/admin/promotions/:promotionId", (ctx: any) => {
    const authError = requireAdmin(ctx);
    if (authError) return authError;

    const promotionId = ctx.params.promotionId as string;
    const success = deletePromotion(store, promotionId);
    if (!success) {
      return new Response(JSON.stringify({ error: "Promotion not found." }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    logAudit(store, {
      actor: "admin",
      actionType: "delete-promotion",
      entityType: "promotion",
      entityId: promotionId,
      details: `Deleted promotion ${promotionId}`,
    });

    saveStore(store);
    return { deleted: success };
  });

  app.get("/api/admin/audit-logs", (ctx: any) => {
    const authError = requireAdmin(ctx);
    if (authError) return authError;
    return { auditLogs: store.auditLogs };
  });

  return app;
}
