"use client";

import type { ReactNode } from "react";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./AuthContext";
import { CartProvider } from "./CartContext";

/**
 * Single client-side provider tree mounted once in the root layout:
 *  - AuthProvider   → session (localStorage)
 *  - CartProvider   → shopping cart (localStorage)
 *  - Toaster        → react-hot-toast notifications for CRUD / cart actions
 */
export default function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <CartProvider>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 3500,
            style: { fontSize: "0.875rem" },
          }}
        />
      </CartProvider>
    </AuthProvider>
  );
}
