"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Trophy,
  Search,
  Plus,
  ChevronDown,
  Sparkles,
  ShieldAlert,
  Target,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Crosshair,
  Award,
  Filter,
  Activity,
} from "lucide-react";
import { ScoreBadge } from "@/components/ScoreBadge";
import { AnalysisResultJSON } from "@/lib/types";

interface AnalysisItem {
  id: string;
  startupName: string;
  idea: string;
  problem: string;
  solution: string;
  audience: string;
  country: string;
  businessModel: string;
  competitors?: string | null;
  overallScore: number;
  analysisResult: string;
}

export function CompetitorView({ analyses }: { analyses: AnalysisItem[] }) {
  const [selectedId, setSelectedId] = useState<string>(analyses.length > 0 ? analyses[0].id : "");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const currentAnalysis = analyses.find((a) => a.id === selectedId) || analyses[0];

  let result: AnalysisResultJSON | null = null;
  if (currentAnalysis) {
    try {
      result = JSON.parse(currentAnalysis.analysisResult);
    } catch {
      result = null;
    }
  }

  const stage = result?.startupLifecycle?.currentStage || "Validation Stage";
  const vContext = result?.ventureContext;
  const domainCategory = vContext?.domainCategory || "General Industry";

  // Parse explicit user competitors or map directly from VentureContext
  const rawCompetitorList = currentAnalysis?.competitors
    ? currentAnalysis.competitors.split(/[,;\n]+/).map((s) => s.trim()).filter(Boolean)
    : [];

  let competitorProfiles: {
    name: string;
    category: string;
    description: string;
    targetAudience: string;
    strengths: string[];
    weaknesses: string[];
    pricingModel: string;
    differentiation: string;
    marketPosition: string;
    keyFeatures: string;
  }[] = [];

  if (rawCompetitorList.length > 0) {
    competitorProfiles = rawCompetitorList.map((comp, idx) => ({
      name: comp,
      category: idx % 2 === 0 ? "Local / Regional Competitor" : "Niche Alternative",
      description: `Established market alternative competing in ${currentAnalysis.country} targeting ${currentAnalysis.audience}.`,
      targetAudience: currentAnalysis.audience,
      strengths: ["Established customer trust & location presence", "Known local brand recognition", "Existing customer base"],
      weaknesses: ["Higher pricing structure", "Inconsistent customer service", "Slower operational updates"],
      pricingModel: "Standard Market Pricing",
      differentiation: `Position ${currentAnalysis.startupName} with specialized ${currentAnalysis.businessModel} model and higher quality service.`,
      marketPosition: idx === 0 ? "Market Leader" : "Challenger",
      keyFeatures: "Core standard offering, traditional customer service",
    }));
  } else if (vContext?.competitorTypes && vContext.competitorTypes.length > 0) {
    competitorProfiles = vContext.competitorTypes.map((c) => ({
      name: c.name,
      category: c.category,
      description: c.description,
      targetAudience: currentAnalysis?.audience || vContext.customerSegment || "Target Segment",
      strengths: c.strengths,
      weaknesses: c.weaknesses,
      pricingModel: c.pricingModel,
      differentiation: c.differentiation,
      marketPosition: c.marketPosition,
      keyFeatures: "Core operational offering",
    }));
  } else {
    competitorProfiles = [
      {
        name: "Established Incumbent Outlets",
        category: "Market Leaders",
        description: `Established business providers serving ${currentAnalysis?.audience || "target customers"} in ${currentAnalysis?.country || "the market"}.`,
        targetAudience: currentAnalysis?.audience || "Target Customers",
        strengths: ["Brand awareness", "Established local presence"],
        weaknesses: ["Higher price point", "Slower customer adaptation"],
        pricingModel: "Standard Market Rates",
        differentiation: `Position ${currentAnalysis?.startupName || "this venture"} with superior service and pricing transparency.`,
        marketPosition: "Market Leader",
        keyFeatures: "Standard market offering",
      },
    ];
  }

  // Search & Filter filter logic
  const filteredCompetitors = competitorProfiles.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || c.category.toLowerCase().includes(categoryFilter.toLowerCase());
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-slate-50/50 py-8 px-4 sm:px-6 lg:px-8 space-y-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Banner */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-semibold border border-purple-100 mb-2">
              <Trophy className="w-3.5 h-3.5 text-purple-600" />
              <span>Competitor Intelligence Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Competitor Insights & Positioning
            </h1>
            <p className="text-xs text-slate-500">
              Discover competitors relevant to your specific domain ({domainCategory}) and business type.
            </p>
          </div>

          <Link
            href="/dashboard/new"
            className="px-5 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-md text-xs transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Analyze New Idea
          </Link>
        </div>

        {analyses.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center max-w-md mx-auto space-y-4 border border-slate-200">
            <Trophy className="w-12 h-12 text-purple-600 mx-auto" />
            <h3 className="text-lg font-bold text-slate-900">No Competitor Analysis Available</h3>
            <p className="text-xs text-slate-500">
              Run your first analysis to generate real-time competitor profiles and positioning.
            </p>
            <Link
              href="/dashboard/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white font-bold rounded-xl text-xs"
            >
              <Plus className="w-4 h-4" />
              Analyze Business Now
            </Link>
          </div>
        ) : (
          <>
            {/* Context Selection Bar */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Business:</span>
                <div className="relative">
                  <select
                    value={selectedId}
                    onChange={(e) => setSelectedId(e.target.value)}
                    className="appearance-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 pr-8 text-xs font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600 cursor-pointer"
                  >
                    {analyses.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.startupName} ({a.overallScore}/100)
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>

                <span className="px-3 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-extrabold rounded-xl flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-indigo-600" />
                  Stage: {stage}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search competitors..."
                    className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                </div>
              </div>
            </div>

            {/* Competitor Profiles Cards Grid */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-purple-600" />
                  Domain Competitor Profiles for &ldquo;{currentAnalysis.startupName}&rdquo; ({domainCategory})
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredCompetitors.map((comp, idx) => (
                  <div
                    key={idx}
                    className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-sm space-y-5 flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-xl font-extrabold text-slate-900">{comp.name}</h3>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                              {comp.category}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-1">{comp.description}</p>
                        </div>
                        <span className="px-2.5 py-1 rounded text-xs font-extrabold bg-purple-50 text-purple-700 border border-purple-200 shrink-0">
                          {comp.marketPosition}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                          <span className="font-bold text-slate-400 uppercase text-[10px] block mb-1">Target Audience</span>
                          <span className="font-semibold text-slate-800">{comp.targetAudience}</span>
                        </div>
                        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                          <span className="font-bold text-slate-400 uppercase text-[10px] block mb-1">Est. Pricing Model</span>
                          <span className="font-semibold text-slate-800">{comp.pricingModel}</span>
                        </div>
                      </div>

                      {/* Strengths & Weaknesses */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                        <div className="space-y-1.5">
                          <span className="text-[11px] font-bold text-emerald-800 uppercase flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Strengths
                          </span>
                          <ul className="space-y-1 text-xs text-slate-700">
                            {comp.strengths.map((s, i) => (
                              <li key={i} className="flex items-center gap-1.5">
                                <span className="w-1 h-1 rounded-full bg-emerald-500" />
                                <span>{s}</span>
                              </li>
                            ))}
                          </ul>
                        </div>

                        <div className="space-y-1.5">
                          <span className="text-[11px] font-bold text-rose-800 uppercase flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5 text-rose-600" /> Weaknesses
                          </span>
                          <ul className="space-y-1 text-xs text-slate-700">
                            {comp.weaknesses.map((w, i) => (
                              <li key={i} className="flex items-center gap-1.5">
                                <span className="w-1 h-1 rounded-full bg-rose-500" />
                                <span>{w}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="p-3 bg-purple-50/50 rounded-xl border border-purple-100 text-xs">
                      <span className="font-bold text-purple-950 block mb-0.5">Differentiation Strategy:</span>
                      <p className="text-slate-700">{comp.differentiation}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
