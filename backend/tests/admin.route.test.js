import { describe, expect, it } from "bun:test";
import { Elysia } from "elysia";
import { registerAdminRoutes } from "../src/routes/admin.route";
const ADMIN_TOKEN = "admin-secret";
describe("admin.route", () => {
    it("should reject unauthorized access", async () => {
        const store = {
            customers: [],
            tiers: [],
            rewardOffers: [],
            promotions: [],
            auditLogs: [],
            lastTierEvaluationDate: "2026-08-01",
        };
        const app = new Elysia();
        registerAdminRoutes(app, store);
        const response = await app.handle(new Request("http://localhost/api/admin/tiers", { method: "GET" }));
        expect(response.status).toBe(401);
    });
    it("should expose admin tiers and promotions with auth", async () => {
        const store = {
            customers: [],
            tiers: [],
            rewardOffers: [],
            promotions: [],
            auditLogs: [],
            lastTierEvaluationDate: "2026-08-01",
        };
        const app = new Elysia();
        registerAdminRoutes(app, store);
        const response = await app.handle(new Request("http://localhost/api/admin/tiers", {
            method: "GET",
            headers: { Authorization: `Bearer ${ADMIN_TOKEN}` },
        }));
        expect(response.status).toBe(200);
        const body = await response.json();
        expect(body).toHaveProperty("tiers");
    });
});
