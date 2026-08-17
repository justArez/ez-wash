import type { ClaimablePromo, PromoButtonState } from "../models/promo.model";
import { TIER_RANK } from "../models/promo.model";

export function getTierRank(tierNameOrLevel?: string): number {
  if (!tierNameOrLevel) return 0;
  return TIER_RANK[tierNameOrLevel] ?? 0;
}

export function checkPromoEligibility(
  isLoggedIn: boolean,
  customerTier: string | undefined,
  pointsBalance: number,
  promo: ClaimablePromo,
): PromoButtonState {
  if (!isLoggedIn) {
    return { type: "UNAUTHENTICATED" };
  }

  const customerRank = getTierRank(customerTier);
  const requiredRank = getTierRank(promo.requiredTier);

  if (customerRank < requiredRank) {
    return { type: "LACKS_TIER", requiredTier: promo.requiredTier };
  }

  if (pointsBalance < promo.pointPrice) {
    return {
      type: "INSUFFICIENT_PTS",
      pointPrice: promo.pointPrice,
      deficit: promo.pointPrice - pointsBalance,
    };
  }

  return { type: "CLAIMABLE", pointPrice: promo.pointPrice };
}
