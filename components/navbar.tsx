"use client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";

export const dynamic = "force-dynamic"

export function Navbar() {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <nav className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur-md dark:bg-emerald-950/95 border-b border-emerald-100 dark:border-emerald-800 shadow-sm shadow-emerald-900/5">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-4">

        {/* LOGO */}
        <div className="text-xl font-extrabold text-emerald-900 dark:text-emerald-50 flex items-center gap-2">
          <span
            className="material-symbols-outlined text-secondary-container"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            storefront
          </span>
          Tory
        </div>

        {/* DESKTOP NAV LINKS */}
        <div className="hidden md:flex gap-8 items-center">
          <Link
            className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-900 dark:hover:text-emerald-200 transition-colors font-semibold text-sm tracking-wide"
            href="#features"
          >
            Features
          </Link>
          <Link
            className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-900 dark:hover:text-emerald-200 transition-colors font-semibold text-sm tracking-wide"
            href="#inventory"
          >
            Inventory
          </Link>
          <Link
            className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-900 dark:hover:text-emerald-200 transition-colors font-semibold text-sm tracking-wide"
            href="#pautang"
          >
            Credit Tracker
          </Link>
          <Link
            className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-900 dark:hover:text-emerald-200 transition-colors font-semibold text-sm tracking-wide"
            href="#pricing"
          >
            Pricing
          </Link>
        </div>

        {/* DESKTOP LOGIN + MOBILE BURGER */}
        <div className="flex gap-4 items-center">

          {/* LOGIN — hidden on mobile */}
          <Link href="/login">
            <button className="hidden sm:block text-emerald-900 dark:text-emerald-50 font-semibold text-sm hover:bg-emerald-50 dark:hover:bg-emerald-900/40 px-4 py-2 rounded-md transition-all active:scale-[0.98]">
              Log In
            </button>
          </Link>

          {/* BURGER BUTTON — visible on mobile only */}
          <button
            className="md:hidden flex flex-col justify-center items-center w-8 h-8 gap-1.5"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            <span className={`block w-6 h-0.5 bg-emerald-900 dark:bg-emerald-50 transition-all duration-300 ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
            <span className={`block w-6 h-0.5 bg-emerald-900 dark:bg-emerald-50 transition-all duration-300 ${menuOpen ? "opacity-0" : ""}`} />
            <span className={`block w-6 h-0.5 bg-emerald-900 dark:bg-emerald-50 transition-all duration-300 ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
          </button>

        </div>
      </div>

      {/* MOBILE DROPDOWN MENU */}
      <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${menuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}>
        <div className="flex flex-col px-6 pb-4 gap-4 bg-white/95 dark:bg-emerald-950/95 border-t border-emerald-100 dark:border-emerald-800">
          <Link
            href="#features"
            onClick={() => setMenuOpen(false)}
            className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-900 dark:hover:text-emerald-200 transition-colors font-semibold text-sm tracking-wide py-2"
          >
            Features
          </Link>
          <Link
            href="#inventory"
            onClick={() => setMenuOpen(false)}
            className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-900 dark:hover:text-emerald-200 transition-colors font-semibold text-sm tracking-wide py-2"
          >
            Inventory
          </Link>
          <Link
            href="#pautang"
            onClick={() => setMenuOpen(false)}
            className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-900 dark:hover:text-emerald-200 transition-colors font-semibold text-sm tracking-wide py-2"
          >
            Credit Tracker
          </Link>
          <Link
            href="#pricing"
            onClick={() => setMenuOpen(false)}
            className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-900 dark:hover:text-emerald-200 transition-colors font-semibold text-sm tracking-wide py-2"
          >
            Pricing
          </Link>

          {/* LOGIN BUTTON inside mobile menu */}
          <Link href="/login" onClick={() => setMenuOpen(false)}>
            <button className="w-full text-center text-emerald-900 dark:text-emerald-50 font-semibold text-sm bg-emerald-50 dark:bg-emerald-900/40 px-4 py-2 rounded-md transition-all active:scale-[0.98]">
              Log In
            </button>
          </Link>
        </div>
      </div>

    </nav>
  );
}