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
import { detectStartupCategory, buildVentureContext } from "@/lib/openai";

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
  const vContext = latestResult?.ventureContext || (latestRecord ? buildVentureContext({
    startupName: latestRecord.startupName,
    idea: latestRecord.idea,
    problem: latestRecord.problem,
    solution: latestRecord.solution,
    audience: latestRecord.audience,
    country: latestRecord.country,
    businessModel: latestRecord.businessModel,
  }) : null);

  const lc = latestResult?.startupLifecycle;
  const stage = lc?.currentStage || "Validation Stage";

  // Dynamic Industry-Specific Health Diagnostic Metrics
  let metrics: { title: string; score: number; summary: string; recommendation: string; color: string }[] = [];

  if (latestResult && latestRecord && vContext) {
    if (vContext.industry === "Food & Beverage") {
      metrics = [
        {
          title: "Location & Footfall Potential",
          score: latestResult.solutionQuality.score,
          summary: "Evaluates evening pedestrian traffic and accessibility near bus stops/colleges.",
          recommendation: "Conduct 3-day peak evening (4 PM - 8 PM) footfall counting.",
          color: "purple",
        },
        {
          title: "Unit Economics & Gross Margin",
          score: latestResult.businessModel.score,
          summary: "Evaluates ingredient cost (besan, oil, spices) per plate relative to menu price.",
          recommendation: "Maintain strict ingredient portioning to achieve 65%+ gross margin.",
          color: "emerald",
        },
        {
          title: "Food Hygiene & Licensing Readiness",
          score: latestResult.problemValidation.score,
          summary: "Measures FSSAI registration readiness and clean cooking oil standards.",
          recommendation: "Display basic FSSAI hygiene certificate and use fresh daily oil.",
          color: "indigo",
        },
        {
          title: "Repeat Customer Footfall",
          score: latestResult.marketPotential.score,
          summary: "Measures daily repeat customer intent and chutney/taste satisfaction.",
          recommendation: "Offer combo meal deals to drive daily repeat office/student orders.",
          color: "emerald",
        },
      ];
    } else if (vContext.industry === "Healthcare & Medical Services") {
      metrics = [
        {
          title: "Licensing & Regulatory Compliance",
          score: latestResult.problemValidation.score,
          summary: "Evaluates Clinical Establishment Act registration and dental council permits.",
          recommendation: "Ensure all specialist doctor credentials and licenses are displayed.",
          color: "purple",
        },
        {
          title: "Medical Equipment & Facility Readiness",
          score: latestResult.solutionQuality.score,
          summary: "Measures dental chair, digital X-ray, and autoclave sterilizer readiness.",
          recommendation: "Establish routine daily sterilization and equipment maintenance logs.",
          color: "emerald",
        },
        {
          title: "Patient Trust & Diagnostic Precision",
          score: latestResult.marketPotential.score,
          summary: "Evaluates patient satisfaction and community referral intent.",
          recommendation: "Implement automated SMS appointment reminders for patient checkups.",
          color: "indigo",
        },
        {
          title: "Clinical Unit Economics",
          score: latestResult.businessModel.score,
          summary: "Evaluates consultation and treatment procedure margins.",
          recommendation: "Optimize scheduling to maximize daily clinical appointment capacity.",
          color: "emerald",
        },
      ];
    } else if (vContext.industry === "Manufacturing & Processing") {
      metrics = [
        {
          title: "Machinery & Output Speed",
          score: latestResult.solutionQuality.score,
          summary: "Evaluates automatic forming machinery capacity and output stability.",
          recommendation: "Run pilot batches to confirm zero cup rim breakage or leakage.",
          color: "purple",
        },
        {
          title: "Raw Material Sourcing & Unit Cost",
          score: latestResult.businessModel.score,
          summary: "Evaluates raw PE-coated paper roll procurement pricing.",
          recommendation: "Lock in bulk paper roll supply contracts to stabilize unit margins.",
          color: "emerald",
        },
        {
          title: "Factory Licensing & Power Clearance",
          score: latestResult.problemValidation.score,
          summary: "Measures industrial power load approval and pollution control clearance.",
          recommendation: "Secure high-voltage electricity grid sanction from state DISCOM.",
          color: "indigo",
        },
        {
          title: "B2B Wholesale Distributor Demand",
          score: latestResult.marketPotential.score,
          summary: "Measures wholesale tea stall and distributor off-take contracts.",
          recommendation: "Offer tiered volume discounts to regional paper goods distributors.",
          color: "emerald",
        },
      ];
    } else if (vContext.industry === "Agriculture & Agribusiness") {
      metrics = [
        {
          title: "Soil Fertility & Drip Irrigation",
          score: latestResult.solutionQuality.score,
          summary: "Evaluates soil nutrient quality and automated drip irrigation coverage.",
          recommendation: "Complete annual soil nutrient testing prior to crop planting.",
          color: "purple",
        },
        {
          title: "Organic Certification Compliance",
          score: latestResult.problemValidation.score,
          summary: "Measures NPOP/APMC pesticide-free organic farming audit readiness.",
          recommendation: "Maintain meticulous organic fertilizer and crop treatment logs.",
          color: "emerald",
        },
        {
          title: "Cold Storage & Preservation",
          score: latestResult.businessModel.score,
          summary: "Evaluates post-harvest transit preservation and spoilage reduction.",
          recommendation: "Establish temperature-controlled cold storage for fresh produce.",
          color: "indigo",
        },
        {
          title: "Wholesale Mandi Off-Take Demand",
          score: latestResult.marketPotential.score,
          summary: "Measures APMC mandi buyer and direct supermarket supply contracts.",
          recommendation: "Form direct supply agreements with regional organic retailers.",
          color: "emerald",
        },
      ];
    } else {
      metrics = [
        {
          title: "Problem Validation & Pain Clarity",
          score: latestResult.problemValidation.score,
          summary: "Evaluates how clearly the target customer pain point is confirmed.",
          recommendation: "Conduct discovery interviews to confirm willingness-to-pay.",
          color: "purple",
        },
        {
          title: "Product Differentiation & Moat",
          score: latestResult.solutionQuality.score,
          summary: "Evaluates solution uniqueness vs existing market alternatives.",
          recommendation: "Focus messaging on your core unique selling proposition.",
          color: "emerald",
        },
        {
          title: "User Onboarding & Experience",
          score: Math.round((latestRecord.overallScore + latestResult.solutionQuality.score) / 2),
          summary: "Evaluates onboarding speed and customer activation friction.",
          recommendation: "Target time-to-first-value under 60 seconds.",
          color: "indigo",
        },
        {
          title: "Monetization & Unit Economics",
          score: latestResult.businessModel.score,
          summary: "Evaluates pricing sustainability and operating margin payback.",
          recommendation: "Maintain positive gross margins before scaling marketing spend.",
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
              <span>Multi-Industry Venture Scorecard</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Startup & Business Health Monitor
            </h1>
            <p className="text-xs text-slate-500">
              Evaluate the health and growth potential of your startup or business using industry-specific metrics.
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

        {totalCount === 0 || !latestRecord || !latestResult ? (
          <div className="bg-white rounded-2xl p-12 text-center max-w-md mx-auto space-y-4 border border-slate-200">
            <HeartPulse className="w-12 h-12 text-purple-600 mx-auto" />
            <h3 className="text-lg font-bold text-slate-900">No Health Data Available</h3>
            <p className="text-xs text-slate-500">
              Run your first analysis to generate real-time health metrics and recommendations.
            </p>
            <Link
              href="/dashboard/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white font-bold rounded-xl text-xs"
            >
              <Plus className="w-4 h-4" />
              Analyze Idea Now
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
                      Venture Under Evaluation
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
                Industry Health Diagnostic Gauges ({stage})
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
