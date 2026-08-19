import {
  claimPromotion,
  getAllPromotions,
  getPromotionById,
} from "../services/promotion.service";
import { saveStore } from "../storage";
import type { LoyaltyStore } from "../models/loyalty.model";

export function registerPromotionRoutes(app: any, store: LoyaltyStore) {
  app.get("/api/promotions", (ctx: any) => {
    const category = ctx.query?.category as string | undefined;
    const tier = ctx.query?.tier as string | undefined;
    const onlyActive = ctx.query?.onlyActive !== "false";

    let promotions = getAllPromotions(store, onlyActive);

    if (category) {
      promotions = promotions.filter(
        (p) => p.category?.toLowerCase() === category.toLowerCase(),
      );
    }

    if (tier) {
      const tierLower = tier.toLowerCase();
      promotions = promotions.filter(
        (p) =>
          p.applicableTiers?.some((t) => t.toLowerCase() === tierLower) ||
          p.requiredTier?.toLowerCase() === tierLower ||
          p.applicableTiers?.length === 0,
      );
    }

    return {
      status: "success",
      count: promotions.length,
      data: promotions,
    };
  });

  app.get("/api/promotions/:id", (ctx: any) => {
    const id = ctx.params?.id;
    const promo = getPromotionById(store, id);
    if (!promo) {
      return new Response(JSON.stringify({ error: "Promotion not found." }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    return {
      status: "success",
      data: promo,
    };
  });

  app.post("/api/promotions/:id/claim", async (ctx: any) => {
    const promoId = ctx.params?.id;
    const { phone } = (await ctx.body) as { phone?: string };

    if (!phone) {
      return new Response(
        JSON.stringify({
          error: "Customer phone is required to claim a promotion.",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const result = claimPromotion(store, phone, promoId);
    if (!result.success) {
      return new Response(JSON.stringify({ error: result.message }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    saveStore(store);

    return {
      status: "success",
      message: "Promotion successfully claimed!",
      claimedPromo: result.claimedPromo,
      pointsBalance: result.pointsBalance,
    };
  });

  return app;
}
