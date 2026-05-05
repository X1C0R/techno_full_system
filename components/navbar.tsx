"use client";

import Link from "next/link";

export function Navbar() {
  return (
    <nav className="fixed top-0 w-full z-50 bg-white/95 backdrop-blur-md dark:bg-emerald-950/95 border-b border-emerald-100 dark:border-emerald-800 shadow-sm shadow-emerald-900/5">
      <div className="max-w-7xl mx-auto flex justify-between items-center px-6 py-4">
        <div className="text-xl font-extrabold text-emerald-900 dark:text-emerald-50 flex items-center gap-2 font-[var(--font-heading)]">
          <span
            className="material-symbols-outlined text-secondary-container"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            storefront
          </span>
          Tory
        </div>
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
        <div className="flex gap-4 items-center">
          <button className="hidden sm:block text-emerald-900 dark:text-emerald-50 font-semibold text-sm hover:bg-emerald-50 dark:hover:bg-emerald-900/40 px-4 py-2 rounded-md transition-all active:scale-[0.98]">
            Log In
          </button>
          <button className="bg-primary-container text-on-primary-container font-semibold text-sm px-5 py-2.5 rounded-xl shadow-md active:scale-[0.98] transition-transform duration-150">
            Register Store
          </button>
        </div>
      </div>
    </nav>
  );
}
