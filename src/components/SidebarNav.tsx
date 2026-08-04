"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  PlusCircle,
  Map,
  History,
  Bot,
  HeartPulse,
  Trophy,
  FileText,
  Settings,
  Menu,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Sparkles,
  X,
  Layers,
} from "lucide-react";
import { logoutAction } from "@/app/actions/authActions";
import { UserSession } from "@/lib/types";

interface SidebarNavProps {
  user?: UserSession | null;
  children: React.ReactNode;
}

const MENU_GROUPS = [
  {
    title: "MAIN WORKSPACE",
    items: [
      { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
      { label: "New Analysis", icon: PlusCircle, href: "/dashboard/new" },
      { label: "Execution Roadmap", icon: Map, href: "/dashboard/roadmap" },
      { label: "Analysis History", icon: History, href: "/dashboard/history" },
    ],
  },
  {
    title: "INTELLIGENCE & AI",
    items: [
      { label: "AI Chatbot", icon: Bot, href: "/dashboard/chat", badge: "AI" },
      { label: "Startup Health", icon: HeartPulse, href: "/dashboard/health" },
      { label: "Competitor Insights", icon: Trophy, href: "/dashboard/competitors" },
      { label: "Reports", icon: FileText, href: "/dashboard/reports" },
    ],
  },
  {
    title: "SYSTEM",
    items: [{ label: "Settings", icon: Settings, href: "/dashboard/settings" }],
  },
];

export function SidebarNav({ user, children }: SidebarNavProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("sidebar_collapsed");
    if (saved === "true") {
      setCollapsed(true);
    }
  }, []);

  const toggleCollapsed = () => {
    const nextState = !collapsed;
    setCollapsed(nextState);
    localStorage.setItem("sidebar_collapsed", String(nextState));
  };

  return (
    <div className="min-h-screen flex bg-slate-50/60 font-sans">
      {/* Mobile Drawer Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 md:hidden transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Fixed Desktop & Mobile Slide-Out Sidebar */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 bg-white border-r border-slate-200/80 flex flex-col justify-between transition-all duration-300 ease-out shadow-xs ${
          collapsed ? "w-20" : "w-64"
        } ${
          mobileOpen ? "translate-x-0 w-64" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Top App Logo & Collapsible Header */}
        <div className="p-4 flex items-center justify-between border-b border-slate-100/80 h-16">
          {!collapsed ? (
            <Link href="/dashboard" className="flex items-center gap-3 overflow-hidden group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shrink-0 shadow-md shadow-purple-600/30 group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-extrabold tracking-tight text-slate-900 leading-none">
                  Startup<span className="text-purple-600">Analyzer</span>
                </span>
                <span className="text-[10px] font-semibold text-slate-400 tracking-wider uppercase mt-1">
                  AI Venture Engine
                </span>
              </div>
            </Link>
          ) : (
            <Link href="/dashboard" className="mx-auto group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-purple-600/30 group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
            </Link>
          )}

          {/* Desktop Toggle Button (☰ / Chevron) */}
          <button
            onClick={toggleCollapsed}
            className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-purple-600 hover:bg-purple-50 transition-colors"
            title={collapsed ? "Expand Sidebar (☰)" : "Collapse Sidebar (☰)"}
          >
            {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>

          {/* Mobile Close Button */}
          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden p-1.5 text-slate-400 hover:text-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items with Section Dividers */}
        <div className="flex-1 px-3 py-4 space-y-6 overflow-y-auto no-scrollbar">
          {MENU_GROUPS.map((group, groupIdx) => (
            <div key={groupIdx} className="space-y-1.5">
              {!collapsed && (
                <p className="px-3 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2">
                  {group.title}
                </p>
              )}

              {collapsed && groupIdx > 0 && <div className="my-3 border-t border-slate-100" />}

              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`group relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                      isActive
                        ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/25 font-bold"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 hover:translate-x-0.5"
                    } ${collapsed ? "justify-center px-0" : ""}`}
                  >
                    <Icon
                      className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                        isActive ? "text-white" : "text-slate-500 group-hover:text-purple-600"
                      }`}
                    />

                    {!collapsed && <span className="truncate flex-1">{item.label}</span>}

                    {!collapsed && item.badge && (
                      <span
                        className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase ${
                          isActive
                            ? "bg-white/20 text-white"
                            : "bg-purple-50 text-purple-700 border border-purple-200"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}

                    {/* Sleek Floating Tooltip on Collapsed Mode */}
                    {collapsed && (
                      <div className="absolute left-full ml-3 px-3 py-1.5 bg-slate-900 text-white text-xs font-bold rounded-lg shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 z-50 flex items-center gap-1.5">
                        <span>{item.label}</span>
                        {item.badge && (
                          <span className="px-1 bg-purple-500 text-[9px] rounded font-extrabold uppercase">
                            {item.badge}
                          </span>
                        )}
                      </div>
                    )}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>

        {/* Bottom User Profile Section */}
        <div className="p-3 border-t border-slate-100/80 bg-white">
          {user ? (
            <div className={`flex items-center gap-3 ${collapsed ? "justify-center" : "justify-between"}`}>
              {!collapsed ? (
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-sm">
                    {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-bold text-slate-900 truncate">{user.name || "Founder"}</p>
                    <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
                  </div>
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-bold flex items-center justify-center text-xs shadow-sm">
                  {user.name ? user.name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                </div>
              )}

              <form action={logoutAction}>
                <button
                  type="submit"
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </form>
            </div>
          ) : (
            <Link
              href="/login"
              className="w-full py-2 bg-purple-600 text-white text-xs font-bold rounded-lg text-center block"
            >
              Sign In
            </Link>
          )}
        </div>
      </aside>

      {/* Main Content Viewport */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          collapsed ? "md:pl-20" : "md:pl-64"
        }`}
      >
        {/* Mobile Header Bar */}
        <header className="md:hidden sticky top-0 z-30 h-14 bg-white border-b border-slate-100 px-4 flex items-center justify-between">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 text-slate-600 hover:text-slate-900"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span className="font-extrabold text-sm text-slate-900">StartupAnalyzer</span>
          </div>
          <div className="w-6" />
        </header>

        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
