import { getRewardRecommendations } from "../services/loyalty.service";
export function registerRewardRoutes(app, store) {
    app.get("/api/rewards/suggestions", (ctx) => {
        const phone = ctx.query?.phone;
        if (!phone) {
            return new Response(JSON.stringify({ error: "Phone query is required." }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
        }
        return getRewardRecommendations(store, phone);
    });
    return app;
}
