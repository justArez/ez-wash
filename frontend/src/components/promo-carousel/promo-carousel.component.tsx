import type { RewardOffer } from "../../models/loyalty.model";
import "./promo-carousel.component.scss";

interface PromoCarouselProps {
  offers: RewardOffer[];
}

export default function PromoCarousel({ offers }: PromoCarouselProps) {
  return (
    <section className="card promo-carousel">
      <div className="section-header">
        <div>
          <h2>Flash promotions</h2>
          <p>Catch the newest tier rewards and wash offers in one place.</p>
        </div>
      </div>
      {offers.length === 0 ? (
        <div className="empty-state">
          <p>No promo offers are currently active.</p>
        </div>
      ) : (
        <div className="carousel-grid">
          {offers.slice(0, 4).map((offer) => (
            <article key={offer.id} className="card promo-card">
              <h3>{offer.title}</h3>
              <p>{offer.description}</p>
              <div className="promo-meta">
                <span>{offer.pointsRequired} pts</span>
                <span>{offer.eligibleTiers.join(", ")}</span>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
