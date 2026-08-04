"use client";

import React, { useEffect, useState } from "react";
import { Loader2, Sparkles, CheckCircle2 } from "lucide-react";

interface LoadingOverlayProps {
  isLoading: boolean;
}

const STEPS = [
  "Structuring Startup Executive Summary...",
  "Evaluating Target Market & TAM Potential...",
  "Benchmarking Competitors & Moats...",
  "Generating SWAT Matrix & Risk Scorecard...",
  "Formulating Practical Next Steps...",
];

export function LoadingOverlay({ isLoading }: LoadingOverlayProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    if (!isLoading) {
      setCurrentStepIndex(0);
      return;
    }

    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => (prev < STEPS.length - 1 ? prev + 1 : prev));
    }, 1800);

    return () => clearInterval(interval);
  }, [isLoading]);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-md transition-all">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-2xl border border-slate-100 text-center animate-in fade-in zoom-in-95 duration-200">
        <div className="relative inline-flex items-center justify-center mb-6">
          <div className="w-16 h-16 rounded-full bg-purple-50 flex items-center justify-center border border-purple-100">
            <Sparkles className="w-8 h-8 text-purple-600 animate-pulse" />
          </div>
          <Loader2 className="absolute -top-1 -right-1 w-6 h-6 text-purple-600 animate-spin" />
        </div>

        <h3 className="text-xl font-bold text-slate-900 mb-2">
          AI Investor is Analyzing...
        </h3>
        <p className="text-sm text-slate-500 mb-6">
          Running startup idea through venture scoring algorithms & OpenAI framework.
        </p>

        <div className="space-y-3 text-left bg-slate-50 p-4 rounded-xl border border-slate-100 mb-4">
          {STEPS.map((step, idx) => {
            const isDone = idx < currentStepIndex;
            const isCurrent = idx === currentStepIndex;
            return (
              <div key={idx} className="flex items-center gap-3 text-xs font-medium">
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                ) : isCurrent ? (
                  <Loader2 className="w-4 h-4 text-purple-600 animate-spin shrink-0" />
                ) : (
                  <div className="w-4 h-4 rounded-full border border-slate-300 shrink-0" />
                )}
                <span className={isDone ? "text-slate-700 line-through opacity-70" : isCurrent ? "text-purple-700 font-semibold" : "text-slate-400"}>
                  {step}
                </span>
              </div>
            );
          })}
        </div>

        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-purple-600 h-full transition-all duration-500 ease-out"
            style={{ width: `${((currentStepIndex + 1) / STEPS.length) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
}
