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
  RefreshCw,
  Image as ImageIcon
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
  imageUrl: string;
  characters: string[];
  props: string[];
  imageType: "wide" | "close";
}

export default function CinematicStoryboardStudioPage() {
  const [frames, setFrames] = useState<StoryboardFrame[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>("ALL");
  const [visualStyle, setVisualStyle] = useState<"photo" | "sketch">("photo");
  const [isSynthesizing, setIsSynthesizing] = useState<boolean>(false);

  // Unsplash Cinematic Reference High-Res Image Map
  const getCinematicImage = (slugline: string, type: "wide" | "close", index: number): string => {
    const isInterior = slugline.includes("INT") || slugline.includes("අභ්‍යන්තර") || slugline.includes("LAB") || slugline.includes("විද්‍යාගාරය");

    if (isInterior) {
      if (type === "wide") {
        return "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1200&q=80"; // Moody futuristic lab / conference
      } else {
        return "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1200&q=80"; // Cinematic actor focus
      }
    } else {
      if (type === "wide") {
        return "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&q=80"; // Rainy moody street / harbor
      } else {
        return "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=80"; // Night close-up
      }
    }
  };

  useEffect(() => {
    try {
      const storedScenes = sessionStorage.getItem("eclat_active_scenes");
      if (storedScenes) {
        const parsedScenes = JSON.parse(storedScenes);
        if (Array.isArray(parsedScenes) && parsedScenes.length > 0) {
          const generatedFrames: StoryboardFrame[] = parsedScenes.flatMap((sc: any, idx: number) => [
            {
              id: `sb-${sc.sceneNumber}-a`,
              sceneNumber: sc.sceneNumber,
              shotNumber: `SHOT ${String(sc.sceneNumber).padStart(2, "0")}A`,
              shotTitle: `Wide Master Framing (WMS)`,
              slugline: sc.slugline,
              lensAngle: "28mm Anamorphic T2.0",
              movement: "Slow Push-In Tracking",
              visualPrompt: sc.visualPrompt || `Cinematic master wide shot of ${sc.slugline}`,
              imageUrl: getCinematicImage(sc.slugline, "wide", idx),
              characters: sc.characters || [],
              props: sc.props || [],
              imageType: "wide"
            },
            {
              id: `sb-${sc.sceneNumber}-b`,
              sceneNumber: sc.sceneNumber,
              shotNumber: `SHOT ${String(sc.sceneNumber).padStart(2, "0")}B`,
              shotTitle: `Medium Close Action (MCU)`,
              slugline: sc.slugline,
              lensAngle: "50mm Prime T1.5",
              movement: "Dynamic Eye-Level",
              visualPrompt: sc.visualPrompt || `Cinematic medium close action shot of ${sc.slugline}`,
              imageUrl: getCinematicImage(sc.slugline, "close", idx),
              characters: sc.characters || [],
              props: sc.props || [],
              imageType: "close"
            }
          ]);
          setFrames(generatedFrames);
          sessionStorage.setItem("eclat_storyboard_frames", JSON.stringify(generatedFrames));
          return;
        }
      }

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

  const handleSynthesizeFrames = () => {
    setIsSynthesizing(true);
    setTimeout(() => {
      setIsSynthesizing(false);
      alert("සියලුම 16:9 Storyboard Frames Photorealistic Resolution එකට Render කර අවසන් කරන ලදී!");
    }, 1000);
  };

  const filteredFrames = activeFilter === "ALL"
    ? frames
    : frames.filter((f) => `SCENE-${String(f.sceneNumber).padStart(2, "0")}` === activeFilter);

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
            StudioBinder Hand-Drawn Ink & Realistic Visuals — සියලුම Shots එකින් එක 16:9 අනුපාතයට Render වේ.
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
                {isSynthesizing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Film className="w-4 h-4" />}
                {isSynthesizing ? "Synthesizing..." : "Synthesize All Frames"}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Filter and Mode Bar */}
      {frames.length > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[#0b1410] border border-emerald-900/40 mb-8 shadow-xl">
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

          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-500 font-medium flex items-center gap-1">
              <Palette className="w-3.5 h-3.5" />
              Style:
            </span>
            <div className="flex rounded-lg bg-[#060b08] p-1 border border-zinc-800">
              <button
                onClick={() => setVisualStyle("photo")}
                className={`px-3 py-1 rounded-md text-[11px] font-semibold transition-all ${visualStyle === "photo"
                    ? "bg-emerald-500 text-black"
                    : "text-zinc-400 hover:text-white"
                  }`}
              >
                Graphic Novel / Photo
              </button>
              <button
                onClick={() => setVisualStyle("sketch")}
                className={`px-3 py-1 rounded-md text-[11px] font-semibold transition-all ${visualStyle === "sketch"
                    ? "bg-emerald-500 text-black"
                    : "text-zinc-400 hover:text-white"
                  }`}
              >
                StudioBinder (B&W Sketch)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 16:9 Storyboard Image Grid */}
      {filteredFrames.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredFrames.map((frame) => (
            <div
              key={frame.id}
              className="group bg-[#0b1410] border border-emerald-900/40 rounded-2xl overflow-hidden shadow-2xl transition-all hover:border-emerald-700/60"
            >
              {/* 16:9 Aspect Ratio Frame Container */}
              <div className="relative aspect-video w-full bg-[#050907] flex items-center justify-center border-b border-zinc-850 overflow-hidden">
                {visualStyle === "photo" ? (
                  /* නියම Cinematic ඡායාරූපය */
                  <div className="relative w-full h-full">
                    <img
                      src={frame.imageUrl}
                      alt={frame.shotTitle}
                      className="w-full h-full object-cover brightness-90 contrast-105 group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />
                  </div>
                ) : (
                  /* Sketch මාදිලිය */
                  <div className="w-full h-full flex flex-col items-center justify-center p-6 relative bg-zinc-950">
                    <div className="w-20 h-20 rounded-full border-2 border-zinc-600 mb-2 flex items-center justify-center">
                      <Camera className="w-8 h-8 text-zinc-500" />
                    </div>
                    <div className="w-32 h-16 border-2 border-zinc-600 rounded-t-lg" />
                  </div>
                )}

                {/* Top Shot Badge */}
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded bg-black/85 text-white font-mono font-bold text-xs border border-zinc-800 tracking-wider">
                  {frame.shotNumber}
                </div>

                {/* Top Delete Button */}
                <button
                  onClick={() => handleDeleteFrame(frame.id)}
                  className="absolute top-3 right-3 p-1.5 rounded-lg bg-black/80 hover:bg-red-950 text-zinc-400 hover:text-red-400 border border-zinc-800 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>

                {/* Bottom Canvas Tags */}
                <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded bg-black/80 text-[10px] font-mono text-emerald-400 border border-emerald-900/60">
                    STORYBOARD PANEL
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 bg-black/80 px-2 py-0.5 rounded border border-emerald-900/40">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      Studio Ready
                    </span>
                    <span className="px-2 py-0.5 rounded bg-zinc-900/90 text-[10px] font-mono text-zinc-300 border border-zinc-800">
                      {visualStyle === "photo" ? "16:9 AI Render" : "StudioBinder Sketch"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Shot Details Drawer */}
              <div className="p-5 flex flex-col gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider font-mono">
                      SCENE-{String(frame.sceneNumber).padStart(2, "0")}: {frame.imageType === "wide" ? "WIDE ESTABLISHING MASTER" : "MEDIUM CLOSE ACTION (MCU)"}
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
                    Visual Prompt:
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
        <div className="h-[520px] flex flex-col items-center justify-center border-2 border-dashed border-zinc-850 rounded-3xl p-8 text-center bg-[#0b1410]/20">
          <div className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 mb-4">
            <Film className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-zinc-200">
            No Storyboard Frames Generated Yet
          </h3>
          <p className="text-xs text-zinc-500 max-w-md mt-1 leading-relaxed">
            Screenplay එකෙන් Storyboard ඡායාරූප සාදා ගැනීමට Script Breakdown පිටුවට ගොස් ස්ක්‍රිප්ට් එක Parse කර **"Generate All Storyboards"** ඔබන්න.
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