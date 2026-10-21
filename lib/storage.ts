// localStorage keys and small guarded read/write helpers used by the auth and
// cart contexts. Guarded so they never throw during SSR (no window) or when a
// stored value is malformed.

export const STORAGE_KEYS = {
  user: "revoshop:user",
  cart: "revoshop:cart",
} as const;

/** Read and JSON-parse a value from localStorage; returns null on any failure. */
export function readStorage<T>(key: string): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

/** JSON-stringify and persist a value to localStorage; no-op on failure. */
export function writeStorage<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Quota or serialization failure — ignore; state stays in memory.
  }
}

/** Remove a key from localStorage. */
export function removeStorage(key: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    // ignore
  }
}
