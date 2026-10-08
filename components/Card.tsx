import type { ReactNode } from "react";

export interface CardProps {
  /** Card body content. */
  children: ReactNode;
  /** Extra classes appended to the wrapper. */
  className?: string;
}

/**
 * Generic presentational wrapper that gives any content a consistent
 * surface: white background, rounded corners, border, and subtle shadow.
 */
export default function Card({ children, className = "" }: CardProps) {
  return (
    <div
      className={`rounded-xl border border-zinc-200 bg-white shadow-sm ${className}`}
    >
      {children}
    </div>
  );
}
