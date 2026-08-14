import { useLayoutEffect, useRef, useState } from "react";
import type {
  HeaderProps as EnhancedHeaderProps,
  NavigationItem,
} from "../../types/homepage.types";
import "./header.component.scss";

interface HeaderProps extends EnhancedHeaderProps {
  isLoggedIn?: boolean;
  username?: string;
  onOpenSignIn?: () => void;
  onOpenSignUp?: () => void;
  onOpenBookings?: () => void;
}

const navItems: NavigationItem[] = [
  {
    id: "home",
    label: "Home",
    href: "/",
    isActive: false,
    visibleFor: "all",
    requiresAuth: false,
  },
  {
    id: "bookings",
    label: "Bookings",
    href: "/bookings",
    isActive: false,
    visibleFor: "all",
    requiresAuth: true,
  },
  {
    id: "promo",
    label: "Promos",
    href: "/promo",
    isActive: false,
    visibleFor: "all",
    requiresAuth: false,
  },
];

export default function Header({
  currentPage = "home",
  onNavigate,
  isLoggedIn = false,
  username,
  onOpenSignIn,
  onOpenSignUp,
}: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigationRef = useRef<HTMLElement | null>(null);
  const navigationItemsRef = useRef<Record<string, HTMLButtonElement | null>>(
    {},
  );

  useLayoutEffect(() => {
    const navigation = navigationRef.current;
    const activeItem = navigationItemsRef.current[currentPage];
    if (!navigation || !activeItem) return;

    const updateIndicator = () => {
      const navigationBounds = navigation.getBoundingClientRect();
      const itemBounds = activeItem.getBoundingClientRect();
      navigation.style.setProperty(
        "--active-tab-left",
        `${itemBounds.left - navigationBounds.left}px`,
      );
      navigation.style.setProperty(
        "--active-tab-width",
        `${itemBounds.width}px`,
      );
    };

    updateIndicator();
    window.addEventListener("resize", updateIndicator);
    return () => window.removeEventListener("resize", updateIndicator);
  }, [currentPage]);

  const handleNavigation = (item: NavigationItem) => {
    onNavigate?.(item.href);
    setIsMobileMenuOpen(false);
  };

  const handleAuth = (mode: "sign-in" | "sign-up") => {
    if (mode === "sign-in") onOpenSignIn?.();
    else onOpenSignUp?.();
    setIsMobileMenuOpen(false);
  };

  const renderNavigationItem = (item: NavigationItem, mobile = false) => {
    const isDisabled = item.requiresAuth && !isLoggedIn;
    const className = mobile
      ? `header-mobile-menu__item ${currentPage === item.id ? "header-mobile-menu__item--active" : ""}`
      : `header-nav__item ${currentPage === item.id ? "header-nav__item--active" : ""}`;
    const button = (
      <button
        type="button"
        disabled={isDisabled}
        aria-label={isDisabled ? "Bookings. Please log in first." : item.label}
        onClick={() => handleNavigation(item)}
        ref={
          mobile
            ? undefined
            : (element) => {
                navigationItemsRef.current[item.id] = element;
              }
        }
        className={className}
        aria-current={currentPage === item.id ? "page" : undefined}
      >
        {item.label}
      </button>
    );

    if (!isDisabled) return button;

    return (
      <span
        className="header-tooltip"
        data-tooltip="Please log in first to view your bookings."
        tabIndex={0}
        aria-label="Please log in first to view your bookings"
      >
        {button}
      </span>
    );
  };

  return (
    <header className="header-island-wrap">
      <div className="header-island">
        <div className="header-island__bar">
          <button
            type="button"
            className="header-brand"
            onClick={() => handleNavigation(navItems[0])}
          >
            <img src="/favicon.png" alt="" className="header-brand__logo" />
            <span>EzWash</span>
          </button>

          <nav
            ref={navigationRef}
            className="header-nav"
            aria-label="Primary navigation"
          >
            <span className="header-nav__active-pill" aria-hidden="true" />
            {navItems.map((item) => (
              <span key={item.id}>{renderNavigationItem(item)}</span>
            ))}
          </nav>

          <div className="header-actions">
            {isLoggedIn ? (
              <button
                type="button"
                className="header-user"
                onClick={() => onNavigate?.("/")}
              >
                {username ?? "Member"}
              </button>
            ) : (
              <>
                <button
                  type="button"
                  className="header-auth header-auth--quiet"
                  onClick={() => handleAuth("sign-in")}
                >
                  Log In
                </button>
                <button
                  type="button"
                  className="header-auth header-auth--primary"
                  onClick={() => handleAuth("sign-up")}
                >
                  Sign Up
                </button>
              </>
            )}
          </div>

          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((open) => !open)}
            className="header-menu-toggle"
            aria-label="Toggle menu"
            aria-expanded={isMobileMenuOpen}
          >
            <svg
              className="header-menu-icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d={
                  isMobileMenuOpen
                    ? "M6 18L18 6M6 6l12 12"
                    : "M4 6h16M4 12h16M4 18h16"
                }
              />
            </svg>
          </button>
        </div>

        {isMobileMenuOpen && (
          <div className="header-mobile-menu">
            <div className="header-mobile-menu__links">
              {navItems.map((item) => (
                <span key={item.id}>{renderNavigationItem(item, true)}</span>
              ))}
              {!isLoggedIn && (
                <div className="header-mobile-menu__auth">
                  <button
                    type="button"
                    className="header-auth header-auth--quiet"
                    onClick={() => handleAuth("sign-in")}
                  >
                    Log In
                  </button>
                  <button
                    type="button"
                    className="header-auth header-auth--primary"
                    onClick={() => handleAuth("sign-up")}
                  >
                    Sign Up
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
