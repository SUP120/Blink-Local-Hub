export const ADMIN_EMAIL = "hedstart-bootcamp@gmail.com";
export const ADMIN_PASSWORD = "Admin@12";
const KEY = "qm_admin_auth";

export function isAdminLoggedIn(): boolean {
  try {
    return localStorage.getItem(KEY) === "yes";
  } catch {
    return false;
  }
}

export function adminLogin(email: string, password: string): boolean {
  if (email.trim().toLowerCase() === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
    localStorage.setItem(KEY, "yes");
    return true;
  }
  return false;
}

export function adminLogout(): void {
  localStorage.removeItem(KEY);
}
