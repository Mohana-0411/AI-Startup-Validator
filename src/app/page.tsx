import React from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, ShieldCheck, Zap, BarChart3, Target, Compass } from "lucide-react";
import { Footer } from "@/components/Footer";
import { SampleShowcase } from "@/components/SampleShowcase";
import { demoLoginAction } from "@/app/actions/authActions";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white font-sans">
      {/* Hero Section */}
      <section className="relative pt-16 pb-20 md:pt-24 md:pb-28 overflow-hidden">
        {/* Subtle Background Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-purple-200/40 rounded-full blur-3xl -z-10 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Top Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-50 border border-purple-200 text-purple-700 text-xs font-bold mb-8 animate-in fade-in slide-in-from-bottom-3 duration-500">
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span>Industry-Aware AI Venture Intelligence</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight max-w-4xl mx-auto leading-[1.15] mb-6">
            AI Startup Validator
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-slate-700 max-w-3xl mx-auto mb-4 leading-relaxed font-bold">
            Validate any new venture with AI-powered analysis, industry-aware insights, competitor intelligence, health scoring, and execution roadmaps.
          </p>

          {/* Supporting Sentence */}
          <p className="text-sm sm:text-base text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed font-medium">
            Whether you&apos;re building an AI startup, launching a local business, opening a restaurant, creating a fashion brand, starting a manufacturing company, or developing the next unicorn, our AI adapts to your industry automatically.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
            <Link
              href="/signup"
              className="w-full sm:w-auto px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white font-extrabold rounded-xl shadow-lg shadow-purple-600/30 transition-all hover:scale-[1.02] flex items-center justify-center gap-2 text-base"
            >
              Validate Your Idea Free
              <ArrowRight className="w-5 h-5" />
            </Link>

            <form action={demoLoginAction} className="w-full sm:w-auto">
              <button
                type="submit"
                className="w-full sm:w-auto px-7 py-4 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold rounded-xl border border-slate-200 transition-all flex items-center justify-center gap-2 text-base"
              >
                <Zap className="w-4 h-4 text-purple-600" />
                Try Interactive Demo
              </button>
            </form>
          </div>

          {/* Supports Every Industry Chips */}
          <div className="max-w-4xl mx-auto space-y-3 mb-16">
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400">
              Supports Every Industry
            </h3>
            <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-bold text-slate-700">
              <span className="px-3.5 py-1.5 bg-purple-50 text-purple-700 border border-purple-200 rounded-xl shadow-2xs">AI & SaaS</span>
              <span className="px-3.5 py-1.5 bg-slate-50 border border-slate-200/80 rounded-xl shadow-2xs">Healthcare</span>
              <span className="px-3.5 py-1.5 bg-slate-50 border border-slate-200/80 rounded-xl shadow-2xs">Education</span>
              <span className="px-3.5 py-1.5 bg-slate-50 border border-slate-200/80 rounded-xl shadow-2xs">Retail</span>
              <span className="px-3.5 py-1.5 bg-slate-50 border border-slate-200/80 rounded-xl shadow-2xs">Food & Beverage</span>
              <span className="px-3.5 py-1.5 bg-slate-50 border border-slate-200/80 rounded-xl shadow-2xs">Manufacturing</span>
              <span className="px-3.5 py-1.5 bg-slate-50 border border-slate-200/80 rounded-xl shadow-2xs">Agriculture</span>
              <span className="px-3.5 py-1.5 bg-slate-50 border border-slate-200/80 rounded-xl shadow-2xs">Finance</span>
              <span className="px-3.5 py-1.5 bg-slate-50 border border-slate-200/80 rounded-xl shadow-2xs">Real Estate</span>
              <span className="px-3.5 py-1.5 bg-slate-50 border border-slate-200/80 rounded-xl shadow-2xs">Construction</span>
              <span className="px-3.5 py-1.5 bg-slate-50 border border-slate-200/80 rounded-xl shadow-2xs">Travel</span>
              <span className="px-3.5 py-1.5 bg-slate-50 border border-slate-200/80 rounded-xl shadow-2xs">Beauty</span>
              <span className="px-3.5 py-1.5 bg-slate-50 border border-slate-200/80 rounded-xl shadow-2xs">Fashion</span>
              <span className="px-3.5 py-1.5 bg-slate-50 border border-slate-200/80 rounded-xl shadow-2xs">Entertainment</span>
              <span className="px-3.5 py-1.5 bg-slate-50 border border-slate-200/80 rounded-xl shadow-2xs">Professional Services</span>
              <span className="px-3.5 py-1.5 bg-slate-50 border border-slate-200/80 rounded-xl shadow-2xs">Logistics</span>
              <span className="px-3.5 py-1.5 bg-slate-50 border border-slate-200/80 rounded-xl shadow-2xs">E-Commerce</span>
              <span className="px-3.5 py-1.5 bg-slate-50 border border-slate-200/80 rounded-xl shadow-2xs">Local Businesses</span>
              <span className="px-3.5 py-1.5 bg-purple-600 text-white rounded-xl shadow-sm">100+ Industries</span>
            </div>
          </div>

          {/* Automatic Rotating Sample Showcase */}
          <SampleShowcase />
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-slate-50/70 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-extrabold uppercase tracking-widest text-purple-600 mb-2">Features</h2>
            <p className="text-3xl font-extrabold text-slate-900 sm:text-4xl">
              Domain Intelligence for Any Venture
            </p>
            <p className="text-base text-slate-600 mt-3">
              Our AI automatically adapts insights for tech startups, local shops, restaurants, manufacturing plants, and service businesses.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 mb-6 border border-purple-100">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Overall Score & Industry Sub-Metrics</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Color-coded score breakdown evaluating market size, location footfall, gross profit margins, and operational complexity.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 mb-6 border border-purple-100">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Industry Competitors & Moat Analysis</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Benchmark your venture against real local, regional, or global competitors with clear differentiation strategies.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 mb-6 border border-purple-100">
                <Compass className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-3">Custom Execution Roadmap</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Step-by-step milestones covering land lease locking, machinery procurement, FSSAI permits, D2C drops, or tech stack builds.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-16 bg-purple-600 text-white text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-extrabold mb-4">Ready to Validate Your Next Venture?</h2>
          <p className="text-purple-100 text-base mb-8 max-w-xl mx-auto">
            Join founders and entrepreneurs using AI Startup Validator to turn concepts into structured, profitable ventures.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-purple-700 font-extrabold rounded-xl shadow-lg hover:bg-purple-50 transition-all text-base"
          >
            Validate Your Idea Free
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
