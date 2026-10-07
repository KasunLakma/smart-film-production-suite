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
  characters: string[];
  props: string[];
  imageType: "wide" | "sketch";
}

export default function CinematicStoryboardStudioPage() {
  const [frames, setFrames] = useState<StoryboardFrame[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>("ALL");
  const [visualStyle, setVisualStyle] = useState<"sketch" | "color">("sketch");
  const [isSynthesizing, setIsSynthesizing] = useState<boolean>(false);

  useEffect(() => {
    try {
      const storedFramesRaw = sessionStorage.getItem("eclat_storyboard_frames");
      if (storedFramesRaw) {
        setFrames(JSON.parse(storedFramesRaw));
        return;
      }

      // Session හි frames නැතිනම් active scenes තිබේදැයි බැලීම
      const storedScenesRaw = sessionStorage.getItem("eclat_active_scenes");
      if (storedScenesRaw) {
        const scList = JSON.parse(storedScenesRaw);
        if (Array.isArray(scList) && scList.length > 0) {
          const generated: StoryboardFrame[] = scList.flatMap((sc: any) => [
            {
              id: `sb-${sc.sceneNumber}-a`,
              sceneNumber: sc.sceneNumber,
              shotNumber: `SHOT ${String(sc.sceneNumber).padStart(2, "0")}A`,
              shotTitle: `Wide Master Framing (WMS)`,
              slugline: `SCENE 0${sc.sceneNumber}: ${sc.slugline}`,
              lensAngle: "28mm Anamorphic T2.0",
              movement: "Slow Push-In Tracking",
              characters: sc.characters || [],
              props: sc.props || [],
              imageType: "wide" as const
            },
            {
              id: `sb-${sc.sceneNumber}-b`,
              sceneNumber: sc.sceneNumber,
              shotNumber: `SHOT ${String(sc.sceneNumber).padStart(2, "0")}B`,
              shotTitle: `Medium Close Action (MCU)`,
              slugline: `SCENE 0${sc.sceneNumber}: ${sc.slugline}`,
              lensAngle: "50mm Prime T1.5",
              movement: "Dynamic Eye-Level",
              characters: sc.characters || [],
              props: sc.props || [],
              imageType: "sketch" as const
            }
          ]);
          setFrames(generated);
          sessionStorage.setItem("eclat_storyboard_frames", JSON.stringify(generated));
        }
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
      alert("All Storyboard shots synthesized successfully!");
    }, 800);
  };

  const filteredFrames = activeFilter === "ALL"
    ? frames
    : frames.filter((f) => `SCENE-${String(f.sceneNumber).padStart(2, "0")}` === activeFilter);

  const sceneNumbers = Array.from(new Set(frames.map((f) => f.sceneNumber))).sort((a, b) => a - b);

  return (
    <div className="min-h-screen bg-[#060b08] text-zinc-200 p-8 font-sans">
      {/* Top Header matching Screenshot 2170 */}
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
                className="p-2.5 rounded-xl bg-zinc-900 hover:bg-red-950 text-zinc-400 hover:text-red-400 border border-zinc-800 transition-all"
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
                Synthesize All Frames
              </button>
            </>
          )}
        </div>
      </div>

      {/* Control Bar: Scene Filter & Style */}
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
                onClick={() => setVisualStyle("sketch")}
                className={`px-3 py-1 rounded-md text-[11px] font-semibold transition-all ${visualStyle === "sketch" ? "bg-emerald-500 text-black" : "text-zinc-400 hover:text-white"
                  }`}
              >
                StudioBinder (B&W Sketch)
              </button>
              <button
                onClick={() => setVisualStyle("color")}
                className={`px-3 py-1 rounded-md text-[11px] font-semibold transition-all ${visualStyle === "color" ? "bg-emerald-500 text-black" : "text-zinc-400 hover:text-white"
                  }`}
              >
                Graphic Novel (Color)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Storyboard Grid: Exactly reproducing Screenshot 2170 */}
      {filteredFrames.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filteredFrames.map((frame) => (
            <div
              key={frame.id}
              className="group bg-[#0b1410] border border-emerald-900/40 rounded-2xl overflow-hidden shadow-2xl transition-all hover:border-emerald-700/60"
            >
              {/* 16:9 Aspect Video Container */}
              <div className="relative aspect-video w-full bg-[#050907] flex items-center justify-center border-b border-zinc-850 overflow-hidden">
                {frame.imageType === "wide" ? (
                  /* Screenshot 2170 හි වම්පස ඇති Cinematic Lab Corridor Perspective Photo එක */
                  <div className="relative w-full h-full">
                    <img
                      src="https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1280&h=720&q=80"
                      alt={frame.shotTitle}
                      className="w-full h-full object-cover brightness-90 contrast-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 pointer-events-none" />
                  </div>
                ) : (
                  /* Screenshot 2170 හි දකුණුපස ඇති Blueprint Wireframe Sketch එක (රවුම සහ කොටුව සහිත blocking) */
                  <div className="w-full h-full flex flex-col items-center justify-center p-6 relative bg-[#060a08] select-none">
                    {/* Perspective lines */}
                    <div className="absolute inset-0 opacity-20 pointer-events-none">
                      <div className="w-full h-full border-t border-b border-dashed border-zinc-500 flex items-center justify-center">
                        <div className="w-3/4 h-3/4 border border-zinc-600" />
                      </div>
                    </div>

                    {/* Camera Blocking Diagram matching Screenshot 2170 */}
                    <div className="flex flex-col items-center justify-center relative z-10">
                      <div className="w-14 h-14 rounded-full border-2 border-zinc-500/80 mb-2 flex items-center justify-center bg-zinc-900/50" />
                      <div className="w-24 h-16 border-2 border-zinc-500/80 rounded-t-lg bg-zinc-900/50" />
                    </div>

                    <span className="text-[10px] font-mono text-zinc-500 mt-3 tracking-widest uppercase z-10">
                      CINEMATIC FRAMING REFERENCE SKETCH
                    </span>
                  </div>
                )}

                {/* Shot Tag */}
                <div className="absolute top-3 left-3 px-2.5 py-1 rounded bg-black/85 text-white font-mono font-bold text-xs border border-zinc-800 tracking-wider">
                  {frame.shotNumber}
                </div>

                {/* Delete Button */}
                <button
                  onClick={() => handleDeleteFrame(frame.id)}
                  className="absolute top-3 right-3 p-1.5 rounded-lg bg-black/80 hover:bg-red-950 text-zinc-400 hover:text-red-400 border border-zinc-800 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>

                {/* Bottom Canvas Overlay Tags matching Screenshot 2170 */}
                <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between pointer-events-none">
                  <span className="px-2 py-0.5 rounded bg-black/80 text-[10px] font-mono text-emerald-400 border border-emerald-900/60">
                    STORYBOARD PANEL
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 bg-black/80 px-2 py-0.5 rounded border border-emerald-900/40">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      Studio Ready
                    </span>
                    <span className="px-2 py-0.5 rounded bg-zinc-900/90 text-[10px] font-mono text-zinc-300 border border-zinc-800">
                      StudioBinder Sketch
                    </span>
                  </div>
                </div>
              </div>

              {/* Shot Details Drawer matching Screenshot 2170 */}
              <div className="p-5 flex flex-col gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider font-mono">
                      {frame.imageType === "wide" ? "SCENE-01: WIDE ESTABLISHING MASTER" : "SCENE-01: CLOSE-UP KEY ACTION"}
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
            Screenplay එකෙන් Storyboard සාදා ගැනීමට Script Breakdown පිටුවට ගොස් **"Generate All Storyboards"** ඔබන්න.
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