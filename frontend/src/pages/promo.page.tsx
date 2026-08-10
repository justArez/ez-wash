import type { RewardOffer, DashboardResponse } from "../models/loyalty.model";

interface PromoPageProps {
  dashboard: DashboardResponse | null;
  offers: RewardOffer[];
  onBack: () => void;
}

export default function PromoPage({
  dashboard,
  offers,
  onBack,
}: PromoPageProps) {
  const isLoggedIn = Boolean(dashboard);
  const pointsBalance = dashboard?.pointsBalance ?? 0;
  const currentTier = dashboard?.tier?.name ?? "";

  return (
    <section className="card">
      <div className="section-header">
        <div>
          <h2>Promo offers</h2>
          <p>
            View your current offers and eligibility based on your loyalty tier.
          </p>
        </div>
        <button
          className="button button-secondary"
          type="button"
          onClick={onBack}
        >
          Back
        </button>
      </div>

      {!isLoggedIn ? (
        <div className="empty-state">
          <p>Please sign in to see your available promos.</p>
        </div>
      ) : offers.length === 0 ? (
        <div className="empty-state">
          <p>No promo offers are available for your tier right now.</p>
        </div>
      ) : (
        <div className="promo-grid">
          {offers.map((offer) => {
            const isTierEligible = offer.eligibleTiers.includes(currentTier);
            const hasPoints = pointsBalance >= offer.pointsRequired;
            const canClaim = isTierEligible && hasPoints;

            return (
              <article key={offer.id} className="card promo-card">
                <h3>{offer.title}</h3>
                <p>{offer.description}</p>
                <div className="promo-meta">
                  <span>{offer.pointsRequired} pts</span>
                  <span>{offer.eligibleTiers.join(", ")}</span>
                </div>
                <button className="button" type="button" disabled={!canClaim}>
                  {canClaim ? "Claim" : "Unavailable"}
                </button>
                {!canClaim && (
                  <p className="note">
                    {isTierEligible
                      ? "Insufficient points."
                      : "Not eligible for your tier."}
                  </p>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
