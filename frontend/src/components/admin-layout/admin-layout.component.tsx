import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  CalendarCheck2,
  Clock,
  Wrench,
  Tag,
  Crown,
  Users,
  CreditCard,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Car,
  Sparkles,
} from "lucide-react";
import "./admin-layout.component.scss";

type ReactNode = import("react").ReactNode;

interface AdminLayoutProps {
  currentView:
    | "admin-dashboard"
    | "admin-bookings"
    | "admin-slots"
    | "admin-services"
    | "admin-promo"
    | "admin-tier"
    | "admin-users"
    | "admin-banking";
  onNavigate: (view: string) => void;
  onSignOut: () => void;
  children: ReactNode;
}

export default function AdminLayout({
  currentView,
  onNavigate,
  onSignOut,
  children,
}: AdminLayoutProps) {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem("ezwash_admin_rail_collapsed");
      return saved ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(
        "ezwash_admin_rail_collapsed",
        JSON.stringify(isCollapsed),
      );
    } catch {
      // ignore
    }
  }, [isCollapsed]);

  const navItems = [
    {
      id: "admin-dashboard" as const,
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    {
      id: "admin-bookings" as const,
      label: "Bookings",
      icon: CalendarCheck2,
    },
    {
      id: "admin-slots" as const,
      label: "Slot Schedule",
      icon: Clock,
    },
    {
      id: "admin-services" as const,
      label: "Services",
      icon: Wrench,
    },
    {
      id: "admin-promo" as const,
      label: "Promotions",
      icon: Tag,
    },
    {
      id: "admin-tier" as const,
      label: "Tier Config",
      icon: Crown,
    },
    {
      id: "admin-users" as const,
      label: "Users",
      icon: Users,
    },
    {
      id: "admin-banking" as const,
      label: "Banking Info",
      icon: CreditCard,
    },
  ];

  return (
    <div
      className={`admin-layout ${isCollapsed ? "admin-layout--collapsed" : ""}`}
    >
      {/* Dynamic Island Navigation Rail */}
      <aside
        className={`dynamic-island-rail ${isCollapsed ? "dynamic-island-rail--collapsed" : "dynamic-island-rail--expanded"}`}
        aria-label="Admin Navigation"
      >
        {/* Top Action Bar: Toggle button fixed at the exact same top height */}
        <div className="dynamic-island-rail__top-bar">
          <button
            type="button"
            className="dynamic-island-rail__toggle-btn"
            onClick={() => setIsCollapsed(!isCollapsed)}
            aria-label={
              isCollapsed
                ? "Expand navigation rail"
                : "Collapse navigation rail"
            }
            title={isCollapsed ? "Expand rail" : "Collapse rail"}
          >
            {isCollapsed ? (
              <ChevronRight size={14} />
            ) : (
              <ChevronLeft size={14} />
            )}
          </button>
        </div>

        {/* Brand / Avatar: Stays at fixed height directly below toggle button */}
        <div className="dynamic-island-rail__brand">
          <div
            className="dynamic-island-rail__logo-badge"
            title={isCollapsed ? "EzWash Admin" : undefined}
          >
            <Car className="dynamic-island-rail__logo-icon" size={20} />
            <Sparkles className="dynamic-island-rail__logo-sparkle" size={10} />
          </div>
          {!isCollapsed && (
            <div className="dynamic-island-rail__brand-text">
              <span className="dynamic-island-rail__title">EzWash</span>
              <span className="dynamic-island-rail__subtitle">Admin Rail</span>
            </div>
          )}
        </div>

        {/* Rail Navigation Menu */}
        <nav className="dynamic-island-rail__nav">
          <div className="dynamic-island-rail__items-group">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onNavigate(item.id)}
                  className={`dynamic-island-rail__item ${isActive ? "dynamic-island-rail__item--active" : ""}`}
                  title={isCollapsed ? item.label : undefined}
                >
                  <span className="dynamic-island-rail__item-icon-wrap">
                    <Icon
                      size={19}
                      className="dynamic-island-rail__item-icon"
                    />
                    {isActive && (
                      <span className="dynamic-island-rail__active-glow" />
                    )}
                  </span>

                  {!isCollapsed && (
                    <span className="dynamic-island-rail__item-label">
                      {item.label}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Rail Footer Actions */}
        <div className="dynamic-island-rail__footer">
          <button
            type="button"
            onClick={onSignOut}
            className="dynamic-island-rail__signout-btn"
            title={isCollapsed ? "Sign Out" : undefined}
          >
            <span className="dynamic-island-rail__signout-icon-wrap">
              <LogOut size={18} />
            </span>
            {!isCollapsed && (
              <span className="dynamic-island-rail__signout-label">
                Sign out
              </span>
            )}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="admin-content">{children}</main>
    </div>
  );
}
