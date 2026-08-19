import type {
  LoyaltyCustomer,
  LoyaltyStore,
  PointTransaction,
  Vehicle,
} from "../models/loyalty.model";
import { findCustomer } from "./loyalty.service";
import { getTier } from "./tier.service";

function createId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function getAllCustomers(
  store: LoyaltyStore,
  options?: { query?: string; tier?: string; status?: string },
): LoyaltyCustomer[] {
  let list = store.customers || [];

  if (options?.query) {
    const q = options.query.toLowerCase().trim();
    list = list.filter((c) => {
      const matchPhone = c.phone.toLowerCase().includes(q);
      const matchName = c.fullName?.toLowerCase().includes(q);
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

  const newCust: LoyaltyCustomer = {
    id: createId(),
    phone: data.phone.trim(),
    fullName: data.fullName?.trim(),
    email: data.email?.trim(),
    licensePlates: plates,
    tierId: data.tierId || "member",
    pointsBalance: data.pointsBalance || 0,
    vehicles,
    pointHistory: data.pointsBalance
      ? [
          {
            id: createId(),
            type: "earn",
            amount: data.pointsBalance,
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
): { customer: LoyaltyCustomer; transaction: PointTransaction } | null {
  const customer = getCustomerById(store, id);
  if (!customer) return null;

  const now = new Date().toISOString();
  customer.pointsBalance = Math.max(0, customer.pointsBalance + delta);

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
