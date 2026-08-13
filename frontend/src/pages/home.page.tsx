import { useState } from "react";
import type { RewardOffer } from "../models/loyalty.model";
import Header from "../components/header.component";
import { HeroBanner } from "../components/hero-banner.component";
import { PromotionCarousel } from "../components/promotion-carousel.component";
import { SlotCalendar } from "../components/slot-calendar.component";
import type { Promotion, TimeSlot } from "../types/homepage.types";

interface HomePageProps {
  offers: RewardOffer[];
  availableSlots: string[];
  onBook: () => void;
}

export default function HomePage({ onBook }: HomePageProps) {
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [currentPage, setCurrentPage] = useState("home");

  const handleSlotClick = (slot: TimeSlot) => {
    setSelectedSlot(slot);
    onBook();
  };

  const handleNavigation = (path: string) => {
    const normalized = path.replace(/^\//, "");
    setCurrentPage(normalized || "home");
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header currentPage={currentPage} onNavigate={handleNavigation} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        <section aria-labelledby="hero-heading">
          <h2 id="hero-heading" className="sr-only">
            Value Proposition
          </h2>
          <HeroBanner onCtaClick={onBook} />
        </section>

        <section aria-labelledby="promotions-heading">
          <h2 id="promotions-heading" className="sr-only">
            Current Promotions
          </h2>
          <PromotionCarousel
            onPromotionSelected={(promotion: Promotion) => {
              console.log("Selected promotion:", promotion.name);
            }}
          />
        </section>

        <section aria-labelledby="slots-heading">
          <h2 id="slots-heading" className="sr-only">
            Available Time Slots
          </h2>
          <SlotCalendar
            selectedSlotId={selectedSlot?.id}
            onSlotClick={handleSlotClick}
          />
        </section>
      </main>

      <footer className="bg-gray-800 text-white mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid md:grid-cols-3 gap-8 text-sm text-gray-300">
            <div>
              <h3 className="text-lg font-bold text-white mb-3">AutoWash</h3>
              <p>
                Smart automated car wash with easy booking and loyalty rewards.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">Quick Links</h4>
              <ul className="space-y-2">
                <li>Home</li>
                <li>Bookings</li>
                <li>Promotions</li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">Support</h4>
              <ul className="space-y-2">
                <li>Contact</li>
                <li>FAQ</li>
                <li>Privacy</li>
              </ul>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
