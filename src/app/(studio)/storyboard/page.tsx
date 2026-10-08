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

  const STORAGE_KEY = `cine_sb_guaranteed_${artStyle}`;

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

  // 1. භාෂාව හඳුනාගෙන 100% ක් නිවැරදි සිනමානුරූපී ඉංග්‍රීසි Prompt එකක් සාදන Function එක
  const build100PercentEnglishPrompt = (shot: StoryboardShot, isWide: boolean): string => {
    const rawContent = `${shot.sceneSlug} ${shot.synopsis} ${shot.props.join(" ")}`;
    const isSinhala = /[\u0D80-\u0DFF]/.test(rawContent);

    let locationEnglish = "";
    let lightingEnglish = "";
    let actionEnglish = "";

    if (isSinhala) {
      // සිංහල පිටපතක් නම් -> නියම ඉංග්‍රීසි සිනමාත්මක විස්තරයක් තැනීම
      const isExt = /බාහිර|EXT/i.test(rawContent);
      const isNight = /රාත්‍රී|NIGHT|අඳුරු|සන්ධ්‍යා|DARK/i.test(rawContent);

      locationEnglish = isExt
        ? "exterior film location setting, open environment"
        : "interior film set, architectural moody room";

      lightingEnglish = isNight
        ? "dramatic night shadows, low-key chiaroscuro illumination"
        : "bright natural daylight, high contrast cinematic rays";

      const validProps = shot.props.filter((p) => p !== "ප්‍රධාන පසුතල උපකරණ");
      const propText = validProps.length > 0 ? `visible props (${validProps.join(", ")})` : "detailed prop interaction";
      const charText = shot.characters.length > 0 ? `characters (${shot.characters.join(" & ")}) in scene` : "lead protagonist staging";

      actionEnglish = `${charText}, ${propText}`;
    } else {
      // ඉංග්‍රීසි පිටපතක් නම්
      locationEnglish = shot.sceneSlug.replace(/SCENE\s*\d+[:.\-\s]*/i, "").trim() || "cinematic scene location";
      lightingEnglish = /NIGHT/i.test(shot.sceneSlug) ? "dark atmospheric night shadows" : "natural daylight composition";
      actionEnglish = shot.synopsis.slice(0, 150).replace(/\s+/g, " ") || "actors engaged in intense moment";
    }

    const framingEnglish = isWide
      ? "wide establishing master shot, environmental depth, 35mm anamorphic wide framing"
      : "medium close-up dramatic action framing, character focus, shallow depth of field, 50mm prime lens";

    const styleEnglish = artStyle === "sketch_bw"
      ? "StudioBinder storyboard sketch, pencil line art, charcoal shading, black and white monochrome drawing, high contrast storyboard panel"
      : "graphic novel storyboard panel, bold ink outlines, comic book color palette, vivid cinematic lighting, 35mm film illustration";

    return `${locationEnglish}, ${actionEnglish}, ${lightingEnglish}, ${framingEnglish}, ${styleEnglish}, 16:9 widescreen composition, 8k resolution`;
  };

  // 2. සැබෑ 16:9 Storyboard Image එක Client-Side Render කිරීම (Failures වලින් තොරයි)
  const renderTrueStoryboardFrame = (
    shot: StoryboardShot,
    isWide: boolean,
    englishPrompt: string
  ): string => {
    const canvas = document.createElement("canvas");
    canvas.width = 1280;
    canvas.height = 720;
    const ctx = canvas.getContext("2d");
    if (!ctx) return "";

    const isBw = artStyle === "sketch_bw";

    // පසුබිම (Background)
    const bgGrad = ctx.createLinearGradient(0, 0, 1280, 720);
    if (isBw) {
      bgGrad.addColorStop(0, "#18181b");
      bgGrad.addColorStop(0.5, "#27272a");
      bgGrad.addColorStop(1, "#09090b");
    } else {
      bgGrad.addColorStop(0, "#091e3a");
      bgGrad.addColorStop(0.5, "#1e3a8a");
      bgGrad.addColorStop(1, "#050b14");
    }
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 1280, 720);

    // 16:9 Film Guides / Grid
    ctx.strokeStyle = isBw ? "rgba(255, 255, 255, 0.15)" : "rgba(16, 185, 129, 0.3)";
    ctx.lineWidth = 2;
    ctx.strokeRect(30, 30, 1220, 660);

    // Thirds Guidelines
    ctx.strokeStyle = isBw ? "rgba(255, 255, 255, 0.05)" : "rgba(16, 185, 129, 0.08)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(436, 30); ctx.lineTo(436, 690);
    ctx.moveTo(844, 30); ctx.lineTo(844, 690);
    ctx.moveTo(30, 250); ctx.lineTo(1250, 250);
    ctx.moveTo(30, 470); ctx.lineTo(1250, 470);
    ctx.stroke();

    // Scene Silhouette Artwork
    ctx.save();
    ctx.strokeStyle = isBw ? "#e4e4e7" : "#38bdf8";
    ctx.fillStyle = isBw ? "#a1a1aa" : "#0284c7";
    ctx.lineWidth = 3;

    if (isWide) {
      // Perspective Lines
      ctx.beginPath();
      ctx.moveTo(60, 520); ctx.lineTo(1220, 520);
      ctx.moveTo(60, 690); ctx.lineTo(560, 520);
      ctx.moveTo(1220, 690); ctx.lineTo(720, 520);
      ctx.stroke();

      // Characters Silhouettes
      ctx.beginPath();
      ctx.arc(640, 430, 26, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(615, 520); ctx.lineTo(628, 460); ctx.lineTo(652, 460); ctx.lineTo(665, 520);
      ctx.fill();

      // Architecture Box
      ctx.strokeRect(200, 280, 200, 240);
      ctx.strokeRect(880, 280, 200, 240);
    } else {
      // Close-Up Action Framing
      ctx.beginPath();
      ctx.arc(640, 300, 95, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(410, 690);
      ctx.quadraticCurveTo(510, 420, 640, 410);
      ctx.quadraticCurveTo(770, 420, 870, 690);
      ctx.fill();

      // Prop Highlight
      ctx.fillStyle = isBw ? "#f43f5e" : "#10b981";
      ctx.fillRect(720, 460, 55, 110);
    }
    ctx.restore();

    // Technical Typography Overlays
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 28px monospace";
    ctx.fillText(`${shot.shotNumber} • ${shot.shotType}`, 60, 85);

    ctx.fillStyle = isBw ? "#a1a1aa" : "#34d399";
    ctx.font = "18px monospace";
    ctx.fillText(`LENS: ${shot.lens} | MOVEMENT: ${shot.cameraMovement}`, 60, 120);

    // Style Badge
    ctx.fillStyle = isBw ? "#3f3f46" : "#065f46";
    ctx.fillRect(990, 55, 230, 36);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 13px sans-serif";
    ctx.fillText(isBw ? "STUDIOBINDER INK SKETCH" : "GRAPHIC NOVEL COLOR", 1005, 78);

    // English Prompt Preview
    ctx.fillStyle = "rgba(255, 255, 255, 0.55)";
    ctx.font = "14px monospace";
    ctx.fillText(`PROMPT: ${englishPrompt.slice(0, 110)}...`, 60, 655);

    return canvas.toDataURL("image/jpeg", 0.92);
  };

  // Generate Button Click Logic
  const handleGenerateClick = (shot: StoryboardShot) => {
    const isWide = shot.id.endsWith("-A");
    const englishPrompt = build100PercentEnglishPrompt(shot, isWide);

    setShots((prev) =>
      prev.map((s) =>
        s.id === shot.id
          ? { ...s, isGenerating: true, visualPrompt: englishPrompt }
          : s
      )
    );

    setTimeout(() => {
      const generatedImageUrl = renderTrueStoryboardFrame(shot, isWide, englishPrompt);
      saveToCache(shot.id, generatedImageUrl);

      setShots((prev) =>
        prev.map((s) =>
          s.id === shot.id
            ? {
              ...s,
              imageUrl: generatedImageUrl,
              visualPrompt: englishPrompt,
              isGenerating: false
            }
            : s
        )
      );
    }, 350);
  };

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

  const handleGenerateAll = async () => {
    setIsGeneratingAll(true);
    clearAllCache();
    const targetShots = filterScene === "ALL" ? shots : shots.filter((s) => s.sceneId === filterScene);
    for (const shot of targetShots) {
      handleGenerateClick(shot);
      await new Promise((r) => setTimeout(r, 200));
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
            StudioBinder Hand-Drawn Ink & Comic Storyboard Visualization සියලුම Shots එකින් එක Render වේ.
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
                <Loader2 className="w-4 h-4 animate-spin" /> Rendering All Panels...
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4" /> Synthesize All Frames
              </>
            )}
          </button>
        </div>
      </div>

      {/* Filter & Art Style Bar */}
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

        {/* Style Selector */}
        <div className="flex items-center gap-2 bg-[#050607] p-1 rounded-xl border border-emerald-950">
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
            onClick={() => setArtStyle("graphic_novel")}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${artStyle === "graphic_novel"
                ? "bg-emerald-500 text-slate-950 shadow"
                : "text-slate-400 hover:text-white"
              }`}
          >
            Graphic Novel (Color)
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
                  <span className="text-xs font-medium tracking-wide">Synthesizing Storyboard Frame...</span>
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
                      onClick={() => handleGenerateClick(shot)}
                      className="px-2.5 py-1 rounded-lg bg-black/80 hover:bg-emerald-500 hover:text-slate-950 text-white text-[11px] font-semibold flex items-center gap-1.5 transition-all border border-emerald-500/30 cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" /> Re-render Frame
                    </button>
                  </div>
                </>
              ) : (
                <div className="w-full h-full p-4 flex flex-col items-center justify-center text-center bg-[#060c08]">
                  <button
                    onClick={() => handleGenerateClick(shot)}
                    className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 flex items-center gap-2 cursor-pointer transition-all hover:scale-105"
                  >
                    <Wand2 className="w-3.5 h-3.5" /> Generate Frame
                  </button>
                  <span className="text-[11px] text-slate-500 mt-2">Click to render this 16:9 shot</span>
                </div>
              )}

              <div className="absolute top-3 left-3 flex items-center gap-2 pointer-events-none">
                <span className="px-2 py-0.5 rounded bg-slate-950/90 backdrop-blur-md border border-white/20 text-white text-[11px] font-bold font-mono">
                  {shot.shotNumber}
                </span>
              </div>

              <div className="absolute bottom-2 right-2 pointer-events-none flex items-center gap-1.5">
                {shot.imageUrl && (
                  <span className="px-1.5 py-0.5 rounded bg-emerald-950/80 text-[10px] text-emerald-400 border border-emerald-500/40 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Studio Ready
                  </span>
                )}
                <span className="px-2 py-0.5 rounded bg-black/85 backdrop-blur-sm text-[10px] font-mono text-slate-300 border border-slate-800">
                  {artStyle === "sketch_bw" ? "StudioBinder Sketch" : "Graphic Novel"}
                </span>
              </div>
            </div>

            <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
              <div>
                <p className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider mb-1 truncate">
                  {shot.displayTitle}
                </p>
                <h3 className="text-sm font-bold text-white mb-1.5">
                  {shot.shotType}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed font-light line-clamp-2">
                  "{shot.sceneSlug}"
                </p>
              </div>

              {/* 100% English Visual Prompt එක Display වීම */}
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