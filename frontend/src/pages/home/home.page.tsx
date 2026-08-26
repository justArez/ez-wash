import { useState, useMemo, useEffect } from "react";
import "./home.page.scss";
import type { DashboardResponse } from "../../models/customer.model";
import type { RewardOffer, ClaimedPromo } from "../../models/promo.model";
import { HeroBanner } from "../../components/hero-banner/hero-banner.component";
import { PromotionCarousel } from "../../components/promotion-carousel/promotion-carousel.component";
import { SlotCalendar } from "../../components/slot-calendar/slot-calendar.component";
import type { Promotion, TimeSlot } from "../../types/homepage.types";
import {
  loadClaimedPromos,
  saveClaimedPromos,
} from "../../services/promo-storage.service";
import { fetchClaimedPromos } from "../../services/loyalty.service";

interface HomePageProps {
  dashboard?: DashboardResponse | null;
  offers: RewardOffer[];
  availableSlots: string[];
  onBook: (slotOrPromo?: TimeSlot | string) => void;
  onOpenSignIn?: () => void;
  onNavigate?: (path: string) => void;
  refreshTrigger?: number;
}

export default function HomePage({
  dashboard,
  onBook,
  onOpenSignIn,
  onNavigate,
  refreshTrigger,
}: HomePageProps) {
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [claimedPromos, setClaimedPromos] = useState<ClaimedPromo[]>(() =>
    loadClaimedPromos(dashboard?.customerId),
  );

  useEffect(() => {
    if (dashboard?.claimedPromos && dashboard.claimedPromos.length > 0) {
      setClaimedPromos(dashboard.claimedPromos);
    } else {
      setClaimedPromos(loadClaimedPromos(dashboard?.customerId));
    }
  }, [dashboard?.customerId, dashboard?.claimedPromos]);

  useEffect(() => {
    if (dashboard?.phone) {
      fetchClaimedPromos(dashboard.phone)
        .then((vouchers) => {
          if (vouchers && vouchers.length >= 0) {
            setClaimedPromos(vouchers);
            saveClaimedPromos(vouchers, dashboard?.customerId);
          }
        })
        .catch((err) => {
          console.error("Failed to fetch claimed promos on homepage:", err);
        });
    }
  }, [dashboard?.phone, dashboard?.customerId]);

  const claimedPromoIds = useMemo(() => {
    const fromState = claimedPromos.map((p) => p.promoId || p.id);
    const fromDashboard = (dashboard?.claimedPromos || []).map(
      (p) => p.promoId || p.id,
    );
    const all = Array.from(new Set([...fromState, ...fromDashboard]));
    return all;
  }, [claimedPromos, dashboard?.claimedPromos]);

  const handleSlotClick = (slot: TimeSlot) => {
    setSelectedSlot(slot);
    onBook(slot);
  };

  const handleScrollToSlots = () => {
    document
      .getElementById("slots-heading")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="homepage-container min-h-screen bg-gray-50 rounded-xl w-full">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex flex-col gap-8">
        <section aria-labelledby="hero-heading" className="w-full">
          <h2 id="hero-heading" className="sr-only">
            Value Proposition
          </h2>
          <HeroBanner onCtaClick={handleScrollToSlots} />
        </section>

        <section aria-labelledby="promotions-heading" className="w-full">
          <h2 id="promotions-heading" className="sr-only">
            Current Promotions
          </h2>
          <PromotionCarousel
            dashboard={dashboard}
            claimedPromoIds={claimedPromoIds}
            onOpenSignIn={onOpenSignIn}
            onOpenBookings={onBook}
            onNavigate={onNavigate}
            onPromotionSelected={(promotion: Promotion) => {
              console.log("Selected promotion:", promotion.name);
            }}
          />
        </section>

        <section
          aria-labelledby="slots-heading"
          className="w-full scroll-mt-28"
        >
          <h2 id="slots-heading" className="sr-only">
            Available Time Slots
          </h2>
          <SlotCalendar
            dashboard={dashboard}
            selectedSlotId={selectedSlot?.id}
            onSlotClick={handleSlotClick}
            refreshTrigger={refreshTrigger}
          />
        </section>
      </main>
    </div>
  );
}
