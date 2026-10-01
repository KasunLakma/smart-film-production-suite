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
  visualPrompt: string;
  imageUrl?: string;
  isGenerating?: boolean;
}

// Scene එක අනුව 100% ක් ගැළපෙන සිනමාත්මක 16:9 Shots (Scene-by-Scene Visual Mapping)
const SCENE_CINEMATIC_SHOTS: Record<string, { wide: string; close: string; wideDesc: string; closeDesc: string }> = {
  "SCENE-01": {
    // Lab Scene (විද්‍යාගාරය)
    wide: "https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1280&h=720&q=85",
    close: "https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=1280&h=720&q=85",
    wideDesc: "Cinematic 16:9 wide master shot of dark futuristic research laboratory with glowing blue monitors and server arrays, 35mm lens.",
    closeDesc: "Cinematic medium close up of a focused operative examining glowing electronic scanning hardware, shallow depth of field."
  },
  "SCENE-02": {
    // Harbor Entrance / Rain Scene (වරාය පිවිසුම සහ වැස්ස)
    wide: "https://images.unsplash.com/photo-1519501025264-65ba15a82390?auto=format&fit=crop&w=1280&h=720&q=85",
    close: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1280&h=720&q=85",
    wideDesc: "Cinematic 16:9 wide shot of rainy industrial harbor entrance street at night, dark van parked under streetlights.",
    closeDesc: "Cinematic close-up of tactical agent looking through binoculars, water droplets on gear, dramatic street reflections."
  },
  "SCENE-03": {
    // Control Room / Alarm (පාලක මැදිරිය සහ රතු එළි)
    wide: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1280&h=720&q=85",
    close: "https://images.unsplash.com/photo-1563770660941-20978e870e26?auto=format&fit=crop&w=1280&h=720&q=85",
    wideDesc: "Cinematic wide shot of high-tech command control room, flashing emergency red amber lights, mainframe consoles.",
    closeDesc: "Intense close-up of operative swiftly unplugging encrypted military hard drive amidst red alarm lighting."
  },
  "SCENE-04": {
    // Dawn Docks Yard (අලුයම වරාය සහ බහාලුම්)
    wide: "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=1280&h=720&q=85",
    close: "https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?auto=format&fit=crop&w=1280&h=720&q=85",
    wideDesc: "Cinematic 16:9 wide shot of misty coastal shipyard perimeter at dawn, cargo containers, fog rising over water.",
    closeDesc: "Cinematic medium tracking shot of two operatives running towards docked escape boat under morning twilight sky."
  }
};

export default function StoryboardPage() {
  const [filterScene, setFilterScene] = useState("ALL");
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);
  const [shots, setShots] = useState<StoryboardShot[]>([]);
  const [sceneList, setSceneList] = useState<{ id: string; slugline: string }[]>([]);

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
              const sceneData = SCENE_CINEMATIC_SHOTS[scene.id] || SCENE_CINEMATIC_SHOTS["SCENE-01"];

              newShots.push({
                id: `shot-${scene.id}-A`,
                sceneId: scene.id,
                shotNumber: `SHOT ${String(index + 1).padStart(2, "0")}A`,
                sceneSlug: scene.slugline,
                shotType: "Wide Master Framing (WMS)",
                lens: "28mm Anamorphic T2.0",
                cameraMovement: "Slow Push-In Tracking",
                visualPrompt: sceneData.wideDesc,
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
                visualPrompt: sceneData.closeDesc,
                isGenerating: isTarget,
                imageUrl: ""
              });
            });

            setShots(newShots);
            setFilterScene(activeFilter);

            // Simulation: තත්පර 1 කින් Scene එකට ගැළපෙන සිනමාත්මක Shot එක Render වීම
            setTimeout(() => {
              setShots(prev => prev.map(shot => {
                const isTarget = activeFilter === "ALL" || activeFilter === shot.sceneId;
                if (isTarget) {
                  const data = SCENE_CINEMATIC_SHOTS[shot.sceneId] || SCENE_CINEMATIC_SHOTS["SCENE-01"];
                  return {
                    ...shot,
                    isGenerating: false,
                    imageUrl: shot.id.endsWith("-A") ? data.wide : data.close
                  };
                }
                return shot;
              }));
            }, 1000);
          }
        } catch { }
      }
    }
  }, []);

  const handleRegenerateFrame = (shotId: string, sceneId: string, isWide: boolean) => {
    setShots(prev => prev.map(s => s.id === shotId ? { ...s, isGenerating: true } : s));

    setTimeout(() => {
      const data = SCENE_CINEMATIC_SHOTS[sceneId] || SCENE_CINEMATIC_SHOTS["SCENE-01"];
      setShots(prev => prev.map(s => s.id === shotId ? {
        ...s,
        isGenerating: false,
        imageUrl: isWide ? data.wide : data.close
      } : s));
    }, 800);
  };

  const handleGenerateAll = () => {
    setIsGeneratingAll(true);
    setShots(prev => prev.map(s => ({ ...s, isGenerating: true })));

    setTimeout(() => {
      setShots(prev => prev.map(shot => {
        const data = SCENE_CINEMATIC_SHOTS[shot.sceneId] || SCENE_CINEMATIC_SHOTS["SCENE-01"];
        return {
          ...shot,
          isGenerating: false,
          imageUrl: shot.id.endsWith("-A") ? data.wide : data.close
        };
      }));
      setIsGeneratingAll(false);
    }, 1200);
  };

  const filteredShots = filterScene === "ALL"
    ? shots
    : shots.filter(s => s.sceneId === filterScene);

  return (
    <div className="space-y-8 p-6 md:p-8 max-w-7xl mx-auto text-slate-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-emerald-950/60">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" /> AI Storyboard Director Pipeline
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Production Storyboard Visualizer
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Breakdown දර්ශනයේ පසුතලය සහ ක්‍රියාදාමයට 100% ක් ගැළපෙන 16:9 සිනමාත්මක Shot Frames.
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
                <Loader2 className="w-4 h-4 animate-spin" /> Rendering All Shots...
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4" /> Synthesize All Frames
              </>
            )}
          </button>
        </div>
      </div>

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
            16:9 DCI Scope
          </span>
          <span className="text-slate-500">•</span>
          <span>Director Engine</span>
        </div>
      </div>

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
                  <span className="text-xs font-medium tracking-wide">Synthesizing 16:9 Cinematic Shot...</span>
                  <span className="text-[11px] text-slate-400 max-w-xs truncate">{shot.sceneSlug}</span>
                </div>
              ) : shot.imageUrl ? (
                <>
                  <img
                    src={shot.imageUrl}
                    alt={shot.shotNumber}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 brightness-95 contrast-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-end p-3">
                    <button
                      onClick={() => handleRegenerateFrame(shot.id, shot.sceneId, shot.id.endsWith("-A"))}
                      className="px-2.5 py-1 rounded-lg bg-black/80 hover:bg-emerald-500 hover:text-slate-950 text-white text-[11px] font-semibold flex items-center gap-1.5 transition-all border border-emerald-500/30 cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" /> Re-render Frame
                    </button>
                  </div>
                </>
              ) : (
                <div className="w-full h-full p-4 flex flex-col items-center justify-center text-center bg-[#060c08] border border-dashed border-emerald-950/80 rounded-t-2xl">
                  <Video className="w-8 h-8 text-slate-600 mb-2" />
                  <p className="text-xs text-slate-400 mb-3 font-medium">Shot not rendered yet</p>
                  <button
                    onClick={() => handleRegenerateFrame(shot.id, shot.sceneId, shot.id.endsWith("-A"))}
                    className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Wand2 className="w-3.5 h-3.5" /> Synthesize Shot
                  </button>
                </div>
              )}

              <div className="absolute top-3 left-3 flex items-center gap-2 pointer-events-none">
                <span className="px-2 py-0.5 rounded bg-slate-950/90 backdrop-blur-md border border-white/20 text-white text-[11px] font-bold font-mono">
                  {shot.shotNumber}
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
                  "{shot.visualPrompt}"
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