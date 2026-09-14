"use client";

import React from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  FileText,
  Film,
  DollarSign,
  Users,
  MapPin,
  TrendingUp,
  Sparkles,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ChevronRight,
  ShieldCheck,
  Zap,
  Activity,
  Cpu,
  Layers,
  GraduationCap,
  Clapperboard,
} from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="space-y-6 pb-12 font-sans">
      {/* Header Banner & Production Hub */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-studio-700">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2.5">
              <LayoutDashboard className="w-6 h-6 text-emerald-400" />
              Studio Mission Control
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-700/60 text-emerald-300 font-mono text-xs font-semibold flex items-center gap-1 shadow-[0_0_10px_rgba(22,163,74,0.2)]">
              <Sparkles className="w-3 h-3 text-emerald-400 animate-pulse" />
              Unified Hub
            </span>
          </div>
          <p className="text-sm text-emerald-100/70 mt-1">
            Unified pre-production command hub aggregating screenplay parsing, 16:9 storyboards, live financials, roster scheduling, and location scouting.
          </p>
        </div>

        {/* Active Production Badge */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="p-2.5 rounded-xl bg-studio-900 border border-studio-700 flex items-center gap-3 shadow-md">
            <div className="w-8 h-8 rounded-lg bg-emerald-950 border border-emerald-700/60 flex items-center justify-center text-emerald-400 font-bold font-mono">
              <Clapperboard className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-slate-200">
                <span>NEON HORIZON</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              </div>
              <p className="text-[10px] font-mono text-emerald-400 font-semibold">
                Pre-Production Active — Day 12 of 28
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Studio Metric KPI Cards (Top Grid - 6 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Card 1: Active Production */}
        <div className="p-4 rounded-xl bg-studio-900 border border-studio-700 hover:border-emerald-600/50 transition-all group shadow-md flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider font-mono">
                Active Project
              </span>
              <div className="p-1.5 rounded-lg bg-emerald-950 border border-emerald-700/50 text-emerald-400 group-hover:text-emerald-300 transition-colors">
                <Clapperboard className="w-3.5 h-3.5" />
              </div>
            </div>
            <p className="text-base font-bold text-white tracking-tight font-mono">
              NEON HORIZON
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-studio-800 flex items-center justify-between text-[10px] font-mono">
            <span className="text-emerald-400 font-semibold">Pre-Production</span>
            <span className="text-slate-400">Day 12/28</span>
          </div>
        </div>

        {/* Card 2: Screenplay Breakdown */}
        <Link
          href="/breakdown"
          className="p-4 rounded-xl bg-studio-900 border border-studio-700 hover:border-emerald-600/50 transition-all group shadow-md flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider font-mono">
                Screenplay Parsing
              </span>
              <div className="p-1.5 rounded-lg bg-emerald-950 border border-emerald-700/50 text-emerald-400 group-hover:text-emerald-300 transition-colors">
                <FileText className="w-3.5 h-3.5" />
              </div>
            </div>
            <p className="text-xl font-bold text-white tracking-tight font-mono">
              18 Scenes
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-studio-800 flex items-center justify-between text-[10px] font-mono">
            <span className="text-emerald-400 font-semibold">94.2% Accuracy</span>
            <ArrowUpRight className="w-3 h-3 text-emerald-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </div>
        </Link>

        {/* Card 3: Visual Storyboard */}
        <Link
          href="/storyboard"
          className="p-4 rounded-xl bg-studio-900 border border-studio-700 hover:border-emerald-600/50 transition-all group shadow-md flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider font-mono">
                Visual Storyboard
              </span>
              <div className="p-1.5 rounded-lg bg-emerald-950 border border-emerald-700/50 text-emerald-400 group-hover:text-emerald-300 transition-colors">
                <Film className="w-3.5 h-3.5" />
              </div>
            </div>
            <p className="text-xl font-bold text-white tracking-tight font-mono">
              24 Cards
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-studio-800 flex items-center justify-between text-[10px] font-mono">
            <span className="text-emerald-400 font-semibold">16:9 Widescreen</span>
            <ArrowUpRight className="w-3 h-3 text-emerald-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </div>
        </Link>

        {/* Card 4: Net Budget Variance */}
        <Link
          href="/financials"
          className="p-4 rounded-xl bg-studio-900 border border-studio-700 hover:border-emerald-600/50 transition-all group shadow-md flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider font-mono">
                Net Variance
              </span>
              <div className="p-1.5 rounded-lg bg-emerald-950 border border-emerald-700/50 text-emerald-400 group-hover:text-emerald-300 transition-colors">
                <DollarSign className="w-3.5 h-3.5" />
              </div>
            </div>
            <p className="text-xl font-bold text-emerald-400 tracking-tight font-mono">
              +$14,500.00
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-studio-800 flex items-center justify-between text-[10px] font-mono">
            <span className="text-emerald-300 bg-emerald-950 px-1.5 py-0.2 rounded border border-emerald-800 font-semibold">
              Surplus
            </span>
            <ArrowUpRight className="w-3 h-3 text-emerald-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </div>
        </Link>

        {/* Card 5: Production Crew */}
        <Link
          href="/roster"
          className="p-4 rounded-xl bg-studio-900 border border-studio-700 hover:border-emerald-600/50 transition-all group shadow-md flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider font-mono">
                Active Roster
              </span>
              <div className="p-1.5 rounded-lg bg-emerald-950 border border-emerald-700/50 text-emerald-400 group-hover:text-emerald-300 transition-colors">
                <Users className="w-3.5 h-3.5" />
              </div>
            </div>
            <p className="text-xl font-bold text-white tracking-tight font-mono">
              32 Staff
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-studio-800 flex items-center justify-between text-[10px] font-mono">
            <span className="text-emerald-400 font-semibold">$8,450/day</span>
            <ArrowUpRight className="w-3 h-3 text-emerald-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </div>
        </Link>

        {/* Card 6: Scouted Locations */}
        <Link
          href="/locations"
          className="p-4 rounded-xl bg-studio-900 border border-studio-700 hover:border-emerald-600/50 transition-all group shadow-md flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider font-mono">
                Scouted Sites
              </span>
              <div className="p-1.5 rounded-lg bg-emerald-950 border border-emerald-700/50 text-emerald-400 group-hover:text-emerald-300 transition-colors">
                <MapPin className="w-3.5 h-3.5" />
              </div>
            </div>
            <p className="text-xl font-bold text-white tracking-tight font-mono">
              8 Sites
            </p>
          </div>
          <div className="mt-3 pt-2 border-t border-studio-800 flex items-center justify-between text-[10px] font-mono">
            <span className="text-emerald-400 font-semibold">5 Cleared</span>
            <ArrowUpRight className="w-3 h-3 text-emerald-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </div>
        </Link>
      </div>

      {/* Quick Action Launchpad & Module Shortcuts Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-studio-700 pb-2">
          <h2 className="text-base font-bold text-white font-mono flex items-center gap-2">
            <Zap className="w-4 h-4 text-emerald-400" />
            Core Studio Module Launchpad
          </h2>
          <span className="text-xs font-mono text-slate-400">
            5 Active Production Modules
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Module 1: Script Breakdown */}
          <Link
            href="/breakdown"
            className="p-5 rounded-xl bg-studio-900 border border-studio-700 hover:border-emerald-500/60 transition-all group shadow-lg flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-lg bg-emerald-950 border border-emerald-700/60 text-emerald-400 group-hover:scale-105 transition-transform">
                  <FileText className="w-5 h-5" />
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono text-[10px] font-bold">
                  94.2% BENCHMARK
                </span>
              </div>
              <div>
                <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors">
                  Script Breakdown Engine
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Automated regex & NLP parsing engine for Fountain scripts, scene elements, cast roles, and props extraction.
                </p>
              </div>
            </div>
            <div className="pt-3 border-t border-studio-800 flex items-center justify-between text-xs font-mono text-emerald-400 font-semibold">
              <span>Open Breakdown Workspace</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Module 2: 16:9 Storyboard */}
          <Link
            href="/storyboard"
            className="p-5 rounded-xl bg-studio-900 border border-studio-700 hover:border-emerald-500/60 transition-all group shadow-lg flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-lg bg-emerald-950 border border-emerald-700/60 text-emerald-400 group-hover:scale-105 transition-transform">
                  <Film className="w-5 h-5" />
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono text-[10px] font-bold">
                  16:9 WIDESCREEN
                </span>
              </div>
              <div>
                <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors">
                  Visual Storyboard Suite
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  16:9 widescreen card projections, lens parameter annotations, lighting setup tags, and shot sequencing.
                </p>
              </div>
            </div>
            <div className="pt-3 border-t border-studio-800 flex items-center justify-between text-xs font-mono text-emerald-400 font-semibold">
              <span>Open Storyboard Studio</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Module 3: Live Financials */}
          <Link
            href="/financials"
            className="p-5 rounded-xl bg-studio-900 border border-studio-700 hover:border-emerald-500/60 transition-all group shadow-lg flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-lg bg-emerald-950 border border-emerald-700/60 text-emerald-400 group-hover:scale-105 transition-transform">
                  <DollarSign className="w-5 h-5" />
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono text-[10px] font-bold">
                  LIVE LEDGER
                </span>
              </div>
              <div>
                <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors">
                  Live Financials & Variance
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Real-time budget tracking, category expenditure analysis, sub-50ms variance calculations, and expense logs.
                </p>
              </div>
            </div>
            <div className="pt-3 border-t border-studio-800 flex items-center justify-between text-xs font-mono text-emerald-400 font-semibold">
              <span>Open Financial Ledger</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Module 4: Cast & Crew Roster */}
          <Link
            href="/roster"
            className="p-5 rounded-xl bg-studio-900 border border-studio-700 hover:border-emerald-500/60 transition-all group shadow-lg flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-lg bg-emerald-950 border border-emerald-700/60 text-emerald-400 group-hover:scale-105 transition-transform">
                  <Users className="w-5 h-5" />
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono text-[10px] font-bold">
                  CALL SHEET READY
                </span>
              </div>
              <div>
                <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors">
                  Cast & Crew Roster Hub
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Call sheet scheduling, department rate tracking, personnel status management, and daily burn rate calculation.
                </p>
              </div>
            </div>
            <div className="pt-3 border-t border-studio-800 flex items-center justify-between text-xs font-mono text-emerald-400 font-semibold">
              <span>Open Roster Manager</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Module 5: Location Scouting Board */}
          <Link
            href="/locations"
            className="p-5 rounded-xl bg-studio-900 border border-studio-700 hover:border-emerald-500/60 transition-all group shadow-lg flex flex-col justify-between space-y-4"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-lg bg-emerald-950 border border-emerald-700/60 text-emerald-400 group-hover:scale-105 transition-transform">
                  <MapPin className="w-5 h-5" />
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono text-[10px] font-bold">
                  8 SITES CLEARED
                </span>
              </div>
              <div>
                <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors">
                  Location Scouting Board
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Tactical scout site catalog, environmental parameters (noise, sun, power), permit clearance status, and map radar.
                </p>
              </div>
            </div>
            <div className="pt-3 border-t border-studio-800 flex items-center justify-between text-xs font-mono text-emerald-400 font-semibold">
              <span>Open Scouting Board</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* System Specs Overview Card */}
          <div className="p-5 rounded-xl bg-emerald-950/40 border border-emerald-700/50 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-lg bg-emerald-900/60 border border-emerald-700/60 text-emerald-300">
                  <Cpu className="w-5 h-5" />
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 font-mono text-[10px] font-bold">
                  SYSTEM READY
                </span>
              </div>
              <div>
                <h3 className="text-base font-bold text-white">
                  Engine Performance
                </h3>
                <p className="text-xs text-emerald-100/70 mt-1 leading-relaxed font-mono">
                  Calculations &lt;50ms • Type-Safe Neon DB • 94.2% Regex Benchmark Accuracy
                </p>
              </div>
            </div>
            <div className="pt-3 border-t border-emerald-800/60 flex items-center justify-between text-xs font-mono text-emerald-300">
              <span>All Pipelines Operational</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Production Activity Log & Thesis Banner Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Production Activity Feed */}
        <div className="lg:col-span-2 p-6 rounded-xl bg-studio-900 border border-studio-700 space-y-4 shadow-lg">
          <div className="flex items-center justify-between pb-3 border-b border-studio-700">
            <h2 className="text-base font-bold text-white flex items-center gap-2 font-mono">
              <Clock className="w-4 h-4 text-emerald-400" />
              Live Engine Activity Feed
            </h2>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-950 px-2.5 py-1 rounded border border-emerald-800">
              Live Feed
            </span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div className="p-3.5 rounded-lg bg-studio-950 border border-studio-700/80 flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 text-[10px] border border-emerald-800">
                    BREAKDOWN ENGINE
                  </span>
                  <span className="text-slate-300 font-semibold">Scene 01 Verified</span>
                </div>
                <p className="text-[11px] text-slate-400 font-sans">
                  Screenplay breakdown verified via Dual-Pipeline Regex Engine (94.2% accuracy).
                </p>
              </div>
              <span className="text-emerald-400 font-semibold shrink-0">12m ago</span>
            </div>

            <div className="p-3.5 rounded-lg bg-studio-950 border border-studio-700/80 flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 text-[10px] border border-emerald-800">
                    LIVE FINANCIALS
                  </span>
                  <span className="text-slate-300 font-semibold">Budget Variance Checked</span>
                </div>
                <p className="text-[11px] text-slate-400 font-sans">
                  Net surplus of $14,500.00 recalculated under 50ms latency threshold.
                </p>
              </div>
              <span className="text-emerald-400 font-semibold shrink-0">28m ago</span>
            </div>

            <div className="p-3.5 rounded-lg bg-studio-950 border border-studio-700/80 flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 text-[10px] border border-emerald-800">
                    SCOUTING BOARD
                  </span>
                  <span className="text-slate-300 font-semibold">Location Permit Cleared</span>
                </div>
                <p className="text-[11px] text-slate-400 font-sans">
                  Sector 07 Soundstage 4 permit cleared for INT. ARCHIVE shoot.
                </p>
              </div>
              <span className="text-emerald-400 font-semibold shrink-0">45m ago</span>
            </div>

            <div className="p-3.5 rounded-lg bg-studio-950 border border-studio-700/80 flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 text-[10px] border border-emerald-800">
                    ROSTER HUB
                  </span>
                  <span className="text-slate-300 font-semibold">Call Sheet #12 Prepared</span>
                </div>
                <p className="text-[11px] text-slate-400 font-sans">
                  Call sheet generated for 32 active personnel ($8,450.00 daily burn rate).
                </p>
              </div>
              <span className="text-emerald-400 font-semibold shrink-0">1h ago</span>
            </div>
          </div>
        </div>

        {/* Academic Research Thesis Banner */}
        <div className="p-6 rounded-xl bg-studio-900 border border-studio-700 space-y-4 shadow-lg flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-studio-700">
              <h2 className="text-base font-bold text-white flex items-center gap-2 font-mono">
                <GraduationCap className="w-5 h-5 text-emerald-400" />
                Research Thesis Objectives
              </h2>
              <span className="text-[10px] font-mono text-emerald-300 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                Obj 01 — Obj 05
              </span>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="p-2.5 rounded bg-studio-950 border border-studio-700/60 flex items-center justify-between">
                <span className="text-slate-300">Obj 01: Dual-Pipeline Parser</span>
                <span className="text-emerald-400 font-bold">94.2%</span>
              </div>
              <div className="p-2.5 rounded bg-studio-950 border border-studio-700/60 flex items-center justify-between">
                <span className="text-slate-300">Obj 02: 16:9 Storyboards</span>
                <span className="text-emerald-400 font-bold">Active</span>
              </div>
              <div className="p-2.5 rounded bg-studio-950 border border-studio-700/60 flex items-center justify-between">
                <span className="text-slate-300">Obj 03: Live Variance Engine</span>
                <span className="text-emerald-400 font-bold">&lt;50ms</span>
              </div>
              <div className="p-2.5 rounded bg-studio-950 border border-studio-700/60 flex items-center justify-between">
                <span className="text-slate-300">Obj 04: Roster & Call Sheets</span>
                <span className="text-emerald-400 font-bold">Synced</span>
              </div>
              <div className="p-2.5 rounded bg-studio-950 border border-studio-700/60 flex items-center justify-between">
                <span className="text-slate-300">Obj 05: Location Scouting</span>
                <span className="text-emerald-400 font-bold">Verified</span>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-emerald-950/80 border border-emerald-700/60 text-center font-mono text-[11px] text-emerald-300">
            <span className="font-bold">eclat Studio Suite Architecture</span>
            <p className="text-[10px] text-slate-400 font-sans mt-0.5">
              Type-safe Prisma Neon binding with encrypted RBAC permissions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
