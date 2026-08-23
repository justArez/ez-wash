import type { Booking, BookingStatus, Vehicle } from "../models/loyalty.model";
import {
  createBooking as createLoyaltyBooking,
  cancelBooking as cancelLoyaltyBooking,
} from "./loyalty.service";
import { findCustomerRecord } from "./customer.service";
import { getTier } from "./tier.service";
import { fetchServiceById } from "./service.service";
import { db, schema } from "../db/index";
import { sql, eq } from "drizzle-orm";

function createId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function mapBookingRow(r: typeof schema.bookings.$inferSelect): Booking {
  return {
    id: r.id,
    customerId: r.customerId,
    vehiclePlate: r.vehiclePlate,
    serviceId: r.serviceId || undefined,
    date: r.date.toISOString().split("T")[0],
    time: r.timeSlot || undefined,
    timeSlot: r.timeSlot || undefined,
    durationMinutes: r.durationMinutes || undefined,
    bayId: r.bayId || undefined,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
    appliedPerks: r.appliedPerks || [],
    appliedPromoId: r.appliedPromoId || undefined,
    pointsEarned: r.pointsEarned,
    pointsSpent: r.pointsSpent,
    status: r.status,
    cancelledAt: r.cancelledAt?.toISOString(),
    isLateCancellation: r.isLateCancellation,
    note: r.note || undefined,
  };
}

export async function createPublicBooking(params: {
  phone: string;
  vehiclePlate: string;
  requestedDate: string;
  serviceId?: string;
  timeSlot?: string;
  time?: string;
  appliedPromoId?: string;
  note?: string;
}) {
  if (!db) {
    throw new Error("Database connection is not available.");
  }

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

  const result = await createLoyaltyBooking(phone, vehiclePlate, requestedDate);
  if (result.success && result.booking) {
    const updates: Record<string, unknown> = {};

    if (serviceId) {
      result.booking.serviceId = serviceId;
      const srv = await fetchServiceById(serviceId);
      if (srv) {
        result.booking.serviceName = srv.name;
        result.booking.service = srv.name;
        result.booking.durationMinutes = srv.durationMinutes;
        updates.serviceId = serviceId;
        updates.durationMinutes = srv.durationMinutes;
      }
    }
    if (timeSlot || time) {
      result.booking.timeSlot = timeSlot || time;
      result.booking.time = timeSlot || time;
      updates.timeSlot = timeSlot || time;
    }
    if (appliedPromoId) {
      result.booking.appliedPromoId = appliedPromoId;
      updates.appliedPromoId = appliedPromoId;
    }
    if (note) {
      result.booking.note = note;
      updates.note = note;
    }

    if (Object.keys(updates).length > 0) {
      await db
        .update(schema.bookings)
        .set({ ...updates, updatedAt: new Date() })
        .where(eq(schema.bookings.id, result.booking.id));
    }
  }

  return result;
}

export async function fetchCustomerBookings(phone: string) {
  const customer = await findCustomerRecord(phone);
  if (!customer) {
    return null;
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

export async function cancelPublicBooking(phone: string, bookingId: string) {
  return cancelLoyaltyBooking(phone, bookingId);
}

export async function getAllBookings(options?: {
  query?: string;
  status?: string;
  date?: string;
  serviceId?: string;
}): Promise<
  (Booking & {
    customerName?: string;
    customerPhone?: string;
    customerTier?: string;
  })[]
> {
  if (!db) {
    throw new Error("Database connection is not available.");
  }

  const bookingRows = await db.select().from(schema.bookings);
  const customerRows = await db.select().from(schema.loyaltyCustomers);
  const customerMap = new Map(customerRows.map((c) => [c.id, c]));

  let result = bookingRows.map((r) => {
    const customer = customerMap.get(r.customerId);
    return {
      ...mapBookingRow(r),
      customerName:
        customer?.fullName ||
        customer?.username ||
        `Customer (${customer?.phone})`,
      customerPhone: customer?.phone || undefined,
      customerTier: customer?.tierId?.toUpperCase(),
    };
  });

  result.sort(
    (a, b) =>
      new Date(b.createdAt || b.date).getTime() -
      new Date(a.createdAt || a.date).getTime(),
  );

  if (options?.query) {
    const q = options.query.toLowerCase().trim();
    result = result.filter(
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
    result = result.filter((b) => b.status.toLowerCase() === s);
  }

  if (options?.date) {
    result = result.filter(
      (b) => b.date === options.date || b.date.startsWith(options.date!),
    );
  }

  if (options?.serviceId) {
    result = result.filter((b) => b.serviceId === options.serviceId);
  }

  return result;
}

export async function getBookingById(
  bookingId: string,
): Promise<{ booking: Booking; customerId: string } | null> {
  if (!db) {
    throw new Error("Database connection is not available.");
  }

  const rows = await db
    .select()
    .from(schema.bookings)
    .where(eq(schema.bookings.id, bookingId))
    .limit(1);

  if (rows.length === 0) return null;
  return { booking: mapBookingRow(rows[0]), customerId: rows[0].customerId };
}

export async function adminCreateBooking(data: {
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
}): Promise<Booking> {
  if (!db) {
    throw new Error("Database connection is not available.");
  }

  let customer = await findCustomerRecord(data.phone);
  const plateUpper = data.vehiclePlate.trim().toUpperCase();

  if (!customer) {
    const customerId = createId();
    await db.insert(schema.loyaltyCustomers).values({
      id: customerId,
      phone: data.phone.trim(),
      tierId: "member",
    });
    await db.insert(schema.vehicles).values({
      id: createId(),
      customerId,
      plate: plateUpper,
      model: data.vehicleModel?.trim() || "Standard Vehicle",
      type: data.vehicleType || "car",
    });
    customer = await findCustomerRecord(data.phone);
  } else {
    const hasVehicle = customer.vehicles.some((v) => v.plate === plateUpper);
    if (!hasVehicle) {
      await db.insert(schema.vehicles).values({
        id: createId(),
        customerId: customer.id,
        plate: plateUpper,
        model: data.vehicleModel?.trim() || "Standard Vehicle",
        type: data.vehicleType || "car",
      });
    }
  }

  let serviceName = data.serviceName;
  let durationMinutes = 30;
  if (data.serviceId) {
    const srv = await fetchServiceById(data.serviceId);
    if (srv) {
      serviceName = srv.name;
      durationMinutes = srv.durationMinutes;
    }
  }

  const tier = getTier(customer!.tierId);
  const bookingId = `BK-${Date.now().toString().slice(-6)}-${Math.random().toString(36).slice(2, 5).toUpperCase()}`;

  await db.insert(schema.bookings).values({
    id: bookingId,
    customerId: customer!.id,
    vehiclePlate: plateUpper,
    serviceId: data.serviceId || null,
    date: new Date(data.date),
    timeSlot: data.timeSlot || data.time || null,
    durationMinutes,
    bayId: data.bayId || "Bay 1",
    status: (data.status?.toLowerCase() as any) || "pending",
    appliedPerks: tier.perks || [],
    note: data.note || null,
  });

  return {
    id: bookingId,
    customerId: customer!.id,
    customerName: customer!.fullName || customer!.username,
    customerPhone: customer!.phone,
    customerTier: customer!.tierId,
    vehiclePlate: plateUpper,
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
    status: data.status || "pending",
    appliedPerks: tier.perks || [],
    note: data.note,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

export async function adminUpdateBooking(
  bookingId: string,
  data: Partial<Booking>,
): Promise<Booking | null> {
  if (!db) {
    throw new Error("Database connection is not available.");
  }

  const match = await getBookingById(bookingId);
  if (!match) return null;

  const { booking, customerId } = match;
  const previousStatus = booking.status;
  const now = new Date();

  const updates: Record<string, unknown> = { updatedAt: now };
  if (data.status !== undefined) updates.status = data.status;
  if (data.bayId !== undefined) updates.bayId = data.bayId;
  if (data.timeSlot !== undefined) updates.timeSlot = data.timeSlot;
  if (data.date !== undefined) updates.date = new Date(data.date);
  if (data.note !== undefined) updates.note = data.note;
  if (data.serviceId !== undefined) {
    updates.serviceId = data.serviceId;
    const srv = await fetchServiceById(data.serviceId);
    if (srv) updates.durationMinutes = srv.durationMinutes;
  }

  const newStatus = (data.status ?? previousStatus) as BookingStatus;

  // Award points when a booking transitions to "completed"
  if (previousStatus !== "completed" && newStatus === "completed") {
    const customerRows = await db
      .select()
      .from(schema.loyaltyCustomers)
      .where(eq(schema.loyaltyCustomers.id, customerId))
      .limit(1);
    const customer = customerRows[0];

    let price = 30;
    const srvId = data.serviceId ?? booking.serviceId;
    const srv = srvId ? await fetchServiceById(srvId) : null;
    if (srv?.price) price = srv.price;

    const tier = getTier(customer.tierId);
    const pointRate = tier?.pointRate ?? 1.0;
    const baseRate = 100;
    let earnedPoints = Math.max(10, Math.round(price * baseRate * pointRate));

    if (booking.appliedPromoId) {
      const promoRows = await db
        .select()
        .from(schema.promotions)
        .where(eq(schema.promotions.id, booking.appliedPromoId))
        .limit(1);
      const promo = promoRows[0];
      if (promo?.bonusPoints && promo.bonusPoints > 0) {
        earnedPoints += promo.bonusPoints;
      }
    }

    updates.pointsEarned = earnedPoints;

    const newBalance = (customer.pointsBalance || 0) + earnedPoints;
    const newCollected = (customer.collectedPoints || 0) + earnedPoints;

    let newPriorityStatus = customer.priorityStatus;
    let newWarningCount = customer.lateCancellationWarningCount;
    let newStatusField = customer.status;

    if (
      customer.priorityStatus === "LOW_PRIORITIED" ||
      (customer.lateCancellationWarningCount ?? 0) >= 3
    ) {
      const completedRows = await db
        .select({ id: schema.bookings.id })
        .from(schema.bookings)
        .where(
          sql`${schema.bookings.customerId} = ${customerId} AND ${schema.bookings.status} = 'completed'`,
        );
      const completedCount = completedRows.length + 1;

      if (completedCount >= 3) {
        newPriorityStatus = "normal";
        newWarningCount = 0;
        if (newStatusField === "Low Priority") newStatusField = "Active";

        await db.insert(schema.auditLogs).values({
          id: createId(),
          actor: "system",
          actionType: "priority-status-restored",
          entityType: "customer",
          entityId: customerId,
          details: `LOW_PRIORITIED status automatically removed after completing ${completedCount} bookings.`,
        });
      }
    }

    await db
      .update(schema.loyaltyCustomers)
      .set({
        pointsBalance: newBalance,
        collectedPoints: newCollected,
        priorityStatus: newPriorityStatus,
        lateCancellationWarningCount: newWarningCount,
        status: newStatusField,
        updatedAt: now,
      })
      .where(eq(schema.loyaltyCustomers.id, customerId));

    await db.insert(schema.pointTransactions).values({
      id: createId(),
      customerId,
      type: "earn",
      amount: earnedPoints,
      description: `Completed wash booking ${booking.id} (+${earnedPoints} pts, rate: ${pointRate}x)`,
    });
  }

  await db
    .update(schema.bookings)
    .set(updates)
    .where(eq(schema.bookings.id, bookingId));

  const updated = await getBookingById(bookingId);
  return updated!.booking;
}

export async function adminDeleteBooking(bookingId: string): Promise<boolean> {
  if (!db) {
    throw new Error("Database connection is not available.");
  }

  const result = await db
    .delete(schema.bookings)
    .where(eq(schema.bookings.id, bookingId))
    .returning({ id: schema.bookings.id });

  return result.length > 0;
}
