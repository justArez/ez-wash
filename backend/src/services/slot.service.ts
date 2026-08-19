import type {
  LoyaltyStore,
  TimeSlot,
  TimeSlotWithComputedFields,
} from "../models/loyalty.model";

const OPERATING_HOURS = [
  "09:00",
  "09:30",
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "13:30",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
];

const DAYS_OF_WEEK = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const TOTAL_BAY_CAPACITY = 4;

function formatDisplayTime(timeStr: string): string {
  const [hourStr, minStr] = timeStr.split(":");
  let hour = parseInt(hourStr, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12;
  const formattedHour = hour < 10 ? `0${hour}` : `${hour}`;
  return `${formattedHour}:${minStr} ${ampm}`;
}

export function generateSlotsForDate(
  store: LoyaltyStore,
  dateStr: string,
): TimeSlotWithComputedFields[] {
  const targetDate = new Date(dateStr + "T00:00:00");
  const dayOfWeek = DAYS_OF_WEEK[targetDate.getDay()];
  const dayDisplayDate = `${String(targetDate.getDate()).padStart(2, "0")}/${String(targetDate.getMonth() + 1).padStart(2, "0")}`;
  const now = new Date();

  // Find all confirmed bookings for this date across all customers
  const allBookings = store.customers.flatMap((c) => c.bookingHistory || []);
  const dateBookings = allBookings.filter(
    (b) =>
      b.status === "confirmed" &&
      (b.date === dateStr || b.date.startsWith(dateStr)),
  );

  return OPERATING_HOURS.map((timeStr) => {
    const slotId = `slot-${dateStr}-${timeStr.replace(":", "")}`;
    const displayTime = formatDisplayTime(timeStr);

    const slotStart = new Date(`${dateStr}T${timeStr}:00`);
    const isPast = slotStart.getTime() < now.getTime();

    // Count bookings assigned to this time slot
    const slotBookings = dateBookings.filter((b) => {
      if (b.timeSlot === timeStr || b.time === timeStr) return true;
      if (b.timeSlot === displayTime) return true;
      return false;
    });

    const currentBookings = slotBookings.length;
    let status: "available" | "booked" | "maintenance" = "available";

    if (currentBookings >= TOTAL_BAY_CAPACITY || isPast) {
      status = "booked";
    }

    const isAvailable = !isPast && currentBookings < TOTAL_BAY_CAPACITY;

    return {
      id: slotId,
      date: dateStr,
      time: timeStr,
      displayTime,
      duration: 30,
      status,
      capacity: TOTAL_BAY_CAPACITY,
      currentBookings,
      dayOfWeek,
      dayDisplayDate,
      isAvailable,
      isPast,
      slotLabel: `${dayOfWeek} (${dayDisplayDate})`,
      timeLabel: displayTime,
    };
  });
}

export function getSlotsForDays(
  store: LoyaltyStore,
  daysCount = 7,
  startDateStr?: string,
): TimeSlotWithComputedFields[] {
  const result: TimeSlotWithComputedFields[] = [];
  const start = startDateStr
    ? new Date(startDateStr + "T00:00:00")
    : new Date();

  for (let i = 0; i < daysCount; i++) {
    const current = new Date(start);
    current.setDate(start.getDate() + i);
    const dateStr = current.toISOString().split("T")[0];
    const dailySlots = generateSlotsForDate(store, dateStr);
    result.push(...dailySlots);
  }

  return result;
}
