import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { FileText, Download, Printer, Plus, Sparkles, ExternalLink, Activity, Flag, CheckCircle2, AlertTriangle } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { ScoreBadge } from "@/components/ScoreBadge";
import { AnalysisResultJSON } from "@/lib/types";

export default async function ReportsPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const analyses = await prisma.analysis.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  return (
    <div className="min-h-screen bg-slate-50/50 py-8 px-4 sm:px-6 lg:px-8 space-y-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-semibold border border-purple-100 mb-2">
              <FileText className="w-3.5 h-3.5 text-purple-600" />
              <span>Lifecycle Intelligence Reports</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Startup Validation Reports
            </h1>
            <p className="text-xs text-slate-500">
              Access executive investor scorecards, current stage summaries, strengths, weaknesses, and next milestones
            </p>
          </div>

          <Link
            href="/dashboard/new"
            className="px-5 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-md text-xs transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Generate New Report
          </Link>
        </div>

        {analyses.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center max-w-md mx-auto space-y-4 border border-slate-200">
            <FileText className="w-12 h-12 text-purple-600 mx-auto" />
            <h3 className="text-lg font-bold text-slate-900">No Generated Reports</h3>
            <p className="text-xs text-slate-500">
              Complete a startup analysis to compile downloadable executive investor reports.
            </p>
            <Link
              href="/dashboard/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white font-bold rounded-xl text-xs"
            >
              <Plus className="w-4 h-4" />
              Generate First Report
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {analyses.map((record) => {
              let result: AnalysisResultJSON | null = null;
              try {
                result = JSON.parse(record.analysisResult);
              } catch {
                result = null;
              }

              const lc = result?.startupLifecycle;

              return (
                <div
                  key={record.id}
                  className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6 hover:shadow-md transition-all"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-xl font-extrabold text-slate-900">{record.startupName}</h3>
                        <ScoreBadge score={record.overallScore} size="sm" />
                        {lc && (
                          <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-200">
                            {lc.currentStage} ({lc.confidenceScore}%)
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-600 font-medium italic">&ldquo;{record.idea}&rdquo;</p>
                      <p className="text-[10px] text-slate-400 pt-0.5">
                        Generated: {new Date(record.createdAt).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}
                      </p>
                    </div>

                    <Link
                      href={`/dashboard/analysis/${record.id}`}
                      className="px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs shadow-sm transition-all flex items-center justify-center gap-1.5 shrink-0"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      View Full Intelligence Report
                    </Link>
                  </div>

                  {/* Stage Summary & Predictions */}
                  {lc && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200/60 text-xs">
                      <div>
                        <span className="font-bold text-slate-900 uppercase text-[10px] block mb-1">Stage Rationale</span>
                        <p className="text-slate-700 font-medium">&ldquo;{lc.reason}&rdquo;</p>
                      </div>
                      <div>
                        <span className="font-bold text-purple-950 uppercase text-[10px] block mb-1">Next Milestone</span>
                        <p className="font-extrabold text-purple-950">{lc.nextMilestone}</p>
                        <span className="text-[10px] text-purple-700 block mt-0.5">Est: {lc.estimatedTimeToNextStage}</span>
                      </div>
                      <div>
                        <span className="font-bold text-emerald-950 uppercase text-[10px] block mb-1">Recommended Action</span>
                        <p className="text-slate-700 font-semibold">{lc.suggestedPriorities[0] || "Execute customer interviews"}</p>
                      </div>
                    </div>
                  )}

                  {/* Strengths & Weaknesses */}
                  {result && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div className="bg-emerald-50/40 p-4 rounded-xl border border-emerald-100 space-y-1.5">
                        <span className="font-bold text-emerald-950 uppercase text-[10px] flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Key Strengths
                        </span>
                        <ul className="space-y-1 text-slate-700">
                          {result.strengths.slice(0, 2).map((s, i) => (
                            <li key={i} className="flex items-center gap-1.5">
                              <span className="w-1 h-1 rounded-full bg-emerald-500" />
                              <span>{s}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="bg-amber-50/40 p-4 rounded-xl border border-amber-100 space-y-1.5">
                        <span className="font-bold text-amber-950 uppercase text-[10px] flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" /> Weaknesses & Gaps
                        </span>
                        <ul className="space-y-1 text-slate-700">
                          {result.weaknesses.slice(0, 2).map((w, i) => (
                            <li key={i} className="flex items-center gap-1.5">
                              <span className="w-1 h-1 rounded-full bg-amber-500" />
                              <span>{w}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
