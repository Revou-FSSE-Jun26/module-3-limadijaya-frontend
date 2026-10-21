"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";

interface NavItem {
  href: string;
  label: string;
}

/**
 * Determine whether a nav item is the active route.
 * The home link ("/") only matches exactly; others match their subtree
 * (e.g. "/products" stays active on "/products/5").
 */
function isActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Site header with role-aware navigation and session controls.
 *
 * - Public links (Home, Products, Categories) always show.
 * - Logged-in customers additionally see "Orders".
 * - Admins see a "Dashboard" link instead of customer-only entries.
 * - The cart link shows a live item-count badge.
 * - The right side shows Sign in / Register when logged out, or the username
 *   and a Logout button when logged in.
 *
 * Uses usePathname() for active highlighting and the auth/cart contexts for
 * session + cart state, so it is a Client Component.
 */
export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { totalQuantity } = useCart();

  // Build the nav list based on role.
  const navItems: NavItem[] = [
    { href: "/", label: "Home" },
    { href: "/products", label: "Products" },
    { href: "/categories", label: "Categories" },
  ];
  if (isAuthenticated && !isAdmin) {
    navItems.push({ href: "/orders", label: "Orders" });
  }
  if (isAdmin) {
    navItems.push({ href: "/dashboard", label: "Dashboard" });
  }

  function handleLogout() {
    logout();
    toast.success("Signed out.");
    router.push("/");
  }

  return (
    <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
        <Link href="/" className="text-xl font-bold tracking-tight text-indigo-600">
          RevoShop
        </Link>

        <nav aria-label="Main navigation" className="flex-1">
          <ul className="flex items-center gap-1 sm:gap-2">
            {navItems.map((item) => {
              const active = isActive(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                      active
                        ? "bg-indigo-50 text-indigo-700"
                        : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          {/* Cart link (hidden for admins, who don't shop) */}
          {!isAdmin && (
            <Link
              href="/cart"
              aria-label={`Cart, ${totalQuantity} item${totalQuantity === 1 ? "" : "s"}`}
              className="relative rounded-md px-3 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
            >
              Cart
              {totalQuantity > 0 && (
                <span
                  data-testid="cart-badge"
                  className="absolute -right-1 -top-1 inline-flex min-w-5 items-center justify-center rounded-full bg-indigo-600 px-1.5 text-xs font-semibold text-white"
                >
                  {totalQuantity}
                </span>
              )}
            </Link>
          )}

          {isAuthenticated ? (
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="hidden text-sm text-zinc-600 sm:inline">
                Hi,{" "}
                <span data-testid="current-username" className="font-semibold text-zinc-900">
                  {user?.username}
                </span>
                {isAdmin && (
                  <span className="ml-1 rounded bg-amber-100 px-1.5 py-0.5 text-xs font-medium text-amber-700">
                    admin
                  </span>
                )}
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-md border border-zinc-300 px-3 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100"
              >
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="rounded-md px-3 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
