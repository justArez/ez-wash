import type { TimeSlotWithComputedFields } from "../models/loyalty.model";
import { db, schema } from "../db/index";
import { sql } from "drizzle-orm";

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

// Bookings may store time as "HH:MM" (24h) or "H:MM AM/PM"; normalize so both compare equal.
function normalizeTimeTo24h(timeStr: string | null | undefined): string | null {
  if (!timeStr) return null;
  const trimmed = timeStr.trim();

  const ampmMatch = trimmed.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (ampmMatch) {
    let hour = parseInt(ampmMatch[1], 10);
    const minutes = ampmMatch[2];
    const meridiem = ampmMatch[3].toUpperCase();
    if (meridiem === "PM" && hour !== 12) hour += 12;
    if (meridiem === "AM" && hour === 12) hour = 0;
    return `${String(hour).padStart(2, "0")}:${minutes}`;
  }

  const hmMatch = trimmed.match(/^(\d{1,2}):(\d{2})$/);
  if (hmMatch) {
    return `${hmMatch[1].padStart(2, "0")}:${hmMatch[2]}`;
  }

  return trimmed;
}

export async function generateSlotsForDate(
  dateStr: string,
): Promise<TimeSlotWithComputedFields[]> {
  if (!db) {
    throw new Error("Database connection is not available.");
  }

  const dateBookings = await db
    .select()
    .from(schema.bookings)
    .where(
      sql`${schema.bookings.status} = 'confirmed' AND ${schema.bookings.date}::date = ${dateStr}::date`,
    );

  return computeSlotsForDate(dateStr, dateBookings);
}

function computeSlotsForDate(
  dateStr: string,
  dateBookings: (typeof schema.bookings.$inferSelect)[],
): TimeSlotWithComputedFields[] {
  const targetDate = new Date(dateStr + "T00:00:00");
  const dayOfWeek = DAYS_OF_WEEK[targetDate.getDay()];
  const dayDisplayDate = `${String(targetDate.getDate()).padStart(2, "0")}/${String(targetDate.getMonth() + 1).padStart(2, "0")}`;
  const now = new Date();

  return OPERATING_HOURS.map((timeStr) => {
    const slotId = `slot-${dateStr}-${timeStr.replace(":", "")}`;
    const displayTime = formatDisplayTime(timeStr);

    const slotStart = new Date(`${dateStr}T${timeStr}:00`);
    const isPast = slotStart.getTime() < now.getTime();

    const slotBookings = dateBookings.filter(
      (b) => normalizeTimeTo24h(b.timeSlot) === timeStr,
    );

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

export async function getSlotsForDays(
  daysCount = 7,
  startDateStr?: string,
): Promise<TimeSlotWithComputedFields[]> {
  if (!db) {
    throw new Error("Database connection is not available.");
  }

  const start = startDateStr
    ? new Date(startDateStr + "T00:00:00")
    : new Date();

  const dateStrs: string[] = [];
  for (let i = 0; i < daysCount; i++) {
    const current = new Date(start);
    current.setDate(start.getDate() + i);
    dateStrs.push(current.toISOString().split("T")[0]);
  }

  const rangeStart = dateStrs[0];
  const rangeEnd = dateStrs[dateStrs.length - 1];

  // Single query for the whole range instead of one query per day (was causing multi-second latency for 14-day fetches).
  const rangeBookings = await db
    .select()
    .from(schema.bookings)
    .where(
      sql`${schema.bookings.status} = 'confirmed' AND ${schema.bookings.date}::date BETWEEN ${rangeStart}::date AND ${rangeEnd}::date`,
    );

  const bookingsByDate = new Map<
    string,
    (typeof schema.bookings.$inferSelect)[]
  >();
  for (const booking of rangeBookings) {
    const key = booking.date.toISOString().split("T")[0];
    const list = bookingsByDate.get(key);
    if (list) {
      list.push(booking);
    } else {
      bookingsByDate.set(key, [booking]);
    }
  }

  const result: TimeSlotWithComputedFields[] = [];
  for (const dateStr of dateStrs) {
    result.push(
      ...computeSlotsForDate(dateStr, bookingsByDate.get(dateStr) || []),
    );
  }

  return result;
}
