import { apiFetch } from "../config/api.config";

export interface AdminUserInfo {
  token: string;
  role: string;
  username: string;
}

const ADMIN_USER_INFO_KEY = "adminUserInfo";

export async function loginAdmin(
  username: string,
  password: string,
): Promise<AdminUserInfo> {
  const response = await apiFetch("/api/admin/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      username,
      password,
      token: password === "admin-secret" ? password : undefined,
    }),
  });

  if (!response.ok) {
    const errorData = await response
      .json()
      .catch(() => ({ error: "Invalid admin credentials." }));
    throw new Error(
      errorData.error || `Admin login failed (${response.status})`,
    );
  }

  const result = (await response.json()) as {
    success: boolean;
    adminUserInfo: AdminUserInfo;
  };
  if (!result.success || !result.adminUserInfo) {
    throw new Error("Admin login failed.");
  }

  saveAdminUserInfo(result.adminUserInfo);
  return result.adminUserInfo;
}

export function saveAdminUserInfo(info: AdminUserInfo) {
  window.localStorage.setItem(ADMIN_USER_INFO_KEY, JSON.stringify(info));
}

export function loadAdminUserInfo(): AdminUserInfo | null {
  try {
    const value = window.localStorage.getItem(ADMIN_USER_INFO_KEY);
    return value ? (JSON.parse(value) as AdminUserInfo) : null;
  } catch {
    return null;
  }
}

export function getAdminToken(): string {
  const info = loadAdminUserInfo();
  return info?.token || "admin-secret";
}

export function clearAdminUserInfo() {
  window.localStorage.removeItem(ADMIN_USER_INFO_KEY);
}
