import React from "react";
import type { ClaimedPromo } from "@/models/promo.model";
import { ClaimedPromoCard } from "@/components/promo-card/claimed-promo-card.component";
import { Gift, Ticket } from "lucide-react";

interface ClaimedPromosSectionProps {
  claimedPromos: ClaimedPromo[];
  onUseNow: (voucher: ClaimedPromo) => void;
  isLoggedIn: boolean;
}

export const ClaimedPromosSection: React.FC<ClaimedPromosSectionProps> = ({
  claimedPromos,
  onUseNow,
  isLoggedIn,
}) => {
  if (!isLoggedIn) return null;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2 pb-1 border-b border-[#e8e6f3]">
        <Ticket className="w-4 h-4 text-[#15803d]" />
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#3d3a4f]">
          Your Promos (Claimed)
        </h3>
        <span className="text-xs text-[#15803d] font-bold ml-auto">
          {claimedPromos.length} active voucher
          {claimedPromos.length === 1 ? "" : "s"}
        </span>
      </div>

      {claimedPromos.length === 0 ? (
        <div className="bg-[#ffffff] border border-dashed border-[#d7d3eb] rounded-[18px] p-7 text-center flex flex-col items-center justify-center gap-2 shadow-xs">
          <Gift className="w-8 h-8 text-[#a7a2c4]" />
          <p className="text-sm font-bold text-[#2c264f]">
            You haven't claimed any promos yet!
          </p>
          <p className="text-xs text-[#676375] max-w-sm">
            Browse the tier rewards below and redeem your wash points to unlock
            free add-ons and discounts.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {claimedPromos.map((voucher) => (
            <ClaimedPromoCard
              key={voucher.id}
              voucher={voucher}
              onUseNow={onUseNow}
            />
          ))}
        </div>
      )}
    </div>
  );
};
