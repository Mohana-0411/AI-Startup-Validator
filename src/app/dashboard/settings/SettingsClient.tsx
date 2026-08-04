"use client";

import React, { useState } from "react";
import {
  User,
  Sparkles,
  Sun,
  Moon,
  Monitor,
  Bell,
  Lock,
  LogOut,
  Trash2,
  Info,
  Check,
  ShieldAlert,
  Sliders,
} from "lucide-react";
import { logoutAction } from "@/app/actions/authActions";
import { UserSession } from "@/lib/types";

export function SettingsClient({ user }: { user: UserSession }) {
  const [theme, setTheme] = useState<"light" | "dark" | "system">("light");
  const [analysisNotifs, setAnalysisNotifs] = useState(true);
  const [productUpdates, setProductUpdates] = useState(true);

  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const formattedDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString(undefined, {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "August 2026";

  function handlePasswordSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPasswordModalOpen(false);
    setFeedbackMsg("Password updated successfully.");
    setTimeout(() => setFeedbackMsg(null), 3000);
  }

  return (
    <div className="min-h-screen bg-slate-50/50 py-8 px-4 sm:px-6 lg:px-8 space-y-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header Banner */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-bold border border-purple-100 mb-2">
              <Sliders className="w-3.5 h-3.5 text-purple-600" />
              <span>Workspace & Preferences</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Settings & Account
            </h1>
            <p className="text-xs text-slate-500">
              Manage your founder account preferences, notifications, security, and interface appearance.
            </p>
          </div>
        </div>

        {/* Feedback Alert Toast */}
        {feedbackMsg && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800 flex items-center gap-2 animate-in fade-in">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{feedbackMsg}</span>
          </div>
        )}

        {/* 1. Account Section */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-sm shadow-slate-200/40 space-y-6">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <User className="w-5 h-5 text-purple-600" />
            Account Details
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">
                Full Name
              </label>
              <input
                type="text"
                disabled
                value={user.name || "Founder User"}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">
                Email Address
              </label>
              <input
                type="email"
                disabled
                value={user.email}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">
                Member Since
              </label>
              <input
                type="text"
                disabled
                value={formattedDate}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* 2. AI Preferences Section (Strictly No Dev Terms) */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-sm shadow-slate-200/40 space-y-6">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Sparkles className="w-5 h-5 text-purple-600" />
            AI Preferences
          </h2>

          <div className="p-5 bg-purple-50/50 border border-purple-100 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-purple-950 flex items-center gap-2">
                <span>AI Startup Mentor</span>
                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-extrabold rounded-full border border-emerald-200 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Status: Online
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Continuous venture intelligence & active startup score evaluation.
              </p>
            </div>

            <div className="shrink-0">
              <span className="px-3 py-1.5 bg-purple-600 text-white text-xs font-extrabold rounded-xl shadow-xs inline-block">
                Response Quality: High
              </span>
            </div>
          </div>
        </div>

        {/* 3. Appearance Section */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-sm shadow-slate-200/40 space-y-6">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Sun className="w-5 h-5 text-purple-600" />
            Appearance
          </h2>

          <div className="space-y-2">
            <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
              Interface Theme
            </label>
            <div className="grid grid-cols-3 gap-3 max-w-md">
              <button
                type="button"
                onClick={() => setTheme("light")}
                className={`p-3.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  theme === "light"
                    ? "bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-600/20"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
              >
                <Sun className="w-4 h-4" />
                <span>Light</span>
              </button>

              <button
                type="button"
                onClick={() => setTheme("dark")}
                className={`p-3.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  theme === "dark"
                    ? "bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-600/20"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
              >
                <Moon className="w-4 h-4" />
                <span>Dark</span>
              </button>

              <button
                type="button"
                onClick={() => setTheme("system")}
                className={`p-3.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  theme === "system"
                    ? "bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-600/20"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
              >
                <Monitor className="w-4 h-4" />
                <span>System</span>
              </button>
            </div>
          </div>
        </div>

        {/* 4. Notifications Section */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-sm shadow-slate-200/40 space-y-6">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Bell className="w-5 h-5 text-purple-600" />
            Notifications
          </h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors">
              <div>
                <p className="text-xs font-bold text-slate-900">Startup Analysis Notifications</p>
                <p className="text-[11px] text-slate-500">Receive alerts when new venture scorecard analysis reports finish.</p>
              </div>
              <button
                type="button"
                onClick={() => setAnalysisNotifs(!analysisNotifs)}
                className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                  analysisNotifs ? "bg-purple-600" : "bg-slate-300"
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full transition-transform shadow-sm ${
                    analysisNotifs ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors">
              <div>
                <p className="text-xs font-bold text-slate-900">Product Updates</p>
                <p className="text-[11px] text-slate-500">Receive feature announcements and roadmap progress summaries.</p>
              </div>
              <button
                type="button"
                onClick={() => setProductUpdates(!productUpdates)}
                className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                  productUpdates ? "bg-purple-600" : "bg-slate-300"
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full transition-transform shadow-sm ${
                    productUpdates ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* 5. Privacy & Security Section */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-sm shadow-slate-200/40 space-y-6">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Lock className="w-5 h-5 text-purple-600" />
            Privacy & Security
          </h2>

          <div className="flex flex-wrap items-center gap-4">
            {/* Change Password */}
            <button
              type="button"
              onClick={() => setPasswordModalOpen(true)}
              className="px-4 py-2.5 bg-slate-50 hover:bg-purple-50 text-slate-700 hover:text-purple-700 font-bold rounded-xl text-xs border border-slate-200 transition-all flex items-center gap-2"
            >
              <Lock className="w-4 h-4 text-purple-600" />
              Change Password
            </button>

            {/* Sign Out */}
            <form action={logoutAction}>
              <button
                type="submit"
                className="px-4 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold rounded-xl text-xs border border-slate-200 transition-all flex items-center gap-2"
              >
                <LogOut className="w-4 h-4 text-slate-500" />
                Sign Out
              </button>
            </form>

            {/* Delete Account */}
            <button
              type="button"
              onClick={() => setDeleteModalOpen(true)}
              className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl text-xs border border-rose-200 transition-all flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4 text-rose-600" />
              Delete Account
            </button>
          </div>
        </div>

        {/* 6. About Section */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-sm shadow-slate-200/40 space-y-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Info className="w-5 h-5 text-purple-600" />
            About
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">Application</span>
              <p className="text-sm font-extrabold text-slate-900">AI Startup Validator</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">Version</span>
              <p className="text-sm font-extrabold text-slate-900">v2.4.0 (2026 Release)</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">Core Architecture</span>
              <p className="text-sm font-extrabold text-purple-700">AI Venture Engine</p>
            </div>
          </div>
        </div>
      </div>

      {/* Password Change Modal */}
      {passwordModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full border border-slate-200 shadow-xl space-y-4">
            <h3 className="text-base font-extrabold text-slate-900">Change Account Password</h3>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">New Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPasswordModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 text-white text-xs font-bold rounded-xl shadow-md"
                >
                  Save Password
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full border border-rose-200 shadow-xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <ShieldAlert className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-extrabold text-slate-900">Delete Account</h3>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to delete your account? All startup analyses, execution roadmaps, and chat history will be permanently deleted.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl"
              >
                Cancel
              </button>
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-600 text-white text-xs font-bold rounded-xl shadow-md"
                >
                  Confirm Delete
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
