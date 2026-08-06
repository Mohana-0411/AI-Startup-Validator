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
  Building2,
  Activity,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { ScoreBadge } from "@/components/ScoreBadge";
import { ScoreRing } from "@/components/ScoreRing";
import { AnalysisResultJSON } from "@/lib/types";
import { detectStartupCategory } from "@/lib/openai";

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

  const fullText = latestRecord ? `${latestRecord.startupName} ${latestRecord.idea} ${latestRecord.businessModel} ${latestRecord.problem}` : "";
  const category = latestResult?.businessClassification?.industry
    ? (latestResult.businessClassification.industry.toUpperCase().includes("FOOD") ? "FOOD" : detectStartupCategory(fullText))
    : detectStartupCategory(fullText);

  const lc = latestResult?.startupLifecycle;
  const stage = lc?.currentStage || "Validation Stage";

  // Stage-Aware Diagnostic Metrics
  let metrics: { title: string; score: number; summary: string; recommendation: string; color: string }[] = [];

  if (latestResult && latestRecord) {
    if (stage === "Idea Stage" || stage === "Validation Stage") {
      metrics = [
        {
          title: "Problem Clarity",
          score: latestResult.problemValidation.score,
          summary: "Evaluates how clearly the core customer pain point is defined.",
          recommendation: "Conduct 15 customer discovery interviews to confirm pain severity.",
          color: "purple",
        },
        {
          title: "Market Need & Demand",
          score: latestResult.marketPotential.score,
          summary: "Measures willingness-to-pay and initial market pull.",
          recommendation: "Test problem urgency with landing page smoke tests.",
          color: "emerald",
        },
        {
          title: "Solution Innovation",
          score: latestResult.solutionQuality.score,
          summary: "Evaluates uniqueness and differentiation vs existing alternatives.",
          recommendation: "Highlight your unique selling proposition in customer calls.",
          color: "indigo",
        },
        {
          title: "Customer Validation Progress",
          score: lc?.confidenceScore || 88,
          summary: "Measures qualitative validation progress across target users.",
          recommendation: "Log structured user feedback in a central repository.",
          color: "emerald",
        },
      ];
    } else if (stage === "MVP Stage" || stage === "Launch Stage") {
      metrics = [
        {
          title: "Product Quality & Architecture",
          score: latestResult.solutionQuality.score,
          summary: "Evaluates MVP stability, core feature set, and usability.",
          recommendation: "Eliminate friction bottlenecks in the main user onboarding flow.",
          color: "purple",
        },
        {
          title: "User Feedback Score",
          score: Math.round((latestResult.solutionQuality.score + latestResult.problemValidation.score) / 2),
          summary: "Measures qualitative sentiment from initial beta test users.",
          recommendation: "Implement rapid weekly product update cycles based on feedback.",
          color: "emerald",
        },
        {
          title: "Usability & Activation Rate",
          score: Math.round((latestRecord.overallScore + latestResult.solutionQuality.score) / 2),
          summary: "Evaluates how quickly users experience first core value.",
          recommendation: "Target time-to-first-value under 60 seconds.",
          color: "indigo",
        },
        {
          title: "Early Customer Acquisition",
          score: latestResult.marketPotential.score,
          summary: "Measures initial user acquisition and waitlist conversions.",
          recommendation: "Scale organic referral loops and launch marketing channels.",
          color: "emerald",
        },
      ];
    } else {
      // Growth Stage & Beyond
      metrics = [
        {
          title: "Revenue & Unit Economics",
          score: latestResult.businessModel.score,
          summary: "Evaluates gross profit margins, CAC payback, and LTV ratio.",
          recommendation: "Maintain positive unit economics before expanding marketing spend.",
          color: "emerald",
        },
        {
          title: "Team & Operational Capacity",
          score: Math.round((latestRecord.overallScore + latestResult.businessModel.score) / 2),
          summary: "Measures operational bandwidth and key leadership hires.",
          recommendation: "Recruit key functional leads across product, sales, and operations.",
          color: "purple",
        },
        {
          title: "Scaling & System Automation",
          score: Math.round((latestResult.marketPotential.score + latestResult.solutionQuality.score) / 2),
          summary: "Evaluates infrastructure scalability and customer support automation.",
          recommendation: "Automate repetitive customer support and backend workflows.",
          color: "indigo",
        },
        {
          title: "Market Expansion Potential",
          score: latestResult.marketPotential.score,
          summary: "Measures multi-region expansion readiness and market share.",
          recommendation: "Form strategic distribution partnerships in adjacent regions.",
          color: "emerald",
        },
      ];
    }
  }

  return (
    <div className="min-h-screen bg-slate-50/50 py-8 px-4 sm:px-6 lg:px-8 space-y-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Banner */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-semibold border border-purple-100 mb-2">
              <HeartPulse className="w-3.5 h-3.5 text-purple-600" />
              <span>Stage-Aware Venture Scorecard</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Startup Health Monitor
            </h1>
            <p className="text-xs text-slate-500">
              Lifecycle-tailored health diagnostic gauges adapting dynamically to your current stage ({stage})
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
              Run your first startup analysis to generate real-time stage health gauges and recommendations.
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
            {/* Top Showcase */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div className="flex items-center gap-6">
                <ScoreRing score={latestRecord.overallScore} size={110} strokeWidth={10} />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Concept Under Evaluation
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {stage}
                    </span>
                  </div>
                  <h2 className="text-2xl font-extrabold text-slate-900">{latestRecord.startupName}</h2>
                  <div className="flex items-center gap-2 pt-1">
                    <ScoreBadge score={latestRecord.overallScore} size="md" showLabel />
                    <span className="text-xs text-slate-400">• Evaluated {new Date(latestRecord.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-8">
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase">Lifecycle Stage</p>
                  <p className="text-sm font-extrabold text-purple-700">{stage}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase">Classification Confidence</p>
                  <p className="text-xl font-extrabold text-emerald-600">{lc?.confidenceScore || 90}%</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase">Competitor Rivalry</p>
                  <p className="text-xl font-extrabold text-purple-700">{latestResult.competitionLevel.level}</p>
                </div>
              </div>
            </div>

            {/* Health Metrics Grid */}
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-purple-600" />
                Stage Health Diagnostic Gauges ({stage})
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
          </>
        )}
      </div>
    </div>
  );
}
