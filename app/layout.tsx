import { Suspense } from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "@/context/Providers";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "RevoShop",
    template: "%s | RevoShop",
  },
  description:
    "RevoShop — browse products, categories, and orders served live from the RevoShop API.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">
        {/* All client-side session/cart state + toast notifications live under
            Providers so every page and the Header share one source of truth. */}
        <Providers>
          {/* Header uses usePathname()/useAuth() (runtime data), so it streams
              behind a Suspense boundary with a header-shaped fallback that ships
              in the static shell. */}
          <Suspense fallback={<div className="h-[65px] border-b border-zinc-200 bg-white" />}>
            <Header />
          </Suspense>
          <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
