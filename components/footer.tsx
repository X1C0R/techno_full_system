import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-emerald-900 dark:bg-black text-white dark:text-emerald-100 border-t border-emerald-800 dark:border-emerald-900 w-full mt-auto">
      <div className="max-w-7xl mx-auto py-12 px-6 flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="space-y-4 text-center md:text-left">
          <div className="text-lg font-bold text-yellow-400 dark:text-yellow-500 font-[var(--font-heading)]">
            Tory
          </div>
          <p className="font-[var(--font-heading)] text-sm leading-relaxed max-w-sm opacity-80">
            © 2024 Tory. Your partner in helping your business grow.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-6">
          <Link
            className="text-emerald-100/70 hover:text-white transition-colors hover:underline decoration-yellow-400 underline-offset-4 font-[var(--font-heading)] text-sm"
            href="#"
          >
            Privacy Policy
          </Link>
          <Link
            className="text-emerald-100/70 hover:text-white transition-colors hover:underline decoration-yellow-400 underline-offset-4 font-[var(--font-heading)] text-sm"
            href="#"
          >
            Terms of Service
          </Link>
          <Link
            className="text-emerald-100/70 hover:text-white transition-colors hover:underline decoration-yellow-400 underline-offset-4 font-[var(--font-heading)] text-sm"
            href="#"
          >
            Help Center
          </Link>
          <Link
            className="text-emerald-100/70 hover:text-white transition-colors hover:underline decoration-yellow-400 underline-offset-4 font-[var(--font-heading)] text-sm"
            href="#"
          >
            Contact Us
          </Link>
        </div>
        <div className="flex gap-4">
          <Link
            className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-yellow-400 transition-colors group"
            href="#"
          >
            <span className="material-symbols-outlined text-white group-hover:text-emerald-900">
              public
            </span>
          </Link>
          <Link
            className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-yellow-400 transition-colors group"
            href="#"
          >
            <span className="material-symbols-outlined text-white group-hover:text-emerald-900">
              mail
            </span>
          </Link>
        </div>
      </div>
    </footer>
  );
}
