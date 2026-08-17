import React, { useState } from "react";
import type { GlobalPromotion } from "@/models/promo.model";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight, Sparkles, Megaphone } from "lucide-react";

interface GlobalPromoBannerProps {
  promotions: GlobalPromotion[];
  onSelectPromo?: (promo: GlobalPromotion) => void;
}

export const GlobalPromoBanner: React.FC<GlobalPromoBannerProps> = ({
  promotions,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!promotions || promotions.length === 0) return null;

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? promotions.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === promotions.length - 1 ? 0 : prev + 1));
  };

  const current = promotions[currentIndex];

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2 pb-1">
        <Megaphone className="w-4 h-4 text-[#3a46ed]" />
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#3d3a4f]">
          Global Active Promotions
        </h3>
        <div className="flex items-center gap-1 ml-auto">
          <button
            type="button"
            onClick={handlePrev}
            className="p-1 rounded-full bg-white hover:bg-[#f1efff] text-[#3d3a4f] border border-[#e8e6f3] transition-colors cursor-pointer"
            aria-label="Previous promotion"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <span className="text-[11px] font-semibold text-[#676375] px-1">
            {currentIndex + 1} / {promotions.length}
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
      </div>

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
    </div>
  );
};
