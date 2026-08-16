export interface AdminUserInfo {
  token: string;
  role: string;
  username: string;
}

const ADMIN_USER_INFO_KEY = "adminUserInfo";

// Demo admin account
const DEMO_ADMIN = {
  username: "admin",
  password: "admin123",
};

export async function loginAdmin(
  username: string,
  password: string,
): Promise<AdminUserInfo> {
  // Validate against demo admin account
  if (username === DEMO_ADMIN.username && password === DEMO_ADMIN.password) {
    const adminInfo: AdminUserInfo = {
      token: "demo-admin-token",
      role: "admin",
      username: DEMO_ADMIN.username,
    };
    saveAdminUserInfo(adminInfo);
    return adminInfo;
  }

  throw new Error("Invalid admin credentials.");
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

export function clearAdminUserInfo() {
  window.localStorage.removeItem(ADMIN_USER_INFO_KEY);
}
