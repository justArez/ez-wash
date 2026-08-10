import type { DashboardResponse } from "../../models/loyalty.model";
import "./loyalty-dashboard.css";

interface LoyaltyDashboardProps {
  dashboard: DashboardResponse;
  onRefresh: () => void;
}

export default function LoyaltyDashboard({
  dashboard,
  onRefresh,
}: LoyaltyDashboardProps) {
  return (
    <section className="card dashboard-card">
      <div className="section-header">
        <div>
          <h3>Loyalty dashboard</h3>
          <p>
            Track tier status, points, perks, and reward suggestions instantly.
          </p>
        </div>
        <button className="secondary-button" type="button" onClick={onRefresh}>
          Refresh
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <span className="stat-label">Phone</span>
          <strong>{dashboard.phone}</strong>
        </div>
        <div className="stat-card">
          <span className="stat-label">Tier</span>
          <strong>{dashboard.tier.name}</strong>
        </div>
        <div className="stat-card">
          <span className="stat-label">Points</span>
          <strong>{dashboard.pointsBalance}</strong>
        </div>
        <div className="stat-card">
          <span className="stat-label">Next booking</span>
          <strong>{dashboard.nextEligibleBookingDate}</strong>
        </div>
      </div>

      <div className="content-grid">
        <div className="card panel">
          <h4>Linked vehicles</h4>
          <ul className="list-compact">
            {dashboard.vehicles.map((vehicle) => (
              <li key={vehicle.plate}>
                <strong>{vehicle.plate}</strong>
                <span>{vehicle.model}</span>
                <span className="pill">{vehicle.type}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="card panel">
          <h4>Reward suggestions</h4>
          {dashboard.rewardSuggestions.length ? (
            <ul className="list-compact">
              {dashboard.rewardSuggestions.map((offer) => (
                <li key={offer.id}>
                  <strong>{offer.title}</strong>
                  <p>{offer.description}</p>
                  <span className="pill">{offer.pointsRequired} pts</span>
                </li>
              ))}
            </ul>
          ) : (
            <p>No reward suggestions available.</p>
          )}
        </div>
      </div>

      <div className="history-grid">
        <div className="card panel">
          <h4>Recent bookings</h4>
          {dashboard.bookingHistory.length ? (
            <ul className="list-compact">
              {dashboard.bookingHistory.map((booking) => (
                <li key={booking.id}>
                  <div>
                    <strong>{booking.date}</strong>
                    <span className="pill">{booking.status}</span>
                  </div>
                  <p>{booking.vehiclePlate}</p>
                  {booking.note && <p className="note">{booking.note}</p>}
                </li>
              ))}
            </ul>
          ) : (
            <p>No bookings yet.</p>
          )}
        </div>

        <div className="card panel">
          <h4>Points activity</h4>
          {dashboard.pointHistory.length ? (
            <ul className="list-compact">
              {dashboard.pointHistory.map((entry) => (
                <li key={entry.id}>
                  <div>
                    <strong>{entry.type}</strong>
                    <span>{entry.date}</span>
                  </div>
                  <p>{entry.description}</p>
                  <span className="pill">{entry.amount} pts</span>
                </li>
              ))}
            </ul>
          ) : (
            <p>No point activity yet.</p>
          )}
        </div>
      </div>
    </section>
  );
}
