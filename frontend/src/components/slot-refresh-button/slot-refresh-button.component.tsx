/**
 * SlotRefreshButton Component - Manual refresh button with countdown
 * Feature: 004-homepage-shadcn-redesign - User Story 1
 *
 * Displays a reload icon button that triggers immediate slot refresh
 * and resets the 5-minute auto-refresh countdown
 */

import React from "react";
import type { SlotRefreshButtonProps } from "../../types/homepage.types";
import "./slot-refresh-button.component.scss";

export const SlotRefreshButton: React.FC<SlotRefreshButtonProps> = ({
  onRefresh,
  isRefreshing = false,
}) => {
  const handleRefresh = async () => {
    try {
      await onRefresh();
    } catch (error) {
      console.error("Failed to refresh slots:", error);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={handleRefresh}
        disabled={isRefreshing}
        className="p-2 rounded-lg border-2 border-blue-500 bg-white hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        aria-label="Refresh available slots"
        title="Click to refresh slots immediately"
      >
        <svg
          className={`w-5 h-5 text-blue-600 ${isRefreshing ? "animate-spin" : ""}`}
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
      </button>
    </div>
  );
};

SlotRefreshButton.displayName = "SlotRefreshButton";
