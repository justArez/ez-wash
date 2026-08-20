import { getRewardRecommendations } from "../services/loyalty.service";
import { fetchAllRewards } from "../services/reward.service";
import type { LoyaltyStore } from "../models/loyalty.model";

export function registerRewardRoutes(app: any, store: LoyaltyStore) {
  app.get("/api/rewards", async () => {
    const offers = await fetchAllRewards(store);

    return {
      status: "success",
      count: offers.length,
      data: offers,
    };
  });

  app.get("/api/rewards/suggestions", (ctx: any) => {
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

    return getRewardRecommendations(store, phone);
  });

  return app;
}
