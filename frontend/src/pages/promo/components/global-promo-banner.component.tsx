import React, { useState } from "react";
import type { GlobalPromotion } from "@/models/promo.model";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Megaphone,
  Grid,
  X,
  Calendar,
} from "lucide-react";

interface GlobalPromoBannerProps {
  promotions: GlobalPromotion[];
  onSelectPromo?: (promo: GlobalPromotion) => void;
}

export const GlobalPromoBanner: React.FC<GlobalPromoBannerProps> = ({
  promotions,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAllModal, setShowAllModal] = useState(false);

  if (!promotions || promotions.length === 0) return null;

  // Take 3-6 featured global promos for carousel
  const featuredPromos = promotions.slice(0, 6);
  const safeIndex = currentIndex >= featuredPromos.length ? 0 : currentIndex;
  const current = featuredPromos[safeIndex];

  const handlePrev = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? featuredPromos.length - 1 : prev - 1,
    );
  };

  const handleNext = () => {
    setCurrentIndex((prev) =>
      prev === featuredPromos.length - 1 ? 0 : prev + 1,
    );
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 pb-1">
        <Megaphone className="w-4 h-4 text-[#3a46ed]" />
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#3d3a4f]">
          Global Active Promotions
        </h3>
        <div className="flex items-center gap-2 ml-auto">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowAllModal(true)}
            className="h-7 px-2.5 text-xs font-semibold text-[#3a46ed] hover:text-[#2d37c9] hover:bg-[#f1efff] rounded-lg gap-1.5 cursor-pointer"
          >
            <Grid className="w-3.5 h-3.5" />
            View All ({promotions.length})
          </Button>

          {featuredPromos.length > 1 && (
            <div className="flex items-center gap-1 pl-1 border-l border-[#e8e6f3]">
              <button
                type="button"
                onClick={handlePrev}
                className="p-1 rounded-full bg-white hover:bg-[#f1efff] text-[#3d3a4f] border border-[#e8e6f3] transition-colors cursor-pointer"
                aria-label="Previous promotion"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span className="text-[11px] font-semibold text-[#676375] px-1">
                {safeIndex + 1} / {featuredPromos.length}
              </span>
              <button
                type="button"
                onClick={handleNext}
                className="p-1 rounded-full bg-white hover:bg-[#f1efff] text-[#3d3a4f] border border-[#e8e6f3] transition-colors cursor-pointer"
                aria-label="Next promotion"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Featured Banner Display */}
      {current && (
        <div className="relative overflow-hidden bg-gradient-to-r from-[#3721b6] via-[#3a46ed] to-[#5046e5] rounded-[20px] p-5 text-white shadow-[0_12px_28px_rgba(58,70,237,0.18)] flex flex-col md:flex-row md:items-center justify-between gap-4 border border-[rgba(255,255,255,0.2)]">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 bg-white/15 backdrop-blur-xs rounded-xl shrink-0">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-base md:text-lg text-white">
                  {current.title}
                </span>
                {current.badgeLabel && (
                  <Badge className="bg-white/20 text-white hover:bg-white/25 border-white/30 text-[10px] font-bold tracking-wide uppercase">
                    {current.badgeLabel}
                  </Badge>
                )}
              </div>
              <p className="text-xs md:text-sm text-indigo-100 mt-1 max-w-xl leading-relaxed">
                {current.description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end md:self-auto shrink-0">
            <span className="text-xs text-white bg-black/20 backdrop-blur-xs px-3 py-1.5 rounded-lg font-medium border border-white/10">
              Valid: {current.validUntil}
            </span>
          </div>
        </div>
      )}

      {/* View All Global Promos Modal */}
      {showAllModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fadeIn"
          onClick={() => setShowAllModal(false)}
        >
          <div
            className="relative w-full max-w-3xl bg-white rounded-2xl p-6 shadow-2xl border border-slate-200 max-h-[85vh] flex flex-col gap-4 animate-slideUp"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-50 rounded-lg text-[#3a46ed]">
                  <Megaphone className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-[#2c264f]">
                    All Global Active Promotions
                  </h3>
                  <p className="text-xs text-[#676375]">
                    System-wide deals and seasonal discounts applicable to all
                    customers.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAllModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal List */}
            <div className="overflow-y-auto pr-1 flex flex-col gap-3 py-2">
              {promotions.map((promo) => (
                <div
                  key={promo.id}
                  className="bg-slate-50 hover:bg-indigo-50/40 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-indigo-100/60 rounded-lg shrink-0 mt-0.5 text-[#3a46ed]">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm text-[#2c264f]">
                          {promo.title}
                        </span>
                        {promo.badgeLabel && (
                          <Badge
                            variant="secondary"
                            className="text-[10px] bg-indigo-100 text-indigo-700 font-bold uppercase"
                          >
                            {promo.badgeLabel}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-[#676375] mt-1 leading-relaxed">
                        {promo.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 bg-white border border-slate-200 px-2.5 py-1 rounded-md">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      Valid: {promo.validUntil}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end pt-3 border-t border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAllModal(false)}
                className="cursor-pointer"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
