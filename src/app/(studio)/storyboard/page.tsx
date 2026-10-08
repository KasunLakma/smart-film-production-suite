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
  Download,
  Film
} from "lucide-react";

interface StoryboardShot {
  id: string;
  sceneId: string;
  sceneNumber: number;
  shotNumber: string;
  sceneSlug: string;
  shotType: string;
  lens: string;
  cameraMovement: string;
  displayTitle: string;
  synopsis: string;
  characters: string[];
  props: string[];
  visualPrompt?: string;
  imageUrl?: string;
  isGenerating?: boolean;
}

export default function StoryboardPage() {
  const [filterScene, setFilterScene] = useState("ALL");
  const [artStyle, setArtStyle] = useState<"sketch_bw" | "graphic_novel">("sketch_bw");
  const [shots, setShots] = useState<StoryboardShot[]>([]);
  const [sceneList, setSceneList] = useState<{ id: string; slugline: string }[]>([]);
  const [activeScriptKey, setActiveScriptKey] = useState("");

  const STORAGE_KEY = activeScriptKey ? `cine_sb_manual_${activeScriptKey}_${artStyle}` : "";

  const getSavedCache = (key = STORAGE_KEY): Record<string, { url: string; prompt: string }> => {
    if (!key || typeof window === "undefined") return {};
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  };

  const saveToCache = (shotId: string, url: string, prompt: string) => {
    if (!STORAGE_KEY || typeof window === "undefined") return;
    try {
      const current = getSavedCache();
      current[shotId] = { url, prompt };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
    } catch { }
  };

  const clearAllCache = () => {
    if (STORAGE_KEY && typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
      setShots((prev) => prev.map((s) => ({ ...s, imageUrl: "", visualPrompt: "", isGenerating: false })));
    }
  };

  // පරිශීලකයා "Generate Frame" ක්ලික් කළ විට පමණක් ක්‍රියාත්මක වීම
  const handleGenerateFrame = async (shot: StoryboardShot) => {
    const isWide = shot.id.endsWith("-A");

    setShots((prev) =>
      prev.map((s) => (s.id === shot.id ? { ...s, isGenerating: true } : s))
    );

    try {
      const res = await fetch("/api/storyboard/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sceneNumber: shot.sceneNumber,
          slugline: shot.sceneSlug,
          synopsis: shot.synopsis,
          characters: shot.characters,
          props: shot.props,
          isWide,
          artStyle
        })
      });

      const data = await res.json();
      if (data.success && data.imageUrl) {
        saveToCache(shot.id, data.imageUrl, data.prompt);
        setShots((prev) =>
          prev.map((s) =>
            s.id === shot.id
              ? {
                ...s,
                imageUrl: data.imageUrl,
                visualPrompt: data.prompt,
                isGenerating: false
              }
              : s
          )
        );
        return;
      }
    } catch (e) {
      console.error("Frame generation failed:", e);
    }

    setShots((prev) =>
      prev.map((s) => (s.id === shot.id ? { ...s, isGenerating: false } : s))
    );
  };

  // Initial Sync: Breakdown එකෙන් දත්ත ලබා ගැනීම
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedScenes =
        sessionStorage.getItem("eclat_active_scenes") ||
        localStorage.getItem("active_screenplay_scenes");

      if (!storedScenes || storedScenes === "[]") {
        setShots([]);
        setSceneList([]);
        setActiveScriptKey("");
        return;
      }

      try {
        const parsed = JSON.parse(storedScenes);
        if (!Array.isArray(parsed) || parsed.length === 0) {
          setShots([]);
          setSceneList([]);
          setActiveScriptKey("");
          return;
        }

        const sampleText = parsed.map((s: any) => `${s.slugline} ${s.synopsis}`).join(" ");
        const isSinhala = /[\u0D80-\u0DFF]/.test(sampleText);
        const scriptId = isSinhala ? "sinhala_script" : "english_script";
        setActiveScriptKey(scriptId);

        const currentKey = `cine_sb_manual_${scriptId}_${artStyle}`;
        let cached: Record<string, { url: string; prompt: string }> = {};
        try {
          const saved = localStorage.getItem(currentKey);
          if (saved) cached = JSON.parse(saved);
        } catch { }

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
            sceneNumber: index + 1,
            shotNumber: shotNumA,
            sceneSlug: scene.slugline,
            shotType: "Wide Master Framing (WMS)",
            lens: "28mm Anamorphic T2.0",
            cameraMovement: "Slow Push-In Tracking",
            displayTitle: `${scene.id}: Wide Establishing Master`,
            synopsis: scene.synopsis || "",
            characters: scene.characters || [],
            props: scene.props || [],
            isGenerating: false,
            imageUrl: cached[idA]?.url || "",
            visualPrompt: cached[idA]?.prompt || ""
          });

          newShots.push({
            id: idB,
            sceneId: scene.id,
            sceneNumber: index + 1,
            shotNumber: shotNumB,
            sceneSlug: scene.slugline,
            shotType: "Medium Close Action (MCU)",
            lens: "50mm Prime T1.5",
            cameraMovement: "Dynamic Eye-Level",
            displayTitle: `${scene.id}: Close-Up Key Action`,
            synopsis: scene.synopsis || "",
            characters: scene.characters || [],
            props: scene.props || [],
            isGenerating: false,
            imageUrl: cached[idB]?.url || "",
            visualPrompt: cached[idB]?.prompt || ""
          });
        });

        setShots(newShots);
      } catch (e) {
        console.error(e);
      }
    }
  }, [artStyle]);

  const filteredShots =
    filterScene === "ALL" ? shots : shots.filter((s) => s.sceneId === filterScene);

  return (
    <div className="space-y-8 p-6 md:p-8 max-w-7xl mx-auto text-slate-100 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-emerald-950/60">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" /> High-Capacity Film Storyboard Studio
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Cinematic Storyboard Studio
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            StudioBinder Hand-Drawn Ink & Comic Storyboard Visualization (Manual Trigger Mode)[cite: 124].
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/breakdown"
            className="px-4 py-2.5 rounded-xl bg-[#09130e] hover:bg-[#0e1d15] border border-emerald-950 text-slate-300 text-xs font-semibold transition-all flex items-center gap-2"
          >
            <FileText className="w-4 h-4 text-emerald-400" /> Back to Script[cite: 124, 125]
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
        </div>
      </div>

      {shots.length === 0 ? (
        <div className="p-16 rounded-2xl bg-[#060c08] border border-dashed border-emerald-950 text-center space-y-3">
          <Film className="w-12 h-12 mx-auto text-emerald-600/40" />
          <h3 className="text-base font-bold text-slate-300">කිසිදු දර්ශනයක් තවමත් නොමැත</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            කරුණාකර Script Breakdown පිටුවට ගොස් සිංහල හෝ ඉංග්‍රීසි තිර පිටපතක් Upload කර දර්ශන සකසා ගන්න.
          </p>
          <Link
            href="/breakdown"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all"
          >
            Go to Breakdown Studio
          </Link>
        </div>
      ) : (
        <>
          {/* Filter & Art Style Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-[#09130e] border border-emerald-950/70">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5 mr-1">
                <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-400" /> Filter Scene:[cite: 125, 126]
              </span>
              <button
                onClick={() => setFilterScene("ALL")}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${filterScene === "ALL"
                    ? "bg-emerald-500 text-slate-950 font-bold"
                    : "bg-[#0e1d15] text-slate-300 hover:text-white"
                  }`}
              >
                All Sequences ({shots.length})[cite: 126]
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
                  {scn.id}[cite: 126]
                </button>
              ))}
            </div>

            {/* Style Selector */}
            <div className="flex items-center gap-2 bg-[#050607] p-1 rounded-xl border border-emerald-950">
              <span className="text-xs text-slate-400 px-2 flex items-center gap-1">
                <Palette className="w-3.5 h-3.5 text-emerald-400" /> Style:[cite: 126, 127]
              </span>
              <button
                onClick={() => setArtStyle("sketch_bw")}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${artStyle === "sketch_bw"
                    ? "bg-emerald-500 text-slate-950 shadow"
                    : "text-slate-400 hover:text-white"
                  }`}
              >
                StudioBinder (B&W Sketch)[cite: 127]
              </button>
              <button
                onClick={() => setArtStyle("graphic_novel")}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${artStyle === "graphic_novel"
                    ? "bg-emerald-500 text-slate-950 shadow"
                    : "text-slate-400 hover:text-white"
                  }`}
              >
                Graphic Novel (Color)[cite: 127]
              </button>
            </div>
          </div>

          {/* Grid */}
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
                        Synthesizing High-Detail Frame...[cite: 128]
                      </span>
                      <span className="text-[11px] text-slate-400 max-w-xs truncate">
                        {shot.sceneSlug}[cite: 128]
                      </span>
                    </div>
                  ) : shot.imageUrl ? (
                    <>
                      <img
                        src={shot.imageUrl}
                        alt={shot.shotNumber}
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-3">
                        <a
                          href={shot.imageUrl}
                          download={`${shot.shotNumber}.jpg`}
                          className="px-2.5 py-1 rounded-lg bg-black/80 hover:bg-white hover:text-slate-950 text-white text-[11px] font-semibold flex items-center gap-1.5 transition-all border border-white/20"
                        >
                          <Download className="w-3 h-3" /> Download
                        </a>
                        <button
                          type="button"
                          onClick={() => handleGenerateFrame(shot)}
                          className="px-2.5 py-1 rounded-lg bg-black/80 hover:bg-emerald-500 hover:text-slate-950 text-white text-[11px] font-semibold flex items-center gap-1.5 transition-all border border-emerald-500/30 cursor-pointer"
                        >
                          <RefreshCw className="w-3 h-3" /> Re-render Frame[cite: 129]
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full p-4 flex flex-col items-center justify-center text-center bg-[#060c08]">
                      <button
                        type="button"
                        onClick={() => handleGenerateFrame(shot)}
                        className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 flex items-center gap-2 cursor-pointer transition-all hover:scale-105 z-20"
                      >
                        <Wand2 className="w-4 h-4" /> Generate Frame
                      </button>
                      <span className="text-[11px] text-slate-500 mt-2">
                        Click to synthesize this 16:9 cinematic frame
                      </span>
                    </div>
                  )}

                  <div className="absolute top-3 left-3 flex items-center gap-2 pointer-events-none">
                    <span className="px-2 py-0.5 rounded bg-slate-950/90 backdrop-blur-md border border-white/20 text-white text-[11px] font-bold font-mono">
                      {shot.shotNumber}[cite: 129]
                    </span>
                  </div>

                  <div className="absolute bottom-2 right-2 pointer-events-none flex items-center gap-1.5">
                    {shot.imageUrl && (
                      <span className="px-1.5 py-0.5 rounded bg-emerald-950/80 text-[10px] text-emerald-400 border border-emerald-500/40 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Studio Ready[cite: 129]
                      </span>
                    )}
                    <span className="px-2 py-0.5 rounded bg-black/85 backdrop-blur-sm text-[10px] font-mono text-slate-300 border border-slate-800">
                      {artStyle === "sketch_bw" ? "StudioBinder Sketch" : "Graphic Novel"}[cite: 129]
                    </span>
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <p className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider mb-1 truncate">
                      {shot.displayTitle}[cite: 130]
                    </p>
                    <h3 className="text-sm font-bold text-white mb-1.5">
                      {shot.shotType}[cite: 130]
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed font-light line-clamp-2">
                      "{shot.sceneSlug}"[cite: 130]
                    </p>
                  </div>

                  {shot.visualPrompt && (
                    <div className="p-2.5 rounded-xl bg-[#030704] border border-emerald-950/80 space-y-1">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> 100% English Visual Prompt
                      </div>
                      <p className="text-[11px] text-slate-300 font-mono leading-relaxed line-clamp-2">
                        {shot.visualPrompt}
                      </p>
                    </div>
                  )}

                  <div className="pt-2.5 border-t border-emerald-950/60 grid grid-cols-2 gap-2 text-[11px]">
                    <div className="bg-[#0e1d15] p-2 rounded-lg border border-emerald-950/80">
                      <span className="text-slate-500 block text-[10px] uppercase">Lens Angle</span>[cite: 130]
                      <span className="text-slate-200 font-medium truncate block mt-0.5">
                        {shot.lens}[cite: 130]
                      </span>
                    </div>
                    <div className="bg-[#0e1d15] p-2 rounded-lg border border-emerald-950/80">
                      <span className="text-slate-500 block text-[10px] uppercase">Movement</span>[cite: 130]
                      <span className="text-slate-200 font-medium truncate block mt-0.5">
                        {shot.cameraMovement}[cite: 130]
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}