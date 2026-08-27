import {
  fetchAllTiers,
  createTierItem,
  updateTierItem,
  deleteTierItem,
} from "../services/tier.service";
import {
  fetchAllPromotions,
  createPromotionItem,
  updatePromotionItem,
  deletePromotionItem,
} from "../services/promotion.service";
import {
  fetchAllServices,
  createServiceItem,
  updateServiceItem,
  deleteServiceItem,
} from "../services/service.service";
import {
  adminCreateBooking,
  adminDeleteBooking,
  adminUpdateBooking,
  getAllBookings,
  getBookingById,
} from "../services/booking.service";
import {
  adjustCustomerPointsItem,
  createCustomerItem,
  fetchAllCustomers,
  fetchCustomerById,
  resetCustomerWarningsItem,
  updateCustomerItem,
} from "../services/customer.service";
import {
  createTierSetItem,
  deleteTierSetItem,
  fetchAllTierSets,
  updateTierSetItem,
} from "../services/tier-set.service";
import {
  createRewardOffer,
  deleteRewardOffer,
  fetchAllRewards,
} from "../services/reward.service";
import {
  fetchScheduleBlocks,
  createScheduleBlock,
  updateScheduleBlock,
  deleteScheduleBlock,
  type ScheduleBlock,
} from "../services/schedule.service";
import {
  fetchAllBankingInfo,
  createBankingInfoItem,
  updateBankingInfoItem,
  deleteBankingInfoItem,
} from "../services/banking.service";
import { getAdminDashboardData } from "../services/metric.service";
import { fetchAuditLogs, logAudit } from "../services/audit.service";
import type { LoyaltyCustomer } from "../models/customer.model";
import type { LoyaltyTier, TierSet } from "../models/tier.model";
import type { Promotion, RewardOffer } from "../models/promo.model";
import type { ServiceItem } from "../models/service.model";
import type {
  CreateBankingInfoInput,
  UpdateBankingInfoInput,
} from "../models/banking.model";

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

export function registerAdminRoutes(app: any) {
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
  app.get("/api/admin/dashboard/metrics", async (ctx: any) => {
    const authError = requireAdmin(ctx);
    if (authError) return authError;
    const data = await getAdminDashboardData();
    return {
      status: "success",
      data: data.metrics,
    };
  });

  app.get("/api/admin/dashboard/data", async (ctx: any) => {
    const authError = requireAdmin(ctx);
    if (authError) return authError;
    return {
      status: "success",
      data: await getAdminDashboardData(),
    };
  });

  // -------------------------------------------------------------
  // 3. BOOKINGS MANAGEMENT
  // -------------------------------------------------------------
  app.get("/api/admin/bookings", async (ctx: any) => {
    const authError = requireAdmin(ctx);
    if (authError) return authError;

    const query = ctx.query?.query || ctx.query?.q;
    const status = ctx.query?.status;
    const date = ctx.query?.date;
    const serviceId = ctx.query?.serviceId;

    const bookingsList = await getAllBookings({
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

  app.get("/api/admin/bookings/:id", async (ctx: any) => {
    const authError = requireAdmin(ctx);
    if (authError) return authError;

    const id = ctx.params.id;
    const match = await getBookingById(id);
    if (!match) {
      return new Response(JSON.stringify({ error: "Booking not found." }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const customer = await fetchCustomerById(match.customerId);
    return {
      status: "success",
      data: {
        ...match.booking,
        customerName: customer?.fullName || customer?.username,
        customerPhone: customer?.phone,
        customerTier: customer?.tierId,
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

    const booking = await adminCreateBooking(body);
    await logAudit({
      actor: "admin",
      actionType: "create-booking",
      entityType: "booking",
      entityId: booking.id,
      details: `Created booking for plate ${booking.vehiclePlate} on ${booking.date}`,
    });

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
    const booking = await adminUpdateBooking(id, body);
    if (!booking) {
      return new Response(JSON.stringify({ error: "Booking not found." }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    await logAudit({
      actor: "admin",
      actionType: "update-booking",
      entityType: "booking",
      entityId: booking.id,
      details: `Updated booking ${id} status to ${booking.status}`,
    });

    return {
      status: "success",
      data: booking,
    };
  });

  app.delete("/api/admin/bookings/:id", async (ctx: any) => {
    const authError = requireAdmin(ctx);
    if (authError) return authError;

    const id = ctx.params.id;
    const success = await adminDeleteBooking(id);
    if (!success) {
      return new Response(JSON.stringify({ error: "Booking not found." }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    await logAudit({
      actor: "admin",
      actionType: "delete-booking",
      entityType: "booking",
      entityId: id,
      details: `Deleted booking ${id}`,
    });

    return {
      status: "success",
      deleted: true,
    };
  });

  // -------------------------------------------------------------
  // 4. SERVICES MANAGEMENT
  // -------------------------------------------------------------
  app.get("/api/admin/services", async (ctx: any) => {
    const authError = requireAdmin(ctx);
    if (authError) return authError;

    const services = await fetchAllServices(false);

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

    const service = await createServiceItem(body);

    await logAudit({
      actor: "admin",
      actionType: "create-service",
      entityType: "service",
      entityId: service.id,
      details: `Created service package ${service.name}`,
    });

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
    const service = await updateServiceItem(id, body);
    if (!service) {
      return new Response(JSON.stringify({ error: "Service not found." }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    await logAudit({
      actor: "admin",
      actionType: "update-service",
      entityType: "service",
      entityId: service.id,
      details: `Updated service package ${service.name}`,
    });

    return {
      status: "success",
      data: service,
    };
  });

  app.delete("/api/admin/services/:id", async (ctx: any) => {
    const authError = requireAdmin(ctx);
    if (authError) return authError;

    const id = ctx.params.id;
    const success = await deleteServiceItem(id);
    if (!success) {
      return new Response(JSON.stringify({ error: "Service not found." }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    await logAudit({
      actor: "admin",
      actionType: "delete-service",
      entityType: "service",
      entityId: id,
      details: `Deleted service ${id}`,
    });

    return {
      status: "success",
      deleted: true,
    };
  });

  // -------------------------------------------------------------
  // 5. PROMOTIONS MANAGEMENT
  // -------------------------------------------------------------
  app.get("/api/admin/promotions", async (ctx: any) => {
    const authError = requireAdmin(ctx);
    if (authError) return authError;

    const promos = await fetchAllPromotions(false);

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

    const promotion = await createPromotionItem(body);

    await logAudit({
      actor: "admin",
      actionType: "create-promotion",
      entityType: "promotion",
      entityId: promotion.id,
      details: `Created promotion ${promotion.name}`,
    });

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
    const promotion = await updatePromotionItem(promotionId, body);
    if (!promotion) {
      return new Response(JSON.stringify({ error: "Promotion not found." }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    await logAudit({
      actor: "admin",
      actionType: "update-promotion",
      entityType: "promotion",
      entityId: promotion.id,
      details: `Updated promotion ${promotion.name}`,
    });

    return {
      status: "success",
      promotion,
      data: promotion,
    };
  });

  app.delete("/api/admin/promotions/:promotionId", async (ctx: any) => {
    const authError = requireAdmin(ctx);
    if (authError) return authError;

    const promotionId = ctx.params.promotionId as string;
    const success = await deletePromotionItem(promotionId);
    if (!success) {
      return new Response(JSON.stringify({ error: "Promotion not found." }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    await logAudit({
      actor: "admin",
      actionType: "delete-promotion",
      entityType: "promotion",
      entityId: promotionId,
      details: `Deleted promotion ${promotionId}`,
    });

    return {
      status: "success",
      deleted: success,
    };
  });

  // -------------------------------------------------------------
  // 6. TIER SETS & TIERS MANAGEMENT
  // -------------------------------------------------------------
  app.get("/api/admin/tier-sets", async (ctx: any) => {
    const authError = requireAdmin(ctx);
    if (authError) return authError;

    const sets = await fetchAllTierSets();

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
    const tierSet = await createTierSetItem(body);

    await logAudit({
      actor: "admin",
      actionType: "create-tier-set",
      entityType: "tier-set",
      entityId: tierSet.id,
      details: `Created tier set ${tierSet.name}`,
    });

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
    const tierSet = await updateTierSetItem(id, body);
    if (!tierSet) {
      return new Response(JSON.stringify({ error: "Tier set not found." }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    await logAudit({
      actor: "admin",
      actionType: "update-tier-set",
      entityType: "tier-set",
      entityId: tierSet.id,
      details: `Updated tier set ${tierSet.name}`,
    });

    return {
      status: "success",
      data: tierSet,
    };
  });

  app.delete("/api/admin/tier-sets/:id", async (ctx: any) => {
    const authError = requireAdmin(ctx);
    if (authError) return authError;

    const id = ctx.params.id;
    const success = await deleteTierSetItem(id);
    if (!success) {
      return new Response(JSON.stringify({ error: "Tier set not found." }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    await logAudit({
      actor: "admin",
      actionType: "delete-tier-set",
      entityType: "tier-set",
      entityId: id,
      details: `Deleted tier set ${id}`,
    });

    return {
      status: "success",
      deleted: true,
    };
  });

  app.get("/api/admin/tiers", async (ctx: any) => {
    const authError = requireAdmin(ctx);
    if (authError) return authError;

    const tiers = await fetchAllTiers();

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

    const tier = await createTierItem(body);

    await logAudit({
      actor: "admin",
      actionType: "create-tier",
      entityType: "tier",
      entityId: tier.id,
      details: `Created tier ${tier.name}`,
    });

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
    const tier = await updateTierItem(tierId, body);
    if (!tier) {
      return new Response(JSON.stringify({ error: "Tier not found." }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    await logAudit({
      actor: "admin",
      actionType: "update-tier",
      entityType: "tier",
      entityId: tier.id,
      details: `Updated tier ${tier.name}`,
    });

    return {
      status: "success",
      tier,
      data: tier,
    };
  });

  app.delete("/api/admin/tiers/:tierId", async (ctx: any) => {
    const authError = requireAdmin(ctx);
    if (authError) return authError;

    const tierId = ctx.params.tierId as string;
    const success = await deleteTierItem(tierId);
    if (!success) {
      return new Response(JSON.stringify({ error: "Tier not found." }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    await logAudit({
      actor: "admin",
      actionType: "delete-tier",
      entityType: "tier",
      entityId: tierId,
      details: `Deleted tier ${tierId}`,
    });

    return {
      status: "success",
      deleted: success,
    };
  });

  // -------------------------------------------------------------
  // 7. USER / CUSTOMER MANAGEMENT (CRU)
  // -------------------------------------------------------------
  app.get("/api/admin/users", async (ctx: any) => {
    const authError = requireAdmin(ctx);
    if (authError) return authError;

    const query = ctx.query?.query || ctx.query?.q;
    const tier = ctx.query?.tier;
    const status = ctx.query?.status;

    const customers = await fetchAllCustomers({ query, tier, status });
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
        c.status === "Blocked" ||
        (c.blockedUntil && new Date(c.blockedUntil) > new Date())
          ? "Blocked"
          : c.priorityStatus === "LOW_PRIORITIED"
            ? "Low Priority"
            : c.status === "Inactive"
              ? "Inactive"
              : "Active",
      blockedUntil: c.blockedUntil || null,
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

  app.get("/api/admin/users/:id", async (ctx: any) => {
    const authError = requireAdmin(ctx);
    if (authError) return authError;

    const id = ctx.params.id;
    const customer = await fetchCustomerById(id);

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
      const customer = await createCustomerItem(body);

      await logAudit({
        actor: "admin",
        actionType: "create-user",
        entityType: "customer",
        entityId: customer.id,
        details: `Created customer ${customer.phone}`,
      });

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
    const customer = await updateCustomerItem(id, body);
    if (!customer) {
      return new Response(JSON.stringify({ error: "User not found." }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    await logAudit({
      actor: "admin",
      actionType: "update-user",
      entityType: "customer",
      entityId: customer.id,
      details: `Updated user profile/tier for ${customer.phone}`,
    });

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

    const result = await adjustCustomerPointsItem(
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

    await logAudit({
      actor: "admin",
      actionType: "adjust-points",
      entityType: "customer",
      entityId: id,
      details: `Adjusted points: ${delta > 0 ? "+" : ""}${delta} pts. Reason: ${reason || "Manual adjustment"}`,
    });

    return {
      status: "success",
      data: result.customer,
      transaction: result.transaction,
    };
  });

  app.post("/api/admin/users/:id/reset-warnings", async (ctx: any) => {
    const authError = requireAdmin(ctx);
    if (authError) return authError;

    const id = ctx.params.id;
    const customer = await resetCustomerWarningsItem(id);
    if (!customer) {
      return new Response(JSON.stringify({ error: "User not found." }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    await logAudit({
      actor: "admin",
      actionType: "reset-warnings",
      entityType: "customer",
      entityId: id,
      details: `Reset late cancellation warning count and restored NORMAL priority for customer ${customer.phone}`,
    });

    return {
      status: "success",
      message: "Customer warning strikes reset successfully.",
      data: customer,
    };
  });

  // -------------------------------------------------------------
  // 8. REWARDS MANAGEMENT
  // -------------------------------------------------------------
  app.get("/api/admin/rewards", async (ctx: any) => {
    const authError = requireAdmin(ctx);
    if (authError) return authError;

    const offers = await fetchAllRewards();

    return {
      status: "success",
      count: offers.length,
      data: offers,
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

    const newOffer = await createRewardOffer(body);

    await logAudit({
      actor: "admin",
      actionType: "create-reward",
      entityType: "reward",
      entityId: newOffer.id,
      details: `Created reward offer ${newOffer.title}`,
    });

    return {
      status: "success",
      data: newOffer,
    };
  });

  app.delete("/api/admin/rewards/:id", async (ctx: any) => {
    const authError = requireAdmin(ctx);
    if (authError) return authError;

    const id = ctx.params.id;
    const success = await deleteRewardOffer(id);
    if (!success) {
      return new Response(
        JSON.stringify({ error: "Reward offer not found." }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    await logAudit({
      actor: "admin",
      actionType: "delete-reward",
      entityType: "reward",
      entityId: id,
      details: `Deleted reward offer ${id}`,
    });

    return {
      status: "success",
      deleted: true,
    };
  });

  // -------------------------------------------------------------
  // 9. SCHEDULE & SLOT BLOCKS
  // -------------------------------------------------------------
  app.get("/api/admin/schedule-blocks", async (ctx: any) => {
    const authError = requireAdmin(ctx);
    if (authError) return authError;

    const date = ctx.query?.date as string | undefined;
    const type = ctx.query?.type as string | undefined;
    const bayId = ctx.query?.bayId as string | undefined;

    const blocks = await fetchScheduleBlocks({ date, type, bayId });

    return {
      status: "success",
      count: blocks.length,
      data: blocks,
    };
  });

  app.post("/api/admin/schedule-blocks", async (ctx: any) => {
    const authError = requireAdmin(ctx);
    if (authError) return authError;

    const body = (await ctx.body) as any;
    if (!body?.type || !body?.title || !body?.startDate) {
      return new Response(
        JSON.stringify({
          error: "type, title, and startDate are required.",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const block = await createScheduleBlock(body);
    return {
      status: "success",
      data: block,
    };
  });

  app.put("/api/admin/schedule-blocks/:id", async (ctx: any) => {
    const authError = requireAdmin(ctx);
    if (authError) return authError;

    const id = ctx.params.id;
    const body = (await ctx.body) as Partial<ScheduleBlock>;
    const block = await updateScheduleBlock(id, body);
    if (!block) {
      return new Response(
        JSON.stringify({ error: "Schedule block not found." }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    return {
      status: "success",
      data: block,
    };
  });

  app.delete("/api/admin/schedule-blocks/:id", async (ctx: any) => {
    const authError = requireAdmin(ctx);
    if (authError) return authError;

    const id = ctx.params.id;
    const success = await deleteScheduleBlock(id);
    if (!success) {
      return new Response(
        JSON.stringify({ error: "Schedule block not found." }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    return {
      status: "success",
      deleted: true,
    };
  });

  // -------------------------------------------------------------
  // 10. BANKING INFO MANAGEMENT
  // -------------------------------------------------------------
  app.get("/api/admin/banking-info", async (ctx: any) => {
    const authError = requireAdmin(ctx);
    if (authError) return authError;

    const items = await fetchAllBankingInfo();

    return {
      status: "success",
      count: items.length,
      data: items,
    };
  });

  app.post("/api/admin/banking-info", async (ctx: any) => {
    const authError = requireAdmin(ctx);
    if (authError) return authError;

    const body = (await ctx.body) as CreateBankingInfoInput;
    if (
      !body?.bankName ||
      !body?.accountNumber ||
      !body?.accountHolder
    ) {
      return new Response(
        JSON.stringify({
          error:
            "bankName, accountNumber, and accountHolder are required.",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const newRecord = await createBankingInfoItem(body);

    await logAudit({
      actor: "admin",
      actionType: "create-banking-info",
      entityType: "banking_info",
      entityId: newRecord.id,
      details: `Created banking info for ${newRecord.bankName} (${newRecord.accountNumber})`,
    });

    return {
      status: "success",
      data: newRecord,
    };
  });

  app.put("/api/admin/banking-info/:id", async (ctx: any) => {
    const authError = requireAdmin(ctx);
    if (authError) return authError;

    const id = ctx.params.id;
    const body = (await ctx.body) as UpdateBankingInfoInput;
    const updatedRecord = await updateBankingInfoItem(id, body);
    if (!updatedRecord) {
      return new Response(
        JSON.stringify({ error: "Banking info record not found." }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    await logAudit({
      actor: "admin",
      actionType: "update-banking-info",
      entityType: "banking_info",
      entityId: id,
      details: `Updated banking info for ${updatedRecord.bankName} (${updatedRecord.accountNumber})`,
    });

    return {
      status: "success",
      data: updatedRecord,
    };
  });

  app.delete("/api/admin/banking-info/:id", async (ctx: any) => {
    const authError = requireAdmin(ctx);
    if (authError) return authError;

    const id = ctx.params.id;
    const success = await deleteBankingInfoItem(id);
    if (!success) {
      return new Response(
        JSON.stringify({ error: "Banking info record not found." }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    await logAudit({
      actor: "admin",
      actionType: "delete-banking-info",
      entityType: "banking_info",
      entityId: id,
      details: `Deleted banking info record ${id}`,
    });

    return {
      status: "success",
      deleted: true,
    };
  });

  // -------------------------------------------------------------
  // 11. AUDIT LOGS
  // -------------------------------------------------------------
  app.get("/api/admin/audit-logs", async (ctx: any) => {
    const authError = requireAdmin(ctx);
    if (authError) return authError;

    const logs = await fetchAuditLogs();

    return {
      status: "success",
      count: logs.length,
      auditLogs: logs,
      data: logs,
    };
  });

  return app;
}
