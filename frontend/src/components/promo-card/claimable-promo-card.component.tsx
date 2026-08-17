import React from "react";
import type { ClaimablePromo } from "@/models/promo.model";
import { checkPromoEligibility } from "@/services/promo-eligibility.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ClaimButton } from "./claim-button.component";
import { Sparkles, Tag } from "lucide-react";

interface ClaimablePromoCardProps {
  promo: ClaimablePromo;
  isLoggedIn: boolean;
  currentTier?: string;
  pointsBalance: number;
  onClaim: (promo: ClaimablePromo) => void;
  onOpenSignIn?: () => void;
  isSubmitting?: boolean;
}

export const ClaimablePromoCard: React.FC<ClaimablePromoCardProps> = ({
  promo,
  isLoggedIn,
  currentTier,
  pointsBalance,
  onClaim,
  onOpenSignIn,
  isSubmitting,
}) => {
  const buttonState = checkPromoEligibility(
    isLoggedIn,
    currentTier,
    pointsBalance,
    promo,
  );

  const isClaimable = buttonState.type === "CLAIMABLE";

  const getTierBadge = (tier: string) => {
    switch (tier.toUpperCase()) {
      case "PLATINUM":
        return (
          <Badge className="bg-[#f3e8ff] text-[#7c3aed] border-[#e9d5ff] font-bold text-[10px]">
            Platinum Tier
          </Badge>
        );
      case "GOLD":
        return (
          <Badge className="bg-[#fef3c7] text-[#b45309] border-[#fde68a] font-bold text-[10px]">
            Gold+
          </Badge>
        );
      case "SILVER":
        return (
          <Badge className="bg-[#f1f5f9] text-[#475569] border-[#e2e8f0] font-bold text-[10px]">
            Silver+
          </Badge>
        );
      default:
        return (
          <Badge className="bg-[#f8f7ff] text-[#676375] border-[#e8e6f3] font-bold text-[10px]">
            Member
          </Badge>
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
              {buttonState.type === "LACKS_TIER"
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
                {promo.pointPrice} points
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
              {promo.pointPrice} points
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
