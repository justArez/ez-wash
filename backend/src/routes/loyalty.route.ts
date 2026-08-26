import { fetchAllTiers, getTier } from "../services/tier.service";
import { fetchActiveBankingInfo } from "../services/banking.service";
import {
  buildDashboard,
  checkUsernameExists,
  fetchCustomerByIdentifier,
  linkCustomerAccount,
} from "../services/loyalty.service";
import {
  isValidVietnamesePlate,
  formatVietnamesePlate,
} from "../services/plate-validation";
import { signJwt, verifyJwt } from "../services/jwt.service";

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function isValidPhone(phone: string): boolean {
  const digits = phone.replace(/\D/g, "");
  return (
    /^[+]?[\d\s\-().]{7,20}$/.test(phone.trim()) &&
    digits.length >= 7 &&
    digits.length <= 15
  );
}

export { checkUsernameExists };

export function registerLoyaltyRoutes(app: any) {
  app.get("/api/loyalty/check-username", async (ctx: any) => {
    const rawUsername = ctx.query?.username as string | undefined;
    const username = rawUsername ? rawUsername.trim().toLowerCase() : undefined;
    console.log(
      `[LoyaltyController] GET /api/loyalty/check-username - username: "${username}"`,
    );
    if (!username) {
      return new Response(
        JSON.stringify({ error: "Username query parameter is required." }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const exists = await checkUsernameExists(username);
    console.log(`[LoyaltyController] Username "${username}" exists: ${exists}`);
    return {
      username,
      exists,
      available: !exists,
    };
  });

  app.post("/api/loyalty/link", async (ctx: any) => {
    const body = (await ctx.body) as {
      phone?: string;
      plate?: string;
      model?: string;
      type?: "car" | "motorcycle";
      username?: string;
      email?: string;
      fullName?: string;
      password?: string;
    };
    const { phone, plate, model, type, fullName, password } = body;
    const username = body.username
      ? body.username.trim().toLowerCase()
      : undefined;
    const email = body.email ? body.email.trim().toLowerCase() : undefined;

    console.log(
      `[LoyaltyController] POST /api/loyalty/link - username: "${username}", phone: "${phone}", email: "${email}"`,
    );

    if (!phone && !email) {
      return new Response(
        JSON.stringify({
          error:
            "At least one contact method (email or phone number) is required.",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    if (email && !isValidEmail(email)) {
      return new Response(
        JSON.stringify({ error: "Invalid email address format." }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    if (phone && !isValidPhone(phone)) {
      return new Response(
        JSON.stringify({ error: "Invalid phone number format." }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    if (plate && !isValidVietnamesePlate(plate)) {
      return new Response(
        JSON.stringify({
          error:
            "Invalid Vietnamese license plate format (e.g., 30A-123.45, 59P1-123.45).",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    if (username && (await checkUsernameExists(username))) {
      return new Response(
        JSON.stringify({
          error: "Username already exists. Please choose a different username.",
        }),
        {
          status: 409,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    try {
      const customer = await linkCustomerAccount(
        phone || "",
        plate,
        model,
        type,
        {
          username,
          email,
          fullName,
          password,
        },
      );

      const tier = getTier(customer.tierId);
      console.log(
        `[LoyaltyController] Successfully linked/registered customer ID: ${customer.id}`,
      );

      const token = signJwt({
        customerId: customer.id,
        username: customer.username || "",
        phone: customer.phone,
        email: customer.email || undefined,
        fullName: customer.fullName || undefined,
      });

      return {
        token,
        customerId: customer.id,
        phone: customer.phone,
        username: customer.username,
        tier,
        pointsBalance: customer.pointsBalance,
        vehicles: customer.vehicles,
        fullName: customer.fullName,
        email: customer.email,
      };
    } catch (err: any) {
      console.error("[LoyaltyController] Error in linkAccount handler:", err);
      return new Response(
        JSON.stringify({ error: err?.message || "Internal server error." }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      );
    }
  });

  app.get("/api/loyalty/dashboard", async (ctx: any) => {
    const phone = ctx.query?.phone as string | undefined;
    const password = ctx.query?.password as string | undefined;
    console.log(
      `[LoyaltyController] GET /api/loyalty/dashboard - identifier: "${phone}"`,
    );
    if (!phone) {
      return new Response(
        JSON.stringify({ error: "Phone query is required." }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const customer = await fetchCustomerByIdentifier(phone);
    if (!customer) {
      console.warn(
        `[LoyaltyController] Customer not found for identifier: "${phone}"`,
      );
      return new Response(JSON.stringify({ error: "Customer not found." }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // If customer has a set password and password was provided for login, verify it
    if (
      customer.password &&
      password &&
      customer.password !== password.trim()
    ) {
      console.warn(
        `[LoyaltyController] Invalid password attempt for user: "${phone}"`,
      );
      return new Response(JSON.stringify({ error: "Invalid password." }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const dashboard = await buildDashboard(phone);
    if (!dashboard) {
      console.warn(
        `[LoyaltyController] Dashboard not found for identifier: "${phone}"`,
      );
      return new Response(JSON.stringify({ error: "Customer not found." }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const token = signJwt({
      customerId: customer.id,
      username: customer.username || "",
      phone: customer.phone,
      email: customer.email || undefined,
      fullName: customer.fullName || undefined,
    });

    return {
      ...dashboard,
      token,
    };
  });

  // Quick lookup endpoint for booking modal auto-fill
  app.get("/api/loyalty/customer", async (ctx: any) => {
    const phone = ctx.query?.phone as string | undefined;
    console.log(
      `[LoyaltyController] GET /api/loyalty/customer - identifier: "${phone}"`,
    );
    if (!phone) {
      return new Response(
        JSON.stringify({ error: "Phone query parameter is required." }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const customer = await fetchCustomerByIdentifier(phone);

    if (!customer) {
      return new Response(JSON.stringify({ error: "Customer not found." }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const tier = getTier(customer.tierId);

    return {
      id: customer.id,
      phone: customer.phone,
      fullName: customer.fullName,
      email: customer.email,
      tier,
      tierId: customer.tierId,
      pointsBalance: customer.pointsBalance,
      vehicles: customer.vehicles,
      priorityStatus: customer.priorityStatus,
    };
  });

  // Get claimed promo vouchers for customer
  app.get("/api/loyalty/claimed-promos", async (ctx: any) => {
    const phone = ctx.query?.phone as string | undefined;
    if (!phone) {
      return new Response(
        JSON.stringify({ error: "Phone query parameter is required." }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const customer = await fetchCustomerByIdentifier(phone);

    if (!customer) {
      return new Response(JSON.stringify({ error: "Customer not found." }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    return {
      status: "success",
      count: (customer.claimedPromos || []).length,
      data: customer.claimedPromos || [],
    };
  });

  // JWT session refresh endpoint (called when user takes action to refresh 1h session)
  app.post("/api/auth/refresh", async (ctx: any) => {
    let authHeader = "";
    if (ctx.headers?.get) {
      authHeader =
        ctx.headers.get("authorization") ||
        ctx.headers.get("Authorization") ||
        "";
    } else if (ctx.headers) {
      authHeader =
        ctx.headers["authorization"] || ctx.headers["Authorization"] || "";
    }

    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7).trim()
      : ctx.body?.token?.trim() || "";

    if (!token) {
      return new Response(
        JSON.stringify({ error: "No token provided for refresh." }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const verification = verifyJwt(token);
    if (!verification.valid || !verification.payload) {
      return new Response(
        JSON.stringify({
          error: verification.error || "Invalid or expired token.",
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Generate new refreshed token with fresh 1-hour expiration
    const newToken = signJwt({
      customerId: verification.payload.customerId,
      username: verification.payload.username,
      phone: verification.payload.phone,
      email: verification.payload.email,
      fullName: verification.payload.fullName,
      role: verification.payload.role,
    });

    const now = Math.floor(Date.now() / 1000);
    return {
      token: newToken,
      expiresIn: 3600,
      expiresAt: now + 3600,
      user: {
        customerId: verification.payload.customerId,
        username: verification.payload.username,
        phone: verification.payload.phone,
        email: verification.payload.email,
        fullName: verification.payload.fullName,
      },
    };
  });

  // Verify token endpoint to check session validity
  app.get("/api/auth/verify", async (ctx: any) => {
    let authHeader = "";
    if (ctx.headers?.get) {
      authHeader =
        ctx.headers.get("authorization") ||
        ctx.headers.get("Authorization") ||
        "";
    } else if (ctx.headers) {
      authHeader =
        ctx.headers["authorization"] || ctx.headers["Authorization"] || "";
    }

    const token = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7).trim()
      : (ctx.query?.token as string | undefined)?.trim() || "";

    if (!token) {
      return new Response(
        JSON.stringify({ valid: false, error: "No token provided." }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const verification = verifyJwt(token);
    if (!verification.valid || !verification.payload) {
      return new Response(
        JSON.stringify({
          valid: false,
          error: verification.error || "Invalid or expired token.",
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    return {
      valid: true,
      user: verification.payload,
    };
  });

  // Public tiers catalog
  app.get("/api/tiers", async () => {
    const tiers = await fetchAllTiers();
    return {
      status: "success",
      count: tiers.length,
      data: tiers,
    };
  });

  // Public banking info for deposit modal
  app.get("/api/banking-info", async () => {
    const banking = await fetchActiveBankingInfo();
    return {
      status: "success",
      data: banking,
    };
  });

  return app;
}
