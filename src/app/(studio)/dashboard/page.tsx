"use client";

import React from "react";
import Link from "next/link";
import {
  Clapperboard,
  Film,
  TrendingUp,
  Users,
  MapPin,
  ArrowUpRight,
  ShieldCheck,
  Zap,
  Sliders,
  Play,
  Camera
} from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      {/* Top Mobile App Header */}
      <div className="flex items-center justify-between pt-1 pb-2">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-400">Studio Mission Control</span>
          <h1 className="text-2xl font-bold tracking-tight text-white mt-0.5">Neon Horizon</h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Live Prep
          </span>
        </div>
      </div>

      {/* Hero Featured Card (Inspired by Dribbble Smart Camera / Live Monitor Card) */}
      <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-gradient-to-b from-[#18231c]/90 to-[#0e1611]/95 p-5 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-emerald-400">
              <Camera className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs text-zinc-400">Active Camera Setup</p>
              <h3 className="text-sm font-semibold text-white">RED V-Raptor 8K VV</h3>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping" />
            Rec Sync
          </span>
        </div>

        {/* 16:9 Live Preview Slate */}
        <div className="w-full aspect-video rounded-2xl bg-gradient-to-br from-zinc-900 via-[#122017] to-zinc-950 border border-white/10 flex flex-col justify-between p-4 relative overflow-hidden group">
          <div className="flex justify-between items-center text-[10px] font-mono text-zinc-400">
            <span>SCENE 04 / TAKE 02</span>
            <span>FPS: 24.00 · ISO 800</span>
          </div>

          <div className="flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-emerald-500/90 text-black flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform cursor-pointer">
              <Play className="w-5 h-5 ml-0.5 fill-black" />
            </div>
          </div>

          <div className="flex justify-between items-end">
            <div>
              <p className="text-xs font-semibold text-white">Subway Chase Sequence</p>
              <p className="text-[10px] text-zinc-400">Exterior · Night · Cyberpunk Alley</p>
            </div>
            <Link href="/storyboard" className="text-[10px] text-emerald-400 hover:underline flex items-center gap-0.5">
              <span>Storyboard</span>
              <ArrowUpRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Tiles (2-Column Grid on Mobile, 4 on Tablet/Desktop) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {/* Screenplay */}
        <Link href="/breakdown" className="rounded-2xl p-4 bg-white/[0.03] border border-white/10 hover:border-emerald-500/30 backdrop-blur-xl transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400">
            <Clapperboard className="w-4 h-4 text-emerald-400" />
            <ArrowUpRight className="w-3.5 h-3.5" />
          </div>
          <div className="mt-4">
            <h4 className="text-xl font-bold text-white tracking-tight">18</h4>
            <p className="text-[11px] text-zinc-400 font-medium">Scenes Parsed</p>
            <p className="text-[9px] text-emerald-400 mt-1 font-mono">94.2% Regex + LLM</p>
          </div>
        </Link>

        {/* Storyboard */}
        <Link href="/storyboard" className="rounded-2xl p-4 bg-white/[0.03] border border-white/10 hover:border-emerald-500/30 backdrop-blur-xl transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400">
            <Film className="w-4 h-4 text-emerald-400" />
            <ArrowUpRight className="w-3.5 h-3.5" />
          </div>
          <div className="mt-4">
            <h4 className="text-xl font-bold text-white tracking-tight">24</h4>
            <p className="text-[11px] text-zinc-400 font-medium">Shot Cards</p>
            <p className="text-[9px] text-emerald-400 mt-1 font-mono">16:9 Widescreen</p>
          </div>
        </Link>

        {/* Financials */}
        <Link href="/financials" className="rounded-2xl p-4 bg-white/[0.03] border border-white/10 hover:border-emerald-500/30 backdrop-blur-xl transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <ArrowUpRight className="w-3.5 h-3.5" />
          </div>
          <div className="mt-4">
            <h4 className="text-xl font-bold text-emerald-400 tracking-tight">+$14.5k</h4>
            <p className="text-[11px] text-zinc-400 font-medium">Net Variance</p>
            <p className="text-[9px] text-emerald-400 mt-1 font-mono">&lt;50ms Realtime</p>
          </div>
        </Link>

        {/* Roster */}
        <Link href="/roster" className="rounded-2xl p-4 bg-white/[0.03] border border-white/10 hover:border-emerald-500/30 backdrop-blur-xl transition-all flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400">
            <Users className="w-4 h-4 text-emerald-400" />
            <ArrowUpRight className="w-3.5 h-3.5" />
          </div>
          <div className="mt-4">
            <h4 className="text-xl font-bold text-white tracking-tight">32</h4>
            <p className="text-[11px] text-zinc-400 font-medium">Active Crew</p>
            <p className="text-[9px] text-emerald-400 mt-1 font-mono">$8,450/day</p>
          </div>
        </Link>
      </div>

      {/* Quick Action Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <Link href="/breakdown" className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-emerald-500/40 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <Zap className="w-4 h-4" />
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-semibold text-white truncate">Run Script Parser</p>
            <p className="text-[10px] text-zinc-400 truncate">Dual Regex vs LLM</p>
          </div>
        </Link>

        <Link href="/locations" className="p-3.5 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-emerald-500/40 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
            <MapPin className="w-4 h-4" />
          </div>
          <div className="overflow-hidden">
            <p className="text-xs font-semibold text-white truncate">Scouted Locations</p>
            <p className="text-[10px] text-zinc-400 truncate">4 Sites Locked</p>
          </div>
        </Link>
      </div>
    </div>
  );
}