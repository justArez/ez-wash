/**
 * Base URL for backend API requests.
 * Falls back to "" (relative paths, proxied by Vite dev server / same-origin)
 * when VITE_API_URL is not injected at build time.
 */
export const API_BASE_URL: string = import.meta.env.VITE_API_URL ?? "";

/**
 * fetch wrapper that auto-prefixes relative paths ("/api/...") with
 * API_BASE_URL, so callers never need to interpolate it themselves.
 * Absolute URLs (http/https) are passed through unchanged.
 */
export function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  const url = /^https?:\/\//.test(path) ? path : `${API_BASE_URL}${path}`;
  return fetch(url, init);
}
