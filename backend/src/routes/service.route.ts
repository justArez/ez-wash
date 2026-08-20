import {
  fetchAllServices,
  fetchServiceById,
} from "../services/service.service";

export function registerServiceRoutes(app: any) {
  app.get("/api/services", async (ctx: any) => {
    const onlyActive = ctx.query?.onlyActive !== "false";

    let services = await fetchAllServices(onlyActive);

    if (onlyActive) {
      services = services.filter((s) => s.status !== "INACTIVE");
    }

    return {
      status: "success",
      count: services.length,
      data: services,
    };
  });

  app.get("/api/services/:id", async (ctx: any) => {
    const id = ctx.params?.id;
    const service = await fetchServiceById(id);
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
