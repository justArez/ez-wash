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
import type {
  TimeSlot,
  TimeSlotWithComputedFields,
  SlotCalendarProps,
} from "../../types/homepage.types";
import "./slot-calendar.component.scss";
import { useSlots } from "../../hooks/useSlots";
import { SlotCard } from "../slot-card/slot-card.component";
import { SlotRefreshButton } from "../slot-refresh-button/slot-refresh-button.component";

// Skeleton loader component
const SkeletonSlot: React.FC = () => (
  <div className="p-4 rounded-lg border-2 border-gray-200 bg-gray-100 animate-pulse">
    <div className="h-6 bg-gray-300 rounded w-3/4 mx-auto mb-2"></div>
    <div className="h-4 bg-gray-300 rounded w-1/2 mx-auto"></div>
  </div>
);

const isPastSlot = (slot: TimeSlot): boolean => {
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

const addComputedFields = (slot: TimeSlot): TimeSlotWithComputedFields => {
  const isPast = isPastSlot(slot);
  const effectiveStatus =
    slot.status === "available" && slot.currentBookings >= slot.capacity
      ? "booked"
      : slot.status;

  return {
    ...slot,
    status: effectiveStatus,
    isAvailable:
      !isPast &&
      effectiveStatus === "available" &&
      slot.currentBookings < slot.capacity,
    isPast,
    slotLabel: `${slot.dayOfWeek} (${slot.dayDisplayDate})`,
    timeLabel: slot.displayTime,
  };
};

export const SlotCalendar: React.FC<SlotCalendarProps> = ({
  selectedSlotId,
  onSlotClick,
  onLoadingChange,
  onErrorChange,
}) => {
  const { slots, loading, error, refetch, nextRefreshCountdown } = useSlots(7);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const tableContainerRef = React.useRef<HTMLDivElement>(null);
  const theadRef = React.useRef<HTMLTableSectionElement>(null);
  const rowRefs = React.useRef<Map<string, HTMLTableRowElement>>(new Map());

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
    } finally {
      setIsRefreshing(false);
    }
  };

  // Build a row-oriented matrix: days are columns and times are rows.
  const { computedSlots, sortedDays, sortedTimes, slotByDayAndTime } =
    React.useMemo(() => {
      const mappedSlots = slots.map(addComputedFields);
      const days = Array.from(
        new Map(
          mappedSlots.map((slot) => [slot.slotLabel, slot.date]),
        ).entries(),
      )
        .sort(([, dateA], [, dateB]) => dateA.localeCompare(dateB))
        .map(([label]) => label);
      const times = Array.from(
        new Set(mappedSlots.map((slot) => slot.time)),
      ).sort();
      const matrix = new Map<string, TimeSlotWithComputedFields>();

      mappedSlots.forEach((slot) => {
        matrix.set(`${slot.slotLabel}|${slot.time}`, slot);
      });

      return {
        computedSlots: mappedSlots,
        sortedDays: days,
        sortedTimes: times,
        slotByDayAndTime: matrix,
      };
    }, [slots]);

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

  // Error state
  if (error && !loading) {
    return (
      <div className="p-6 bg-red-50 border-2 border-red-300 rounded-lg">
        <div className="flex gap-3">
          <svg
            className="w-6 h-6 text-red-600 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          <div>
            <h3 className="font-semibold text-red-800">Error Loading Slots</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
            <button
              onClick={handleRefresh}
              className="mt-3 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (!loading && slots.length === 0) {
    return (
      <div className="p-6 bg-yellow-50 border-2 border-yellow-300 rounded-lg text-center">
        <p className="text-yellow-800 font-semibold">No available slots</p>
        <p className="text-sm text-yellow-700 mt-1">
          Please check back soon or contact support
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with refresh button */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray">
          Available Washing Slots (7 Days)
        </h2>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-end gap-4 p-4 ml-70">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded border-2 border-green-500 bg-white" />
            <span className="text-xs font-medium text-gray-700">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-gray-300" />
            <span className="text-xs font-medium text-gray-700">Past</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-red-500" />
            <span className="text-xs font-medium text-gray-700">
              Fully Booked
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-yellow-400" />
            <span className="text-xs font-medium text-gray-700">
              Under Maintenance
            </span>
          </div>
        </div>

        <SlotRefreshButton
          onRefresh={handleRefresh}
          nextRefreshCountdown={nextRefreshCountdown}
          isRefreshing={isRefreshing}
        />
      </div>
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
      {!loading && computedSlots.length > 0 && (
        <div
          ref={tableContainerRef}
          className="max-h-[420px] overflow-auto hide-scrollbar rounded-lg border border-gray-200"
        >
          <table className="min-w-[980px] w-full border-separate border-spacing-0 bg-white">
            <thead ref={theadRef}>
              <tr>
                <th className="sticky left-0 top-0 z-30 w-28 border-b border-r border-gray-200 bg-gray-50 px-3 py-4 text-left text-sm font-semibold text-gray-700">
                  Time
                </th>
                {sortedDays.map((dayLabel) => {
                  const [day, date] = dayLabel.split(" (");
                  return (
                    <th
                      key={dayLabel}
                      className="sticky top-0 z-20 min-w-[120px] border-b border-gray-200 bg-gray-50 px-3 py-4 text-center text-sm font-semibold text-gray-700"
                    >
                      <span className="block">{day}</span>
                      <span className="mt-1 block text-xs font-normal text-gray-500">
                        {date?.replace(")", "")}
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
                    {computedSlots.find((slot) => slot.time === time)
                      ?.timeLabel ?? time}
                  </th>
                  {sortedDays.map((dayLabel) => {
                    const slot = slotByDayAndTime.get(`${dayLabel}|${time}`);
                    return (
                      <td
                        key={`${dayLabel}-${time}`}
                        className="border-b border-gray-100 p-2 align-middle"
                      >
                        {slot ? (
                          <SlotCard
                            slot={slot}
                            onClick={() => onSlotClick(slot)}
                            isSelected={selectedSlotId === slot.id}
                            showTime={false}
                          />
                        ) : (
                          <div className="flex min-h-20 items-center justify-center rounded-lg border border-dashed border-gray-200 bg-gray-50 text-xs text-gray-400">
                            Unavailable
                          </div>
                        )}
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
