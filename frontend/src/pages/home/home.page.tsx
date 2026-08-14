import { useState } from "react";
import "./home.page.scss";
import type { RewardOffer } from "../../models/loyalty.model";
import { HeroBanner } from "../../components/hero-banner/hero-banner.component";
import { PromotionCarousel } from "../../components/promotion-carousel/promotion-carousel.component";
import { SlotCalendar } from "../../components/slot-calendar/slot-calendar.component";
import type { Promotion, TimeSlot } from "../../types/homepage.types";
import Footer from "../../components/footer/footer.component";

interface HomePageProps {
  offers: RewardOffer[];
  availableSlots: string[];
  onBook: () => void;
}

export default function HomePage({ onBook }: HomePageProps) {
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
    <div className="min-h-screen bg-gray-50 rounded-xl">
      <main className="max-w-7xl  px-4 sm:px-6 lg:px-8 py-8 ">
        <section aria-labelledby="hero-heading">
          <h2 id="hero-heading" className="sr-only">
            Value Proposition
          </h2>
          <HeroBanner onCtaClick={handleScrollToSlots} />
        </section>

        <section aria-labelledby="promotions-heading" className="mt-4">
          <h2 id="promotions-heading" className="sr-only ">
            Current Promotions
          </h2>
          <PromotionCarousel
            onPromotionSelected={(promotion: Promotion) => {
              console.log("Selected promotion:", promotion.name);
            }}
          />
        </section>

        <section aria-labelledby="slots-heading">
          <h2 id="slots-heading" className="sr-only scroll-mt-28">
            Available Time Slots
          </h2>
          <SlotCalendar
            selectedSlotId={selectedSlot?.id}
            onSlotClick={handleSlotClick}
          />
        </section>
      </main>
    </div>
  );
}
