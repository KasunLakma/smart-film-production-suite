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
  Palette,
  Maximize2
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
  const [visualStyle, setVisualStyle] = useState<"sketch" | "color">("sketch");
  const [isSynthesizing, setIsSynthesizing] = useState<boolean>(false);

  // Breakdown පිටුවෙන් session storage එකට දැමූ scenes දත්ත ස්වයංක්‍රීයව කියවා ගැනීම
  useEffect(() => {
    try {
      const storedFrames = sessionStorage.getItem("eclat_storyboard_frames");
      if (storedFrames) {
        const parsed = JSON.parse(storedFrames);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setFrames(parsed);
          return;
        }
      }

      // Session එකේ storyboard frames නැතිනම් active scenes තිබේදැයි බලා එයින් frames සැකසීම
      const storedScenes = sessionStorage.getItem("eclat_active_scenes");
      if (storedScenes) {
        const parsedScenes = JSON.parse(storedScenes);
        if (Array.isArray(parsedScenes) && parsedScenes.length > 0) {
          const generatedFrames = parsedScenes.flatMap((sc: any) => [
            {
              id: `sb-${sc.sceneNumber}-a`,
              sceneNumber: sc.sceneNumber,
              shotNumber: `SHOT ${String(sc.sceneNumber).padStart(2, "0")}A`,
              shotTitle: `Wide Master Framing (WMS)`,
              slugline: sc.slugline,
              lensAngle: "28mm Anamorphic T2.0",
              movement: "Slow Push-In Tracking",
              visualPrompt: sc.visualPrompt || `Cinematic master wide shot of ${sc.slugline}`,
              characters: sc.characters || [],
              props: sc.props || [],
              imageType: "wide" as const
            },
            {
              id: `sb-${sc.sceneNumber}-b`,
              sceneNumber: sc.sceneNumber,
              shotNumber: `SHOT ${String(sc.sceneNumber).padStart(2, "0")}B`,
              shotTitle: `Medium Close Action (MCU)`,
              slugline: sc.slugline,
              lensAngle: "50mm Prime T1.5",
              movement: "Dynamic Eye-Level",
              visualPrompt: sc.visualPrompt || `Cinematic medium close-up shot of ${sc.slugline}`,
              characters: sc.characters || [],
              props: sc.props || [],
              imageType: "close" as const
            }
          ]);
          setFrames(generatedFrames);
          sessionStorage.setItem("eclat_storyboard_frames", JSON.stringify(generatedFrames));
        }
      }
    } catch (err) {
      console.error("Failed to load storyboard frames from session", err);
    }
  }, []);

  // Storyboard Frames Clear කිරීම
  const handleClearAllFrames = () => {
    setFrames([]);
    sessionStorage.removeItem("eclat_storyboard_frames");
  };

  // තනි Frame එකක් මකා දැමීම
  const handleDeleteFrame = (id: string) => {
    const updated = frames.filter((f) => f.id !== id);
    setFrames(updated);
    sessionStorage.setItem("eclat_storyboard_frames", JSON.stringify(updated));
  };

  // AI Render Simulate කිරීම
  const handleSynthesizeFrames = () => {
    setIsSynthesizing(true);
    setTimeout(() => {
      setIsSynthesizing(false);
      alert("සියලුම 16:9 Storyboard Frames Render කර Pre-visualization Cache එකට එක් කරන ලදී!");
    }, 1200);
  };

  // Filter අනුව frames තෝරාගැනීම
  const filteredFrames = activeFilter === "ALL"
    ? frames
    : frames.filter((f) => `SCENE-0${f.sceneNumber}` === activeFilter || `SCENE-${f.sceneNumber}` === activeFilter);

  // සුවිශේෂී Scene numbers ලැයිස්තුව
  const sceneNumbers = Array.from(new Set(frames.map((f) => f.sceneNumber))).sort((a, b) => a - b);

  return (
    <div className="min-h-screen bg-[#060b08] text-zinc-200 p-8 font-sans">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950/90 text-emerald-400 border border-emerald-800/60 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            HIGH-CAPACITY FILM STORYBOARD STUDIO
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Cinematic Storyboard Studio
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            StudioBinder Hand-Drawn Ink & Comic Storyboard Visualization — සියලුම Shots එකින් එක නිවැරදිව Render වේ.
          </p>
        </div>

        {/* Action Buttons */}
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
                className="p-2.5 rounded-xl bg-zinc-900 hover:bg-red-950 text-zinc-400 hover:text-red-400 border border-zinc-800 hover:border-red-800 transition-all"
                title="Clear all storyboards"
              >
                <Trash2 className="w-4 h-4" />
              </button>

              <button
                disabled={isSynthesizing}
                onClick={handleSynthesizeFrames}
                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl shadow-lg shadow-emerald-950/40 text-xs transition-all disabled:opacity-50"
              >
                <Film className="w-4 h-4" />
                {isSynthesizing ? "Synthesizing Frames..." : "Synthesize All Frames"}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Control Bar: Filters & Visual Style Toggle */}
      {frames.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#0b1410] border border-emerald-900/40 mb-8 shadow-xl">
          {/* Scene Filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 custom-scrollbar">
            <span className="text-xs text-zinc-500 font-medium mr-1 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5" />
              Filter Scene:
            </span>
            <button
              onClick={() => setActiveFilter("ALL")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${activeFilter === "ALL"
                  ? "bg-emerald-500 text-black shadow-md shadow-emerald-950/30"
                  : "bg-[#060b08] text-zinc-400 hover:text-white border border-zinc-850"
                }`}
            >
              All Sequences ({frames.length})
            </button>

            {sceneNumbers.map((num) => (
              <button
                key={num}
                onClick={() => setActiveFilter(`SCENE-${String(num).padStart(2, "0")}`)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${activeFilter === `SCENE-${String(num).padStart(2, "0")}`
                    ? "bg-emerald-500 text-black shadow-md shadow-emerald-950/30"
                    : "bg-[#060b08] text-zinc-400 hover:text-white border border-zinc-850"
                  }`}
              >
                SCENE-{String(num).padStart(2, "0")}
              </button>
            ))}
          </div>

          {/* Style Switcher */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-500 font-medium flex items-center gap-1">
              <Palette className="w-3.5 h-3.5" />
              Style:
            </span>
            <div className="flex rounded-lg bg-[#060b08] p-1 border border-zinc-800">
              <button
                onClick={() => setVisualStyle("sketch")}
                className={`px-3 py-1 rounded-md text-[11px] font-semibold transition-all ${visualStyle === "sketch"
                    ? "bg-emerald-500 text-black"
                    : "text-zinc-400 hover:text-white"
                  }`}
              >
                StudioBinder (B&W Sketch)
              </button>
              <button
                onClick={() => setVisualStyle("color")}
                className={`px-3 py-1 rounded-md text-[11px] font-semibold transition-all ${visualStyle === "color"
                    ? "bg-emerald-500 text-black"
                    : "text-zinc-400 hover:text-white"
                  }`}
              >
                Graphic Novel (Color)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 16:9 Storyboard Grid */}
      {filteredFrames.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredFrames.map((frame) => (
            <div
              key={frame.id}
              className="group bg-[#0b1410] border border-emerald-900/40 rounded-2xl overflow-hidden shadow-2xl transition-all hover:border-emerald-700/60"
            >
              {/* 16:9 Aspect Ratio Visual Canvas */}
              <div className="relative aspect-video w-full bg-[#050907] flex items-center justify-center border-b border-zinc-850 overflow-hidden">
                {/* Visual Representation (Procedural Blueprint Sketch or Realistic Frame) */}
                {visualStyle === "sketch" ? (
                  <div className="w-full h-full flex flex-col items-center justify-center p-6 relative select-none">
                    {/* Perspective lines for cinematic camera layout */}
                    <div className="absolute inset-0 opacity-15 pointer-events-none">
                      <div className="w-full h-full border-t border-b border-dashed border-zinc-400 flex items-center justify-center">
                        <div className="w-3/4 h-3/4 border border-zinc-500" />
                      </div>
                    </div>

                    {/* Camera Reference Sketch Graphic */}
                    {frame.imageType === "wide" ? (
                      <div className="w-3/4 h-2/3 border border-emerald-500/40 rounded flex flex-col items-center justify-center bg-zinc-950/60 p-4">
                        <div className="flex gap-4 items-center justify-center opacity-60">
                          <div className="w-10 h-10 rounded-full border border-zinc-400 flex items-center justify-center text-[10px] text-zinc-400">
                            {frame.characters[0] ? frame.characters[0].slice(0, 4) : "ACT"}
                          </div>
                          {frame.characters[1] && (
                            <div className="w-10 h-10 rounded-full border border-zinc-400 flex items-center justify-center text-[10px] text-zinc-400">
                              {frame.characters[1].slice(0, 4)}
                            </div>
                          )}
                        </div>
                        <span className="text-[10px] font-mono text-zinc-500 mt-3 tracking-widest uppercase">
                          WIDE ESTABLISHING PERSPECTIVE
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center relative">
                        <div className="w-16 h-16 rounded-full border-2 border-zinc-400/80 mb-2 flex items-center justify-center bg-zinc-900/40">
                          <span className="text-xs font-mono text-zinc-300">
                            {frame.characters[0] ? frame.characters[0].slice(0, 3) : "CU"}
                          </span>
                        </div>
                        <div className="w-24 h-12 border-2 border-zinc-400/80 rounded-t-lg bg-zinc-900/40" />
                        <span className="text-[10px] font-mono text-zinc-500 mt-2 tracking-widest uppercase">
                          CINEMATIC FRAMING REFERENCE SKETCH
                        </span>
                      </div>
                    )}

                    {/* Bottom Status Tags on Canvas */}
                    <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded bg-black/80 text-[10px] font-mono text-emerald-400 border border-emerald-900/60">
                        STORYBOARD PANEL
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 bg-black/80 px-2 py-0.5 rounded border border-emerald-900/40">
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                          Studio Ready
                        </span>
                        <span className="px-2 py-0.5 rounded bg-zinc-900/90 text-[10px] font-mono text-zinc-400 border border-zinc-800">
                          StudioBinder Sketch
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-full bg-gradient-to-tr from-emerald-950/40 via-zinc-950 to-emerald-900/20 flex flex-col items-center justify-center p-6 text-center">
                    <Camera className="w-8 h-8 text-emerald-400 mb-2 opacity-60" />
                    <p className="text-xs text-zinc-300 max-w-md font-mono italic px-4 line-clamp-2">
                      "{frame.visualPrompt}"
                    </p>
                    <span className="text-[10px] text-emerald-500 mt-2 uppercase tracking-widest font-bold">
                      Photorealistic 16:9 Pre-Vis Frame
                    </span>
                  </div>
                )}

                {/* Shot Number Badge (Top Left) */}
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded bg-black/80 text-white font-mono font-bold text-xs border border-zinc-800 tracking-wider">
                  {frame.shotNumber}
                </div>

                {/* Delete Button (Top Right) */}
                <button
                  onClick={() => handleDeleteFrame(frame.id)}
                  className="absolute top-3 right-3 p-1.5 rounded-lg bg-black/80 hover:bg-red-950 text-zinc-400 hover:text-red-400 border border-zinc-800 opacity-0 group-hover:opacity-100 transition-all"
                  title="Delete this shot card"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Shot Metadata Drawer */}
              <div className="p-5 flex flex-col gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider font-mono">
                      SCENE-{String(frame.sceneNumber).padStart(2, "0")}: {frame.imageType === "wide" ? "WIDE ESTABLISHING MASTER" : "CLOSE-UP KEY ACTION"}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono">
                      16:9 (Aspect-Video)
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white">
                    {frame.shotTitle}
                  </h3>
                  <p className="text-xs text-zinc-400 italic mt-0.5">
                    "{frame.slugline}"
                  </p>
                </div>

                {/* Technical Lens & Camera Movement Attributes */}
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

                {/* Conditioning Prompt Preview */}
                <div className="p-2.5 rounded-xl bg-zinc-950 border border-emerald-950/60">
                  <span className="text-[10px] text-emerald-500 font-semibold block mb-1">
                    Conditioning Visual Prompt:
                  </span>
                  <p className="text-[11px] text-zinc-400 font-mono line-clamp-2 leading-relaxed">
                    {frame.visualPrompt}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="h-[520px] flex flex-col items-center justify-center border-2 border-dashed border-zinc-850 rounded-3xl p-8 text-center bg-[#0b1410]/20">
          <div className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 mb-4">
            <Film className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-zinc-200">
            No Storyboard Frames Generated Yet
          </h3>
          <p className="text-xs text-zinc-500 max-w-md mt-1 leading-relaxed">
            Screenplay එකෙන් Storyboards සාදා ගැනීමට Script Breakdown පිටුවට ගොස් ස්ක්‍රිප්ට් එක Parse කර **"Generate All Storyboards"** හෝ Scene එකක් යටතේ ඇති **"Generate Storyboard"** ක්ලික් කරන්න.
          </p>
          <Link
            href="/breakdown"
            className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl text-xs transition-all shadow-lg shadow-emerald-950/30"
          >
            <ArrowLeft className="w-4 h-4" />
            Go to Script Breakdown Studio
          </Link>
        </div>
      )}
    </div>
  );
}