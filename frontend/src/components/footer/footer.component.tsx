import "./footer.component.scss";

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white mt-8 position-absolute bottom-0 w-full rounded-t-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid md:grid-cols-3 gap-8 text-sm text-gray-300">
          <div>
            <h3 className="text-lg font-bold text-white mb-3">EzWash</h3>
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
  );
}
