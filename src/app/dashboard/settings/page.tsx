import React from "react";
import { redirect } from "next/navigation";
import { Settings, User, Key, Shield, Sparkles, LogOut } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { logoutAction } from "@/app/actions/authActions";

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-slate-50/50 py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-semibold border border-purple-100 mb-2">
              <Settings className="w-3.5 h-3.5 text-purple-600" />
              <span>Account Preferences</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Settings & Workspace
            </h1>
            <p className="text-xs text-slate-500">
              Manage your founder profile, security, and AI mentor configurations
            </p>
          </div>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <User className="w-5 h-5 text-purple-600" />
            Founder Profile
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                Full Name
              </label>
              <input
                type="text"
                disabled
                value={user.name || "Founder User"}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <input
                type="email"
                disabled
                value={user.email}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* AI Integration Settings */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Key className="w-5 h-5 text-purple-600" />
            OpenAI Engine Status
          </h2>

          <div className="p-4 bg-purple-50/70 border border-purple-100 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="w-5 h-5 text-purple-600 shrink-0" />
              <div>
                <p className="text-xs font-bold text-purple-950">Active AI Model: GPT-4o-mini & Fallback Engine</p>
                <p className="text-[11px] text-purple-800">
                  {process.env.OPENAI_API_KEY ? "Live OpenAI API Key Connected" : "Operating with Built-in Venture Intelligence Engine"}
                </p>
              </div>
            </div>
            <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded-full border border-emerald-200">
              Online
            </span>
          </div>
        </div>

        {/* Security & Logout */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Shield className="w-5 h-5 text-purple-600" />
            Session Security
          </h2>

          <form action={logoutAction}>
            <button
              type="submit"
              className="px-6 py-3 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-xl text-xs border border-rose-200 transition-colors flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Sign Out of Account
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
