import type { Promotion, TimeSlot } from "../types/homepage.types";

const now = new Date();

const isoDate = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatTime = (hour: number, minute: number): string => {
  const suffix = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${String(minute).padStart(2, "0")} ${suffix}`;
};

export const mockPromotions: Promotion[] = [
  {
    id: "mock-spring-shine",
    name: "Spring Shine Special",
    description:
      "Give your vehicle a fresh finish with a complete automated wash.",
    discountPercentage: 20,
    loyaltyPointsRequired: 0,
    loyaltyPointsValue: 40,
    expiryDate: new Date(
      now.getTime() + 14 * 24 * 60 * 60 * 1000,
    ).toISOString(),
    category: "discount",
    terms:
      "Valid for one wash per customer. Cannot be combined with other offers.",
    isActive: true,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  },
  {
    id: "mock-double-points",
    name: "Double Points Tuesday",
    description:
      "Earn twice the loyalty points when you wash with us on Tuesday.",
    discountPercentage: 0,
    loyaltyPointsRequired: 0,
    loyaltyPointsValue: 80,
    expiryDate: new Date(
      now.getTime() + 30 * 24 * 60 * 60 * 1000,
    ).toISOString(),
    category: "points_bonus",
    terms: "Available every Tuesday during the promotional period.",
    isActive: true,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  },
  {
    id: "mock-welcome-wash",
    name: "Welcome Wash",
    description: "New members get a discount on their first scheduled wash.",
    discountPercentage: 25,
    loyaltyPointsRequired: 0,
    loyaltyPointsValue: 25,
    expiryDate: new Date(
      now.getTime() + 45 * 24 * 60 * 60 * 1000,
    ).toISOString(),
    category: "new_member",
    terms: "For new loyalty members only. One redemption per account.",
    isActive: true,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  },
];

export const createMockTimeSlots = (days = 7): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  const times = Array.from({ length: 19 }, (_, index) => {
    const totalMinutes = 9 * 60 + index * 30;
    return {
      hour: Math.floor(totalMinutes / 60),
      minute: totalMinutes % 60,
    };
  });

  for (let dayOffset = 0; dayOffset < days; dayOffset += 1) {
    const date = new Date(now);
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() + dayOffset);

    times.forEach(({ hour, minute }, timeIndex) => {
      const status =
        dayOffset === 2 && timeIndex === 5
          ? "maintenance"
          : dayOffset === 1 && timeIndex === 9
            ? "booked"
            : "available";
      const currentBookings =
        status === "booked" ? 4 : status === "available" ? timeIndex % 2 : 0;

      slots.push({
        id: `mock-slot-${dayOffset}-${hour}-${minute}`,
        date: isoDate(date),
        time: `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}`,
        displayTime: formatTime(hour, minute),
        duration: 30,
        status,
        capacity: 4,
        currentBookings,
        dayOfWeek: date.toLocaleDateString("en-US", { weekday: "long" }),
        dayDisplayDate: date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
      });
    });
  }

  return slots;
};
