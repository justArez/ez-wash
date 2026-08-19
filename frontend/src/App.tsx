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

interface StoredUserMeta {
  phone: string;
  username?: string;
  fullName?: string;
  email?: string;
  customerId?: string;
}

const USER_META_STORAGE_KEY = "ezwash-user-meta";

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

const saveUserMetaToStorage = (userMeta: StoredUserMeta) => {
  window.localStorage.setItem(USER_META_STORAGE_KEY, JSON.stringify(userMeta));
};

const loadUserMetaFromStorage = (): StoredUserMeta | null => {
  try {
    const value = window.localStorage.getItem(USER_META_STORAGE_KEY);
    if (!value) return null;
    return JSON.parse(value) as StoredUserMeta;
  } catch {
    return null;
  }
};

const clearUserMetaFromStorage = () => {
  window.localStorage.removeItem(USER_META_STORAGE_KEY);
  // Clean up legacy storage key if present
  window.localStorage.removeItem("ezwash-dashboard");
};

function App() {
  const initialUserMeta = loadUserMetaFromStorage();
  const initialAdminUserInfo = loadAdminUserInfo();

  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
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
    if (!initialUserMeta && pathView === "bookings") {
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

  const username = useMemo(
    () => dashboard?.fullName || dashboard?.username || dashboard?.phone || "",
    [dashboard],
  );
  const isLoggedIn = Boolean(dashboard);
  const isAdminLoggedIn = Boolean(adminUserInfo?.token);

  // Sync view with URL on mount
  useEffect(() => {
    const pathView = getViewFromPath(window.location.pathname);
    if (pathView !== view) {
      window.history.replaceState({}, "", getPathFromView(view));
    }
  }, [view]);

  const refreshDashboard = async (
    phoneOrUsername: string,
    password?: string,
    propagateError = false,
  ) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (
        phoneOrUsername.trim() === DEMO_PHONE ||
        phoneOrUsername.trim().toLowerCase() === "demo"
      ) {
        setDashboard(demoDashboard);
        saveUserMetaToStorage({
          phone: demoDashboard.phone,
          username: demoDashboard.username,
          customerId: demoDashboard.customerId,
        });
        setShowDemoToast(true);
        return;
      }

      const data = await fetchLoyaltyDashboard(phoneOrUsername, password);
      setDashboard(data);
      // Save only user metadata to localStorage
      saveUserMetaToStorage({
        phone: data.phone,
        username: data.username,
        fullName: data.fullName,
        email: data.email,
        customerId: data.customerId,
      });
    } catch (err) {
      setDashboard(null);
      clearUserMetaFromStorage();
      if (!propagateError) {
        setError(
          err instanceof Error ? err.message : "Failed to load dashboard.",
        );
      }
      if (propagateError) {
        throw err;
      }
    } finally {
      setLoading(false);
    }
  };

  // Auto-restore customer session if metadata exists in localStorage
  useEffect(() => {
    if (initialUserMeta) {
      const identifier =
        initialUserMeta.username ||
        initialUserMeta.phone ||
        initialUserMeta.email;
      if (identifier) {
        refreshDashboard(identifier);
      }
    }
  }, []);

  const handleSignIn = async (username: string, password: string) => {
    await refreshDashboard(username, password, true);
    setShowAuthModal(false);
    setSuccess("Signed in successfully!");
  };

  const handleSignUp = async (payload: LinkAccountRequest) => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await linkLoyaltyAccount(payload);
      setSuccess("Account created successfully!");
      const refreshIdentifier =
        response.username ||
        response.phone ||
        payload.username ||
        payload.phone ||
        "";
      if (refreshIdentifier) {
        await refreshDashboard(refreshIdentifier, payload.password);
      }
      setShowAuthModal(false);
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

  const handleConfirmBooking = async (
    slot: string,
    vehicle: Vehicle,
    selectedServices?: string[],
    overridePhone?: string,
  ) => {
    setShowBookingModal(false);
    setLoading(true);
    setError(null);
    setSuccess(null);

    const bookingPhone = overridePhone || dashboard?.phone || "";
    if (!bookingPhone) {
      setError("Phone number is required for booking.");
      setLoading(false);
      return;
    }

    try {
      const requestedDate = slot.includes("Tomorrow")
        ? new Date(Date.now() + 86400000).toISOString().split("T")[0]
        : new Date().toISOString().split("T")[0];

      await createBooking({
        phone: bookingPhone,
        vehiclePlate: vehicle.plate,
        requestedDate,
        serviceId: selectedServices?.[0],
        time: slot,
      });
      setSuccess("Booking confirmed successfully!");
      if (bookingPhone) {
        await refreshDashboard(bookingPhone);
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

  const handleSignOut = () => {
    setDashboard(null);
    clearUserMetaFromStorage();
    if (view === "bookings") {
      window.history.pushState({}, "", getPathFromView("home"));
      setView("home");
    }
    setSuccess("Logged out successfully.");
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
          fullName={dashboard?.fullName}
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
          onSignOut={handleSignOut}
        />
      )}

      <Toast
        message="Demo account signed in successfully."
        visible={showDemoToast}
        onClose={() => setShowDemoToast(false)}
      />
      <Toast
        message={success || ""}
        visible={Boolean(success)}
        type="success"
        onClose={() => setSuccess(null)}
      />
      <Toast
        message={error || ""}
        visible={Boolean(error)}
        type="error"
        onClose={() => setError(null)}
      />

      <PageRenderer
        view={view}
        dashboard={dashboard}
        adminLoggedIn={isAdminLoggedIn}
        onAdminNavigate={handleAdminNavigate}
        onAdminSignOut={handleAdminSignOut}
        onAdminLogin={handleAdminLogin}
        onOpenBookings={handleOpenBookings}
        onOpenSignIn={() => {
          setAuthMode("sign-in");
          setShowAuthModal(true);
        }}
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
