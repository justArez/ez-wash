import crypto from "node:crypto";
export interface UserJwtPayload {
  customerId: string;
  username: string;
  phone: string;
  email?: string;
  fullName?: string;
  role?: string;
  iat: number;
  exp: number;
}

const JWT_SECRET = process.env.JWT_SECRET || "ez-wash-jwt-secret-key";
const SESSION_EXPIRATION_SECONDS = 3600; // 1 hour

function base64UrlEncode(str: string): string {
  return Buffer.from(str)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  return Buffer.from(base64, "base64").toString("utf8");
}

export function signJwt(
  payload: Omit<UserJwtPayload, "iat" | "exp">,
  expiresInSeconds: number = SESSION_EXPIRATION_SECONDS,
): string {
  const header = {
    alg: "HS256",
    typ: "JWT",
  };

  const now = Math.floor(Date.now() / 1000);
  const fullPayload: UserJwtPayload = {
    ...payload,
    iat: now,
    exp: now + expiresInSeconds,
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(fullPayload));

  const signature = crypto
    .createHmac("sha256", JWT_SECRET)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

export function verifyJwt(token: string): {
  valid: boolean;
  payload?: UserJwtPayload;
  error?: string;
} {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      return { valid: false, error: "Invalid token format." };
    }

    const [encodedHeader, encodedPayload, signature] = parts;
    const expectedSignature = crypto
      .createHmac("sha256", JWT_SECRET)
      .update(`${encodedHeader}.${encodedPayload}`)
      .digest("base64")
      .replace(/=/g, "")
      .replace(/\+/g, "-")
      .replace(/\//g, "_");

    if (signature !== expectedSignature) {
      return { valid: false, error: "Invalid signature." };
    }

    const payload: UserJwtPayload = JSON.parse(base64UrlDecode(encodedPayload));
    const now = Math.floor(Date.now() / 1000);

    if (payload.exp && payload.exp < now) {
      return { valid: false, error: "Token has expired." };
    }

    return { valid: true, payload };
  } catch (err: any) {
    return {
      valid: false,
      error: err?.message || "Token verification failed.",
    };
  }
}
