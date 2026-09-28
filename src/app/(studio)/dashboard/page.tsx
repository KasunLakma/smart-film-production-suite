"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Clapperboard,
  Sparkles,
  Play,
  Pause,
  ArrowRight,
  ChevronRight,
  Volume2,
  Power,
  Sliders,
  ShieldCheck,
  Disc3,
  Layers,
  ArrowUpRight
} from "lucide-react";

export default function HomePage() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeFocal, setActiveFocal] = useState(35);

  return (
    <div className="min-h-screen bg-[#070b09] text-zinc-100 flex flex-col justify-between selection:bg-emerald-500 selection:text-black overflow-x-hidden">
      {/* 1. Mobile & Desktop App Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#070b09]/80 border-b border-white/5 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <Clapperboard className="w-4 h-4" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xl font-serif font-bold text-white tracking-tight">eclat</span>
            <span className="text-[9px] font-mono tracking-widest text-emerald-400 bg-emerald-950 px-1.5 py-0.5 rounded-full border border-emerald-800">
              STUDIO
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/login"
            className="text-xs text-zinc-400 hover:text-white px-3 py-1.5 rounded-full hover:bg-white/5 transition-colors"
          >
            Sign In
          </Link>
          <Link
            href="/dashboard"
            className="text-xs font-semibold px-3.5 py-1.5 rounded-full bg-emerald-500 text-black hover:bg-emerald-400 transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] flex items-center gap-1"
          >
            <span>Open App</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* 2. Main Hero Section (Dark Editorial Luxury App Style) */}
      <main className="flex-1 max-w-md md:max-w-4xl mx-auto w-full px-4 py-6 sm:py-10 flex flex-col justify-center">
        {/* Top Floating Badge */}
        <div className="flex justify-center mb-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#111c15] border border-emerald-500/30 shadow-inner">
            <Sparkles className="w-3 h-3 text-emerald-400" />
            <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-300 font-medium">
              Next-Gen Cinema Suite
            </span>
          </div>
        </div>

        {/* Hero Editorial Heading */}
        <div className="text-center space-y-2 mb-6">
          <h1 className="text-3xl sm:text-5xl font-serif font-bold text-white tracking-tight leading-tight">
            A Virtual World of <br />
            <span className="italic font-light text-emerald-400">Cinematic Production</span>
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 max-w-sm sm:max-w-lg mx-auto font-light leading-relaxed">
            AI-driven screenplay parsing, 16:9 spatial visual boards, and real-time ledger sync for modern independent filmmakers.
          </p>
        </div>

        {/* Tactile Control Unit (Inspired by Photo 2 Home Setup Controller) */}
        <div className="rounded-[32px] p-5 bg-gradient-to-b from-[#16221a] to-[#0c140f] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.85)] backdrop-blur-2xl mb-6">
          <div className="flex items-center justify-between text-xs text-zinc-400 pb-3 border-b border-white/5">
            <span className="flex items-center gap-1.5 font-medium text-white">
              <Disc3 className="w-4 h-4 text-emerald-400 animate-spin" />
              Live Camera Rig
            </span>
            <span className="text-[10px] font-mono bg-emerald-950/80 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-800/60">
              8K RAW · 24fps
            </span>
          </div>

          {/* Focal / Shutter Tactile Pill Buttons */}
          <div className="flex items-center justify-around py-4">
            {[24, 35, 50, 85].map((mm) => (
              <button
                key={mm}
                onClick={() => setActiveFocal(mm)}
                className={`px-3.5 py-2 rounded-2xl text-xs font-mono font-medium transition-all ${activeFocal === mm
                    ? "bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.5)] scale-105"
                    : "bg-[#101913] text-zinc-400 border border-white/5 hover:border-white/20"
                  }`}
              >
                {mm}mm
              </button>
            ))}
          </div>

          {/* Tactile Glass Player Card */}
          <div className="rounded-2xl p-3.5 bg-black/40 border border-white/5 backdrop-blur-md flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-11 h-11 rounded-full bg-emerald-500 text-black flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:scale-105 active:scale-95 transition-transform shrink-0"
              >
                {isPlaying ? <Pause className="w-5 h-5 fill-black" /> : <Play className="w-5 h-5 ml-0.5 fill-black" />}
              </button>
              <div className="overflow-hidden">
                <p className="text-xs font-semibold text-white truncate">Neon Horizon Showreel</p>
                <p className="text-[10px] text-zinc-400">Cyberpunk Alley · Scene 14</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-zinc-400">
                <Volume2 className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        </div>

        {/* Primary CTA Buttons (Editorial Pill & Carousel Arrows Style) */}
        <div className="space-y-3">
          <Link
            href="/dashboard"
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-black font-semibold text-sm flex items-center justify-between shadow-[0_10px_30px_rgba(16,185,129,0.3)] hover:brightness-110 active:scale-[0.99] transition-all"
          >
            <span className="flex items-center gap-2">
              <Clapperboard className="w-4 h-4 fill-black" />
              <span>Enter eclat Studio</span>
            </span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/breakdown"
            className="w-full py-3.5 px-6 rounded-2xl bg-[#121b15]/90 border border-white/10 hover:border-emerald-500/40 text-zinc-200 text-xs font-medium flex items-center justify-between transition-all"
          >
            <span className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              <span>Explore Dual-Pipeline Script Breakdown</span>
            </span>
            <ArrowUpRight className="w-3.5 h-3.5 text-zinc-400" />
          </Link>
        </div>
      </main>

      {/* 3. Minimal Studio Footer */}
      <footer className="py-4 border-t border-white/5 text-center text-[10px] font-mono text-zinc-500">
        eclat Studio Pre-Production Architecture · Built with Next.js & Tailwind
      </footer>
    </div>
  );
}