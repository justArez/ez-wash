import "./admin-dashboard.page.scss";

export default function AdminDashboardPage() {
  return (
    <section className="card">
      <div className="section-header">
        <div>
          <h2>Admin Dashboard</h2>
          <p>
            Access dashboard insights, promo tools, tier management, bookings,
            and users.
          </p>
        </div>
      </div>
      <div className="dashboard-widgets">
        <div className="card widget">
          <h3>Active bookings</h3>
          <p>Summary data will appear here once connected.</p>
        </div>
        <div className="card widget">
          <h3>Promo activity</h3>
          <p>Track current promotions and engagement.</p>
        </div>
        <div className="card widget">
          <h3>Tier distribution</h3>
          <p>View loyalty tier breakdown and customer counts.</p>
        </div>
      </div>
    </section>
  );
}
