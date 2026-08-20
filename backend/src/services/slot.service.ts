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

export async function generateSlotsForDate(
  dateStr: string,
): Promise<TimeSlotWithComputedFields[]> {
  if (!db) {
    throw new Error("Database connection is not available.");
  }

  const targetDate = new Date(dateStr + "T00:00:00");
  const dayOfWeek = DAYS_OF_WEEK[targetDate.getDay()];
  const dayDisplayDate = `${String(targetDate.getDate()).padStart(2, "0")}/${String(targetDate.getMonth() + 1).padStart(2, "0")}`;
  const now = new Date();

  const dateBookings = await db
    .select()
    .from(schema.bookings)
    .where(
      sql`${schema.bookings.status} = 'confirmed' AND ${schema.bookings.date}::date = ${dateStr}::date`,
    );

  return OPERATING_HOURS.map((timeStr) => {
    const slotId = `slot-${dateStr}-${timeStr.replace(":", "")}`;
    const displayTime = formatDisplayTime(timeStr);

    const slotStart = new Date(`${dateStr}T${timeStr}:00`);
    const isPast = slotStart.getTime() < now.getTime();

    const slotBookings = dateBookings.filter((b) => b.timeSlot === timeStr);

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
  const result: TimeSlotWithComputedFields[] = [];
  const start = startDateStr
    ? new Date(startDateStr + "T00:00:00")
    : new Date();

  for (let i = 0; i < daysCount; i++) {
    const current = new Date(start);
    current.setDate(start.getDate() + i);
    const dateStr = current.toISOString().split("T")[0];
    const dailySlots = await generateSlotsForDate(dateStr);
    result.push(...dailySlots);
  }

  return result;
}
