const TOKEN_KEY = 'investslabs_token';

export const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
};

export const setToken = (token: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
  // Also set cookie for middleware
  document.cookie = `token=${token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
};

export const removeToken = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
  // Clear cookie
  document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
};

export const isAuthenticated = (): boolean => {
  return !!getToken();
};

export interface AuthUser {
  id: string;
  name: string;
  phone: string;
  email?: string;
  role: string;
  referralCode: string;
}
