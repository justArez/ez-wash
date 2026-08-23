// Route definitions for the application
export type CustomerViewState = "home" | "bookings" | "promo";
export type AdminViewState =
  | "admin-login"
  | "admin-dashboard"
  | "admin-bookings"
  | "admin-slots"
  | "admin-services"
  | "admin-promo"
  | "admin-tier"
  | "admin-users";
export type ViewState = CustomerViewState | AdminViewState;

export interface RouteConfig {
  path: string;
  view: ViewState;
  requiresAuth?: boolean;
  isAdmin?: boolean;
}

export const ROUTES: Record<ViewState, RouteConfig> = {
  // Customer routes
  home: { path: "/", view: "home", isAdmin: false },
  bookings: {
    path: "/bookings",
    view: "bookings",
    requiresAuth: true,
    isAdmin: false,
  },
  promo: { path: "/promo", view: "promo", isAdmin: false },

  // Admin routes
  "admin-login": { path: "/admin/login", view: "admin-login", isAdmin: true },
  "admin-dashboard": {
    path: "/admin",
    view: "admin-dashboard",
    requiresAuth: true,
    isAdmin: true,
  },
  "admin-bookings": {
    path: "/admin/bookings",
    view: "admin-bookings",
    requiresAuth: true,
    isAdmin: true,
  },
  "admin-slots": {
    path: "/admin/slots",
    view: "admin-slots",
    requiresAuth: true,
    isAdmin: true,
  },
  "admin-services": {
    path: "/admin/services",
    view: "admin-services",
    requiresAuth: true,
    isAdmin: true,
  },
  "admin-promo": {
    path: "/admin/promo",
    view: "admin-promo",
    requiresAuth: true,
    isAdmin: true,
  },
  "admin-tier": {
    path: "/admin/tier",
    view: "admin-tier",
    requiresAuth: true,
    isAdmin: true,
  },
  "admin-users": {
    path: "/admin/users",
    view: "admin-users",
    requiresAuth: true,
    isAdmin: true,
  },
};

export const PATH_TO_VIEW: Record<string, ViewState> = {
  "/": "home",
  "/bookings": "bookings",
  "/promo": "promo",
  "/admin/login": "admin-login",
  "/admin": "admin-dashboard",
  "/admin/bookings": "admin-bookings",
  "/admin/slots": "admin-slots",
  "/admin/services": "admin-services",
  "/admin/promo": "admin-promo",
  "/admin/tier": "admin-tier",
  "/admin/users": "admin-users",
};

/**
 * Get route config for a view
 */
export function getRouteConfig(view: ViewState): RouteConfig {
  return ROUTES[view];
}

/**
 * Get view from current pathname
 */
export function getViewFromPath(pathname: string): ViewState {
  return PATH_TO_VIEW[pathname] ?? "home";
}

/**
 * Get path from view
 */
export function getPathFromView(view: ViewState): string {
  return getRouteConfig(view).path;
}

/**
 * Check if view is admin
 */
export function isAdminView(view: ViewState): boolean {
  return view.startsWith("admin");
}

/**
 * Check if view requires authentication
 */
export function requiresAuth(view: ViewState): boolean {
  return getRouteConfig(view).requiresAuth ?? false;
}
