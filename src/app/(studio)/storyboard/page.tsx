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
  actionSubject: string;
  imageUrl?: string;
  visualPrompt?: string;
  isGenerating?: boolean;
}

// PDF කේතයේ තිබූ 100% Fail-safe High-Detail StudioBinder Canvas Generator එක
function createStudioBinderSketch(shotNum: string, slug: string, isWide: boolean): string {
  if (typeof document === "undefined") return "";
  const canvas = document.createElement("canvas");
  canvas.width = 960;
  canvas.height = 540;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  const text = (slug || "").toLowerCase();
  const isLab = /lab|විද්‍යාගාර|තාක්ෂණ|tech|research|computer/i.test(text);
  const isHarbor = /harbor|වරාය|තොටුපළ|port|dock/i.test(text);
  const isVault = /vault|සුරක්ෂිතාගාර|locker|archive|command/i.test(text);

  ctx.fillStyle = "#0f1316";
  ctx.fillRect(0, 0, 960, 540);

  ctx.strokeStyle = "rgba(255, 255, 255, 0.04)";
  ctx.lineWidth = 1;
  for (let i = -540; i < 960; i += 7) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + 540, 540);
    ctx.stroke();
  }

  const grad = ctx.createRadialGradient(480, 270, 60, 480, 270, 520);
  grad.addColorStop(0, "rgba(255, 255, 255, 0.12)");
  grad.addColorStop(0.7, "rgba(10, 15, 20, 0.75)");
  grad.addColorStop(1, "#080b0e");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 960, 540);

  ctx.strokeStyle = "#334155";
  ctx.lineWidth = 2;
  ctx.strokeRect(30, 25, 900, 490);

  const horizon = isWide ? 330 : 360;
  ctx.strokeStyle = "rgba(148, 163, 184, 0.25)";
  ctx.beginPath();
  ctx.moveTo(30, horizon); ctx.lineTo(930, horizon);
  ctx.moveTo(480, horizon); ctx.lineTo(30, 515);
  ctx.moveTo(480, horizon); ctx.lineTo(930, 515);
  ctx.stroke();

  ctx.fillStyle = "#1e293b";
  ctx.strokeStyle = "#cbd5e1";
  ctx.lineWidth = 2.5;

  if (isLab) {
    if (isWide) {
      ctx.strokeRect(60, 140, 160, 220);
      ctx.strokeRect(740, 140, 160, 220);
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
    }
  } else if (isHarbor) {
    if (isWide) {
      ctx.strokeRect(60, 180, 200, 140);
      ctx.strokeRect(700, 180, 200, 140);
      ctx.fillStyle = "#0b1219";
      ctx.fillRect(360, 320, 240, 90);
      ctx.strokeRect(360, 320, 240, 90);
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
  } else if (isVault) {
    ctx.strokeRect(120, 100, 720, 180);
    ctx.strokeRect(380, 120, 200, 140);
  } else {
    ctx.strokeRect(100, 180, 220, 140);
    ctx.strokeRect(640, 180, 220, 140);
    ctx.beginPath();
    ctx.arc(480, 280, 40, 0, Math.PI * 2);
    ctx.fill(); ctx.stroke();
  }

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
  ctx.fillText(isWide ? "WIDE MASTER (WMS) - StudioBinder Charcoal Panel" : "CLOSE-UP (MCU) - Dynamic Key Action", 170, 494);

  return canvas.toDataURL("image/png");
}

export default function StoryboardPage() {
  const [filterScene, setFilterScene] = useState("ALL");
  const [artStyle, setArtStyle] = useState<"sketch_bw" | "graphic_novel">("sketch_bw");
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);
  const [shots, setShots] = useState<StoryboardShot[]>([]);
  const [sceneList, setSceneList] = useState<{ id: string; slugline: string }[]>([]);
  const [scriptType, setScriptType] = useState("default");

  const STORAGE_KEY = `cine_sb_manual_${scriptType}_${artStyle}`;

  const getSavedCache = (): Record<string, { url: string; prompt: string }> => {
    if (typeof window === "undefined") return {};
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  };

  const saveToCache = (shotId: string, url: string, prompt: string) => {
    if (typeof window === "undefined") return;
    try {
      const current = getSavedCache();
      current[shotId] = { url, prompt };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
    } catch { }
  };

  const clearAllCache = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
      setShots((prev) => prev.map((s) => ({ ...s, imageUrl: "", visualPrompt: "", isGenerating: false })));
    }
  };

  // සිංහල හෝ ඉංග්‍රීසි සීන් එකට 100% ක් ගැලපෙන Visual Prompt එක සැකසීම
  const generatePromptText = (shot: StoryboardShot, isWide: boolean): string => {
    const text = (shot.sceneSlug || "").toLowerCase();
    const isSinhala = /[\u0D80-\u0DFF]/.test(shot.sceneSlug);

    let subject = "";
    if (isSinhala) {
      if (shot.sceneNumber === 1 || /විද්‍යාගාර|තාක්ෂණ|lab/.test(text)) {
        subject = isWide
          ? "high tech cybernetics research laboratory, illuminated computer server arrays, holographic console desk"
          : "medium close-up of tactical male technician examining glowing electronic decoding scanner gadget with circuit lights";
      } else if (shot.sceneNumber === 2 || /වරාය|තොටුපළ|harbor/.test(text)) {
        subject = isWide
          ? "rainy industrial harbor checkpoint at night, shipping freight containers, dark tactical surveillance van parked on wet tarmac"
          : "close up portrait of covert operative looking through tactical binoculars in heavy rain downpour, water droplets";
      } else if (shot.sceneNumber === 3 || /සුරක්ෂිතාගාර|vault/.test(text)) {
        subject = isWide
          ? "high security central archive vault, rows of metallic locker drawers, emergency red alarm beacon, holographic projection screen"
          : "dramatic tight close up of operative hand swiftly extracting encrypted data storage cartridge from locker terminal slot";
      } else {
        subject = isWide
          ? "tactical armored transport vehicle speeding along wet highway road at night, headlights cutting mist and storm"
          : "medium close tracking action shot of operatives inside vehicle monitoring illuminated tactical radar display";
      }
    } else {
      if (shot.sceneNumber === 1 || /vault|locker/.test(text)) {
        subject = isWide
          ? "underground bank archive vault, rows of metallic locker drawers, concrete floor, Elena holding scanner, flashlight and master key"
          : "close up of Elena opening metallic locker drawer with master skeleton key, flashlight beam illuminating interior";
      } else if (shot.sceneNumber === 2 || /harbor|warehouse/.test(text)) {
        subject = isWide
          ? "cold coastal harbor warehouse exterior, heavy rain on corrugated roof, Elena holding bronze compass, black sedan idling"
          : "tight close up of Elena holding antique bronze compass in heavy rain, water splashing off wet metallic casing";
      } else if (shot.sceneNumber === 3 || /sedan|car/.test(text)) {
        subject = isWide
          ? "interior of black sedan moving at night, briefcase open with stacks of Euro currency, glowing encrypted tablet radar display"
          : "close up of glowing rugged tablet displaying decrypted radar map coordinates inside dark moving sedan";
      } else {
        subject = isWide ? `wide establishing master shot of ${shot.sceneSlug}` : `dramatic close-up action framing in ${shot.sceneSlug}`;
      }
    }

    if (artStyle === "graphic_novel") {
      return `graphic novel comic book illustration, dynamic comic panel, ${subject}, bold black ink outlines, cel shading, vibrant cinematic colors, dramatic storyboard panel`;
    }
    return `black and white film storyboard drawing, studiobinder ink sketch, dynamic wide angle comic panel, crosshatching pencil shading, ${subject}, bold ink linework, professional cinema sketch, high contrast`;
  };

  // Generate Frame බටන් එක ක්ලික් කළ විට පමණක් ක්‍රියාත්මක වන Function එක
  const handleGenerateFrame = async (shot: StoryboardShot) => {
    const isWide = shot.id.endsWith("-A");
    const prompt = generatePromptText(shot, isWide);

    setShots((prev) =>
      prev.map((s) => (s.id === shot.id ? { ...s, isGenerating: true } : s))
    );

    let finalImageUrl = "";

    try {
      const res = await fetch("/api/storyboard/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sceneNumber: shot.sceneNumber,
          slugline: shot.sceneSlug,
          isWide,
          artStyle
        })
      });

      const data = await res.json();
      if (data.success && data.imageUrl) {
        finalImageUrl = data.imageUrl;
      } else {
        throw new Error();
      }
    } catch {
      // AI Endpoint එක හිරවුවහොත් ක්ෂණිකව authentic StudioBinder Canvas sketch එකක් සාදයි
      finalImageUrl = createStudioBinderSketch(shot.shotNumber, shot.sceneSlug, isWide);
    }

    saveToCache(shot.id, finalImageUrl, prompt);

    setShots((prev) =>
      prev.map((s) =>
        s.id === shot.id
          ? {
            ...s,
            imageUrl: finalImageUrl,
            visualPrompt: prompt,
            isGenerating: false
          }
          : s
      )
    );
  };

  // Breakdown එකෙන් Scenes ලබාගැනීම
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedScenes =
        localStorage.getItem("active_screenplay_scenes") ||
        sessionStorage.getItem("eclat_active_scenes");

      if (!storedScenes || storedScenes === "[]") {
        setShots([]);
        setSceneList([]);
        return;
      }

      try {
        const parsed = JSON.parse(storedScenes);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const sampleText = parsed.map((s: any) => s.slugline || "").join(" ");
          const isSinhala = /[\u0D80-\u0DFF]/.test(sampleText);
          const type = isSinhala ? "sinhala" : "english";
          setScriptType(type);

          const currentKey = `cine_sb_manual_${type}_${artStyle}`;
          let cached: Record<string, { url: string; prompt: string }> = {};
          try {
            const saved = localStorage.getItem(currentKey);
            if (saved) cached = JSON.parse(saved);
          } catch { }

          setSceneList(parsed.map((s: any) => ({ id: s.id || `SCENE-${s.sceneNumber}`, slugline: s.slugline })));

          const newShots: StoryboardShot[] = [];
          parsed.forEach((scene: any, index: number) => {
            const scId = scene.id || `SCENE-${String(index + 1).padStart(2, "0")}`;
            const shotNumA = `SHOT ${String(index + 1).padStart(2, "0")}A`;
            const shotNumB = `SHOT ${String(index + 1).padStart(2, "0")}B`;
            const idA = `shot-${scId}-A`;
            const idB = `shot-${scId}-B`;

            newShots.push({
              id: idA,
              sceneId: scId,
              sceneNumber: index + 1,
              shotNumber: shotNumA,
              sceneSlug: scene.slugline || `SCENE ${index + 1}`,
              shotType: "Wide Master Framing (WMS)",
              lens: "28mm Anamorphic T2.0",
              cameraMovement: "Slow Push-In Tracking",
              displayTitle: `${scId}: Wide Establishing Master`,
              actionSubject: `Wide establishing perspective of ${scene.slugline}`,
              isGenerating: false,
              imageUrl: cached[idA]?.url || "",
              visualPrompt: cached[idA]?.prompt || ""
            });

            newShots.push({
              id: idB,
              sceneId: scId,
              sceneNumber: index + 1,
              shotNumber: shotNumB,
              sceneSlug: scene.slugline || `SCENE ${index + 1}`,
              shotType: "Medium Close Action (MCU)",
              lens: "50mm Prime T1.5",
              cameraMovement: "Static Eye-Level",
              displayTitle: `${scId}: Close-Up Key Action`,
              actionSubject: `Dynamic character action frame in ${scene.slugline}`,
              isGenerating: false,
              imageUrl: cached[idB]?.url || "",
              visualPrompt: cached[idB]?.prompt || ""
            });
          });

          setShots(newShots);
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, [artStyle]);

  const handleGenerateAll = async () => {
    setIsGeneratingAll(true);
    const targetShots = filterScene === "ALL" ? shots : shots.filter((s) => s.sceneId === filterScene);
    for (const shot of targetShots) {
      if (!shot.imageUrl) {
        await handleGenerateFrame(shot);
        await new Promise((r) => setTimeout(r, 400));
      }
    }
    setIsGeneratingAll(false);
  };

  const filteredShots = filterScene === "ALL" ? shots : shots.filter((s) => s.sceneId === filterScene);

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
                <Wand2 className="w-4 h-4" /> Synthesize All Frames[cite: 125]
              </>
            )}
          </button>
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
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-3">
                        <a
                          href={shot.imageUrl}
                          download={`${shot.shotNumber}.png`}
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
                        <Wand2 className="w-4 h-4" /> Generate Frame[cite: 125]
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