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
} from "../../types/homepage.types";
import "./promotion-carousel.component.scss";
import { usePromotions } from "../../hooks/usePromotions";
import { useCarouselTimer } from "../../hooks/useCarouselTimer";
import { PromotionCard } from "../promotion-card/promotion-card.component";

export const PromotionCarousel: React.FC<PromotionCarouselProps> = ({
  onPromotionSelected,
  onLoadingChange,
  dashboard,
  onOpenSignIn,
  onOpenBookings,
}) => {
  const { promotions, loading, error } = usePromotions();
  // Limit to maximum 2 pages of 3 items (max 6 promotions)
  const displayPromotions = promotions.slice(0, 6);
  const totalPages = Math.min(2, Math.ceil(displayPromotions.length / 3));

  const carousel = useCarouselTimer(Math.max(totalPages, 1));
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(
    null,
  );

  React.useEffect(() => {
    onLoadingChange?.(loading);
  }, [loading, onLoadingChange]);

  const handleToggleExpand = (promo: Promotion) => {
    if (selectedPromotion?.id === promo.id) {
      setSelectedPromotion(null);
    } else {
      setSelectedPromotion(promo);
      onPromotionSelected?.(promo);
    }
  };

  // Get visible promos based on page index (3 per page, max 2 pages)
  const getVisiblePromos = () => {
    if (displayPromotions.length === 0) return [];
    const pageIndex = totalPages > 0 ? carousel.currentIndex % totalPages : 0;
    const startIndex = pageIndex * 3;
    return displayPromotions.slice(startIndex, startIndex + 3);
  };

  if (error && !loading) {
    return (
      <div className="p-6 bg-red-50 border-2 border-red-300 rounded-lg">
        <h3 className="font-semibold text-red-800">Error Loading Promotions</h3>
        <p className="text-sm text-red-700 mt-1">{error}</p>
      </div>
    );
  }

  if (!loading && displayPromotions.length === 0) {
    return (
      <div className="p-6 bg-yellow-50 border-2 border-yellow-300 rounded-lg text-center">
        <p className="text-yellow-800 font-semibold">No promotions available</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold text-gray-800">Current Promotions</h2>
      </div>

      {/* Carousel container */}
      <div className="relative w-full">
        {/* Loading state */}
        {loading ? (
          <div className="grid grid-cols-1 gap-4 pb-4 sm:grid-cols-2 lg:grid-cols-3 items-start">
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
            <div className="grid grid-cols-1 gap-4 pb-4 sm:grid-cols-2 lg:grid-cols-3 items-start">
              {getVisiblePromos().map((promo, idx) => (
                <PromotionCard
                  key={`${promo.id}-${idx}`}
                  promotion={promo}
                  dashboard={dashboard}
                  onOpenSignIn={onOpenSignIn}
                  onOpenBookings={onOpenBookings}
                  isExpanded={selectedPromotion?.id === promo.id}
                  onToggleExpand={() => handleToggleExpand(promo)}
                />
              ))}
            </div>

            {/* Navigation arrows */}
            {totalPages > 1 && (
              <>
                {/* Previous button */}
                <button
                  onClick={carousel.previous}
                  className="absolute left-1 sm:-left-3 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg cursor-pointer"
                  aria-label="Previous promotions page"
                >
                  <svg
                    className="w-5 h-5"
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
                  className="absolute right-1 sm:-right-3 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-lg cursor-pointer"
                  aria-label="Next promotions page"
                >
                  <svg
                    className="w-5 h-5"
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
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-4">
                {Array.from({ length: totalPages }).map((_, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => carousel.goToSlide(idx)}
                    className={`w-2.5 h-2.5 rounded-full transition-colors cursor-pointer ${
                      idx === carousel.currentIndex
                        ? "bg-blue-600 w-6"
                        : "bg-gray-300"
                    }`}
                    aria-label={`Go to page ${idx + 1}`}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

PromotionCarousel.displayName = "PromotionCarousel";
