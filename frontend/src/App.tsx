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
import CustomerBookingDetailModal from "./components/customer-booking-detail-modal/customer-booking-detail-modal.component";
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
  refreshJwtSession,
} from "./services/loyalty.service";
import {
  saveJwtToken,
  getJwtToken,
  getUserFromJwtToken,
  clearJwtToken,
  isJwtTokenValid,
} from "./services/auth-token.service";
import { refreshSlotsCache } from "./services/api.service";
import {
  loginAdmin,
  saveAdminUserInfo,
  loadAdminUserInfo,
  clearAdminUserInfo,
} from "./services/admin-auth.service";
import type {
  DashboardResponse,
  LinkAccountRequest,
} from "./models/customer.model";
import type { ServiceOption } from "./models/service.model";
import "./App.css";

type AuthMode = "sign-in" | "sign-up";

const REFRESH_THROTTLE_MS = 60 * 1000; // Refresh JWT at most once every 60 seconds on activity

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

function App() {
  const initialUser = getUserFromJwtToken();
  const initialAdminUserInfo = loadAdminUserInfo();

  // Flag to prevent UI flash/multiple reload flashes during initial session validation
  const [isSessionChecking, setIsSessionChecking] = useState<boolean>(() => {
    const token = getJwtToken();
    return Boolean(token && isJwtTokenValid(token));
  });

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
  const [activeUserBookingDetail, setActiveUserBookingDetail] = useState<
    any | null
  >(null);

  // Initialize view based on current path and auth state
  const [view, setView] = useState<ViewState>(() => {
    const pathView = getViewFromPath(window.location.pathname);

    // Redirect unauthenticated users away from protected routes
    if (!initialUser && pathView === "bookings") {
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

  const username = useMemo(() => {
    if (dashboard?.fullName || dashboard?.username || dashboard?.phone) {
      return dashboard.fullName || dashboard.username || dashboard.phone;
    }
    const tokenUser = getUserFromJwtToken();
    return tokenUser?.fullName || tokenUser?.username || tokenUser?.phone || "";
  }, [dashboard]);
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
      // Persist only the JWT token in localStorage
      if (data.token) {
        saveJwtToken(data.token);
      }
    } catch (err) {
      setDashboard(null);
      clearJwtToken();
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

  // Auto-restore customer session if JWT token exists and is valid
  useEffect(() => {
    let isMounted = true;
    const restoreSession = async () => {
      const token = getJwtToken();
      if (!token || !isJwtTokenValid(token)) {
        clearJwtToken();
        if (isMounted) {
          setDashboard(null);
          setIsSessionChecking(false);
        }
        return;
      }

      const userFromToken = getUserFromJwtToken();
      const identifier =
        userFromToken?.username || userFromToken?.phone || userFromToken?.email;

      if (identifier) {
        try {
          await refreshDashboard(identifier);
        } catch {
          // Handled inside refreshDashboard
        }
      }

      if (isMounted) {
        setIsSessionChecking(false);
      }
    };

    restoreSession();

    return () => {
      isMounted = false;
    };
  }, []);

  // Idle check & Session refresh on user action
  useEffect(() => {
    if (!dashboard) return;

    let lastRefreshedAt = Date.now();

    const handleUserActivity = async () => {
      const token = getJwtToken();
      if (!token || !isJwtTokenValid(token)) {
        setDashboard(null);
        clearJwtToken();
        if (view === "bookings") {
          window.history.pushState({}, "", getPathFromView("home"));
          setView("home");
        }
        setError(
          "Your session has expired due to 1 hour of inactivity. Please sign in again.",
        );
        return;
      }

      const now = Date.now();
      // Throttled token refresh on backend on user activity
      if (now - lastRefreshedAt > REFRESH_THROTTLE_MS) {
        lastRefreshedAt = now;
        try {
          const refreshRes = await refreshJwtSession(token);
          if (refreshRes.token) {
            saveJwtToken(refreshRes.token);
          }
        } catch (err) {
          console.warn("[Session] Background token refresh warning:", err);
        }
      }
    };

    // Listen to user actions
    const events = ["mousedown", "keydown", "touchstart", "scroll", "click"];
    events.forEach((evt) =>
      window.addEventListener(evt, handleUserActivity, { passive: true }),
    );

    // Periodic idle checker (every 30 seconds) to expire session even if user doesn't interact
    const idleInterval = setInterval(() => {
      const token = getJwtToken();
      if (!token || !isJwtTokenValid(token)) {
        setDashboard(null);
        clearJwtToken();
        if (view === "bookings") {
          window.history.pushState({}, "", getPathFromView("home"));
          setView("home");
        }
        setError(
          "Your session has expired due to 1 hour of inactivity. Please sign in again.",
        );
      }
    }, 30000);

    return () => {
      events.forEach((evt) =>
        window.removeEventListener(evt, handleUserActivity),
      );
      clearInterval(idleInterval);
    };
  }, [dashboard, view]);

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
    // If the clicked slot is already booked by the current user, open booking details instead of new booking
    if (
      slotOrPromo &&
      typeof slotOrPromo === "object" &&
      slotOrPromo.isUserBooked
    ) {
      const matchingFromDetails = slotOrPromo.userBookingDetails?.[0];
      const slotDate = slotOrPromo.date;
      const slotTime = slotOrPromo.time;
      const matchingFromHistory = dashboard?.bookingHistory?.find((b: any) => {
        const bDate = b.date?.slice(0, 10);
        const bTime = (b.time || b.timeSlot || "").slice(0, 5);
        return (
          (b.id &&
            matchingFromDetails?.id &&
            b.id === matchingFromDetails.id) ||
          (bDate === slotDate && bTime === slotTime)
        );
      });

      const targetBooking = matchingFromHistory ||
        matchingFromDetails || {
          date: slotDate,
          time: slotTime,
          status: slotOrPromo.userBookingStatus || "confirmed",
          durationMinutes: slotOrPromo.userBookingDurationMinutes || 30,
        };

      setActiveUserBookingDetail({
        booking: targetBooking,
        slot: slotOrPromo,
      });
      return;
    }

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
    totalMinutes,
    totalCost,
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
        vehicleModel: vehicle.model,
        vehicleType: vehicle.type,
        requestedDate: date,
        serviceId: selectedServices?.[0],
        serviceIds: selectedServices,
        durationMinutes: totalMinutes,
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
      const serviceLabels = selectedServices
        .map((id) => serviceOptions.find((opt) => opt.id === id)?.label)
        .filter(Boolean)
        .join(", ");
      const primaryService = serviceOptions.find(
        (option) => option.id === selectedServices?.[0],
      );
      setDepositBooking({
        id: result.booking.id,
        serviceName:
          serviceLabels || primaryService?.label || "Car Wash Service",
        date,
        timeSlot: time,
        vehiclePlate: vehicle.plate,
        bookingPrice: totalCost ?? primaryService?.price,
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
    clearJwtToken();
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
      const userFromToken = getUserFromJwtToken();
      const identifier =
        userFromToken?.username || userFromToken?.phone || userFromToken?.email;
      if (identifier) {
        refreshDashboard(identifier);
      }
    }
  };

  if (isSessionChecking) {
    return (
      <div
        className="app-session-loading"
        role="status"
        aria-label="Loading session"
      >
        <div className="app-session-loading__spinner" />
        <span>Just a moment...</span>
      </div>
    );
  }

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
        onNavigate={handleNavigate}
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
        tierId={dashboard?.tier?.id}
        onClose={() => setDepositBooking(null)}
        onSubmitted={async () => {
          setDepositBooking(null);
          setSuccess("Seat deposit submitted!");
          if (dashboard?.phone) {
            await refreshDashboard(dashboard.phone);
          }
        }}
      />

      <CustomerBookingDetailModal
        visible={Boolean(activeUserBookingDetail)}
        booking={activeUserBookingDetail?.booking}
        slot={activeUserBookingDetail?.slot}
        customer={dashboard}
        onClose={() => setActiveUserBookingDetail(null)}
        onOpenDeposit={(bookingInfo) => {
          setActiveUserBookingDetail(null);
          setDepositBooking(bookingInfo);
        }}
        onBookingCancelled={async () => {
          setSuccess("Booking cancelled.");
          await refreshSlotsCache(14).catch(() => {});
          setRefreshSlotTrigger((prev) => prev + 1);
          if (dashboard?.phone) {
            await refreshDashboard(dashboard.phone);
          }
        }}
      />
    </main>
  );
}

export default App;
