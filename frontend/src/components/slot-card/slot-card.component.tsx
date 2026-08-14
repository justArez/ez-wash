/**
 * SlotCard Component - Displays a single time slot
 * Feature: 004-homepage-shadcn-redesign - User Story 1
 *
 * Uses shadcn Card + Badge components
 */

import React from "react";
import type { SlotCardProps } from "../../types/homepage.types";
import "./slot-card.component.scss";

export const SlotCard: React.FC<SlotCardProps> = ({
  slot,
  onClick,
  showTime = true,
}) => {
  const handleClick = () => {
    if (slot.isAvailable) {
      onClick(slot);
    }
  };

  // Calculate fill percentage based on booked slots: bottom-up booked capacity
  const bookedSlots = Math.max(
    0,
    Math.min(slot.currentBookings, slot.capacity),
  );
  const fillPercentage = Math.max(
    0,
    Math.min(100, (bookedSlots / slot.capacity) * 100),
  );
  const isFullyBooked = bookedSlots >= slot.capacity;

  // Determine color-coded styling and gradient based on slot status
  let borderClass = "";
  let gradientBackground = "";

  if (slot.isPast) {
    gradientBackground =
      "linear-gradient(to top, rgb(209, 213, 219) 0%, rgb(209, 213, 219) 100%)";
  } else if (slot.status === "maintenance") {
    gradientBackground =
      "linear-gradient(to top, rgb(250, 204, 21) 0%, rgb(250, 204, 21) 100%)";
  } else if (slot.status === "booked" || isFullyBooked) {
    gradientBackground =
      "linear-gradient(to top, rgb(239, 68, 68) 0%, rgb(239, 68, 68) 100%)";
  } else if (slot.status === "available") {
    borderClass = "border-2 border-green-500";
    // Green fill from bottom up based on availability
    gradientBackground =
      fillPercentage <= 0
        ? "transparent"
        : `linear-gradient(to top, rgb(34, 197, 94) 0%, rgb(34, 197, 94) ${fillPercentage}%, transparent ${fillPercentage}%, transparent 100%)`;
  }

  const baseClasses =
    "p-2 rounded-lg transition-all duration-200 cursor-pointer";
  const interactiveClasses = slot.isAvailable
    ? "hover:scale-115"
    : "cursor-not-allowed";

  return (
    <div
      className={`${baseClasses} ${interactiveClasses}`}
      onClick={handleClick}
      role={slot.isAvailable ? "button" : "status"}
      tabIndex={slot.isAvailable ? 0 : -1}
      onKeyPress={(e) => {
        if (slot.isAvailable && (e.key === "Enter" || e.key === " ")) {
          handleClick();
        }
      }}
      aria-label={`${slot.timeLabel} - ${slot.isPast ? "past" : slot.status} (${bookedSlots}/${slot.capacity} booked)`}
      aria-disabled={!slot.isAvailable}
    >
      {/* Time is shown in the row header when this card is used in the table. */}
      {showTime && (
        <div className="font-semibold text-lg text-center mb-2">
          {slot.timeLabel}
        </div>
      )}

      {/* Color-coded status square with fill from bottom */}
      <div className="flex justify-center">
        <div
          className={`w-8 h-8 rounded ${borderClass}`}
          style={{
            background: gradientBackground,
          }}
          aria-hidden="true"
        />
      </div>
    </div>
  );
};

SlotCard.displayName = "SlotCard";
