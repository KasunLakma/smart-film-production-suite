"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  Film,
  Cpu,
  TrendingUp,
  Users,
  ArrowRight,
  Play,
  CheckCircle2,
  Clapperboard,
  Sliders,
  ShieldCheck,
  ChevronRight,
  X,
  MapPin,
  FileText,
  LayoutGrid,
  Zap,
} from "lucide-react";

export default function LandingPage() {
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"script" | "storyboard" | "financials">("script");

  return (
    <div className="relative min-h-screen bg-[#07160d] text-slate-100 flex flex-col justify-between overflow-hidden font-sans selection:bg-emerald-500 selection:text-white">
      {/* Fixed Background Image Container */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <img
          src="/hero-bg.jpg"
          alt="Cinematic Studio Background"
          className="w-full h-full object-cover object-center opacity-70 scale-100"
          onError={(e) => {
            // Fallback to direct production cinema photo if local path has naming mismatch
            e.currentTarget.src = "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?auto=format&fit=crop&w=2000&q=80";
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#07160d]/80 via-[#07160d]/40 to-[#07160d]" />
      </div>

      {/* Sticky Glassmorphism Navigation Bar */}
      <header className="sticky top-0 z-50 w-full bg-[#0d2818]/75 backdrop-blur-md border-b border-emerald-900/40 transition-all">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          {/* Left: Brand Identity */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-800 p-[1px] shadow-[0_0_15px_rgba(22,163,74,0.3)] transition-transform group-hover:scale-105">
              <div className="w-full h-full bg-[#0d2818] rounded-[11px] flex items-center justify-center">
                <Clapperboard className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="font-serif-display text-3xl font-bold tracking-tight text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.3)]">
                eclat
              </span>
              <span className="text-[10px] tracking-[0.22em] font-mono px-2 py-0.5 rounded bg-emerald-950/90 border border-emerald-700/50 text-emerald-400 font-semibold uppercase">
                STUDIO
              </span>
            </div>
          </Link>

          {/* Center: Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-[#143422]/50 border border-emerald-800/40 rounded-full px-4 py-1.5 backdrop-blur-sm shadow-inner">
            <Link
              href="/dashboard"
              className="px-4 py-1.5 text-sm text-slate-300 hover:text-emerald-400 hover:bg-emerald-950/60 rounded-full transition-all"
            >
              Workspace
            </Link>
            <Link
              href="/breakdown"
              className="px-4 py-1.5 text-sm text-slate-300 hover:text-emerald-400 hover:bg-emerald-950/60 rounded-full transition-all"
            >
              Script Breakdown
            </Link>
            <Link
              href="/storyboard"
              className="px-4 py-1.5 text-sm text-slate-300 hover:text-emerald-400 hover:bg-emerald-950/60 rounded-full transition-all"
            >
              16:9 Storyboard
            </Link>
            <Link
              href="/financials"
              className="px-4 py-1.5 text-sm text-slate-300 hover:text-emerald-400 hover:bg-emerald-950/60 rounded-full transition-all"
            >
              Budget Engine
            </Link>
          </nav>

          {/* Right: Actions */}
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm text-emerald-200/80 hover:text-white font-medium transition-colors px-3 py-1.5"
            >
              Login
            </Link>
            <Link
              href="/dashboard"
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium px-5 py-2.5 rounded-full shadow-[0_0_20px_rgba(22,163,74,0.35)] transition-all hover:scale-105 active:scale-95 flex items-center gap-1.5"
            >
              Sign Up
              <ChevronRight className="w-4 h-4 text-emerald-100" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Hero Viewport Section */}
      <main className="relative z-10 max-w-7xl mx-auto px-6 pt-12 pb-16 flex-1 flex flex-col justify-center items-center text-center">
        {/* Tagline Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-600/40 text-emerald-300 text-xs md:text-sm font-medium tracking-wide shadow-[0_0_15px_rgba(22,163,74,0.2)] mb-8 animate-fade-in">
          <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span>AI & Type-Safe Pre-Production Workspace</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span className="text-emerald-400 font-mono text-[11px]">v2.4 Ready</span>
        </div>

        {/* Main Headline */}
        <h1 className="font-serif-display text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white max-w-5xl leading-[1.12] mb-6 drop-shadow-[0_4px_25px_rgba(0,0,0,0.5)]">
          Transform your great idea into a{" "}
          <span className="bg-gradient-to-r from-emerald-200 via-white to-emerald-400 bg-clip-text text-transparent underline decoration-emerald-500/40 underline-offset-8">
            production-ready script
          </span>
        </h1>

        {/* Subheadline */}
        <p className="text-lg md:text-xl text-emerald-100/75 max-w-3xl font-light leading-relaxed mb-10">
          Unified screenplay parsing, 16:9 spatial visual boards, and real-time financial tracking for modern independent cinema.
        </p>

        {/* Primary & Secondary Call to Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14 w-full sm:w-auto">
          {/* Primary CTA */}
          <Link
            href="/dashboard"
            className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-8 py-3.5 rounded-full shadow-[0_0_25px_rgba(22,163,74,0.4)] transition-all flex items-center justify-center gap-2 group text-base hover:scale-[1.03] active:scale-[0.98]"
          >
            <span>Enter eclat Studio</span>
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </Link>

          {/* Secondary Showreel CTA */}
          <button
            onClick={() => setShowVideoModal(true)}
            className="w-full sm:w-auto bg-[#143422]/80 hover:bg-[#143422] text-emerald-200 border border-emerald-700/50 hover:border-emerald-500 font-medium px-7 py-3.5 rounded-full backdrop-blur-md transition-all flex items-center justify-center gap-2 text-base hover:text-white"
          >
            <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <Play className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400 ml-0.5" />
            </div>
            <span>Watch 16:9 Showreel</span>
          </button>
        </div>

        {/* Interactive Workspace Interactive Preview Mockup */}
        <div className="w-full max-w-5xl rounded-2xl bg-[#143422]/40 border border-emerald-800/40 p-2 sm:p-3 backdrop-blur-md shadow-[0_20px_50px_rgba(0,0,0,0.6)] relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500/20 via-emerald-700/10 to-emerald-500/20 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200" />
          
          <div className="relative rounded-xl bg-[#0a1f13] border border-emerald-900/60 overflow-hidden text-left">
            {/* Window Topbar Header */}
            <div className="h-11 bg-[#0d2818] border-b border-emerald-900/50 px-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-red-500/80 border border-red-600/40" />
                <span className="w-3 h-3 rounded-full bg-yellow-500/80 border border-yellow-600/40" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80 border border-emerald-600/40" />
                <span className="ml-3 text-xs font-mono text-emerald-400/70 truncate max-w-[200px] sm:max-w-none">
                  eclat-studio // standard_operating_procedure_v3.fountain
                </span>
              </div>

              {/* Tabs inside Header */}
              <div className="flex items-center gap-1 bg-[#07170e] p-1 rounded-lg border border-emerald-900/40 text-xs">
                <button
                  onClick={() => setActiveTab("script")}
                  className={`px-3 py-1 rounded-md transition-all font-medium flex items-center gap-1.5 ${
                    activeTab === "script"
                      ? "bg-emerald-700 text-white shadow-sm"
                      : "text-slate-400 hover:text-emerald-200"
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Parse</span>
                </button>
                <button
                  onClick={() => setActiveTab("storyboard")}
                  className={`px-3 py-1 rounded-md transition-all font-medium flex items-center gap-1.5 ${
                    activeTab === "storyboard"
                      ? "bg-emerald-700 text-white shadow-sm"
                      : "text-slate-400 hover:text-emerald-200"
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>16:9 Canvas</span>
                </button>
                <button
                  onClick={() => setActiveTab("financials")}
                  className={`px-3 py-1 rounded-md transition-all font-medium flex items-center gap-1.5 ${
                    activeTab === "financials"
                      ? "bg-emerald-700 text-white shadow-sm"
                      : "text-slate-400 hover:text-emerald-200"
                  }`}
                >
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>Ledger</span>
                </button>
              </div>
            </div>

            {/* Window Content Body */}
            <div className="p-6 min-h-[260px] flex flex-col justify-between">
              {activeTab === "script" && (
                <div className="space-y-4 animate-fade-in">
                  <div className="flex items-center justify-between border-b border-emerald-900/40 pb-3">
                    <div className="flex items-center gap-3">
                      <span className="px-2.5 py-1 rounded bg-emerald-900/40 border border-emerald-700/50 text-emerald-300 font-mono text-xs font-semibold">
                        SCENE 14
                      </span>
                      <h4 className="font-mono text-emerald-100 text-sm font-semibold tracking-wide">
                        INT. CYBERNETIC ARCHIVE - NIGHT
                      </h4>
                    </div>
                    <span className="text-xs font-mono text-emerald-400 bg-emerald-950 px-2.5 py-1 rounded-full border border-emerald-800/60">
                      ⚡ LLM Parsed in 42ms
                    </span>
                  </div>

                  <div className="font-mono text-xs text-slate-300 space-y-2 leading-relaxed">
                    <p className="text-slate-400 italic">
                      Holographic projections flicker against cold obsidian walls. ELENA (30s, tactical jacket) steps onto the metallic catwalk.
                    </p>
                    <div className="pl-6 border-l-2 border-emerald-600/50 my-2 py-1">
                      <span className="text-emerald-400 font-bold block">ELENA</span>
                      <p className="text-slate-200">
                        "If the core ledger drops below 50ms, the entire grid locks down."
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2">
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-900/30 text-emerald-300 border border-emerald-800/40">
                      Character: ELENA [Lead]
                    </span>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-900/30 text-emerald-300 border border-emerald-800/40">
                      Prop: Holographic Terminal
                    </span>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-900/30 text-emerald-300 border border-emerald-800/40">
                      VFX: Anamorphic Flare
                    </span>
                  </div>
                </div>
              )}

              {activeTab === "storyboard" && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 animate-fade-in">
                  <div className="aspect-video bg-[#07170e] border border-emerald-800/50 rounded-lg p-3 flex flex-col justify-between relative overflow-hidden group">
                    <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-emerald-950/90 text-[10px] font-mono text-emerald-400 border border-emerald-700/40">
                      16:9 FRAME A1
                    </div>
                    <div className="my-auto text-center">
                      <Film className="w-8 h-8 text-emerald-500/50 mx-auto mb-1 group-hover:scale-110 transition-transform" />
                      <span className="text-xs text-slate-300 font-mono">Wide Tracking Shot</span>
                    </div>
                    <div className="text-[10px] text-emerald-400/80 font-mono flex justify-between">
                      <span>Anamorphic 35mm</span>
                      <span>f/1.8</span>
                    </div>
                  </div>
                  <div className="aspect-video bg-[#07170e] border border-emerald-800/50 rounded-lg p-3 flex flex-col justify-between relative overflow-hidden group">
                    <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-emerald-950/90 text-[10px] font-mono text-emerald-400 border border-emerald-700/40">
                      16:9 FRAME A2
                    </div>
                    <div className="my-auto text-center">
                      <Clapperboard className="w-8 h-8 text-emerald-500/50 mx-auto mb-1 group-hover:scale-110 transition-transform" />
                      <span className="text-xs text-slate-300 font-mono">Over-The-Shoulder</span>
                    </div>
                    <div className="text-[10px] text-emerald-400/80 font-mono flex justify-between">
                      <span>50mm Prime</span>
                      <span>f/2.0</span>
                    </div>
                  </div>
                  <div className="aspect-video bg-[#07170e] border border-emerald-800/50 rounded-lg p-3 flex flex-col justify-between relative overflow-hidden group">
                    <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-emerald-950/90 text-[10px] font-mono text-emerald-400 border border-emerald-700/40">
                      16:9 FRAME A3
                    </div>
                    <div className="my-auto text-center">
                      <Sliders className="w-8 h-8 text-emerald-500/50 mx-auto mb-1 group-hover:scale-110 transition-transform" />
                      <span className="text-xs text-slate-300 font-mono">Extreme Close-Up</span>
                    </div>
                    <div className="text-[10px] text-emerald-400/80 font-mono flex justify-between">
                      <span>Macro 85mm</span>
                      <span>f/1.4</span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "financials" && (
                <div className="space-y-3 animate-fade-in">
                  <div className="flex items-center justify-between text-xs font-mono bg-[#07170e] p-3 rounded-lg border border-emerald-900/40">
                    <div>
                      <span className="text-slate-400 block">TOTAL PRODUCTION BUDGET</span>
                      <span className="text-lg font-bold text-white">$1,250,000</span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-400 block">REAL-TIME VARIANCE</span>
                      <span className="text-emerald-400 font-semibold flex items-center gap-1 justify-end">
                        <Zap className="w-3.5 h-3.5" /> +$4,200 (Surplus)
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    <div className="bg-[#07170e]/80 p-2.5 rounded border border-emerald-900/40 flex justify-between items-center">
                      <span className="text-slate-300">Camera Crew & Gear</span>
                      <span className="text-emerald-400 font-bold">$14,500 / day</span>
                    </div>
                    <div className="bg-[#07170e]/80 p-2.5 rounded border border-emerald-900/40 flex justify-between items-center">
                      <span className="text-slate-300">Permits & Security</span>
                      <span className="text-emerald-400 font-bold">$2,800 / day</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Lower Feature Showcase (Celtx-style mini cards) */}
      <footer className="relative z-10 max-w-7xl mx-auto px-6 pb-12 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Dual Parsing Engine */}
          <div className="bg-[#143422]/60 border border-emerald-800/40 backdrop-blur-sm rounded-xl p-5 hover:border-emerald-500/60 hover:bg-[#143422]/80 transition-all duration-300 group hover:-translate-y-1 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-950/80 border border-emerald-700/40 flex items-center justify-center text-emerald-400 group-hover:text-emerald-300 group-hover:border-emerald-500/60 transition-colors">
                <Cpu className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-emerald-900/50 text-emerald-300 border border-emerald-700/40">
                99.4% Extraction
              </span>
            </div>
            <h3 className="font-semibold text-white text-base mb-1.5 group-hover:text-emerald-300 transition-colors">
              Dual Parsing Engine
            </h3>
            <p className="text-xs text-slate-300/80 leading-relaxed">
              Hybrid Regex & LLM extraction instantly turns raw script files into structured scene breakdown sheets with high precision.
            </p>
          </div>

          {/* Card 2: 16:9 Spatial Storyboard Canvas */}
          <div className="bg-[#143422]/60 border border-emerald-800/40 backdrop-blur-sm rounded-xl p-5 hover:border-emerald-500/60 hover:bg-[#143422]/80 transition-all duration-300 group hover:-translate-y-1 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-950/80 border border-emerald-700/40 flex items-center justify-center text-emerald-400 group-hover:text-emerald-300 group-hover:border-emerald-500/60 transition-colors">
                <Film className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-emerald-900/50 text-emerald-300 border border-emerald-700/40">
                16:9 Widescreen
              </span>
            </div>
            <h3 className="font-semibold text-white text-base mb-1.5 group-hover:text-emerald-300 transition-colors">
              16:9 Spatial Canvas
            </h3>
            <p className="text-xs text-slate-300/80 leading-relaxed">
              Drag-and-drop widescreen visual layout boards with aspect-ratio locking, camera motion tags, and director annotations.
            </p>
          </div>

          {/* Card 3: Sub-50ms Financial Variance Alerts */}
          <div className="bg-[#143422]/60 border border-emerald-800/40 backdrop-blur-sm rounded-xl p-5 hover:border-emerald-500/60 hover:bg-[#143422]/80 transition-all duration-300 group hover:-translate-y-1 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-950/80 border border-emerald-700/40 flex items-center justify-center text-emerald-400 group-hover:text-emerald-300 group-hover:border-emerald-500/60 transition-colors">
                <TrendingUp className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-emerald-900/50 text-emerald-300 border border-emerald-700/40">
                &lt;50ms Latency
              </span>
            </div>
            <h3 className="font-semibold text-white text-base mb-1.5 group-hover:text-emerald-300 transition-colors">
              Sub-50ms Financial Alerts
            </h3>
            <p className="text-xs text-slate-300/80 leading-relaxed">
              Real-time budget ledger calculation that flags overages and daily rate changes before scene production locks down.
            </p>
          </div>

          {/* Card 4: Crew & Location Roster Integration */}
          <div className="bg-[#143422]/60 border border-emerald-800/40 backdrop-blur-sm rounded-xl p-5 hover:border-emerald-500/60 hover:bg-[#143422]/80 transition-all duration-300 group hover:-translate-y-1 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-950/80 border border-emerald-700/40 flex items-center justify-center text-emerald-400 group-hover:text-emerald-300 group-hover:border-emerald-500/60 transition-colors">
                <Users className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-emerald-900/50 text-emerald-300 border border-emerald-700/40">
                Live Roster Sync
              </span>
            </div>
            <h3 className="font-semibold text-white text-base mb-1.5 group-hover:text-emerald-300 transition-colors">
              Crew & Location Roster
            </h3>
            <p className="text-xs text-slate-300/80 leading-relaxed">
              Seamlessly link shooting locations, department heads, and call sheet notifications directly to parsed scene breakdowns.
            </p>
          </div>
        </div>

        {/* Bottom Copyright & Status Bar */}
        <div className="mt-8 pt-4 border-t border-emerald-900/40 flex flex-col sm:flex-row items-center justify-between text-xs text-emerald-200/60 gap-3 font-mono">
          <div>© {new Date().getFullYear()} eclat film production workspace. All rights reserved.</div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-emerald-300 font-semibold">Systems Operational</span>
            </span>
            <span>•</span>
            <Link href="/dashboard" className="hover:text-white transition-colors">
              Enter Workspace
            </Link>
          </div>
        </div>
      </footer>

      {/* Video / Showreel Modal Overlay */}
      {showVideoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
          <div className="relative w-full max-w-4xl bg-[#0a1f13] border border-emerald-700/50 rounded-2xl overflow-hidden shadow-2xl">
            {/* Modal Header */}
            <div className="p-4 bg-[#0d2818] border-b border-emerald-900/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clapperboard className="w-5 h-5 text-emerald-400" />
                <span className="font-serif-display text-lg font-bold text-white">
                  eclat — Cinematic Workflow Reel
                </span>
              </div>
              <button
                onClick={() => setShowVideoModal(false)}
                className="w-8 h-8 rounded-full bg-emerald-950 border border-emerald-800 text-emerald-400 hover:text-white flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Video Player Frame */}
            <div className="aspect-video bg-black flex items-center justify-center relative p-8 text-center">
              <div className="max-w-md space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-600/30 border border-emerald-500/50 mx-auto flex items-center justify-center text-emerald-400">
                  <Film className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-white">eclat Studio 16:9 Reel</h3>
                <p className="text-sm text-slate-300">
                  Experience full end-to-end script breakdown, live spatial storyboard layout, and instant sub-50ms financial ledger calculation.
                </p>
                <Link
                  href="/dashboard"
                  onClick={() => setShowVideoModal(false)}
                  className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-6 py-2.5 rounded-full shadow-[0_0_20px_rgba(22,163,74,0.4)] transition-all text-sm"
                >
                  <span>Launch Live Workspace</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
