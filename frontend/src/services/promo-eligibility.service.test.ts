import { checkPromoEligibility } from "./promo-eligibility.service";
import type { ClaimablePromo } from "../models/promo.model";

export function runEligibilityUnitChecks() {
  const silverPromo: ClaimablePromo = {
    id: "silver-1",
    title: "15% Off Detail",
    description: "15% discount",
    pointPrice: 300,
    requiredTier: "SILVER",
    tierGroup: "SILVER TIER & ABOVE",
    perkType: "detail-15",
  };

  const platinumPromo: ClaimablePromo = {
    id: "plat-1",
    title: "Ultimate Spa",
    description: "Spa wash",
    pointPrice: 2500,
    requiredTier: "PLATINUM",
    tierGroup: "PLATINUM TIER",
    perkType: "spa-wash",
  };

  // Test 1: Unauthenticated
  const resUnauth = checkPromoEligibility(false, "Gold", 1500, silverPromo);
  console.assert(
    resUnauth.type === "UNAUTHENTICATED",
    "Test 1 Failed: Should be unauthenticated",
  );

  // Test 2: Eligible
  const resEligible = checkPromoEligibility(true, "Gold", 1500, silverPromo);
  console.assert(
    resEligible.type === "CLAIMABLE",
    "Test 2 Failed: Gold user with 1500pts should claim 300pt silver promo",
  );

  // Test 3: Lacks Tier (Gold vs Platinum requirement)
  const resLacksTier = checkPromoEligibility(true, "Gold", 3000, platinumPromo);
  console.assert(
    resLacksTier.type === "LACKS_TIER",
    "Test 3 Failed: Gold user lacks platinum tier",
  );

  // Test 4: Insufficient Points (Gold with 200pts vs 300pt promo)
  const resLowPts = checkPromoEligibility(true, "Gold", 200, silverPromo);
  console.assert(
    resLowPts.type === "INSUFFICIENT_PTS",
    "Test 4 Failed: 200pts is insufficient for 300pts",
  );

  return true;
}

// Self-execute checks during module load to ensure stability
runEligibilityUnitChecks();
