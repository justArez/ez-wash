import type {
  Booking,
  BookingStatus,
  LoyaltyCustomer,
  LoyaltyStore,
  Vehicle,
} from "../models/loyalty.model";
import { findCustomer } from "./loyalty.service";
import { getTier } from "./tier.service";
import { getServiceById } from "./service.service";

function createId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
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
