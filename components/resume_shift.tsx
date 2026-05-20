"use client";

import { useEffect } from "react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onResume: () => void;
  onNewShift: () => void;
};

export default function ResumeShiftModal({
  isOpen,
  onClose,
  onResume,
  onNewShift,
}: Props) {

  // ESC key close
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      
      {/* BACKDROP */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* MODAL */}
      <div className="relative w-full max-w-md rounded-[2rem] bg-white p-8 shadow-xl border animate-in fade-in zoom-in duration-200">

        {/* ICON */}
        <div className="mb-6 flex justify-center">
          <div className="h-20 w-20 rounded-full bg-yellow-100 flex items-center justify-center shadow-inner">
            <span className="material-symbols-outlined text-4xl text-yellow-600">
              play_arrow
            </span>
          </div>
        </div>

        {/* CONTENT */}
        <div className="text-center">
          <h3 className="text-xl font-bold text-[#003527] mb-2">
            Resume Your Session?
          </h3>

          <p className="text-gray-500 mb-8 px-4">
            Welcome back! Would you like to resume your previous session and continue where you left off?
          </p>
        </div>

        {/* BUTTONS */}
        <div className="flex flex-col gap-3">

          {/* NEW SHIFT */}
          <button
            onClick={onNewShift}
            className="flex items-center justify-center gap-3 rounded-xl border-2 border-[#003527] py-4 px-6 hover:bg-[#003527]/5 transition active:scale-95"
          >
            <span className="material-symbols-outlined text-[#003527]">
              refresh
            </span>
            <span className="font-semibold text-[#003527]">
              Start New Shift
            </span>
          </button>

          {/* RESUME */}
          <button
            onClick={onResume}
            className="flex items-center justify-center gap-3 rounded-xl bg-[#003527] py-4 px-6 text-white shadow-md hover:brightness-110 transition active:scale-95"
          >
            <span className="material-symbols-outlined">
              play_arrow
            </span>
            <span className="font-semibold">
              Resume Work
            </span>
          </button>

        </div>

        {/* CANCEL */}
        <button
          onClick={onClose}
          className="mt-6 w-full text-sm text-gray-400 hover:text-[#003527]"
        >
          Cancel and return to login
        </button>
      </div>
    </div>
  );
}