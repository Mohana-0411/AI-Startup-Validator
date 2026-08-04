"use client";

import React, { useState, useEffect } from "react";
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
  Mail,
  Edit2,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Zap,
} from "lucide-react";
import {
  updateThemeAction,
  updateNotificationsAction,
  updateAiPreferencesAction,
  updateProfileNameAction,
  updateEmailAction,
  changePasswordAction,
  deleteAccountAction,
} from "@/app/actions/settingsActions";
import { logoutAction } from "@/app/actions/authActions";
import { UserSession } from "@/lib/types";

interface SettingsClientProps {
  user: UserSession;
  initialSettings: {
    theme: string;
    productUpdates: boolean;
    analysisCompleted: boolean;
    weeklyTips: boolean;
    aiResponseLength: string;
    aiResponseStyle: string;
    autoSaveChat: boolean;
  };
}

export function SettingsClient({ user, initialSettings }: SettingsClientProps) {
  // Account State
  const [userName, setUserName] = useState(user.name || "");
  const [userEmail, setUserEmail] = useState(user.email || "");
  const [isEditingName, setIsEditingName] = useState(false);
  const [isEditingEmail, setIsEditingEmail] = useState(false);

  // Preference States
  const [theme, setTheme] = useState(initialSettings.theme || "light");
  const [productUpdates, setProductUpdates] = useState(initialSettings.productUpdates);
  const [analysisCompleted, setAnalysisCompleted] = useState(initialSettings.analysisCompleted);
  const [weeklyTips, setWeeklyTips] = useState(initialSettings.weeklyTips);

  const [aiResponseLength, setAiResponseLength] = useState(initialSettings.aiResponseLength || "Balanced");
  const [aiResponseStyle, setAiResponseStyle] = useState(initialSettings.aiResponseStyle || "Professional");
  const [autoSaveChat, setAutoSaveChat] = useState(initialSettings.autoSaveChat);

  // Modal & Toast States
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [passError, setPassError] = useState<string | null>(null);

  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  function showToast(message: string, type: "success" | "error" = "success") {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }

  // Theme Syncing Effect
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else if (theme === "light") {
      root.classList.remove("dark");
      localStorage.setItem("theme", "light");
    } else {
      localStorage.removeItem("theme");
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        root.classList.add("dark");
      } else {
        root.classList.remove("dark");
      }
    }
  }, [theme]);

  // Handle Theme Change
  async function handleThemeChange(newTheme: "light" | "dark" | "system") {
    setTheme(newTheme);
    const res = await updateThemeAction(newTheme);
    if (res.success) {
      showToast("Theme updated.");
    } else if (res.error) {
      showToast(res.error, "error");
    }
  }

  // Handle Notification Toggle
  async function handleNotificationToggle(key: "productUpdates" | "analysisCompleted" | "weeklyTips") {
    let newUpdates = productUpdates;
    let newCompleted = analysisCompleted;
    let newTips = weeklyTips;

    if (key === "productUpdates") {
      newUpdates = !productUpdates;
      setProductUpdates(newUpdates);
    } else if (key === "analysisCompleted") {
      newCompleted = !analysisCompleted;
      setAnalysisCompleted(newCompleted);
    } else if (key === "weeklyTips") {
      newTips = !weeklyTips;
      setWeeklyTips(newTips);
    }

    const res = await updateNotificationsAction({
      productUpdates: newUpdates,
      analysisCompleted: newCompleted,
      weeklyTips: newTips,
    });

    if (res.success) {
      showToast("Notification preferences saved.");
    } else if (res.error) {
      showToast(res.error, "error");
    }
  }

  // Handle AI Preference Change
  async function handleAiPreferenceChange(updates: {
    aiResponseLength?: string;
    aiResponseStyle?: string;
    autoSaveChat?: boolean;
  }) {
    if (updates.aiResponseLength) setAiResponseLength(updates.aiResponseLength);
    if (updates.aiResponseStyle) setAiResponseStyle(updates.aiResponseStyle);
    if (typeof updates.autoSaveChat === "boolean") setAutoSaveChat(updates.autoSaveChat);

    const res = await updateAiPreferencesAction({
      aiResponseLength: updates.aiResponseLength || aiResponseLength,
      aiResponseStyle: updates.aiResponseStyle || aiResponseStyle,
      autoSaveChat: typeof updates.autoSaveChat === "boolean" ? updates.autoSaveChat : autoSaveChat,
    });

    if (res.success) {
      showToast("AI preferences saved.");
    } else if (res.error) {
      showToast(res.error, "error");
    }
  }

  // Handle Profile Name Save
  async function handleSaveName() {
    const res = await updateProfileNameAction(userName);
    if (res.success) {
      setIsEditingName(false);
      showToast("Profile name updated.");
    } else if (res.error) {
      showToast(res.error, "error");
    }
  }

  // Handle Email Save
  async function handleSaveEmail() {
    const res = await updateEmailAction(userEmail);
    if (res.success) {
      setIsEditingEmail(false);
      showToast("Email address updated.");
    } else if (res.error) {
      showToast(res.error, "error");
    }
  }

  // Handle Password Change Form
  async function handlePasswordSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPassError(null);
    const formData = new FormData(e.currentTarget);
    const res = await changePasswordAction(formData);

    if (res.success) {
      setPasswordModalOpen(false);
      showToast("Password updated successfully.");
    } else if (res.error) {
      setPassError(res.error);
    }
  }

  const formattedDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString(undefined, {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "August 2026";

  return (
    <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950 py-8 px-4 sm:px-6 lg:px-8 space-y-8 font-sans transition-colors duration-200">
      {/* Toast Notification Container */}
      {toast && (
        <div
          className={`fixed top-5 right-5 z-50 p-4 rounded-xl shadow-xl border flex items-center gap-3 text-xs font-bold transition-all animate-in slide-in-from-top-3 ${
            toast.type === "success"
              ? "bg-slate-900 text-white border-slate-800"
              : "bg-rose-950 text-rose-200 border-rose-800"
          }`}
        >
          {toast.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header Banner */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 transition-colors">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 text-xs font-bold border border-purple-100 dark:border-purple-900/50 mb-2">
              <Sliders className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              <span>Workspace & Preferences</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Settings & Account
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Configure profile credentials, active theme, notification alerts, and AI mentor behavior.
            </p>
          </div>
        </div>

        {/* 1. Account Section */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6 transition-colors">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <span className="flex items-center gap-2">
              <User className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              Account Details
            </span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {/* Name */}
            <div>
              <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                Full Name
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  disabled={!isEditingName}
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isEditingName
                      ? "bg-white dark:bg-slate-800 border-2 border-purple-600 text-slate-900 dark:text-white focus:outline-none"
                      : "bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
                  }`}
                />
                {isEditingName ? (
                  <button
                    onClick={handleSaveName}
                    className="p-2.5 bg-purple-600 text-white rounded-xl text-xs font-bold shrink-0 hover:bg-purple-700 shadow-xs"
                    title="Save Name"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={() => setIsEditingName(true)}
                    className="p-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-xs shrink-0 hover:text-purple-600"
                    title="Edit Name"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                Email Address
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="email"
                  disabled={!isEditingEmail}
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isEditingEmail
                      ? "bg-white dark:bg-slate-800 border-2 border-purple-600 text-slate-900 dark:text-white focus:outline-none"
                      : "bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
                  }`}
                />
                {isEditingEmail ? (
                  <button
                    onClick={handleSaveEmail}
                    className="p-2.5 bg-purple-600 text-white rounded-xl text-xs font-bold shrink-0 hover:bg-purple-700 shadow-xs"
                    title="Save Email"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    onClick={() => setIsEditingEmail(true)}
                    className="p-2.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl text-xs shrink-0 hover:text-purple-600"
                    title="Edit Email"
                  >
                    <Mail className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Account Creation Date */}
            <div>
              <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1">
                Member Since
              </label>
              <input
                type="text"
                disabled
                value={formattedDate}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-200 cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* 2. Theme System Section */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6 transition-colors">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Sun className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            Appearance & Theme
          </h2>

          <div className="space-y-2">
            <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Active Theme (Saved to Account)
            </label>
            <div className="grid grid-cols-3 gap-3 max-w-md">
              <button
                type="button"
                onClick={() => handleThemeChange("light")}
                className={`p-3.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  theme === "light"
                    ? "bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-600/20 font-extrabold"
                    : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                }`}
              >
                <Sun className="w-4 h-4" />
                <span>Light</span>
              </button>

              <button
                type="button"
                onClick={() => handleThemeChange("dark")}
                className={`p-3.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  theme === "dark"
                    ? "bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-600/20 font-extrabold"
                    : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                }`}
              >
                <Moon className="w-4 h-4" />
                <span>Dark</span>
              </button>

              <button
                type="button"
                onClick={() => handleThemeChange("system")}
                className={`p-3.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                  theme === "system"
                    ? "bg-purple-600 text-white border-purple-600 shadow-md shadow-purple-600/20 font-extrabold"
                    : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                }`}
              >
                <Monitor className="w-4 h-4" />
                <span>System</span>
              </button>
            </div>
          </div>
        </div>

        {/* 3. AI Preferences Section */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6 transition-colors">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            AI Mentor Behavior & Preferences
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Response Length */}
            <div className="space-y-2">
              <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                AI Response Length
              </label>
              <div className="flex flex-col gap-1.5">
                {["Short", "Balanced", "Detailed"].map((len) => (
                  <button
                    key={len}
                    type="button"
                    onClick={() => handleAiPreferenceChange({ aiResponseLength: len })}
                    className={`px-3 py-2 rounded-xl text-xs font-bold text-left border transition-all ${
                      aiResponseLength === len
                        ? "bg-purple-600 text-white border-purple-600 shadow-sm"
                        : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {len}
                  </button>
                ))}
              </div>
            </div>

            {/* Response Style */}
            <div className="space-y-2">
              <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                AI Response Tone & Style
              </label>
              <div className="flex flex-col gap-1.5">
                {["Professional", "Friendly", "Direct"].map((style) => (
                  <button
                    key={style}
                    type="button"
                    onClick={() => handleAiPreferenceChange({ aiResponseStyle: style })}
                    className={`px-3 py-2 rounded-xl text-xs font-bold text-left border transition-all ${
                      aiResponseStyle === style
                        ? "bg-purple-600 text-white border-purple-600 shadow-sm"
                        : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>

            {/* Auto Save Chat History Toggle */}
            <div className="space-y-2">
              <label className="block text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Chat History Persistence
              </label>
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">Auto-save Chat</span>
                  <button
                    type="button"
                    onClick={() => handleAiPreferenceChange({ autoSaveChat: !autoSaveChat })}
                    className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                      autoSaveChat ? "bg-purple-600" : "bg-slate-300 dark:bg-slate-700"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 bg-white rounded-full transition-transform shadow-sm ${
                        autoSaveChat ? "translate-x-5" : "translate-x-0"
                      }`}
                    />
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Automatically record mentor advice for every startup analysis thread.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Notifications Section */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6 transition-colors">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Bell className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            Notification Settings
          </h2>

          <div className="space-y-4">
            {/* Product Updates */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50/50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">Product Updates</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Receive feature announcements and roadmap progress summaries.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleNotificationToggle("productUpdates")}
                className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                  productUpdates ? "bg-purple-600" : "bg-slate-300 dark:bg-slate-700"
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full transition-transform shadow-sm ${
                    productUpdates ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Analysis Completed */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50/50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">Analysis Completed Notifications</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Receive alerts when new venture scorecard analysis reports finish.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleNotificationToggle("analysisCompleted")}
                className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                  analysisCompleted ? "bg-purple-600" : "bg-slate-300 dark:bg-slate-700"
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full transition-transform shadow-sm ${
                    analysisCompleted ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Weekly Startup Tips */}
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50/50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">Weekly Startup Tips</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Receive curated weekly venture strategies and validation guides.
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleNotificationToggle("weeklyTips")}
                className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
                  weeklyTips ? "bg-purple-600" : "bg-slate-300 dark:bg-slate-700"
                }`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full transition-transform shadow-sm ${
                    weeklyTips ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* 5. Privacy & Security Section */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6 transition-colors">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Lock className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            Privacy & Security
          </h2>

          <div className="flex flex-wrap items-center gap-4">
            {/* Change Password */}
            <button
              type="button"
              onClick={() => {
                setPassError(null);
                setPasswordModalOpen(true);
              }}
              className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800 hover:bg-purple-50 text-slate-700 dark:text-slate-200 hover:text-purple-700 font-bold rounded-xl text-xs border border-slate-200 dark:border-slate-700 transition-all flex items-center gap-2"
            >
              <Lock className="w-4 h-4 text-purple-600" />
              Change Password
            </button>

            {/* Sign Out */}
            <form action={logoutAction}>
              <button
                type="submit"
                className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-200 font-bold rounded-xl text-xs border border-slate-200 dark:border-slate-700 transition-all flex items-center gap-2"
              >
                <LogOut className="w-4 h-4 text-slate-500" />
                Sign Out
              </button>
            </form>

            {/* Delete Account */}
            <button
              type="button"
              onClick={() => setDeleteModalOpen(true)}
              className="px-4 py-2.5 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-700 dark:text-rose-300 font-bold rounded-xl text-xs border border-rose-200 dark:border-rose-900/50 transition-all flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4 text-rose-600" />
              Delete Account
            </button>
          </div>
        </div>

        {/* 6. About Section */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4 transition-colors">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Info className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            About System
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">Application</span>
              <p className="text-sm font-extrabold text-slate-900 dark:text-white">AI Startup Validator</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">Version</span>
              <p className="text-sm font-extrabold text-slate-900 dark:text-white">v2.4.0 (2026 Production)</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">Core Architecture</span>
              <p className="text-sm font-extrabold text-purple-700 dark:text-purple-400">AI Venture Engine</p>
            </div>
          </div>
        </div>
      </div>

      {/* Password Change Modal */}
      {passwordModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Change Account Password</h3>

            {passError && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{passError}</span>
              </div>
            )}

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  name="currentPassword"
                  required
                  placeholder="••••••••"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  name="newPassword"
                  required
                  placeholder="••••••••"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPasswordModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 text-white text-xs font-bold rounded-xl shadow-md hover:bg-purple-700"
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
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-md w-full border border-rose-200 dark:border-rose-900/50 shadow-xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <ShieldAlert className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">Delete Account</h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Are you sure you want to delete your account? All your startup analyses, execution roadmaps, settings, and chat history will be permanently deleted from the database.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={async () => {
                  setDeleteModalOpen(false);
                  const res = await deleteAccountAction();
                  if (res && res.success) {
                    window.location.href = "/";
                  }
                }}
                className="px-4 py-2 bg-rose-600 text-white text-xs font-bold rounded-xl shadow-md hover:bg-rose-700"
              >
                Confirm Permanent Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
