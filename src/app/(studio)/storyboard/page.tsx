"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  SlidersHorizontal,
  RefreshCw,
  Loader2,
  Wand2,
  FileText,
  Sparkles,
  Palette,
  CheckCircle2,
  Trash2,
  Download
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

export default function StoryboardPage() {
  const [filterScene, setFilterScene] = useState("ALL");
  const [artStyle, setArtStyle] = useState<"sketch_bw" | "graphic_novel">("sketch_bw");
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);
  const [shots, setShots] = useState<StoryboardShot[]>([]);
  const [sceneList, setSceneList] = useState<{ id: string; slugline: string }[]>([]);

  const STORAGE_KEY = `cine_storyboard_cache_${artStyle}`;

  const getSavedCache = (): Record<string, string> => {
    if (typeof window === "undefined") return {};
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  };

  const saveToCache = (shotId: string, url: string) => {
    if (typeof window === "undefined") return;
    try {
      const current = getSavedCache();
      current[shotId] = url;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
    } catch { }
  };

  const clearAllCache = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
      setShots((prev) => prev.map((s) => ({ ...s, imageUrl: "", isGenerating: false })));
    }
  };

  // Generate Frame බටන් එක එබූ විට සෘජුවම API එකෙන් AI පින්තූරය ලබා ගැනීම
  const fetchAiFrame = async (shot: StoryboardShot) => {
    const isWide = shot.id.endsWith("-A");
    setShots((prev) => prev.map((s) => (s.id === shot.id ? { ...s, isGenerating: true } : s)));

    try {
      const res = await fetch("/api/storyboard/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slugline: shot.sceneSlug, isWide, artStyle })
      });
      const data = await res.json();
      if (data.success && data.imageUrl) {
        saveToCache(shot.id, data.imageUrl);
        setShots((prev) =>
          prev.map((s) => (s.id === shot.id ? { ...s, imageUrl: data.imageUrl, isGenerating: false } : s))
        );
        return;
      }
    } catch (e) {
      console.error(e);
    }

    setShots((prev) => prev.map((s) => (s.id === shot.id ? { ...s, isGenerating: false } : s)));
  };

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedScenes =
        localStorage.getItem("active_screenplay_scenes") ||
        sessionStorage.getItem("eclat_active_scenes");
      const cached = getSavedCache();

      if (storedScenes) {
        try {
          const parsed = JSON.parse(storedScenes);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setSceneList(parsed.map((s: any) => ({ id: s.id, slugline: s.slugline })));
            const newShots: StoryboardShot[] = [];

            parsed.forEach((scene: any, index: number) => {
              const shotNumA = `SHOT ${String(index + 1).padStart(2, "0")}A`;
              const shotNumB = `SHOT ${String(index + 1).padStart(2, "0")}B`;
              const idA = `shot-${scene.id}-A`;
              const idB = `shot-${scene.id}-B`;

              newShots.push({
                id: idA,
                sceneId: scene.id,
                shotNumber: shotNumA,
                sceneSlug: scene.slugline,
                shotType: "Wide Master Framing (WMS)",
                lens: "28mm Anamorphic T2.0",
                cameraMovement: "Slow Push-In Tracking",
                displayTitle: `${scene.id}: Wide Establishing Master`,
                actionSubject: `Wide establishing perspective of ${scene.slugline}`,
                isGenerating: false,
                imageUrl: cached[idA] || "" // මුලදී හිස්ව පවතී
              });

              newShots.push({
                id: idB,
                sceneId: scene.id,
                shotNumber: shotNumB,
                sceneSlug: scene.slugline,
                shotType: "Medium Close Action (MCU)",
                lens: "50mm Prime T1.5",
                cameraMovement: "Static Eye-Level",
                displayTitle: `${scene.id}: Close-Up Key Action`,
                actionSubject: `Dynamic character action frame in ${scene.slugline}`,
                isGenerating: false,
                imageUrl: cached[idB] || "" // මුලදී හිස්ව පවතී
              });
            });

            setShots(newShots);
          }
        } catch { }
      }
    }
  }, [artStyle]);

  const handleGenerateAll = async () => {
    setIsGeneratingAll(true);
    const targetShots = filterScene === "ALL" ? shots : shots.filter((s) => s.sceneId === filterScene);
    for (const shot of targetShots) {
      if (!shot.imageUrl) {
        await fetchAiFrame(shot);
        await new Promise((r) => setTimeout(r, 600));
      }
    }
    setIsGeneratingAll(false);
  };

  const filteredShots = filterScene === "ALL" ? shots : shots.filter((s) => s.sceneId === filterScene);

  return (
    <div className="space-y-8 p-6 md:p-8 max-w-7xl mx-auto text-slate-100 font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-emerald-950/60">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" /> High-Capacity Film Storyboard Studio
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Cinematic Storyboard Studio
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Manual Trigger Cinematic Storyboard Visualization Mode.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/breakdown"
            className="px-4 py-2.5 rounded-xl bg-[#09130e] hover:bg-[#0e1d15] border border-emerald-950 text-slate-300 text-xs font-semibold transition-all flex items-center gap-2"
          >
            <FileText className="w-4 h-4 text-emerald-400" /> Back to Script
          </Link>
          {shots.length > 0 && (
            <button
              onClick={clearAllCache}
              title="Reset cached frames"
              className="p-2.5 rounded-xl bg-[#09130e] hover:bg-rose-950/40 border border-emerald-950 hover:border-rose-800 text-slate-400 hover:text-rose-300 transition-all cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={handleGenerateAll}
            disabled={isGeneratingAll || shots.length === 0}
            className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2 cursor-pointer"
          >
            {isGeneratingAll ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Rendering All Panels...[cite: 160]
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4" /> Synthesize All Frames[cite: 160]
              </>
            )}
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-[#09130e] border border-emerald-950/70">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5 mr-1">
            <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-400" /> Filter Scene:[cite: 160, 161]
          </span>
          <button
            onClick={() => setFilterScene("ALL")}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${filterScene === "ALL"
                ? "bg-emerald-500 text-slate-950 font-bold"
                : "bg-[#0e1d15] text-slate-300 hover:text-white"
              }`}
          >
            All Sequences ({shots.length})[cite: 161]
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
              {scn.id}[cite: 161]
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 bg-[#050b07] p-1 rounded-xl border border-emerald-950">
          <span className="text-xs text-slate-400 px-2 flex items-center gap-1">
            <Palette className="w-3.5 h-3.5 text-emerald-400" /> Style:[cite: 161, 162]
          </span>
          <button
            onClick={() => setArtStyle("sketch_bw")}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${artStyle === "sketch_bw"
                ? "bg-emerald-500 text-slate-950 shadow"
                : "text-slate-400 hover:text-white"
              }`}
          >
            StudioBinder (B&W Sketch)[cite: 162]
          </button>
          <button
            onClick={() => setArtStyle("graphic_novel")}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${artStyle === "graphic_novel"
                ? "bg-emerald-500 text-slate-950 shadow"
                : "text-slate-400 hover:text-white"
              }`}
          >
            Graphic Novel (Color)[cite: 162]
          </button>
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
                  <span className="text-xs font-medium tracking-wide">
                    Synthesizing High-Detail Frame...[cite: 163]
                  </span>
                  <span className="text-[11px] text-slate-400 max-w-xs truncate">{shot.sceneSlug}[cite: 163]</span>
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
                      onClick={() => fetchAiFrame(shot)}
                      className="px-2.5 py-1 rounded-lg bg-black/80 hover:bg-emerald-500 hover:text-slate-950 text-white text-[11px] font-semibold flex items-center gap-1.5 transition-all border border-emerald-500/30 cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" /> Re-render Frame[cite: 163, 164]
                    </button>
                  </div>
                </>
              ) : (
                <div className="w-full h-full p-4 flex flex-col items-center justify-center text-center bg-[#060c08]">
                  <button
                    onClick={() => fetchAiFrame(shot)}
                    className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 flex items-center gap-2 cursor-pointer transition-all hover:scale-105 z-20"
                  >
                    <Wand2 className="w-4 h-4" /> Generate Frame[cite: 160]
                  </button>
                  <span className="text-[11px] text-slate-500 mt-2">
                    Click to synthesize this 16:9 cinematic frame
                  </span>
                </div>
              )}

              <div className="absolute top-3 left-3 flex items-center gap-2 pointer-events-none">
                <span className="px-2 py-0.5 rounded bg-slate-950/90 backdrop-blur-md border border-white/20 text-white text-[11px] font-bold font-mono">
                  {shot.shotNumber}[cite: 164]
                </span>
              </div>

              <div className="absolute bottom-2 right-2 pointer-events-none flex items-center gap-1.5">
                {shot.imageUrl && (
                  <span className="px-1.5 py-0.5 rounded bg-emerald-950/80 text-[10px] text-emerald-400 border border-emerald-500/40 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Studio Ready[cite: 164]
                  </span>
                )}
                <span className="px-2 py-0.5 rounded bg-black/85 backdrop-blur-sm text-[10px] font-mono text-slate-300 border border-slate-800">
                  {artStyle === "sketch_bw" ? "StudioBinder Sketch" : "Graphic Novel"}[cite: 164]
                </span>
              </div>
            </div>

            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div>
                <p className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider mb-1 truncate">
                  {shot.displayTitle}[cite: 165]
                </p>
                <h3 className="text-sm font-bold text-white mb-2">
                  {shot.shotType}[cite: 165]
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed font-light line-clamp-3">
                  "{shot.sceneSlug}"[cite: 165]
                </p>
              </div>

              <div className="pt-3 border-t border-emerald-950/60 grid grid-cols-2 gap-2 text-[11px]">
                <div className="bg-[#0e1d15] p-2 rounded-lg border border-emerald-950/80">
                  <span className="text-slate-500 block text-[10px] uppercase">Lens Angle</span>[cite: 165]
                  <span className="text-slate-200 font-medium truncate block mt-0.5">{shot.lens}</span>[cite: 165]
                </div>
                <div className="bg-[#0e1d15] p-2 rounded-lg border border-emerald-950/80">
                  <span className="text-slate-500 block text-[10px] uppercase">Movement</span>[cite: 165]
                  <span className="text-slate-200 font-medium truncate block mt-0.5">{shot.cameraMovement}</span>[cite: 165]
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}