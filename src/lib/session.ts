export const AUTH_TOKEN_KEY = "sl_auth_token";
export const ACCOUNT_KEY = "sl_account";

export type SessionAccount = {
  id: string;
  fullName: string;
  email: string;
  role: "user" | "investor" | "founder" | "admin";
  city?: string;
  phone?: string;
  referralCode?: string;
  profileId?: string;
  headline?: string;
  profilePhoto?: string;
  cardColors?: {
    primary?: string;
    secondary?: string;
    accent?: string;
    backgroundColor?: string;
  };
  nfcId?: string;
  membershipTier?: string; // Added for event/member logic
};

export const setSession = (token: string, account: SessionAccount) => {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
  localStorage.setItem(ACCOUNT_KEY, JSON.stringify(account));
};

export const getToken = () => localStorage.getItem(AUTH_TOKEN_KEY);
export const isAuthenticated = () => Boolean(getToken());

export const getAccount = (): SessionAccount | null => {
  const raw = localStorage.getItem(ACCOUNT_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as SessionAccount;
  } catch {
    return null;
  }
};

// Alias for compatibility with legacy code
export const getSession = getAccount;

export const clearSession = () => {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(ACCOUNT_KEY);
};
