"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  Zap,
  AlertCircle,
  AlertTriangle,
  Info,
  UserPlus,
  RefreshCw,
} from "lucide-react";
import { loginAction, demoLoginAction } from "@/app/actions/authActions";

interface AuthErrorState {
  errorType?: string;
  message: string;
  subMessage?: string;
  showSignupCTA?: boolean;
  alertLevel?: "info" | "warning" | "error";
}

export default function LoginPage() {
  const [authError, setAuthError] = useState<AuthErrorState | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setAuthError(null);

    const formData = new FormData(e.currentTarget);
    const result = await loginAction(null, formData);

    if (result && result.message) {
      setAuthError({
        errorType: result.errorType,
        message: result.message,
        subMessage: result.subMessage,
        showSignupCTA: result.showSignupCTA,
        alertLevel: result.alertLevel as "info" | "warning" | "error",
      });
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-50/60 dark:bg-slate-950 py-12 px-4 font-sans transition-colors">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none space-y-6">
        {/* Top App Header */}
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white flex items-center justify-center mx-auto mb-4 shadow-md shadow-purple-600/30">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Welcome Back</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Sign in to access your startup venture scorecards and AI mentor
          </p>
        </div>

        {/* Intelligent Color-Coded Error & Guidance Alert Box */}
        {authError && (
          <div
            className={`p-4 rounded-2xl border text-xs space-y-3 transition-all animate-in fade-in ${
              authError.alertLevel === "info"
                ? "bg-blue-50/90 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800/60 text-blue-900 dark:text-blue-200"
                : authError.alertLevel === "warning"
                ? "bg-amber-50/90 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800/60 text-amber-900 dark:text-amber-200"
                : "bg-rose-50/90 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/60 text-rose-900 dark:text-rose-200"
            }`}
          >
            <div className="flex items-start gap-3">
              {authError.alertLevel === "info" ? (
                <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              ) : authError.alertLevel === "warning" ? (
                <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1 leading-relaxed">
                <p className="font-extrabold">{authError.message}</p>
                {authError.subMessage && (
                  <p className="text-[11px] opacity-90">{authError.subMessage}</p>
                )}
              </div>
            </div>

            {/* Prominent Create Free Account CTA for ACCOUNT_NOT_FOUND */}
            {authError.showSignupCTA && (
              <div className="pt-2 space-y-2 border-t border-blue-200/80 dark:border-blue-800/60">
                <Link
                  href="/signup"
                  className="w-full py-2.5 px-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs shadow-md shadow-purple-600/30 flex items-center justify-center gap-2 transition-all"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Create Free Account</span>
                </Link>
                <p className="text-[10px] text-center text-blue-800 dark:text-blue-300">
                  Already have an account under another email? Check your email address and try again.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              placeholder="founder@startup.com"
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white dark:focus:bg-slate-800 transition-all"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Password
              </label>
              <button
                type="button"
                onClick={() =>
                  setAuthError({
                    errorType: "FORGOT_PASSWORD",
                    message: "Reset link ready.",
                    subMessage: "Click 'Create Free Account' or enter your registered email to continue.",
                    alertLevel: "info",
                  })
                }
                className="text-[11px] font-semibold text-purple-600 dark:text-purple-400 hover:underline"
              >
                Forgot password?
              </button>
            </div>
            <input
              type="password"
              name="password"
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white dark:focus:bg-slate-800 transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-md shadow-purple-600/20 text-sm transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Signing in...</span>
              </>
            ) : (
              <>
                <span>Sign In to Account</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Guest Session Divider */}
        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200 dark:border-slate-800" />
          </div>
          <span className="relative px-3 bg-white dark:bg-slate-900 text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            Or test immediately
          </span>
        </div>

        {/* Guest Demo Login */}
        <form action={demoLoginAction}>
          <button
            type="submit"
            className="w-full py-2.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 font-bold rounded-xl border border-slate-200 dark:border-slate-700 text-xs transition-all flex items-center justify-center gap-2"
          >
            <Zap className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            Continue as Guest / Demo User
          </button>
        </form>

        {/* Footer Link */}
        <p className="text-center text-xs text-slate-500 dark:text-slate-400 mt-6">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-purple-600 dark:text-purple-400 font-extrabold hover:underline">
            Sign up for free
          </Link>
        </p>
      </div>
    </div>
  );
}
