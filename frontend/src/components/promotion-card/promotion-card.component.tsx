/**
 * PromotionCard Component - Displays a single promotion in the carousel
 * Supports Global Deals, Claimable Tier Rewards, and Current User Tier Perks.
 */

import React from "react";
import type { PromotionCardProps } from "../../types/homepage.types";
import { Badge } from "../common/badge";
import { Card } from "../common/card";
import { Button } from "../common/button";
import { Sparkles, Crown, Tag, CheckCircle2, Lock, Award } from "lucide-react";
import "./promotion-card.component.scss";

const TIER_RANK: Record<string, number> = {
  member: 0,
  Member: 0,
  MEMBER: 0,
  silver: 1,
  Silver: 1,
  SILVER: 1,
  gold: 2,
  Gold: 2,
  GOLD: 2,
  platinum: 3,
  Platinum: 3,
  PLATINUM: 3,
};

function getTierRank(tier?: string): number {
  if (!tier) return 0;
  return TIER_RANK[tier] ?? 0;
}

export const PromotionCard: React.FC<PromotionCardProps> = ({
  promotion,
  onViewDetails,
  isLoading = false,
  isExpanded = false,
  onToggleExpand,
  dashboard,
  claimedPromoIds,
  onOpenSignIn,
  onOpenBookings,
  onClaim,
  isClaiming = false,
}) => {
  if (isLoading) {
    return (
      <Card className="h-full min-h-[160px] animate-pulse border border-gray-200 bg-white p-4 shadow-sm flex flex-col justify-between rounded-xl">
        <div className="space-y-2">
          <div className="flex gap-2">
            <div className="h-5 w-16 rounded bg-gray-200" />
            <div className="h-5 w-20 rounded bg-gray-200" />
          </div>
          <div className="h-5 w-3/4 rounded bg-gray-300" />
          <div className="h-3 w-full rounded bg-gray-200" />
        </div>
        <div className="mt-3 flex items-center justify-between">
          <div className="h-3 w-24 rounded bg-gray-200" />
          <div className="h-8 w-24 rounded bg-gray-200" />
        </div>
      </Card>
    );
  }

  const isLoggedIn = Boolean(dashboard);
  const userTier = dashboard?.tier?.name || "Member";
  const userPoints = dashboard?.pointsBalance ?? 0;

  const isClaimed = Boolean(
    claimedPromoIds?.includes(promotion.id) ||
    dashboard?.bookingHistory?.some((b) =>
      Boolean(
        (b as unknown as { appliedPromoId?: string }).appliedPromoId ===
        promotion.id,
      ),
    ),
  );

  const pointCost =
    promotion.pointPrice || promotion.loyaltyPointsRequired || 0;
  const isClaimableReward =
    pointCost > 0 || promotion.category === "tier_reward";
  const requiredTier =
    promotion.requiredTier ||
    (promotion.applicableTiers?.[0]
      ? promotion.applicableTiers[0].toUpperCase()
      : undefined);

  const userRank = getTierRank(userTier);
  const reqRank = getTierRank(requiredTier);

  const meetsTier = !requiredTier || userRank >= reqRank;
  const meetsPoints = userPoints >= pointCost;
  const isEligibleToClaim =
    isLoggedIn && !isClaimed && meetsTier && meetsPoints;
  const isUserCurrentTierPromo = Boolean(
    requiredTier &&
    (userTier.toUpperCase() === requiredTier.toUpperCase() ||
      (reqRank > 0 && userRank >= reqRank)),
  );

  const handleToggle = () => {
    if (onToggleExpand) {
      onToggleExpand();
    } else if (onViewDetails) {
      onViewDetails(promotion);
    }
  };

  const handleClaimClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isLoggedIn) {
      onOpenSignIn?.();
      return;
    }
    if (isEligibleToClaim && onClaim) {
      onClaim(promotion);
    } else {
      handleToggle();
    }
  };

  const getTierBadge = (tier: string) => {
    switch (tier?.toUpperCase()) {
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
            Gold or upper
          </span>
        );
      case "SILVER":
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-300">
            Silver or upper
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

  return (
    <div className="promotion-card-wrapper relative w-full h-full min-h-[160px]">
      {/* Expanded Dialog Backdrop */}
      {isExpanded && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-[1px] transition-all duration-300"
          onClick={handleToggle}
          aria-hidden="true"
        />
      )}

      {/* Base / Collapsed Card */}
      <Card
        className={`w-full h-full border ${
          isUserCurrentTierPromo && isLoggedIn
            ? "border-[#d7d3eb] bg-gradient-to-br from-[#ffffff] via-[#ffffff] to-[#f8f7ff] shadow-[0_10px_25px_rgba(44,38,79,0.05)]"
            : "border-[#d7d3eb] bg-gradient-to-br from-[#ffffff] via-[#ffffff] to-[#f8f7ff] shadow-[0_10px_25px_rgba(44,38,79,0.05)]"
        } transition-all duration-300 hover:shadow-[0_15px_30px_rgba(44,38,79,0.09)] hover:border-[#3a46ed] flex flex-col justify-between p-4 rounded-[18px] ${
          isExpanded ? "invisible pointer-events-none" : ""
        }`}
      >
        <div className="flex flex-col gap-2 transition-all duration-300">
          {/* Badges and Action button row */}
          <div className="flex items-center gap-1.5 flex-wrap justify-between">
            <div className="flex items-center gap-1.5 flex-wrap">
              {promotion.discountPercentage > 0 && (
                <Badge
                  variant="destructive"
                  className="text-xs px-2 py-0.5 font-bold"
                >
                  {promotion.discountPercentage}% OFF
                </Badge>
              )}
              {promotion.bonusPoints ? (
                <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-xs px-2 py-0.5 font-bold">
                  +{promotion.bonusPoints} PTS
                </Badge>
              ) : null}
              {promotion.badgeLabel &&
                !promotion.discountPercentage &&
                !promotion.bonusPoints && (
                  <Badge
                    variant="secondary"
                    className="text-xs px-2 py-0.5 font-medium"
                  >
                    {promotion.badgeLabel}
                  </Badge>
                )}
              {getTierBadge(requiredTier)}
            </div>

            <div className="flex items-center gap-1.5">
              {isClaimableReward ? (
                isClaimed ? (
                  <Button
                    size="sm"
                    disabled
                    className="px-2.5 py-0.5 h-6 text-[11px] font-bold bg-[#f1f5f9] text-[#64748b] border border-[#cbd5e1] cursor-not-allowed rounded-lg shadow-none"
                  >
                    Claimed
                  </Button>
                ) : isLoggedIn && isEligibleToClaim ? (
                  <Button
                    size="sm"
                    className="px-2.5 py-0.5 h-6 text-[11px] font-bold bg-[#3a46ed] hover:bg-[#3721b6] text-white shrink-0 cursor-pointer shadow-xs rounded-lg active:scale-95 transition-all"
                    onClick={handleClaimClick}
                    disabled={isClaiming}
                  >
                    {isClaiming ? "Claiming..." : "Claim"}
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    className="px-2.5 py-0.5 h-6 text-[8px] font-medium border-[#d7d3eb] text-[#3a46ed] hover:bg-[#f1efff] shrink-0 cursor-pointer rounded-lg"
                    onClick={handleToggle}
                  >
                    View
                  </Button>
                )
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  className="px-2.5 py-0.5 h-6 text-[11px] font-medium border-[#d7d3eb] text-[#3a46ed] hover:bg-[#f1efff] shrink-0 cursor-pointer rounded-lg"
                  onClick={handleToggle}
                  aria-label={`View details for ${promotion.name}`}
                >
                  View
                </Button>
              )}
            </div>
          </div>

          {/* Title and description */}
          <div>
            <h3 className="text-base font-bold text-[#2c264f] line-clamp-1 flex items-center gap-1.5">
              <Tag className="w-4 h-4 text-[#3a46ed] shrink-0" />
              {promotion.name || promotion.title}
            </h3>
            <p className="text-xs text-[#676375] mt-0.5 line-clamp-2 leading-relaxed">
              {promotion.description}
            </p>
          </div>

          {/* Claimable Points info, Expiration date & Tier status row */}
          <div className="flex flex-wrap items-center justify-between gap-1 text-xs pt-1">
            <div className="flex items-center gap-2">
              {pointCost > 0 ? (
                <span className="flex items-center gap-1 font-bold text-[#3a46ed]">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  {pointCost} points to claim
                </span>
              ) : isClaimableReward ? (
                <span className="flex items-center gap-1 font-bold text-[#15803d]">
                  <Sparkles className="w-3.5 h-3.5 text-[#15803d]" />
                  Free to claim
                </span>
              ) : promotion.loyaltyPointsValue > 0 ? (
                <span className="text-[#15803d] font-medium">
                  +{promotion.loyaltyPointsValue} pts earned
                </span>
              ) : (
                <span className="text-[#676375] font-medium text-[11px]">
                  Instant Discount
                </span>
              )}

              <span className="text-[11px] text-[#676375] whitespace-nowrap">
                · Exp: {new Date(promotion.expiryDate).toLocaleDateString()}
              </span>
            </div>

            {isLoggedIn ? (
              isClaimableReward ? (
                isClaimed ? (
                  <span className="text-[11px] font-semibold text-[#64748b] flex items-center gap-0.5">
                    <CheckCircle2 className="w-3 h-3 text-[#64748b]" />
                    Claimed
                  </span>
                ) : isEligibleToClaim ? (
                  <span className="text-[11px] font-semibold text-[#15803d] flex items-center gap-0.5">
                    <CheckCircle2 className="w-3 h-3 text-[#15803d]" />
                    Unlocked
                  </span>
                ) : !meetsTier ? (
                  <span className="text-[11px] font-medium text-[#64748b] flex items-center gap-0.5">
                    <Lock className="w-3 h-3 text-[#94a3b8]" />
                    Req: {requiredTier}
                  </span>
                ) : (
                  <span className="text-[11px] font-medium text-amber-600">
                    Need {pointCost - userPoints} pts
                  </span>
                )
              ) : null
            ) : isClaimableReward ? (
              <span className="text-[10px] text-[#676375]">
                Sign in to redeem
              </span>
            ) : null}
          </div>
        </div>
      </Card>

      {/* Floating Pop-up Dialog */}
      {isExpanded && (
        <div className="absolute top-0 left-0 w-full z-30 promotion-card-expanded">
          <Card className="w-full border-2 border-[#3a46ed] bg-white shadow-2xl rounded-2xl p-5 flex flex-col gap-3 ring-4 ring-[#3a46ed]/10">
            <div className="flex flex-col gap-2.5">
              {/* Badges row with Close button */}
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {promotion.discountPercentage > 0 && (
                    <Badge
                      variant="destructive"
                      className="text-xs px-2.5 py-0.5 font-bold"
                    >
                      {promotion.discountPercentage}% OFF
                    </Badge>
                  )}
                  {promotion.bonusPoints ? (
                    <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-xs px-2.5 py-0.5 font-bold">
                      +{promotion.bonusPoints} PTS
                    </Badge>
                  ) : null}
                  {getTierBadge(requiredTier)}
                  {isClaimableReward && (
                    <Badge className="bg-[#f8f7ff] text-[#3a46ed] border-[#e8e6f3] text-xs px-2 py-0.5 font-bold">
                      Claimable Reward
                    </Badge>
                  )}
                </div>

                <button
                  onClick={handleToggle}
                  className="text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full p-1 transition-colors cursor-pointer"
                  aria-label="Close dialog"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2.5}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Title and full description */}
              <div>
                <h3 className="text-lg font-bold text-[#2c264f] leading-tight flex items-center gap-2">
                  {promotion.name || promotion.title}
                </h3>
                <p className="text-sm text-[#676375] mt-1.5 leading-relaxed">
                  {promotion.description}
                </p>
              </div>

              {/* Point cost / User eligibility banner */}
              {pointCost > 0 && (
                <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-[#f8f7ff] border border-[#e8e6f3] text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#2c264f] flex items-center gap-1">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      Points to Redeem:
                    </span>
                    <strong className="text-[#3a46ed] text-sm">
                      {pointCost} pts
                    </strong>
                  </div>
                  {isLoggedIn ? (
                    <div className="flex items-center justify-between pt-1 border-t border-[#e8e6f3] text-[11px]">
                      <span className="text-[#676375]">
                        Your Balance:{" "}
                        <strong className="text-[#2c264f]">
                          {userPoints} pts
                        </strong>{" "}
                        ({userTier} Tier)
                      </span>
                      {isEligibleToClaim ? (
                        <span className="text-[#15803d] font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Eligible to claim!
                        </span>
                      ) : !meetsTier ? (
                        <span className="text-amber-700 font-semibold">
                          Requires {requiredTier} tier
                        </span>
                      ) : (
                        <span className="text-amber-700 font-semibold">
                          Need {pointCost - userPoints} more pts
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-[#676375] text-[11px]">
                      Sign in to redeem this perk with your loyalty points.
                    </span>
                  )}
                </div>
              )}

              {/* Terms and conditions */}
              {promotion.terms && (
                <div className="pt-2 border-t border-[#e8e6f3]">
                  <span className="text-xs font-bold text-[#3d3a4f] uppercase tracking-wider">
                    Terms & Conditions
                  </span>
                  <p className="text-xs text-[#676375] mt-1 whitespace-pre-line leading-relaxed bg-[#f8f7ff] p-2.5 rounded-lg border border-[#e8e6f3] max-h-32 overflow-y-auto">
                    {promotion.terms}
                  </p>
                </div>
              )}

              <div className="flex items-center justify-between text-xs text-[#676375] pt-1">
                <span>
                  Category:{" "}
                  <strong className="capitalize text-[#3d3a4f]">
                    {(promotion.category || "discount").replace("_", " ")}
                  </strong>
                </span>
                <span>
                  Expires:{" "}
                  <strong className="text-[#3d3a4f]">
                    {new Date(promotion.expiryDate).toLocaleDateString()}
                  </strong>
                </span>
              </div>
            </div>

            {/* Bottom action bar */}
            <div className="mt-2 pt-3 border-t border-[#e8e6f3] flex items-center justify-end gap-2">
              <Button
                size="sm"
                variant="ghost"
                className="px-4 h-9 text-xs font-semibold cursor-pointer hover:bg-gray-100 text-[#3d3a4f]"
                onClick={handleToggle}
              >
                Close
              </Button>

              {isClaimableReward ? (
                !isLoggedIn ? (
                  <Button
                    size="sm"
                    className="px-4 h-9 text-xs font-bold bg-[#3a46ed] hover:bg-[#3721b6] text-white cursor-pointer"
                    onClick={() => {
                      handleToggle();
                      onOpenSignIn?.();
                    }}
                  >
                    Sign In to Redeem
                  </Button>
                ) : isClaimed ? (
                  <Button
                    size="sm"
                    disabled
                    className="px-4 h-9 text-xs font-bold bg-[#f1f5f9] text-[#64748b] border border-[#cbd5e1] cursor-not-allowed rounded-lg shadow-none"
                  >
                    Already Claimed
                  </Button>
                ) : isEligibleToClaim ? (
                  <Button
                    size="sm"
                    className="px-4 h-9 text-xs font-bold bg-[#3a46ed] hover:bg-[#3721b6] text-white cursor-pointer"
                    onClick={() => {
                      handleToggle();
                      onClaim?.(promotion);
                    }}
                    disabled={isClaiming}
                  >
                    {isClaiming
                      ? "Claiming..."
                      : `Redeem for ${pointCost === 0 ? "Free" : `${pointCost} Pts`}`}
                  </Button>
                ) : null
              ) : onOpenBookings ? (
                <Button
                  size="sm"
                  className="px-4 h-9 text-xs font-bold bg-[#3a46ed] hover:bg-[#3721b6] text-white cursor-pointer"
                  onClick={() => {
                    handleToggle();
                    onOpenBookings();
                  }}
                >
                  Book Wash with Promo
                </Button>
              ) : null}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

PromotionCard.displayName = "PromotionCard";
