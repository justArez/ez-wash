import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { LogOut } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import type {
  HeaderProps as EnhancedHeaderProps,
  NavigationItem,
} from "../../types/homepage.types";
import "./header.component.scss";

interface HeaderProps extends EnhancedHeaderProps {
  isLoggedIn?: boolean;
  username?: string;
  fullName?: string;
  onOpenSignIn?: () => void;
  onOpenSignUp?: () => void;
  onOpenBookings?: () => void;
  onSignOut?: () => void;
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
  fullName,
  onOpenSignIn,
  onOpenSignUp,
  onSignOut,
}: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const navigationRef = useRef<HTMLElement | null>(null);
  const navigationItemsRef = useRef<Record<string, HTMLButtonElement | null>>(
    {},
  );
  const userMenuRef = useRef<HTMLDivElement | null>(null);

  // Close user dropdown when clicking outside or pressing Escape
  useEffect(() => {
    if (!isUserMenuOpen) return;

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setIsUserMenuOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isUserMenuOpen]);

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
    <>
      <header className="header-island-wrap">
        <div className="header-island">
          <div className="header-island__bar">
            <button
              type="button"
              className="header-brand"
              onClick={() => handleNavigation(navItems[0])}
            >
              <img src="/favicon.png" alt="" className="header-brand__logo" />
              <span className="header-brand__name">EzWash</span>
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
                <div className="header-user-wrapper" ref={userMenuRef}>
                  <button
                    type="button"
                    className={`header-user ${isUserMenuOpen ? "header-user--active" : ""}`}
                    onClick={() => setIsUserMenuOpen((open) => !open)}
                    aria-expanded={isUserMenuOpen}
                    aria-haspopup="menu"
                    aria-label="User account menu"
                  >
                    <span className="header-user__name">
                      {username ?? "Member"}
                    </span>
                    <img
                      src={`https://dummyimage.com/100x100/3a46ed/fff&text=${fullName?.slice(0, 1) ?? "M"}`}
                      alt="User avatar"
                      className="header-user__avatar"
                    />
                  </button>

                  {isUserMenuOpen && (
                    <div className="header-user-dropdown" role="menu">
                      <div className="header-user-dropdown__header">
                        <img
                          src={`https://dummyimage.com/100x100/3a46ed/fff&text=${fullName?.slice(0, 1) ?? "M"}`}
                          alt=""
                          className="header-user-dropdown__avatar"
                        />
                        <div className="header-user-dropdown__meta">
                          <span className="header-user-dropdown__username">
                            {username ?? "Member"}
                          </span>
                          <span className="header-user-dropdown__role">
                            Loyalty Member
                          </span>
                        </div>
                      </div>

                      <div className="header-user-dropdown__divider" />

                      <button
                        type="button"
                        className="header-user-dropdown__action header-user-dropdown__action--logout"
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          setShowLogoutConfirm(true);
                        }}
                        role="menuitem"
                      >
                        <LogOut size={15} />
                        <span>Log Out</span>
                      </button>
                    </div>
                  )}
                </div>
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
                {isLoggedIn ? (
                  <div className="header-mobile-menu__user-section">
                    <div className="header-mobile-menu__user-card">
                      <img
                        src={`https://dummyimage.com/100x100/3a46ed/fff&text=${fullName?.slice(0, 1) ?? "M"}`}
                        alt=""
                        className="header-mobile-menu__avatar"
                      />
                      <div className="header-mobile-menu__user-info">
                        <span className="header-mobile-menu__username">
                          {username ?? "Member"}
                        </span>
                        <span className="header-mobile-menu__badge">
                          Loyalty Member
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="header-mobile-menu__logout"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        setShowLogoutConfirm(true);
                      }}
                    >
                      <LogOut size={16} />
                      <span>Log Out</span>
                    </button>
                  </div>
                ) : (
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

      <AlertDialog open={showLogoutConfirm} onOpenChange={setShowLogoutConfirm}>
        <AlertDialogContent className="header-logout-dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Log out of EzWash?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to log out?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowLogoutConfirm(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="header-logout-dialog__confirm-btn"
              onClick={() => {
                setShowLogoutConfirm(false);
                onSignOut?.();
              }}
            >
              Log Out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
