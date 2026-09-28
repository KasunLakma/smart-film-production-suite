"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  MoreVertical,
  Power,
  Volume2,
  ThumbsUp,
  ThumbsDown,
  Share2,
  Shuffle,
  SkipBack,
  Play,
  Pause,
  SkipForward,
  Repeat,
  Sliders,
  BatteryCharging,
  Video
} from "lucide-react";

export default function AppDashboardPage() {
  const [powerOn, setPowerOn] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [level, setLevel] = useState(75); // Slider / Dial percentage
  const [liked, setLiked] = useState<boolean | null>(true);

  return (
    <div className="max-w-[410px] mx-auto min-h-[840px] bg-[#1a1b1e] text-zinc-100 rounded-[44px] p-5 shadow-[0_25px_70px_rgba(0,0,0,0.9)] border border-white/10 flex flex-col justify-between select-none relative overflow-hidden font-sans">

      {/* 1. Dynamic Island / Top Phone App Header */}
      <div>
        <div className="flex items-center justify-between pt-1 pb-3 text-zinc-300">
          <Link href="/" className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
            <ChevronLeft className="w-5 h-5 text-zinc-300" />
          </Link>

          <div className="text-center">
            <h2 className="text-sm font-semibold tracking-tight text-white">Main Rig · A Cam</h2>
          </div>

          <button className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
            <MoreVertical className="w-4 h-4 text-zinc-300" />
          </button>
        </div>

        {/* User Badge & Battery Pill Status */}
        <div className="flex justify-end items-center gap-2 mb-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] text-zinc-300">
            <div className="w-3.5 h-3.5 rounded-full bg-emerald-500/80 flex items-center justify-center text-[8px] font-bold text-black">
              E
            </div>
            <span>Elena R.</span>
          </div>

          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/30 text-[10px] font-mono text-emerald-400">
            <BatteryCharging className="w-3 h-3 text-emerald-400" />
            <span>84%</span>
          </div>
        </div>
      </div>

      {/* 2. Big Center Neomorphic Tactile Dial (Exact match to Photo 1) */}
      <div className="flex flex-col items-center justify-center my-auto py-2 relative">
        {/* Glow effect behind dial */}
        <div className={`absolute w-52 h-52 rounded-full blur-3xl transition-opacity duration-500 ${powerOn ? 'bg-orange-600/20' : 'bg-transparent'}`} />

        <div className="relative w-56 h-56 rounded-full bg-gradient-to-b from-[#2a2c31] to-[#121316] p-4 shadow-[inset_0_4px_10px_rgba(255,255,255,0.1),0_20px_40px_rgba(0,0,0,0.8)] border border-white/5 flex items-center justify-center">

          {/* Perforated Mesh Speaker / Ring Texture */}
          <div className="absolute inset-3 rounded-full border-2 border-dashed border-zinc-700/60 pointer-events-none" />

          {/* Inner Dial Center */}
          <div className="w-36 h-36 rounded-full bg-gradient-to-b from-[#222428] to-[#101114] shadow-[0_12px_24px_rgba(0,0,0,0.9),inset_0_2px_4px_rgba(255,255,255,0.12)] border border-white/10 flex flex-col items-center justify-center text-center">
            {/* Prominent G / eclat Logo Badge */}
            <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-orange-600 to-orange-500 flex items-center justify-center shadow-[0_4px_15px_rgba(234,88,12,0.4)]">
              <span className="text-2xl font-black text-white tracking-tighter">e</span>
            </div>
            <span className="text-[9px] font-mono tracking-widest text-zinc-400 mt-2 uppercase">eclat core</span>
          </div>
        </div>
      </div>

      {/* 3. Tactile Middle Control Capsule (Power, Level %, Volume) */}
      <div className="grid grid-cols-3 gap-2.5 bg-[#23252a]/70 p-2 rounded-2xl border border-white/5 backdrop-blur-xl mb-3">
        {/* Power Toggle Button */}
        <button
          onClick={() => setPowerOn(!powerOn)}
          className={`flex items-center justify-center py-2.5 rounded-xl transition-all ${powerOn
              ? 'bg-[#2f3238] text-white shadow-inner border border-white/10'
              : 'text-zinc-500 hover:text-zinc-300'
            }`}
        >
          <Power className={`w-4 h-4 ${powerOn ? 'text-emerald-400' : 'text-zinc-500'}`} />
        </button>

        {/* Level Percentage Indicator */}
        <div className="flex items-center justify-center py-2.5 rounded-xl bg-[#2f3238] border border-white/10 text-xs font-semibold text-white shadow-inner font-mono">
          {level}%
        </div>

        {/* Mute/Volume Icon */}
        <button className="flex items-center justify-center py-2.5 rounded-xl text-zinc-400 hover:text-white transition-colors">
          <Volume2 className="w-4 h-4" />
        </button>
      </div>

      {/* 4. Active Shot / Scene Card with Scrubbing Slider */}
      <div className="bg-[#23252a]/90 rounded-3xl p-4 border border-white/10 shadow-lg backdrop-blur-2xl mb-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            {/* Thumbnail */}
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-orange-500 flex items-center justify-center shadow-md text-white font-bold text-xs shrink-0">
              <Video className="w-5 h-5 text-white/90" />
            </div>
            <div className="overflow-hidden">
              <h4 className="text-xs font-semibold text-white truncate">Neon Horizon · Scene 14</h4>
              <p className="text-[10px] text-zinc-400 truncate">Take 02 · Cyberpunk Alley</p>
            </div>
          </div>

          {/* Like, Dislike, Share Quick Actions */}
          <div className="flex items-center gap-1.5 text-zinc-400">
            <button
              onClick={() => setLiked(liked === true ? null : true)}
              className={`p-1.5 rounded-lg hover:bg-white/5 transition-colors ${liked === true ? 'text-emerald-400' : ''}`}
            >
              <ThumbsUp className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setLiked(liked === false ? null : false)}
              className={`p-1.5 rounded-lg hover:bg-white/5 transition-colors ${liked === false ? 'text-rose-400' : ''}`}
            >
              <ThumbsDown className="w-3.5 h-3.5" />
            </button>
            <button className="p-1.5 rounded-lg hover:bg-white/5 transition-colors">
              <Share2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Tactile Scrubber Bar */}
        <div className="relative flex items-center pt-1 pb-1">
          <input
            type="range"
            min="0"
            max="100"
            value={level}
            onChange={(e) => setLevel(Number(e.target.value))}
            className="w-full h-1.5 bg-zinc-700/60 rounded-lg appearance-none cursor-pointer accent-white"
          />
        </div>
      </div>

      {/* 5. Sleek Bottom Playback Bar */}
      <div className="bg-[#23252a]/60 rounded-3xl p-3 border border-white/5 flex items-center justify-between text-zinc-400 px-4">
        <button className="hover:text-white transition-colors">
          <Shuffle className="w-4 h-4" />
        </button>
        <button className="hover:text-white transition-colors">
          <SkipBack className="w-4 h-4" />
        </button>

        {/* Big Tactile Play Button */}
        <button
          onClick={() => setIsPlaying(!isPlaying)}
          className="w-12 h-12 rounded-full bg-[#2f3238] border border-white/10 hover:border-white/20 text-white flex items-center justify-center shadow-[0_4px_15px_rgba(0,0,0,0.5)] active:scale-95 transition-transform"
        >
          {isPlaying ? (
            <Pause className="w-5 h-5 fill-white text-white" />
          ) : (
            <Play className="w-5 h-5 fill-white text-white ml-0.5" />
          )}
        </button>

        <button className="hover:text-white transition-colors">
          <SkipForward className="w-4 h-4" />
        </button>
        <button className="hover:text-white transition-colors">
          <Repeat className="w-4 h-4" />
        </button>
      </div>

    </div>
  );
}