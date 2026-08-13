import { getAppliedPerks, getNextBookingWindowDate, getTier, } from "./tierService";
import { suggestRewards } from "./rewardService";
function createId() {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}
function normalizePlate(plate) {
    return plate.trim().toUpperCase();
}
export function findCustomer(store, phone, plate) {
    const normalizedPhone = phone.trim();
    const normalizedPlate = plate ? normalizePlate(plate) : undefined;
    return store.customers.find((customer) => {
        if (customer.phone === normalizedPhone) {
            return true;
        }
        if (normalizedPlate && customer.licensePlates.includes(normalizedPlate)) {
            return true;
        }
        return false;
    });
}
export function linkAccount(store, phone, plate, model, type) {
    const normalizedPhone = phone.trim();
    const normalizedPlate = normalizePlate(plate);
    const existingCustomer = findCustomer(store, normalizedPhone, normalizedPlate);
    const now = new Date().toISOString();
    const vehicle = {
        plate: normalizedPlate,
        model: model.trim() || "Unknown model",
        type,
    };
    if (existingCustomer) {
        if (!existingCustomer.licensePlates.includes(normalizedPlate)) {
            existingCustomer.licensePlates.push(normalizedPlate);
        }
        const vehicleExists = existingCustomer.vehicles.some((item) => item.plate === normalizedPlate);
        if (!vehicleExists) {
            existingCustomer.vehicles.push(vehicle);
        }
        existingCustomer.updatedAt = now;
        return existingCustomer;
    }
    const newCustomer = {
        id: createId(),
        phone: normalizedPhone,
        licensePlates: [normalizedPlate],
        tierId: "member",
        pointsBalance: 0,
        vehicles: [vehicle],
        pointHistory: [],
        bookingHistory: [],
        createdAt: now,
        updatedAt: now,
    };
    store.customers.push(newCustomer);
    return newCustomer;
}
export function buildDashboard(store, phone) {
    const customer = findCustomer(store, phone);
    if (!customer) {
        return null;
    }
    const tier = getTier(customer.tierId);
    const today = new Date().toISOString().split("T")[0];
    const nextBookingDate = getNextBookingWindowDate(today, tier.id);
    return {
        customerId: customer.id,
        phone: customer.phone,
        tier,
        pointsBalance: customer.pointsBalance,
        vehicles: customer.vehicles,
        loyaltyTier: tier,
        nextEligibleBookingDate: nextBookingDate,
        appliedPerks: getAppliedPerks(tier.id),
        rewardSuggestions: suggestRewards(customer, store),
        bookingHistory: customer.bookingHistory.slice(-5).reverse(),
        pointHistory: customer.pointHistory.slice(-10).reverse(),
    };
}
export function createBooking(store, phone, vehiclePlate, requestedDate) {
    const customer = findCustomer(store, phone, vehiclePlate);
    if (!customer) {
        throw new Error("Customer not found for the provided phone or vehicle plate.");
    }
    const normalizedVehiclePlate = normalizePlate(vehiclePlate);
    const vehicle = customer.vehicles.find((item) => item.plate === normalizedVehiclePlate);
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
    latestAllowedDate.setDate(latestAllowedDate.getDate() + tier.bookingWindowDays);
    if (requestedDay < todayDay) {
        throw new Error("Requested booking date must be today or later.");
    }
    const booking = {
        id: createId(),
        customerId: customer.id,
        vehiclePlate: normalizedVehiclePlate,
        date: requested.toISOString().split("T")[0],
        createdAt: new Date().toISOString(),
        appliedPerks: getAppliedPerks(tier.id),
        status: "confirmed",
    };
    if (requested > latestAllowedDate) {
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
export function getRewardRecommendations(store, phone) {
    const customer = findCustomer(store, phone);
    if (!customer) {
        return [];
    }
    return suggestRewards(customer, store);
}
