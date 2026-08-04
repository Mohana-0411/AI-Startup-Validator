"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Search,
  Trash2,
  Eye,
  ArrowLeft,
  Plus,
  History,
  Grid,
  List,
  Sparkles,
} from "lucide-react";
import { ScoreBadge } from "@/components/ScoreBadge";
import { deleteAnalysisAction } from "@/app/actions/analysisActions";

interface FormattedAnalysis {
  id: string;
  startupName: string;
  idea: string;
  problem: string;
  audience: string;
  country: string;
  businessModel: string;
  overallScore: number;
  createdAt: string;
}

interface HistoryClientProps {
  initialAnalyses: FormattedAnalysis[];
}

export function HistoryClient({ initialAnalyses }: HistoryClientProps) {
  const [analyses, setAnalyses] = useState<FormattedAnalysis[]>(initialAnalyses);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "table">("table");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filteredAnalyses = analyses.filter((item) => {
    const query = searchQuery.toLowerCase();
    return (
      item.startupName.toLowerCase().includes(query) ||
      item.idea.toLowerCase().includes(query) ||
      item.businessModel.toLowerCase().includes(query) ||
      item.country.toLowerCase().includes(query)
    );
  });

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this startup analysis?")) return;
    setDeletingId(id);

    const res = await deleteAnalysisAction(id);
    if (res.success) {
      setAnalyses((prev) => prev.filter((a) => a.id !== id));
    } else {
      alert("Failed to delete analysis. Please try again.");
    }
    setDeletingId(null);
  }

  return (
    <div className="min-h-screen bg-slate-50/50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Back Link */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        {/* Page Header */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-semibold border border-purple-100 mb-2">
              <History className="w-3.5 h-3.5" />
              <span>Analysis Portfolio</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Analysis History
            </h1>
            <p className="text-xs text-slate-500">
              Browse, search, view, or manage your previous AI startup evaluations ({analyses.length} total)
            </p>
          </div>

          <Link
            href="/dashboard/new"
            className="px-5 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-md shadow-purple-600/20 text-xs transition-all flex items-center justify-center gap-2 shrink-0"
          >
            <Plus className="w-4 h-4" />
            New Analysis
          </Link>
        </div>

        {/* Search Bar & View Toggles */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Search Input */}
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by startup name, idea, or market..."
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-600 transition-all shadow-sm"
            />
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 self-end sm:self-auto">
            <button
              onClick={() => setViewMode("table")}
              className={`p-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                viewMode === "table"
                  ? "bg-purple-50 text-purple-700"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <List className="w-4 h-4" />
              Table
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                viewMode === "grid"
                  ? "bg-purple-50 text-purple-700"
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              <Grid className="w-4 h-4" />
              Grid
            </button>
          </div>
        </div>

        {/* Results Count / Empty state */}
        {filteredAnalyses.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 border border-slate-200 text-center space-y-3">
            <Sparkles className="w-8 h-8 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No matching analyses found</h3>
            <p className="text-xs text-slate-400">
              {searchQuery ? "Try refining your search terms" : "You haven't generated any analyses yet."}
            </p>
          </div>
        ) : viewMode === "table" ? (
          /* Table View */
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    <th className="py-3.5 px-6">Startup</th>
                    <th className="py-3.5 px-6">One-line Idea</th>
                    <th className="py-3.5 px-6">Market / Region</th>
                    <th className="py-3.5 px-6">Score</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredAnalyses.map((item) => (
                    <tr key={item.id} className="hover:bg-purple-50/20 transition-colors">
                      <td className="py-4 px-6 font-bold text-slate-900">
                        <Link href={`/dashboard/analysis/${item.id}`} className="hover:text-purple-600">
                          {item.startupName}
                        </Link>
                      </td>
                      <td className="py-4 px-6 text-slate-600 max-w-xs truncate">
                        {item.idea}
                      </td>
                      <td className="py-4 px-6 text-slate-500">
                        {item.country} • {item.businessModel}
                      </td>
                      <td className="py-4 px-6">
                        <ScoreBadge score={item.overallScore} size="sm" />
                      </td>
                      <td className="py-4 px-6 text-right space-x-2">
                        <Link
                          href={`/dashboard/analysis/${item.id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-lg text-xs font-semibold transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View
                        </Link>
                        <button
                          onClick={() => handleDelete(item.id)}
                          disabled={deletingId === item.id}
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Grid View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAnalyses.map((item) => (
              <div
                key={item.id}
                className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="text-lg font-bold text-slate-900">{item.startupName}</h3>
                    <ScoreBadge score={item.overallScore} size="sm" />
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4">
                    {item.idea}
                  </p>
                  <div className="text-[11px] text-slate-400 space-y-1">
                    <p>Market: {item.country}</p>
                    <p>Model: {item.businessModel}</p>
                    <p>Analyzed: {new Date(item.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <Link
                    href={`/dashboard/analysis/${item.id}`}
                    className="px-3.5 py-1.5 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    View Analysis
                  </Link>
                  <button
                    onClick={() => handleDelete(item.id)}
                    disabled={deletingId === item.id}
                    className="p-2 text-slate-400 hover:text-rose-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
