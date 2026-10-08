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
  Trash2
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

// 100% Fail-safe StudioBinder High-Detail Canvas Sketch Generator
function createStudioBinderSketch(shotNum: string, slug: string, isWide: boolean): string {
  if (typeof document === "undefined") return "";
  const canvas = document.createElement("canvas");
  canvas.width = 960;
  canvas.height = 540;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";
  const text = (slug || "").toLowerCase();
  const isLab = /lab|computer|research|tech|විද්‍යාගාර/.test(text);
  const isHarbor = /harbor|port|dock|වරාය|තොටුපළ/.test(text);
  const isControl = /control|command|office|සුරක්ෂිතාගාර|vault/.test(text);

  // Background StudioBinder Charcoal Board
  ctx.fillStyle = "#0f1316";
  ctx.fillRect(0, 0, 960, 540);

  // Crosshatch & Pencil Texture
  ctx.strokeStyle = "rgba(255, 255, 255, 0.04)";
  ctx.lineWidth = 1;
  for (let i = -540; i < 960; i += 7) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + 540, 540);
    ctx.stroke();
  }

  // Atmospheric Vignette Gradient
  const grad = ctx.createRadialGradient(480, 270, 60, 480, 270, 520);
  grad.addColorStop(0, "rgba(255, 255, 255, 0.12)");
  grad.addColorStop(0.7, "rgba(10, 15, 20, 0.75)");
  grad.addColorStop(1, "#080b0e");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 960, 540);

  // 16:9 Scope Framing Box
  ctx.strokeStyle = "#334155";
  ctx.lineWidth = 2;
  ctx.strokeRect(30, 25, 900, 490);

  // Framing Marks
  ctx.strokeStyle = "#64748b";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(480, 15); ctx.lineTo(480, 35);
  ctx.moveTo(480, 505); ctx.lineTo(480, 525);
  ctx.moveTo(20, 270); ctx.lineTo(40, 270);
  ctx.moveTo(920, 270); ctx.lineTo(940, 270);
  ctx.stroke();

  // Perspective Horizon
  ctx.strokeStyle = "rgba(148, 163, 184, 0.25)";
  const horizon = isWide ? 330 : 360;
  ctx.beginPath();
  ctx.moveTo(30, horizon); ctx.lineTo(930, horizon);
  ctx.moveTo(480, horizon); ctx.lineTo(30, 515);
  ctx.moveTo(480, horizon); ctx.lineTo(930, 515);
  ctx.stroke();

  // Context Sketch Elements
  ctx.fillStyle = "#1e293b";
  ctx.strokeStyle = "#cbd5e1";
  ctx.lineWidth = 2.5;

  if (isLab) {
    if (isWide) {
      ctx.strokeRect(60, 140, 160, 220);
      ctx.strokeRect(740, 140, 160, 220);
      for (let y = 180; y < 330; y += 35) {
        ctx.strokeRect(80, y, 120, 16);
        ctx.strokeRect(760, y, 120, 16);
      }
      ctx.beginPath();
      ctx.ellipse(480, 400, 220, 50, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = "#0f172a";
      ctx.beginPath();
      ctx.arc(480, 260, 20, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(460, 285, 40, 80);
    } else {
      ctx.beginPath();
      ctx.arc(480, 200, 75, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = "#1e293b";
      ctx.fillRect(400, 320, 160, 140);
      ctx.strokeRect(400, 320, 160, 140);
      ctx.strokeStyle = "#38bdf8";
      ctx.strokeRect(420, 340, 120, 60);
    }
  } else if (isHarbor) {
    if (isWide) {
      ctx.strokeRect(60, 180, 200, 140);
      ctx.strokeRect(700, 180, 200, 140);
      ctx.fillStyle = "#0b1219";
      ctx.fillRect(360, 320, 240, 90);
      ctx.strokeRect(360, 320, 240, 90);
      ctx.beginPath();
      ctx.arc(410, 415, 18, 0, Math.PI * 2);
      ctx.arc(550, 415, 18, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();
      ctx.strokeStyle = "rgba(148, 163, 184, 0.4)";
      for (let r = 60; r < 900; r += 28) {
        ctx.beginPath();
        ctx.moveTo(r, 40); ctx.lineTo(r - 40, 200);
        ctx.stroke();
      }
    } else {
      ctx.beginPath();
      ctx.arc(480, 200, 85, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = "#090d12";
      ctx.beginPath();
      ctx.arc(430, 275, 42, 0, Math.PI * 2);
      ctx.arc(530, 275, 42, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();
    }
  } else if (isControl) {
    if (isWide) {
      ctx.strokeRect(120, 100, 720, 180);
      ctx.strokeRect(150, 120, 200, 140);
      ctx.strokeRect(380, 120, 200, 140);
      ctx.strokeRect(610, 120, 200, 140);
      ctx.strokeStyle = "#ef4444";
      ctx.strokeRect(460, 60, 40, 30);
    } else {
      ctx.strokeRect(260, 120, 440, 300);
      ctx.fillStyle = "#090d12";
      ctx.fillRect(340, 240, 280, 120);
      ctx.strokeRect(340, 240, 280, 120);
      ctx.strokeStyle = "#ef4444";
      ctx.strokeRect(360, 260, 240, 15);
    }
  } else {
    ctx.strokeRect(100, 180, 220, 140);
    ctx.strokeRect(640, 180, 220, 140);
    ctx.fillStyle = "#020617";
    ctx.beginPath();
    ctx.arc(440, 290, 16, 0, Math.PI * 2);
    ctx.arc(520, 305, 16, 0, Math.PI * 2);
    ctx.fill();
  }

  // StudioBinder Bottom Slate Bar
  ctx.fillStyle = "rgba(4,8,6,0.94)";
  ctx.fillRect(30, 460, 900, 55);
  ctx.strokeStyle = "#10b981";
  ctx.lineWidth = 1;
  ctx.strokeRect(30, 460, 900, 55);
  ctx.fillStyle = "#10b981";
  ctx.font = "bold 18px monospace";
  ctx.fillText(shotNum, 50, 495);
  ctx.fillStyle = "#94a3b8";
  ctx.font = "13px sans-serif";
  ctx.fillText(isWide ? "WIDE MASTER (WMS) - StudioBinder Charcoal Sketch" : "CLOSE-UP (MCU) - Dynamic Storyboard Panel", 170, 494);

  return canvas.toDataURL("image/png");
}

export default function StoryboardPage() {
  const [filterScene, setFilterScene] = useState("ALL");
  const [artStyle, setArtStyle] = useState<"sketch_bw" | "graphic_novel">("sketch_bw");
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);
  const [shots, setShots] = useState<StoryboardShot[]>([]);
  const [sceneList, setSceneList] = useState<{ id: string; slugline: string }[]>([]);

  // Persistent storage key
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

  // Resilient Image Fetch with immediate Canvas Sketch Fallback
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
      throw new Error();
    } catch {
      // AI Rate limit / timeout instant authentic StudioBinder sketch populate
      const fallbackArt = createStudioBinderSketch(shot.shotNumber, shot.sceneSlug, isWide);
      saveToCache(shot.id, fallbackArt);
      setShots((prev) =>
        prev.map((s) => (s.id === shot.id ? { ...s, imageUrl: fallbackArt, isGenerating: false } : s))
      );
    }
  };

  // Initialize shots
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedScenes = localStorage.getItem("active_screenplay_scenes");
      const activeFilter = localStorage.getItem("storyboard_filter") || "ALL";
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
                imageUrl: cached[idA] || "" // මුලින්ම පින්තූර නොපෙන්වා හිස්ව තබයි
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
                imageUrl: cached[idB] || "" // මුලින්ම පින්තූර නොපෙන්වා හිස්ව තබයි
              });
            });

            setShots(newShots);
            setFilterScene(activeFilter);
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
    <div className="space-y-8 p-6 md:p-8 max-w-7xl mx-auto text-slate-100">
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
            දිගු පිටපත් (Feature Film Scripts) සඳහා කිසිදු කළු තිරයක් නොමැතිව 100% ක් ස්ථිරවම සාදන Storyboard Panels.[cite: 160]
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/breakdown"
            className="px-4 py-2.5 rounded-xl bg-[#09130e] hover:bg-[#0e1d15] border border-emerald-950 text-slate-300 text-xs font-semibold transition-all flex items-center gap-2"
          >
            <FileText className="w-4 h-4 text-emerald-400" /> Back to Script[cite: 160]
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

      {/* Filter & Art Style Bar */}
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

        {/* Style Selector */}
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
                  <span className="text-xs font-medium tracking-wide">Synthesizing High-Detail Frame...[cite: 163]</span>
                  <span className="text-[11px] text-slate-400 max-w-xs truncate">{shot.sceneSlug}[cite: 163]</span>
                </div>
              ) : shot.imageUrl ? (
                <>
                  <img
                    src={shot.imageUrl}
                    alt={shot.shotNumber}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-end p-3">
                    <button
                      onClick={() => {
                        const cache = getSavedCache();
                        delete cache[shot.id];
                        localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
                        fetchAiFrame(shot);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-black/80 hover:bg-emerald-500 hover:text-slate-950 text-white text-[11px] font-semibold flex items-center gap-1.5 transition-all border border-emerald-500/30 cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" /> Re-render Frame[cite: 163, 164]
                    </button>
                  </div>
                </>
              ) : (
                /* Generate Frame බොත්තම (මුලදී දිස්වේ) */
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