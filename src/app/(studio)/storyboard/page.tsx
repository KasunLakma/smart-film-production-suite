"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  SlidersHorizontal,
  Video,
  RefreshCw,
  Loader2,
  Wand2,
  FileText,
  Palette,
  Sparkles
} from "lucide-react";

interface StoryboardShot {
  id: string;
  sceneId: string;
  shotNumber: string;
  sceneSlug: string;
  shotType: string;
  lens: string;
  cameraMovement: string;
  visualPrompt: string;
  aiPrompt: string;
  imageUrl?: string;
  isGenerating?: boolean;
}

export default function StoryboardPage() {
  const [filterScene, setFilterScene] = useState("ALL");
  const [artStyle, setArtStyle] = useState<"comic_color" | "sketch_bw">("comic_color");
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);
  const [shots, setShots] = useState<StoryboardShot[]>([]);
  const [sceneList, setSceneList] = useState<{ id: string; slugline: string }[]>([]);

  // Build 100% Comic/Storyboard Prompts (Matching Image 1 & 2 styles)
  const buildStoryboardPrompt = (sceneSlug: string, isWide: boolean, style: "comic_color" | "sketch_bw"): string => {
    const text = sceneSlug.toLowerCase();

    let setting = "underground cybernetics laboratory, glowing computer terminal screens, metallic server racks";
    let action = isWide
      ? "operative standing in the distance observing holographic terminals"
      : "intense close-up of Sri Lankan operative inspecting glowing digital handheld scanner";

    if (text.includes("වරාය") || text.includes("port") || text.includes("dock") || text.includes("harbor")) {
      setting = "rainy industrial harbor entrance at night, cargo shipping containers, dark van parked under streetlamps";
      action = isWide
        ? "dark van parked by harbor gates under heavy rain mist"
        : "close-up of secret tactical agent with binoculars looking through rainy windshield";
    } else if (text.includes("පාලක") || text.includes("control")) {
      setting = "central control room with flashing emergency red alarm lights and computer banks";
      action = isWide
        ? "red alarm lighting flashing across mainframe servers"
        : "operative hand unplugging encrypted hard drive under emergency red light";
    }

    if (style === "comic_color") {
      // Image 2 Style: GTA / Graphic Novel Comic Art (Cel-shaded, Bold Outlines)
      return isWide
        ? `graphic novel comic book illustration, GTA 5 art style, cel shaded, bold black ink outlines, ${setting}, ${action}, dynamic wide angle panel, comic book aesthetic, vibrant cinematic color palette, no realistic photo, no 3d render`
        : `graphic novel portrait art, GTA loading screen illustration style, bold comic ink lines, cel shading, ${action}, intense facial expression, dramatic background, comic panel, no real photo`;
    } else {
      // Image 1 Style: StudioBinder B&W Pencil & Ink Sketch Storyboard
      return isWide
        ? `black and white film storyboard drawing, studiobinder ink sketch, dynamic wide angle comic panel, crosshatching pencil shading, ${setting}, ${action}, ink linework storyboard frame, no photo, no color`
        : `black and white storyboard closeup panel, dramatic pencil ink sketch, crosshatched shading, ${action}, expressive comic linework, studiobinder storyboard template, no realistic photo`;
    }
  };

  const getAiUrl = (promptText: string, seed: number) => {
    const clean = encodeURIComponent(promptText);
    return `https://image.pollinations.ai/prompt/${clean}?width=1280&height=720&nologo=true&seed=${seed}`;
  };

  // Generate / Regenerate a single shot
  const generateShotImage = (shotId: string, promptText: string) => {
    setShots(prev => prev.map(s => s.id === shotId ? { ...s, isGenerating: true } : s));
    const randomSeed = Math.floor(Math.random() * 899999) + 100000;
    const url = getAiUrl(promptText, randomSeed);

    // Preload image to avoid broken icons
    const img = new Image();
    img.src = url;
    img.onload = () => {
      setShots(prev => prev.map(s => s.id === shotId ? { ...s, imageUrl: url, isGenerating: false } : s));
    };
    img.onerror = () => {
      setShots(prev => prev.map(s => s.id === shotId ? { ...s, isGenerating: false } : s));
    };
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedScenes = localStorage.getItem("active_screenplay_scenes");
      const activeFilter = localStorage.getItem("storyboard_filter") || "ALL";

      if (storedScenes) {
        try {
          const parsed = JSON.parse(storedScenes);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setSceneList(parsed.map((s: any) => ({ id: s.id, slugline: s.slugline })));

            const newShots: StoryboardShot[] = [];

            parsed.forEach((scene: any, index: number) => {
              const isTarget = activeFilter === "ALL" || activeFilter === scene.id;
              const promptA = buildStoryboardPrompt(scene.slugline, true, artStyle);
              const promptB = buildStoryboardPrompt(scene.slugline, false, artStyle);

              newShots.push({
                id: `shot-${scene.id}-A`,
                sceneId: scene.id,
                shotNumber: `SHOT ${String(index + 1).padStart(2, "0")}A`,
                sceneSlug: scene.slugline,
                shotType: "Wide Master Framing (WMS)",
                lens: "28mm Anamorphic T2.0",
                cameraMovement: "Slow Push-In Tracking",
                visualPrompt: `${scene.slugline} - Wide Establishing Frame`,
                aiPrompt: promptA,
                isGenerating: isTarget,
                imageUrl: ""
              });

              newShots.push({
                id: `shot-${scene.id}-B`,
                sceneId: scene.id,
                shotNumber: `SHOT ${String(index + 1).padStart(2, "0")}B`,
                sceneSlug: scene.slugline,
                shotType: "Medium Close Action (MCU)",
                lens: "50mm Prime T1.5",
                cameraMovement: "Static Eye-Level",
                visualPrompt: `Focused Character & Props Interaction`,
                aiPrompt: promptB,
                isGenerating: isTarget,
                imageUrl: ""
              });
            });

            setShots(newShots);
            setFilterScene(activeFilter);

            // Trigger AI Generation for the target scene
            const targetShots = newShots.filter(s => activeFilter === "ALL" || activeFilter === s.sceneId);
            targetShots.forEach((shot, idx) => {
              setTimeout(() => {
                generateShotImage(shot.id, shot.aiPrompt);
              }, idx * 1000);
            });
          }
        } catch { }
      }
    }
  }, [artStyle]);

  const handleGenerateAll = () => {
    setIsGeneratingAll(true);
    shots.forEach((shot, idx) => {
      setTimeout(() => {
        generateShotImage(shot.id, shot.aiPrompt);
        if (idx === shots.length - 1) {
          setIsGeneratingAll(false);
        }
      }, idx * 1000);
    });
  };

  const filteredShots = filterScene === "ALL"
    ? shots
    : shots.filter(s => s.sceneId === filterScene);

  return (
    <div className="space-y-8 p-6 md:p-8 max-w-7xl mx-auto text-slate-100">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-emerald-950/60">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" /> AI Comic & Storyboard Studio
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Comic Storyboard Visualizer
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            StudioBinder & Graphic Novel ශෛලියෙන් දර්ශන සඳහා AI Comic Storyboard Frames සාදයි.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/breakdown"
            className="px-4 py-2.5 rounded-xl bg-[#09130e] hover:bg-[#0e1d15] border border-emerald-950 text-slate-300 text-xs font-semibold transition-all flex items-center gap-2"
          >
            <FileText className="w-4 h-4 text-emerald-400" /> Back to Script
          </Link>
          <button
            onClick={handleGenerateAll}
            disabled={isGeneratingAll || shots.length === 0}
            className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2 cursor-pointer"
          >
            {isGeneratingAll ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Generating All Panels...
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4" /> Generate All Frames
              </>
            )}
          </button>
        </div>
      </div>

      {/* Control Bar: Scene Selector & Art Style Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-[#09130e] border border-emerald-950/70">
        {/* Scene Filter */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5 mr-1">
            <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-400" /> Scene Filter:
          </span>
          <button
            onClick={() => setFilterScene("ALL")}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${filterScene === "ALL"
                ? "bg-emerald-500 text-slate-950 font-bold"
                : "bg-[#0e1d15] text-slate-300 hover:text-white"
              }`}
          >
            All Sequences ({shots.length})
          </button>

          {sceneList.map((scn) => (
            <button
              key={scn.id}
              onClick={() => setFilterScene(scn.id)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${filterScene === scn.id
                  ? "bg-emerald-500 text-slate-950 font-bold"
                  : "bg-[#0e1d15] text-slate-300 hover:text-white"
                }`}
            >
              {scn.id}
            </button>
          ))}
        </div>

        {/* Art Style Toggle */}
        <div className="flex items-center gap-2 bg-[#050b07] p-1 rounded-xl border border-emerald-950">
          <span className="text-xs text-slate-400 px-2 flex items-center gap-1">
            <Palette className="w-3.5 h-3.5 text-emerald-400" /> Style:
          </span>
          <button
            onClick={() => setArtStyle("comic_color")}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${artStyle === "comic_color"
                ? "bg-emerald-500 text-slate-950 shadow"
                : "text-slate-400 hover:text-white"
              }`}
          >
            Graphic Novel (Color)
          </button>
          <button
            onClick={() => setArtStyle("sketch_bw")}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${artStyle === "sketch_bw"
                ? "bg-emerald-500 text-slate-950 shadow"
                : "text-slate-400 hover:text-white"
              }`}
          >
            StudioBinder (B&W Sketch)
          </button>
        </div>
      </div>

      {/* Storyboard Shots Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredShots.map((shot) => (
          <div
            key={shot.id}
            className="group rounded-2xl bg-[#09130e] border border-emerald-950/70 hover:border-emerald-500/40 transition-all overflow-hidden flex flex-col shadow-lg"
          >
            <div className="relative aspect-video w-full bg-[#050a07] overflow-hidden border-b border-emerald-950/60 flex items-center justify-center">
              {shot.isGenerating ? (
                <div className="w-full h-full flex flex-col items-center justify-center bg-[#07130c] text-emerald-400 space-y-2 p-4 text-center">
                  <Loader2 className="w-8 h-8 animate-spin" />
                  <span className="text-xs font-medium tracking-wide">Drawing Comic Storyboard Frame with AI...</span>
                  <span className="text-[11px] text-slate-400 max-w-xs truncate">{shot.sceneSlug}</span>
                </div>
              ) : shot.imageUrl ? (
                <>
                  <img
                    src={shot.imageUrl}
                    alt={shot.shotNumber}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-end p-3">
                    <button
                      onClick={() => generateShotImage(shot.id, shot.aiPrompt)}
                      className="px-2.5 py-1 rounded-lg bg-black/80 hover:bg-emerald-500 hover:text-slate-950 text-white text-[11px] font-semibold flex items-center gap-1.5 transition-all border border-emerald-500/30 cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" /> Redraw Panel
                    </button>
                  </div>
                </>
              ) : (
                <div className="w-full h-full p-4 flex flex-col items-center justify-center text-center bg-[#060c08] border border-dashed border-emerald-950/80 rounded-t-2xl">
                  <Video className="w-8 h-8 text-slate-600 mb-2" />
                  <p className="text-xs text-slate-400 mb-3 font-medium">Comic Panel not rendered yet</p>
                  <button
                    onClick={() => generateShotImage(shot.id, shot.aiPrompt)}
                    className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Wand2 className="w-3.5 h-3.5" /> Draw Panel
                  </button>
                </div>
              )}

              <div className="absolute top-3 left-3 flex items-center gap-2 pointer-events-none">
                <span className="px-2 py-0.5 rounded bg-slate-950/90 backdrop-blur-md border border-white/20 text-white text-[11px] font-bold font-mono">
                  {shot.shotNumber}
                </span>
              </div>

              <div className="absolute bottom-2 right-2 pointer-events-none">
                <span className="px-2 py-0.5 rounded bg-black/75 backdrop-blur-sm text-[10px] font-mono text-emerald-400 border border-emerald-950">
                  {artStyle === "comic_color" ? "Graphic Novel Art" : "Ink Sketch"}
                </span>
              </div>
            </div>

            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div>
                <p className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider mb-1 truncate">
                  {shot.sceneSlug}
                </p>
                <h3 className="text-sm font-bold text-white mb-2">
                  {shot.shotType}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed font-light line-clamp-3">
                  "{shot.aiPrompt}"
                </p>
              </div>

              <div className="pt-3 border-t border-emerald-950/60 grid grid-cols-2 gap-2 text-[11px]">
                <div className="bg-[#0e1d15] p-2 rounded-lg border border-emerald-950/80">
                  <span className="text-slate-500 block text-[10px] uppercase">Lens Angle</span>
                  <span className="text-slate-200 font-medium truncate block mt-0.5">{shot.lens}</span>
                </div>
                <div className="bg-[#0e1d15] p-2 rounded-lg border border-emerald-950/80">
                  <span className="text-slate-500 block text-[10px] uppercase">Movement</span>
                  <span className="text-slate-200 font-medium truncate block mt-0.5">{shot.cameraMovement}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}