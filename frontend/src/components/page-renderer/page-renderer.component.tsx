import type { ViewState } from "../../router";
import { isAdminView } from "../../router";
import AdminLayout from "../admin-layout/admin-layout.component";
import HomePage from "../../pages/home/home.page";
import BookingPage from "../../pages/booking/booking.page";
import PromoPage from "../../pages/promo/promo.page";
import AdminLoginPage from "../../pages/admin/admin-login/admin-login.page";
import AdminDashboardPage from "../../pages/admin/admin-dashboard/admin-dashboard.page";
import AdminPromoPage from "../../pages/admin/admin-promo/admin-promo.page";
import AdminTierPage from "../../pages/admin/admin-tier/admin-tier.page";
import AdminBookingsPage from "../../pages/admin/admin-bookings/admin-bookings.page";
import AdminSlotsPage from "../../pages/admin/admin-slots/admin-slots.page";
import AdminUsersPage from "../../pages/admin/admin-users/admin-users.page";
import AdminServicesPage from "../../pages/admin/admin-services/admin-services.page";
import AdminBankingPage from "../../pages/admin/admin-banking/admin-banking.page";
import type { DashboardResponse } from "../../models/customer.model";

export interface PageRendererProps {
  view: ViewState;
  dashboard: DashboardResponse | null;
  adminLoggedIn: boolean;
  onAdminNavigate: (view: string) => void;
  onAdminSignOut: () => void;
  onAdminLogin: (username: string, password: string) => Promise<void>;
  onOpenBookings: (slotOrPromo?: any) => void;
  onOpenSignIn?: () => void;
  onNavigate?: (path: string) => void;
  offersList: any[];
  availableSlots: string[];
  refreshTrigger?: number;
}

export function PageRenderer({
  view,
  dashboard,
  adminLoggedIn,
  onAdminNavigate,
  onAdminSignOut,
  onAdminLogin,
  onOpenBookings,
  onOpenSignIn,
  onNavigate,
  offersList,
  availableSlots,
  refreshTrigger,
}: PageRendererProps) {
  // Admin login page
  if (view === "admin-login") {
    return <AdminLoginPage onLogin={onAdminLogin} />;
  }

  // Admin pages with layout
  if (isAdminView(view) && adminLoggedIn) {
    const adminView = view as
      | "admin-dashboard"
      | "admin-bookings"
      | "admin-slots"
      | "admin-services"
      | "admin-promo"
      | "admin-tier"
      | "admin-users"
      | "admin-banking";

    return (
      <AdminLayout
        currentView={adminView}
        onNavigate={onAdminNavigate}
        onSignOut={onAdminSignOut}
      >
        {adminView === "admin-dashboard" && <AdminDashboardPage />}
        {adminView === "admin-bookings" && <AdminBookingsPage />}
        {adminView === "admin-slots" && <AdminSlotsPage />}
        {adminView === "admin-services" && <AdminServicesPage />}
        {adminView === "admin-promo" && <AdminPromoPage />}
        {adminView === "admin-tier" && <AdminTierPage />}
        {adminView === "admin-users" && <AdminUsersPage />}
        {adminView === "admin-banking" && <AdminBankingPage />}
      </AdminLayout>
    );
  }

  // Customer pages
  if (view === "promo") {
    return (
      <PromoPage
        dashboard={dashboard}
        offers={offersList}
        onOpenSignIn={onOpenSignIn}
        onOpenBookings={onOpenBookings}
      />
    );
  }

  if (view === "bookings") {
    if (!dashboard) {
      return (
        <HomePage
          dashboard={dashboard}
          offers={[]}
          availableSlots={availableSlots}
          onBook={onOpenBookings}
          onOpenSignIn={onOpenSignIn}
          onNavigate={onNavigate}
          refreshTrigger={refreshTrigger}
        />
      );
    }
    return <BookingPage dashboard={dashboard} />;
  }

  // Home page (default)
  return (
    <HomePage
      dashboard={dashboard}
      offers={offersList}
      availableSlots={availableSlots}
      onBook={onOpenBookings}
      onOpenSignIn={onOpenSignIn}
      onNavigate={onNavigate}
      refreshTrigger={refreshTrigger}
    />
  );
}
