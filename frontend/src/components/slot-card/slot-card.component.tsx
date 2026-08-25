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
    !slot.isUserBooked &&
    (slot.isTierLocked ||
      slot.isPast ||
      slot.status === "maintenance" ||
      slot.status === "booked" ||
      isFullyBooked);

  const isPending = slot.isUserBooked && slot.userBookingStatus === "pending";

  const borderClass = slot.isTierLocked
    ? "border border-gray-400/80"
    : isUnavailable
      ? ""
      : slot.isPast
        ? ""
        : slot.isUserBooked
          ? isPending
            ? "border-2 border-sky-300"
            : "border-2 border-blue-500"
          : "border-2 border-green-500";

  const getGradientBackground = (): string => {
    if (slot.isTierLocked) {
      return "repeating-linear-gradient(-45deg, rgb(156, 163, 175) 0, rgb(156, 163, 175) 3px, rgb(229, 231, 235) 3px, rgb(229, 231, 235) 7px)";
    }
    if (slot.isPast) {
      return "linear-gradient(to top, rgb(209, 213, 219) 0%, rgb(209, 213, 219) 100%)";
    }
    if (slot.isUserBooked) {
      if (isPending) {
        return "linear-gradient(to top, oklch(82.8% 0.111 230.318) 0%, oklch(82.8% 0.111 230.318) 100%)"; // Sky 300 to Sky 200 (light blue)
      }
      return "linear-gradient(to top, oklch(62.3% 0.214 259.815) 0%, oklch(62.3% 0.214 259.815) 100%)"; // Blue 600 to Blue 500 (solid blue)
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

  const isInteractive = slot.isAvailable || slot.isUserBooked;
  const baseClasses =
    "p-2 rounded-lg transition-all duration-200 cursor-pointer relative";
  const interactiveClasses = isInteractive
    ? "hover:scale-115"
    : "cursor-not-allowed opacity-90";

  const durationText =
    slot.userBookingDurationMinutes && slot.userBookingDurationMinutes > 30
      ? ` (${slot.userBookingDurationMinutes}m appointment)`
      : "";

  const statusText = isPending ? "Pending" : "Confirmed";

  const tooltipLabel = slot.isUserBooked
    ? `${slot.timeLabel} - Your Booking [${statusText}]${durationText} (${bookedSlots}/${slot.capacity} booked)`
    : slot.isTierLocked
      ? `${slot.timeLabel} - Tier locked (${slot.tierLockReason || "Requires higher tier window"})`
      : `${slot.timeLabel} - ${slot.isPast ? "past" : slot.status} (${bookedSlots}/${slot.capacity} booked)`;

  return (
    <div
      className={`${baseClasses} ${interactiveClasses}`}
      onClick={handleClick}
      role={isInteractive ? "button" : "status"}
      tabIndex={isInteractive ? 0 : -1}
      onKeyPress={(e) => {
        if (isInteractive && (e.key === "Enter" || e.key === " ")) {
          handleClick();
        }
      }}
      aria-label={tooltipLabel}
      title={
        slot.isUserBooked
          ? `You have a ${statusText.toLowerCase()} booking at this timeslot${durationText}`
          : slot.isTierLocked
            ? "Outside your tier booking window"
            : undefined
      }
      aria-disabled={!isInteractive}
    >
      {/* Time is shown in the row header when this card is used in the table. */}
      {showTime && (
        <div className="font-semibold text-lg text-center mb-2">
          {slot.timeLabel}
        </div>
      )}

      {/* Color-coded status square with fill from bottom and multi-slot connector indicator */}
      <div className="flex justify-center relative items-center">
        {slot.isUserBooked &&
          slot.userBookingPosition &&
          slot.userBookingPosition !== "single" && (
            <div
              className={`absolute w-3 z-0 ${
                isPending ? "bg-sky-300" : "bg-blue-500"
              } ${
                slot.userBookingPosition === "start"
                  ? "top-4 bottom-[-16px]"
                  : slot.userBookingPosition === "middle"
                    ? "top-[-16px] bottom-[-16px]"
                    : "top-[-16px] bottom-4"
              }`}
            />
          )}
        <div
          className={`w-8 h-8 rounded flex items-center justify-center relative z-10 ${borderClass} ${isSelected ? "ring-2 ring-primary ring-offset-2 scale-110" : ""}`}
          style={{
            background: gradientBackground,
          }}
          aria-hidden="true"
        >
          {slot.isUserBooked && (
            <span className={"text-[10px] font-bold select-none"}></span>
          )}
        </div>
      </div>
    </div>
  );
};

SlotCard.displayName = "SlotCard";
