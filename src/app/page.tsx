import React from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, ShieldCheck, Zap, BarChart3, Target, Compass, CheckCircle2, Building2, Store, Utensils, Stethoscope, GraduationCap, Factory, ShoppingCart, Briefcase, Cpu } from "lucide-react";
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
            <span>AI Startup Validator • Multi-Industry AI Business Analysis Engine</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight max-w-4xl mx-auto leading-[1.15] mb-6">
            AI Startup Validator
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl text-slate-700 max-w-3xl mx-auto mb-4 leading-relaxed font-semibold">
            Validate any startup or business idea with AI-powered analysis, industry-specific insights, competitor intelligence, health scoring, and actionable execution roadmaps.
          </p>

          {/* Short Description */}
          <p className="text-sm sm:text-base text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            Analyze startups, small businesses, local businesses, digital products, and traditional business ideas using AI.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
            <Link
              href="/signup"
              className="w-full sm:w-auto px-8 py-4 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl shadow-lg shadow-purple-600/30 transition-all hover:scale-[1.02] flex items-center justify-center gap-2 text-base"
            >
              Analyze Your Business Idea Free
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

          {/* Supported Business Types Pill Carousel */}
          <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-center gap-2 mb-16 text-xs font-semibold text-slate-600 bg-slate-50/80 p-4 rounded-2xl border border-slate-200/80">
            <span className="text-purple-700 font-extrabold mr-2">Supports:</span>
            <span className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-slate-800 shadow-2xs">✓ Tech Startups</span>
            <span className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-slate-800 shadow-2xs">✓ Local Businesses</span>
            <span className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-slate-800 shadow-2xs">✓ Retail</span>
            <span className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-slate-800 shadow-2xs">✓ Food & Beverage</span>
            <span className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-slate-800 shadow-2xs">✓ Healthcare</span>
            <span className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-slate-800 shadow-2xs">✓ Education</span>
            <span className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-slate-800 shadow-2xs">✓ Manufacturing</span>
            <span className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-slate-800 shadow-2xs">✓ E-Commerce</span>
            <span className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-slate-800 shadow-2xs">✓ Service Businesses</span>
            <span className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-slate-800 shadow-2xs">✓ AI Products</span>
          </div>

          {/* Interactive Live Sample Card Preview */}
          <div className="max-w-4xl mx-auto bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xl shadow-slate-200/50 text-left relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-purple-500 via-purple-600 to-indigo-600" />
            
            <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold text-slate-900">Sample Analysis: Artisanal Panipuri Express</h3>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Score 86/100
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">Hygienic quick-service street food counter with standardized recipes & FSSAI licensing</p>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                <ShieldCheck className="w-4 h-4 text-purple-600" />
                Food Business Consultant Verified
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-6 border-b border-slate-100">
              <div className="bg-purple-50/50 p-3 rounded-xl border border-purple-100">
                <p className="text-[11px] font-semibold text-purple-900 uppercase">Footfall & Location</p>
                <p className="text-lg font-bold text-purple-700">92/100</p>
                <p className="text-[11px] text-slate-500">High daily traffic</p>
              </div>
              <div className="bg-emerald-50/50 p-3 rounded-xl border border-emerald-100">
                <p className="text-[11px] font-semibold text-emerald-900 uppercase">Gross Margins</p>
                <p className="text-lg font-bold text-emerald-700">90/100</p>
                <p className="text-[11px] text-slate-500">68%+ Gross Margin</p>
              </div>
              <div className="bg-purple-50/50 p-3 rounded-xl border border-purple-100">
                <p className="text-[11px] font-semibold text-purple-900 uppercase">Recipe Taste Standards</p>
                <p className="text-lg font-bold text-purple-700">88/100</p>
                <p className="text-[11px] text-slate-500">Standardized flavor</p>
              </div>
              <div className="bg-amber-50/50 p-3 rounded-xl border border-amber-100">
                <p className="text-[11px] font-semibold text-amber-900 uppercase">Licensing Readiness</p>
                <p className="text-lg font-bold text-amber-700">82/100</p>
                <p className="text-[11px] text-slate-500">FSSAI Compliant</p>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between text-xs text-slate-500">
              <span>Included: FSSAI License Roadmap, Taste Standardization Guide, Footfall Analysis</span>
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
              Tailored Intelligence for Every Business Category
            </p>
            <p className="text-base text-slate-600 mt-3">
              Our AI automatically adapts advice for tech startups, local shops, restaurants, manufacturing plants, and service businesses.
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

      {/* Process Section */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-extrabold uppercase tracking-widest text-purple-600 mb-2">Process</h2>
            <p className="text-3xl font-extrabold text-slate-900 sm:text-4xl">
              3 Steps From Concept to Execution Plan
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="flex flex-col items-center text-center p-6">
              <div className="w-14 h-14 rounded-2xl bg-purple-600 text-white font-extrabold text-xl flex items-center justify-center shadow-lg shadow-purple-600/20 mb-6">
                1
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Input Business Details</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Describe your startup name, core problem, solution, target audience, business model, and region.
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-6">
              <div className="w-14 h-14 rounded-2xl bg-purple-600 text-white font-extrabold text-xl flex items-center justify-center shadow-lg shadow-purple-600/20 mb-6">
                2
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">AI Business Expert Classification</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                AI classifies your venture and selects the ideal domain consultant persona (e.g. Restaurant, Retail, Agribusiness, SaaS).
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-6">
              <div className="w-14 h-14 rounded-2xl bg-purple-600 text-white font-extrabold text-xl flex items-center justify-center shadow-lg shadow-purple-600/20 mb-6">
                3
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Get Industry-Specific Analysis</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Receive customized scorecards, Business DNA, stage progress timeline, competitor matrix, and execution steps.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-16 bg-purple-600 text-white text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-extrabold mb-4">Ready to Validate Your Startup or Business Idea?</h2>
          <p className="text-purple-100 text-base mb-8 max-w-xl mx-auto">
            Join founders and small business owners using AI Startup Validator to turn ideas into structured, profitable ventures.
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
