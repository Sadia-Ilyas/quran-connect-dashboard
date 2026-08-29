import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Role, User } from "@/types/dashboard";
import { useDashboard } from "./DashboardContext";

interface AuthValue {
  user: User | null;
  ready: boolean;
  login: (email: string, password: string) => { ok: boolean; user?: User; error?: string };
  logout: () => void;
  updateProfile: (patch: Partial<User>) => void;
  changePassword: (current: string, next: string) => { ok: boolean; error?: string };
}

const AuthContext = createContext<AuthValue | null>(null);
const STORAGE_KEY = "qa.auth.userId";

export function AuthProvider({ children }: { children: ReactNode }) {
  const { allUsers, updateUser } = useDashboard();
  const [userId, setUserId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setUserId(localStorage.getItem(STORAGE_KEY));
    setReady(true);
  }, []);

  const user = useMemo(() => allUsers.find((u) => u.id === userId) ?? null, [allUsers, userId]);

  const value: AuthValue = {
    user,
    ready,
    login: (email, password) => {
      const found = allUsers.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
      if (!found) return { ok: false, error: "No account found with that email." };
      if (found.password !== password) return { ok: false, error: "Incorrect password." };
      localStorage.setItem(STORAGE_KEY, found.id);
      setUserId(found.id);
      return { ok: true, user: found };
    },
    logout: () => {
      localStorage.removeItem(STORAGE_KEY);
      setUserId(null);
    },
    updateProfile: (patch) => {
      if (user) updateUser(user.id, patch);
    },
    changePassword: (current, next) => {
      if (!user) return { ok: false, error: "Not signed in." };
      if (user.password !== current) return { ok: false, error: "Current password is incorrect." };
      if (next.length < 6) return { ok: false, error: "New password must be at least 6 characters." };
      updateUser(user.id, { password: next });
      return { ok: true };
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

export type { Role };
