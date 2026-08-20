import { getRewardRecommendations } from "../services/loyalty.service";
import { fetchAllRewards } from "../services/reward.service";

export function registerRewardRoutes(app: any) {
  app.get("/api/rewards", async () => {
    const offers = await fetchAllRewards();

    return {
      status: "success",
      count: offers.length,
      data: offers,
    };
  });

  app.get("/api/rewards/suggestions", async (ctx: any) => {
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

    return getRewardRecommendations(phone);
  });

  return app;
}
