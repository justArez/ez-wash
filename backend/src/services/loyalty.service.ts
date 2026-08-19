import type {
  Booking,
  LoyaltyCustomer,
  LoyaltyStore,
  RewardOffer,
  Vehicle,
} from "../models/loyalty.model";
import {
  getAppliedPerks,
  getNextBookingWindowDate,
  getTier,
} from "./tier.service";
import { suggestRewards } from "./reward.service";

function createId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function normalizePlate(plate: string) {
  return plate.trim().toUpperCase();
}

export function findCustomer(
  store: LoyaltyStore,
  phoneOrUsernameOrEmail?: string,
  plate?: string,
) {
  const normalizedIdent = phoneOrUsernameOrEmail
    ? phoneOrUsernameOrEmail.trim().toLowerCase()
    : "";
  const normalizedPlate = plate ? normalizePlate(plate) : undefined;

  if (!normalizedIdent && !normalizedPlate) {
    return undefined;
  }

  const found = store.customers.find((customer) => {
    if (normalizedIdent) {
      if (customer.phone && customer.phone.toLowerCase() === normalizedIdent) {
        return true;
      }
      if (
        customer.username &&
        customer.username.toLowerCase() === normalizedIdent
      ) {
        return true;
      }
      if (customer.email && customer.email.toLowerCase() === normalizedIdent) {
        return true;
      }
    }
    if (
      normalizedPlate &&
      customer.licensePlates &&
      customer.licensePlates.includes(normalizedPlate)
    ) {
      return true;
    }
    return false;
  });

  console.log(
    `[LoyaltyService] findCustomer(ident: "${normalizedIdent}", plate: "${normalizedPlate}") -> ${found ? `Found Customer (ID: ${found.id}, user: ${found.username || found.phone})` : "Not found"}`,
  );
  return found;
}

export function linkAccount(
  store: LoyaltyStore,
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
) {
  const normalizedPhone = phone ? phone.trim() : "";
  const normalizedPlate = plate ? normalizePlate(plate) : undefined;
  const username = options?.username?.trim();
  const email = options?.email?.trim();
  const fullName = options?.fullName?.trim();

  console.log(`[LoyaltyService] linkAccount invoked with options:`, {
    phone: normalizedPhone,
    username,
    email,
    plate: normalizedPlate,
  });

  // Find existing customer by username, phone, email, or plate
  let existingCustomer: LoyaltyCustomer | undefined;
  if (username) {
    existingCustomer = findCustomer(store, username);
  }
  if (!existingCustomer && normalizedPhone) {
    existingCustomer = findCustomer(store, normalizedPhone);
  }
  if (!existingCustomer && email) {
    existingCustomer = findCustomer(store, email);
  }
  if (!existingCustomer && normalizedPlate) {
    existingCustomer = findCustomer(store, "", normalizedPlate);
  }

  const now = new Date().toISOString();

  const vehicle: Vehicle | undefined = normalizedPlate
    ? {
        plate: normalizedPlate,
        model: model?.trim() || "Default Vehicle",
        type: type || "car",
      }
    : undefined;

  if (existingCustomer) {
    if (
      normalizedPlate &&
      !existingCustomer.licensePlates.includes(normalizedPlate)
    ) {
      existingCustomer.licensePlates.push(normalizedPlate);
    }
    if (vehicle) {
      existingCustomer.vehicles = existingCustomer.vehicles || [];
      const vehicleExists = existingCustomer.vehicles.some(
        (item) => item.plate === normalizedPlate,
      );
      if (!vehicleExists) {
        existingCustomer.vehicles.push(vehicle);
      }
    }
    if (username && !existingCustomer.username) {
      existingCustomer.username = username;
    }
    if (email && !existingCustomer.email) {
      existingCustomer.email = email;
    }
    if (fullName && !existingCustomer.fullName) {
      existingCustomer.fullName = fullName;
    }
    if (normalizedPhone && !existingCustomer.phone) {
      existingCustomer.phone = normalizedPhone;
    }
    if (options?.password) {
      existingCustomer.password = options.password;
    }
    existingCustomer.updatedAt = now;
    return existingCustomer;
  }

  const newCustomer: LoyaltyCustomer = {
    id: createId(),
    phone: normalizedPhone || (username ? username : `acc-${Date.now()}`),
    username: username || undefined,
    email: email || undefined,
    fullName:
      fullName ||
      username ||
      (normalizedPhone ? `User ${normalizedPhone}` : "New Member"),
    password: options?.password || undefined,
    licensePlates: normalizedPlate ? [normalizedPlate] : [],
    tierId: "member",
    tierName: "Member",
    pointsBalance: 0,
    vehicles: vehicle ? [vehicle] : [],
    pointHistory: [],
    bookingHistory: [],
    lateCancellationWarningCount: 0,
    priorityStatus: "normal",
    status: "Active",
    createdAt: now,
    updatedAt: now,
  };

  store.customers.push(newCustomer);
  return newCustomer;
}

export function buildDashboard(store: LoyaltyStore, phone: string) {
  console.log(
    `[LoyaltyService] buildDashboard invoked for identifier: "${phone}"`,
  );
  const customer = findCustomer(store, phone);
  if (!customer) {
    return null;
  }

  const tier = getTier(customer.tierId, store);
  const today = new Date().toISOString().split("T")[0];
  const nextBookingDate = getNextBookingWindowDate(today, tier.id, store);

  return {
    customerId: customer.id,
    phone: customer.phone,
    username: customer.username,
    fullName: customer.fullName,
    email: customer.email,
    tier,
    pointsBalance: customer.pointsBalance,
    vehicles: customer.vehicles,
    nextEligibleBookingDate: nextBookingDate,
    appliedPerks: getAppliedPerks(tier.id, store),
    rewardSuggestions: suggestRewards(customer, store),
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

export function cancelBooking(
  store: LoyaltyStore,
  phone: string,
  bookingId: string,
  now = new Date(),
) {
  const customer = findCustomer(store, phone);
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

  booking.status = "cancelled";
  booking.cancelledAt = now.toISOString();
  booking.isLateCancellation = isLateCancellation;
  customer.lateCancellationWarningCount = warningCount;
  customer.priorityStatus = priorityStatus;
  customer.updatedAt = now.toISOString();
  store.auditLogs.push({
    id: createId(),
    actor: customer.id,
    actionType: isLateCancellation
      ? "late-cancellation-warning"
      : "booking-cancelled",
    entityType: "booking",
    entityId: booking.id,
    timestamp: now.toISOString(),
    details: isLateCancellation
      ? `Late cancellation warning ${warningCount} of 3.`
      : "Booking cancelled within the permitted notice period.",
  });

  return {
    success: true,
    booking,
    isLateCancellation,
    warningCount,
    priorityStatus,
  };
}

export function createBooking(
  store: LoyaltyStore,
  phone: string,
  vehiclePlate: string,
  requestedDate: string,
) {
  const customer = findCustomer(store, phone, vehiclePlate);
  if (!customer) {
    throw new Error(
      "Customer not found for the provided phone or vehicle plate.",
    );
  }

  const normalizedVehiclePlate = normalizePlate(vehiclePlate);
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
  const tier = getTier(customer.tierId, store);
  const latestAllowedDate = new Date(todayDay);
  latestAllowedDate.setDate(
    latestAllowedDate.getDate() + tier.bookingWindowDays,
  );

  if (requestedDay < todayDay) {
    throw new Error("Requested booking date must be today or later.");
  }

  const booking: Booking = {
    id: createId(),
    customerId: customer.id,
    vehiclePlate: normalizedVehiclePlate,
    date: requested.toISOString().split("T")[0],
    createdAt: new Date().toISOString(),
    appliedPerks: getAppliedPerks(tier.id, store),
    status: "confirmed",
  };

  if (requestedDay > latestAllowedDate) {
    booking.status = "blocked";
    booking.note = `Booking date is outside the ${tier.bookingWindowDays}-day window.`;
    customer.bookingHistory.push(booking);
    const nextEligible = latestAllowedDate.toISOString().split("T")[0];
    return {
      success: false,
      reason: booking.note,
      nextEligibleBookingDate: nextEligible,
      booking,
    };
  }

  customer.bookingHistory.push(booking);
  customer.updatedAt = new Date().toISOString();

  return {
    success: true,
    booking,
  };
}

export function getRewardRecommendations(store: LoyaltyStore, phone: string) {
  const customer = findCustomer(store, phone);
  if (!customer) {
    return [] as RewardOffer[];
  }
  return suggestRewards(customer, store);
}
