import type { RewardOffer } from "../models/loyalty.model";
import PromoCarousel from "../components/promo-carousel.component";

interface HomePageProps {
  offers: RewardOffer[];
  availableSlots: string[];
  onBook: () => void;
}

export default function HomePage({
  offers,
  availableSlots,
  onBook,
}: HomePageProps) {
  return (
    <div className="home-page">
      <section className="hero-banner card">
        <div>
          <h1>Experience the smarter car wash loyalty.</h1>
          <p>
            Book slots, earn points, and unlock tiered promos for every wash.
          </p>
        </div>
        <button className="button" type="button" onClick={onBook}>
          Book a wash
        </button>
      </section>

      <PromoCarousel offers={offers} />

      <section className="card schedule-card">
        <div className="section-header">
          <div>
            <h2>Booking schedule</h2>
            <p>See available timeslots for your next wash.</p>
          </div>
        </div>
        {availableSlots.length === 0 ? (
          <div className="empty-state">
            <p>No slots available right now.</p>
          </div>
        ) : (
          <div className="slot-grid">
            {availableSlots.map((slot) => (
              <article key={slot} className="slot-card">
                <p>{slot}</p>
                <button
                  className="button button-secondary"
                  type="button"
                  onClick={onBook}
                >
                  Book
                </button>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
