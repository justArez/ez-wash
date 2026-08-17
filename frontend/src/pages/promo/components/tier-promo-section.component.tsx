import React from "react";
import type { ClaimablePromo } from "@/models/promo.model";
import { ClaimablePromoCard } from "@/components/promo-card/claimable-promo-card.component";
import { Shield } from "lucide-react";

interface TierPromoSectionProps {
  title: string;
  promos: ClaimablePromo[];
  isLoggedIn: boolean;
  currentTier?: string;
  pointsBalance: number;
  onClaim: (promo: ClaimablePromo) => void;
  onOpenSignIn?: () => void;
  isSubmitting?: boolean;
}

export const TierPromoSection: React.FC<TierPromoSectionProps> = ({
  title,
  promos,
  isLoggedIn,
  currentTier,
  pointsBalance,
  onClaim,
  onOpenSignIn,
  isSubmitting,
}) => {
  if (promos.length === 0) return null;

  return (
    <div className="flex flex-col gap-3.5">
      <div className="flex items-center gap-2 pb-1.5 border-b border-[#e8e6f3]">
        <Shield className="w-4 h-4 text-[#3a46ed]" />
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#3d3a4f]">
          {title}
        </h3>
        <span className="text-xs text-[#676375] font-semibold ml-auto">
          {promos.length} available
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {promos.map((promo) => (
          <ClaimablePromoCard
            key={promo.id}
            promo={promo}
            isLoggedIn={isLoggedIn}
            currentTier={currentTier}
            pointsBalance={pointsBalance}
            onClaim={onClaim}
            onOpenSignIn={onOpenSignIn}
            isSubmitting={isSubmitting}
          />
        ))}
      </div>
    </div>
  );
};
