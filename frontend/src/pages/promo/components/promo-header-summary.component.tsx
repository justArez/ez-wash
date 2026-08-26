import React from "react";
import { Badge } from "@/components/ui/badge";
import { BadgePercent, Coins, Crown } from "lucide-react";

interface PromoHeaderSummaryProps {
  currentTier: string;
  pointsBalance: number;
  isLoggedIn: boolean;
  onOpenSignIn?: () => void;
}

export const PromoHeaderSummary: React.FC<PromoHeaderSummaryProps> = ({
  currentTier,
  pointsBalance,
  isLoggedIn,
  onOpenSignIn,
}) => {
  return (
    <div className="promo-intro p-6 md:p-8 rounded-[24px] border border-[#e8e6f3] bg-gradient-to-br from-[#f8f7ff] via-[#ffffff] to-[#eef2ff] shadow-[0_20px_40px_rgba(44,38,79,0.06)] flex flex-col md:flex-row md:items-center md:justify-between gap-6">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <BadgePercent size={36} />
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-[#2c264f]">
            Rewards & Promotions
          </h1>
        </div>
        <p className="text-sm text-[#676375] max-w-xl">
          Redeem your loyalty points for discounts, complimentary upgrades, and
          priority access perks.
        </p>
      </div>

      <div className="flex items-center gap-3 self-start md:self-auto bg-[#ffffff] px-5 py-3 rounded-2xl border border-[#e8e6f3] shadow-xs">
        {isLoggedIn ? (
          <>
            <div className="flex flex-col">
              <span className="text-[10px] text-[#676375] uppercase font-bold tracking-wider">
                Current Tier
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Crown className="w-3.5 h-3.5 text-amber-500" />
                <Badge className="bg-[rgba(58,70,237,0.08)] text-[#3721b6] hover:bg-[rgba(58,70,237,0.12)] border-[#d7d3eb] text-xs font-bold uppercase">
                  {currentTier || "Member"}
                </Badge>
              </div>
            </div>

            <div className="h-8 w-px bg-[#e8e6f3] mx-1" />

            <div className="flex flex-col">
              <span className="text-[10px] text-[#676375] uppercase font-bold tracking-wider">
                Redeemable Points
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Coins className="w-4 h-4 text-amber-500" />
                <span className="text-base font-extrabold text-[#2c264f]">
                  {pointsBalance.toLocaleString()}{" "}
                  <span className="text-xs font-semibold text-[#676375]">
                    pts
                  </span>
                </span>
              </div>
            </div>
          </>
        ) : (
          <div className="flex items-center gap-3">
            <span className="text-xs text-[#676375]">
              Sign in to check points:
            </span>
            <button
              type="button"
              onClick={onOpenSignIn}
              className="text-xs font-bold text-[#3a46ed] hover:text-[#3721b6] underline underline-offset-2"
            >
              Sign In
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
