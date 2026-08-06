"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ShieldCheck, ArrowRight, Sparkles } from "lucide-react";

interface SampleItem {
  name: string;
  category: string;
  score: number;
  description: string;
  consultant: string;
  metrics: { label: string; score: string; detail: string }[];
}

const SAMPLES: SampleItem[] = [
  {
    name: "AI Resume Builder",
    category: "AI & SaaS",
    score: 91,
    description: "Instant AI resume formatting and ATS keyword optimization tool",
    consultant: "SaaS & AI Growth Consultant",
    metrics: [
      { label: "Market TAM Potential", score: "94/100", detail: "High global demand" },
      { label: "User Onboarding", score: "92/100", detail: "< 60s activation" },
      { label: "SaaS Pricing Model", score: "88/100", detail: "Tiered subscription" },
      { label: "Tech Scalability", score: "90/100", detail: "Cloud serverless" },
    ],
  },
  {
    name: "Artisanal Panipuri Express",
    category: "Food & Beverage",
    score: 86,
    description: "Hygienic quick-service street food counter with 6 mineral water flavors",
    consultant: "Restaurant & Food Business Consultant",
    metrics: [
      { label: "Footfall & Location", score: "92/100", detail: "High daily traffic" },
      { label: "Gross Profit Margin", score: "90/100", detail: "68%+ Gross Margin" },
      { label: "Recipe Standardization", score: "88/100", detail: "Uniform taste" },
      { label: "FSSAI Licensing", score: "82/100", detail: "Permits ready" },
    ],
  },
  {
    name: "Organic Harvest Farm",
    category: "Agribusiness",
    score: 88,
    description: "Pesticide-free certified organic farm with direct mandi and subscription off-take",
    consultant: "Agribusiness & Farm Operations Consultant",
    metrics: [
      { label: "Soil Yield Quality", score: "90/100", detail: "Drip irrigated" },
      { label: "Organic Certification", score: "92/100", detail: "NPOP Compliant" },
      { label: "Post-Harvest Transit", score: "84/100", detail: "Cold storage" },
      { label: "Wholesale Margin", score: "86/100", detail: "Premium pricing" },
    ],
  },
  {
    name: "Urban Streetwear Brand",
    category: "Fashion & Apparel",
    score: 87,
    description: "D2C clothing brand with limited social media drops and sample batch testing",
    consultant: "Fashion & Retail Business Consultant",
    metrics: [
      { label: "Fabric & Stitch Quality", score: "90/100", detail: "Sample approved" },
      { label: "Influencer Seeding", score: "88/100", detail: "High viral reach" },
      { label: "Return Logistics", score: "84/100", detail: "< 8% return rate" },
      { label: "D2C Gross Margin", score: "86/100", detail: "72%+ Gross Margin" },
    ],
  },
  {
    name: "MedPulse Hospital System",
    category: "Healthcare Tech",
    score: 93,
    description: "Cloud EHR and multi-specialty clinical workflow management software",
    consultant: "Healthcare Systems Consultant",
    metrics: [
      { label: "EHR Compliance", score: "95/100", detail: "HIPAA / HL7 certified" },
      { label: "Diagnostic Accuracy", score: "92/100", detail: "Clinical precision" },
      { label: "Hospital Integration", score: "90/100", detail: "API interoperable" },
      { label: "Bed Occupancy", score: "88/100", detail: "Capacity optimized" },
    ],
  },
];

export function SampleShowcase() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % SAMPLES.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const sample = SAMPLES[currentIndex];

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xl shadow-slate-200/50 text-left relative overflow-hidden transition-all duration-500">
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-purple-500 via-purple-600 to-indigo-600" />

      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-purple-100 text-purple-700 uppercase">
              {sample.category}
            </span>
            <h3 className="text-xl font-extrabold text-slate-900">{sample.name}</h3>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Score {sample.score}/100
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">{sample.description}</p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200/80">
          <ShieldCheck className="w-4 h-4 text-purple-600 shrink-0" />
          <span>{sample.consultant}</span>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-6 border-b border-slate-100">
        {sample.metrics.map((m, i) => (
          <div key={i} className="bg-purple-50/40 p-3 rounded-xl border border-purple-100/80 space-y-0.5">
            <p className="text-[11px] font-bold text-purple-950 uppercase">{m.label}</p>
            <p className="text-lg font-extrabold text-purple-700">{m.score}</p>
            <p className="text-[11px] text-slate-500 font-medium">{m.detail}</p>
          </div>
        ))}
      </div>

      {/* Footer Navigation & Dots */}
      <div className="pt-4 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-700">Auto Showcase:</span>
          <div className="flex items-center gap-1.5">
            {SAMPLES.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-2 rounded-full transition-all ${
                  idx === currentIndex ? "w-6 bg-purple-600" : "w-2 bg-slate-300 hover:bg-slate-400"
                }`}
                title={`Showcase ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        <Link href="/signup" className="text-purple-600 font-extrabold hover:underline flex items-center gap-1">
          Validate your venture →
        </Link>
      </div>
    </div>
  );
}
