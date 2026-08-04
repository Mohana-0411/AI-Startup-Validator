import React from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, ShieldCheck, Zap, BarChart3, Target, Compass, CheckCircle2, TrendingUp, Cpu } from "lucide-react";
import { Footer } from "@/components/Footer";
import { demoLoginAction } from "@/app/actions/authActions";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Hero Section */}
      <section className="relative pt-16 pb-20 md:pt-24 md:pb-28 overflow-hidden">
        {/* Subtle Background Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-purple-200/40 rounded-full blur-3xl -z-10 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-xs font-semibold mb-8 animate-in fade-in slide-in-from-bottom-3 duration-500">
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span>Powered by OpenAI & VC Investor Scored Matrix</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight max-w-4xl mx-auto leading-[1.15] mb-6">
            Validate Your Startup Idea <br />
            <span className="purple-gradient-text">With AI Investor Precision</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
            Stop guessing your market potential. Get an instant, structured validation report covering market size, SWAT risks, business model scalability, and actionable next steps.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link
              href="/signup"
              className="w-full sm:w-auto px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-lg shadow-purple-600/30 transition-all hover:scale-[1.02] flex items-center justify-center gap-2 text-base"
            >
              Analyze Your Startup Free
              <ArrowRight className="w-5 h-5" />
            </Link>

            <form action={demoLoginAction} className="w-full sm:w-auto">
              <button
                type="submit"
                className="w-full sm:w-auto px-7 py-4 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold rounded-xl border border-slate-200 transition-all flex items-center justify-center gap-2 text-base"
              >
                <Zap className="w-4 h-4 text-purple-600" />
                Try Interactive Demo
              </button>
            </form>
          </div>

          {/* Interactive Live Sample Card Preview */}
          <div className="max-w-4xl mx-auto bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xl shadow-slate-200/50 text-left relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-purple-500 via-purple-600 to-indigo-600" />
            
            <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-slate-900">Sample Analysis: EcoPack AI</h3>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Score 88/100
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">Biodegradable smart packaging for direct-to-consumer ecommerce</p>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                <ShieldCheck className="w-4 h-4 text-purple-600" />
                Verified VC Matrix
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-6 border-b border-slate-100">
              <div className="bg-purple-50/50 p-3 rounded-xl border border-purple-100">
                <p className="text-[11px] font-semibold text-purple-900 uppercase">Market Potential</p>
                <p className="text-lg font-bold text-purple-700">92/100</p>
                <p className="text-[11px] text-slate-500">High TAM growth</p>
              </div>
              <div className="bg-emerald-50/50 p-3 rounded-xl border border-emerald-100">
                <p className="text-[11px] font-semibold text-emerald-900 uppercase">Problem Validation</p>
                <p className="text-lg font-bold text-emerald-700">90/100</p>
                <p className="text-[11px] text-slate-500">Acute pain point</p>
              </div>
              <div className="bg-purple-50/50 p-3 rounded-xl border border-purple-100">
                <p className="text-[11px] font-semibold text-purple-900 uppercase">Solution Quality</p>
                <p className="text-lg font-bold text-purple-700">85/100</p>
                <p className="text-[11px] text-slate-500">Proprietary IP</p>
              </div>
              <div className="bg-amber-50/50 p-3 rounded-xl border border-amber-100">
                <p className="text-[11px] font-semibold text-amber-900 uppercase">Competition Level</p>
                <p className="text-lg font-bold text-amber-700">74/100</p>
                <p className="text-[11px] text-slate-500">Medium Rivalry</p>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between text-xs text-slate-500">
              <span>Included: 5 Strengths, 3 SWAT Risks, 5 Actionable Next Steps</span>
              <Link href="/signup" className="text-purple-600 font-semibold hover:underline flex items-center gap-1">
                Run your own analysis →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-slate-50/70 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-extrabold uppercase tracking-widest text-purple-600 mb-2">Features</h2>
            <p className="text-3xl font-extrabold text-slate-900 sm:text-4xl">
              Everything You Need to Pitch & Execute With Confidence
            </p>
            <p className="text-base text-slate-600 mt-3">
              Built on institutional venture capital scoring criteria used by top silicon valley seed funds.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 mb-6 border border-purple-100">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Overall Score (/100) & Sub-Metrics</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Color-coded score breakdown across Market Potential, Problem Urgency, Solution Viability, and Unit Economics.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 mb-6 border border-purple-100">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">SWAT Matrix & Risk Assessment</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Identify hidden weaknesses, market threats, key competitive moats, and growth opportunities before spending capital.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 mb-6 border border-purple-100">
                <Compass className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Actionable Execution Roadmap</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Get step-by-step next steps covering user interviews, landing page MVP setup, pricing tests, and channel strategy.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-extrabold uppercase tracking-widest text-purple-600 mb-2">Process</h2>
            <p className="text-3xl font-extrabold text-slate-900 sm:text-4xl">
              3 Steps From Idea to Structured Insights
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="flex flex-col items-center text-center p-6">
              <div className="w-14 h-14 rounded-2xl bg-purple-600 text-white font-extrabold text-xl flex items-center justify-center shadow-lg shadow-purple-600/20 mb-6">
                1
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Input Startup Details</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Fill in your startup name, core problem, proposed solution, target audience, business model, and competitors.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-6">
              <div className="w-14 h-14 rounded-2xl bg-purple-600 text-white font-extrabold text-xl flex items-center justify-center shadow-lg shadow-purple-600/20 mb-6">
                2
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">AI Investor Processing</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                OpenAI parses your inputs through VC investor criteria, calculating risk factors and market potential.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-6">
              <div className="w-14 h-14 rounded-2xl bg-purple-600 text-white font-extrabold text-xl flex items-center justify-center shadow-lg shadow-purple-600/20 mb-6">
                3
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Get Actionable Report</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Receive your color-coded scorecards, detailed SWAT analysis, and step-by-step roadmap to start building.
              </p>
            </div>
          </div>
        </div>
      </section>



      {/* CTA Banner */}
      <section className="py-16 bg-purple-600 text-white text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-extrabold mb-4">Ready to Validate Your Next Big Idea?</h2>
          <p className="text-purple-100 text-base mb-8 max-w-xl mx-auto">
            Join thousands of founders using AI Startup Analyzer to turn raw concepts into venture-ready startups.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-purple-700 font-bold rounded-xl shadow-lg hover:bg-purple-50 transition-all text-base"
          >
            Start Free Analysis Now
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
