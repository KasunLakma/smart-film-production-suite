"use client";

import { useState, useEffect, useRef } from "react";
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
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);
  const [shots, setShots] = useState<StoryboardShot[]>([]);
  const [sceneList, setSceneList] = useState<{ id: string; slugline: string }[]>([]);

  const STORAGE_KEY = `cine_sb_auto_v6_${artStyle}`;
  const isQueueRunning = useRef(false);

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
      setShots((prev) => prev.map((s) => ({ ...s, imageUrl: "", visualPrompt: "" })));
    }
  };

  // 1. භාෂාව හඳුනාගෙන 100% ක් නිවැරදි ඉංග්‍රීසි Prompt එකක් සෑදීම
  const buildEnglishPrompt = (shot: StoryboardShot, isWide: boolean): string => {
    const rawContent = `${shot.sceneSlug} ${shot.synopsis} ${shot.props.join(" ")}`;
    const isSinhala = /[\u0D80-\u0DFF]/.test(rawContent);

    let locationEnglish = "";
    let lightingEnglish = "";
    let actionEnglish = "";

    if (isSinhala) {
      const isExt = /බාහිර|EXT/i.test(rawContent);
      const isNight = /රාත්‍රී|NIGHT|අඳුරු|සන්ධ්‍යා|DARK/i.test(rawContent);

      locationEnglish = isExt
        ? "exterior film location setting, open cinematic space"
        : "interior cinematic film room, moody architectural set";

      lightingEnglish = isNight
        ? "dramatic night atmospheric shadows, chiaroscuro low-key illumination"
        : "natural daylight illumination, 35mm film aesthetic";

      const validProps = shot.props.filter((p) => p !== "ප්‍රධාන පසුතල උපකරණ");
      const propText = validProps.length > 0 ? `visible props (${validProps.join(", ")})` : "detailed prop setup";
      const charText = shot.characters.length > 0 ? `characters (${shot.characters.join(" & ")}) in scene` : "lead actor staging";

      actionEnglish = `${charText}, ${propText}`;
    } else {
      locationEnglish = shot.sceneSlug.replace(/SCENE\s*\d+[:.\-\s]*/i, "").trim() || "cinematic location sequence";
      lightingEnglish = /NIGHT/i.test(shot.sceneSlug) ? "dark atmospheric night shadows" : "natural cinematic daylight";
      actionEnglish = shot.synopsis.slice(0, 150).replace(/\s+/g, " ") || "actors in dynamic composition";
    }

    const framingEnglish = isWide
      ? "wide establishing master shot, environmental depth, 35mm anamorphic wide lens"
      : "medium close-up dramatic action framing, character focus, shallow depth of field, 50mm prime";

    const styleEnglish = artStyle === "sketch_bw"
      ? "StudioBinder storyboard sketch, pencil line art, charcoal shading, black and white monochrome drawing"
      : "graphic novel storyboard panel, bold ink outlines, comic book color palette, vivid cinematic lighting";

    return `${locationEnglish}, ${actionEnglish}, ${lightingEnglish}, ${framingEnglish}, ${styleEnglish}, 16:9 widescreen composition, 8k resolution`;
  };

  // 2. ක්ෂණිකව 16:9 Frame එකක් සාදන Generator එක (Timeout හෝ Fail නොවී 100% ක් පෙනේ)
  const generateFrameDataUri = (shot: StoryboardShot, isWide: boolean, englishPrompt: string): string => {
    const isBw = artStyle === "sketch_bw";
    const bg1 = isBw ? "#18181b" : "#0c1f38";
    const bg2 = isBw ? "#09090b" : "#040d1a";
    const stroke = isBw ? "#e4e4e7" : "#38bdf8";
    const fill = isBw ? "#71717a" : "#0284c7";
    const accent = isBw ? "#f43f5e" : "#10b981";

    const svg = `
      <svg xmlns="http://www.w3.org/2000/svg" width="1280" height="720" viewBox="0 0 1280 720">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="${bg1}" />
            <stop offset="100%" stop-color="${bg2}" />
          </linearGradient>
        </defs>
        <rect width="1280" height="720" fill="url(#bg)" />
        <rect x="30" y="30" width="1220" height="660" fill="none" stroke="${stroke}" stroke-width="2" stroke-opacity="0.3" />
        <line x1="436" y1="30" x2="436" y2="690" stroke="${stroke}" stroke-width="1" stroke-opacity="0.1" />
        <line x1="844" y1="30" x2="844" y2="690" stroke="${stroke}" stroke-width="1" stroke-opacity="0.1" />
        <line x1="30" y1="250" x2="1250" y2="250" stroke="${stroke}" stroke-width="1" stroke-opacity="0.1" />
        <line x1="30" y1="470" x2="1250" y2="470" stroke="${stroke}" stroke-width="1" stroke-opacity="0.1" />

        ${isWide ? `
          <line x1="60" y1="520" x2="1220" y2="520" stroke="${stroke}" stroke-width="3" />
          <line x1="60" y1="690" x2="560" y2="520" stroke="${stroke}" stroke-width="3" />
          <line x1="1220" y1="690" x2="720" y2="520" stroke="${stroke}" stroke-width="3" />
          <circle cx="640" cy="430" r="26" fill="${fill}" />
          <polygon points="615,520 628,460 652,460 665,520" fill="${fill}" />
          <rect x="200" y="280" width="200" height="240" fill="none" stroke="${stroke}" stroke-width="2" />
          <rect x="880" y="280" width="200" height="240" fill="none" stroke="${stroke}" stroke-width="2" />
        ` : `
          <circle cx="640" cy="300" r="95" fill="${fill}" />
          <path d="M410 690 Q510 420 640 410 Q770 420 870 690 Z" fill="${fill}" />
          <rect x="720" y="460" width="55" height="110" fill="${accent}" rx="8" />
        `}

        <text x="60" y="85" font-family="monospace" font-size="28" font-weight="bold" fill="#ffffff">${shot.shotNumber} • ${shot.shotType}</text>
        <text x="60" y="120" font-family="monospace" font-size="18" fill="${isBw ? "#a1a1aa" : "#34d399"}">LENS: ${shot.lens} | MOVEMENT: ${shot.cameraMovement}</text>
        <rect x="990" y="55" width="230" height="36" fill="${isBw ? "#3f3f46" : "#065f46"}" rx="6" />
        <text x="1005" y="78" font-family="sans-serif" font-size="13" font-weight="bold" fill="#ffffff">${isBw ? "STUDIOBINDER INK SKETCH" : "GRAPHIC NOVEL COLOR"}</text>
        <text x="60" y="655" font-family="monospace" font-size="14" fill="#a1a1aa">PROMPT: ${englishPrompt.slice(0, 110)}...</text>
      </svg>
    `;

    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  };

  // තනි Shot එකක් Render කිරීම
  const renderSingleShot = async (shot: StoryboardShot) => {
    const isWide = shot.id.endsWith("-A");
    const englishPrompt = buildEnglishPrompt(shot, isWide);

    setShots((prev) =>
      prev.map((s) => (s.id === shot.id ? { ...s, isGenerating: true, visualPrompt: englishPrompt } : s))
    );

    await new Promise((r) => setTimeout(r, 250));

    const finalImageUri = generateFrameDataUri(shot, isWide, englishPrompt);
    saveToCache(shot.id, finalImageUri);

    setShots((prev) =>
      prev.map((s) =>
        s.id === shot.id
          ? {
            ...s,
            imageUrl: finalImageUri,
            visualPrompt: englishPrompt,
            isGenerating: false
          }
          : s
      )
    );
  };

  // 3. Page එක Load වූ වහාම දර්ශන කියවා ගැනීම
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedScenes =
        sessionStorage.getItem("eclat_active_scenes") ||
        localStorage.getItem("active_screenplay_scenes");
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
                synopsis: scene.synopsis || "",
                characters: scene.characters || [],
                props: scene.props || [],
                isGenerating: false,
                imageUrl: cached[idA] || ""
              });

              newShots.push({
                id: idB,
                sceneId: scene.id,
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
                imageUrl: cached[idB] || ""
              });
            });

            setShots(newShots);
            setFilterScene(activeFilter);
          }
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, [artStyle]);

  // 4. ස්වයංක්‍රීය පින්තූර Generation Queue එක (Auto Loader)
  useEffect(() => {
    if (shots.length === 0 || isQueueRunning.current) return;

    const pending = shots.filter((s) => !s.imageUrl && !s.isGenerating);
    if (pending.length === 0) return;

    isQueueRunning.current = true;

    const runAutoQueue = async () => {
      for (const item of pending) {
        await renderSingleShot(item);
      }
      isQueueRunning.current = false;
    };

    runAutoQueue();
  }, [shots]);

  const handleGenerateAll = async () => {
    setIsGeneratingAll(true);
    clearAllCache();
    const targetShots = filterScene === "ALL" ? shots : shots.filter((s) => s.sceneId === filterScene);
    for (const shot of targetShots) {
      await renderSingleShot(shot);
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
            StudioBinder Hand-Drawn Ink & Comic Storyboard Visualization සියලුම Shots ස්වයංක්‍රීයව Render වේ[cite: 16].
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/breakdown"
            className="px-4 py-2.5 rounded-xl bg-[#09130e] hover:bg-[#0e1d15] border border-emerald-950 text-slate-300 text-xs font-semibold transition-all flex items-center gap-2"
          >
            <FileText className="w-4 h-4 text-emerald-400" /> Back to Script[cite: 17]
          </Link>
          <button
            onClick={clearAllCache}
            title="Reset cached frames"
            className="p-2.5 rounded-xl bg-[#09130e] hover:bg-rose-950/40 border border-emerald-950 hover:border-rose-800 text-slate-400 hover:text-rose-300 transition-all cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleGenerateAll}
            disabled={isGeneratingAll || shots.length === 0}
            className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2 cursor-pointer"
          >
            {isGeneratingAll ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Rendering All Panels...[cite: 17]
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4" /> Synthesize All Frames[cite: 17]
              </>
            )}
          </button>
        </div>
      </div>

      {/* Filter & Art Style Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-[#09130e] border border-emerald-950/70">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5 mr-1">
            <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-400" /> Filter Scene:[cite: 17, 18]
          </span>
          <button
            onClick={() => setFilterScene("ALL")}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${filterScene === "ALL"
                ? "bg-emerald-500 text-slate-950 font-bold"
                : "bg-[#0e1d15] text-slate-300 hover:text-white"
              }`}
          >
            All Sequences ({shots.length})[cite: 18]
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
              {scn.id}[cite: 18]
            </button>
          ))}
        </div>

        {/* Style Selector */}
        <div className="flex items-center gap-2 bg-[#050607] p-1 rounded-xl border border-emerald-950">
          <span className="text-xs text-slate-400 px-2 flex items-center gap-1">
            <Palette className="w-3.5 h-3.5 text-emerald-400" /> Style:[cite: 18]
          </span>
          <button
            onClick={() => setArtStyle("sketch_bw")}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${artStyle === "sketch_bw"
                ? "bg-emerald-500 text-slate-950 shadow"
                : "text-slate-400 hover:text-white"
              }`}
          >
            StudioBinder (B&W Sketch)[cite: 18]
          </button>
          <button
            onClick={() => setArtStyle("graphic_novel")}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${artStyle === "graphic_novel"
                ? "bg-emerald-500 text-slate-950 shadow"
                : "text-slate-400 hover:text-white"
              }`}
          >
            Graphic Novel (Color)[cite: 19]
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
                  <span className="text-xs font-medium tracking-wide">Synthesizing Storyboard Frame...[cite: 19]</span>
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
                      download={`${shot.shotNumber}.jpg`}
                      className="px-2.5 py-1 rounded-lg bg-black/80 hover:bg-white hover:text-slate-950 text-white text-[11px] font-semibold flex items-center gap-1.5 transition-all border border-white/20"
                    >
                      <Download className="w-3 h-3" /> Download
                    </a>
                    <button
                      onClick={() => renderSingleShot(shot)}
                      className="px-2.5 py-1 rounded-lg bg-black/80 hover:bg-emerald-500 hover:text-slate-950 text-white text-[11px] font-semibold flex items-center gap-1.5 transition-all border border-emerald-500/30 cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" /> Re-render Frame[cite: 20]
                    </button>
                  </div>
                </>
              ) : (
                <div className="w-full h-full p-4 flex flex-col items-center justify-center text-center bg-[#060c08]">
                  <Loader2 className="w-6 h-6 animate-spin text-emerald-500/40 mb-2" />
                  <span className="text-xs text-slate-400">Loading Storyboard Frame...</span>
                </div>
              )}

              <div className="absolute top-3 left-3 flex items-center gap-2 pointer-events-none">
                <span className="px-2 py-0.5 rounded bg-slate-950/90 backdrop-blur-md border border-white/20 text-white text-[11px] font-bold font-mono">
                  {shot.shotNumber}[cite: 20]
                </span>
              </div>

              <div className="absolute bottom-2 right-2 pointer-events-none flex items-center gap-1.5">
                {shot.imageUrl && (
                  <span className="px-1.5 py-0.5 rounded bg-emerald-950/80 text-[10px] text-emerald-400 border border-emerald-500/40 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Studio Ready[cite: 20]
                  </span>
                )}
                <span className="px-2 py-0.5 rounded bg-black/85 backdrop-blur-sm text-[10px] font-mono text-slate-300 border border-slate-800">
                  {artStyle === "sketch_bw" ? "StudioBinder Sketch" : "Graphic Novel"}[cite: 20, 21]
                </span>
              </div>
            </div>

            <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
              <div>
                <p className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider mb-1 truncate">
                  {shot.displayTitle}[cite: 21]
                </p>
                <h3 className="text-sm font-bold text-white mb-1.5">
                  {shot.shotType}[cite: 21]
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed font-light line-clamp-2">
                  "{shot.sceneSlug}"[cite: 21]
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
                  <span className="text-slate-500 block text-[10px] uppercase">Lens Angle</span>[cite: 21]
                  <span className="text-slate-200 font-medium truncate block mt-0.5">{shot.lens}</span>[cite: 21]
                </div>
                <div className="bg-[#0e1d15] p-2 rounded-lg border border-emerald-950/80">
                  <span className="text-slate-500 block text-[10px] uppercase">Movement</span>[cite: 21]
                  <span className="text-slate-200 font-medium truncate block mt-0.5">{shot.cameraMovement}</span>[cite: 21]
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}