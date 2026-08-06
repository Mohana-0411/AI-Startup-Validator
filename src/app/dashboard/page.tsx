import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Plus,
  ArrowRight,
  Sparkles,
  Bot,
  Map,
  Trophy,
  HeartPulse,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Target,
  BarChart3,
  TrendingUp,
  ExternalLink,
  MessageSquare,
  Zap,
  ShieldAlert,
  Calendar,
  Layers,
  Dna,
  Check,
  Flag,
  ChevronRight,
  Activity,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { ScoreBadge } from "@/components/ScoreBadge";
import { ScoreRing } from "@/components/ScoreRing";
import { AnalysisResultJSON } from "@/lib/types";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  // Fetch recent analyses
  const analyses = await prisma.analysis.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  const latestRecord = analyses[0];
  let latestResult: AnalysisResultJSON | null = null;
  if (latestRecord) {
    try {
      latestResult = JSON.parse(latestRecord.analysisResult);
    } catch {
      latestResult = null;
    }
  }

  const dna = latestResult?.businessDNA;
  const lc = latestResult?.startupLifecycle;

  const allStages = [
    "Idea Stage",
    "Validation Stage",
    "MVP Stage",
    "Launch Stage",
    "Early Revenue Stage",
    "Growth Stage",
    "Scale Stage",
  ];

  const currentStageIndex = lc ? allStages.indexOf(lc.currentStage) : 1;

  // Fetch roadmap tasks for latest analysis
  const roadmapTasks = latestRecord
    ? await prisma.roadmapTask.findMany({
        where: { analysisId: latestRecord.id },
        orderBy: { createdAt: "asc" },
      })
    : [];

  const openTasksCount = roadmapTasks.filter((t) => !t.completed).length;
  const completedTasks = roadmapTasks.filter((t) => t.completed).slice(-3);

  // Fetch latest AI chat message for latest analysis
  const latestChatMessage = latestRecord
    ? await prisma.chatMessage.findFirst({
        where: { analysisId: latestRecord.id },
        orderBy: { createdAt: "desc" },
      })
    : null;

  return (
    <div className="min-h-screen bg-slate-50/50 py-8 px-4 sm:px-6 lg:px-8 space-y-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Supported Industry Badges Banner */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-600 bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs">
          <span className="text-purple-700 font-extrabold mr-1">Supports:</span>
          <span className="px-2.5 py-0.5 bg-purple-50 text-purple-700 border border-purple-200 rounded-md">✓ Tech Startups</span>
          <span className="px-2.5 py-0.5 bg-slate-100 text-slate-800 rounded-md">✓ Local Businesses</span>
          <span className="px-2.5 py-0.5 bg-slate-100 text-slate-800 rounded-md">✓ Retail</span>
          <span className="px-2.5 py-0.5 bg-slate-100 text-slate-800 rounded-md">✓ Food & Beverage</span>
          <span className="px-2.5 py-0.5 bg-slate-100 text-slate-800 rounded-md">✓ Healthcare</span>
          <span className="px-2.5 py-0.5 bg-slate-100 text-slate-800 rounded-md">✓ Education</span>
          <span className="px-2.5 py-0.5 bg-slate-100 text-slate-800 rounded-md">✓ Manufacturing</span>
          <span className="px-2.5 py-0.5 bg-slate-100 text-slate-800 rounded-md">✓ E-Commerce</span>
          <span className="px-2.5 py-0.5 bg-slate-100 text-slate-800 rounded-md">✓ Service Businesses</span>
          <span className="px-2.5 py-0.5 bg-slate-100 text-slate-800 rounded-md">✓ AI Products</span>
        </div>

        {/* 1. Top Command Center Banner Card */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-sm shadow-slate-200/50 hover:shadow-md transition-all duration-200 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {latestRecord ? (
            <div className="flex flex-col sm:flex-row sm:items-center gap-6">
              <ScoreRing score={latestRecord.overallScore} size={100} strokeWidth={9} />
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-bold border border-purple-100 mb-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Startup Command Center</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {latestRecord.startupName}
                </h1>
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 pt-1 font-medium">
                  <span className="flex items-center gap-1">
                    <Target className="w-3.5 h-3.5 text-purple-600" />
                    Overall Score: <strong className="text-purple-700 font-bold ml-1">{latestRecord.overallScore}/100</strong>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <HeartPulse className="w-3.5 h-3.5 text-emerald-600" />
                    Health Score: <strong className="text-emerald-600 font-bold ml-1">{latestRecord.overallScore}/100</strong>
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    Evaluated: {new Date(latestRecord.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-bold border border-purple-100 mb-2">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Command Center</span>
              </div>
              <h1 className="text-2xl font-extrabold text-slate-900">Welcome to AI Startup Validator! 👋</h1>
              <p className="text-xs text-slate-500">Analyze any new venture and receive AI-powered insights tailored to your specific industry.</p>
            </div>
          )}

          {/* Quick Action Buttons Bar */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
            <Link
              href="/dashboard/new"
              className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs shadow-md shadow-purple-600/20 hover:scale-[1.02] transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              New Analysis
            </Link>
            <Link
              href="/dashboard/chat"
              className="px-4 py-2.5 bg-slate-50 hover:bg-purple-50 text-slate-700 hover:text-purple-700 font-bold rounded-xl text-xs border border-slate-200 hover:border-purple-200 transition-all flex items-center gap-1.5"
            >
              <Bot className="w-4 h-4 text-purple-600" />
              Open AI Chat
            </Link>
            <Link
              href="/dashboard/roadmap"
              className="px-4 py-2.5 bg-slate-50 hover:bg-purple-50 text-slate-700 hover:text-purple-700 font-bold rounded-xl text-xs border border-slate-200 hover:border-purple-200 transition-all flex items-center gap-1.5"
            >
              <Map className="w-4 h-4 text-purple-600" />
              View Roadmap
            </Link>
            <Link
              href="/dashboard/competitors"
              className="px-4 py-2.5 bg-slate-50 hover:bg-purple-50 text-slate-700 hover:text-purple-700 font-bold rounded-xl text-xs border border-slate-200 hover:border-purple-200 transition-all flex items-center gap-1.5"
            >
              <Trophy className="w-4 h-4 text-purple-600" />
              Competitors
            </Link>
          </div>
        </div>

        {/* 2. Startup Lifecycle Intelligence Widget */}
        {lc && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-indigo-200/80 shadow-md space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-extrabold border border-indigo-200">
                  <Activity className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
                  <span>Startup Lifecycle Intelligence</span>
                </div>
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                  Lifecycle Progress Timeline & Stage Prediction
                </h2>
                <p className="text-xs text-slate-500">
                  Automated stage classification governing AI Mentor advice, Roadmap milestones, and Health metrics
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="px-3 py-1.5 bg-purple-600 text-white text-xs font-extrabold rounded-xl shadow-sm">
                  {lc.currentStage}
                </span>
                <span className="px-3 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-extrabold rounded-xl">
                  {lc.confidenceScore}% Classification Confidence
                </span>
              </div>
            </div>

            {/* 7-Stage Horizontal Progress Timeline */}
            <div className="overflow-x-auto pb-2">
              <div className="flex items-center min-w-[700px] justify-between relative">
                <div className="absolute top-1/2 left-4 right-4 h-1 bg-slate-100 -translate-y-1/2 -z-0" />
                <div
                  className="absolute top-1/2 left-4 h-1 bg-gradient-to-r from-purple-600 to-indigo-600 -translate-y-1/2 -z-0 transition-all duration-500"
                  style={{ width: `${(currentStageIndex / (allStages.length - 1)) * 95}%` }}
                />

                {allStages.map((stg, idx) => {
                  const isCurrent = idx === currentStageIndex;
                  const isPassed = idx < currentStageIndex;
                  return (
                    <div key={stg} className="relative z-10 flex flex-col items-center gap-2 text-center">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center font-extrabold text-xs transition-all ${
                          isCurrent
                            ? "bg-purple-600 text-white ring-4 ring-purple-100 shadow-md shadow-purple-600/30 scale-110"
                            : isPassed
                            ? "bg-emerald-500 text-white"
                            : "bg-slate-100 text-slate-400 border border-slate-200"
                        }`}
                      >
                        {isPassed ? <Check className="w-4 h-4" /> : idx + 1}
                      </div>
                      <span
                        className={`text-[11px] font-extrabold max-w-[85px] leading-tight ${
                          isCurrent ? "text-purple-700 font-extrabold" : isPassed ? "text-slate-700" : "text-slate-400"
                        }`}
                      >
                        {stg}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Stage Summary & Predictions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              {/* Reason & Objectives */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/60 space-y-2">
                <span className="text-[11px] font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Flag className="w-3.5 h-3.5 text-purple-600" /> Stage Rationale & Objectives
                </span>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">&ldquo;{lc.reason}&rdquo;</p>
              </div>

              {/* Next Milestone & Est. Time */}
              <div className="p-4 rounded-xl bg-purple-50/50 border border-purple-100 space-y-2">
                <span className="text-[11px] font-bold text-purple-950 uppercase tracking-wider flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-purple-600" /> Next Target Milestone
                </span>
                <p className="text-xs font-extrabold text-purple-950">{lc.nextMilestone}</p>
                <span className="text-[10px] font-bold text-purple-700 block">Est. Transition Time: {lc.estimatedTimeToNextStage}</span>
              </div>

              {/* Future Stage Prediction */}
              <div className="p-4 rounded-xl bg-emerald-50/40 border border-emerald-100 space-y-2">
                <span className="text-[11px] font-bold text-emerald-950 uppercase tracking-wider flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-600" /> Growth & Success Prediction
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-extrabold text-emerald-700">{lc.successProbability}%</span>
                  <span className="text-[11px] font-bold text-slate-600">Stage Success Probability</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
                  Primary Blocker: <span className="font-bold text-slate-800">{lc.potentialBlockers[0]}</span>
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 3. Business DNA Dashboard Showcase Card */}
        {dna && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-purple-200/80 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Dna className="w-5 h-5 text-purple-600" />
                <h2 className="text-lg font-extrabold text-slate-900">Active Business DNA</h2>
                <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
                  {dna.industry}
                </span>
              </div>
              <Link
                href={latestRecord ? `/dashboard/analysis/${latestRecord.id}` : "#"}
                className="text-xs font-bold text-purple-600 hover:underline"
              >
                View Full DNA Profile →
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">Industry</span>
                <span className="text-xs font-extrabold text-slate-900 truncate block">{dna.industry}</span>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">Business Type</span>
                <span className="text-xs font-extrabold text-purple-700 truncate block">{dna.businessType}</span>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">Revenue Model</span>
                <span className="text-xs font-extrabold text-slate-900 truncate block">{dna.revenueModel}</span>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">Target Market</span>
                <span className="text-xs font-extrabold text-slate-900 truncate block">{dna.marketScope}</span>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">Investment Level</span>
                <span className="text-xs font-extrabold text-amber-700 truncate block">{dna.investmentLevel}</span>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                <span className="text-[10px] font-bold text-slate-400 uppercase block mb-0.5">Scalability</span>
                <span className="text-xs font-extrabold text-emerald-700 truncate block">{dna.scalability}</span>
              </div>
            </div>
          </div>
        )}

        {/* 4. Quick Overview Section */}
        {latestRecord && latestResult ? (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-purple-600" />
              Quick Overview
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* 1. Overall Health */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm shadow-slate-200/40 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 space-y-2 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Overall Health</span>
                  <HeartPulse className="w-4 h-4 text-emerald-500" />
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-extrabold text-slate-900">{latestRecord.overallScore}</span>
                  <span className="text-xs text-slate-400 font-medium">/ 100</span>
                </div>
                <ScoreBadge score={latestRecord.overallScore} size="sm" />
              </div>

              {/* 2. Competition Risk */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm shadow-slate-200/40 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 space-y-2 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Competition Risk</span>
                  <ShieldAlert className="w-4 h-4 text-amber-500" />
                </div>
                <div>
                  <span className="px-2.5 py-1 rounded text-xs font-extrabold bg-amber-50 text-amber-700 border border-amber-200 inline-block">
                    {latestResult.competitionLevel.level} Risk
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 truncate font-medium">{latestResult.competitionLevel.summary}</p>
              </div>

              {/* 3. Growth Potential */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm shadow-slate-200/40 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 space-y-2 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Growth Potential</span>
                  <TrendingUp className="w-4 h-4 text-purple-600" />
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-extrabold text-slate-900">{latestResult.solutionQuality.score}</span>
                  <span className="text-xs text-slate-400 font-medium">/ 100</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-purple-600 h-full rounded-full transition-all duration-500" style={{ width: `${latestResult.solutionQuality.score}%` }} />
                </div>
              </div>

              {/* 4. Funding Readiness */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm shadow-slate-200/40 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 space-y-2 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Funding Readiness</span>
                  <Zap className="w-4 h-4 text-indigo-600" />
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-extrabold text-slate-900">
                    {Math.round((latestRecord.overallScore + latestResult.businessModel.score) / 2)}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">/ 100</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-indigo-600 h-full rounded-full transition-all duration-500" style={{ width: `${Math.round((latestRecord.overallScore + latestResult.businessModel.score) / 2)}%` }} />
                </div>
              </div>

              {/* 5. Open Roadmap Tasks */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm shadow-slate-200/40 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 space-y-2 flex flex-col justify-between">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Roadmap Tasks</span>
                  <Map className="w-4 h-4 text-purple-600" />
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-extrabold text-slate-900">{openTasksCount}</span>
                  <span className="text-xs text-slate-400 font-medium">open</span>
                </div>
                <Link href="/dashboard/roadmap" className="text-[11px] font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1">
                  Manage Roadmap →
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl p-8 border border-slate-200/80 shadow-sm text-center space-y-3">
            <Sparkles className="w-8 h-8 text-purple-600 mx-auto" />
            <h3 className="text-base font-bold text-slate-900">No Active Analysis Context</h3>
            <p className="text-xs text-slate-500">Analyze any new venture and receive AI-powered insights tailored to your specific industry.</p>
            <Link href="/dashboard/new" className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white text-xs font-bold rounded-xl shadow-md">
              <Plus className="w-4 h-4" /> Start First Analysis
            </Link>
          </div>
        )}

        {/* 5. Today's Priorities Card */}
        {latestResult && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-sm shadow-slate-200/40 hover:shadow-md transition-all duration-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Target className="w-5 h-5 text-purple-600" />
                  Today&apos;s Priorities (Top AI Actions)
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">Top 3 high-impact execution items for {latestRecord?.startupName}</p>
              </div>
              <Link href="/dashboard/roadmap" className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1">
                View Full Roadmap →
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {latestResult.nextSteps.slice(0, 3).map((step, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-purple-50/40 border border-purple-100 hover:border-purple-200 transition-colors space-y-2 flex items-start gap-3">
                  <span className="w-6 h-6 rounded-full bg-purple-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0 mt-0.5 shadow-sm shadow-purple-600/30">
                    {idx + 1}
                  </span>
                  <div>
                    <p className="text-xs font-bold text-slate-900 leading-snug">{step}</p>
                    <span className="text-[10px] font-extrabold text-purple-700 uppercase mt-1 inline-block">High Priority</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 6. Recent Activity Section Grid */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-purple-600" />
            Recent Activity
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: Latest Analysis */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm shadow-slate-200/40 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 space-y-4 flex flex-col justify-between">
              <div className="space-y-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">Latest Analysis</span>
                {latestRecord ? (
                  <>
                    <div className="flex items-center justify-between">
                      <h3 className="text-base font-extrabold text-slate-900 truncate">{latestRecord.startupName}</h3>
                      <ScoreBadge score={latestRecord.overallScore} size="sm" />
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{latestRecord.idea}</p>
                    <p className="text-[10px] text-slate-400 pt-1 font-medium">
                      Evaluated: {new Date(latestRecord.createdAt).toLocaleDateString()}
                    </p>
                  </>
                ) : (
                  <p className="text-xs text-slate-400">No analyses run yet</p>
                )}
              </div>

              {latestRecord && (
                <Link
                  href={`/dashboard/analysis/${latestRecord.id}`}
                  className="px-4 py-2.5 bg-slate-50 hover:bg-purple-50 text-slate-700 hover:text-purple-700 font-bold rounded-xl text-xs border border-slate-200 transition-all flex items-center justify-between"
                >
                  <span>View Full Report</span>
                  <ExternalLink className="w-3.5 h-3.5 text-purple-600" />
                </Link>
              )}
            </div>

            {/* Card 2: Latest AI Chat */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm shadow-slate-200/40 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 space-y-4 flex flex-col justify-between">
              <div className="space-y-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">Latest AI Chat</span>
                {latestChatMessage ? (
                  <>
                    <p className="text-xs font-semibold text-purple-900 bg-purple-50/70 p-3 rounded-xl border border-purple-100 line-clamp-3 leading-relaxed">
                      &ldquo;{latestChatMessage.content}&rdquo;
                    </p>
                    <p className="text-[10px] text-slate-400 pt-1 font-medium">
                      Last Message: {new Date(latestChatMessage.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </>
                ) : (
                  <p className="text-xs text-slate-400 py-4">No recent chat messages for this startup.</p>
                )}
              </div>

              <Link
                href="/dashboard/chat"
                className="px-4 py-2.5 bg-slate-50 hover:bg-purple-50 text-slate-700 hover:text-purple-700 font-bold rounded-xl text-xs border border-slate-200 transition-all flex items-center justify-between"
              >
                <span>Open AI Chatbot</span>
                <MessageSquare className="w-3.5 h-3.5 text-purple-600" />
              </Link>
            </div>

            {/* Card 3: Recently Completed Roadmap Tasks */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm shadow-slate-200/40 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 space-y-4 flex flex-col justify-between">
              <div className="space-y-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">Completed Tasks</span>
                {completedTasks.length > 0 ? (
                  <ul className="space-y-2">
                    {completedTasks.map((t) => (
                      <li key={t.id} className="text-xs text-slate-700 flex items-center gap-2 font-semibold">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span className="truncate">{t.title}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-slate-400 py-4">No completed tasks yet in your roadmap.</p>
                )}
              </div>

              <Link
                href="/dashboard/roadmap"
                className="px-4 py-2.5 bg-slate-50 hover:bg-purple-50 text-slate-700 hover:text-purple-700 font-bold rounded-xl text-xs border border-slate-200 transition-all flex items-center justify-between"
              >
                <span>View Roadmap</span>
                <Map className="w-3.5 h-3.5 text-purple-600" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
