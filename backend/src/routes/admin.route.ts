import {
  createTier,
  deleteTier,
  getAllTiers,
  updateTier,
} from "../services/tier.service";
import {
  createPromotion,
  deletePromotion,
  getAllPromotions,
  getPromotionById,
  updatePromotion,
} from "../services/promotion.service";
import {
  createService,
  deleteService,
  getAllServices,
  getServiceById,
  updateService,
} from "../services/service.service";
import {
  adminCreateBooking,
  adminDeleteBooking,
  adminUpdateBooking,
  getAllBookings,
  getBookingById,
} from "../services/booking.service";
import {
  adjustCustomerPoints,
  createCustomer,
  getAllCustomers,
  getCustomerById,
  resetCustomerWarnings,
  updateCustomer,
} from "../services/customer.service";
import {
  createTierSet,
  deleteTierSet,
  getAllTierSets,
  getTierSetById,
  updateTierSet,
} from "../services/tier-set.service";
import { getAdminDashboardData } from "../services/metric.service";
import { logAudit } from "../services/audit.service";
import { saveStore } from "../storage";
import type {
  LoyaltyCustomer,
  LoyaltyStore,
  LoyaltyTier,
  Promotion,
  RewardOffer,
  ServiceItem,
  TierSet,
} from "../models/loyalty.model";

const ADMIN_TOKEN = process.env.ADMIN_TOKEN || "admin-secret";

function getHeaderValue(ctx: any, key: string) {
  const headers = ctx.headers ?? ctx.request?.headers;
  if (!headers) {
    return undefined;
  }
  if (typeof headers.get === "function") {
    return headers.get(key);
  }
  return headers[key] || headers[key.toLowerCase()];
}

function requireAdmin(ctx: any) {
  const authHeader = getHeaderValue(ctx, "authorization");
  const token =
    authHeader?.split("Bearer ")?.[1] || getHeaderValue(ctx, "x-admin-token");
  if (token !== ADMIN_TOKEN) {
    return new Response(
      JSON.stringify({ error: "Unauthorized admin access." }),
      {
        status: 401,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
  return null;
}

export function registerAdminRoutes(app: any, store: LoyaltyStore) {
  // -------------------------------------------------------------
  // 1. ADMIN AUTHENTICATION
  // -------------------------------------------------------------
  app.post("/api/admin/login", async (ctx: any) => {
    const body = (await ctx.body) as {
      token?: string;
      username?: string;
      password?: string;
    };
    const token = body?.token?.trim();
    const username = body?.username?.trim();
    const password = body?.password?.trim();

    // Check either token or username/password
    const isValidToken = token && token === ADMIN_TOKEN;
    const isValidCredentials =
      username === "admin" &&
      (password === "admin123" || password === ADMIN_TOKEN);

    if (!isValidToken && !isValidCredentials) {
      return new Response(
        JSON.stringify({ error: "Invalid admin credentials or token." }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    return {
      success: true,
      adminUserInfo: {
        token: ADMIN_TOKEN,
        role: "admin",
        username: username || "Administrator",
      },
    };
  });

  // -------------------------------------------------------------
  // 2. DASHBOARD METRICS
  // -------------------------------------------------------------
  app.get("/api/admin/dashboard/metrics", (ctx: any) => {
    const authError = requireAdmin(ctx);
    if (authError) return authError;
    const data = getAdminDashboardData(store);
    return {
      status: "success",
      data: data.metrics,
    };
  });

  app.get("/api/admin/dashboard/data", (ctx: any) => {
    const authError = requireAdmin(ctx);
    if (authError) return authError;
    return {
      status: "success",
      data: getAdminDashboardData(store),
    };
  });

  // -------------------------------------------------------------
  // 3. BOOKINGS MANAGEMENT
  // -------------------------------------------------------------
  app.get("/api/admin/bookings", (ctx: any) => {
    const authError = requireAdmin(ctx);
    if (authError) return authError;

    const query = ctx.query?.query || ctx.query?.q;
    const status = ctx.query?.status;
    const date = ctx.query?.date;
    const serviceId = ctx.query?.serviceId;

    const bookingsList = getAllBookings(store, {
      query,
      status,
      date,
      serviceId,
    });
    return {
      status: "success",
      count: bookingsList.length,
      data: bookingsList,
    };
  });

  app.get("/api/admin/bookings/:id", (ctx: any) => {
    const authError = requireAdmin(ctx);
    if (authError) return authError;

    const id = ctx.params.id;
    const match = getBookingById(store, id);
    if (!match) {
      return new Response(JSON.stringify({ error: "Booking not found." }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    return {
      status: "success",
      data: {
        ...match.booking,
        customerName: match.customer.fullName || match.customer.username,
        customerPhone: match.customer.phone,
        customerTier: match.customer.tierId,
      },
    };
  });

  app.post("/api/admin/bookings", async (ctx: any) => {
    const authError = requireAdmin(ctx);
    if (authError) return authError;

    const body = (await ctx.body) as any;
    if (!body?.phone || !body?.vehiclePlate || !body?.date) {
      return new Response(
        JSON.stringify({
          error: "phone, vehiclePlate, and date are required.",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const booking = adminCreateBooking(store, body);
    logAudit(store, {
      actor: "admin",
      actionType: "create-booking",
      entityType: "booking",
      entityId: booking.id,
      details: `Created booking for plate ${booking.vehiclePlate} on ${booking.date}`,
    });

    saveStore(store);
    return {
      status: "success",
      data: booking,
    };
  });

  app.put("/api/admin/bookings/:id", async (ctx: any) => {
    const authError = requireAdmin(ctx);
    if (authError) return authError;

    const id = ctx.params.id;
    const body = (await ctx.body) as any;
    const booking = adminUpdateBooking(store, id, body);
    if (!booking) {
      return new Response(JSON.stringify({ error: "Booking not found." }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    logAudit(store, {
      actor: "admin",
      actionType: "update-booking",
      entityType: "booking",
      entityId: booking.id,
      details: `Updated booking ${id} status to ${booking.status}`,
    });

    saveStore(store);
    return {
      status: "success",
      data: booking,
    };
  });

  app.delete("/api/admin/bookings/:id", (ctx: any) => {
    const authError = requireAdmin(ctx);
    if (authError) return authError;

    const id = ctx.params.id;
    const success = adminDeleteBooking(store, id);
    if (!success) {
      return new Response(JSON.stringify({ error: "Booking not found." }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    logAudit(store, {
      actor: "admin",
      actionType: "delete-booking",
      entityType: "booking",
      entityId: id,
      details: `Deleted booking ${id}`,
    });

    saveStore(store);
    return {
      status: "success",
      deleted: true,
    };
  });

  // -------------------------------------------------------------
  // 4. SERVICES MANAGEMENT
  // -------------------------------------------------------------
  app.get("/api/admin/services", (ctx: any) => {
    const authError = requireAdmin(ctx);
    if (authError) return authError;

    const services = getAllServices(store, false);
    return {
      status: "success",
      count: services.length,
      data: services,
    };
  });

  app.post("/api/admin/services", async (ctx: any) => {
    const authError = requireAdmin(ctx);
    if (authError) return authError;

    const body = (await ctx.body) as Partial<ServiceItem>;
    if (
      !body?.name ||
      body?.price === undefined ||
      body?.durationMinutes === undefined
    ) {
      return new Response(
        JSON.stringify({
          error: "name, price, and durationMinutes are required.",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const service = createService(store, body);
    logAudit(store, {
      actor: "admin",
      actionType: "create-service",
      entityType: "service",
      entityId: service.id,
      details: `Created service package ${service.name}`,
    });

    saveStore(store);
    return {
      status: "success",
      data: service,
    };
  });

  app.put("/api/admin/services/:id", async (ctx: any) => {
    const authError = requireAdmin(ctx);
    if (authError) return authError;

    const id = ctx.params.id;
    const body = (await ctx.body) as Partial<ServiceItem>;
    const service = updateService(store, id, body);
    if (!service) {
      return new Response(JSON.stringify({ error: "Service not found." }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    logAudit(store, {
      actor: "admin",
      actionType: "update-service",
      entityType: "service",
      entityId: service.id,
      details: `Updated service package ${service.name}`,
    });

    saveStore(store);
    return {
      status: "success",
      data: service,
    };
  });

  app.delete("/api/admin/services/:id", (ctx: any) => {
    const authError = requireAdmin(ctx);
    if (authError) return authError;

    const id = ctx.params.id;
    const success = deleteService(store, id);
    if (!success) {
      return new Response(JSON.stringify({ error: "Service not found." }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    logAudit(store, {
      actor: "admin",
      actionType: "delete-service",
      entityType: "service",
      entityId: id,
      details: `Deleted service ${id}`,
    });

    saveStore(store);
    return {
      status: "success",
      deleted: true,
    };
  });

  // -------------------------------------------------------------
  // 5. PROMOTIONS MANAGEMENT
  // -------------------------------------------------------------
  app.get("/api/admin/promotions", (ctx: any) => {
    const authError = requireAdmin(ctx);
    if (authError) return authError;
    const promos = getAllPromotions(store, false);
    return {
      status: "success",
      count: promos.length,
      promotions: promos,
      data: promos,
    };
  });

  app.post("/api/admin/promotions", async (ctx: any) => {
    const authError = requireAdmin(ctx);
    if (authError) return authError;

    const body = (await ctx.body) as Partial<Promotion>;
    if (!body?.name && !(body as any)?.promoName) {
      return new Response(
        JSON.stringify({ error: "Promotion name is required." }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
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
    return {
      status: "success",
      promotion,
      data: promotion,
    };
  });

  app.put("/api/admin/promotions/:promotionId", async (ctx: any) => {
    const authError = requireAdmin(ctx);
    if (authError) return authError;

    const promotionId = ctx.params.promotionId as string;
    const body = (await ctx.body) as Partial<Promotion>;
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
    return {
      status: "success",
      promotion,
      data: promotion,
    };
  });

  app.delete("/api/admin/promotions/:promotionId", (ctx: any) => {
    const authError = requireAdmin(ctx);
    if (authError) return authError;

    const promotionId = ctx.params.promotionId as string;
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
    return {
      status: "success",
      deleted: success,
    };
  });

  // -------------------------------------------------------------
  // 6. TIER SETS & TIERS MANAGEMENT
  // -------------------------------------------------------------
  app.get("/api/admin/tier-sets", (ctx: any) => {
    const authError = requireAdmin(ctx);
    if (authError) return authError;
    const sets = getAllTierSets(store);
    return {
      status: "success",
      count: sets.length,
      data: sets,
    };
  });

  app.post("/api/admin/tier-sets", async (ctx: any) => {
    const authError = requireAdmin(ctx);
    if (authError) return authError;

    const body = (await ctx.body) as Partial<TierSet>;
    const tierSet = createTierSet(store, body);
    logAudit(store, {
      actor: "admin",
      actionType: "create-tier-set",
      entityType: "tier-set",
      entityId: tierSet.id,
      details: `Created tier set ${tierSet.name}`,
    });

    saveStore(store);
    return {
      status: "success",
      data: tierSet,
    };
  });

  app.put("/api/admin/tier-sets/:id", async (ctx: any) => {
    const authError = requireAdmin(ctx);
    if (authError) return authError;

    const id = ctx.params.id;
    const body = (await ctx.body) as Partial<TierSet>;
    const tierSet = updateTierSet(store, id, body);
    if (!tierSet) {
      return new Response(JSON.stringify({ error: "Tier set not found." }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    logAudit(store, {
      actor: "admin",
      actionType: "update-tier-set",
      entityType: "tier-set",
      entityId: tierSet.id,
      details: `Updated tier set ${tierSet.name}`,
    });

    saveStore(store);
    return {
      status: "success",
      data: tierSet,
    };
  });

  app.delete("/api/admin/tier-sets/:id", (ctx: any) => {
    const authError = requireAdmin(ctx);
    if (authError) return authError;

    const id = ctx.params.id;
    const success = deleteTierSet(store, id);
    if (!success) {
      return new Response(JSON.stringify({ error: "Tier set not found." }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    logAudit(store, {
      actor: "admin",
      actionType: "delete-tier-set",
      entityType: "tier-set",
      entityId: id,
      details: `Deleted tier set ${id}`,
    });

    saveStore(store);
    return {
      status: "success",
      deleted: true,
    };
  });

  app.get("/api/admin/tiers", (ctx: any) => {
    const authError = requireAdmin(ctx);
    if (authError) return authError;
    const tiers = getAllTiers(store);
    return {
      status: "success",
      tiers,
      data: tiers,
    };
  });

  app.post("/api/admin/tiers", async (ctx: any) => {
    const authError = requireAdmin(ctx);
    if (authError) return authError;

    const body = (await ctx.body) as Partial<LoyaltyTier>;
    const required = [
      "name",
      "bookingWindowDays",
      "pointRate",
      "perks",
      "description",
      "isActive",
    ];
    for (const field of required) {
      if (body[field as keyof LoyaltyTier] === undefined) {
        return new Response(
          JSON.stringify({ error: `${field} is required.` }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          },
        );
      }
    }

    const tier = createTier(store, body as LoyaltyTier);
    logAudit(store, {
      actor: "admin",
      actionType: "create-tier",
      entityType: "tier",
      entityId: tier.id,
      details: `Created tier ${tier.name}`,
    });

    saveStore(store);
    return {
      status: "success",
      tier,
      data: tier,
    };
  });

  app.put("/api/admin/tiers/:tierId", async (ctx: any) => {
    const authError = requireAdmin(ctx);
    if (authError) return authError;

    const tierId = ctx.params.tierId as string;
    const body = (await ctx.body) as Partial<LoyaltyTier>;
    const tier = updateTier(store, tierId, body as Partial<LoyaltyTier>);
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
    return {
      status: "success",
      tier,
      data: tier,
    };
  });

  app.delete("/api/admin/tiers/:tierId", (ctx: any) => {
    const authError = requireAdmin(ctx);
    if (authError) return authError;

    const tierId = ctx.params.tierId as string;
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
    return {
      status: "success",
      deleted: success,
    };
  });

  // -------------------------------------------------------------
  // 7. USER / CUSTOMER MANAGEMENT (CRU)
  // -------------------------------------------------------------
  app.get("/api/admin/users", (ctx: any) => {
    const authError = requireAdmin(ctx);
    if (authError) return authError;

    const query = ctx.query?.query || ctx.query?.q;
    const tier = ctx.query?.tier;
    const status = ctx.query?.status;

    const customers = getAllCustomers(store, { query, tier, status });
    const formatted = customers.map((c) => ({
      id: c.id,
      name: c.fullName || c.username || `Customer (${c.phone})`,
      email: c.email || `${c.phone.replace(/[^0-9]/g, "")}@customer.ezwash.com`,
      phone: c.phone,
      mostActiveVehicle: c.vehicles?.[0]
        ? `${c.vehicles[0].plate} (${c.vehicles[0].model})`
        : "No vehicle",
      points: c.pointsBalance,
      status:
        c.priorityStatus === "LOW_PRIORITIED"
          ? "Low Priority"
          : c.status === "Inactive"
            ? "Inactive"
            : "Active",
      tier: c.tierId
        ? ((c.tierId.charAt(0).toUpperCase() + c.tierId.slice(1)) as any)
        : "Member",
      vehicles: c.vehicles,
      bookingCount: (c.bookingHistory || []).length,
    }));

    return {
      status: "success",
      count: formatted.length,
      data: formatted,
    };
  });

  app.get("/api/admin/users/:id", (ctx: any) => {
    const authError = requireAdmin(ctx);
    if (authError) return authError;

    const id = ctx.params.id;
    const customer = getCustomerById(store, id);
    if (!customer) {
      return new Response(JSON.stringify({ error: "User not found." }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    return {
      status: "success",
      data: customer,
    };
  });

  app.post("/api/admin/users", async (ctx: any) => {
    const authError = requireAdmin(ctx);
    if (authError) return authError;

    const body = (await ctx.body) as any;
    if (!body?.phone) {
      return new Response(JSON.stringify({ error: "Phone is required." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    try {
      const customer = createCustomer(store, body);
      logAudit(store, {
        actor: "admin",
        actionType: "create-user",
        entityType: "customer",
        entityId: customer.id,
        details: `Created customer ${customer.phone}`,
      });

      saveStore(store);
      return {
        status: "success",
        data: customer,
      };
    } catch (e: any) {
      return new Response(JSON.stringify({ error: e.message }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
  });

  app.put("/api/admin/users/:id", async (ctx: any) => {
    const authError = requireAdmin(ctx);
    if (authError) return authError;

    const id = ctx.params.id;
    const body = (await ctx.body) as Partial<LoyaltyCustomer>;
    const customer = updateCustomer(store, id, body);
    if (!customer) {
      return new Response(JSON.stringify({ error: "User not found." }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    logAudit(store, {
      actor: "admin",
      actionType: "update-user",
      entityType: "customer",
      entityId: customer.id,
      details: `Updated user profile/tier for ${customer.phone}`,
    });

    saveStore(store);
    return {
      status: "success",
      data: customer,
    };
  });

  app.post("/api/admin/users/:id/adjust-points", async (ctx: any) => {
    const authError = requireAdmin(ctx);
    if (authError) return authError;

    const id = ctx.params.id;
    const { delta, reason } = (await ctx.body) as {
      delta: number;
      reason?: string;
    };

    if (delta === undefined || typeof delta !== "number") {
      return new Response(
        JSON.stringify({ error: "delta number is required." }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const result = adjustCustomerPoints(
      store,
      id,
      delta,
      reason || "Admin manual adjustment",
    );
    if (!result) {
      return new Response(JSON.stringify({ error: "User not found." }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    logAudit(store, {
      actor: "admin",
      actionType: "adjust-points",
      entityType: "customer",
      entityId: id,
      details: `Adjusted points: ${delta > 0 ? "+" : ""}${delta} pts. Reason: ${reason || "Manual adjustment"}`,
    });

    saveStore(store);
    return {
      status: "success",
      data: result.customer,
      transaction: result.transaction,
    };
  });

  app.post("/api/admin/users/:id/reset-warnings", (ctx: any) => {
    const authError = requireAdmin(ctx);
    if (authError) return authError;

    const id = ctx.params.id;
    const customer = resetCustomerWarnings(store, id);
    if (!customer) {
      return new Response(JSON.stringify({ error: "User not found." }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    logAudit(store, {
      actor: "admin",
      actionType: "reset-warnings",
      entityType: "customer",
      entityId: id,
      details: `Reset late cancellation warning count and restored NORMAL priority for customer ${customer.phone}`,
    });

    saveStore(store);
    return {
      status: "success",
      message: "Customer warning strikes reset successfully.",
      data: customer,
    };
  });

  // -------------------------------------------------------------
  // 8. REWARDS MANAGEMENT
  // -------------------------------------------------------------
  app.get("/api/admin/rewards", (ctx: any) => {
    const authError = requireAdmin(ctx);
    if (authError) return authError;
    return {
      status: "success",
      count: store.rewardOffers.length,
      data: store.rewardOffers,
    };
  });

  app.post("/api/admin/rewards", async (ctx: any) => {
    const authError = requireAdmin(ctx);
    if (authError) return authError;

    const body = (await ctx.body) as Partial<RewardOffer>;
    if (!body?.title || body?.pointsRequired === undefined) {
      return new Response(
        JSON.stringify({ error: "title and pointsRequired are required." }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const newOffer: RewardOffer = {
      id: body.id?.trim() || `reward-${Date.now()}`,
      title: body.title.trim(),
      description: body.description?.trim() || "",
      pointsRequired: body.pointsRequired,
      eligibleTiers: body.eligibleTiers || ["silver", "gold", "platinum"],
      vehicleTypes: body.vehicleTypes,
    };

    store.rewardOffers.push(newOffer);
    logAudit(store, {
      actor: "admin",
      actionType: "create-reward",
      entityType: "reward",
      entityId: newOffer.id,
      details: `Created reward offer ${newOffer.title}`,
    });

    saveStore(store);
    return {
      status: "success",
      data: newOffer,
    };
  });

  app.delete("/api/admin/rewards/:id", (ctx: any) => {
    const authError = requireAdmin(ctx);
    if (authError) return authError;

    const id = ctx.params.id;
    const idx = store.rewardOffers.findIndex((r) => r.id === id);
    if (idx === -1) {
      return new Response(
        JSON.stringify({ error: "Reward offer not found." }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    store.rewardOffers.splice(idx, 1);
    logAudit(store, {
      actor: "admin",
      actionType: "delete-reward",
      entityType: "reward",
      entityId: id,
      details: `Deleted reward offer ${id}`,
    });

    saveStore(store);
    return {
      status: "success",
      deleted: true,
    };
  });

  // -------------------------------------------------------------
  // 9. AUDIT LOGS
  // -------------------------------------------------------------
  app.get("/api/admin/audit-logs", (ctx: any) => {
    const authError = requireAdmin(ctx);
    if (authError) return authError;
    return {
      status: "success",
      count: store.auditLogs.length,
      auditLogs: store.auditLogs.slice().reverse(),
      data: store.auditLogs.slice().reverse(),
    };
  });

  return app;
}
