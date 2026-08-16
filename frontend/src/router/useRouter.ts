import { useCallback, useEffect } from "react";
import type { ViewState } from "./routes";
import { getPathFromView, getViewFromPath, isAdminView } from "./routes";

export interface UseRouterOptions {
  view?: ViewState;
  setView: (view: ViewState) => void;
  isLoggedIn: boolean;
  isAdminLoggedIn: boolean;
}

/**
 * Hook for managing route navigation and history
 */
export function useRouter({
  setView,
  isLoggedIn,
  isAdminLoggedIn,
}: UseRouterOptions) {
  /**
   * Navigate to a view or path
   */
  const navigateTo = useCallback(
    (target: string | ViewState) => {
      // Determine the path
      const isView = Object.keys({
        home: true,
        bookings: true,
        promo: true,
        "admin-login": true,
        "admin-dashboard": true,
        "admin-bookings": true,
        "admin-services": true,
        "admin-promo": true,
        "admin-tier": true,
        "admin-users": true,
      }).includes(target);

      const path = isView ? getPathFromView(target as ViewState) : target;
      const nextView = isView ? (target as ViewState) : getViewFromPath(path);

      // Handle authentication checks
      if (nextView === "bookings" && !isLoggedIn) {
        return { authorized: false, reason: "customer-auth-required" };
      }

      if (
        isAdminView(nextView) &&
        nextView !== "admin-login" &&
        !isAdminLoggedIn
      ) {
        window.history.pushState({}, "", getPathFromView("admin-login"));
        setView("admin-login");
        return { authorized: false, reason: "admin-auth-required" };
      }

      if (nextView === "admin-login" && isAdminLoggedIn) {
        window.history.pushState({}, "", getPathFromView("admin-dashboard"));
        setView("admin-dashboard");
        return { authorized: true };
      }

      // Navigate
      window.history.pushState({}, "", path);
      setView(nextView);
      return { authorized: true };
    },
    [isLoggedIn, isAdminLoggedIn, setView],
  );

  /**
   * Listen to browser back/forward
   */
  useEffect(() => {
    const handlePopState = () => {
      const nextView = getViewFromPath(window.location.pathname);

      // Validate auth before setting view
      if (nextView === "bookings" && !isLoggedIn) {
        window.history.replaceState({}, "", getPathFromView("home"));
        setView("home");
        return;
      }

      if (
        isAdminView(nextView) &&
        nextView !== "admin-login" &&
        !isAdminLoggedIn
      ) {
        window.history.replaceState({}, "", getPathFromView("admin-login"));
        setView("admin-login");
        return;
      }

      setView(nextView);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [isLoggedIn, isAdminLoggedIn, setView]);

  return { navigateTo };
}
