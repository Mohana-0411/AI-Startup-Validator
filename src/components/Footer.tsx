import React from "react";
import Link from "next/link";
import { Sparkles, Github, Twitter, Linkedin } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full bg-white border-t border-slate-100 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-4 md:col-span-1">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center justify-center text-white">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-base font-bold text-slate-900">
                Startup<span className="text-purple-600">Analyzer</span>
              </span>
            </Link>
            <p className="text-xs text-slate-500 leading-relaxed">
              AI-powered startup validation framework for venture VCs, founders, and innovation labs. Validate your startup idea in seconds.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">Product</h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li><a href="#features" className="hover:text-purple-600 transition-colors">Features</a></li>
              <li><a href="#how-it-works" className="hover:text-purple-600 transition-colors">How It Works</a></li>
              <li><Link href="/dashboard/new" className="hover:text-purple-600 transition-colors">New Analysis</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">Framework</h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li><span className="text-slate-400">Market Potential</span></li>
              <li><span className="text-slate-400">SWAT Analysis</span></li>
              <li><span className="text-slate-400">Unit Economics</span></li>
              <li><span className="text-slate-400">Competitor Matrix</span></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">Connect</h4>
            <div className="flex items-center gap-3 text-slate-400">
              <a href="#" className="p-2 rounded-lg bg-slate-50 hover:bg-purple-50 hover:text-purple-600 transition-colors">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-slate-50 hover:bg-purple-50 hover:text-purple-600 transition-colors">
                <Linkedin className="w-4 h-4" />
              </a>
              <a href="#" className="p-2 rounded-lg bg-slate-50 hover:bg-purple-50 hover:text-purple-600 transition-colors">
                <Github className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© {new Date().getFullYear()} AI Startup Analyzer. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-slate-600 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-600 cursor-pointer">Terms of Service</span>
            <span className="hover:text-slate-600 cursor-pointer">Security</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
