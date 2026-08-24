import {
  claimPromotion,
  fetchAllPromotions,
  fetchPromotionById,
} from "../services/promotion.service";
import type { Promotion } from "../models/promo.model";

export function registerPromotionRoutes(app: any) {
  app.get("/api/promotions", async (ctx: any) => {
    const category = ctx.query?.category as string | undefined;
    const tier = ctx.query?.tier as string | undefined;
    const onlyActive = ctx.query?.onlyActive !== "false";

    let promotions: Promotion[] = await fetchAllPromotions(onlyActive);

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
          !p.applicableTiers ||
          p.applicableTiers?.length === 0,
      );
    }

    return {
      status: "success",
      count: promotions.length,
      data: promotions,
    };
  });

  app.get("/api/promotions/:id", async (ctx: any) => {
    const id = ctx.params?.id;
    const promo = await fetchPromotionById(id);
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

    const result = await claimPromotion(phone, promoId);
    if (!result.success) {
      return new Response(JSON.stringify({ error: result.message }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    return {
      status: "success",
      message: "Promotion successfully claimed!",
      claimedPromo: result.claimedPromo,
      pointsBalance: result.pointsBalance,
    };
  });

  return app;
}
