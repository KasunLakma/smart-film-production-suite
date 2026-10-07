"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Film,
  ArrowLeft,
  Trash2,
  Sparkles,
  Layers,
  Camera,
  CheckCircle2,
  RefreshCw
} from "lucide-react";

interface StoryboardFrame {
  id: string;
  sceneNumber: number;
  shotNumber: string;
  shotTitle: string;
  slugline: string;
  lensAngle: string;
  movement: string;
  visualPrompt: string;
  characters: string[];
  props: string[];
  imageType: "wide" | "close";
}

export default function CinematicStoryboardStudioPage() {
  const [frames, setFrames] = useState<StoryboardFrame[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>("ALL");
  const [isSynthesizing, setIsSynthesizing] = useState<boolean>(false);
  const [imageReloadKey, setImageReloadKey] = useState<number>(Date.now());

  useEffect(() => {
    try {
      const storedFrames = sessionStorage.getItem("eclat_storyboard_frames");
      if (storedFrames) {
        setFrames(JSON.parse(storedFrames));
      }
    } catch (err) {
      console.error(err);
    }
  }, []);

  const handleClearAllFrames = () => {
    setFrames([]);
    sessionStorage.removeItem("eclat_storyboard_frames");
  };

  const handleDeleteFrame = (id: string) => {
    const updated = frames.filter((f) => f.id !== id);
    setFrames(updated);
    sessionStorage.setItem("eclat_storyboard_frames", JSON.stringify(updated));
  };

  const handleReSynthesize = () => {
    setIsSynthesizing(true);
    setTimeout(() => {
      setImageReloadKey(Date.now());
      setIsSynthesizing(false);
    }, 1200);
  };

  // English Prompt එකෙන් AI Cinematic 16:9 Image එක සාදන ශ්‍රිතය (Pollinations AI)
  const getAIImageUrl = (prompt: string, shotId: string) => {
    const encodedPrompt = encodeURIComponent(prompt);
    return `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1280&height=720&nologo=true&seed=${shotId}-${imageReloadKey}&model=flux`;
  };

  const filteredFrames = activeFilter === "ALL"
    ? frames
    : frames.filter((f) => `SCENE-${String(f.sceneNumber).padStart(2, "0")}` === activeFilter);

  const sceneNumbers = Array.from(new Set(frames.map((f) => f.sceneNumber))).sort((a, b) => a - b);

  return (
    <div className="min-h-screen bg-[#060b08] text-zinc-200 p-8 font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950/90 text-emerald-400 border border-emerald-800/60 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            AI-POWERED 16:9 STORYBOARD STUDIO
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Cinematic Storyboard Studio
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Scene Visual Prompts මඟින් ජනනය වූ නිවැරදි 16:9 Widescreen Storyboard Frames.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/breakdown"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 text-xs font-medium transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Script
          </Link>

          {frames.length > 0 && (
            <>
              <button
                onClick={handleClearAllFrames}
                className="p-2.5 rounded-xl bg-zinc-900 hover:bg-red-950 text-zinc-400 hover:text-red-400 border border-zinc-800"
                title="Clear all storyboards"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <button
                disabled={isSynthesizing}
                onClick={handleReSynthesize}
                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl shadow-lg shadow-emerald-950/40 text-xs transition-all disabled:opacity-50"
              >
                {isSynthesizing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Film className="w-4 h-4" />}
                {isSynthesizing ? "Generating AI Frames..." : "Regenerate Frames"}
              </button>
            </>
          )}
        </div>
      </div>

      {frames.length > 0 && (
        <div className="flex items-center gap-2 p-3 rounded-2xl bg-[#0b1410] border border-emerald-900/40 mb-8 overflow-x-auto custom-scrollbar">
          <span className="text-xs text-zinc-500 font-medium mr-1 flex items-center gap-1">
            <Layers className="w-3.5 h-3.5" />
            Filter Scene:
          </span>
          <button
            onClick={() => setActiveFilter("ALL")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeFilter === "ALL" ? "bg-emerald-500 text-black" : "bg-[#060b08] text-zinc-400 border border-zinc-850"
              }`}
          >
            All Sequences ({frames.length})
          </button>
          {sceneNumbers.map((num) => (
            <button
              key={num}
              onClick={() => setActiveFilter(`SCENE-${String(num).padStart(2, "0")}`)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeFilter === `SCENE-${String(num).padStart(2, "0")}` ? "bg-emerald-500 text-black" : "bg-[#060b08] text-zinc-400 border border-zinc-850"
                }`}
            >
              SCENE-{String(num).padStart(2, "0")}
            </button>
          ))}
        </div>
      )}

      {filteredFrames.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredFrames.map((frame) => (
            <div
              key={frame.id}
              className="group bg-[#0b1410] border border-emerald-900/40 rounded-2xl overflow-hidden shadow-2xl transition-all hover:border-emerald-700/60"
            >
              {/* 16:9 Aspect Video Container with AI Image */}
              <div className="relative aspect-video w-full bg-[#050907] flex items-center justify-center border-b border-zinc-850 overflow-hidden">
                <img
                  src={getAIImageUrl(frame.visualPrompt, frame.id)}
                  alt={frame.shotTitle}
                  className="w-full h-full object-cover brightness-95 group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />

                <div className="absolute top-3 left-3 px-2.5 py-1 rounded bg-black/85 text-white font-mono font-bold text-xs border border-zinc-800">
                  {frame.shotNumber}
                </div>

                <button
                  onClick={() => handleDeleteFrame(frame.id)}
                  className="absolute top-3 right-3 p-1.5 rounded-lg bg-black/80 hover:bg-red-950 text-zinc-400 hover:text-red-400 border border-zinc-800 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>

                <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between pointer-events-none">
                  <span className="px-2 py-0.5 rounded bg-black/80 text-[10px] font-mono text-emerald-400 border border-emerald-900/60">
                    16:9 AI DIFFUSION RENDER
                  </span>
                  <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 bg-black/80 px-2 py-0.5 rounded border border-emerald-900/40">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    Scene Matched
                  </span>
                </div>
              </div>

              {/* Shot Details Drawer */}
              <div className="p-5 flex flex-col gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider font-mono">
                      SCENE-{String(frame.sceneNumber).padStart(2, "0")}: {frame.imageType === "wide" ? "WIDE MASTER (WMS)" : "MEDIUM CLOSE (MCU)"}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono">
                      16:9 Aspect Video
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white">
                    {frame.shotTitle}
                  </h3>
                  <p className="text-xs text-zinc-400 italic mt-0.5">
                    "{frame.slugline}"
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-zinc-850/80 text-xs">
                  <div className="p-2.5 rounded-xl bg-[#060b08] border border-zinc-850">
                    <span className="text-[10px] text-zinc-500 uppercase font-mono block">LENS ANGLE</span>
                    <span className="text-zinc-200 font-semibold text-xs mt-0.5 block">{frame.lensAngle}</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#060b08] border border-zinc-850">
                    <span className="text-[10px] text-zinc-500 uppercase font-mono block">MOVEMENT</span>
                    <span className="text-zinc-200 font-semibold text-xs mt-0.5 block">{frame.movement}</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-zinc-950 border border-emerald-950/60">
                  <span className="text-[10px] text-emerald-500 font-semibold block mb-1">
                    Conditioning Visual Prompt:
                  </span>
                  <p className="text-[11px] text-zinc-400 font-mono leading-relaxed line-clamp-2">
                    {frame.visualPrompt}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="h-[520px] flex flex-col items-center justify-center border-2 border-dashed border-zinc-850 rounded-3xl p-8 text-center bg-[#0b1410]/20">
          <div className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 mb-4">
            <Film className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-zinc-200">No Storyboard Frames Generated Yet</h3>
          <p className="text-xs text-zinc-500 max-w-md mt-1 leading-relaxed">
            Screenplay එකෙන් Storyboard ඡායාරූප සාදා ගැනීමට Script Breakdown පිටුවට ගොස් **"Generate All Storyboards"** ඔබන්න.
          </p>
          <Link
            href="/breakdown"
            className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl text-xs transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            Go to Script Breakdown Studio
          </Link>
        </div>
      )}
    </div>
  );
}