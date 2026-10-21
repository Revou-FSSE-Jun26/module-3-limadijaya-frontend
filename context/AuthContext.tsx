"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { loginClient, registerClient } from "@/lib/client-api";
import { readStorage, removeStorage, writeStorage, STORAGE_KEYS } from "@/lib/storage";
import type { LoginPayload, RegisterPayload, User } from "@/lib/types";

interface AuthContextValue {
  /** The logged-in user, or null when logged out. */
  user: User | null;
  /** True until the stored session has been read on mount (avoids UI flicker). */
  initializing: boolean;
  /** Convenience flags derived from the user role. */
  isAuthenticated: boolean;
  isAdmin: boolean;
  /** Register then establish a session. Returns the created user. */
  register: (payload: RegisterPayload) => Promise<User>;
  /** Log in and establish a session. Returns the user. */
  login: (payload: LoginPayload) => Promise<User>;
  /** Clear the session. */
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * Session provider.
 *
 * The Flask API does not issue a token — login/register return a user object.
 * That object IS the session, persisted to localStorage so it survives a page
 * refresh. On mount we rehydrate from storage; `initializing` guards consumers
 * from rendering a "logged out" state before rehydration finishes.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);

  // Rehydrate the session from localStorage once on mount. This is the
  // canonical "synchronize with an external system on mount" effect: we can't
  // read localStorage during SSR, so the initial state must stay at its
  // default and be hydrated here. The set-state-in-effect rule doesn't apply
  // to a one-time external-store read.
  useEffect(() => {
    const stored = readStorage<User>(STORAGE_KEYS.user);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (stored) setUser(stored);
    setInitializing(false);
  }, []);

  const persist = useCallback((next: User) => {
    setUser(next);
    writeStorage(STORAGE_KEYS.user, next);
  }, []);

  const register = useCallback(
    async (payload: RegisterPayload) => {
      // Register creates the account; the API returns the user (role: customer)
      // which we immediately treat as a logged-in session.
      const created = await registerClient(payload);
      persist(created);
      return created;
    },
    [persist],
  );

  const login = useCallback(
    async (payload: LoginPayload) => {
      const loggedIn = await loginClient(payload);
      persist(loggedIn);
      return loggedIn;
    },
    [persist],
  );

  const logout = useCallback(() => {
    setUser(null);
    removeStorage(STORAGE_KEYS.user);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      initializing,
      isAuthenticated: user !== null,
      isAdmin: user?.role === "admin",
      register,
      login,
      logout,
    }),
    [user, initializing, register, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/** Access the auth session. Throws if used outside <AuthProvider>. */
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an <AuthProvider>.");
  }
  return ctx;
}
