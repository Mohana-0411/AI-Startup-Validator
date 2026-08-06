import React from "react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import {
  ArrowLeft,
  Sparkles,
  TrendingUp,
  ShieldAlert,
  Target,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Crosshair,
  Building2,
  Globe2,
  DollarSign,
  Users,
  Dna,
  Check,
  Zap,
  Tag,
  Clock,
  Briefcase,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { ScoreRing } from "@/components/ScoreRing";
import { ScoreBadge } from "@/components/ScoreBadge";
import { StartupMentorChat } from "@/components/StartupMentorChat";
import { AnalysisResultJSON } from "@/lib/types";

interface PageProps {
  params: {
    id: string;
  };
}

export default async function AnalysisResultsPage({ params }: PageProps) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const record = await prisma.analysis.findUnique({
    where: { id: params.id },
  });

  if (!record) {
    notFound();
  }

  const result: AnalysisResultJSON = JSON.parse(record.analysisResult);
  const overallScore = record.overallScore;
  const classification = result.businessClassification;
  const dna = result.businessDNA;

  return (
    <div className="min-h-screen bg-slate-50/50 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Navigation Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Link>
        </div>

        {/* Top Summary Card */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-sm relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-8">
            <div className="space-y-4 max-w-2xl text-center md:text-left">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
                <span className="px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-semibold border border-purple-100 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  VC Validation Scorecard
                </span>
                <span className="text-xs text-slate-400">
                  {new Date(record.createdAt).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
                {record.startupName}
              </h1>

              <p className="text-base text-slate-600 font-medium italic">
                &ldquo;{record.idea}&rdquo;
              </p>

              {/* Startup Metadata Pills */}
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-xs text-slate-500 pt-2">
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-lg">
                  <Users className="w-3.5 h-3.5 text-purple-600" />
                  {record.audience}
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-lg">
                  <Globe2 className="w-3.5 h-3.5 text-purple-600" />
                  {record.country}
                </span>
                <span className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 rounded-lg">
                  <DollarSign className="w-3.5 h-3.5 text-purple-600" />
                  {record.businessModel}
                </span>
              </div>
            </div>

            {/* Radial Gauge Score Indicator */}
            <div className="flex flex-col items-center justify-center bg-slate-50 p-6 rounded-2xl border border-slate-100 min-w-[200px] shrink-0">
              <ScoreRing score={overallScore} size={130} strokeWidth={11} />
              <div className="mt-3 text-center">
                <ScoreBadge score={overallScore} size="md" showLabel />
              </div>
            </div>
          </div>

          {/* Investor Verdict Callout Banner */}
          {result.investorVerdict && (
            <div className="mt-8 p-5 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-100 rounded-xl">
              <p className="text-xs font-bold uppercase tracking-wider text-purple-900 mb-1 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-purple-600" />
                VC Partner Executive Summary
              </p>
              <p className="text-sm text-purple-950 font-medium leading-relaxed">
                {result.investorVerdict}
              </p>
            </div>
          )}
        </div>

        {/* Business DNA Central Intelligence Card */}
        {dna && (
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-purple-200/80 shadow-md space-y-6">
            <div className="border-b border-purple-100 pb-4 flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-extrabold border border-purple-200">
                  <Dna className="w-4 h-4 text-purple-700 animate-pulse" />
                  <span>Business DNA • Single Source of Truth</span>
                </div>
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                  Business Profile & Intelligence Architecture
                </h2>
                <p className="text-xs text-slate-500">
                  Central DNA profile consumed by AI Mentor, Roadmap, Health Monitor, and Competitor Engine
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-slate-900 text-white text-xs font-extrabold rounded-xl">
                  {dna.industry}
                </span>
                <span className="px-3 py-1 bg-purple-50 text-purple-700 border border-purple-200 text-xs font-extrabold rounded-xl">
                  {dna.businessType}
                </span>
              </div>
            </div>

            {/* Grid 1: Industry & Operational DNA */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">Industry</span>
                <p className="text-xs font-extrabold text-slate-900 truncate">{dna.industry}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">Business Category</span>
                <p className="text-xs font-extrabold text-slate-900 truncate">{dna.businessCategory}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">Revenue Model</span>
                <p className="text-xs font-extrabold text-purple-700 truncate">{dna.revenueModel}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">Market Scope</span>
                <p className="text-xs font-extrabold text-slate-900">{dna.marketScope}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">Investment Level</span>
                <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                  {dna.investmentLevel}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/60 space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">Scalability</span>
                <span className="inline-block px-2 py-0.5 rounded text-[11px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                  {dna.scalability}
                </span>
              </div>
            </div>

            {/* Grid 2: Operational Parameters & Financial Projections */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              {/* USP & Key Advantages */}
              <div className="p-4 rounded-xl bg-purple-50/50 border border-purple-100 space-y-2">
                <span className="text-[11px] font-bold text-purple-950 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" /> Unique Selling Proposition (USP)
                </span>
                <p className="text-xs text-slate-800 font-semibold leading-relaxed">&ldquo;{dna.uniqueSellingProposition}&rdquo;</p>
              </div>

              {/* Required Licenses */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 space-y-2">
                <span className="text-[11px] font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-purple-600" /> Required Licenses & Compliance
                </span>
                <ul className="space-y-1 text-xs text-slate-700 font-medium">
                  {dna.requiredLicenses.map((lic, i) => (
                    <li key={i} className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-600" />
                      <span>{lic}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Execution Timelines */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 space-y-2">
                <span className="text-[11px] font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-purple-600" /> Execution Timelines & Team
                </span>
                <div className="space-y-1 text-xs text-slate-700">
                  <p><span className="font-bold">Initial Est. Investment:</span> {dna.estimatedInitialInvestment}</p>
                  <p><span className="font-bold">Time to Launch:</span> {dna.estimatedTimeToLaunch}</p>
                  <p><span className="font-bold">Team Size:</span> {dna.recommendedTeamSize}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 5 Core Metric Cards */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <BarChartIcon className="w-5 h-5 text-purple-600" />
            Core Venture Metrics Breakdown
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* 1. Market Potential */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Market Potential</h3>
                  <ScoreBadge score={result.marketPotential.score} size="sm" />
                </div>
                <p className="text-sm font-semibold text-slate-800 mb-2">{result.marketPotential.summary}</p>
                <p className="text-xs text-slate-500 leading-relaxed">{result.marketPotential.details}</p>
              </div>
            </div>

            {/* 2. Problem Validation */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Problem Validation</h3>
                  <ScoreBadge score={result.problemValidation.score} size="sm" />
                </div>
                <p className="text-sm font-semibold text-slate-800 mb-2">{result.problemValidation.summary}</p>
                <p className="text-xs text-slate-500 leading-relaxed">{result.problemValidation.details}</p>
              </div>
            </div>

            {/* 3. Solution Quality */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Solution Quality</h3>
                  <ScoreBadge score={result.solutionQuality.score} size="sm" />
                </div>
                <p className="text-sm font-semibold text-slate-800 mb-2">{result.solutionQuality.summary}</p>
                <p className="text-xs text-slate-500 leading-relaxed">{result.solutionQuality.details}</p>
              </div>
            </div>

            {/* 4. Competition Level */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Competition Level</h3>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-100 text-slate-700 border">
                      {result.competitionLevel.level} Rivalry
                    </span>
                    <ScoreBadge score={result.competitionLevel.score} size="sm" />
                  </div>
                </div>
                <p className="text-sm font-semibold text-slate-800 mb-2">{result.competitionLevel.summary}</p>
                <p className="text-xs text-slate-500 leading-relaxed">{result.competitionLevel.details}</p>
              </div>
            </div>

            {/* 5. Business Model */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between space-y-4 md:col-span-2 lg:col-span-1">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Business Model</h3>
                  <ScoreBadge score={result.businessModel.score} size="sm" />
                </div>
                <p className="text-sm font-semibold text-slate-800 mb-2">{result.businessModel.summary}</p>
                <p className="text-xs text-slate-500 leading-relaxed">{result.businessModel.details}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Recommended Next Steps */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Crosshair className="w-5 h-5 text-purple-600" />
                Recommended Next Steps
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">Practical execution checklist generated for the founder</p>
            </div>
          </div>

          <div className="space-y-3">
            {result.nextSteps.map((step, index) => (
              <div
                key={index}
                className="flex items-start gap-3.5 p-4 rounded-xl bg-slate-50 border border-slate-200/60 hover:bg-purple-50/30 transition-colors"
              >
                <div className="w-6 h-6 rounded-full bg-purple-600 text-white font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  {index + 1}
                </div>
                <p className="text-xs sm:text-sm font-medium text-slate-800 leading-relaxed pt-0.5">
                  {step}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Embedded AI Startup Mentor Section */}
        <StartupMentorChat
          analysisId={record.id}
          startupName={record.startupName}
          overallScore={overallScore}
        />
      </div>
    </div>
  );
}

function BarChartIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="12" x2="12" y1="20" y2="10" />
      <line x1="18" x2="18" y1="20" y2="4" />
      <line x1="6" x2="6" y1="20" y2="16" />
    </svg>
  );
}
