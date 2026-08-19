import { useState, useMemo, useEffect } from "react";
import type { DashboardResponse } from "../../models/loyalty.model";
import type {
  ClaimablePromo,
  ClaimedPromo,
  GlobalPromotion,
} from "../../models/promo.model";
import {
  initialGlobalPromotions,
  initialClaimablePromos,
} from "../../services/loyalty.mock-data";
import {
  loadClaimedPromos,
  appendClaimedPromo,
} from "../../services/promo-storage.service";
import {
  claimPromo,
  fetchClaimedPromos,
  fetchPublicPromotions,
} from "../../services/loyalty.service";
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
  const currentTier = dashboard?.tier?.name || "Member";
  const [pointsBalance, setPointsBalance] = useState<number>(
    () => dashboard?.pointsBalance ?? 0,
  );
  const [claimedPromos, setClaimedPromos] = useState<ClaimedPromo[]>(() =>
    loadClaimedPromos(dashboard?.customerId),
  );
  const [globalPromos, setGlobalPromos] = useState<GlobalPromotion[]>(
    initialGlobalPromotions,
  );
  const [claimablePromosList, setClaimablePromosList] = useState<
    ClaimablePromo[]
  >(initialClaimablePromos);
  const [isSubmittingClaim, setIsSubmittingClaim] = useState(false);
  const [claimToast, setClaimToast] = useState<string | null>(null);

  // Sync pointsBalance if dashboard changes
  useEffect(() => {
    if (dashboard) {
      setPointsBalance(dashboard.pointsBalance);
    }
  }, [dashboard]);

  // Fetch live promotions from API
  useEffect(() => {
    fetchPublicPromotions()
      .then((data) => {
        if (data && data.length > 0) {
          // Map to global promotions
          const globals: GlobalPromotion[] = data
            .filter(
              (p) =>
                p.category === "discount" ||
                p.category === "new_member" ||
                !p.requiredTier ||
                p.pointPrice === 0,
            )
            .map((p) => ({
              id: p.id,
              title: p.title || p.name,
              description: p.description,
              discountPercentage: p.discountPercentage,
              badgeLabel:
                p.badgeLabel ||
                (p.discountPercentage
                  ? `${p.discountPercentage}% OFF`
                  : "SPECIAL"),
              validUntil: p.validUntil || p.endDate || "2026-12-31",
              isActive: p.isActive,
            }));
          if (globals.length > 0) setGlobalPromos(globals);

          // Map to claimable tier promos
          const claimables: ClaimablePromo[] = data
            .filter(
              (p) =>
                (p.pointPrice && Number(p.pointPrice) > 0) ||
                p.category === "tier_reward",
            )
            .map((p) => {
              const reqTierUpper = (p.requiredTier?.toUpperCase() ||
                p.applicableTiers?.[0]?.toUpperCase() ||
                "MEMBER") as any;
              let tierGroup: ClaimablePromo["tierGroup"] =
                "SILVER TIER & ABOVE";
              if (reqTierUpper === "GOLD") tierGroup = "GOLD TIER & ABOVE";
              if (reqTierUpper === "PLATINUM") tierGroup = "PLATINUM TIER";
              if (reqTierUpper === "MEMBER") tierGroup = "MEMBER TIER";

              return {
                id: p.id,
                title: p.title || p.name,
                description: p.description,
                pointPrice:
                  typeof p.pointPrice === "number"
                    ? p.pointPrice
                    : Number(p.pointPrice) || 100,
                requiredTier: reqTierUpper,
                tierGroup,
                perkType: p.perkType || "REWARD_DISCOUNT",
                validityDays: p.validityDays || 30,
              };
            });
          if (claimables.length > 0) setClaimablePromosList(claimables);
        }
      })
      .catch((err) => {
        console.warn(
          "Failed to fetch promotions from API, using fallback:",
          err,
        );
      });
  }, []);

  // Fetch customer's claimed vouchers from backend
  useEffect(() => {
    if (dashboard?.phone) {
      fetchClaimedPromos(dashboard.phone)
        .then((vouchers) => {
          if (vouchers && vouchers.length > 0) {
            setClaimedPromos(vouchers);
          }
        })
        .catch(() => {
          // fallback to localStorage
        });
    }
  }, [dashboard?.phone]);

  // Group claimable promos by tier groups
  const silverPromos = useMemo(
    () =>
      claimablePromosList.filter(
        (p) =>
          p.tierGroup === "SILVER TIER & ABOVE" ||
          p.tierGroup === "MEMBER TIER",
      ),
    [claimablePromosList],
  );
  const goldPromos = useMemo(
    () =>
      claimablePromosList.filter((p) => p.tierGroup === "GOLD TIER & ABOVE"),
    [claimablePromosList],
  );
  const platinumPromos = useMemo(
    () => claimablePromosList.filter((p) => p.tierGroup === "PLATINUM TIER"),
    [claimablePromosList],
  );

  const handleClaimPromo = async (promo: ClaimablePromo) => {
    if (!isLoggedIn || !dashboard?.phone) {
      onOpenSignIn?.();
      return;
    }

    if (pointsBalance < promo.pointPrice) return;

    setIsSubmittingClaim(true);
    try {
      // Call backend claim API
      const result = await claimPromo(promo.id, dashboard.phone);
      if (result.success && result.claimedPromo) {
        setPointsBalance(result.pointsBalance);
        setClaimedPromos((prev) => [result.claimedPromo, ...prev]);
        appendClaimedPromo(result.claimedPromo, dashboard.customerId);

        setClaimToast(`Claimed "${promo.title}"! Added to Your Promos.`);
        setTimeout(() => setClaimToast(null), 4000);
      }
    } catch {
      // Fallback local claim
      const newBalance = pointsBalance - promo.pointPrice;
      setPointsBalance(newBalance);

      const newVoucher: ClaimedPromo = {
        id: `claim-${Date.now()}`,
        promoId: promo.id,
        title: promo.title,
        description: promo.description,
        claimedAt: new Date().toISOString(),
        validUntil: "30 days from now",
        status: "ACTIVE",
        perkIdentifier: promo.perkType,
      };

      const updated = appendClaimedPromo(newVoucher, dashboard?.customerId);
      setClaimedPromos(updated);
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
    <div className="promo-page-container flex flex-col gap-8 max-w-7xl w-full">
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

      <div className="flex flex-col gap-8 p-8 bg-white rounded-[20px] border border-[#e8e6f3] shadow-[0_12px_28px_rgba(58,70,237,0.18)]">
        {/* Section 1: Global Active Promotions Banner */}
        <GlobalPromoBanner promotions={globalPromos} />

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
    </div>
  );
}
