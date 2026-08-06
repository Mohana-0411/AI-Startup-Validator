"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Sparkles, ArrowLeft, Send, AlertCircle, HelpCircle, CheckCircle2 } from "lucide-react";
import { createAnalysisAction, checkClarificationAction } from "@/app/actions/analysisActions";
import { LoadingOverlay } from "@/components/LoadingOverlay";

export default function NewAnalysisPage() {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Clarification state
  const [clarificationQuestions, setClarificationQuestions] = useState<string[] | null>(null);
  const [clarificationAnswers, setClarificationAnswers] = useState<{ [key: number]: string }>({});
  const [isBypassed, setIsBypassed] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const formEl = e.currentTarget;
    const formData = new FormData(formEl);

    // If clarification was not checked yet and not bypassed, check ambiguity first
    if (!clarificationQuestions && !isBypassed) {
      const inputData = {
        startupName: formData.get("startupName") as string,
        idea: formData.get("idea") as string,
        problem: formData.get("problem") as string,
        solution: formData.get("solution") as string,
        audience: formData.get("audience") as string,
        country: formData.get("country") as string,
        businessModel: formData.get("businessModel") as string,
        competitors: (formData.get("competitors") as string) || "",
      };

      const check = await checkClarificationAction(inputData);

      if (check.needsClarification && check.questions) {
        setLoading(false);
        setClarificationQuestions(check.questions);
        return;
      }
    }

    // Append clarification answers to idea/solution if user answered them
    if (clarificationQuestions && Object.keys(clarificationAnswers).length > 0) {
      const extraInfo = Object.entries(clarificationAnswers)
        .map(([idx, ans]) => `Q: ${clarificationQuestions[Number(idx)]} A: ${ans}`)
        .join(" | ");

      const currentIdea = formData.get("idea") as string;
      formData.set("idea", `${currentIdea} (${extraInfo})`);
    }

    const result = await createAnalysisAction(null, formData);
    if (result && result.error) {
      setErrorMsg(result.error);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50/50 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <LoadingOverlay isLoading={loading} />

      <div className="max-w-3xl mx-auto space-y-6">
        {/* Back Link */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        {/* Page Header Card */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-md shadow-purple-600/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900">Analyze New Startup Idea</h1>
              <p className="text-xs text-slate-500">Provide details below to generate a structured VC-grade validation report</p>
            </div>
          </div>

          {errorMsg && (
            <div className="mt-6 p-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Intelligent Clarification Banner (If Ambiguity Detected) */}
          {clarificationQuestions && (
            <div className="mt-6 p-6 bg-purple-50/70 border border-purple-200 rounded-2xl space-y-4">
              <div className="flex items-center gap-2.5 text-purple-950">
                <HelpCircle className="w-5 h-5 text-purple-600 shrink-0" />
                <h3 className="text-sm font-extrabold">Clarification Required Before Analysis</h3>
              </div>
              <p className="text-xs text-slate-700 font-medium">
                Before I analyze your startup, I need a little more information to avoid making assumptions:
              </p>

              <div className="space-y-3">
                {clarificationQuestions.map((q, idx) => (
                  <div key={idx} className="space-y-1">
                    <label className="block text-xs font-bold text-purple-950">
                      {idx + 1}. {q}
                    </label>
                    <input
                      type="text"
                      placeholder="Type your answer here..."
                      value={clarificationAnswers[idx] || ""}
                      onChange={(e) => setClarificationAnswers({ ...clarificationAnswers, [idx]: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-white border border-purple-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600"
                    />
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsBypassed(true);
                    const formEl = document.querySelector("form") as HTMLFormElement;
                    if (formEl) formEl.requestSubmit();
                  }}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Submit Clarifications & Generate Analysis
                </button>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            {/* Startup Name */}
            <div>
              <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                Startup Name <span className="text-purple-600">*</span>
              </label>
              <input
                type="text"
                name="startupName"
                required
                placeholder="e.g. FreshBox, SmartCart, EcoDelivery, Panipuri Express"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white transition-all"
              />
            </div>

            {/* One-line Idea */}
            <div>
              <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                One-line Idea <span className="text-purple-600">*</span>
              </label>
              <input
                type="text"
                name="idea"
                required
                placeholder="e.g. Autonomous electric drone delivery for urgent medical supplies in rural areas"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white transition-all"
              />
            </div>

            {/* Grid 2-cols for Problem & Solution */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                  Problem <span className="text-purple-600">*</span>
                </label>
                <textarea
                  name="problem"
                  required
                  rows={4}
                  placeholder="Describe the exact pain point customers face. Why is existing alternative inefficient or expensive?"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white transition-all resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                  Solution <span className="text-purple-600">*</span>
                </label>
                <textarea
                  name="solution"
                  required
                  rows={4}
                  placeholder="How does your product solve this problem? What is your core technology or operational model?"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white transition-all resize-none"
                />
              </div>
            </div>

            {/* Target Audience & Country */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                  Target Audience <span className="text-purple-600">*</span>
                </label>
                <input
                  type="text"
                  name="audience"
                  required
                  placeholder="e.g. Rural hospitals, emergency clinics, local consumers"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                  Country / Primary Market <span className="text-purple-600">*</span>
                </label>
                <input
                  type="text"
                  name="country"
                  required
                  placeholder="e.g. United States, Global, Germany, India"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Business Model & Competitors */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                  Business Model <span className="text-purple-600">*</span>
                </label>
                <input
                  type="text"
                  name="businessModel"
                  required
                  placeholder="e.g. B2B SaaS Subscription, Direct Retail Sales, 15% Commission"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                  Competitors <span className="text-slate-400 font-normal lowercase">(optional)</span>
                </label>
                <input
                  type="text"
                  name="competitors"
                  placeholder="e.g. Zipline, DHL, Matternet"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white font-bold rounded-xl shadow-lg shadow-purple-600/30 text-base transition-all flex items-center justify-center gap-2"
              >
                <Send className="w-5 h-5" />
                Analyze Startup
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
