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
  isSelected = false,
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

  const isUnavailable =
    slot.isTierLocked ||
    slot.isPast ||
    slot.status === "maintenance" ||
    slot.status === "booked" ||
    isFullyBooked;
  const borderClass = slot.isTierLocked
    ? "border border-gray-400/80"
    : isUnavailable
      ? ""
      : "border-2 border-green-500";

  const getGradientBackground = (): string => {
    if (slot.isTierLocked) {
      return "repeating-linear-gradient(-45deg, rgb(156, 163, 175) 0, rgb(156, 163, 175) 3px, rgb(229, 231, 235) 3px, rgb(229, 231, 235) 7px)";
    }
    if (slot.isPast) {
      return "linear-gradient(to top, rgb(209, 213, 219) 0%, rgb(209, 213, 219) 100%)";
    }
    if (slot.status === "maintenance") {
      return "linear-gradient(to top, rgb(250, 204, 21) 0%, rgb(250, 204, 21) 100%)";
    }
    if (slot.status === "booked" || isFullyBooked) {
      return "linear-gradient(to top, rgb(239, 68, 68) 0%, rgb(239, 68, 68) 100%)";
    }
    return fillPercentage <= 0
      ? "transparent"
      : `linear-gradient(to top, rgb(34, 197, 94) 0%, rgb(34, 197, 94) ${fillPercentage}%, transparent ${fillPercentage}%, transparent 100%)`;
  };

  const gradientBackground = getGradientBackground();

  const baseClasses =
    "p-2 rounded-lg transition-all duration-200 cursor-pointer";
  const interactiveClasses = slot.isAvailable
    ? "hover:scale-115"
    : "cursor-not-allowed opacity-90";

  const tooltipLabel = slot.isTierLocked
    ? `${slot.timeLabel} - Tier locked (${slot.tierLockReason || "Requires higher tier window"})`
    : `${slot.timeLabel} - ${slot.isPast ? "past" : slot.status} (${bookedSlots}/${slot.capacity} booked)`;

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
      aria-label={tooltipLabel}
      title={slot.isTierLocked ? "Outside your tier booking window" : undefined}
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
          className={`w-8 h-8 rounded ${borderClass} ${isSelected ? "ring-2 ring-primary ring-offset-2 scale-110" : ""}`}
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
