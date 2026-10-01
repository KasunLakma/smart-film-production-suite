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
  displayTitle: string;
  actionSubject: string;
  imageUrl?: string;
  isGenerating?: boolean;
}

// 1. StudioBinder B&W Sketches Library (Zero Broken Images)
const B_W_SKETCH_PRESETS: Record<string, { wide: string; close: string }> = {
  "SCENE-01": {
    wide: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1280&h=720&q=85",
    close: "https://images.unsplash.com/photo-1582738411706-bfc8e691d1c2?auto=format&fit=crop&w=1280&h=720&q=85"
  },
  "SCENE-02": {
    wide: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1280&h=720&q=85",
    close: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1280&h=720&q=85"
  },
  "SCENE-03": {
    wide: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1280&h=720&q=85",
    close: "https://images.unsplash.com/photo-1582738411706-bfc8e691d1c2?auto=format&fit=crop&w=1280&h=720&q=85"
  },
  "SCENE-04": {
    wide: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1280&h=720&q=85",
    close: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1280&h=720&q=85"
  }
};

const getSceneActionSubject = (sceneSlug: string, isWide: boolean): string => {
  const text = (sceneSlug || "").toLowerCase();

  if (text.includes("lab") || text.includes("විද්‍යාගාර")) {
    return isWide
      ? "dark high tech computer lab room, glowing monitors and holographic table, technician in distance"
      : "close-up of male technician holding glowing digital scanner tool and small flashlight";
  }

  if (text.includes("port") || text.includes("dock") || text.includes("harbor") || text.includes("වරාය")) {
    return isWide
      ? "rainy night harbor dock gate, black van parked near metal fence, street lights reflections"
      : "close up of secret agent holding binoculars in pouring rain looking out car window";
  }

  if (text.includes("control") || text.includes("පාලක")) {
    return isWide
      ? "emergency control room with flashing warning alarm sirens and mainframe computer screens"
      : "close up of operative hand disconnecting military encrypted hard drive from server";
  }

  return isWide
    ? "misty harbor docks with shipping containers at dawn, two silhouettes running toward boat"
    : "close up of two men sprinting urgently toward escape boat under misty morning sky";
};

const buildStoryboardAiUrl = (actionSubject: string, isColor: boolean, seed: number): string => {
  const baseStyle = isColor
    ? `cinematic graphic novel comic panel, ${actionSubject}, bold ink linework, cel shaded colors, storyboard art frame`
    : `black and white film storyboard drawing, ${actionSubject}, studiobinder sketch, pencil crosshatching, ink outlines`;

  const negative = "no anime, no wallpaper, no 3d render, no realistic photo, no toy";
  const cleanPrompt = encodeURIComponent(`${baseStyle}, ${negative}`);

  return `https://image.pollinations.ai/prompt/${cleanPrompt}?width=1024&height=576&nologo=true&seed=${seed}`;
};

export default function StoryboardPage() {
  const [filterScene, setFilterScene] = useState("ALL");
  const [artStyle, setArtStyle] = useState<"comic_color" | "sketch_bw">("sketch_bw");
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);
  const [shots, setShots] = useState<StoryboardShot[]>([]);
  const [sceneList, setSceneList] = useState<{ id: string; slugline: string }[]>([]);

  const reloadSingleShot = (shotId: string, actionSubject: string) => {
    setShots(prev => prev.map(s => s.id === shotId ? { ...s, isGenerating: true } : s));
    const randomSeed = Math.floor(Math.random() * 899999) + 100000;
    const url = buildStoryboardAiUrl(actionSubject, artStyle === "comic_color", randomSeed);

    setTimeout(() => {
      setShots(prev => prev.map(s => s.id === shotId ? {
        ...s,
        imageUrl: url,
        isGenerating: false
      } : s));
    }, 1200);
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
              const actionWide = getSceneActionSubject(scene.slugline, true);
              const actionClose = getSceneActionSubject(scene.slugline, false);

              const seedA = 33000 + index * 120 + (artStyle === "comic_color" ? 5 : 9);
              const seedB = 77000 + index * 120 + (artStyle === "comic_color" ? 7 : 3);

              newShots.push({
                id: `shot-${scene.id}-A`,
                sceneId: scene.id,
                shotNumber: `SHOT ${String(index + 1).padStart(2, "0")}A`,
                sceneSlug: scene.slugline,
                shotType: "Wide Master Framing (WMS)",
                lens: "28mm Anamorphic T2.0",
                cameraMovement: "Slow Push-In Tracking",
                displayTitle: `${scene.id}: Wide Establishing Shot`,
                actionSubject: actionWide,
                isGenerating: isTarget,
                imageUrl: isTarget ? buildStoryboardAiUrl(actionWide, artStyle === "comic_color", seedA) : ""
              });

              newShots.push({
                id: `shot-${scene.id}-B`,
                sceneId: scene.id,
                shotNumber: `SHOT ${String(index + 1).padStart(2, "0")}B`,
                sceneSlug: scene.slugline,
                shotType: "Medium Close Action (MCU)",
                lens: "50mm Prime T1.5",
                cameraMovement: "Static Eye-Level",
                displayTitle: `${scene.id}: Close-Up Action Shot`,
                actionSubject: actionClose,
                isGenerating: isTarget,
                imageUrl: isTarget ? buildStoryboardAiUrl(actionClose, artStyle === "comic_color", seedB) : ""
              });
            });

            setShots(newShots);
            setFilterScene(activeFilter);

            // Sequenced generation delay to avoid network rate-limit drops
            const targetShots = newShots.filter(s => activeFilter === "ALL" || activeFilter === s.sceneId);
            targetShots.forEach((shot, idx) => {
              setTimeout(() => {
                setShots(prev => prev.map(s => s.id === shot.id ? { ...s, isGenerating: false } : s));
              }, 800 + idx * 400);
            });
          }
        } catch { }
      }
    }
  }, [artStyle]);

  const handleGenerateAll = () => {
    setIsGeneratingAll(true);
    setShots(prev => prev.map(s => ({ ...s, isGenerating: true })));

    shots.forEach((shot, idx) => {
      setTimeout(() => {
        reloadSingleShot(shot.id, shot.actionSubject);
        if (idx === shots.length - 1) {
          setIsGeneratingAll(false);
        }
      }, idx * 1200);
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
            <Sparkles className="w-3.5 h-3.5" /> StudioBinder Film Storyboard Engine
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Cinematic Storyboard Studio
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            පිටපතේ දර්ශන අනුව StudioBinder Sketch සහ Graphic Novel Storyboard Panels මෙහි සකස් වේ.
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
                <Loader2 className="w-4 h-4 animate-spin" /> Rendering All Panels...
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4" /> Generate All Frames
              </>
            )}
          </button>
        </div>
      </div>

      {/* Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-[#09130e] border border-emerald-950/70">
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

        {/* Style Selector */}
        <div className="flex items-center gap-2 bg-[#050b07] p-1 rounded-xl border border-emerald-950">
          <span className="text-xs text-slate-400 px-2 flex items-center gap-1">
            <Palette className="w-3.5 h-3.5 text-emerald-400" /> Style:
          </span>
          <button
            onClick={() => setArtStyle("sketch_bw")}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${artStyle === "sketch_bw"
                ? "bg-emerald-500 text-slate-950 shadow"
                : "text-slate-400 hover:text-white"
              }`}
          >
            StudioBinder (B&W Sketch)
          </button>
          <button
            onClick={() => setArtStyle("comic_color")}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${artStyle === "comic_color"
                ? "bg-emerald-500 text-slate-950 shadow"
                : "text-slate-400 hover:text-white"
              }`}
          >
            Graphic Novel (Color)
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
            {/* Visual Frame */}
            <div className="relative aspect-video w-full bg-[#050a07] overflow-hidden border-b border-emerald-950/60 flex items-center justify-center">
              {shot.isGenerating ? (
                <div className="w-full h-full flex flex-col items-center justify-center bg-[#07130c] text-emerald-400 space-y-2 p-4 text-center">
                  <Loader2 className="w-8 h-8 animate-spin" />
                  <span className="text-xs font-medium tracking-wide">Drawing Storyboard Sketch Panel...</span>
                  <span className="text-[11px] text-slate-400 max-w-xs truncate">{shot.sceneSlug}</span>
                </div>
              ) : shot.imageUrl ? (
                <>
                  <img
                    src={shot.imageUrl}
                    alt={shot.shotNumber}
                    onError={(e) => {
                      // Fail-Safe: කළු තිර නොවී B&W Storyboard Sketch පෙන්වීම
                      const preset = B_W_SKETCH_PRESETS[shot.sceneId] || B_W_SKETCH_PRESETS["SCENE-01"];
                      (e.target as HTMLImageElement).src = shot.id.endsWith("-A") ? preset.wide : preset.close;
                    }}
                    className={`w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ${artStyle === "sketch_bw" ? "filter grayscale contrast-125 brightness-95" : ""
                      }`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-end p-3">
                    <button
                      onClick={() => reloadSingleShot(shot.id, shot.actionSubject)}
                      className="px-2.5 py-1 rounded-lg bg-black/80 hover:bg-emerald-500 hover:text-slate-950 text-white text-[11px] font-semibold flex items-center gap-1.5 transition-all border border-emerald-500/30 cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" /> Redraw Panel
                    </button>
                  </div>
                </>
              ) : (
                <div className="w-full h-full p-4 flex flex-col items-center justify-center text-center bg-[#060c08] border border-dashed border-emerald-950/80 rounded-t-2xl">
                  <Video className="w-8 h-8 text-slate-600 mb-2" />
                  <p className="text-xs text-slate-400 mb-3 font-medium">Panel not drawn yet</p>
                  <button
                    onClick={() => reloadSingleShot(shot.id, shot.actionSubject)}
                    className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Wand2 className="w-3.5 h-3.5" /> Draw Panel
                  </button>
                </div>
              )}

              {/* Badges */}
              <div className="absolute top-3 left-3 flex items-center gap-2 pointer-events-none">
                <span className="px-2 py-0.5 rounded bg-slate-950/90 backdrop-blur-md border border-white/20 text-white text-[11px] font-bold font-mono">
                  {shot.shotNumber}
                </span>
              </div>

              <div className="absolute bottom-2 right-2 pointer-events-none">
                <span className="px-2 py-0.5 rounded bg-black/80 backdrop-blur-sm text-[10px] font-mono text-slate-200 border border-slate-700">
                  {artStyle === "sketch_bw" ? "B&W Storyboard Sketch" : "Graphic Novel Art"}
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div>
                <p className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider mb-1 truncate">
                  {shot.displayTitle}
                </p>
                <h3 className="text-sm font-bold text-white mb-2">
                  {shot.shotType}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed font-light line-clamp-3">
                  "{shot.actionSubject}"
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