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

  // Parse competitors or construct real/similar market competitor profiles
  const rawCompetitorList = currentAnalysis?.competitors
    ? currentAnalysis.competitors.split(/[,;\n]+/).map((s) => s.trim()).filter(Boolean)
    : [];

  const competitorProfiles = rawCompetitorList.length > 0
    ? rawCompetitorList.map((comp, idx) => ({
        name: comp,
        category: idx % 2 === 0 ? "Incumbent Platform" : "Niche Alternative",
        description: `Established market alternative competing in ${currentAnalysis.country} targeting ${currentAnalysis.audience}. (Estimated)`,
        targetAudience: currentAnalysis.audience,
        strengths: ["Established brand awareness & customer trust", "Extensive feature set", "Existing enterprise distribution networks"],
        weaknesses: ["Higher legacy pricing structure", "Complex onboarding setup", "Slower feature release velocity"],
        pricingModel: "Enterprise Tiered Subscription (Estimated)",
        differentiation: `Position ${currentAnalysis.startupName} with specialized ${currentAnalysis.businessModel} model and faster onboarding.`,
        marketPosition: idx === 0 ? "Market Leader" : "Challenger",
        keyFeatures: "Core legacy suite, manual workflows, standard reporting",
      }))
    : [
        {
          name: "Legacy Incumbent Systems",
          category: "Traditional Software",
          description: "Traditional manual/legacy enterprise software solutions currently used by target customers.",
          targetAudience: currentAnalysis?.audience || "Enterprise Customers",
          strengths: ["Established customer base", "High switching costs", "Broad legacy integrations"],
          weaknesses: ["Slow user experience", "Lack of modern AI automation", "Expensive per-seat licensing"],
          pricingModel: "$500+ / month / license (Estimated)",
          differentiation: `Deliver 10x faster AI workflows at lower initial customer friction.`,
          marketPosition: "Incumbent Leader",
          keyFeatures: "Legacy database storage, manual data entry, traditional PDF exports",
        },
        {
          name: "Generic Point Solutions",
          category: "Alternative Tools",
          description: "Fragmented point tools and spreadsheet workflows used as makeshift alternatives.",
          targetAudience: currentAnalysis?.audience || "SMB Users",
          strengths: ["Low initial barrier to entry", "Flexible manual customization"],
          weaknesses: ["Prone to human error", "No unified workflow automation", "High ongoing maintenance effort"],
          pricingModel: "Free / Open-Source / Manual labor cost",
          differentiation: `Unified automated end-to-end platform tailored specifically for ${currentAnalysis?.startupName || "this market"}.`,
          marketPosition: "Niche Fragmented",
          keyFeatures: "Spreadsheet templates, ad-hoc scripts, manual tracking",
        },
      ];

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
    <div className="min-h-screen bg-slate-50/50 py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Banner */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-semibold border border-purple-100 mb-2">
              <Trophy className="w-3.5 h-3.5 text-purple-600" />
              <span>Competitive Landscape Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Competitor Insights & Positioning
            </h1>
            <p className="text-xs text-slate-500">
              Benchmark market rivals, identify strategic gaps, and build defensible competitive moats
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
              Run your first startup analysis to generate real-time competitor profiles, market gap matrices, and moat strategies.
            </p>
            <Link
              href="/dashboard/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white font-bold rounded-xl text-xs"
            >
              <Plus className="w-4 h-4" />
              Analyze Startup Now
            </Link>
          </div>
        ) : (
          <>
            {/* Startup Selection Bar & Search Filter Controls */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Context Startup:</span>
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
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                {/* Search Bar */}
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search competitors or features..."
                    className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                </div>

                {/* Filter Selector */}
                <div className="relative">
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="appearance-none bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 pr-8 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-600 cursor-pointer"
                  >
                    <option value="all">All Categories</option>
                    <option value="incumbent">Incumbent Platforms</option>
                    <option value="niche">Niche Alternatives</option>
                    <option value="traditional">Traditional Software</option>
                  </select>
                  <Filter className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Competitor Profiles Cards Grid */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-purple-600" />
                  Competitor Profiles for &ldquo;{currentAnalysis.startupName}&rdquo;
                </h2>
                <span className="text-xs text-slate-400 italic">* All market values are AI-estimated data</span>
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
                      <span className="font-bold text-purple-950 block mb-0.5">Differentiation Opportunity:</span>
                      <p className="text-slate-700">{comp.differentiation}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Comparison Table */}
            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden space-y-0">
              <div className="p-6 border-b border-slate-100">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Crosshair className="w-5 h-5 text-purple-600" />
                  Competitor Feature & Pricing Matrix
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">Side-by-side comparison across features, pricing, positioning, and weaknesses</p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      <th className="py-3.5 px-6">Competitor</th>
                      <th className="py-3.5 px-6">Est. Pricing</th>
                      <th className="py-3.5 px-6">Key Features</th>
                      <th className="py-3.5 px-6">Market Position</th>
                      <th className="py-3.5 px-6">Target Audience</th>
                      <th className="py-3.5 px-6">Key Weakness</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {/* Startup Entry First */}
                    <tr className="bg-purple-50/30 font-bold border-l-4 border-l-purple-600">
                      <td className="py-4 px-6 text-purple-950 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-purple-600 shrink-0" />
                        <span>{currentAnalysis.startupName} (Your Startup)</span>
                      </td>
                      <td className="py-4 px-6 text-purple-900">{currentAnalysis.businessModel}</td>
                      <td className="py-4 px-6 text-slate-800">{currentAnalysis.solution.slice(0, 50)}...</td>
                      <td className="py-4 px-6">
                        <ScoreBadge score={currentAnalysis.overallScore} size="sm" showLabel />
                      </td>
                      <td className="py-4 px-6 text-slate-800">{currentAnalysis.audience}</td>
                      <td className="py-4 px-6 text-slate-500">Early market awareness</td>
                    </tr>

                    {/* Competitors List */}
                    {competitorProfiles.map((comp, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-4 px-6 font-bold text-slate-900">{comp.name}</td>
                        <td className="py-4 px-6 text-slate-600">{comp.pricingModel}</td>
                        <td className="py-4 px-6 text-slate-600">{comp.keyFeatures}</td>
                        <td className="py-4 px-6 text-slate-600">{comp.marketPosition}</td>
                        <td className="py-4 px-6 text-slate-600">{comp.targetAudience}</td>
                        <td className="py-4 px-6 text-rose-600 font-medium">{comp.weaknesses[0]}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Market Gap Analysis Section */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-amber-500" />
                  Market Gap Analysis
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">Unmet customer pain points and unique positioning opportunities</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-5 rounded-2xl bg-amber-50/40 border border-amber-100 space-y-3">
                  <h3 className="text-xs font-bold text-amber-950 uppercase tracking-wider flex items-center gap-2">
                    <Target className="w-4 h-4 text-amber-600" /> Opportunities Competitors Missed
                  </h3>
                  <p className="text-xs text-slate-700 leading-relaxed font-medium">
                    Incumbents focus heavily on broad general features, leaving {currentAnalysis.audience} underserved with complex workflows.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-purple-50/40 border border-purple-100 space-y-3">
                  <h3 className="text-xs font-bold text-purple-950 uppercase tracking-wider flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-600" /> Features Competitors Don&apos;t Have
                  </h3>
                  <p className="text-xs text-slate-700 leading-relaxed font-medium">
                    Instant AI automated insights, frictionless onboarding in &lt; 60 seconds, and modern value-based pricing.
                  </p>
                </div>
              </div>
            </div>

            {/* AI Competitive Strategy Section */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
              <div className="border-b border-slate-100 pb-4">
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Award className="w-5 h-5 text-purple-600" />
                  AI Competitive Strategy Playbook
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">Tactical positioning questions answered for {currentAnalysis.startupName}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-2">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Why will users choose {currentAnalysis.startupName}?
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Users choose {currentAnalysis.startupName} because it solves &ldquo;{currentAnalysis.problem.slice(0, 70)}...&rdquo; 10x faster with lower setup friction than legacy tools.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-2">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    How should it compete?
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Compete on speed, specialization for {currentAnalysis.audience}, and transparent {currentAnalysis.businessModel} pricing without hidden lock-in contracts.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-2">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Biggest Market Threats
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Fast feature copying by established incumbents. Counter this with rapid customer iteration and high-retention onboarding.
                  </p>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-2">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Suggested Competitive Moat
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Build a data network effect moat: proprietary AI analysis models and integration workflows that become more valuable as usage grows.
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
