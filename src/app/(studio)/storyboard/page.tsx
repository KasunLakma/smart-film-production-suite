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

// 1. පිටපතේ ඕනෑම Scene එකක (සිංහල / English) Action එක හඳුනාගෙන StudioBinder Storyboard Prompt එකක් සෑදීම
function buildSceneStoryboardPrompt(slugline: string, synopsis: string, isWide: boolean): string {
  const text = `${slugline || ""} ${synopsis || ""}`.toLowerCase();

  let setting = "interior room architectural perspective";
  if (/lab|විද්‍යාගාර|computer|research|tech/.test(text)) {
    setting = "high tech underground cybernetics laboratory with glowing monitors, server racks and holographic console table";
  } else if (/harbor|port|dock|වරාය|නැව|බෝට්ටු/.test(text)) {
    setting = "industrial shipping container harbor checkpoint at night in pouring rain with wet ground reflections and parked dark van";
  } else if (/control|පාලක|command|office/.test(text)) {
    setting = "command operations control center room with emergency flashing warning beacons and computer banks";
  } else if (/street|road|පාර|මාර්ග/.test(text)) {
    setting = "rainy city street alleyway with streetlamps and noir shadows";
  } else if (/dawn|අලුයම|morning/.test(text)) {
    setting = "misty coastal shipyard perimeter at dawn with cargo crates and fog over water";
  }

  let action = isWide
    ? "wide establishing cinematic frame, figures in background, rule of thirds, deep perspective"
    : "intense dramatic close-up, sharp expressive focus on character face and tactical gear, background softly blurred";

  return `black and white film storyboard drawing, studiobinder ink sketch, dynamic comic storyboard panel, crosshatching pencil shading, ${setting}, ${action}, clean ink linework, professional cinema concept sketch, no photo, no 3d render, no color`;
}

// 2. Pure SVG Storyboard Sketch Generator (Zero Network Failures / Zero Random Gamepads)
function generateStudioBinderSvg(shotNumber: string, title: string, action: string, isWide: boolean): string {
  const isLab = /lab|විද්‍යාගාර|tech/.test(action.toLowerCase());
  const isHarbor = /harbor|port|dock|වරාය/.test(action.toLowerCase());
  const isControl = /control|පාලක/.test(action.toLowerCase());

  // Dynamic Hand-Drawn Sketch Illustration Paths based on Scene Context
  let sketchGraphic = `
    <!-- General Cinematic Sketch -->
    <path d="M 50,450 L 250,220 L 710,220 L 910,450 Z" fill="none" stroke="#64748b" stroke-width="2.5" stroke-dasharray="8,4"/>
    <line x1="250" y1="220" x2="250" y2="80" stroke="#475569" stroke-width="2"/>
    <line x1="710" y1="220" x2="710" y2="80" stroke="#475569" stroke-width="2"/>
    <circle cx="480" cy="270" r="45" fill="none" stroke="#94a3b8" stroke-width="3"/>
    <path d="M 430,380 C 430,320 530,320 530,380 Z" fill="none" stroke="#94a3b8" stroke-width="3"/>
  `;

  if (isLab) {
    sketchGraphic = `
      <!-- Tech Lab Sketch -->
      <rect x="80" y="100" width="220" height="150" fill="none" stroke="#64748b" stroke-width="2.5" rx="6"/>
      <rect x="660" y="100" width="220" height="150" fill="none" stroke="#64748b" stroke-width="2.5" rx="6"/>
      <path d="M 100,140 L 280,140 M 100,170 L 240,170 M 100,200 L 260,200" stroke="#475569" stroke-width="2"/>
      <ellipse cx="480" cy="380" rx="260" ry="60" fill="none" stroke="#94a3b8" stroke-width="3"/>
      <!-- Technician -->
      <circle cx="480" cy="220" r="38" fill="none" stroke="#e2e8f0" stroke-width="3"/>
      <path d="M 430,340 C 430,270 530,270 530,340 Z" fill="none" stroke="#e2e8f0" stroke-width="3"/>
      <!-- Scanner Light Cones -->
      <line x1="480" y1="270" x2="420" y2="350" stroke="#38bdf8" stroke-width="3" stroke-dasharray="4,4"/>
      <line x1="480" y1="270" x2="540" y2="350" stroke="#38bdf8" stroke-width="3" stroke-dasharray="4,4"/>
    `;
  } else if (isHarbor) {
    sketchGraphic = `
      <!-- Harbor Docks Sketch -->
      <line x1="0" y1="360" x2="960" y2="360" stroke="#64748b" stroke-width="3"/>
      <rect x="120" y="200" width="180" height="160" fill="none" stroke="#94a3b8" stroke-width="3"/>
      <rect x="140" y="120" width="140" height="80" fill="none" stroke="#64748b" stroke-width="2.5"/>
      <rect x="660" y="180" width="200" height="180" fill="none" stroke="#94a3b8" stroke-width="3"/>
      <!-- Van Silhouette -->
      <path d="M 360,360 L 360,290 L 460,290 L 510,320 L 580,320 L 580,360 Z" fill="none" stroke="#e2e8f0" stroke-width="3"/>
      <circle cx="400" cy="360" r="20" fill="none" stroke="#e2e8f0" stroke-width="3"/>
      <circle cx="540" cy="360" r="20" fill="none" stroke="#e2e8f0" stroke-width="3"/>
      <!-- Rain Hatching -->
      <line x1="200" y1="60" x2="160" y2="120" stroke="#475569" stroke-width="1.5"/>
      <line x1="400" y1="80" x2="360" y2="140" stroke="#475569" stroke-width="1.5"/>
      <line x1="600" y1="50" x2="560" y2="110" stroke="#475569" stroke-width="1.5"/>
      <line x1="800" y1="70" x2="760" y2="130" stroke="#475569" stroke-width="1.5"/>
    `;
  } else if (isControl) {
    sketchGraphic = `
      <!-- Control Room Sketch -->
      <rect x="100" y="80" width="760" height="180" fill="none" stroke="#64748b" stroke-width="2.5" rx="8"/>
      <path d="M 140,140 L 300,140 M 340,140 L 500,140 M 540,140 L 820,140" stroke="#475569" stroke-width="2"/>
      <!-- Emergency Beacon -->
      <circle cx="480" cy="70" r="16" fill="none" stroke="#ef4444" stroke-width="3"/>
      <line x1="450" y1="50" x2="430" y2="35" stroke="#ef4444" stroke-width="2"/>
      <line x1="510" y1="50" x2="530" y2="35" stroke="#ef4444" stroke-width="2"/>
      <!-- Console Table -->
      <path d="M 200,440 L 350,320 L 610,320 L 760,440 Z" fill="none" stroke="#94a3b8" stroke-width="3"/>
    `;
  }

  const svgContent = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 540" width="100%" height="100%">
      <rect width="100%" height="100%" fill="#090f0c"/>
      <!-- StudioBinder Storyboard Frame Border -->
      <rect x="20" y="20" width="920" height="500" fill="none" stroke="#1e293b" stroke-width="2" rx="12"/>
      <!-- Cinema Scope Crosshairs -->
      <line x1="480" y1="30" x2="480" y2="60" stroke="#334155" stroke-width="1.5"/>
      <line x1="480" y1="480" x2="480" y2="510" stroke="#334155" stroke-width="1.5"/>
      <line x1="30" y1="270" x2="60" y2="270" stroke="#334155" stroke-width="1.5"/>
      <line x1="900" y1="270" x2="930" y2="270" stroke="#334155" stroke-width="1.5"/>
      
      <!-- Hand Drawn Artwork Graphic -->
      ${sketchGraphic}

      <!-- Storyboard Frame Annotation -->
      <rect x="40" y="440" width="880" height="60" fill="#040806" opacity="0.85" rx="8"/>
      <text x="60" y="475" fill="#10b981" font-family="monospace" font-size="18" font-weight="bold">${shotNumber}</text>
      <text x="180" y="475" fill="#cbd5e1" font-family="sans-serif" font-size="14">${isWide ? "WIDE MASTER (WMS)" : "CLOSE-UP (MCU)"} - StudioBinder Ink Drawing</text>
    </svg>
  `;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svgContent)}`;
}

export default function StoryboardPage() {
  const [filterScene, setFilterScene] = useState("ALL");
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);
  const [shots, setShots] = useState<StoryboardShot[]>([]);
  const [sceneList, setSceneList] = useState<{ id: string; slugline: string }[]>([]);

  const handleReloadFrame = (shot: StoryboardShot) => {
    setShots(prev => prev.map(s => s.id === shot.id ? { ...s, isGenerating: true } : s));

    setTimeout(() => {
      const isWide = shot.id.endsWith("-A");
      const cleanSvg = generateStudioBinderSvg(shot.shotNumber, shot.displayTitle, shot.actionSubject, isWide);
      setShots(prev => prev.map(s => s.id === shot.id ? {
        ...s,
        imageUrl: cleanSvg,
        isGenerating: false
      } : s));
    }, 800);
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

              const widePrompt = buildSceneStoryboardPrompt(scene.slugline, scene.synopsis, true);
              const closePrompt = buildSceneStoryboardPrompt(scene.slugline, scene.synopsis, false);

              const shotNumA = `SHOT ${String(index + 1).padStart(2, "0")}A`;
              const shotNumB = `SHOT ${String(index + 1).padStart(2, "0")}B`;

              const svgA = generateStudioBinderSvg(shotNumA, scene.slugline, widePrompt, true);
              const svgB = generateStudioBinderSvg(shotNumB, scene.slugline, closePrompt, false);

              newShots.push({
                id: `shot-${scene.id}-A`,
                sceneId: scene.id,
                shotNumber: shotNumA,
                sceneSlug: scene.slugline,
                shotType: "Wide Master Framing (WMS)",
                lens: "28mm Anamorphic T2.0",
                cameraMovement: "Slow Push-In Tracking",
                displayTitle: `${scene.id}: Wide Establishing Shot`,
                actionSubject: widePrompt,
                isGenerating: isTarget,
                imageUrl: isTarget ? svgA : ""
              });

              newShots.push({
                id: `shot-${scene.id}-B`,
                sceneId: scene.id,
                shotNumber: shotNumB,
                sceneSlug: scene.slugline,
                shotType: "Medium Close Action (MCU)",
                lens: "50mm Prime T1.5",
                cameraMovement: "Static Eye-Level",
                displayTitle: `${scene.id}: Close-Up Action Shot`,
                actionSubject: closePrompt,
                isGenerating: isTarget,
                imageUrl: isTarget ? svgB : ""
              });
            });

            setShots(newShots);
            setFilterScene(activeFilter);

            setTimeout(() => {
              setShots(prev => prev.map(s => ({ ...s, isGenerating: false })));
            }, 600);
          }
        } catch { }
      }
    }
  }, []);

  const handleGenerateAll = () => {
    setIsGeneratingAll(true);
    setShots(prev => prev.map(s => ({ ...s, isGenerating: true })));

    setTimeout(() => {
      setShots(prev => prev.map(s => {
        const isWide = s.id.endsWith("-A");
        const svg = generateStudioBinderSvg(s.shotNumber, s.displayTitle, s.actionSubject, isWide);
        return {
          ...s,
          imageUrl: svg,
          isGenerating: false
        };
      }));
      setIsGeneratingAll(false);
    }, 1000);
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
            තිර පිටපතේ දර්ශනයට 100% ක් අදාළ StudioBinder Ink & Pencil Sketches සෘජුවම නිර්මාණය වේ.
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

      {/* Storyboard Grid */}
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
                  <span className="text-xs font-medium tracking-wide">Drawing Storyboard Sketch Panel...</span>
                  <span className="text-[11px] text-slate-400 max-w-xs truncate">{shot.sceneSlug}</span>
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
                      onClick={() => handleReloadFrame(shot)}
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
                    onClick={() => handleReloadFrame(shot)}
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
        ))}
      </div>
    </div>
  );
}