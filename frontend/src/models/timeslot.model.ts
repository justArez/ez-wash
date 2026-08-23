export type SlotStatus =
  | "available"
  | "booked"
  | "maintenance"
  | "unavailable"
  | "peak";

export interface TimeSlot {
  id: string;
  date: string;
  time: string;
  displayTime?: string;
  duration: number;
  status: SlotStatus;
  capacity: number;
  currentBookings: number;
  dayOfWeek?: string;
  dayDisplayDate?: string;
  bayId?: string;
}

export interface TimeSlotWithComputedFields extends TimeSlot {
  isAvailable: boolean;
  isPast: boolean;
  slotLabel: string;
  timeLabel: string;
}

export type AvailableSlot = string;

export interface ScheduleBlock {
  id: string;
  type: "maintenance" | "day_off" | "holiday" | "custom_block";
  title: string;
  reason?: string;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  startTime?: string; // HH:MM
  endTime?: string; // HH:MM
  bayId?: string; // 'all', '1', '2', '3', '4'
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}
