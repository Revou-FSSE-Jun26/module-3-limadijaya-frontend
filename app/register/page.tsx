"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import RegisterForm from "@/components/RegisterForm";
import Card from "@/components/Card";
import LoadingState from "@/components/LoadingState";

/**
 * /register — create an account.
 *
 * Already-authenticated users are bounced to their landing page
 * (admin → /dashboard, customer → /) so the form never shows to a logged-in
 * user. A Client Component because it reads the auth context.
 */
export default function RegisterPage() {
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
        Create your account
      </h1>
      <Card className="p-6">
        <RegisterForm />
      </Card>
    </div>
  );
}
