import { getAllServices, getServiceById } from "../services/service.service";
import type { LoyaltyStore } from "../models/loyalty.model";

export function registerServiceRoutes(app: any, store: LoyaltyStore) {
  app.get("/api/services", (ctx: any) => {
    const onlyActive = ctx.query?.onlyActive !== "false";
    const services = getAllServices(store, onlyActive);
    return {
      status: "success",
      count: services.length,
      data: services,
    };
  });

  app.get("/api/services/:id", (ctx: any) => {
    const id = ctx.params?.id;
    const service = getServiceById(store, id);
    if (!service) {
      return new Response(JSON.stringify({ error: "Service not found." }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    return {
      status: "success",
      data: service,
    };
  });

  return app;
}
