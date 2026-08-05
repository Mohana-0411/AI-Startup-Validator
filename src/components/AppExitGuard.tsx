"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { LogOut, X } from "lucide-react";

export function AppExitGuard() {
  const pathname = usePathname();
  const [showExitModal, setShowExitModal] = useState(false);

  useEffect(() => {
    // Only activate Exit confirmation modal when user is at the root dashboard (/dashboard)
    if (pathname !== "/dashboard") {
      setShowExitModal(false);
      return;
    }

    // Push initial history state to capture back button popstate
    window.history.pushState({ appExitGuard: true }, "", window.location.href);

    const handlePopState = (event: PopStateEvent) => {
      if (pathname === "/dashboard") {
        // Prevent default browser exit and prompt confirmation modal
        setShowExitModal(true);
        window.history.pushState({ appExitGuard: true }, "", window.location.href);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [pathname]);

  function handleCancelExit() {
    setShowExitModal(false);
    window.history.pushState({ appExitGuard: true }, "", window.location.href);
  }

  function handleConfirmExit() {
    setShowExitModal(false);
    // Allow leaving the app by going back or redirecting to home
    window.history.go(-2);
  }

  if (!showExitModal) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-sm w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 text-center">
        <div className="w-12 h-12 rounded-2xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto border border-amber-200 dark:border-amber-900/50">
          <LogOut className="w-6 h-6" />
        </div>

        <div className="space-y-1">
          <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Exit Application?</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Do you want to exit the application?
          </p>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={handleCancelExit}
            className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirmExit}
            className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-md shadow-rose-600/20 transition-colors"
          >
            Exit
          </button>
        </div>
      </div>
    </div>
  );
}
