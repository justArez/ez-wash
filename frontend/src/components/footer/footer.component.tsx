import "./footer.component.scss";

export default function Footer() {
  return (
    <footer className="app-footer card">
      <div>
        <strong>EzWash Loyalty</strong>
        <p>Modern car wash rewards and booking made simple.</p>
      </div>
      <div className="footer-links">
        <button type="button" className="footer-link">
          Home
        </button>
        <button type="button" className="footer-link">
          Bookings
        </button>
        <button type="button" className="footer-link">
          Promo
        </button>
      </div>
      <p className="footer-note">Need help? Contact support@ezwash.example</p>
    </footer>
  );
}
