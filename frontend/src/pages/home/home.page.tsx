import { useState } from "react";
import "./home.page.scss";
import type {
  DashboardResponse,
  RewardOffer,
} from "../../models/loyalty.model";
import { HeroBanner } from "../../components/hero-banner/hero-banner.component";
import { PromotionCarousel } from "../../components/promotion-carousel/promotion-carousel.component";
import { SlotCalendar } from "../../components/slot-calendar/slot-calendar.component";
import type { Promotion, TimeSlot } from "../../types/homepage.types";

interface HomePageProps {
  dashboard?: DashboardResponse | null;
  offers: RewardOffer[];
  availableSlots: string[];
  onBook: (promoContext?: string) => void;
  onOpenSignIn?: () => void;
}

export default function HomePage({
  dashboard,
  onBook,
  onOpenSignIn,
}: HomePageProps) {
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);

  const handleSlotClick = (slot: TimeSlot) => {
    setSelectedSlot(slot);
    onBook();
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
            onOpenSignIn={onOpenSignIn}
            onOpenBookings={onBook}
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
          />
        </section>
      </main>
    </div>
  );
}
