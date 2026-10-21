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
import { readStorage, writeStorage, STORAGE_KEYS } from "@/lib/storage";
import type { CartItem, Product } from "@/lib/types";

interface CartContextValue {
  items: CartItem[];
  /** True until the stored cart has been read on mount. */
  initializing: boolean;
  /** Total number of units across all lines. */
  totalQuantity: number;
  /** Sum of price * quantity across all lines. */
  totalPrice: number;
  /** Add a product (merges quantity if already present). */
  addItem: (product: Product, quantity?: number) => void;
  /** Set an exact quantity for a product; removes the line when <= 0. */
  setQuantity: (productId: number, quantity: number) => void;
  /** Remove a product line entirely. */
  removeItem: (productId: number) => void;
  /** Empty the cart (used after a successful checkout). */
  clear: () => void;
}

const CartContext = createContext<CartContextValue | undefined>(undefined);

/**
 * Shopping cart provider.
 *
 * Cart state is persisted to localStorage so it survives refreshes (rubric:
 * "see the cart persist across refreshes via localStorage"). All updates are
 * immutable. `initializing` guards consumers from flashing an empty cart
 * before rehydration.
 */
export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [initializing, setInitializing] = useState(true);

  // Rehydrate once on mount (external-store read; see AuthContext note).
  useEffect(() => {
    const stored = readStorage<CartItem[]>(STORAGE_KEYS.cart);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (stored && Array.isArray(stored)) setItems(stored);
    setInitializing(false);
  }, []);

  // Persist whenever the cart changes (but not during the initial read).
  useEffect(() => {
    if (initializing) return;
    writeStorage(STORAGE_KEYS.cart, items);
  }, [items, initializing]);

  const addItem = useCallback((product: Product, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id
            ? { ...i, quantity: i.quantity + quantity }
            : i,
        );
      }
      return [...prev, { product, quantity }];
    });
  }, []);

  const setQuantity = useCallback((productId: number, quantity: number) => {
    setItems((prev) =>
      quantity <= 0
        ? prev.filter((i) => i.product.id !== productId)
        : prev.map((i) =>
            i.product.id === productId ? { ...i, quantity } : i,
          ),
    );
  }, []);

  const removeItem = useCallback((productId: number) => {
    setItems((prev) => prev.filter((i) => i.product.id !== productId));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const totalQuantity = useMemo(
    () => items.reduce((sum, i) => sum + i.quantity, 0),
    [items],
  );
  const totalPrice = useMemo(
    () => items.reduce((sum, i) => sum + i.product.price * i.quantity, 0),
    [items],
  );

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      initializing,
      totalQuantity,
      totalPrice,
      addItem,
      setQuantity,
      removeItem,
      clear,
    }),
    [
      items,
      initializing,
      totalQuantity,
      totalPrice,
      addItem,
      setQuantity,
      removeItem,
      clear,
    ],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

/** Access the cart. Throws if used outside <CartProvider>. */
export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) {
    throw new Error("useCart must be used within a <CartProvider>.");
  }
  return ctx;
}
