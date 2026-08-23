import React from "react";
import type { ClaimablePromo } from "@/models/promo.model";
import { checkPromoEligibility } from "@/services/promo-eligibility.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ClaimButton } from "./claim-button.component";
import { Award, Crown, Sparkles, Tag } from "lucide-react";

interface ClaimablePromoCardProps {
  promo: ClaimablePromo;
  isLoggedIn: boolean;
  currentTier?: string;
  pointsBalance: number;
  claimedPromoIds?: string[];
  onClaim: (promo: ClaimablePromo) => void;
  onOpenSignIn?: () => void;
  isSubmitting?: boolean;
}

export const ClaimablePromoCard: React.FC<ClaimablePromoCardProps> = ({
  promo,
  isLoggedIn,
  currentTier,
  pointsBalance,
  claimedPromoIds,
  onClaim,
  onOpenSignIn,
  isSubmitting,
}) => {
  const buttonState = checkPromoEligibility(
    isLoggedIn,
    currentTier,
    pointsBalance,
    promo,
    claimedPromoIds,
  );

  const isClaimable = buttonState.type === "CLAIMABLE";

  const getTierBadge = (tier: string) => {
    switch (tier?.toUpperCase()) {
      case "DIAMOND":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-cyan-50 text-cyan-700 border border-cyan-200">
            <Sparkles size={11} className="text-cyan-500" />
            Diamond
          </span>
        );
      case "PLATINUM":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <Crown size={11} className="text-indigo-500" />
            Platinum
          </span>
        );
      case "GOLD":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Award size={11} className="text-amber-500" />
            Gold
          </span>
        );
      case "SILVER":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-300">
            Silver
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold border border-gray-900/20">
            Member
          </span>
        );
    }
  };

  const handleAction = () => {
    if (!isLoggedIn && onOpenSignIn) {
      onOpenSignIn();
      return;
    }
    if (buttonState.type === "CLAIMABLE") {
      onClaim(promo);
    }
  };

  if (!isClaimable) {
    return (
      <Card className="flex flex-col justify-between overflow-hidden border border-[#cbd5e1] bg-gradient-to-br from-[#ffffff] via-[#f8fafc] to-[#f1f5f9] rounded-[18px] shadow-[0_6px_20px_rgba(0,0,0,0.03)]">
        <CardHeader className="p-4 pb-2">
          <div className="flex items-start justify-between gap-2">
            <CardTitle className="text-base font-bold text-[#475569] line-clamp-1 flex items-center gap-1.5">
              <Tag className="w-4 h-4 text-[#64748b] shrink-0" />
              {promo.title}
            </CardTitle>
            <Badge className="bg-[#f1f5f9] text-[#64748b] border-[#cbd5e1] text-[10px] font-bold tracking-wide uppercase">
              {buttonState.type === "ALREADY_CLAIMED"
                ? "CLAIMED"
                : buttonState.type === "LACKS_TIER"
                  ? "LACKS TIER"
                  : buttonState.type === "INSUFFICIENT_PTS"
                    ? "INSUFFICIENT PTS"
                    : promo.requiredTier}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="p-4 pt-1 flex flex-col gap-3 flex-1 justify-between">
          <p className="text-xs text-[#64748b]/90 line-clamp-2 leading-relaxed">
            {promo.description}
          </p>

          <div className="pt-2 border-t border-[#e2e8f0] flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1 text-[#64748b] font-medium">
                <Sparkles className="w-3.5 h-3.5 text-[#94a3b8]" />
                Req:{" "}
                <strong className="text-[#475569]">{promo.requiredTier}</strong>
              </span>
              <span className="font-bold text-[#64748b]">
                {promo.pointPrice === 0 ? "Free" : `${promo.pointPrice} points`}
              </span>
            </div>

            <div className="pt-1">
              <ClaimButton
                buttonState={buttonState}
                onClick={handleAction}
                isSubmitting={isSubmitting}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col justify-between overflow-hidden border border-[#d7d3eb] hover:border-[#3a46ed] bg-gradient-to-br from-[#ffffff] via-[#ffffff] to-[#f8f7ff] shadow-[0_10px_25px_rgba(44,38,79,0.05)] hover:shadow-[0_15px_30px_rgba(44,38,79,0.09)] transition-all duration-200 rounded-[18px]">
      <CardHeader className="p-4 pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base font-bold text-[#2c264f] line-clamp-1 flex items-center gap-1.5">
            <Tag className="w-4 h-4 text-[#3a46ed] shrink-0" />
            {promo.title}
          </CardTitle>
          {getTierBadge(promo.requiredTier)}
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-1 flex flex-col gap-3 flex-1 justify-between">
        <p className="text-xs text-[#676375] line-clamp-2 leading-relaxed">
          {promo.description}
        </p>

        <div className="pt-2 border-t border-[#f1efff] flex flex-col gap-2">
          <div className="flex items-center justify-between text-xs">
            <span className="flex items-center gap-1 text-[#676375] font-medium">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Req:{" "}
              <strong className="text-[#3d3a4f]">{promo.requiredTier}</strong>
            </span>
            <span className="font-extrabold text-[#3a46ed]">
              {promo.pointPrice === 0 ? "Free" : `${promo.pointPrice} points`}
            </span>
          </div>

          <div className="pt-1">
            <ClaimButton
              buttonState={buttonState}
              onClick={handleAction}
              isSubmitting={isSubmitting}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
