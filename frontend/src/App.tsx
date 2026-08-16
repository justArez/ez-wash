import { useEffect, useMemo, useState } from "react";
import Header from "./components/header/header.component";
import Footer from "./components/footer/footer.component";
import AuthModal from "./components/auth-modal/auth-modal.component";
import BookingModal from "./components/booking-modal/booking-modal.component";
import Toast from "./components/toast/toast.component";
import { PageRenderer } from "./components/page-renderer/page-renderer.component";
import type { ViewState } from "./router";
import {
  getViewFromPath,
  getPathFromView,
  isAdminView,
  useRouter,
} from "./router";
import {
  linkLoyaltyAccount,
  fetchLoyaltyDashboard,
  createBooking,
} from "./services/loyalty.service";
import {
  loginAdmin,
  saveAdminUserInfo,
  loadAdminUserInfo,
  clearAdminUserInfo,
} from "./services/admin-auth.service";
import { DEMO_PHONE, demoDashboard } from "./services/loyalty.mock-data";
import type {
  DashboardResponse,
  LinkAccountRequest,
  ServiceOption,
  Vehicle,
} from "./models/loyalty.model";
import "./App.css";

type AuthMode = "sign-in" | "sign-up";

const LOYALTY_STORAGE_KEY = "ezwash-dashboard";

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

const saveDashboardToStorage = (dashboardData: DashboardResponse) => {
  window.localStorage.setItem(
    LOYALTY_STORAGE_KEY,
    JSON.stringify(dashboardData),
  );
};

const loadDashboardFromStorage = (): DashboardResponse | null => {
  try {
    const value = window.localStorage.getItem(LOYALTY_STORAGE_KEY);
    return value ? (JSON.parse(value) as DashboardResponse) : null;
  } catch {
    return null;
  }
};

function App() {
  const initialDashboard = loadDashboardFromStorage();
  const initialAdminUserInfo = loadAdminUserInfo();

  const [dashboard, setDashboard] = useState<DashboardResponse | null>(
    initialDashboard,
  );
  const [adminUserInfo, setAdminUserInfo] = useState<{
    token: string;
    role: string;
    username: string;
  } | null>(initialAdminUserInfo);
  const [, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>("sign-in");
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showDemoToast, setShowDemoToast] = useState(false);

  // Initialize view based on current path and auth state
  const [view, setView] = useState<ViewState>(() => {
    const pathView = getViewFromPath(window.location.pathname);

    // Redirect unauthenticated users away from protected routes
    if (!initialDashboard && pathView === "bookings") {
      return "home";
    }

    if (
      !initialAdminUserInfo &&
      isAdminView(pathView) &&
      pathView !== "admin-login"
    ) {
      return "admin-login";
    }

    if (initialAdminUserInfo && pathView === "admin-login") {
      return "admin-dashboard";
    }

    return pathView;
  });

  const { navigateTo } = useRouter({
    view,
    setView,
    isLoggedIn: Boolean(dashboard),
    isAdminLoggedIn: Boolean(adminUserInfo?.token),
  });

  const username = useMemo(() => dashboard?.phone ?? "", [dashboard]);
  const isLoggedIn = Boolean(dashboard);
  const isAdminLoggedIn = Boolean(adminUserInfo?.token);

  // Sync view with URL on mount
  useEffect(() => {
    const pathView = getViewFromPath(window.location.pathname);
    if (pathView !== view) {
      window.history.replaceState({}, "", getPathFromView(view));
    }
  }, [view]);

  const refreshDashboard = async (phone: string) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (phone.trim() === DEMO_PHONE) {
        setDashboard(demoDashboard);
        saveDashboardToStorage(demoDashboard);
        setShowDemoToast(true);
        return;
      }

      const data = await fetchLoyaltyDashboard(phone);
      setDashboard(data);
      saveDashboardToStorage(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load dashboard.",
      );
      setDashboard(null);
      window.localStorage.removeItem(LOYALTY_STORAGE_KEY);
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

  const handleAdminLogin = async (username: string, password: string) => {
    if (!username.trim() || !password.trim()) {
      setError("Username and password are required.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const adminInfo = await loginAdmin(username.trim(), password.trim());
      saveAdminUserInfo(adminInfo);
      setAdminUserInfo(adminInfo);
      setView("admin-dashboard");
      window.history.pushState({}, "", getPathFromView("admin-dashboard"));
      setSuccess("Admin signed in successfully.");
      setShowAuthModal(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Admin login failed.");
    } finally {
      setLoading(false);
    }
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

  const handleAdminNavigate = (viewId: string) => {
    const nextView = viewId as ViewState;
    window.history.pushState({}, "", getPathFromView(nextView));
    setView(nextView);
  };

  const handleAdminSignOut = () => {
    setAdminUserInfo(null);
    clearAdminUserInfo();
    window.history.pushState({}, "", getPathFromView("home"));
    setView("home");
  };

  const handleNavigate = (target: string) => {
    const result = navigateTo(target);
    if (!result.authorized && result.reason === "customer-auth-required") {
      setAuthMode("sign-in");
      setShowAuthModal(true);
    }
  };

  return (
    <main
      className={`app-shell ${isAdminView(view) ? "app-shell--admin" : ""}`}
    >
      {!isAdminView(view) && (
        <Header
          isLoggedIn={isLoggedIn}
          username={username}
          currentPage={
            view === "bookings"
              ? "bookings"
              : view === "promo"
                ? "promo"
                : "home"
          }
          onNavigate={handleNavigate}
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
      )}

      {success && <div className="status-message success">{success}</div>}
      {error && <div className="status-message error">{error}</div>}
      <Toast
        message="Demo account signed in successfully."
        visible={showDemoToast}
        onClose={() => setShowDemoToast(false)}
      />

      <PageRenderer
        view={view}
        dashboard={dashboard}
        adminLoggedIn={isAdminLoggedIn}
        onAdminNavigate={handleAdminNavigate}
        onAdminSignOut={handleAdminSignOut}
        onAdminLogin={handleAdminLogin}
        onOpenBookings={handleOpenBookings}
        offersList={dashboard?.rewardSuggestions ?? []}
        availableSlots={availableSlots}
      />

      {!isAdminView(view) && <Footer />}

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
