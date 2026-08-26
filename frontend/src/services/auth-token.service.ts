export interface DecodedUserToken {
  customerId: string;
  username: string;
  phone: string;
  email?: string;
  fullName?: string;
  role?: string;
  iat: number;
  exp: number;
}

const TOKEN_STORAGE_KEY = "ezwash_jwt_token";

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  return decodeURIComponent(
    atob(base64)
      .split("")
      .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
      .join(""),
  );
}

/**
 * Decode payload from JWT token directly on the client without external library.
 */
export function decodeJwtToken(token: string): DecodedUserToken | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payloadJson = base64UrlDecode(parts[1]);
    const payload = JSON.parse(payloadJson) as DecodedUserToken;
    return payload;
  } catch (err) {
    console.warn("Failed to decode JWT token:", err);
    return null;
  }
}

/**
 * Check whether a token is still valid (not expired).
 */
export function isJwtTokenValid(token: string | null | undefined): boolean {
  if (!token) return false;
  const decoded = decodeJwtToken(token);
  if (!decoded || !decoded.exp) return false;
  const now = Math.floor(Date.now() / 1000);
  return decoded.exp > now;
}

export function saveJwtToken(token: string): void {
  window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
}

export function getJwtToken(): string | null {
  const token = window.localStorage.getItem(TOKEN_STORAGE_KEY);
  if (!token) return null;
  if (!isJwtTokenValid(token)) {
    clearJwtToken();
    return null;
  }
  return token;
}

export function getUserFromJwtToken(): DecodedUserToken | null {
  const token = getJwtToken();
  if (!token) return null;
  return decodeJwtToken(token);
}

export function clearJwtToken(): void {
  window.localStorage.removeItem(TOKEN_STORAGE_KEY);
  // Also clean up any older legacy keys
  window.localStorage.removeItem("ezwash-user-meta");
  window.localStorage.removeItem("ezwash-dashboard");
}
