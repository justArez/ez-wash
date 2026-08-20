import type {
  Booking,
  ClaimedPromo,
  LoyaltyCustomer,
  RewardOffer,
  Vehicle,
} from "../models/loyalty.model";
import {
  getAppliedPerks,
  getNextBookingWindowDate,
  getTier,
} from "./tier.service";
import { suggestRewards } from "./reward.service";
import { fetchAllRewards } from "./reward.service";
import {
  findCustomerRecord,
  loadCustomerDetails,
  fetchCustomerById,
} from "./customer.service";
import { db, schema } from "../db/index";
import { sql, eq, or } from "drizzle-orm";

function createId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function normalizePlate(plate: string) {
  return plate.trim().toUpperCase();
}

export async function checkUsernameExists(username: string): Promise<boolean> {
  if (!db) {
    throw new Error("Database connection is not available.");
  }

  const normalized = username.trim().toLowerCase();
  if (!normalized) return false;

  const rows = await db
    .select({ id: schema.loyaltyCustomers.id })
    .from(schema.loyaltyCustomers)
    .where(sql`lower(${schema.loyaltyCustomers.username}) = ${normalized}`)
    .limit(1);

  return rows.length > 0;
}

export async function fetchCustomerByIdentifier(
  phoneOrUsernameOrEmail: string,
): Promise<LoyaltyCustomer | undefined> {
  return findCustomerRecord(phoneOrUsernameOrEmail);
}

export async function linkCustomerAccount(
  phone: string,
  plate?: string,
  model?: string,
  type?: "car" | "motorcycle",
  options?: {
    username?: string;
    email?: string;
    fullName?: string;
    password?: string;
  },
): Promise<LoyaltyCustomer> {
  if (!db) {
    throw new Error("Database connection is not available.");
  }

  const normalizedPhone = phone ? phone.trim() : "";
  const normalizedPlate = plate ? normalizePlate(plate) : undefined;
  const username = options?.username?.trim();
  const email = options?.email?.trim();
  const fullName = options?.fullName?.trim();

  let existing: LoyaltyCustomer | undefined;
  if (username) existing = await findCustomerRecord(username);
  if (!existing && normalizedPhone)
    existing = await findCustomerRecord(normalizedPhone);
  if (!existing && email) existing = await findCustomerRecord(email);

  let customerId: string;

  if (existing) {
    customerId = existing.id;
    await db
      .update(schema.loyaltyCustomers)
      .set({
        phone: normalizedPhone || existing.phone,
        username: username || existing.username || null,
        email: email || existing.email || null,
        fullName: fullName || existing.fullName || null,
        password: options?.password || existing.password || null,
        updatedAt: new Date(),
      })
      .where(eq(schema.loyaltyCustomers.id, customerId));
  } else {
    customerId = createId();
    await db.insert(schema.loyaltyCustomers).values({
      id: customerId,
      phone: normalizedPhone || (username ? username : `acc-${Date.now()}`),
      username: username || null,
      email: email || null,
      fullName:
        fullName ||
        username ||
        (normalizedPhone ? `User ${normalizedPhone}` : "New Member"),
      password: options?.password || null,
      tierId: "member",
    });
  }

  if (normalizedPlate) {
    const vehicleExists = await db
      .select({ id: schema.vehicles.id })
      .from(schema.vehicles)
      .where(
        sql`${schema.vehicles.customerId} = ${customerId} AND upper(${schema.vehicles.plate}) = ${normalizedPlate}`,
      )
      .limit(1);
    if (vehicleExists.length === 0) {
      await db.insert(schema.vehicles).values({
        id: createId(),
        customerId,
        plate: normalizedPlate,
        model: model?.trim() || "Default Vehicle",
        type: type || "car",
      });
    }
  }

  return (await fetchCustomerById(customerId))!;
}

export async function buildDashboard(phone: string) {
  const customer = await findCustomerRecord(phone);
  if (!customer) {
    return null;
  }

  const tier = getTier(customer.tierId);
  const today = new Date().toISOString().split("T")[0];
  const nextBookingDate = getNextBookingWindowDate(today, tier.id);
  const rewardOffers = await fetchAllRewards();

  return {
    customerId: customer.id,
    phone: customer.phone,
    username: customer.username,
    fullName: customer.fullName,
    email: customer.email,
    tier,
    pointsBalance: customer.pointsBalance,
    collectedPoints: customer.collectedPoints ?? customer.pointsBalance,
    vehicles: customer.vehicles,
    nextEligibleBookingDate: nextBookingDate,
    appliedPerks: getAppliedPerks(tier.id),
    rewardSuggestions: suggestRewards(customer, rewardOffers),
    bookingHistory: customer.bookingHistory.slice().reverse(),
    lateCancellationWarningCount: customer.lateCancellationWarningCount ?? 0,
    priorityStatus:
      customer.priorityStatus ??
      ((customer.lateCancellationWarningCount ?? 0) >= 3
        ? "LOW_PRIORITIED"
        : "normal"),
    pointHistory: customer.pointHistory.slice(-10).reverse(),
  };
}

export async function cancelBooking(
  phone: string,
  bookingId: string,
  now = new Date(),
) {
  if (!db) {
    throw new Error("Database connection is not available.");
  }

  const customer = await findCustomerRecord(phone);
  if (!customer) {
    throw new Error("Customer not found.");
  }

  const booking = customer.bookingHistory.find((item) => item.id === bookingId);
  if (!booking) {
    throw new Error("Booking not found for this customer.");
  }

  if (booking.status === "cancelled") {
    const warningCount = customer.lateCancellationWarningCount ?? 0;
    return {
      success: true,
      booking,
      isLateCancellation: booking.isLateCancellation ?? false,
      warningCount,
      priorityStatus:
        customer.priorityStatus ??
        (warningCount >= 3 ? "LOW_PRIORITIED" : "normal"),
    };
  }

  if (booking.status !== "confirmed") {
    throw new Error("Only confirmed bookings can be cancelled.");
  }

  const scheduledTime = new Date(
    booking.time ? `${booking.date}T${booking.time}` : booking.date,
  ).getTime();
  const isLateCancellation =
    scheduledTime - now.getTime() <= 4 * 60 * 60 * 1000;
  const warningCount =
    (customer.lateCancellationWarningCount ?? 0) + (isLateCancellation ? 1 : 0);
  const priorityStatus = warningCount >= 3 ? "LOW_PRIORITIED" : "normal";

  await db
    .update(schema.bookings)
    .set({
      status: "cancelled",
      cancelledAt: now,
      isLateCancellation,
      updatedAt: now,
    })
    .where(eq(schema.bookings.id, bookingId));

  await db
    .update(schema.loyaltyCustomers)
    .set({
      lateCancellationWarningCount: warningCount,
      priorityStatus,
      updatedAt: now,
    })
    .where(eq(schema.loyaltyCustomers.id, customer.id));

  await db.insert(schema.auditLogs).values({
    id: createId(),
    actor: customer.id,
    actionType: isLateCancellation
      ? "late-cancellation-warning"
      : "booking-cancelled",
    entityType: "booking",
    entityId: booking.id,
    details: isLateCancellation
      ? `Late cancellation warning ${warningCount} of 3.`
      : "Booking cancelled within the permitted notice period.",
  });

  booking.status = "cancelled";
  booking.cancelledAt = now.toISOString();
  booking.isLateCancellation = isLateCancellation;

  return {
    success: true,
    booking,
    isLateCancellation,
    warningCount,
    priorityStatus,
  };
}

export async function createBooking(
  phone: string,
  vehiclePlate: string,
  requestedDate: string,
) {
  if (!db) {
    throw new Error("Database connection is not available.");
  }

  const normalizedVehiclePlate = normalizePlate(vehiclePlate);
  const customer = await findCustomerRecord(phone, normalizedVehiclePlate);
  if (!customer) {
    throw new Error(
      "Customer not found for the provided phone or vehicle plate.",
    );
  }

  const vehicle = customer.vehicles.find(
    (item) => item.plate === normalizedVehiclePlate,
  );
  if (!vehicle) {
    throw new Error("Vehicle not linked to the loyalty account.");
  }

  const requested = new Date(requestedDate);
  const today = new Date();
  const requestedDay = new Date(requestedDate);
  requestedDay.setHours(0, 0, 0, 0);
  const todayDay = new Date(today);
  todayDay.setHours(0, 0, 0, 0);
  const tier = getTier(customer.tierId);
  const latestAllowedDate = new Date(todayDay);
  latestAllowedDate.setDate(
    latestAllowedDate.getDate() + tier.bookingWindowDays,
  );

  if (requestedDay < todayDay) {
    throw new Error("Requested booking date must be today or later.");
  }

  const bookingId = createId();
  const appliedPerks = getAppliedPerks(tier.id);

  if (requestedDay > latestAllowedDate) {
    const note = `Booking date is outside the ${tier.bookingWindowDays}-day window.`;
    const booking: Booking = {
      id: bookingId,
      customerId: customer.id,
      vehiclePlate: normalizedVehiclePlate,
      date: requested.toISOString().split("T")[0],
      createdAt: new Date().toISOString(),
      appliedPerks,
      status: "blocked",
      note,
    };

    await db.insert(schema.bookings).values({
      id: bookingId,
      customerId: customer.id,
      vehiclePlate: normalizedVehiclePlate,
      date: requested,
      status: "blocked",
      appliedPerks,
      note,
    });

    const nextEligible = latestAllowedDate.toISOString().split("T")[0];
    return {
      success: false,
      reason: note,
      nextEligibleBookingDate: nextEligible,
      booking,
    };
  }

  const booking: Booking = {
    id: bookingId,
    customerId: customer.id,
    vehiclePlate: normalizedVehiclePlate,
    date: requested.toISOString().split("T")[0],
    createdAt: new Date().toISOString(),
    appliedPerks,
    status: "confirmed",
  };

  await db.insert(schema.bookings).values({
    id: bookingId,
    customerId: customer.id,
    vehiclePlate: normalizedVehiclePlate,
    date: requested,
    status: "confirmed",
    appliedPerks,
  });

  return {
    success: true,
    booking,
  };
}

export async function getRewardRecommendations(phone: string) {
  const customer = await findCustomerRecord(phone);
  if (!customer) {
    return [] as RewardOffer[];
  }
  const rewardOffers = await fetchAllRewards();
  return suggestRewards(customer, rewardOffers);
}
