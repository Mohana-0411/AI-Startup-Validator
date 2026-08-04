import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  HeartPulse,
  TrendingUp,
  BarChart3,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Target,
  ShieldCheck,
  ShieldAlert,
  ArrowRight,
  Plus,
  Zap,
  Lightbulb,
  Crosshair,
  Award,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { ScoreBadge } from "@/components/ScoreBadge";
import { ScoreRing } from "@/components/ScoreRing";
import { AnalysisResultJSON } from "@/lib/types";

export default async function StartupHealthPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const analyses = await prisma.analysis.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
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

  const totalCount = analyses.length;
  const avgOverallScore = totalCount > 0
    ? Math.round(analyses.reduce((acc, curr) => acc + curr.overallScore, 0) / totalCount)
    : 0;

  // Calculate 9 Exact Startup Health Metrics from latest analysis
  const metrics = latestResult && latestRecord ? [
    {
      title: "Overall Startup Health",
      score: latestRecord.overallScore,
      summary: latestRecord.overallScore >= 80 ? "Venture-ready concept with high growth potential." : "Solid foundation requiring key validation steps.",
      recommendation: "Focus on executing top priority customer validation interviews.",
      color: latestRecord.overallScore >= 80 ? "emerald" : latestRecord.overallScore >= 60 ? "amber" : "rose",
    },
    {
      title: "Market Health",
      score: latestResult.marketPotential.score,
      summary: latestResult.marketPotential.summary,
      recommendation: `Conduct 15 customer discovery calls targeting ${latestRecord.audience} in ${latestRecord.country}.`,
      color: latestResult.marketPotential.score >= 80 ? "emerald" : "amber",
    },
    {
      title: "Problem Validation",
      score: latestResult.problemValidation.score,
      summary: latestResult.problemValidation.summary,
      recommendation: "Run a smoke-test landing page to measure pre-order intent.",
      color: latestResult.problemValidation.score >= 80 ? "emerald" : "amber",
    },
    {
      title: "Solution Strength",
      score: latestResult.solutionQuality.score,
      summary: latestResult.solutionQuality.summary,
      recommendation: "Reduce time-to-value onboarding friction to under 60 seconds.",
      color: latestResult.solutionQuality.score >= 80 ? "emerald" : "purple",
    },
    {
      title: "Business Model",
      score: latestResult.businessModel.score,
      summary: latestResult.businessModel.summary,
      recommendation: `Test tiered pricing for ${latestRecord.businessModel} with annual prepayment discounts.`,
      color: latestResult.businessModel.score >= 80 ? "emerald" : "indigo",
    },
    {
      title: "Competition Risk",
      score: latestResult.competitionLevel.score,
      summary: `Rivalry Level: ${latestResult.competitionLevel.level}. ${latestResult.competitionLevel.summary}`,
      recommendation: "Build proprietary data network effects and exclusive distribution moats.",
      color: latestResult.competitionLevel.level === "High" ? "rose" : latestResult.competitionLevel.level === "Medium" ? "amber" : "emerald",
    },
    {
      title: "Go-To-Market Readiness",
      score: Math.round((latestResult.problemValidation.score + latestResult.solutionQuality.score) / 2),
      summary: "Evaluates product alignment with customer acquisition channels.",
      recommendation: "Map primary acquisition channels (SEO, LinkedIn outbound, and content marketing).",
      color: "purple",
    },
    {
      title: "Funding Readiness",
      score: Math.round((latestRecord.overallScore + latestResult.businessModel.score) / 2),
      summary: "Measures readiness to present to angel investors and VC partners.",
      recommendation: "Prepare 10-slide YC investor pitch deck and 3-year unit economics model.",
      color: "indigo",
    },
    {
      title: "Growth Potential",
      score: Math.round((latestResult.marketPotential.score + latestResult.solutionQuality.score) / 2),
      summary: "Scalability potential across market expansion and viral retention loops.",
      recommendation: "Explore B2B partnerships and adjacent international market entry points.",
      color: "emerald",
    },
  ] : [];

  return (
    <div className="min-h-screen bg-slate-50/50 py-8 px-4 sm:px-6 lg:px-8 space-y-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Banner */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-semibold border border-purple-100 mb-2">
              <HeartPulse className="w-3.5 h-3.5 text-purple-600" />
              <span>Real-Time Venture Scorecard</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Startup Health Monitor
            </h1>
            <p className="text-xs text-slate-500">
              Calculated health diagnostic metrics, risk analysis, and AI priorities for your startup
            </p>
          </div>

          <Link
            href="/dashboard/new"
            className="px-5 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-md text-xs transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Analyze New Concept
          </Link>
        </div>

        {totalCount === 0 || !latestRecord || !latestResult ? (
          <div className="bg-white rounded-2xl p-12 text-center max-w-md mx-auto space-y-4 border border-slate-200">
            <HeartPulse className="w-12 h-12 text-purple-600 mx-auto" />
            <h3 className="text-lg font-bold text-slate-900">No Health Data Available</h3>
            <p className="text-xs text-slate-500">
              Run your first startup analysis to generate real-time health gauges, risk badges, and recommendations.
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
            {/* Top Showcase: Circular Overall Score & Quick Diagnostic Summary */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div className="flex items-center gap-6">
                <ScoreRing score={latestRecord.overallScore} size={110} strokeWidth={10} />
                <div className="space-y-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Latest Concept Under Evaluation
                  </span>
                  <h2 className="text-2xl font-extrabold text-slate-900">{latestRecord.startupName}</h2>
                  <div className="flex items-center gap-2 pt-1">
                    <ScoreBadge score={latestRecord.overallScore} size="md" showLabel />
                    <span className="text-xs text-slate-400">• Evaluated {new Date(latestRecord.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-8">
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase">Portfolio Avg</p>
                  <p className="text-xl font-extrabold text-slate-900">{avgOverallScore}/100</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase">Analyzed Ideas</p>
                  <p className="text-xl font-extrabold text-slate-900">{totalCount}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase">Competitor Rivalry</p>
                  <p className="text-xl font-extrabold text-purple-700">{latestResult.competitionLevel.level}</p>
                </div>
              </div>
            </div>

            {/* 9 Health Metrics Grid */}
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-purple-600" />
                9 Key Health Diagnostic Metrics
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {metrics.map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-3.5 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-bold text-slate-900">{item.title}</h3>
                        <ScoreBadge score={item.score} size="sm" />
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            item.score >= 80 ? "bg-emerald-500" : item.score >= 60 ? "bg-amber-500" : "bg-rose-500"
                          }`}
                          style={{ width: `${item.score}%` }}
                        />
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed font-medium">{item.summary}</p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 bg-purple-50/40 p-3 rounded-xl border border-purple-100">
                      <p className="text-[11px] font-bold text-purple-950 uppercase tracking-wider flex items-center gap-1 mb-1">
                        <Target className="w-3.5 h-3.5 text-purple-600" /> Recommendation
                      </p>
                      <p className="text-xs text-slate-700 leading-relaxed">{item.recommendation}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Recommendations Section */}
            <div className="space-y-6 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-sm">
              <div className="border-b border-slate-100 pb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                    AI Strategic Recommendations & Priorities
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">Automated execution playbook generated from your startup scorecard</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 1. Top 5 Priorities */}
                <div className="bg-purple-50/40 p-5 rounded-2xl border border-purple-100 space-y-3">
                  <h3 className="text-xs font-bold text-purple-950 uppercase tracking-wider flex items-center gap-2">
                    <Target className="w-4 h-4 text-purple-600" /> Top 5 Strategic Priorities
                  </h3>
                  <ul className="space-y-2">
                    {latestResult.nextSteps.slice(0, 5).map((step, i) => (
                      <li key={i} className="text-xs text-slate-800 flex items-start gap-2.5 font-medium bg-white p-2.5 rounded-xl border border-purple-100">
                        <span className="w-5 h-5 rounded-full bg-purple-600 text-white font-bold text-[11px] flex items-center justify-center shrink-0">
                          {i + 1}
                        </span>
                        <span>{step}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 2. Biggest Risks */}
                <div className="bg-rose-50/40 p-5 rounded-2xl border border-rose-100 space-y-3">
                  <h3 className="text-xs font-bold text-rose-950 uppercase tracking-wider flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-rose-600" /> Biggest Operational Risks
                  </h3>
                  <ul className="space-y-2">
                    {latestResult.risks.map((risk, i) => (
                      <li key={i} className="text-xs text-slate-800 flex items-start gap-2 bg-white p-2.5 rounded-xl border border-rose-100 font-medium">
                        <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                        <span>{risk}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 3. Quick Wins */}
                <div className="bg-emerald-50/40 p-5 rounded-2xl border border-emerald-100 space-y-3">
                  <h3 className="text-xs font-bold text-emerald-950 uppercase tracking-wider flex items-center gap-2">
                    <Zap className="w-4 h-4 text-emerald-600" /> Quick Wins (Immediate Value)
                  </h3>
                  <ul className="space-y-2">
                    <li className="text-xs text-slate-800 flex items-start gap-2 bg-white p-2.5 rounded-xl border border-emerald-100 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{latestResult.nextSteps[0] || "Set up discovery call interview funnel"}</span>
                    </li>
                    <li className="text-xs text-slate-800 flex items-start gap-2 bg-white p-2.5 rounded-xl border border-emerald-100 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{latestResult.nextSteps[1] || "Create waitlist landing page MVP"}</span>
                    </li>
                  </ul>
                </div>

                {/* 4. Long-Term Improvements */}
                <div className="bg-indigo-50/40 p-5 rounded-2xl border border-indigo-100 space-y-3">
                  <h3 className="text-xs font-bold text-indigo-950 uppercase tracking-wider flex items-center gap-2">
                    <Award className="w-4 h-4 text-indigo-600" /> Long-Term Scale Opportunities
                  </h3>
                  <ul className="space-y-2">
                    {latestResult.opportunities.slice(0, 3).map((opp, i) => (
                      <li key={i} className="text-xs text-slate-800 flex items-start gap-2 bg-white p-2.5 rounded-xl border border-indigo-100 font-medium">
                        <Lightbulb className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                        <span>{opp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Strengths, Weaknesses & Opportunities Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Strengths Cards */}
              <div className="bg-white p-6 rounded-2xl border border-emerald-200/80 shadow-sm space-y-3">
                <h3 className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Key Venture Strengths
                </h3>
                <ul className="space-y-2">
                  {latestResult.strengths.map((s, i) => (
                    <li key={i} className="text-xs text-slate-700 bg-emerald-50/50 p-2.5 rounded-xl border border-emerald-100">
                      {s}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Weaknesses Cards */}
              <div className="bg-white p-6 rounded-2xl border border-amber-200/80 shadow-sm space-y-3">
                <h3 className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600" /> Core Weaknesses
                </h3>
                <ul className="space-y-2">
                  {latestResult.weaknesses.map((w, i) => (
                    <li key={i} className="text-xs text-slate-700 bg-amber-50/50 p-2.5 rounded-xl border border-amber-100">
                      {w}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Opportunity Cards */}
              <div className="bg-white p-6 rounded-2xl border border-purple-200/80 shadow-sm space-y-3">
                <h3 className="text-xs font-bold text-purple-900 uppercase tracking-wider flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-purple-600" /> Market Opportunities
                </h3>
                <ul className="space-y-2">
                  {latestResult.opportunities.map((o, i) => (
                    <li key={i} className="text-xs text-slate-700 bg-purple-50/50 p-2.5 rounded-xl border border-purple-100">
                      {o}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Historical Score Comparison Trend Chart */}
            {totalCount > 1 && (
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden p-6 sm:p-8 space-y-6">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-purple-600" />
                      Historical Score Comparison Across Evaluated Ideas
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">Trajectory of overall health scores across your startup portfolio</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {analyses.map((item) => (
                    <div key={item.id} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <Link href={`/dashboard/analysis/${item.id}`} className="text-slate-900 hover:text-purple-600">
                          {item.startupName}
                        </Link>
                        <ScoreBadge score={item.overallScore} size="sm" />
                      </div>
                      <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            item.overallScore >= 80 ? "bg-emerald-500" : item.overallScore >= 60 ? "bg-amber-500" : "bg-rose-500"
                          }`}
                          style={{ width: `${item.overallScore}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
