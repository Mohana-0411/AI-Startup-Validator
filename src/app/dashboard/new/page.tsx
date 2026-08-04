"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Sparkles, ArrowLeft, Send, AlertCircle } from "lucide-react";
import { createAnalysisAction } from "@/app/actions/analysisActions";
import { LoadingOverlay } from "@/components/LoadingOverlay";

export default function NewAnalysisPage() {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    const formData = new FormData(e.currentTarget);
    const result = await createAnalysisAction(null, formData);
    if (result && result.error) {
      setErrorMsg(result.error);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50/50 py-8 px-4 sm:px-6 lg:px-8">
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
                placeholder="e.g. EcoDelivery AI, FinFlow, MedPulse"
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
                  placeholder="How does your product solve this problem? What is your core technology or secret sauce?"
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
                  placeholder="e.g. Rural hospitals, emergency clinics, B2B logistics managers"
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
                  placeholder="e.g. B2B SaaS Subscription, 15% Marketplace Fee, Usage-based"
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
