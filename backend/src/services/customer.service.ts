import type {
  LoyaltyCustomer,
  LoyaltyStore,
  PointTransaction,
  Vehicle,
} from "../models/loyalty.model";
import { findCustomer } from "./loyalty.service";
import { getTier } from "./tier.service";
import { db, schema } from "../db/index";
import { sql } from "drizzle-orm";

function createId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export async function fetchAllCustomers(
  store: LoyaltyStore,
  options?: { query?: string; tier?: string; status?: string },
): Promise<LoyaltyCustomer[]> {
  if (db) {
    try {
      const dbCustomers = await db.select().from(schema.loyaltyCustomers);
      if (dbCustomers && dbCustomers.length > 0) {
        for (const dbC of dbCustomers) {
          const existing = store.customers.find(
            (c) => c.id === dbC.id || c.phone === dbC.phone,
          );
          if (!existing) {
            store.customers.push({
              id: dbC.id,
              phone: dbC.phone || "",
              username: dbC.username || undefined,
              fullName: dbC.fullName || undefined,
              email: dbC.email || undefined,
              tierId: dbC.tierId,
              pointsBalance: dbC.pointsBalance,
              collectedPoints: dbC.collectedPoints,
              vehicles: [],
              pointHistory: [],
              bookingHistory: [],
              lateCancellationWarningCount: dbC.lateCancellationWarningCount,
              priorityStatus: dbC.priorityStatus,
              status: dbC.status as any,
              createdAt: dbC.createdAt.toISOString(),
              updatedAt: dbC.updatedAt.toISOString(),
            });
          }
        }
      }
    } catch (err) {
      console.warn("Could not query users from Postgres DB:", err);
    }
  }

  return getAllCustomers(store, options);
}

export async function fetchCustomerById(
  store: LoyaltyStore,
  id: string,
): Promise<LoyaltyCustomer | undefined> {
  let customer = getCustomerById(store, id);
  if (!customer && db) {
    try {
      const rows = await db
        .select()
        .from(schema.loyaltyCustomers)
        .where(sql`${schema.loyaltyCustomers.id} = ${id}`)
        .limit(1);
      if (rows && rows.length > 0) {
        const dbC = rows[0];
        customer = {
          id: dbC.id,
          phone: dbC.phone || "",
          username: dbC.username || undefined,
          fullName: dbC.fullName || undefined,
          email: dbC.email || undefined,
          tierId: dbC.tierId,
          pointsBalance: dbC.pointsBalance,
          collectedPoints: dbC.collectedPoints,
          vehicles: [],
          pointHistory: [],
          bookingHistory: [],
          lateCancellationWarningCount: dbC.lateCancellationWarningCount,
          priorityStatus: dbC.priorityStatus,
          status: dbC.status as any,
          createdAt: dbC.createdAt.toISOString(),
          updatedAt: dbC.updatedAt.toISOString(),
        };
        store.customers.push(customer);
      }
    } catch (err) {
      console.warn("Could not query user by id from Postgres DB:", err);
    }
  }

  return customer;
}

export async function createCustomerItem(
  store: LoyaltyStore,
  data: {
    phone: string;
    fullName?: string;
    email?: string;
    tierId?: string;
    pointsBalance?: number;
    collectedPoints?: number;
    initialVehicle?: {
      plate: string;
      model: string;
      type: "car" | "motorcycle" | "suv" | "van";
    };
  },
): Promise<LoyaltyCustomer> {
  const customer = createCustomer(store, data);

  if (db) {
    try {
      await db
        .insert(schema.loyaltyCustomers)
        .values({
          id: customer.id,
          phone: customer.phone,
          username: customer.username || null,
          email: customer.email || null,
          fullName: customer.fullName || null,
          tierId: customer.tierId || "member",
          pointsBalance: customer.pointsBalance || 0,
          collectedPoints: customer.collectedPoints || 0,
          lateCancellationWarningCount:
            customer.lateCancellationWarningCount || 0,
          priorityStatus: customer.priorityStatus || "normal",
          status: customer.status || "Active",
        })
        .onConflictDoUpdate({
          target: schema.loyaltyCustomers.id,
          set: {
            phone: customer.phone,
            username: customer.username || null,
            email: customer.email || null,
            fullName: customer.fullName || null,
            tierId: customer.tierId || "member",
            pointsBalance: customer.pointsBalance || 0,
            status: customer.status || "Active",
            updatedAt: new Date(),
          },
        });
    } catch (err) {
      console.warn("Could not sync created user to Postgres DB:", err);
    }
  }

  return customer;
}

export async function updateCustomerItem(
  store: LoyaltyStore,
  id: string,
  data: Partial<LoyaltyCustomer>,
): Promise<LoyaltyCustomer | null> {
  const customer = updateCustomer(store, id, data);
  if (!customer) return null;

  if (db) {
    try {
      await db
        .update(schema.loyaltyCustomers)
        .set({
          phone: customer.phone,
          username: customer.username || null,
          email: customer.email || null,
          fullName: customer.fullName || null,
          tierId: customer.tierId || "member",
          pointsBalance: customer.pointsBalance || 0,
          status: customer.status || "Active",
          updatedAt: new Date(),
        })
        .where(sql`${schema.loyaltyCustomers.id} = ${id}`);
    } catch (err) {
      console.warn("Could not update user in Postgres DB:", err);
    }
  }

  return customer;
}

export async function adjustCustomerPointsItem(
  store: LoyaltyStore,
  id: string,
  delta: number,
  reason: string,
  options?: { affectsCollectedPoints?: boolean },
): Promise<{
  customer: LoyaltyCustomer;
  transaction: PointTransaction;
} | null> {
  const result = adjustCustomerPoints(store, id, delta, reason, options);
  if (!result) return null;

  if (db) {
    try {
      await db
        .update(schema.loyaltyCustomers)
        .set({
          pointsBalance: result.customer.pointsBalance,
          collectedPoints: result.customer.collectedPoints,
          updatedAt: new Date(),
        })
        .where(sql`${schema.loyaltyCustomers.id} = ${id}`);

      if (result.transaction) {
        await db
          .insert(schema.pointTransactions)
          .values({
            id: result.transaction.id,
            customerId: id,
            type: result.transaction.type as any,
            amount: result.transaction.amount,
            description: result.transaction.description,
            date: new Date(result.transaction.date),
          })
          .onConflictDoNothing();
      }
    } catch (err) {
      console.warn("Could not persist adjusted points to Postgres DB:", err);
    }
  }

  return result;
}

export async function resetCustomerWarningsItem(
  store: LoyaltyStore,
  id: string,
): Promise<LoyaltyCustomer | null> {
  const customer = resetCustomerWarnings(store, id);
  if (!customer) return null;

  if (db) {
    try {
      await db
        .update(schema.loyaltyCustomers)
        .set({
          lateCancellationWarningCount: 0,
          priorityStatus: "normal",
          updatedAt: new Date(),
        })
        .where(sql`${schema.loyaltyCustomers.id} = ${id}`);
    } catch (err) {
      console.warn("Could not reset customer warnings in Postgres DB:", err);
    }
  }

  return customer;
}

export function getAllCustomers(
  store: LoyaltyStore,
  options?: { query?: string; tier?: string; status?: string },
): LoyaltyCustomer[] {
  let list = store.customers || [];

  if (options?.query) {
    const q = options.query.toLowerCase().trim();
    list = list.filter((c) => {
      const matchPhone = c.phone?.toLowerCase().includes(q);
      const matchName =
        c.fullName?.toLowerCase().includes(q) ||
        c.username?.toLowerCase().includes(q);
      const matchEmail = c.email?.toLowerCase().includes(q);
      const matchPlates = c.licensePlates?.some((p) =>
        p.toLowerCase().includes(q),
      );
      return matchPhone || matchName || matchEmail || matchPlates;
    });
  }

  if (options?.tier && options.tier !== "ALL") {
    const t = options.tier.toLowerCase();
    list = list.filter((c) => c.tierId.toLowerCase() === t);
  }

  if (options?.status && options.status !== "ALL") {
    const s = options.status.toLowerCase();
    list = list.filter((c) => {
      if (s === "low priority") return c.priorityStatus === "LOW_PRIORITIED";
      if (s === "active") return c.status !== "Inactive";
      return c.status?.toLowerCase() === s;
    });
  }

  return list;
}

export function getCustomerById(
  store: LoyaltyStore,
  id: string,
): LoyaltyCustomer | undefined {
  return store.customers.find((c) => c.id === id);
}

export function createCustomer(
  store: LoyaltyStore,
  data: {
    phone: string;
    fullName?: string;
    email?: string;
    tierId?: string;
    pointsBalance?: number;
    collectedPoints?: number;
    initialVehicle?: {
      plate: string;
      model: string;
      type: "car" | "motorcycle" | "suv" | "van";
    };
  },
): LoyaltyCustomer {
  const existing = findCustomer(store, data.phone);
  if (existing) {
    throw new Error(`Customer with phone ${data.phone} already exists.`);
  }

  const now = new Date().toISOString();
  const vehicles: Vehicle[] = [];
  const plates: string[] = [];

  if (data.initialVehicle) {
    const plateUpper = data.initialVehicle.plate.trim().toUpperCase();
    plates.push(plateUpper);
    vehicles.push({
      plate: plateUpper,
      model: data.initialVehicle.model.trim() || "Standard Vehicle",
      type: data.initialVehicle.type || "car",
    });
  }

  const initialPoints = data.pointsBalance || 0;
  const initialCollected =
    data.collectedPoints !== undefined ? data.collectedPoints : initialPoints;

  const newCust: LoyaltyCustomer = {
    id: createId(),
    phone: data.phone.trim(),
    fullName: data.fullName?.trim(),
    email: data.email?.trim(),
    licensePlates: plates,
    tierId: data.tierId || "member",
    pointsBalance: initialPoints,
    collectedPoints: initialCollected,
    vehicles,
    pointHistory: initialPoints
      ? [
          {
            id: createId(),
            type: "earn",
            amount: initialPoints,
            date: now,
            description: "Initial account points balance",
          },
        ]
      : [],
    bookingHistory: [],
    lateCancellationWarningCount: 0,
    priorityStatus: "normal",
    status: "Active",
    createdAt: now,
    updatedAt: now,
  };

  store.customers.push(newCust);
  return newCust;
}

export function updateCustomer(
  store: LoyaltyStore,
  id: string,
  data: Partial<LoyaltyCustomer>,
): LoyaltyCustomer | null {
  const customer = getCustomerById(store, id);
  if (!customer) return null;

  if (data.fullName !== undefined) customer.fullName = data.fullName;
  if (data.email !== undefined) customer.email = data.email;
  if (data.tierId !== undefined) customer.tierId = data.tierId;
  if (data.status !== undefined) customer.status = data.status;
  if (data.priorityStatus !== undefined)
    customer.priorityStatus = data.priorityStatus;
  if (data.pointsBalance !== undefined)
    customer.pointsBalance = data.pointsBalance;
  if (data.collectedPoints !== undefined)
    customer.collectedPoints = data.collectedPoints;
  if (data.vehicles !== undefined) {
    customer.vehicles = data.vehicles;
    customer.licensePlates = data.vehicles.map((v) => v.plate.toUpperCase());
  }

  customer.updatedAt = new Date().toISOString();
  return customer;
}

export function adjustCustomerPoints(
  store: LoyaltyStore,
  id: string,
  delta: number,
  reason: string,
  options?: { affectsCollectedPoints?: boolean },
): { customer: LoyaltyCustomer; transaction: PointTransaction } | null {
  const customer = getCustomerById(store, id);
  if (!customer) return null;

  const now = new Date().toISOString();
  customer.pointsBalance = Math.max(0, customer.pointsBalance + delta);

  if (delta > 0 && options?.affectsCollectedPoints !== false) {
    customer.collectedPoints = (customer.collectedPoints ?? 0) + delta;
  }

  const transaction: PointTransaction = {
    id: createId(),
    type: delta >= 0 ? "earn" : "spend",
    amount: Math.abs(delta),
    date: now,
    description:
      reason || `Manual adjustment (${delta > 0 ? "+" : ""}${delta} pts)`,
  };

  customer.pointHistory.push(transaction);
  customer.updatedAt = now;

  return { customer, transaction };
}

export function resetCustomerWarnings(
  store: LoyaltyStore,
  id: string,
): LoyaltyCustomer | null {
  const customer = getCustomerById(store, id);
  if (!customer) return null;

  customer.lateCancellationWarningCount = 0;
  customer.priorityStatus = "normal";
  customer.updatedAt = new Date().toISOString();

  return customer;
}
