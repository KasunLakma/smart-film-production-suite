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

// 1. Scene Context හඳුනාගැනීම (ඕනෑම Script එකක සිංහල/ඉංග්‍රීසි Slugline එකකින්)
function getSceneContext(slugline: string) {
  const text = (slugline || "").toLowerCase();

  if (/lab|විද්‍යාගාර|computer|research/.test(text)) {
    return {
      type: "lab",
      wide: "storyboard sketch, black and white drawing, high tech laboratory with computer monitors and holographic table, 16:9 film frame",
      close: "storyboard sketch, black and white pencil art, close up technician holding glowing handheld scanning device, ink outlines",
      fallbackWide: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1024&h=576&q=80",
      fallbackClose: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1024&h=576&q=80"
    };
  }

  if (/harbor|port|dock|වරාය|නැව|බෝට්ටු/.test(text)) {
    return {
      type: "harbor",
      wide: "storyboard sketch, black and white ink drawing, wet harbor checkpoint at night in pouring rain, black van parked near containers",
      close: "storyboard sketch, black and white pencil drawing, intense close up of agent holding binoculars in rain, crosshatching",
      fallbackWide: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1024&h=576&q=80",
      fallbackClose: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1024&h=576&q=80"
    };
  }

  if (/control|පාලක|command|office/.test(text)) {
    return {
      type: "control",
      wide: "storyboard sketch, black and white ink drawing, control command room with flashing emergency alarm consoles, 16:9 widescreen",
      close: "storyboard sketch, close up hand unplugging encrypted hard drive from server bank, pencil linework",
      fallbackWide: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1024&h=576&q=80",
      fallbackClose: "https://images.unsplash.com/photo-1563770660941-20978e870e26?auto=format&fit=crop&w=1024&h=576&q=80"
    };
  }

  // Dawn / Escape / Default
  return {
    type: "dawn",
    wide: "storyboard sketch, black and white drawing, foggy shipping container yard at dawn, two silhouettes running toward dock",
    close: "storyboard sketch, close up two operatives sprinting urgently toward boat, ink crosshatching",
    fallbackWide: "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=1024&h=576&q=80",
    fallbackClose: "https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?auto=format&fit=crop&w=1024&h=576&q=80"
  };
}

export default function StoryboardPage() {
  const [filterScene, setFilterScene] = useState("ALL");
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);
  const [shots, setShots] = useState<StoryboardShot[]>([]);
  const [sceneList, setSceneList] = useState<{ id: string; slugline: string }[]>([]);

  const generateSingleFrame = (shotId: string, promptText: string, fallbackUrl: string) => {
    setShots(prev => prev.map(s => s.id === shotId ? { ...s, isGenerating: true } : s));
    const seed = Math.floor(Math.random() * 800000) + 100000;
    const clean = encodeURIComponent(`${promptText}, studiobinder style, no text, no color`);
    const aiUrl = `https://image.pollinations.ai/prompt/${clean}?width=960&height=540&model=turbo&seed=${seed}`;

    // Test load image before display
    const testImg = new Image();
    testImg.src = aiUrl;
    testImg.onload = () => {
      setShots(prev => prev.map(s => s.id === shotId ? { ...s, imageUrl: aiUrl, isGenerating: false } : s));
    };
    testImg.onerror = () => {
      // If AI server drops request, immediately use grayscale storyboard sketch
      setShots(prev => prev.map(s => s.id === shotId ? { ...s, imageUrl: fallbackUrl, isGenerating: false } : s));
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
              const ctx = getSceneContext(scene.slugline);
              const isTarget = activeFilter === "ALL" || activeFilter === scene.id;

              newShots.push({
                id: `shot-${scene.id}-A`,
                sceneId: scene.id,
                shotNumber: `SHOT ${String(index + 1).padStart(2, "0")}A`,
                sceneSlug: scene.slugline,
                shotType: "Wide Master Framing (WMS)",
                lens: "28mm Anamorphic T2.0",
                cameraMovement: "Slow Push-In Tracking",
                displayTitle: `${scene.id}: Wide Establishing Shot`,
                actionSubject: ctx.wide,
                isGenerating: isTarget,
                imageUrl: isTarget ? ctx.fallbackWide : ""
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
                actionSubject: ctx.close,
                isGenerating: isTarget,
                imageUrl: isTarget ? ctx.fallbackClose : ""
              });
            });

            setShots(newShots);
            setFilterScene(activeFilter);

            // Sequenced drawing queue with 1.2s delay to beat rate limits
            const targetShots = newShots.filter(s => activeFilter === "ALL" || activeFilter === s.sceneId);
            targetShots.forEach((shot, idx) => {
              const ctx = getSceneContext(shot.sceneSlug);
              const fallback = shot.id.endsWith("-A") ? ctx.fallbackWide : ctx.fallbackClose;
              setTimeout(() => {
                generateSingleFrame(shot.id, shot.actionSubject, fallback);
              }, idx * 1200);
            });
          }
        } catch { }
      }
    }
  }, []);

  const handleGenerateAll = () => {
    setIsGeneratingAll(true);
    shots.forEach((shot, idx) => {
      const ctx = getSceneContext(shot.sceneSlug);
      const fallback = shot.id.endsWith("-A") ? ctx.fallbackWide : ctx.fallbackClose;
      setTimeout(() => {
        generateSingleFrame(shot.id, shot.actionSubject, fallback);
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
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-emerald-950/60">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" /> StudioBinder Film Storyboard Engine
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Cinematic Storyboard Studio
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            තිර පිටපතේ දර්ශන අනුව StudioBinder Hand-Drawn Sketch Panels මෙහි සකස් වේ.
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

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-[#09130e] border border-emerald-950/70">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5 mr-1">
            <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-400" /> Filter Scene:
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

        <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
          <span className="px-2.5 py-1 rounded bg-[#0e1d15] border border-emerald-500/20 text-emerald-400 font-mono">
            StudioBinder B&W Sketch Mode
          </span>
          <span className="text-slate-500">•</span>
          <span>16:9 DCI Flat</span>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredShots.map((shot) => {
          const ctx = getSceneContext(shot.sceneSlug);
          const fallback = shot.id.endsWith("-A") ? ctx.fallbackWide : ctx.fallbackClose;

          return (
            <div
              key={shot.id}
              className="group rounded-2xl bg-[#09130e] border border-emerald-950/70 hover:border-emerald-500/40 transition-all overflow-hidden flex flex-col shadow-lg"
            >
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
                        (e.target as HTMLImageElement).src = fallback;
                      }}
                      className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 filter grayscale contrast-125 brightness-95"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-end p-3">
                      <button
                        onClick={() => generateSingleFrame(shot.id, shot.actionSubject, fallback)}
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
                      onClick={() => generateSingleFrame(shot.id, shot.actionSubject, fallback)}
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
                  <span className="px-2 py-0.5 rounded bg-black/80 backdrop-blur-sm text-[10px] font-mono text-emerald-400 border border-slate-800">
                    StudioBinder Sketch
                  </span>
                </div>
              </div>

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
          );
        })}
      </div>
    </div>
  );
}