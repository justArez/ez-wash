import { getTier } from "../services/tier.service";
import { buildDashboard, linkAccount } from "../services/loyalty.service";
import { saveStore } from "../storage";
export function registerLoyaltyRoutes(app, store) {
    app.post("/api/loyalty/link", async (ctx) => {
        const { phone, plate, model, type } = (await ctx.body);
        if (!phone || !plate || !model || !type) {
            return new Response(JSON.stringify({ error: "Missing required fields." }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
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
    app.get("/api/loyalty/dashboard", (ctx) => {
        const phone = ctx.query?.phone;
        if (!phone) {
            return new Response(JSON.stringify({ error: "Phone query is required." }), {
                status: 400,
                headers: { "Content-Type": "application/json" },
            });
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
