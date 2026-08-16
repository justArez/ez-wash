export type { ViewState, CustomerViewState, AdminViewState } from "./routes";
export {
  ROUTES,
  PATH_TO_VIEW,
  getRouteConfig,
  getViewFromPath,
  getPathFromView,
  isAdminView,
  requiresAuth,
} from "./routes";

export { useRouter } from "./useRouter";
export type { UseRouterOptions } from "./useRouter";
