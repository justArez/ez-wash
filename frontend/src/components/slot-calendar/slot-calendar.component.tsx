/**
 * SlotCalendar Component - Main 7-day slot calendar display
 * Feature: 004-homepage-shadcn-redesign - User Story 1
 *
 * Displays available time slots organized by day with:
 * - 7 columns on desktop, 3-4 on tablet, 1 on mobile (responsive)
 * - Skeleton loaders during loading
 * - Error handling with Alert
 * - Manual refresh button with countdown
 * - 5-minute auto-refresh
 */

import React, { useState, useEffect } from "react";
import { AlertTriangle, ChevronLeft, ChevronRight, Lock } from "lucide-react";
import type {
  TimeSlot,
  TimeSlotWithComputedFields,
  SlotCalendarProps,
} from "../../types/homepage.types";
import "./slot-calendar.component.scss";
import { useSlots } from "../../hooks/useSlots";
import { SlotCard } from "../slot-card/slot-card.component";
import { SlotRefreshButton } from "../slot-refresh-button/slot-refresh-button.component";
import { fetchUserBookings } from "../../services/loyalty.service";

const STANDARD_OPERATING_HOURS = [
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

interface DayInfo {
  dateStr: string;
  dayOfWeek: string;
  dayDisplayDate: string;
  slotLabel: string;
  dayIndex: number; // 0 for today, 1 for tomorrow, etc.
}

const formatLocalDateStr = (d: Date): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const getDaysForWeek = (weekOffset: number): DayInfo[] => {
  const result: DayInfo[] = [];
  const now = new Date();
  const startDay = weekOffset * 7;
  for (let i = 0; i < 7; i++) {
    const dayIndex = startDay + i;
    const d = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + dayIndex,
    );
    const dateStr = formatLocalDateStr(d);
    const dayOfWeek = DAYS_OF_WEEK[d.getDay()];
    const dayDisplayDate = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
    const slotLabel = `${dayOfWeek} (${dayDisplayDate})`;
    result.push({ dateStr, dayOfWeek, dayDisplayDate, slotLabel, dayIndex });
  }
  return result;
};

function formatDisplayTime(timeStr: string): string {
  const [hourStr, minStr] = timeStr.split(":");
  let hour = parseInt(hourStr, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  hour = hour % 12 || 12;
  const formattedHour = hour < 10 ? `0${hour}` : `${hour}`;
  return `${formattedHour}:${minStr} ${ampm}`;
}

function getRequiredTierForDay(dayIndex: number): string {
  if (dayIndex < 7) return "Member";
  if (dayIndex < 10) return "Silver";
  if (dayIndex < 12) return "Gold";
  return "Platinum";
}

// Skeleton loader component
const SkeletonSlot: React.FC = () => (
  <div className="p-4 rounded-lg border-2 border-gray-200 bg-gray-100 animate-pulse">
    <div className="h-6 bg-gray-300 rounded w-3/4 mx-auto mb-2"></div>
    <div className="h-4 bg-gray-300 rounded w-1/2 mx-auto"></div>
  </div>
);

const isPastSlot = (slot: { date: string; time: string }): boolean => {
  const [year, month, day] = slot.date.slice(0, 10).split("-").map(Number);
  const [hour, minute] = slot.time.split(":").map(Number);
  const now = new Date();
  const todayKey =
    now.getFullYear() * 10000 + (now.getMonth() + 1) * 100 + now.getDate();
  const slotDayKey = year * 10000 + month * 100 + day;

  if (slotDayKey !== todayKey) {
    return slotDayKey < todayKey;
  }

  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  return hour * 60 + minute <= currentMinutes;
};

const getClosestTime = (times: string[]): string | null => {
  if (times.length === 0) return null;
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  let closest = times[0];
  let minDiff = Infinity;

  for (const time of times) {
    const [hour, minute] = time.split(":").map(Number);
    const slotMinutes = hour * 60 + minute;
    const diff = Math.abs(slotMinutes - currentMinutes);
    if (diff < minDiff) {
      minDiff = diff;
      closest = time;
    }
  }

  return closest;
};

function timeToMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + m;
}

const addComputedFields = (slot: TimeSlot): TimeSlotWithComputedFields => {
  const isPast = isPastSlot(slot);
  const effectiveStatus =
    slot.status === "available" && slot.currentBookings >= slot.capacity
      ? "booked"
      : slot.status;

  return {
    ...slot,
    displayTime: slot.displayTime || formatDisplayTime(slot.time),
    status: effectiveStatus,
    isAvailable:
      !isPast &&
      effectiveStatus === "available" &&
      slot.currentBookings < slot.capacity,
    isPast,
    slotLabel: `${slot.dayOfWeek} (${slot.dayDisplayDate})`,
    timeLabel: slot.displayTime || formatDisplayTime(slot.time),
  };
};

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

  const wordTimeMatch = trimmed.match(/(\d{1,2}:\d{2}(?:\s*(?:AM|PM))?)/i);
  if (wordTimeMatch) {
    return normalizeTimeTo24h(wordTimeMatch[1]);
  }

  return trimmed;
}

function normalizeBookingDate(
  dateStr: string | null | undefined,
): string | null {
  if (!dateStr) return null;
  return dateStr.slice(0, 10);
}

const TIER_ADVANCE_DAYS: Record<string, { label: string; days: number }> = {
  member: { label: "Member", days: 7 },
  silver: { label: "Silver", days: 10 },
  gold: { label: "Gold", days: 12 },
  platinum: { label: "Platinum", days: 14 },
};

export const SlotCalendar: React.FC<SlotCalendarProps> = ({
  selectedSlotId,
  onSlotClick,
  onLoadingChange,
  onErrorChange,
  dashboard,
  userBookings,
  refreshTrigger,
  initialTierId,
}) => {
  // Current logged in customer's tier information
  const userTierId = (
    dashboard?.tier?.id ||
    initialTierId ||
    "member"
  ).toLowerCase();

  const tierBookingWindowDays =
    dashboard?.tier?.bookingWindowDays ??
    TIER_ADVANCE_DAYS[userTierId]?.days ??
    7;

  const tierName =
    dashboard?.tier?.name ?? TIER_ADVANCE_DAYS[userTierId]?.label ?? "Member";

  // Tier sufficiency for week 2 (days 7-13): requires > 7 days window
  const canGoNextWeek = tierBookingWindowDays > 7;

  // Week offset state: 0 = Week 1 (Days 0-6), 1 = Week 2 (Days 7-13)
  const [weekOffset, setWeekOffset] = useState<number>(0);

  // Fetch up to 14 days so both weeks are immediately available
  const { slots, loading, error, refetch, nextRefreshCountdown } = useSlots(14);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [fetchedUserBookings, setFetchedUserBookings] = useState<
    Array<{
      id?: string;
      date: string;
      time?: string;
      timeSlot?: string;
      status?: string;
      durationMinutes?: number;
      vehiclePlate?: string;
      service?: string;
      serviceName?: string;
    }>
  >([]);
  const tableContainerRef = React.useRef<HTMLDivElement>(null);
  const theadRef = React.useRef<HTMLTableSectionElement>(null);
  const rowRefs = React.useRef<Map<string, HTMLTableRowElement>>(new Map());

  // Refetch when external refreshTrigger changes (e.g. after a booking confirmation)
  useEffect(() => {
    if (refreshTrigger) {
      refetch();
    }
  }, [refreshTrigger, refetch]);

  // Fetch user bookings from API when identifier is available or on refresh
  useEffect(() => {
    const identifier =
      dashboard?.phone || dashboard?.username || dashboard?.email;
    if (!identifier) {
      return;
    }
    fetchUserBookings(identifier)
      .then((res) => {
        if (res?.bookingHistory) {
          setFetchedUserBookings(res.bookingHistory);
        }
      })
      .catch(() => {
        // fallback to dashboard.bookingHistory
      });
  }, [dashboard?.phone, dashboard?.username, dashboard?.email, refreshTrigger]);

  // Combine all user booking sources
  const allUserBookings = React.useMemo(() => {
    const combined = [
      ...(dashboard?.bookingHistory || []),
      ...(userBookings || []),
      ...fetchedUserBookings,
    ];
    const map = new Map<string, (typeof combined)[number]>();
    combined.forEach((b, idx) => {
      const key = b.id || `idx-${idx}-${b.date}-${b.time || b.timeSlot}`;
      map.set(key, b);
    });
    return Array.from(map.values());
  }, [dashboard?.bookingHistory, userBookings, fetchedUserBookings]);

  // Notify parent of loading state
  useEffect(() => {
    onLoadingChange?.(loading);
  }, [loading, onLoadingChange]);

  // Notify parent of error state
  useEffect(() => {
    onErrorChange?.(error);
  }, [error, onErrorChange]);

  // Handle manual refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      const identifier =
        dashboard?.phone || dashboard?.username || dashboard?.email;
      if (identifier) {
        const res = await fetchUserBookings(identifier);
        if (res?.bookingHistory) {
          setFetchedUserBookings(res.bookingHistory);
        }
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  // Build a row-oriented matrix for the currently active week
  const { sortedDays, sortedTimes, slotByDayAndTime, currentWeekDays } =
    React.useMemo(() => {
      const daysList = getDaysForWeek(weekOffset);
      const mappedApiSlots = slots.map(addComputedFields);

      // Collect all unique times (standard hours + any from API)
      const timesSet = new Set<string>(STANDARD_OPERATING_HOURS);
      mappedApiSlots.forEach((slot) => timesSet.add(slot.time));
      const times = Array.from(timesSet).sort();

      const matrix = new Map<string, TimeSlotWithComputedFields>();

      // Index API slots by date (YYYY-MM-DD) and time (HH:MM)
      const apiSlotMap = new Map<string, TimeSlotWithComputedFields>();
      mappedApiSlots.forEach((slot) => {
        const datePart = slot.date.slice(0, 10);
        apiSlotMap.set(`${datePart}|${slot.time}`, slot);
      });

      // Populate every day and every time for the active week
      daysList.forEach((dayInfo) => {
        const isTierLocked = dayInfo.dayIndex >= tierBookingWindowDays;
        const requiredTier = getRequiredTierForDay(dayInfo.dayIndex);

        times.forEach((time) => {
          const key = `${dayInfo.dateStr}|${time}`;
          const existingSlot = apiSlotMap.get(key);
          const isPast = isPastSlot({ date: dayInfo.dateStr, time });
          const displayTime = formatDisplayTime(time);
          const currentSlotMinutes = timeToMinutes(time);

          // Find any active booking by this user covering this slot interval: [start, start + duration)
          // Only user bookings with "confirmed" or "pending" status count as user booked (blue mark)
          const matchingUserBookings = allUserBookings.filter((b) => {
            const status = (b.status || "").toLowerCase();
            if (status !== "confirmed" && status !== "pending") return false;
            const bDate = normalizeBookingDate(b.date);
            if (bDate !== dayInfo.dateStr) return false;
            const bTime = normalizeTimeTo24h(b.time || b.timeSlot);
            if (!bTime) return false;
            const bStart = timeToMinutes(bTime);
            const rawDuration =
              b.durationMinutes && b.durationMinutes > 0
                ? b.durationMinutes
                : 30;
            // Round duration up to full 30-minute blocks (e.g. 45m or 50m spans 2 slots = 60m)
            const bDuration = Math.ceil(rawDuration / 30) * 30;
            return (
              currentSlotMinutes >= bStart &&
              currentSlotMinutes < bStart + bDuration
            );
          });

          const isUserBooked = matchingUserBookings.length > 0;

          // Compute user booking position and status for multi-slot connection styling
          let userBookingPosition:
            | "single"
            | "start"
            | "middle"
            | "end"
            | undefined = undefined;
          let userBookingDurationMinutes: number | undefined = undefined;
          let userBookingStatus: "confirmed" | "pending" | undefined =
            undefined;

          if (isUserBooked) {
            const primaryBooking = matchingUserBookings[0];
            userBookingStatus =
              primaryBooking.status === "pending" ? "pending" : "confirmed";
            const bTime = normalizeTimeTo24h(
              primaryBooking.time || primaryBooking.timeSlot,
            );
            const bStart = bTime ? timeToMinutes(bTime) : currentSlotMinutes;
            const rawDuration =
              primaryBooking.durationMinutes &&
              primaryBooking.durationMinutes > 0
                ? primaryBooking.durationMinutes
                : 30;
            const bDuration = Math.ceil(rawDuration / 30) * 30;
            userBookingDurationMinutes = rawDuration;

            const isStart = currentSlotMinutes === bStart;
            const isEnd = currentSlotMinutes + 30 === bStart + bDuration;

            if (bDuration <= 30 || (isStart && isEnd)) {
              userBookingPosition = "single";
            } else if (isStart) {
              userBookingPosition = "start";
            } else if (isEnd) {
              userBookingPosition = "end";
            } else {
              userBookingPosition = "middle";
            }
          }

          if (existingSlot) {
            matrix.set(`${dayInfo.slotLabel}|${time}`, {
              ...existingSlot,
              isTierLocked,
              tierLockReason: isTierLocked
                ? `Requires ${requiredTier} tier (${dayInfo.dayIndex + 1}-day advance)`
                : undefined,
              isUserBooked,
              userBookingStatus,
              userBookingPosition,
              userBookingDurationMinutes,
              userBookingDetails: isUserBooked
                ? matchingUserBookings
                : undefined,
              isAvailable: !isTierLocked && !isPast && existingSlot.isAvailable,
            });
          } else {
            // Render as empty slot with 0 bookings
            const emptySlot: TimeSlotWithComputedFields = {
              id: `slot-${dayInfo.dateStr}-${time.replace(":", "")}`,
              date: dayInfo.dateStr,
              time: time,
              displayTime,
              duration: 30,
              status: isPast ? "booked" : "available",
              capacity: 4,
              currentBookings: isUserBooked ? 1 : 0,
              dayOfWeek: dayInfo.dayOfWeek,
              dayDisplayDate: dayInfo.dayDisplayDate,
              isTierLocked,
              tierLockReason: isTierLocked
                ? `Requires ${requiredTier} tier (${dayInfo.dayIndex + 1}-day advance)`
                : undefined,
              isUserBooked,
              userBookingStatus,
              userBookingPosition,
              userBookingDurationMinutes,
              userBookingDetails: isUserBooked
                ? matchingUserBookings
                : undefined,
              isAvailable: !isTierLocked && !isPast,
              isPast,
              slotLabel: dayInfo.slotLabel,
              timeLabel: displayTime,
            };
            matrix.set(`${dayInfo.slotLabel}|${time}`, emptySlot);
          }
        });
      });

      return {
        sortedDays: daysList.map((d) => d.slotLabel),
        sortedTimes: times,
        slotByDayAndTime: matrix,
        currentWeekDays: daysList,
      };
    }, [slots, weekOffset, tierBookingWindowDays, allUserBookings]);

  // Auto-scroll to closest timeslot from current time
  useEffect(() => {
    if (!loading && sortedTimes.length > 0) {
      const closestTime = getClosestTime(sortedTimes);
      if (!closestTime) return;

      const rowEl = rowRefs.current.get(closestTime);
      const container = tableContainerRef.current;
      if (rowEl && container) {
        requestAnimationFrame(() => {
          const containerRect = container.getBoundingClientRect();
          const rowRect = rowEl.getBoundingClientRect();
          const theadHeight = theadRef.current?.offsetHeight ?? 0;
          const currentScrollTop = container.scrollTop;
          const targetScrollTop =
            currentScrollTop + (rowRect.top - containerRect.top) - theadHeight;

          container.scrollTo({
            top: Math.max(0, targetScrollTop),
            behavior: "smooth",
          });
        });
      }
    }
  }, [loading, sortedTimes]);

  const firstDay = currentWeekDays[0];
  const lastDay = currentWeekDays[currentWeekDays.length - 1];
  const dateRangeLabel =
    firstDay && lastDay
      ? `${firstDay.dayOfWeek.slice(0, 3)} ${firstDay.dayDisplayDate} – ${lastDay.dayOfWeek.slice(0, 3)} ${lastDay.dayDisplayDate}`
      : "";

  return (
    <div className="w-full space-y-4">
      {/* Header with week navigation and refresh button */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-gray-900">
              Available Washing Slots
            </h2>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              {weekOffset === 0 ? "Week 1 (Current)" : "Week 2 (Next Week)"}
            </span>
            {dateRangeLabel && (
              <span className="text-xs font-medium text-gray-500">
                ({dateRangeLabel})
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-1">
            {dashboard ? (
              <span>
                Your <strong>{tierName}</strong> tier allows booking up to{" "}
                <strong>{tierBookingWindowDays} days</strong> in advance.
              </span>
            ) : (
              <span>
                Standard Member booking window: <strong>7 days</strong>. Log in
                with Silver, Gold, or Platinum to book up to{" "}
                <strong>14 days</strong> in advance.
              </span>
            )}
          </p>
        </div>

        {/* Right side controls: Week Arrow Navigation + Refresh */}
        <div className="flex items-center gap-3 self-stretch md:self-auto justify-between md:justify-end">
          {/* Week Prev/Next Buttons */}
          <div className="flex items-center bg-white p-1 rounded-lg border border-gray-200 shadow-xs">
            <button
              type="button"
              onClick={() => setWeekOffset(0)}
              disabled={weekOffset === 0}
              aria-label="Previous week"
              title="Current Week"
              className={`p-1.5 rounded-md transition-colors ${
                weekOffset === 0
                  ? "text-gray-300 cursor-not-allowed"
                  : "text-gray-700 hover:bg-gray-100 cursor-pointer"
              }`}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <span className="px-2.5 text-xs font-semibold text-gray-700 min-w-[76px] text-center select-none">
              {weekOffset === 0 ? "This Week" : "Next Week"}
            </span>

            <button
              type="button"
              onClick={() => {
                if (canGoNextWeek) {
                  setWeekOffset(1);
                }
              }}
              disabled={!canGoNextWeek || weekOffset === 1}
              aria-label="Next week"
              title={
                !canGoNextWeek
                  ? `Next week requires Silver tier or higher (your window is ${tierBookingWindowDays} days)`
                  : "Next Week"
              }
              className={`p-1.5 rounded-md transition-colors flex items-center ${
                !canGoNextWeek || weekOffset === 1
                  ? "text-gray-300 cursor-not-allowed"
                  : "text-gray-700 hover:bg-gray-100 cursor-pointer"
              }`}
            >
              {!canGoNextWeek && weekOffset === 0 ? (
                <Lock className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronRight className="w-5 h-5" />
              )}
            </button>
          </div>

          <SlotRefreshButton
            onRefresh={handleRefresh}
            nextRefreshCountdown={nextRefreshCountdown}
            isRefreshing={isRefreshing}
          />
        </div>
      </div>

      {/* Legend - hidden while a hard error blocks the calendar */}
      {!(error && slots.length === 0 && !loading) && (
        <div className="flex flex-wrap items-center justify-end gap-4 p-3 bg-gray-50/70 rounded-lg border border-gray-200/60">
          {dashboard && (
            <>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded border-2 border-blue-600 bg-blue-600 flex items-center justify-center"></div>
                <span className="text-xs font-semibold">Your Booking</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded bg-sky-300 flex items-center justify-center"></div>
                <span className="text-xs font-semibold">
                  Your Pending Booking
                </span>
              </div>
            </>
          )}
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded border-2 border-green-500 bg-white" />
            <span className="text-xs font-medium text-gray-700">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-gray-300" />
            <span className="text-xs font-medium text-gray-700">Past</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-red-500" />
            <span className="text-xs font-medium text-gray-700">
              Fully Booked
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-yellow-400" />
            <span className="text-xs font-medium text-gray-700">
              Under Maintenance
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div
              className="w-5 h-5 rounded border border-gray-400/80"
              style={{
                background:
                  "repeating-linear-gradient(-45deg, rgb(156, 163, 175) 0, rgb(156, 163, 175) 3px, rgb(229, 231, 235) 3px, rgb(229, 231, 235) 7px)",
              }}
            />
            <span className="text-xs font-medium text-gray-700">
              Tier Locked (Outside Window)
            </span>
          </div>
        </div>
      )}

      {/* Hard error state: no slots could be loaded at all */}
      {error && slots.length === 0 && !loading && (
        <div className="flex flex-col items-center justify-center gap-3 p-10 bg-red-50 border border-red-200 rounded-lg text-center">
          <AlertTriangle className="w-10 h-10 text-red-500" />
          <div>
            <p className="text-sm font-semibold text-red-800">
              Unable to available wash slots
            </p>
            <p className="text-xs text-red-700 mt-1">
              Please contact us for direct booking! - 0123456789
            </p>
          </div>
          <button
            onClick={handleRefresh}
            className="mt-1 inline-flex items-center px-3 py-1.5 rounded-md bg-red-600 text-white text-xs font-semibold hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Soft error banner: refresh failed but we still have slots to show */}
      {error && !loading && slots.length > 0 && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-between text-sm text-amber-800">
          <span>{error} - Showing last known slots.</span>
          <button
            onClick={handleRefresh}
            className="underline font-medium hover:text-amber-900"
          >
            Retry
          </button>
        </div>
      )}

      {/* Loading skeleton */}
      {loading && slots.length === 0 && (
        <div className="space-y-6">
          {[1, 2, 3].map((day) => (
            <div key={day}>
              <h3 className="text-lg font-semibold text-gray-700 mb-3">
                Loading...
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-7 gap-3">
                {[1, 2, 3, 4, 5, 6, 7].map((slot) => (
                  <SkeletonSlot key={`${day}-${slot}`} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Transposed slots table */}
      {!(error && slots.length === 0) && (!loading || slots.length > 0) && (
        <div
          ref={tableContainerRef}
          className="w-full max-h-[420px] overflow-auto hide-scrollbar rounded-lg border border-gray-200"
        >
          <table className="min-w-[980px] w-full border-separate border-spacing-0 bg-white">
            <thead ref={theadRef}>
              <tr>
                <th className="sticky left-0 top-0 z-30 w-28 border-b border-r border-gray-200 bg-gray-50 px-3 py-4 text-left text-sm font-semibold text-gray-700">
                  Time
                </th>
                {currentWeekDays.map((dayInfo) => {
                  const isLocked = dayInfo.dayIndex >= tierBookingWindowDays;
                  return (
                    <th
                      key={dayInfo.slotLabel}
                      className={`sticky top-0 z-20 min-w-[120px] border-b border-gray-200 px-3 py-4 text-center text-sm font-semibold ${
                        isLocked
                          ? "bg-gray-100/80 text-gray-400"
                          : "bg-gray-50 text-gray-700"
                      }`}
                    >
                      <span className="flex items-center justify-center gap-1">
                        {dayInfo.dayOfWeek}
                        {isLocked && <Lock className="w-3 h-3 text-gray-400" />}
                      </span>
                      <span className="mt-1 block text-xs font-normal text-gray-500">
                        {dayInfo.dayDisplayDate}
                      </span>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {sortedTimes.map((time) => (
                <tr
                  key={time}
                  ref={(el) => {
                    if (el) {
                      rowRefs.current.set(time, el);
                    } else {
                      rowRefs.current.delete(time);
                    }
                  }}
                >
                  <th className="sticky left-0 z-10 border-b border-r border-gray-200 bg-white px-3 py-3 text-left text-sm font-medium text-gray-600">
                    {formatDisplayTime(time)}
                  </th>
                  {sortedDays.map((dayLabel) => {
                    const slot = slotByDayAndTime.get(`${dayLabel}|${time}`);
                    if (!slot) return null;
                    return (
                      <td
                        key={`${dayLabel}-${time}`}
                        className={`border-b border-gray-100 p-2 align-middle text-center ${
                          slot.isTierLocked ? "bg-gray-50/40" : ""
                        }`}
                      >
                        <SlotCard
                          slot={slot}
                          onClick={() => {
                            if (!slot.isTierLocked) {
                              onSlotClick(slot);
                            }
                          }}
                          isSelected={selectedSlotId === slot.id}
                          showTime={false}
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

SlotCalendar.displayName = "SlotCalendar";
