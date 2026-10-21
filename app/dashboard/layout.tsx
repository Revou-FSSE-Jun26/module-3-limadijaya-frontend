"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { useRequireAuth } from "@/lib/useRequireAuth";
import LoadingState from "@/components/LoadingState";

const TABS = [
  { href: "/dashboard", label: "Products" },
  { href: "/dashboard/categories", label: "Categories" },
  { href: "/dashboard/orders", label: "Orders" },
];

function isActive(pathname: string, href: string): boolean {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Admin dashboard shell.
 *
 * Guards the entire /dashboard subtree: useRequireAuth({ adminOnly: true })
 * sends logged-out users to /login and non-admin customers to /. While the
 * session rehydrates (or a redirect is pending) it shows a spinner so the
 * admin UI never flashes to an unauthorized user. Renders a sub-navigation
 * shared by all dashboard pages.
 */
export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { checking } = useRequireAuth({ adminOnly: true, redirectTo: "/" });
  const pathname = usePathname();

  if (checking) {
    return <LoadingState message="Verifying admin access..." />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900">Admin dashboard</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Manage products, categories, and review orders.
        </p>
      </div>

      <nav aria-label="Dashboard sections" className="border-b border-zinc-200">
        <ul className="flex gap-1">
          {TABS.map((tab) => {
            const active = isActive(pathname, tab.href);
            return (
              <li key={tab.href}>
                <Link
                  href={tab.href}
                  aria-current={active ? "page" : undefined}
                  className={`inline-flex border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                    active
                      ? "border-indigo-600 text-indigo-700"
                      : "border-transparent text-zinc-500 hover:border-zinc-300 hover:text-zinc-800"
                  }`}
                >
                  {tab.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {children}
    </div>
  );
}
