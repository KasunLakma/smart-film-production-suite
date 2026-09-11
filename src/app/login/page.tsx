"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Clapperboard, Film, ArrowRight, Play, Sparkles, Database, ShieldCheck } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="relative min-h-screen bg-[#07160d] text-slate-100 overflow-x-hidden font-sans">
      {/* 1. Next.js Native Background Image with Controlled Opacity */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <Image
          src="/hero-bg.jpg"
          alt="eclat studio background"
          fill
          priority
          className="object-cover object-center opacity-45 scale-105"
        />
        {/* Deep emerald gradient overlay that blends smoothly */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#07160d]/80 via-transparent to-[#07160d]" />
        <div className="absolute inset-0 bg-[#07160d]/40" />
      </div>

      {/* 2. Glassmorphic Navigation Header */}
      <header className="sticky top-0 z-50 w-full bg-[#0d2818]/80 backdrop-blur-md border-b border-emerald-900/40 px-6 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.4)]">
            <Clapperboard className="w-4 h-4 text-white" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-serif font-bold tracking-tight text-white">eclat</span>
            <span className="text-[10px] font-mono tracking-widest text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/60">STUDIO</span>
          </div>
        </div>

        <nav className="hidden md:flex items-center gap-6 text-xs text-emerald-100/70 font-medium">
          <a href="#features" className="hover:text-emerald-300 transition-colors">Workspace</a>
          <a href="#features" className="hover:text-emerald-300 transition-colors">Script Breakdown</a>
          <a href="#features" className="hover:text-emerald-300 transition-colors">16:9 Storyboard</a>
          <a href="#features" className="hover:text-emerald-300 transition-colors">Budget Engine</a>
        </nav>

        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-xs text-emerald-200 hover:text-white transition-colors px-3 py-1.5">
            Login
          </Link>
          <Link
            href="/dashboard"
            className="text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 px-4 py-1.5 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all"
          >
            Sign Up
          </Link>
        </div>
      </header>

      {/* 3. Main Hero Viewport */}
      <main className="relative z-10 max-w-6xl mx-auto px-6 pt-20 pb-28 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-700/50 text-emerald-300 text-xs font-mono mb-8 shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>Next-Gen Pre-Production Engine</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-sans font-extrabold tracking-tight text-white max-w-4xl leading-[1.15]">
          Transform your great idea into a{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-300 via-emerald-400 to-teal-300 underline decoration-emerald-500/40 underline-offset-8">
            production-ready script
          </span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-emerald-100/80 max-w-2xl font-normal leading-relaxed">
          Unified screenplay text parsing, interactive 16:9 spatial visual boards, and real-time sub-50ms financial variance tracking for independent media creators.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/dashboard"
            className="group flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm px-7 py-3 rounded-full shadow-[0_0_25px_rgba(16,185,129,0.4)] transition-all transform hover:-translate-y-0.5"
          >
            <span>Enter eclat Studio</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
          <a
            href="#features"
            className="flex items-center gap-2 bg-[#0d2818]/80 hover:bg-[#143422] text-emerald-200 border border-emerald-800/70 text-sm px-6 py-3 rounded-full backdrop-blur-sm transition-all"
          >
            <Play className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" />
            <span>Explore Modules</span>
          </a>
        </div>

        {/* 4. Interactive Terminal Preview Card */}
        <div className="mt-16 w-full max-w-3xl rounded-xl bg-[#0d2818]/90 border border-emerald-800/60 p-5 shadow-2xl backdrop-blur-md text-left font-mono">
          <div className="flex items-center justify-between pb-3 border-b border-emerald-900/60 text-xs text-emerald-400/80">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-red-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-yellow-500/80 inline-block" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/80 inline-block" />
              <span className="ml-2 text-slate-400">eclat_parser_v1.sh</span>
            </div>
            <span className="bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800 text-[10px] text-emerald-300">
              1.2s RUNTIME
            </span>
          </div>

          <div className="mt-4 space-y-2 text-xs">
            <p className="text-emerald-300 font-semibold">SCENE 01: INT. CYBERNETIC ARCHIVE - NIGHT</p>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Holographic projections flicker against cold obsidian walls. MARCUS loads fresh rounds into his service REVOLVER.
            </p>
            <div className="pt-2 flex flex-wrap gap-2 text-[10px]">
              <span className="px-2 py-0.5 rounded bg-blue-950/80 border border-blue-800 text-blue-300">
                CHAR: MARCUS
              </span>
              <span className="px-2 py-0.5 rounded bg-purple-950/80 border border-purple-800 text-purple-300">
                PROP: REVOLVER
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-800 text-emerald-300">
                CAMERA: 16:9 24MM DOLLY
              </span>
            </div>
          </div>
        </div>

        {/* 5. Features Grid */}
        <div id="features" className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-5 w-full text-left">
          <div className="p-5 rounded-xl bg-[#0d2818]/70 border border-emerald-900/50 backdrop-blur-sm">
            <Database className="w-6 h-6 text-emerald-400 mb-3" />
            <h3 className="text-sm font-semibold text-white">Dual-Pipeline Parsing</h3>
            <p className="mt-1 text-xs text-slate-400 leading-relaxed">
              Zero-cost deterministic regular expressions for fast formatting, supported by an LLM extraction fallback.
            </p>
          </div>
          <div className="p-5 rounded-xl bg-[#0d2818]/70 border border-emerald-900/50 backdrop-blur-sm">
            <Film className="w-6 h-6 text-emerald-400 mb-3" />
            <h3 className="text-sm font-semibold text-white">16:9 Spatial Visualizer</h3>
            <p className="mt-1 text-xs text-slate-400 leading-relaxed">
              Direct scene-to-storyboard projection maintaining cinematic aspect ratios and camera tags.
            </p>
          </div>
          <div className="p-5 rounded-xl bg-[#0d2818]/70 border border-emerald-900/50 backdrop-blur-sm">
            <ShieldCheck className="w-6 h-6 text-emerald-400 mb-3" />
            <h3 className="text-sm font-semibold text-white">Live Variance Alerts</h3>
            <p className="mt-1 text-xs text-slate-400 leading-relaxed">
              Real-time calculations highlighting negative budget variances with active red warnings under 50ms.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}