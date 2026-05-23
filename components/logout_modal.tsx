"use client";
export const dynamic = "force-dynamic"
import { useEffect } from "react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onBreak: () => void;
  onLogout: () => void;
};

export default function LogoutModal({
  isOpen,
  onClose,
  onBreak,
  onLogout,
}: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      
      {/* BACKDROP */}
      <div
        className="absolute inset-0 bg-[#003527]/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* MODAL */}
      <div className="relative w-full max-w-md rounded-[2rem] bg-white p-8 shadow-xl border border-gray-200 animate-scaleIn">
        
        {/* ICON */}
        <div className="mb-6 flex justify-center">
          <div className="h-20 w-20 rounded-full bg-yellow-200 flex items-center justify-center text-yellow-700">
            <span className="material-symbols-outlined text-4xl">
              timer
            </span>
          </div>
        </div>

        {/* CONTENT */}
        <div className="text-center">
          <h3 className="text-xl font-bold text-green-900 mb-2">
            End Shift or Take a Break?
          </h3>
          <p className="text-gray-500 mb-8 px-4">
            Select an action to pause your current session or finalize your
            daily reports before logging out.
          </p>
        </div>

        {/* BUTTONS */}
        <div className="flex flex-col gap-3">
          
          {/* BREAK */}
          <button
            onClick={onBreak}
            className="flex items-center justify-center gap-3 border-2 border-green-900 py-4 rounded-xl hover:bg-green-50 transition"
          >
            <span className="material-symbols-outlined text-green-900">
              coffee
            </span>
            <span className="font-semibold text-green-900">
              Take a Break
            </span>
          </button>

          {/* LOGOUT */}
          <button
            onClick={onLogout}
            className="flex items-center justify-center gap-3 bg-green-900 text-white py-4 rounded-xl hover:brightness-110 transition"
          >
            <span className="material-symbols-outlined">
              logout
            </span>
            <span className="font-semibold">
              Time Out / Logout
            </span>
          </button>
        </div>

        {/* CANCEL */}
        <button
          onClick={onClose}
          className="mt-6 w-full text-sm text-gray-500 hover:text-green-900"
        >
          Cancel and return to dashboard
        </button>
      </div>
    </div>
  );
}