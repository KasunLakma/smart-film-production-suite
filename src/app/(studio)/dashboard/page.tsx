"use client";

import React from "react";
import Link from "next/link";
import {
  FileText,
  Film,
  DollarSign,
  Users,
  MapPin,
  Sparkles,
  ArrowUpRight,
  Clapperboard,
  ShieldCheck,
  Video
} from "lucide-react";

export default function DashboardPage() {
  const cards = [
    {
      title: "Script Breakdown",
      stat: "18 Scenes",
      sub: "94.2% AI Accuracy",
      icon: FileText,
      href: "/breakdown",
      desc: "Dual-pipeline Regex + LLM screenplay extraction.",
      tag: "Ready"
    },
    {
      title: "Visual Storyboard",
      stat: "24 Cards",
      sub: "16:9 Cinematic Canvas",
      icon: Film,
      href: "/storyboard",
      desc: "Keyframe shot composition and angle planning.",
      tag: "Widescreen"
    },
    {
      title: "Budget Engine",
      stat: "+$14,500",
      sub: "Net Variance Surplus",
      icon: DollarSign,
      href: "/financials",
      desc: "Live ledger recalculation in under 50ms.",
      tag: "Realtime",
      highlight: true
    },
    {
      title: "Crew Roster",
      stat: "32 Members",
      sub: "$8,450 Daily Burn",
      icon: Users,
      href: "/roster",
      desc: "Role-based call sheets and department rates.",
      tag: "Active"
    }
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-5">

      {/* Production Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950/80 via-[#0e251a] to-emerald-950/40 border border-emerald-800/40 rounded-3xl p-5 flex items-center justify-between shadow-lg">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-mono tracking-widest text-emerald-400 uppercase font-semibold">Active Production</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white">Neon Horizon</h1>
          <p className="text-xs text-slate-400">Pre-Production Studio Workspace</p>
        </div>

        <div className="text-right">
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-mono bg-emerald-900/60 border border-emerald-700/60 text-emerald-300">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Type-Safe</span>
          </span>
          <p className="text-[11px] text-slate-400 font-mono mt-1">Day 12 of 28</p>
        </div>
      </div>

      {/* Featured Production Focus Card (App Visual Style) */}
      <div className="rounded-3xl p-5 bg-[#0d2217]/60 border border-emerald-900/50 backdrop-blur-xl shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <Video className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Current Scene Slate</p>
              <h3 className="text-sm font-semibold text-white">Scene 14: Cyberpunk Alley (EXT · NIGHT)</h3>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-mono bg-emerald-950 text-emerald-300 border border-emerald-800">
            Roll A · Take 02
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between p-3.5 rounded-2xl bg-black/30 border border-white/5">
          <div className="text-xs text-slate-300 space-y-0.5">
            <p className="font-medium text-white">Elena: &ldquo;If the core ledger drops below 50ms, the entire grid locks down.&rdquo;</p>
            <p className="text-[10px] text-slate-400">Cast: Elena (Lead) · Props: Holographic Terminal · VFX: Rain Rig</p>
          </div>
          <Link
            href="/breakdown"
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-emerald-500 text-black text-xs font-semibold flex items-center justify-center gap-1.5 shrink-0 shadow-md hover:brightness-110 transition-all"
          >
            <span>Review Scene</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Primary Production Grid: PC එකේ 4-Column, Mobile එකේ 2-Column App Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <Link
              key={idx}
              href={card.href}
              className="group bg-[#0d2217]/50 hover:bg-[#0d2217] border border-emerald-900/40 hover:border-emerald-500/40 rounded-3xl p-4 transition-all duration-200 flex flex-col justify-between h-40 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-xl bg-emerald-950 border border-emerald-800/60 flex items-center justify-center text-emerald-400">
                  <Icon className="w-4 h-4" />
                </div>
                <span className={`text-[9px] font-mono px-2 py-0.5 rounded-full border ${card.highlight
                    ? "bg-emerald-950 text-emerald-400 border-emerald-700 font-semibold"
                    : "bg-emerald-950/60 text-slate-400 border-emerald-900"
                  }`}>
                  {card.tag}
                </span>
              </div>

              <div>
                <h3 className={`text-lg md:text-xl font-bold tracking-tight ${card.highlight ? "text-emerald-400" : "text-white"}`}>
                  {card.stat}
                </h3>
                <p className="text-xs font-medium text-slate-200 mt-0.5">{card.title}</p>
                <p className="text-[10px] text-slate-400 truncate mt-0.5">{card.sub}</p>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Bottom Quick Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <Link
          href="/storyboard"
          className="p-4 rounded-3xl bg-[#0d2217]/40 border border-emerald-900/40 hover:border-emerald-600/40 transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-950 border border-emerald-800/50 text-emerald-400">
              <Film className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white group-hover:text-emerald-300 transition-colors">16:9 Spatial Storyboards</h4>
              <p className="text-xs text-slate-400">View camera setups, aspect framing and shot lists</p>
            </div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition-colors shrink-0" />
        </Link>

        <Link
          href="/locations"
          className="p-4 rounded-3xl bg-[#0d2217]/40 border border-emerald-900/40 hover:border-emerald-600/40 transition-all flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-emerald-950 border border-emerald-800/50 text-emerald-400">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white group-hover:text-emerald-300 transition-colors">Scouted Locations</h4>
              <p className="text-xs text-slate-400">Permits, sun angles and soundstage availability</p>
            </div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 transition-colors shrink-0" />
        </Link>
      </div>

    </div>
  );
}