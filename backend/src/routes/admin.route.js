import { createTier, deleteTier, getAllTiers, updateTier, } from "../services/tier.service";
import { createPromotion, deletePromotion, getAllPromotions, updatePromotion, } from "../services/promotion.service";
import { logAudit } from "../services/audit.service";
import { saveStore } from "../storage";
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || "admin-secret";
function getHeaderValue(ctx, key) {
    const headers = ctx.headers ?? ctx.request?.headers;
    if (!headers) {
        return undefined;
    }
    if (typeof headers.get === "function") {
        return headers.get(key);
    }
    return headers[key] || headers[key.toLowerCase()];
}
function requireAdmin(ctx) {
    const authHeader = getHeaderValue(ctx, "authorization");
    const token = authHeader?.split("Bearer ")?.[1] || getHeaderValue(ctx, "x-admin-token");
    if (token !== ADMIN_TOKEN) {
        return new Response(JSON.stringify({ error: "Unauthorized admin access." }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
        });
    }
    return null;
}
export function registerAdminRoutes(app, store) {
    app.get("/api/admin/tiers", (ctx) => {
        const authError = requireAdmin(ctx);
        if (authError)
            return authError;
        return { tiers: getAllTiers(store) };
    });
    app.post("/api/admin/tiers", async (ctx) => {
        const authError = requireAdmin(ctx);
        if (authError)
            return authError;
        const body = (await ctx.body);
        const required = [
            "name",
            "bookingWindowDays",
            "pointRate",
            "perks",
            "description",
            "isActive",
        ];
        for (const field of required) {
            if (body[field] === undefined) {
                return new Response(JSON.stringify({ error: `${field} is required.` }), {
                    status: 400,
                    headers: { "Content-Type": "application/json" },
                });
            }
        }
        const tier = createTier(store, body);
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
    app.put("/api/admin/tiers/:tierId", async (ctx) => {
        const authError = requireAdmin(ctx);
        if (authError)
            return authError;
        const tierId = ctx.params.tierId;
        const body = (await ctx.body);
        const tier = updateTier(store, tierId, body);
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
    app.delete("/api/admin/tiers/:tierId", (ctx) => {
        const authError = requireAdmin(ctx);
        if (authError)
            return authError;
        const tierId = ctx.params.tierId;
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
    app.get("/api/admin/promotions", (ctx) => {
        const authError = requireAdmin(ctx);
        if (authError)
            return authError;
        return { promotions: getAllPromotions(store) };
    });
    app.post("/api/admin/promotions", async (ctx) => {
        const authError = requireAdmin(ctx);
        if (authError)
            return authError;
        const body = (await ctx.body);
        const required = [
            "name",
            "description",
            "applicableTiers",
            "startDate",
            "endDate",
            "isActive",
        ];
        for (const field of required) {
            if (body[field] === undefined) {
                return new Response(JSON.stringify({ error: `${field} is required.` }), {
                    status: 400,
                    headers: { "Content-Type": "application/json" },
                });
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
    app.put("/api/admin/promotions/:promotionId", async (ctx) => {
        const authError = requireAdmin(ctx);
        if (authError)
            return authError;
        const promotionId = ctx.params.promotionId;
        const body = (await ctx.body);
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
    app.delete("/api/admin/promotions/:promotionId", (ctx) => {
        const authError = requireAdmin(ctx);
        if (authError)
            return authError;
        const promotionId = ctx.params.promotionId;
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
    app.get("/api/admin/audit-logs", (ctx) => {
        const authError = requireAdmin(ctx);
        if (authError)
            return authError;
        return { auditLogs: store.auditLogs };
    });
    return app;
}
