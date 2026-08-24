import { useEffect, useMemo, useState } from "react";
import Header from "./components/header/header.component";
import Footer from "./components/footer/footer.component";
import AuthModal from "./components/auth-modal/auth-modal.component";
import BookingModal, {
  type BookingModalSubmission,
} from "./components/booking-modal/booking-modal.component";
import DepositPaymentModal, {
  type DepositBookingInfo,
} from "./components/deposit-modal/deposit-modal.component";
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
import { refreshSlotsCache } from "./services/api.service";
import {
  loginAdmin,
  saveAdminUserInfo,
  loadAdminUserInfo,
  clearAdminUserInfo,
} from "./services/admin-auth.service";
import type { DashboardResponse, LinkAccountRequest } from "./models/customer.model";
import type { ServiceOption } from "./models/service.model";
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
  { id: "srv-basic-wash", label: "Basic Exterior Wash", price: 15 },
  { id: "srv-deluxe-wash", label: "Deluxe Polish & Wax", price: 30 },
  { id: "srv-interior-detail", label: "Interior Deep Detail", price: 65 },
  { id: "srv-ceramic-coating", label: "Ceramic Shield Detailing", price: 120 },
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
  const [selectedBookingSlot, setSelectedBookingSlot] = useState<{
    date: string;
    time: string;
  } | null>(null);
  const [refreshSlotTrigger, setRefreshSlotTrigger] = useState(0);
  const [showDemoToast, setShowDemoToast] = useState(false);
  const [depositBooking, setDepositBooking] =
    useState<DepositBookingInfo | null>(null);

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
    if (selectedBookingSlot) {
      setShowBookingModal(true);
    }
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
      if (selectedBookingSlot) {
        setShowBookingModal(true);
      }
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

  const handleOpenBookings = (slotOrPromo?: any) => {
    if (
      slotOrPromo &&
      typeof slotOrPromo === "object" &&
      "date" in slotOrPromo &&
      "time" in slotOrPromo
    ) {
      setSelectedBookingSlot({
        date: slotOrPromo.date,
        time: slotOrPromo.time,
      });
    } else {
      setSelectedBookingSlot(null);
    }

    if (!isLoggedIn) {
      setAuthMode("sign-in");
      setShowAuthModal(true);
      return;
    }

    setShowBookingModal(true);
  };

  const handleConfirmBooking = async ({
    date,
    time,
    vehicle,
    selectedServices,
    phone,
    appliedPromoId,
  }: BookingModalSubmission) => {
    setShowBookingModal(false);
    setSelectedBookingSlot(null);
    setLoading(true);
    setError(null);
    setSuccess(null);

    const bookingPhone = phone || dashboard?.phone || "";
    if (!bookingPhone) {
      setError("Phone number is required for booking.");
      setLoading(false);
      return;
    }

    try {
      const result = await createBooking({
        phone: bookingPhone,
        vehiclePlate: vehicle.plate,
        requestedDate: date,
        serviceId: selectedServices?.[0],
        time,
        appliedPromoId,
      });

      if (!result.success || !result.booking) {
        setError(result.reason || "Failed to confirm booking.");
        return;
      }

      setSuccess("Booking created successfully!");
      // Invalidate slots cache and trigger calendar re-computation
      await refreshSlotsCache(14).catch(() => {});
      setRefreshSlotTrigger((prev) => prev + 1);
      if (bookingPhone) {
        await refreshDashboard(bookingPhone);
      }

      // Offer the seat-deposit payment slip upload right after confirmation
      const primaryService = serviceOptions.find(
        (option) => option.id === selectedServices?.[0],
      );
      setDepositBooking({
        id: result.booking.id,
        serviceName: primaryService?.label,
        date,
        timeSlot: time,
        vehiclePlate: vehicle.plate,
        depositImageUrl: result.booking.depositImageUrl,
        depositSubmittedAt: result.booking.depositSubmittedAt,
      });
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
      return;
    }

    if (
      result.authorized &&
      (target === "bookings" ||
        target === "promo" ||
        target === "/bookings" ||
        target === "/promo")
    ) {
      const userMeta = loadUserMetaFromStorage();
      const identifier =
        userMeta?.username || userMeta?.phone || userMeta?.email;
      if (identifier) {
        refreshDashboard(identifier);
      }
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
        refreshTrigger={refreshSlotTrigger}
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
        services={serviceOptions}
        customer={dashboard}
        initialSlot={selectedBookingSlot}
        onClose={() => {
          setShowBookingModal(false);
          setSelectedBookingSlot(null);
        }}
        onConfirm={handleConfirmBooking}
      />

      <DepositPaymentModal
        visible={Boolean(depositBooking)}
        booking={depositBooking}
        phone={dashboard?.phone}
        onClose={() => setDepositBooking(null)}
        onSubmitted={async () => {
          setDepositBooking(null);
          setSuccess("Seat deposit submitted!");
          if (dashboard?.phone) {
            await refreshDashboard(dashboard.phone);
          }
        }}
      />
    </main>
  );
}

export default App;
