"use client";

import React from "react";
import Link from "next/link";
import { Clapperboard, ArrowRight, ShieldCheck, KeyRound, Mail } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#0d2818] text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans selection:bg-emerald-500 selection:text-white">
      {/* Background Lighting */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-emerald-600/15 rounded-full blur-[140px]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(5,15,10,0.85)_100%)]" />
      </div>

      {/* Header */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-800 p-[1px] shadow-[0_0_15px_rgba(22,163,74,0.3)]">
            <div className="w-full h-full bg-[#0d2818] rounded-[11px] flex items-center justify-center">
              <Clapperboard className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-serif-display text-3xl font-bold tracking-tight text-white">
              eclat
            </span>
            <span className="text-[10px] tracking-[0.22em] font-mono px-2 py-0.5 rounded bg-emerald-950/90 border border-emerald-700/50 text-emerald-400 font-semibold uppercase">
              STUDIO
            </span>
          </div>
        </Link>

        <Link
          href="/"
          className="text-sm text-emerald-300 hover:text-white font-medium transition-colors"
        >
          ← Back to Home
        </Link>
      </header>

      {/* Login Card */}
      <main className="relative z-10 max-w-md w-full mx-auto px-6 py-12 flex-1 flex flex-col justify-center">
        <div className="bg-[#143422]/60 border border-emerald-800/50 backdrop-blur-md rounded-2xl p-8 shadow-[0_20px_50px_rgba(0,0,0,0.6)] space-y-6">
          <div className="text-center space-y-2">
            <h1 className="font-serif-display text-3xl font-bold text-white">
              Welcome back
            </h1>
            <p className="text-sm text-emerald-100/70">
              Sign in to access your eclat production workspace
            </p>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              window.location.href = "/dashboard";
            }}
            className="space-y-4"
          >
            <div className="space-y-1.5">
              <label className="text-xs font-mono text-emerald-300 font-medium">
                PRODUCTION EMAIL
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-emerald-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  defaultValue="producer@eclat.studio"
                  required
                  className="w-full bg-[#0a1f13] border border-emerald-800/60 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-emerald-700 focus:outline-none focus:border-emerald-500 transition-colors font-mono"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center text-xs font-mono">
                <label className="text-emerald-300 font-medium">PASSWORD</label>
                <span className="text-emerald-500/80 hover:text-emerald-300 cursor-pointer">
                  Forgot?
                </span>
              </div>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-emerald-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  defaultValue="••••••••••••"
                  required
                  className="w-full bg-[#0a1f13] border border-emerald-800/60 rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-emerald-700 focus:outline-none focus:border-emerald-500 transition-colors font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-3 rounded-xl shadow-[0_0_20px_rgba(22,163,74,0.4)] transition-all flex items-center justify-center gap-2 text-sm mt-2"
            >
              <span>Enter Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-4 border-t border-emerald-900/50 text-center text-xs text-emerald-300/60 flex items-center justify-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Encrypted Studio Session</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-6 text-center text-xs text-emerald-400/50 font-mono">
        © {new Date().getFullYear()} eclat film production workspace
      </footer>
    </div>
  );
}
