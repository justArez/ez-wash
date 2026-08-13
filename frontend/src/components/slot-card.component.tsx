/**
 * SlotCard Component - Displays a single time slot
 * Feature: 004-homepage-shadcn-redesign - User Story 1
 *
 * Uses shadcn Card + Badge components
 */

import React from "react";
import type { SlotCardProps } from "../types/homepage.types";

export const SlotCard: React.FC<SlotCardProps> = ({
  slot,
  onClick,
  isSelected = false,
  showTime = true,
}) => {
  const handleClick = () => {
    if (slot.isAvailable) {
      onClick(slot);
    }
  };

  // Determine styling based on slot status
  const baseClasses =
    "p-4 rounded-lg border-2 transition-all duration-200 cursor-pointer";
  const availableClasses = slot.isAvailable
    ? "border-green-500 bg-white hover:bg-green-50 hover:shadow-md"
    : "border-red-300 bg-gray-100 cursor-not-allowed opacity-60";
  const selectedClasses = isSelected
    ? "ring-2 ring-blue-500 ring-offset-2"
    : "";

  return (
    <div
      className={`${baseClasses} ${availableClasses} ${selectedClasses}`}
      onClick={handleClick}
      role={slot.isAvailable ? "button" : "status"}
      tabIndex={slot.isAvailable ? 0 : -1}
      onKeyPress={(e) => {
        if (slot.isAvailable && (e.key === "Enter" || e.key === " ")) {
          handleClick();
        }
      }}
      aria-label={`${slot.timeLabel} - ${slot.isPast ? "past" : slot.status}`}
      aria-disabled={!slot.isAvailable}
    >
      {/* Time is shown in the row header when this card is used in the table. */}
      {showTime && (
        <div className="font-semibold text-lg text-center mb-2">
          {slot.timeLabel}
        </div>
      )}

      {/* Status badge */}
      <div className="flex justify-center">
        {slot.isPast && (
          <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-700">
            Past
          </span>
        )}
        {!slot.isPast && slot.status === "available" && (
          <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-green-200 text-green-800">
            Available
          </span>
        )}
        {!slot.isPast && slot.status === "booked" && (
          <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-red-200 text-red-800">
            Booked
          </span>
        )}
        {!slot.isPast && slot.status === "maintenance" && (
          <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-yellow-200 text-yellow-800">
            Maintenance
          </span>
        )}
      </div>

      {/* Booking info (if not available) */}
      {!slot.isAvailable && slot.currentBookings > 0 && (
        <div className="text-xs text-gray-600 text-center mt-2">
          {slot.currentBookings}/{slot.capacity} booked
        </div>
      )}
    </div>
  );
};

SlotCard.displayName = "SlotCard";
