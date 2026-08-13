/**
 * PromotionCarousel Component - Carousel displaying promotions with auto-advance
 * Feature: 004-homepage-shadcn-redesign - User Story 2
 *
 * Features:
 * - Auto-advances every 30 seconds
 * - Manual navigation arrows
 * - Shows 1/2/3 promos on mobile/tablet/desktop
 * - Countdown timer display
 * - Skeleton loaders during loading
 */

import React, { useState } from "react";
import type {
  Promotion,
  PromotionCarouselProps,
} from "../types/homepage.types";
import { usePromotions } from "../hooks/usePromotions";
import { useCarouselTimer } from "../hooks/useCarouselTimer";
import { PromotionCard } from "./promotion-card.component";

export const PromotionCarousel: React.FC<PromotionCarouselProps> = ({
  onPromotionSelected,
  onLoadingChange,
}) => {
  const { promotions, loading, error } = usePromotions();
  const carousel = useCarouselTimer(Math.max(promotions.length, 1));
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(
    null,
  );

  React.useEffect(() => {
    onLoadingChange?.(loading);
  }, [loading, onLoadingChange]);

  const handleViewDetails = (promo: Promotion) => {
    setSelectedPromotion(promo);
    onPromotionSelected?.(promo);
  };

  // Get visible promos based on carousel index (showing 3 at a time on desktop)
  const getVisiblePromos = () => {
    if (promotions.length === 0) return [];
    if (promotions.length === 1) return [promotions[0]];

    const startIndex = carousel.currentIndex;
    const visibleCount = 3;
    const visible = [];

    for (let i = 0; i < visibleCount && i < promotions.length; i++) {
      const index = (startIndex + i) % promotions.length;
      visible.push(promotions[index]);
    }

    return visible;
  };

  if (error && !loading) {
    return (
      <div className="p-6 bg-red-50 border-2 border-red-300 rounded-lg">
        <h3 className="font-semibold text-red-800">Error Loading Promotions</h3>
        <p className="text-sm text-red-700 mt-1">{error}</p>
      </div>
    );
  }

  if (!loading && promotions.length === 0) {
    return (
      <div className="p-6 bg-yellow-50 border-2 border-yellow-300 rounded-lg text-center">
        <p className="text-yellow-800 font-semibold">No promotions available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Hot Promotions</h2>
        <div className="text-sm text-gray-600">
          Auto-advance in:{" "}
          <span className="font-semibold">{carousel.countdown}s</span>
        </div>
      </div>

      {/* Carousel container */}
      <div className="relative">
        {/* Loading state */}
        {loading ? (
          <div className="grid grid-cols-1 gap-4 pb-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <PromotionCard
                key={i}
                promotion={{} as Promotion}
                onViewDetails={() => {}}
                isLoading
              />
            ))}
          </div>
        ) : (
          <>
            {/* Carousel content */}
            <div className="grid grid-cols-1 gap-4 pb-4 sm:grid-cols-2 lg:grid-cols-3">
              {getVisiblePromos().map((promo, idx) => (
                <PromotionCard
                  key={`${promo.id}-${idx}`}
                  promotion={promo}
                  onViewDetails={handleViewDetails}
                />
              ))}
            </div>

            {/* Navigation arrows */}
            {promotions.length > 1 && (
              <>
                {/* Previous button */}
                <button
                  onClick={carousel.previous}
                  className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-6 z-10 p-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-lg"
                  aria-label="Previous promotions"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>

                {/* Next button */}
                <button
                  onClick={carousel.advance}
                  className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-6 z-10 p-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-lg"
                  aria-label="Next promotions"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </>
            )}

            {/* Pagination dots */}
            {promotions.length > 1 && (
              <div className="flex justify-center gap-2 mt-4">
                {promotions.map((_: Promotion, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => carousel.goToSlide(idx)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      idx === carousel.currentIndex
                        ? "bg-blue-600"
                        : "bg-gray-300"
                    }`}
                    aria-label={`Go to promotion ${idx + 1}`}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Promotion details modal would go here */}
      {selectedPromotion && (
        <div className="mt-6 p-4 bg-blue-50 border-2 border-blue-300 rounded-lg">
          <h3 className="font-bold text-blue-900">{selectedPromotion.name}</h3>
          <p className="text-sm text-blue-800 mt-2">
            {selectedPromotion.terms}
          </p>
          <button
            onClick={() => setSelectedPromotion(null)}
            className="mt-3 text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            Close Details
          </button>
        </div>
      )}
    </div>
  );
};

PromotionCarousel.displayName = "PromotionCarousel";
