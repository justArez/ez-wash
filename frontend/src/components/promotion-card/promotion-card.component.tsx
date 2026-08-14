/**
 * PromotionCard Component - Displays a single promotion in the carousel
 * Feature: 004-homepage-shadcn-redesign - User Story 2
 *
 * Uses shadcn Card + Badge components for discount display
 */

import React from "react";
import type { PromotionCardProps } from "../../types/homepage.types";
import { Badge } from "../ui/badge";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import "./promotion-card.component.scss";

export const PromotionCard: React.FC<PromotionCardProps> = ({
  promotion,
  onViewDetails,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <Card className="min-h-64 animate-pulse border-2 border-gray-200">
        <CardContent className="space-y-4 p-6">
          <div className="h-6 w-3/4 rounded bg-gray-300" />
          <div className="h-4 w-full rounded bg-gray-300" />
          <div className="h-4 w-2/3 rounded bg-gray-300" />
          <div className="h-10 w-full rounded bg-gray-300" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full border-2 border-blue-200 bg-gradient-to-br from-blue-50 to-white shadow-md transition-shadow duration-200 hover:shadow-lg">
      <CardHeader>
        <div className="mb-3 flex flex-wrap gap-2">
          {promotion.discountPercentage > 0 && (
            <Badge variant="destructive">
              {promotion.discountPercentage}% OFF
            </Badge>
          )}
          <Badge variant="secondary">
            {promotion.category === "discount"
              ? "Discount"
              : promotion.category === "points_bonus"
                ? "Bonus Points"
                : "New Member"}
          </Badge>
        </div>

        <CardTitle>{promotion.name}</CardTitle>
        <p className="text-sm text-gray-600">{promotion.description}</p>
      </CardHeader>

      <CardContent>
        <div className="mb-4 space-y-1 text-sm">
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

        <p className="text-xs text-gray-500">
          Expires: {new Date(promotion.expiryDate).toLocaleDateString()}
        </p>
      </CardContent>

      <CardFooter>
        <Button
          className="w-full"
          onClick={() => onViewDetails(promotion)}
          aria-label={`View details for ${promotion.name}`}
        >
          View Promo
        </Button>
      </CardFooter>
    </Card>
  );
};

PromotionCard.displayName = "PromotionCard";
