import type {
  Booking,
  BookingStatus,
  LoyaltyCustomer,
  LoyaltyStore,
  Vehicle,
} from "../models/loyalty.model";
import { findCustomer, cancelBooking } from "./loyalty.service";
import { getTier } from "./tier.service";
import { getServiceById } from "./service.service";
import { db, schema } from "../db/index";
import { sql } from "drizzle-orm";

function createId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export async function createPublicBooking(
  store: LoyaltyStore,
  params: {
    phone: string;
    vehiclePlate: string;
    requestedDate: string;
    serviceId?: string;
    timeSlot?: string;
    time?: string;
    appliedPromoId?: string;
    note?: string;
  },
) {
  const {
    phone,
    vehiclePlate,
    requestedDate,
    serviceId,
    timeSlot,
    time,
    appliedPromoId,
    note,
  } = params;

  const result = createBooking(store, phone, vehiclePlate, requestedDate);
  if (result.success && result.booking) {
    if (serviceId) {
      result.booking.serviceId = serviceId;
      const srv = getServiceById(store, serviceId);
      if (srv) {
        result.booking.serviceName = srv.name;
        result.booking.service = srv.name;
        result.booking.durationMinutes = srv.durationMinutes;
      }
    }
    if (timeSlot || time) {
      result.booking.timeSlot = timeSlot || time;
      result.booking.time = timeSlot || time;
    }
    if (appliedPromoId) result.booking.appliedPromoId = appliedPromoId;
    if (note) result.booking.note = note;

    if (db) {
      try {
        const customer = findCustomer(store, phone);
        if (customer) {
          await db
            .insert(schema.bookings)
            .values({
              id: result.booking.id,
              customerId: customer.id,
              vehiclePlate: result.booking.vehiclePlate,
              serviceId: result.booking.serviceId || null,
              date: new Date(result.booking.date),
              timeSlot: result.booking.timeSlot || null,
              durationMinutes: result.booking.durationMinutes || 30,
              status: (result.booking.status as any) || "confirmed",
              pointsEarned: result.booking.pointsEarned || 0,
              pointsSpent: result.booking.pointsSpent || 0,
              appliedPerks: result.booking.appliedPerks || [],
              appliedPromoId: result.booking.appliedPromoId || null,
              note: result.booking.note || null,
            })
            .onConflictDoUpdate({
              target: schema.bookings.id,
              set: {
                status: (result.booking.status as any) || "confirmed",
                updatedAt: new Date(),
              },
            });

          await db
            .update(schema.loyaltyCustomers)
            .set({
              pointsBalance: customer.pointsBalance,
              collectedPoints: customer.collectedPoints,
              updatedAt: new Date(),
            })
            .where(sql`${schema.loyaltyCustomers.id} = ${customer.id}`);
        }
      } catch (dbErr) {
        console.warn("Could not persist new booking to Postgres DB:", dbErr);
      }
    }
  }

  return result;
}

export async function fetchCustomerBookings(
  store: LoyaltyStore,
  phone: string,
) {
  let customer = findCustomer(store, phone);
  if (!customer && db) {
    try {
      const normalized = phone.trim().toLowerCase();
      const rows = await db
        .select()
        .from(schema.loyaltyCustomers)
        .where(
          sql`lower(${schema.loyaltyCustomers.phone}) = ${normalized} OR lower(${schema.loyaltyCustomers.username}) = ${normalized}`,
        )
        .limit(1);
      if (rows && rows.length > 0) {
        const dbCust = rows[0];
        customer = {
          id: dbCust.id,
          phone: dbCust.phone || "",
          username: dbCust.username || undefined,
          fullName: dbCust.fullName || undefined,
          email: dbCust.email || undefined,
          tierId: dbCust.tierId,
          pointsBalance: dbCust.pointsBalance,
          collectedPoints: dbCust.collectedPoints,
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
      }
    } catch (err) {
      console.warn("Could not query customer for bookings from Postgres:", err);
    }
  }

  if (!customer) {
    return null;
  }

  // If connected to DB, also read any database bookings
  if (db) {
    try {
      const dbBookings = await db
        .select()
        .from(schema.bookings)
        .where(sql`${schema.bookings.customerId} = ${customer.id}`);
      if (dbBookings && dbBookings.length > 0) {
        for (const dbB of dbBookings) {
          const exists = customer.bookingHistory?.some((b) => b.id === dbB.id);
          if (!exists) {
            customer.bookingHistory = customer.bookingHistory || [];
            customer.bookingHistory.push({
              id: dbB.id,
              customerId: dbB.customerId,
              vehiclePlate: dbB.vehiclePlate,
              serviceId: dbB.serviceId || undefined,
              date: dbB.date.toISOString().split("T")[0],
              timeSlot: dbB.timeSlot || undefined,
              durationMinutes: dbB.durationMinutes || 30,
              status: dbB.status as any,
              appliedPerks: dbB.appliedPerks || [],
              appliedPromoId: dbB.appliedPromoId || undefined,
              pointsEarned: dbB.pointsEarned,
              pointsSpent: dbB.pointsSpent,
              createdAt: dbB.createdAt.toISOString(),
              updatedAt: dbB.updatedAt.toISOString(),
            });
          }
        }
      }
    } catch (err) {
      console.warn("Could not sync my-bookings from Postgres DB:", err);
    }
  }

  const history = (customer.bookingHistory || []).slice().reverse();
  const active = history.filter(
    (b) => b.status === "confirmed" || b.status === "pending",
  );

  return {
    totalCount: history.length,
    activeCount: active.length,
    activeBookings: active,
    bookingHistory: history,
  };
}

export async function cancelPublicBooking(
  store: LoyaltyStore,
  phone: string,
  bookingId: string,
) {
  const result = cancelBooking(store, phone, bookingId);
  if (db) {
    try {
      await db
        .update(schema.bookings)
        .set({
          status: "cancelled",
          cancelledAt: new Date(),
          updatedAt: new Date(),
        })
        .where(sql`${schema.bookings.id} = ${bookingId}`);

      const customer = findCustomer(store, phone);
      if (customer) {
        await db
          .update(schema.loyaltyCustomers)
          .set({
            lateCancellationWarningCount: customer.lateCancellationWarningCount,
            priorityStatus: customer.priorityStatus,
            updatedAt: new Date(),
          })
          .where(sql`${schema.loyaltyCustomers.id} = ${customer.id}`);
      }
    } catch (dbErr) {
      console.warn("Could not update cancelled booking in Postgres DB:", dbErr);
    }
  }
  return result;
}

export function getAllBookings(
  store: LoyaltyStore,
  options?: {
    query?: string;
    status?: string;
    date?: string;
    serviceId?: string;
  },
): (Booking & {
  customerName?: string;
  customerPhone?: string;
  customerTier?: string;
})[] {
  const result: (Booking & {
    customerName?: string;
    customerPhone?: string;
    customerTier?: string;
  })[] = [];

  for (const customer of store.customers || []) {
    for (const booking of customer.bookingHistory || []) {
      const flatBooking = {
        ...booking,
        customerName:
          customer.fullName ||
          customer.username ||
          `Customer (${customer.phone})`,
        customerPhone: customer.phone,
        customerTier: customer.tierId?.toUpperCase(),
      };
      result.push(flatBooking);
    }
  }

  // Sort latest first
  result.sort(
    (a, b) =>
      new Date(b.createdAt || b.date).getTime() -
      new Date(a.createdAt || a.date).getTime(),
  );

  let filtered = result;

  if (options?.query) {
    const q = options.query.toLowerCase().trim();
    filtered = filtered.filter(
      (b) =>
        b.id.toLowerCase().includes(q) ||
        b.vehiclePlate.toLowerCase().includes(q) ||
        b.customerPhone?.toLowerCase().includes(q) ||
        b.customerName?.toLowerCase().includes(q) ||
        b.serviceName?.toLowerCase().includes(q) ||
        b.service?.toLowerCase().includes(q),
    );
  }

  if (options?.status && options.status !== "ALL") {
    const s = options.status.toLowerCase();
    filtered = filtered.filter((b) => b.status.toLowerCase() === s);
  }

  if (options?.date) {
    filtered = filtered.filter(
      (b) => b.date === options.date || b.date.startsWith(options.date!),
    );
  }

  if (options?.serviceId) {
    filtered = filtered.filter((b) => b.serviceId === options.serviceId);
  }

  return filtered;
}

export function getBookingById(
  store: LoyaltyStore,
  bookingId: string,
): { booking: Booking; customer: LoyaltyCustomer } | null {
  for (const customer of store.customers || []) {
    const b = customer.bookingHistory.find((item) => item.id === bookingId);
    if (b) {
      return { booking: b, customer };
    }
  }
  return null;
}

export function adminCreateBooking(
  store: LoyaltyStore,
  data: {
    phone: string;
    vehiclePlate: string;
    vehicleModel?: string;
    vehicleType?: "car" | "motorcycle" | "suv" | "van";
    serviceId?: string;
    serviceName?: string;
    date: string;
    timeSlot?: string;
    time?: string;
    bayId?: string;
    status?: BookingStatus;
    note?: string;
  },
): Booking {
  let customer = findCustomer(store, data.phone);
  const now = new Date().toISOString();

  if (!customer) {
    // Create guest customer
    const plateUpper = data.vehiclePlate.trim().toUpperCase();
    const vehicle: Vehicle = {
      plate: plateUpper,
      model: data.vehicleModel?.trim() || "Standard Vehicle",
      type: data.vehicleType || "car",
    };

    customer = {
      id: createId(),
      phone: data.phone.trim(),
      licensePlates: [plateUpper],
      tierId: "member",
      pointsBalance: 0,
      vehicles: [vehicle],
      pointHistory: [],
      bookingHistory: [],
      lateCancellationWarningCount: 0,
      priorityStatus: "normal",
      status: "Active",
      createdAt: now,
      updatedAt: now,
    };
    store.customers.push(customer);
  } else {
    // Ensure vehicle exists
    const plateUpper = data.vehiclePlate.trim().toUpperCase();
    if (!customer.licensePlates.includes(plateUpper)) {
      customer.licensePlates.push(plateUpper);
    }
    const hasVehicle = customer.vehicles.some((v) => v.plate === plateUpper);
    if (!hasVehicle) {
      customer.vehicles.push({
        plate: plateUpper,
        model: data.vehicleModel?.trim() || "Standard Vehicle",
        type: data.vehicleType || "car",
      });
    }
  }

  let serviceName = data.serviceName;
  let durationMinutes = 30;
  if (data.serviceId) {
    const srv = getServiceById(store, data.serviceId);
    if (srv) {
      serviceName = srv.name;
      durationMinutes = srv.durationMinutes;
    }
  }

  const tier = getTier(customer.tierId, store);
  const booking: Booking = {
    id: `BK-${Date.now().toString().slice(-6)}-${Math.random().toString(36).slice(2, 5).toUpperCase()}`,
    customerId: customer.id,
    customerName: customer.fullName || customer.username,
    customerPhone: customer.phone,
    customerTier: customer.tierId,
    vehiclePlate: data.vehiclePlate.trim().toUpperCase(),
    vehicleModel: data.vehicleModel,
    vehicleType: data.vehicleType,
    serviceId: data.serviceId,
    serviceName: serviceName || data.serviceId || "Exterior Wash",
    service: serviceName || data.serviceId || "Exterior Wash",
    date: data.date,
    time: data.time || data.timeSlot,
    timeSlot: data.timeSlot || data.time,
    durationMinutes,
    bayId: data.bayId || "Bay 1",
    status: data.status || "confirmed",
    appliedPerks: tier.perks || [],
    note: data.note,
    createdAt: now,
    updatedAt: now,
  };

  customer.bookingHistory.push(booking);
  customer.updatedAt = now;

  return booking;
}

export function adminUpdateBooking(
  store: LoyaltyStore,
  bookingId: string,
  data: Partial<Booking>,
): Booking | null {
  const match = getBookingById(store, bookingId);
  if (!match) return null;

  const { booking, customer } = match;
  const previousStatus = booking.status;

  if (data.status !== undefined) booking.status = data.status;
  if (data.bayId !== undefined) booking.bayId = data.bayId;
  if (data.timeSlot !== undefined) {
    booking.timeSlot = data.timeSlot;
    booking.time = data.timeSlot;
  }
  if (data.date !== undefined) booking.date = data.date;
  if (data.note !== undefined) booking.note = data.note;
  if (data.serviceId !== undefined) {
    booking.serviceId = data.serviceId;
    const srv = getServiceById(store, data.serviceId);
    if (srv) {
      booking.serviceName = srv.name;
      booking.service = srv.name;
      booking.durationMinutes = srv.durationMinutes;
    }
  }

  // When a booking transitions to "completed", award points to BOTH collectedPoints and redeemable pointsBalance
  // Points calculated based on booking price and customer's tier point rate multiplier (default base rate is 100 pts per dollar)
  if (previousStatus !== "completed" && booking.status === "completed") {
    let price = 30; // fallback base price
    const srv = booking.serviceId
      ? getServiceById(store, booking.serviceId)
      : null;
    if (srv?.price) {
      price = srv.price;
    }

    // Configurable rate: tier multiplier pointRate (e.g., Member=1.0x, Silver=1.25x, Gold=1.5x, Platinum=2.0x) * base rate (100)
    const tier = getTier(customer.tierId, store);
    const pointRate = tier?.pointRate ?? 1.0;
    const baseRate = 100; // 100 points per $1
    let earnedPoints = Math.max(10, Math.round(price * baseRate * pointRate));

    // Check if promo was applied that adds bonus points
    if (booking.appliedPromoId) {
      const promo = store.promotions?.find(
        (p) => p.id === booking.appliedPromoId,
      );
      if (promo && promo.bonusPoints && promo.bonusPoints > 0) {
        earnedPoints += promo.bonusPoints;
      }
    }

    booking.pointsEarned = earnedPoints;
    customer.pointsBalance = (customer.pointsBalance || 0) + earnedPoints;
    customer.collectedPoints = (customer.collectedPoints || 0) + earnedPoints;

    const now = new Date().toISOString();
    customer.pointHistory.push({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      type: "earn",
      amount: earnedPoints,
      date: now,
      description: `Completed wash booking ${booking.id} (+${earnedPoints} pts, rate: ${pointRate}x)`,
    });

    // Auto-remove LOW_PRIORITIED mark when the marked customer completes 3 bookings
    if (
      customer.priorityStatus === "LOW_PRIORITIED" ||
      (customer.lateCancellationWarningCount ?? 0) >= 3
    ) {
      const completedCount = customer.bookingHistory.filter(
        (b) => b.status === "completed",
      ).length;

      if (completedCount >= 3) {
        customer.priorityStatus = "normal";
        customer.lateCancellationWarningCount = 0;
        if (customer.status === "Low Priority") {
          customer.status = "Active";
        }
        store.auditLogs.push({
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          actor: "system",
          actionType: "priority-status-restored",
          entityType: "customer",
          entityId: customer.id,
          timestamp: now,
          details: `LOW_PRIORITIED status automatically removed after completing ${completedCount} bookings.`,
        });
      }
    }
  }

  booking.updatedAt = new Date().toISOString();
  customer.updatedAt = new Date().toISOString();

  return booking;
}

export function adminDeleteBooking(
  store: LoyaltyStore,
  bookingId: string,
): boolean {
  const match = getBookingById(store, bookingId);
  if (!match) return false;

  const { customer } = match;
  const idx = customer.bookingHistory.findIndex((b) => b.id === bookingId);
  if (idx === -1) return false;

  customer.bookingHistory.splice(idx, 1);
  customer.updatedAt = new Date().toISOString();
  return true;
}
