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
