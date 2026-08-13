/**
 * PromotionCard Component - Displays a single promotion in the carousel
 * Feature: 004-homepage-shadcn-redesign - User Story 2
 *
 * Uses shadcn Card + Badge components for discount display
 */

import React from "react";
import type { PromotionCardProps } from "../../types/homepage.types";
import "./promotion-card.component.scss";

export const PromotionCard: React.FC<PromotionCardProps> = ({
  promotion,
  onViewDetails,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="p-6 rounded-lg border-2 border-gray-200 bg-white animate-pulse min-h-64">
        <div className="h-6 bg-gray-300 rounded w-3/4 mb-4"></div>
        <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>
        <div className="h-4 bg-gray-300 rounded w-2/3 mb-4"></div>
        <div className="h-10 bg-gray-300 rounded w-full"></div>
      </div>
    );
  }

  return (
    <div className="w-full p-6 rounded-lg border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white shadow-md hover:shadow-lg transition-shadow duration-200">
      {/* Discount badge */}
      {promotion.discountPercentage > 0 && (
        <div className="inline-block mb-3 px-3 py-1 rounded-full bg-red-500 text-white text-sm font-bold">
          {promotion.discountPercentage}% OFF
        </div>
      )}

      {/* Category badge */}
      <div className="inline-block ml-2 mb-3 px-3 py-1 rounded-full bg-blue-200 text-blue-800 text-xs font-semibold">
        {promotion.category === "discount"
          ? "Discount"
          : promotion.category === "points_bonus"
            ? "Bonus Points"
            : "New Member"}
      </div>

      {/* Promotion name */}
      <h3 className="text-xl font-bold text-gray-800 mb-2">{promotion.name}</h3>

      {/* Description */}
      <p className="text-gray-600 text-sm mb-3">{promotion.description}</p>

      {/* Points info */}
      <div className="space-y-1 mb-4 text-sm">
        {promotion.loyaltyPointsRequired > 0 && (
          <p className="text-gray-700">
            <span className="font-semibold">Points Required:</span>{" "}
            {promotion.loyaltyPointsRequired}
          </p>
        )}
        {promotion.loyaltyPointsValue > 0 && (
          <p className="text-gray-700">
            <span className="font-semibold">Points Earned:</span> +
            {promotion.loyaltyPointsValue}
          </p>
        )}
      </div>

      {/* Expiry date */}
      <p className="text-xs text-gray-500 mb-4">
        Expires: {new Date(promotion.expiryDate).toLocaleDateString()}
      </p>

      {/* View Promo button */}
      <button
        onClick={() => onViewDetails(promotion)}
        className="w-full py-2 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors duration-200"
        aria-label={`View details for ${promotion.name}`}
      >
        View Promo
      </button>
    </div>
  );
};

PromotionCard.displayName = "PromotionCard";
