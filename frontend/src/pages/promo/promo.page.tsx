import { useState, useMemo } from "react";
import type { DashboardResponse } from "../../models/loyalty.model";
import type { ClaimablePromo, ClaimedPromo } from "../../models/promo.model";
import {
  initialGlobalPromotions,
  initialClaimablePromos,
} from "../../services/loyalty.mock-data";
import {
  loadClaimedPromos,
  appendClaimedPromo,
} from "../../services/promo-storage.service";
import { PromoHeaderSummary } from "./components/promo-header-summary.component";
import { GlobalPromoBanner } from "./components/global-promo-banner.component";
import { ClaimedPromosSection } from "./components/claimed-promos-section.component";
import { TierPromoSection } from "./components/tier-promo-section.component";
import "./promo.page.scss";

interface PromoPageProps {
  dashboard: DashboardResponse | null;
  offers?: unknown[];
  onOpenSignIn?: () => void;
  onOpenBookings?: (promoContext?: string) => void;
}

export default function PromoPage({
  dashboard,
  onOpenSignIn,
  onOpenBookings,
}: PromoPageProps) {
  const isLoggedIn = Boolean(dashboard);
  const currentTier =
    dashboard?.tier?.name || dashboard?.loyaltyTier?.name || "Member";
  const [pointsBalance, setPointsBalance] = useState<number>(
    () => dashboard?.pointsBalance ?? 0,
  );
  const [claimedPromos, setClaimedPromos] = useState<ClaimedPromo[]>(() =>
    loadClaimedPromos(dashboard?.customerId),
  );
  const [isSubmittingClaim, setIsSubmittingClaim] = useState(false);
  const [claimToast, setClaimToast] = useState<string | null>(null);

  // Group claimable promos by tier groups
  const silverPromos = useMemo(
    () =>
      initialClaimablePromos.filter(
        (p) => p.tierGroup === "SILVER TIER & ABOVE",
      ),
    [],
  );
  const goldPromos = useMemo(
    () =>
      initialClaimablePromos.filter((p) => p.tierGroup === "GOLD TIER & ABOVE"),
    [],
  );
  const platinumPromos = useMemo(
    () => initialClaimablePromos.filter((p) => p.tierGroup === "PLATINUM TIER"),
    [],
  );

  const handleClaimPromo = async (promo: ClaimablePromo) => {
    if (!isLoggedIn) {
      onOpenSignIn?.();
      return;
    }

    if (pointsBalance < promo.pointPrice) return;

    setIsSubmittingClaim(true);
    try {
      // Deduct points
      const newBalance = pointsBalance - promo.pointPrice;
      setPointsBalance(newBalance);
      if (dashboard) {
        dashboard.pointsBalance = newBalance;
      }

      // Create claimed voucher
      const newVoucher: ClaimedPromo = {
        id: `claim-${Date.now()}`,
        promoId: promo.id,
        title: promo.title,
        description: promo.description,
        claimedAt: new Date().toISOString(),
        validUntil: `30 days from now`,
        status: "ACTIVE",
        perkIdentifier: promo.perkType,
      };

      const updatedVouchers = appendClaimedPromo(
        newVoucher,
        dashboard?.customerId,
      );
      setClaimedPromos(updatedVouchers);

      setClaimToast(`Claimed "${promo.title}"! Added to Your Promos.`);
      setTimeout(() => setClaimToast(null), 4000);
    } finally {
      setIsSubmittingClaim(false);
    }
  };

  const handleUseClaimedPromo = (voucher: ClaimedPromo) => {
    if (onOpenBookings) {
      onOpenBookings(voucher.perkIdentifier);
    }
  };

  return (
    <div className="promo-page-container flex flex-col gap-8 max-w-6xl mx-auto px-4 py-6">
      {/* Toast notification */}
      {claimToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-xl border border-indigo-500/30 flex items-center gap-2 animate-slideUp">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          {claimToast}
        </div>
      )}

      {/* Header Summary */}
      <PromoHeaderSummary
        currentTier={currentTier}
        pointsBalance={pointsBalance}
        isLoggedIn={isLoggedIn}
        onOpenSignIn={onOpenSignIn}
      />

      {/* Section 1: Global Active Promotions Banner */}
      <GlobalPromoBanner promotions={initialGlobalPromotions} />

      {/* Section 2: Your Promos (Claimed) */}
      <ClaimedPromosSection
        claimedPromos={claimedPromos}
        onUseNow={handleUseClaimedPromo}
        isLoggedIn={isLoggedIn}
      />

      {/* Section 3: Acclaimable Promos by Tier */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <h2 className="text-xl font-bold text-[#2c264f]">
            Acclaimable Promos (By Tier)
          </h2>
          <p className="text-xs text-[#676375]">
            Select an offer below to redeem with your available wash points.
          </p>
        </div>

        <div className="flex flex-col gap-8">
          <TierPromoSection
            title="Silver Tier & Above"
            promos={silverPromos}
            isLoggedIn={isLoggedIn}
            currentTier={currentTier}
            pointsBalance={pointsBalance}
            onClaim={handleClaimPromo}
            onOpenSignIn={onOpenSignIn}
            isSubmitting={isSubmittingClaim}
          />

          <TierPromoSection
            title="Gold Tier & Above"
            promos={goldPromos}
            isLoggedIn={isLoggedIn}
            currentTier={currentTier}
            pointsBalance={pointsBalance}
            onClaim={handleClaimPromo}
            onOpenSignIn={onOpenSignIn}
            isSubmitting={isSubmittingClaim}
          />

          <TierPromoSection
            title="Platinum Tier"
            promos={platinumPromos}
            isLoggedIn={isLoggedIn}
            currentTier={currentTier}
            pointsBalance={pointsBalance}
            onClaim={handleClaimPromo}
            onOpenSignIn={onOpenSignIn}
            isSubmitting={isSubmittingClaim}
          />
        </div>
      </div>
    </div>
  );
}
