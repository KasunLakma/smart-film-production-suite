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
  Sparkles,
  Layers
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

// පිටපතේ ඕනෑම Scene එකක ක්‍රියාව අනුව StudioBinder Pencil & Ink Storyboard Art එකක් කෙළින්ම සාදන High-Quality Canvas Engine එක
function renderStudioBinderArt(shotNumber: string, sceneSlug: string, isWide: boolean): string {
  if (typeof document === "undefined") return "";

  const canvas = document.createElement("canvas");
  canvas.width = 1280;
  canvas.height = 720;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";

  const slug = (sceneSlug || "").toLowerCase();
  const isLab = /lab|විද්‍යාගාර|computer|research|tech/.test(slug);
  const isHarbor = /harbor|port|dock|වරාය|නැව|බෝට්ටු/.test(slug);
  const isControl = /control|පාලක|command|office/.test(slug);

  // 1. StudioBinder Paper / Dark Charcoal Board Background
  ctx.fillStyle = "#121415";
  ctx.fillRect(0, 0, 1280, 720);

  // 2. Paper Texture & Crosshatch Sketch Lines (Pencil Texture)
  ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
  ctx.lineWidth = 1;
  for (let i = -720; i < 1280; i += 8) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + 720, 720);
    ctx.stroke();
  }

  // 3. 16:9 Cinematic Safe Framing Box
  ctx.strokeStyle = "#384149";
  ctx.lineWidth = 2.5;
  ctx.strokeRect(40, 35, 1200, 650);

  // Crosshairs & Aspect Marks
  ctx.strokeStyle = "#505a63";
  ctx.lineWidth = 1.5;
  // Top / Bottom center marks
  ctx.beginPath();
  ctx.moveTo(640, 20); ctx.lineTo(640, 50);
  ctx.moveTo(640, 670); ctx.lineTo(640, 700);
  // Left / Right center marks
  ctx.moveTo(25, 360); ctx.lineTo(55, 360);
  ctx.moveTo(1225, 360); ctx.lineTo(1255, 360);
  ctx.stroke();

  // 4. Perspective Grids & Scene Layout (StudioBinder Cinematography Lines)
  ctx.strokeStyle = "rgba(180, 195, 205, 0.25)";
  ctx.lineWidth = 1.5;
  const horizonY = isWide ? 420 : 480;

  ctx.beginPath();
  ctx.moveTo(40, horizonY);
  ctx.lineTo(1240, horizonY);
  // Vanishing point perspective diagonals
  ctx.moveTo(640, horizonY); ctx.lineTo(40, 685);
  ctx.moveTo(640, horizonY); ctx.lineTo(380, 685);
  ctx.moveTo(640, horizonY); ctx.lineTo(900, 685);
  ctx.moveTo(640, horizonY); ctx.lineTo(1240, 685);
  ctx.stroke();

  // 5. Hand-Drawn Ink Elements based on Scene Type
  if (isLab) {
    if (isWide) {
      // Wide Lab: Computer terminal racks, table, figure in background
      ctx.strokeStyle = "#cbd5e1";
      ctx.lineWidth = 2.5;
      // Server racks & screens left
      ctx.strokeRect(100, 180, 220, 240);
      ctx.strokeRect(120, 200, 180, 60);
      ctx.strokeRect(120, 280, 180, 60);
      // Screens right
      ctx.strokeRect(960, 180, 220, 240);
      ctx.strokeRect(980, 200, 180, 60);
      ctx.strokeRect(980, 280, 180, 60);
      // Central Hologram Table
      ctx.beginPath();
      ctx.ellipse(640, 520, 320, 70, 0, 0, Math.PI * 2);
      ctx.stroke();
      // Holographic Light Cone
      ctx.strokeStyle = "rgba(56, 189, 248, 0.4)";
      ctx.strokePoly = true;
      ctx.beginPath();
      ctx.moveTo(640, 320); ctx.lineTo(480, 520);
      ctx.moveTo(640, 320); ctx.lineTo(800, 520);
      ctx.stroke();
      // Operative Silhouette
      ctx.fillStyle = "#e2e8f0";
      ctx.beginPath();
      ctx.arc(640, 350, 24, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(600, 470); ctx.lineTo(620, 385); ctx.lineTo(660, 385); ctx.lineTo(680, 470);
      ctx.fill();
    } else {
      // Close up: Technician face, intense eyes & glowing handheld scanner
      ctx.strokeStyle = "#e2e8f0";
      ctx.fillStyle = "#1e242a";
      ctx.lineWidth = 3;
      // Face / Head silhouette
      ctx.beginPath();
      ctx.arc(640, 280, 95, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Eyes / Brow crosshatching
      ctx.strokeStyle = "#f8fafc";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(590, 275); ctx.lineTo(630, 270);
      ctx.moveTo(650, 270); ctx.lineTo(690, 275);
      ctx.stroke();
      // Handheld Tactical Scanner tool
      ctx.fillStyle = "#334155";
      ctx.strokeStyle = "#38bdf8";
      ctx.lineWidth = 3;
      ctx.fillRect(560, 430, 160, 180);
      ctx.strokeRect(560, 430, 160, 180);
      // Scanner Display
      ctx.strokeStyle = "#7dd3fc";
      ctx.strokeRect(580, 450, 120, 80);
      // Scanning Light Array
      ctx.beginPath();
      ctx.moveTo(580, 490); ctx.lineTo(700, 490);
      ctx.stroke();
    }
  } else if (isHarbor) {
    if (isWide) {
      // Wide Harbor: Containers, parked van, downpour rain
      ctx.strokeStyle = "#cbd5e1";
      ctx.lineWidth = 2.5;
      // Stacked Containers Left & Right
      ctx.strokeRect(80, 260, 240, 160);
      ctx.strokeRect(960, 260, 240, 160);
      ctx.strokeRect(980, 140, 200, 120);
      // Dark Tactical Van silhouette
      ctx.fillStyle = "#262e35";
      ctx.strokeStyle = "#e2e8f0";
      ctx.beginPath();
      ctx.moveTo(480, 480); ctx.lineTo(500, 390); ctx.lineTo(660, 390); ctx.lineTo(740, 430); ctx.lineTo(780, 440); ctx.lineTo(780, 480); ctx.closePath();
      ctx.fill();
      ctx.stroke();
      // Van wheels
      ctx.beginPath();
      ctx.arc(540, 485, 20, 0, Math.PI * 2);
      ctx.arc(720, 485, 20, 0, Math.PI * 2);
      ctx.stroke();
      // Heavy Downpour Rain Hatching
      ctx.strokeStyle = "rgba(148, 163, 184, 0.4)";
      ctx.lineWidth = 1.5;
      for (let r = 100; r < 1200; r += 45) {
        ctx.beginPath();
        ctx.moveTo(r, 60); ctx.lineTo(r - 50, 220);
        ctx.moveTo(r + 20, 240); ctx.lineTo(r - 30, 400);
        ctx.stroke();
      }
    } else {
      // Close up: Agent holding binoculars in rain
      ctx.strokeStyle = "#e2e8f0";
      ctx.fillStyle = "#1e242a";
      ctx.lineWidth = 3;
      // Hooded Head
      ctx.beginPath();
      ctx.arc(640, 270, 110, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Binoculars in front
      ctx.fillStyle = "#334155";
      ctx.beginPath();
      ctx.arc(580, 360, 45, 0, Math.PI * 2);
      ctx.arc(700, 360, 45, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.strokeRect(615, 345, 50, 30);
    }
  } else if (isControl) {
    if (isWide) {
      // Wide Control Room: Warning alarms, curved console
      ctx.strokeStyle = "#cbd5e1";
      ctx.lineWidth = 2.5;
      // Mainframe Monitor Wall
      ctx.strokeRect(180, 140, 920, 200);
      ctx.strokeRect(220, 160, 260, 160);
      ctx.strokeRect(510, 160, 260, 160);
      ctx.strokeRect(800, 160, 260, 160);
      // Emergency Flashing Beacon
      ctx.strokeStyle = "#ef4444";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(640, 100, 20, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(600, 80); ctx.lineTo(580, 60);
      ctx.moveTo(680, 80); ctx.lineTo(700, 60);
      ctx.stroke();
    } else {
      // Close up: Hand pulling encrypted hard drive
      ctx.strokeStyle = "#e2e8f0";
      ctx.fillStyle = "#1e242a";
      ctx.lineWidth = 3;
      // Server Bay Slot
      ctx.strokeRect(340, 160, 600, 380);
      ctx.strokeRect(380, 200, 520, 80);
      // Military Encrypted Drive Being Pulled Out
      ctx.fillStyle = "#334155";
      ctx.fillRect(480, 310, 320, 160);
      ctx.strokeRect(480, 310, 320, 160);
      // Red Alarm Light Edge
      ctx.strokeStyle = "#ef4444";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(480, 310); ctx.lineTo(800, 310);
      ctx.stroke();
    }
  } else {
    // Dawn Docks / Generic Escape Scene
    ctx.strokeStyle = "#cbd5e1";
    ctx.lineWidth = 2.5;
    ctx.strokeRect(140, 240, 300, 180);
    ctx.strokeRect(840, 240, 300, 180);
    // Running Figures
    ctx.fillStyle = "#e2e8f0";
    ctx.beginPath();
    ctx.arc(580, 380, 18, 0, Math.PI * 2);
    ctx.arc(680, 395, 18, 0, Math.PI * 2);
    ctx.fill();
  }

  // 6. StudioBinder Bottom Slate / Metadata Bar
  ctx.fillStyle = "rgba(5, 10, 8, 0.88)";
  ctx.fillRect(40, 615, 1200, 70);
  ctx.strokeStyle = "#10b981";
  ctx.lineWidth = 1.5;
  ctx.strokeRect(40, 615, 1200, 70);

  ctx.fillStyle = "#10b981";
  ctx.font = "bold 22px monospace";
  ctx.fillText(shotNumber, 70, 658);

  ctx.fillStyle = "#cbd5e1";
  ctx.font = "16px sans-serif";
  ctx.fillText(
    isWide ? "WIDE MASTER (WMS) - StudioBinder Charcoal & Ink Sketch" : "CLOSE-UP ACTION (MCU) - StudioBinder Hand-Drawn Sketch",
    230,
    657
  );

  return canvas.toDataURL("image/png");
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
      const cleanDrawing = renderStudioBinderArt(shot.shotNumber, shot.sceneSlug, isWide);
      setShots(prev => prev.map(s => s.id === shot.id ? {
        ...s,
        imageUrl: cleanDrawing,
        isGenerating: false
      } : s));
    }, 600);
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
              const shotNumA = `SHOT ${String(index + 1).padStart(2, "0")}A`;
              const shotNumB = `SHOT ${String(index + 1).padStart(2, "0")}B`;

              const imgA = renderStudioBinderArt(shotNumA, scene.slugline, true);
              const imgB = renderStudioBinderArt(shotNumB, scene.slugline, false);

              newShots.push({
                id: `shot-${scene.id}-A`,
                sceneId: scene.id,
                shotNumber: shotNumA,
                sceneSlug: scene.slugline,
                shotType: "Wide Master Framing (WMS)",
                lens: "28mm Anamorphic T2.0",
                cameraMovement: "Slow Push-In Tracking",
                displayTitle: `${scene.id}: Wide Establishing Master`,
                actionSubject: `StudioBinder Ink Sketch: Widescreen framing of ${scene.slugline}, environmental perspective and setup.`,
                isGenerating: isTarget,
                imageUrl: isTarget ? imgA : ""
              });

              newShots.push({
                id: `shot-${scene.id}-B`,
                sceneId: scene.id,
                shotNumber: shotNumB,
                sceneSlug: scene.slugline,
                shotType: "Medium Close Action (MCU)",
                lens: "50mm Prime T1.5",
                cameraMovement: "Static Eye-Level",
                displayTitle: `${scene.id}: Close-Up Key Action`,
                actionSubject: `StudioBinder Hand-Drawn Sketch: Focused character action, tools and tactical devices in ${scene.slugline}.`,
                isGenerating: isTarget,
                imageUrl: isTarget ? imgB : ""
              });
            });

            setShots(newShots);
            setFilterScene(activeFilter);

            setTimeout(() => {
              setShots(prev => prev.map(s => ({ ...s, isGenerating: false })));
            }, 500);
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
        const drawing = renderStudioBinderArt(s.shotNumber, s.sceneSlug, isWide);
        return {
          ...s,
          imageUrl: drawing,
          isGenerating: false
        };
      }));
      setIsGeneratingAll(false);
    }, 700);
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
            <Sparkles className="w-3.5 h-3.5" /> Hand-Drawn Film Storyboard Studio
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Cinematic Storyboard Studio
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            StudioBinder Ink & Charcoal Shading ආකෘතියෙන් සෑම දර්ශනයකටම ගැළපෙන Hand-Drawn Storyboard Frames.
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
          <span className="px-2.5 py-1 rounded bg-[#0e1d15] border border-emerald-500/20 text-emerald-400 font-mono flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5" /> StudioBinder Charcoal & Ink
          </span>
          <span className="text-slate-500">•</span>
          <span>16:9 Scope</span>
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
                  <span className="text-xs font-medium tracking-wide">Drawing StudioBinder Hand-Drawn Sketch...</span>
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
                      <RefreshCw className="w-3 h-3" /> Re-draw Frame
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
                <span className="px-2 py-0.5 rounded bg-black/85 backdrop-blur-sm text-[10px] font-mono text-emerald-400 border border-emerald-950">
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