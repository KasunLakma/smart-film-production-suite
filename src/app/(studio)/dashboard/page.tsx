"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Clapperboard,
  Film,
  DollarSign,
  Users,
  MapPin,
  Play,
  Pause,
  ChevronRight,
  Sliders,
  ShieldCheck,
  Video,
  Sparkles,
  ArrowUpRight,
  Disc3
} from "lucide-react";

export default function DashboardPage() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [shutterAngle, setShutterAngle] = useState(180);

  return (
    <div className="space-y-5 max-w-lg mx-auto pb-10">
      {/* 1. Sleek Top Bar (Title + Dynamic Island Style Status) */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <span className="text-[10px] font-mono tracking-widest text-emerald-400 uppercase font-semibold">eclat Core</span>
          <h1 className="text-xl font-bold tracking-tight text-white">Neon Horizon</h1>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#15221b] border border-emerald-500/20 shadow-inner">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[11px] font-mono font-medium text-emerald-300">REC READY</span>
        </div>
      </div>

      {/* 2. Hero Interactive Dial / Production Master Control (Photo 2 Reference) */}
      <div className="relative rounded-[32px] p-6 bg-gradient-to-b from-[#16201a] to-[#0c140f] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden">
        <div className="flex justify-between items-center mb-4">
          <span className="text-xs font-medium text-zinc-400 flex items-center gap-1.5">
            <Video className="w-3.5 h-3.5 text-emerald-400" />
            Active Feed · Scene 04
          </span>
          <span className="text-[11px] font-mono text-zinc-400 bg-black/40 px-2.5 py-0.5 rounded-full border border-white/5">
            24 FPS · 8K VV
          </span>
        </div>

        {/* Tactile Big Dial Controller */}
        <div className="flex flex-col items-center justify-center my-4">
          <div className="relative w-44 h-44 rounded-full bg-gradient-to-b from-[#213127] to-[#0a110d] p-3 shadow-[inset_0_4px_12px_rgba(255,255,255,0.08),0_15px_30px_rgba(0,0,0,0.9)] flex items-center justify-center border border-white/5">
            {/* Outer Progress Ring */}
            <div className="absolute inset-2 rounded-full border-2 border-dashed border-emerald-500/30 animate-[spin_60s_linear_infinite]" />

            {/* Center Dial Hub */}
            <div className="w-28 h-28 rounded-full bg-gradient-to-br from-[#1b2a21] to-[#080d0a] shadow-[0_10px_25px_rgba(0,0,0,0.8),inset_0_2px_4px_rgba(255,255,255,0.15)] flex flex-col items-center justify-center border border-emerald-500/20 text-center">
              <span className="text-2xl font-black text-white tracking-tighter">180°</span>
              <span className="text-[9px] font-mono uppercase text-emerald-400 tracking-wider">Shutter</span>
            </div>
          </div>
        </div>

        {/* Live Slate Quick Card */}
        <div className="mt-4 p-3.5 rounded-2xl bg-black/40 border border-white/5 flex items-center justify-between backdrop-blur-md">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-10 h-10 rounded-full bg-emerald-500 text-black flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:scale-105 active:scale-95 transition-transform"
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-black" /> : <Play className="w-4 h-4 ml-0.5 fill-black" />}
            </button>
            <div>
              <p className="text-xs font-semibold text-white">Subway Neon Chase</p>
              <p className="text-[10px] text-zinc-400">Take 02 · Roll A · Cam 1</p>
            </div>
          </div>
          <Link href="/storyboard" className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 transition-colors">
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* 3. Rounded Pill Category Chips (Rooms/Modules Navigation) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        <Link href="/breakdown" className="px-4 py-2 rounded-full bg-emerald-500 text-black text-xs font-semibold shadow-[0_0_15px_rgba(16,185,129,0.3)] whitespace-nowrap">
          Screenplay
        </Link>
        <Link href="/storyboard" className="px-4 py-2 rounded-full bg-[#141d17] border border-white/10 hover:border-emerald-500/40 text-zinc-300 text-xs font-medium whitespace-nowrap">
          Storyboard
        </Link>
        <Link href="/financials" className="px-4 py-2 rounded-full bg-[#141d17] border border-white/10 hover:border-emerald-500/40 text-zinc-300 text-xs font-medium whitespace-nowrap">
          Budget Engine
        </Link>
        <Link href="/roster" className="px-4 py-2 rounded-full bg-[#141d17] border border-white/10 hover:border-emerald-500/40 text-zinc-300 text-xs font-medium whitespace-nowrap">
          Crew Roster
        </Link>
      </div>

      {/* 4. Luxury Neomorphic Cards (2x2 Grid) */}
      <div className="grid grid-cols-2 gap-3.5">
        {/* Screenplay Card */}
        <Link
          href="/breakdown"
          className="rounded-[24px] p-4 bg-gradient-to-b from-[#141e17] to-[#0c130f] border border-white/10 hover:border-emerald-500/40 shadow-lg flex flex-col justify-between h-36 group transition-all"
        >
          <div className="flex justify-between items-start">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Clapperboard className="w-4 h-4" />
            </div>
            <ArrowUpRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-emerald-400 transition-colors" />
          </div>
          <div>
            <span className="text-xl font-bold text-white tracking-tight">18 Scenes</span>
            <p className="text-[11px] text-zinc-400 mt-0.5">94.2% Dual-Parsed</p>
          </div>
        </Link>

        {/* Storyboard Card */}
        <Link
          href="/storyboard"
          className="rounded-[24px] p-4 bg-gradient-to-b from-[#141e17] to-[#0c130f] border border-white/10 hover:border-emerald-500/40 shadow-lg flex flex-col justify-between h-36 group transition-all"
        >
          <div className="flex justify-between items-start">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Film className="w-4 h-4" />
            </div>
            <ArrowUpRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-emerald-400 transition-colors" />
          </div>
          <div>
            <span className="text-xl font-bold text-white tracking-tight">24 Cards</span>
            <p className="text-[11px] text-zinc-400 mt-0.5">16:9 Spatial Widescreen</p>
          </div>
        </Link>

        {/* Budget Card */}
        <Link
          href="/financials"
          className="rounded-[24px] p-4 bg-gradient-to-b from-[#141e17] to-[#0c130f] border border-white/10 hover:border-emerald-500/40 shadow-lg flex flex-col justify-between h-36 group transition-all"
        >
          <div className="flex justify-between items-start">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <DollarSign className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-800">
              Surplus
            </span>
          </div>
          <div>
            <span className="text-xl font-bold text-emerald-400 tracking-tight">+$14,500</span>
            <p className="text-[11px] text-zinc-400 mt-0.5">Live Variance</p>
          </div>
        </Link>

        {/* Crew Roster Card */}
        <Link
          href="/roster"
          className="rounded-[24px] p-4 bg-gradient-to-b from-[#141e17] to-[#0c130f] border border-white/10 hover:border-emerald-500/40 shadow-lg flex flex-col justify-between h-36 group transition-all"
        >
          <div className="flex justify-between items-start">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Users className="w-4 h-4" />
            </div>
            <ArrowUpRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-emerald-400 transition-colors" />
          </div>
          <div>
            <span className="text-xl font-bold text-white tracking-tight">32 Staff</span>
            <p className="text-[11px] text-zinc-400 mt-0.5">Call Sheets Active</p>
          </div>
        </Link>
      </div>

      {/* 5. Bottom Large CTA Button (Matching Configure Button in Photo 2) */}
      <Link
        href="/breakdown"
        className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-black font-semibold text-sm flex items-center justify-between shadow-[0_10px_30px_rgba(16,185,129,0.3)] hover:brightness-110 active:scale-[0.99] transition-all"
      >
        <span className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 fill-black" />
          <span>Launch AI Screenplay Breakdown</span>
        </span>
        <ChevronRight className="w-4 h-4" />
      </Link>
    </div>
  );
}