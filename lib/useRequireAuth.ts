"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

interface RequireAuthOptions {
  /** When true, only an admin may stay; customers are redirected away. */
  adminOnly?: boolean;
  /** Where to send unauthorized users. Defaults to "/" (customer landing). */
  redirectTo?: string;
  /** Where to send logged-out users. Defaults to "/login". */
  loginPath?: string;
}

interface RequireAuthResult {
  /** True while the session is still rehydrating or a redirect is pending. */
  checking: boolean;
  /** True once the user is confirmed allowed on this route. */
  allowed: boolean;
}

/**
 * Client-side route guard.
 *
 * Because the API is session-via-localStorage (no server token/middleware),
 * protection runs in the browser: this hook waits for the auth context to
 * rehydrate, then redirects logged-out users to /login and — when adminOnly —
 * redirects non-admins to `redirectTo` (default "/"). Pages render a spinner
 * while `checking` is true so protected content never flashes.
 */
export function useRequireAuth(
  options: RequireAuthOptions = {},
): RequireAuthResult {
  const { adminOnly = false, redirectTo = "/", loginPath = "/login" } = options;
  const { user, initializing, isAuthenticated, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (initializing) return;
    if (!isAuthenticated) {
      router.replace(loginPath);
      return;
    }
    if (adminOnly && !isAdmin) {
      router.replace(redirectTo);
    }
  }, [
    initializing,
    isAuthenticated,
    isAdmin,
    adminOnly,
    redirectTo,
    loginPath,
    router,
  ]);

  const allowed =
    !initializing && isAuthenticated && (!adminOnly || isAdmin);
  const checking = initializing || !allowed || !user;

  return { checking, allowed };
}
