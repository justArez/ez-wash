import { useEffect, useMemo, useState } from "react";
import Header from "./components/header/header.component";
import Footer from "./components/footer/footer.component";
import AuthModal from "./components/auth-modal/auth-modal.component";
import BookingModal from "./components/booking-modal/booking-modal.component";
import Toast from "./components/toast/toast.component";
import HomePage from "./pages/home/home.page";
import BookingPage from "./pages/booking/booking.page";
import PromoPage from "./pages/promo/promo.page";
import AdminLoginPage from "./pages/admin/admin-login/admin-login.page";
import AdminDashboardPage from "./pages/admin/admin-dashboard/admin-dashboard.page";
import AdminPromoPage from "./pages/admin/admin-promo/admin-promo.page";
import AdminTierPage from "./pages/admin/admin-tier/admin-tier.page";
import AdminBookingsPage from "./pages/admin/admin-bookings/admin-bookings.page";
import AdminUsersPage from "./pages/admin/admin-users/admin-users.page";
import {
  linkLoyaltyAccount,
  fetchLoyaltyDashboard,
  createBooking,
} from "./services/loyalty.service";
import { DEMO_PHONE, demoDashboard } from "./services/loyalty.mock-data";
import type {
  DashboardResponse,
  LinkAccountRequest,
  ServiceOption,
  Vehicle,
} from "./models/loyalty.model";
import "./App.css";

type ViewState =
  | "home"
  | "bookings"
  | "promo"
  | "admin-login"
  | "admin-dashboard"
  | "admin-promo"
  | "admin-tier"
  | "admin-bookings"
  | "admin-users";

type AuthMode = "sign-in" | "sign-up";

const availableSlots = [
  "Today 09:00",
  "Today 11:00",
  "Today 13:00",
  "Today 15:00",
  "Tomorrow 10:00",
];

const serviceOptions: ServiceOption[] = [
  { id: "basic", label: "Basic wash", price: 12 },
  { id: "wax", label: "Wax protection", price: 8 },
  { id: "interior", label: "Interior cleaning", price: 15 },
  { id: "tire", label: "Tire shine", price: 6 },
];

function App() {
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const viewFromPath = (): ViewState => {
    if (window.location.pathname === "/bookings") return "bookings";
    if (window.location.pathname === "/promo") return "promo";
    return "home";
  };
  const [view, setView] = useState<ViewState>(viewFromPath);
  const [, setLoading] = useState(false);
  const [, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>("sign-in");
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [adminToken, setAdminToken] = useState<string | null>(null);
  const [showDemoToast, setShowDemoToast] = useState(false);

  const username = useMemo(() => dashboard?.phone ?? "", [dashboard]);

  const isLoggedIn = Boolean(dashboard);

  useEffect(() => {
    const handlePopState = () => setView(viewFromPath());
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const navigateTo = (target: string) => {
    const path =
      target === "bookings" || target === "/bookings"
        ? "/bookings"
        : target === "promo" || target === "/promo"
          ? "/promo"
          : "/";
    const nextView =
      path === "/bookings" ? "bookings" : path === "/promo" ? "promo" : "home";
    window.history.pushState({}, "", path);
    setView(nextView);
  };

  const refreshDashboard = async (phone: string) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (phone.trim() === DEMO_PHONE) {
        setDashboard(demoDashboard);
        setView(viewFromPath());
        setShowDemoToast(true);
        return;
      }

      const data = await fetchLoyaltyDashboard(phone);
      setDashboard(data);
      setView(viewFromPath());
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load dashboard.",
      );
      setDashboard(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async (phone: string) => {
    setShowAuthModal(false);
    await refreshDashboard(phone);
  };

  const handleSignUp = async (payload: LinkAccountRequest) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await linkLoyaltyAccount(payload);
      setSuccess("Account created and linked successfully.");
      await refreshDashboard(payload.phone);
      setShowAuthModal(false);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create account.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleAdminLogin = (token: string) => {
    if (!token.trim()) {
      setError("Admin token is required.");
      return;
    }
    setAdminToken(token.trim());
    setView("admin-dashboard");
    setError(null);
    setSuccess("Admin signed in successfully.");
    setShowAuthModal(false);
  };

  const handleOpenBookings = () => {
    if (!isLoggedIn) {
      setAuthMode("sign-in");
      setShowAuthModal(true);
      return;
    }

    setShowBookingModal(true);
  };

  const handleConfirmBooking = async (slot: string, vehicle: Vehicle) => {
    setShowBookingModal(false);
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await createBooking({
        phone: dashboard?.phone ?? "",
        vehiclePlate: vehicle.plate,
        requestedDate: slot,
      });
      setSuccess("Booking confirmed successfully.");
      if (dashboard?.phone) {
        await refreshDashboard(dashboard.phone);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to confirm booking.",
      );
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    if (view === "promo") {
      return (
        <PromoPage
          dashboard={dashboard}
          offers={dashboard?.rewardSuggestions ?? []}
        />
      );
    }

    if (view === "bookings") {
      return <BookingPage dashboard={dashboard as DashboardResponse} />;
    }

    if (view === "admin-login") {
      return <AdminLoginPage onLogin={handleAdminLogin} />;
    }

    if (view.startsWith("admin") && adminToken) {
      return (
        <section className="admin-shell">
          <aside className="admin-sidebar card">
            <h3>Admin console</h3>
            <button
              className="nav-item"
              type="button"
              onClick={() => setView("admin-dashboard")}
            >
              Dashboard
            </button>
            <button
              className="nav-item"
              type="button"
              onClick={() => setView("admin-bookings")}
            >
              Bookings
            </button>
            <button
              className="nav-item"
              type="button"
              onClick={() => setView("admin-promo")}
            >
              Promo
            </button>
            <button
              className="nav-item"
              type="button"
              onClick={() => setView("admin-tier")}
            >
              Tier Config
            </button>
            <button
              className="nav-item"
              type="button"
              onClick={() => setView("admin-users")}
            >
              Users
            </button>
            <button
              className="button button-secondary"
              type="button"
              onClick={() => {
                setAdminToken(null);
                setView("home");
              }}
            >
              Sign out
            </button>
          </aside>
          <div className="admin-content">
            {view === "admin-dashboard" && <AdminDashboardPage />}
            {view === "admin-bookings" && <AdminBookingsPage />}
            {view === "admin-promo" && <AdminPromoPage />}
            {view === "admin-tier" && <AdminTierPage />}
            {view === "admin-users" && <AdminUsersPage />}
          </div>
        </section>
      );
    }

    return (
      <HomePage
        offers={dashboard?.rewardSuggestions ?? []}
        availableSlots={availableSlots}
        onBook={handleOpenBookings}
      />
    );
  };

  return (
    <main className="app-shell">
      <Header
        isLoggedIn={isLoggedIn}
        username={username}
        currentPage={
          view === "bookings" ? "bookings" : view === "promo" ? "promo" : "home"
        }
        onNavigate={navigateTo}
        onOpenSignIn={() => {
          setAuthMode("sign-in");
          setShowAuthModal(true);
        }}
        onOpenSignUp={() => {
          setAuthMode("sign-up");
          setShowAuthModal(true);
        }}
        onOpenBookings={handleOpenBookings}
      />

      {success && <div className="status-message success">{success}</div>}
      <Toast
        message="Demo account signed in successfully."
        visible={showDemoToast}
        onClose={() => setShowDemoToast(false)}
      />
      {renderContent()}

      <Footer />
      <AuthModal
        visible={showAuthModal}
        mode={authMode}
        onClose={() => setShowAuthModal(false)}
        onSignIn={handleSignIn}
        onSignUp={handleSignUp}
        onToggleMode={(mode) => setAuthMode(mode)}
      />

      <BookingModal
        visible={showBookingModal}
        availableSlots={availableSlots}
        services={serviceOptions}
        onClose={() => setShowBookingModal(false)}
        onConfirm={handleConfirmBooking}
      />
    </main>
  );
}

export default App;
