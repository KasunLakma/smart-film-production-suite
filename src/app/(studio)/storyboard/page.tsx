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
  cleanActionPrompt: string;
  imageUrl?: string;
  isGenerating?: boolean;
}

// 1. සිංහල හෝ ඉංග්‍රීසි ඕනෑම script එකක් 100% ක් පිරිසිදු English Comic Prompt එකක් බවට හැරවීම
function getCleanComicPrompt(sceneSlug: string, isWide: boolean, style: "comic_color" | "sketch_bw"): string {
  const text = (sceneSlug || "").toLowerCase();

  let setting = "underground cybernetics laboratory, glowing computer terminal screens, holographic devices";
  let action = isWide
    ? "wide shot of operative inside high-tech control lab, monitors and server consoles"
    : "close-up of focused Asian male operative inspecting glowing tactical device";

  if (text.includes("වරාය") || text.includes("port") || text.includes("dock") || text.includes("harbor")) {
    setting = "rainy industrial harbor entrance at night, cargo shipping containers, dark van";
    action = isWide
      ? "wide shot of dark tactical van parked near harbor gates in heavy rain"
      : "close-up of secret tactical agent with binoculars looking through rainy window";
  } else if (text.includes("පාලක") || text.includes("control") || text.includes("room")) {
    setting = "central operations control room with flashing emergency red alarm lights";
    action = isWide
      ? "wide shot of flashing emergency red lights across mainframe consoles"
      : "close-up of hand pulling encrypted military drive under red emergency lighting";
  } else if (text.includes("dawn") || text.includes("අලුයම") || text.includes("බෝට්ටුව")) {
    setting = "foggy coastal harbor shipping yard at dawn, cargo containers, misty morning";
    action = isWide
      ? "wide shot of two operatives running past cargo containers toward dock at dawn"
      : "medium shot of two male operatives sprinting towards docked escape boat";
  } else if (text.includes("කාමර") || text.includes("room") || text.includes("house")) {
    setting = "dimly lit room interior, dramatic shadows, moody window light";
    action = isWide
      ? "wide shot of characters in tense discussion inside dimly lit room"
      : "close up portrait of character expressing shock and tension";
  }

  if (style === "comic_color") {
    return isWide
      ? `graphic novel comic book illustration, dynamic comic panel, ${setting}, ${action}, bold black ink lines, vibrant cel shaded colors, GTA comic art style, clean storyboard frame`
      : `graphic novel comic character art, GTA loading screen illustration style, bold comic ink outlines, cel shading, ${action}, intense eyes, dramatic comic panel`;
  } else {
    return isWide
      ? `black and white film storyboard drawing, studiobinder ink sketch, dynamic wide angle comic panel, crosshatching pencil shading, ${setting}, ${action}, ink linework storyboard frame`
      : `black and white storyboard closeup panel, dramatic pencil ink sketch, crosshatched shading, ${action}, expressive comic linework, studiobinder storyboard template`;
  }
}

// 2. විශ්වාසදායක Comic Art Fallback Images (Network drop / timeout වුවහොත් කළු තිර නොවී පෙනීමට)
const COMIC_FALLBACKS: Record<string, { colorWide: string; colorClose: string; bwWide: string; bwClose: string }> = {
  lab: {
    colorWide: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1280&h=720&q=85",
    colorClose: "https://images.unsplash.com/photo-1563089145-599997674d42?auto=format&fit=crop&w=1280&h=720&q=85",
    bwWide: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1280&h=720&q=85",
    bwClose: "https://images.unsplash.com/photo-1582738411706-bfc8e691d1c2?auto=format&fit=crop&w=1280&h=720&q=85"
  },
  harbor: {
    colorWide: "https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1280&h=720&q=85",
    colorClose: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=1280&h=720&q=85",
    bwWide: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1280&h=720&q=85",
    bwClose: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1280&h=720&q=85"
  }
};

export default function StoryboardPage() {
  const [filterScene, setFilterScene] = useState("ALL");
  const [artStyle, setArtStyle] = useState<"comic_color" | "sketch_bw">("comic_color");
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);
  const [shots, setShots] = useState<StoryboardShot[]>([]);
  const [sceneList, setSceneList] = useState<{ id: string; slugline: string }[]>([]);

  const buildAiImageUrl = (prompt: string, seed: number) => {
    // කෙටි, පිරිසිදු English prompt එකක් පමණක් URL එකට යැවීම
    const encoded = encodeURIComponent(prompt.slice(0, 180));
    return `https://image.pollinations.ai/prompt/${encoded}?width=1024&height=576&nologo=true&seed=${seed}`;
  };

  const reloadSingleShot = (shotId: string, promptText: string) => {
    setShots(prev => prev.map(s => s.id === shotId ? { ...s, isGenerating: true } : s));
    const randomSeed = Math.floor(Math.random() * 899999) + 100000;
    const url = buildAiImageUrl(promptText, randomSeed);

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

              const widePrompt = getCleanComicPrompt(scene.slugline, true, artStyle);
              const closePrompt = getCleanComicPrompt(scene.slugline, false, artStyle);

              const seedA = 20000 + index * 150 + (artStyle === "comic_color" ? 11 : 22);
              const seedB = 60000 + index * 150 + (artStyle === "comic_color" ? 33 : 44);

              newShots.push({
                id: `shot-${scene.id}-A`,
                sceneId: scene.id,
                shotNumber: `SHOT ${String(index + 1).padStart(2, "0")}A`,
                sceneSlug: scene.slugline,
                shotType: "Wide Master Framing (WMS)",
                lens: "28mm Anamorphic T2.0",
                cameraMovement: "Slow Push-In Tracking",
                cleanActionPrompt: widePrompt,
                isGenerating: isTarget,
                imageUrl: isTarget ? buildAiImageUrl(widePrompt, seedA) : ""
              });

              newShots.push({
                id: `shot-${scene.id}-B`,
                sceneId: scene.id,
                shotNumber: `SHOT ${String(index + 1).padStart(2, "0")}B`,
                sceneSlug: scene.slugline,
                shotType: "Medium Close Action (MCU)",
                lens: "50mm Prime T1.5",
                cameraMovement: "Static Eye-Level",
                cleanActionPrompt: closePrompt,
                isGenerating: isTarget,
                imageUrl: isTarget ? buildAiImageUrl(closePrompt, seedB) : ""
              });
            });

            setShots(newShots);
            setFilterScene(activeFilter);

            setTimeout(() => {
              setShots(prev => prev.map(s => ({ ...s, isGenerating: false })));
            }, 1000);
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
        reloadSingleShot(shot.id, shot.cleanActionPrompt);
        if (idx === shots.length - 1) {
          setIsGeneratingAll(false);
        }
      }, idx * 600);
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
            <Sparkles className="w-3.5 h-3.5" /> AI Comic Storyboard Engine
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Comic Storyboard Visualizer
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            StudioBinder & Graphic Novel ශෛලියෙන් තිර පිටපතේ දර්ශන සඳහා AI Comic Storyboard Panels සකස් කරයි.
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

      {/* Control Bar: Scene Selector & Art Style Switcher */}
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
            {/* Visual Container */}
            <div className="relative aspect-video w-full bg-[#050a07] overflow-hidden border-b border-emerald-950/60 flex items-center justify-center">
              {shot.isGenerating ? (
                <div className="w-full h-full flex flex-col items-center justify-center bg-[#07130c] text-emerald-400 space-y-2 p-4 text-center">
                  <Loader2 className="w-8 h-8 animate-spin" />
                  <span className="text-xs font-medium tracking-wide">Drawing Comic Storyboard Frame...</span>
                  <span className="text-[11px] text-slate-400 max-w-xs truncate">{shot.sceneSlug}</span>
                </div>
              ) : shot.imageUrl ? (
                <>
                  <img
                    src={shot.imageUrl}
                    alt={shot.shotNumber}
                    onError={(e) => {
                      // Broken image නොවී comic fallback එකක් දැමීම
                      const isHarbor = shot.sceneSlug.includes("වරාය") || shot.sceneSlug.includes("port");
                      const pack = isHarbor ? COMIC_FALLBACKS.harbor : COMIC_FALLBACKS.lab;
                      const fallback = artStyle === "comic_color"
                        ? (shot.id.endsWith("-A") ? pack.colorWide : pack.colorClose)
                        : (shot.id.endsWith("-A") ? pack.bwWide : pack.bwClose);
                      (e.target as HTMLImageElement).src = fallback;
                    }}
                    className={`w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ${artStyle === "sketch_bw" ? "filter grayscale contrast-125" : ""
                      }`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-end p-3">
                    <button
                      onClick={() => reloadSingleShot(shot.id, shot.cleanActionPrompt)}
                      className="px-2.5 py-1 rounded-lg bg-black/80 hover:bg-emerald-500 hover:text-slate-950 text-white text-[11px] font-semibold flex items-center gap-1.5 transition-all border border-emerald-500/30 cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" /> Redraw Panel
                    </button>
                  </div>
                </>
              ) : (
                <div className="w-full h-full p-4 flex flex-col items-center justify-center text-center bg-[#060c08] border border-dashed border-emerald-950/80 rounded-t-2xl">
                  <Video className="w-8 h-8 text-slate-600 mb-2" />
                  <p className="text-xs text-slate-400 mb-3 font-medium">Panel not rendered yet</p>
                  <button
                    onClick={() => reloadSingleShot(shot.id, shot.cleanActionPrompt)}
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
                <span className="px-2 py-0.5 rounded bg-black/75 backdrop-blur-sm text-[10px] font-mono text-emerald-400 border border-emerald-950">
                  {artStyle === "comic_color" ? "Graphic Novel Art" : "StudioBinder Sketch"}
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div>
                <p className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider mb-1 truncate">
                  {shot.sceneSlug}
                </p>
                <h3 className="text-sm font-bold text-white mb-2">
                  {shot.shotType}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed font-light line-clamp-3">
                  "{shot.cleanActionPrompt}"
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