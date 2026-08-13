import { useState } from "react";
import type {
  HeaderProps as EnhancedHeaderProps,
  NavigationItem,
} from "../types/homepage.types";

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
    requiresAuth: false,
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
  onOpenBookings,
}: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleNavigation = (item: NavigationItem) => {
    if (item.id === "bookings") {
      onOpenBookings?.();
    } else {
      onNavigate?.(item.href);
    }
    setIsMobileMenuOpen(false);
  };

  const handleAuth = (mode: "sign-in" | "sign-up") => {
    if (mode === "sign-in") onOpenSignIn?.();
    else onOpenSignUp?.();
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <button
            type="button"
            className="text-xl sm:text-2xl font-bold text-blue-600"
            onClick={() => handleNavigation(navItems[0])}
          >
            EzWash
          </button>

          <nav
            className="hidden md:flex gap-8 items-center"
            aria-label="Primary navigation"
          >
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavigation(item)}
                className={`text-sm font-medium transition-colors ${
                  currentPage === item.id
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-700 hover:text-blue-600"
                }`}
                aria-current={currentPage === item.id ? "page" : undefined}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="hidden md:flex gap-4 items-center">
            {isLoggedIn ? (
              <button
                type="button"
                className="text-blue-600 font-medium"
                onClick={() => onNavigate?.("/")}
              >
                {username ?? "Member"}
              </button>
            ) : (
              <>
                <button
                  type="button"
                  className="text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-lg font-medium"
                  onClick={() => handleAuth("sign-in")}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-lg font-medium"
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
            className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100"
            aria-label="Toggle menu"
            aria-expanded={isMobileMenuOpen}
          >
            <svg
              className="w-6 h-6"
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
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavigation(item)}
                className={`block w-full text-left px-4 py-2 rounded-lg text-base font-medium ${currentPage === item.id ? "text-blue-600 bg-blue-50" : "text-gray-700 hover:bg-gray-50"}`}
              >
                {item.label}
              </button>
            ))}
            {!isLoggedIn && (
              <div className="pt-4 space-y-2 border-t border-gray-200">
                <button
                  type="button"
                  className="block w-full px-4 py-2 rounded-lg text-base font-medium text-blue-600 hover:bg-blue-50"
                  onClick={() => handleAuth("sign-in")}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  className="block w-full px-4 py-2 rounded-lg text-base font-medium bg-blue-600 text-white hover:bg-blue-700"
                  onClick={() => handleAuth("sign-up")}
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
