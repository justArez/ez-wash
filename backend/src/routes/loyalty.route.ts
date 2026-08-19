import { sql } from "drizzle-orm";
import { db, schema } from "../db/index";
import { getAllTiers, getTier } from "../services/tier.service";
import {
  buildDashboard,
  findCustomer,
  linkAccount,
} from "../services/loyalty.service";
import { saveStore } from "../storage";
import type { LoyaltyStore } from "../models/loyalty.model";

export async function checkUsernameExists(
  store: LoyaltyStore,
  username: string,
): Promise<boolean> {
  const normalized = username.trim().toLowerCase();
  if (!normalized) return false;

  // Check in store
  const foundInStore = store.customers.some(
    (c) => c.username && c.username.trim().toLowerCase() === normalized,
  );
  if (foundInStore) return true;

  // Check in Postgres DB if connected
  if (db) {
    try {
      const rows = await db
        .select({ id: schema.loyaltyCustomers.id })
        .from(schema.loyaltyCustomers)
        .where(sql`lower(${schema.loyaltyCustomers.username}) = ${normalized}`)
        .limit(1);
      if (rows && rows.length > 0) return true;
    } catch (err) {
      console.warn("DB check-username query error:", err);
    }
  }

  return false;
}

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

export function registerLoyaltyRoutes(app: any, store: LoyaltyStore) {
  app.get("/api/loyalty/check-username", async (ctx: any) => {
    const username = ctx.query?.username as string | undefined;
    console.log(
      `[LoyaltyController] GET /api/loyalty/check-username - username: "${username}"`,
    );
    if (!username || !username.trim()) {
      return new Response(
        JSON.stringify({ error: "Username query parameter is required." }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const exists = await checkUsernameExists(store, username.trim());
    console.log(
      `[LoyaltyController] Username "${username.trim()}" exists in DB/Store: ${exists}`,
    );
    return {
      username: username.trim(),
      exists,
      available: !exists,
    };
  });

  app.post("/api/loyalty/link", async (ctx: any) => {
    const { phone, plate, model, type, username, email, fullName, password } =
      (await ctx.body) as {
        phone?: string;
        plate?: string;
        model?: string;
        type?: "car" | "motorcycle";
        username?: string;
        email?: string;
        fullName?: string;
        password?: string;
      };

    console.log(
      `[LoyaltyController] POST /api/loyalty/link - username: "${username}", phone: "${phone}", email: "${email}"`,
    );

    if (!phone && !email && !username) {
      return new Response(
        JSON.stringify({
          error: "Missing required contact or username field.",
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

    if (username && (await checkUsernameExists(store, username))) {
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
      const customer = linkAccount(store, phone || "", plate, model, type, {
        username,
        email,
        fullName,
        password,
      });
      saveStore(store);

      // If Postgres DB is configured, sync to database (catch and log any non-fatal db connection issue)
      if (db) {
        try {
          await db
            .insert(schema.loyaltyCustomers)
            .values({
              id: customer.id,
              phone: customer.phone,
              username: customer.username || null,
              password: customer.password || null,
              email: customer.email || null,
              fullName: customer.fullName || customer.username || null,
              tierId: customer.tierId || "member",
              pointsBalance: customer.pointsBalance || 0,
              lateCancellationWarningCount:
                customer.lateCancellationWarningCount || 0,
              priorityStatus: customer.priorityStatus || "normal",
              status: customer.status || "Active",
            })
            .onConflictDoUpdate({
              target: schema.loyaltyCustomers.phone,
              set: {
                username: customer.username || null,
                password: customer.password || null,
                email: customer.email || null,
                fullName: customer.fullName || customer.username || null,
                updatedAt: new Date(),
              },
            });

          if (customer.vehicles && customer.vehicles.length > 0) {
            for (const v of customer.vehicles) {
              await db
                .insert(schema.vehicles)
                .values({
                  customerId: customer.id,
                  plate: v.plate,
                  model: v.model,
                  type: (v.type as any) || "car",
                })
                .onConflictDoNothing();
            }
          }
        } catch (dbErr) {
          console.warn("Could not sync customer to Postgres DB:", dbErr);
        }
      }

      const tier = getTier(customer.tierId, store);
      console.log(
        `[LoyaltyController] Successfully linked/registered customer ID: ${customer.id}`,
      );

      return {
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

    // Lookup customer
    let customer = findCustomer(store, phone);

    // If not found in store or missing password, check Supabase DB if available
    if ((!customer || !customer.password) && db) {
      try {
        const normalized = phone.trim().toLowerCase();
        const rows = await db
          .select()
          .from(schema.loyaltyCustomers)
          .where(
            sql`lower(${schema.loyaltyCustomers.phone}) = ${normalized} OR lower(${schema.loyaltyCustomers.username}) = ${normalized} OR lower(${schema.loyaltyCustomers.email}) = ${normalized}`,
          )
          .limit(1);

        if (rows && rows.length > 0) {
          const dbCust = rows[0];
          if (!customer) {
            customer = {
              id: dbCust.id,
              phone: dbCust.phone,
              username: dbCust.username || undefined,
              password: dbCust.password || undefined,
              email: dbCust.email || undefined,
              fullName: dbCust.fullName || undefined,
              tierId: dbCust.tierId,
              pointsBalance: dbCust.pointsBalance,
              vehicles: [],
              pointHistory: [],
              bookingHistory: [],
              lateCancellationWarningCount: dbCust.lateCancellationWarningCount,
              priorityStatus: dbCust.priorityStatus,
              status: dbCust.status as any,
              createdAt: dbCust.createdAt.toISOString(),
              updatedAt: dbCust.updatedAt.toISOString(),
            };
            store.customers.push(customer);
          } else if (dbCust.password) {
            customer.password = dbCust.password;
          }
        }
      } catch (dbErr) {
        console.warn(
          "[LoyaltyController] Could not query Supabase during login:",
          dbErr,
        );
      }
    }

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

    const dashboard = buildDashboard(store, phone);
    if (!dashboard) {
      console.warn(
        `[LoyaltyController] Dashboard not found for identifier: "${phone}"`,
      );
      return new Response(JSON.stringify({ error: "Customer not found." }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    return dashboard;
  });

  // Quick lookup endpoint for booking modal auto-fill
  app.get("/api/loyalty/customer", (ctx: any) => {
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

    const customer = findCustomer(store, phone);
    if (!customer) {
      return new Response(JSON.stringify({ error: "Customer not found." }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    const tier = getTier(customer.tierId, store);

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
  app.get("/api/loyalty/claimed-promos", (ctx: any) => {
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

    const customer = findCustomer(store, phone);
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

  // Public tiers catalog
  app.get("/api/tiers", () => {
    const tiers = getAllTiers(store);
    return {
      status: "success",
      count: tiers.length,
      data: tiers,
    };
  });

  return app;
}
