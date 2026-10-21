"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import LoginForm from "@/components/LoginForm";
import Card from "@/components/Card";
import LoadingState from "@/components/LoadingState";

/**
 * /login — sign in.
 *
 * Already-authenticated users are redirected to their landing page
 * (admin → /dashboard, customer → /). Client Component because it reads the
 * auth context.
 */
export default function LoginPage() {
  const { isAuthenticated, isAdmin, initializing } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (initializing) return;
    if (isAuthenticated) {
      router.replace(isAdmin ? "/dashboard" : "/");
    }
  }, [initializing, isAuthenticated, isAdmin, router]);

  if (initializing || isAuthenticated) {
    return <LoadingState message="Loading..." />;
  }

  return (
    <div className="mx-auto max-w-md">
      <h1 className="mb-6 text-center text-2xl font-bold text-zinc-900">
        Sign in to RevoShop
      </h1>
      <Card className="p-6">
        <LoginForm />
      </Card>
    </div>
  );
}
