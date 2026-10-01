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
  Layers,
  Palette
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

// StudioBinder Professional Charcoal / Ink Hatching Render Engine
function generateStudioBinderFrame(
  shotNumber: string,
  sceneSlug: string,
  isWide: boolean,
  artStyle: "sketch_bw" | "graphic_novel"
): string {
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

  const isColor = artStyle === "graphic_novel";

  // 1. Background Tone (Charcoal Paper / Deep Noir Studio Canvas)
  ctx.fillStyle = isColor ? "#0d1512" : "#111417";
  ctx.fillRect(0, 0, 1280, 720);

  // 2. Chiaroscuro Atmospheric Vignette / Lighting Gradient
  const grad = ctx.createRadialGradient(640, 340, 100, 640, 360, 680);
  if (isColor) {
    grad.addColorStop(0, "rgba(16, 185, 129, 0.12)");
    grad.addColorStop(0.7, "rgba(5, 20, 15, 0.8)");
    grad.addColorStop(1, "#030805");
  } else {
    grad.addColorStop(0, "rgba(255, 255, 255, 0.15)");
    grad.addColorStop(0.65, "rgba(15, 20, 25, 0.7)");
    grad.addColorStop(1, "#080a0c");
  }
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1280, 720);

  // 3. Dense Crosshatching / Pencil Shading Textures
  ctx.strokeStyle = isColor ? "rgba(52, 211, 153, 0.04)" : "rgba(255, 255, 255, 0.05)";
  ctx.lineWidth = 1;
  for (let i = -720; i < 1280; i += 6) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + 720, 720);
    ctx.stroke();
  }

  // 4. StudioBinder Cinematic Scope Border & Grid Marks
  ctx.strokeStyle = isColor ? "#065f46" : "#334155";
  ctx.lineWidth = 2;
  ctx.strokeRect(40, 30, 1200, 660);

  // Crosshairs & Center Frame Ticks
  ctx.strokeStyle = isColor ? "#10b981" : "#64748b";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(640, 15); ctx.lineTo(640, 45);
  ctx.moveTo(640, 675); ctx.lineTo(640, 705);
  ctx.moveTo(25, 360); ctx.lineTo(55, 360);
  ctx.moveTo(1225, 360); ctx.lineTo(1255, 360);
  ctx.stroke();

  // Perspective Horizon Lines
  ctx.strokeStyle = "rgba(148, 163, 184, 0.25)";
  ctx.lineWidth = 1;
  const horizon = isWide ? 440 : 490;
  ctx.beginPath();
  ctx.moveTo(40, horizon); ctx.lineTo(1240, horizon);
  ctx.moveTo(640, horizon); ctx.lineTo(40, 690);
  ctx.moveTo(640, horizon); ctx.lineTo(1240, 690);
  ctx.stroke();

  // 5. High-Contrast Figurative Storyboard Sketches by Scene Context
  if (isLab) {
    if (isWide) {
      // Wide Lab: 3D Perspective Server Walls, Holographic Desk, Technician Sketch
      ctx.fillStyle = "#1e293b";
      ctx.strokeStyle = isColor ? "#34d399" : "#cbd5e1";
      ctx.lineWidth = 2.5;

      // Left Server Racks with Depth
      ctx.beginPath();
      ctx.moveTo(60, 180); ctx.lineTo(260, 220); ctx.lineTo(260, 560); ctx.lineTo(60, 620); ctx.closePath();
      ctx.fill(); ctx.stroke();
      // Server Lights Hatching
      for (let y = 250; y < 520; y += 40) {
        ctx.strokeRect(90, y, 140, 18);
      }

      // Right Monitors Wall
      ctx.beginPath();
      ctx.moveTo(1220, 180); ctx.lineTo(1020, 220); ctx.lineTo(1020, 560); ctx.lineTo(1220, 620); ctx.closePath();
      ctx.fill(); ctx.stroke();
      for (let y = 250; y < 520; y += 45) {
        ctx.strokeRect(1050, y, 140, 24);
      }

      // Center Holographic Terminal Desk
      ctx.fillStyle = "#0f172a";
      ctx.beginPath();
      ctx.ellipse(640, 540, 280, 65, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Holographic Volumetric Projection Cone
      const holoGrad = ctx.createLinearGradient(640, 320, 640, 540);
      holoGrad.addColorStop(0, isColor ? "rgba(16, 185, 129, 0.6)" : "rgba(255, 255, 255, 0.4)");
      holoGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = holoGrad;
      ctx.beginPath();
      ctx.moveTo(640, 320); ctx.lineTo(460, 540); ctx.lineTo(820, 540); ctx.closePath();
      ctx.fill();

      // Technician Mid-Ground Silhouette with Charcoal Hatching
      ctx.fillStyle = "#020617";
      ctx.beginPath();
      ctx.arc(640, 360, 26, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(595, 490); ctx.lineTo(620, 395); ctx.lineTo(660, 395); ctx.lineTo(685, 490); ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else {
      // Close-Up Lab: High-Definition Human Head & Handheld Optical Scanner
      ctx.fillStyle = "#1e293b";
      ctx.strokeStyle = isColor ? "#34d399" : "#e2e8f0";
      ctx.lineWidth = 3;

      // Human Anatomical Face Contour Silhouette (StudioBinder Pencil Portrait)
      ctx.beginPath();
      ctx.arc(640, 260, 95, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Facial Chiaroscuro Shading / Shadow Side
      ctx.fillStyle = "rgba(0,0,0,0.45)";
      ctx.beginPath();
      ctx.arc(640, 260, 95, Math.PI * 0.4, Math.PI * 1.6);
      ctx.fill();

      // Eyebrow and Eye Gaze Crosshatching
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(585, 255); ctx.lineTo(625, 250);
      ctx.moveTo(655, 250); ctx.lineTo(695, 255);
      ctx.stroke();

      // Dramatic Hand & Handheld Scanner Device in Foreground
      ctx.fillStyle = "#0f172a";
      ctx.strokeStyle = isColor ? "#10b981" : "#ffffff";
      ctx.lineWidth = 3.5;
      ctx.fillRect(540, 420, 200, 190);
      ctx.strokeRect(540, 420, 200, 190);

      // Scanner Optical Display Screen
      ctx.fillStyle = isColor ? "#064e3b" : "#334155";
      ctx.fillRect(565, 445, 150, 90);
      ctx.strokeRect(565, 445, 150, 90);

      // Projection Beam lines
      ctx.strokeStyle = isColor ? "#34d399" : "rgba(255,255,255,0.7)";
      ctx.beginPath();
      ctx.moveTo(565, 490); ctx.lineTo(715, 490);
      ctx.moveTo(640, 445); ctx.lineTo(640, 535);
      ctx.stroke();
    }
  } else if (isHarbor) {
    if (isWide) {
      // Wide Harbor: Containers, Wet Tarmac Reflections, Van
      ctx.fillStyle = "#1e293b";
      ctx.strokeStyle = isColor ? "#38bdf8" : "#cbd5e1";
      ctx.lineWidth = 2.5;

      // Stacked Maritime Shipping Freight Containers (Left & Right)
      ctx.strokeRect(70, 240, 260, 170);
      ctx.strokeRect(950, 240, 260, 170);
      ctx.strokeRect(970, 120, 220, 120);

      // Cargo Container Corrugation Lines
      for (let x = 90; x < 320; x += 22) {
        ctx.beginPath(); ctx.moveTo(x, 240); ctx.lineTo(x, 410); ctx.stroke();
      }

      // Tactical Van Shaded Silhouette
      ctx.fillStyle = "#090d12";
      ctx.strokeStyle = "#e2e8f0";
      ctx.beginPath();
      ctx.moveTo(460, 480); ctx.lineTo(485, 380); ctx.lineTo(665, 380); ctx.lineTo(745, 425); ctx.lineTo(790, 435); ctx.lineTo(790, 480); ctx.closePath();
      ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.arc(525, 485, 24, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.arc(730, 485, 24, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

      // Realistic Heavy Downpour Rain Hatching (Crosshatch Streaks)
      ctx.strokeStyle = "rgba(148, 163, 184, 0.45)";
      ctx.lineWidth = 1.8;
      for (let r = 80; r < 1220; r += 35) {
        ctx.beginPath(); ctx.moveTo(r, 40); ctx.lineTo(r - 55, 220); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(r + 15, 260); ctx.lineTo(r - 40, 440); ctx.stroke();
      }
    } else {
      // Close-Up Harbor: Covert Operative with Tactical Binoculars in Rain
      ctx.fillStyle = "#1e293b";
      ctx.strokeStyle = isColor ? "#38bdf8" : "#e2e8f0";
      ctx.lineWidth = 3;

      // Hooded Silhouette
      ctx.beginPath();
      ctx.arc(640, 260, 115, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();

      // Binoculars Cylinders in High Contrast
      ctx.fillStyle = "#090d12";
      ctx.beginPath();
      ctx.arc(575, 360, 52, 0, Math.PI * 2);
      ctx.arc(705, 360, 52, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();
      ctx.fillRect(610, 340, 60, 35);
      ctx.strokeRect(610, 340, 60, 35);

      // Lens Reflections
      ctx.fillStyle = isColor ? "rgba(56, 189, 248, 0.35)" : "rgba(255, 255, 255, 0.3)";
      ctx.beginPath(); ctx.arc(575, 360, 38, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(705, 360, 38, 0, Math.PI * 2); ctx.fill();
    }
  } else if (isControl) {
    if (isWide) {
      // Wide Control Room: Massive Screen Array, Emergency Alarm Lighting
      ctx.fillStyle = "#1e293b";
      ctx.strokeStyle = isColor ? "#f87171" : "#cbd5e1";
      ctx.lineWidth = 2.5;

      ctx.strokeRect(160, 120, 960, 240);
      ctx.strokeRect(200, 150, 260, 180);
      ctx.strokeRect(510, 150, 260, 180);
      ctx.strokeRect(820, 150, 260, 180);

      // Warning Beacon Pulse
      ctx.strokeStyle = "#ef4444";
      ctx.lineWidth = 4;
      ctx.beginPath(); ctx.arc(640, 90, 24, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(590, 70); ctx.lineTo(560, 45);
      ctx.moveTo(690, 70); ctx.lineTo(720, 45);
      ctx.stroke();

      // Curved Command Desk
      ctx.fillStyle = "#0f172a";
      ctx.beginPath();
      ctx.moveTo(220, 560); ctx.lineTo(440, 430); ctx.lineTo(840, 430); ctx.lineTo(1060, 560); ctx.closePath();
      ctx.fill(); ctx.stroke();
    } else {
      // Close-Up Control Room: Hand Unplugging Encrypted Military Drive
      ctx.fillStyle = "#1e293b";
      ctx.strokeStyle = isColor ? "#f87171" : "#e2e8f0";
      ctx.lineWidth = 3;

      // Server Chassis Slot Bay
      ctx.strokeRect(320, 140, 640, 400);
      for (let y = 180; y < 500; y += 70) {
        ctx.strokeRect(360, y, 560, 45);
      }

      // Hard Drive Being Ejected with Motion Lines
      ctx.fillStyle = "#090d12";
      ctx.fillRect(480, 290, 320, 170);
      ctx.strokeRect(480, 290, 320, 170);

      // Red Status Strip on Drive
      ctx.fillStyle = "#ef4444";
      ctx.fillRect(500, 310, 280, 18);

      // Operative Hand Silhouette Gripping Drive
      ctx.fillStyle = "#334155";
      ctx.beginPath();
      ctx.ellipse(640, 450, 70, 35, 0, 0, Math.PI * 2);
      ctx.fill(); ctx.stroke();
    }
  } else {
    // Dawn Docks / Coastal Yard Escape
    ctx.fillStyle = "#1e293b";
    ctx.strokeStyle = "#cbd5e1";
    ctx.lineWidth = 2.5;

    ctx.strokeRect(120, 220, 280, 190);
    ctx.strokeRect(880, 220, 280, 190);

    // Two Running Silhouettes
    ctx.fillStyle = "#020617";
    ctx.beginPath(); ctx.arc(570, 360, 22, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(670, 380, 22, 0, Math.PI * 2); ctx.fill();
    ctx.fillRect(555, 385, 30, 60);
    ctx.fillRect(655, 405, 30, 60);
  }

  // 6. Professional StudioBinder Metadata Slate Bar
  ctx.fillStyle = "rgba(3, 7, 5, 0.92)";
  ctx.fillRect(40, 610, 1200, 80);
  ctx.strokeStyle = isColor ? "#10b981" : "#475569";
  ctx.lineWidth = 1.5;
  ctx.strokeRect(40, 610, 1200, 80);

  ctx.fillStyle = isColor ? "#34d399" : "#f1f5f9";
  ctx.font = "bold 24px monospace";
  ctx.fillText(shotNumber, 70, 658);

  ctx.fillStyle = "#94a3b8";
  ctx.font = "16px sans-serif";
  const desc = isWide ? "WIDE MASTER (WMS) - StudioBinder Charcoal & Ink Sketch" : "CLOSE-UP (MCU) - Dynamic Comic Storyboard Panel";
  ctx.fillText(desc, 230, 657);

  return canvas.toDataURL("image/png");
}

export default function StoryboardPage() {
  const [filterScene, setFilterScene] = useState("ALL");
  const [artStyle, setArtStyle] = useState<"sketch_bw" | "graphic_novel">("sketch_bw");
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);
  const [shots, setShots] = useState<StoryboardShot[]>([]);
  const [sceneList, setSceneList] = useState<{ id: string; slugline: string }[]>([]);

  const handleReloadFrame = (shot: StoryboardShot) => {
    setShots(prev => prev.map(s => s.id === shot.id ? { ...s, isGenerating: true } : s));

    setTimeout(() => {
      const isWide = shot.id.endsWith("-A");
      const cleanDrawing = generateStudioBinderFrame(shot.shotNumber, shot.sceneSlug, isWide, artStyle);
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

              const imgA = generateStudioBinderFrame(shotNumA, scene.slugline, true, artStyle);
              const imgB = generateStudioBinderFrame(shotNumB, scene.slugline, false, artStyle);

              newShots.push({
                id: `shot-${scene.id}-A`,
                sceneId: scene.id,
                shotNumber: shotNumA,
                sceneSlug: scene.slugline,
                shotType: "Wide Master Framing (WMS)",
                lens: "28mm Anamorphic T2.0",
                cameraMovement: "Slow Push-In Tracking",
                displayTitle: `${scene.id}: Wide Establishing Master`,
                actionSubject: `StudioBinder Ink & Charcoal Sketch: Widescreen framing of ${scene.slugline}, architectural depth & lighting.`,
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
                actionSubject: `StudioBinder Hand-Drawn Sketch: Focused character action, facial expression and props in ${scene.slugline}.`,
                isGenerating: isTarget,
                imageUrl: isTarget ? imgB : ""
              });
            });

            setShots(newShots);
            setFilterScene(activeFilter);

            setTimeout(() => {
              setShots(prev => prev.map(s => ({ ...s, isGenerating: false })));
            }, 450);
          }
        } catch { }
      }
    }
  }, [artStyle]);

  const handleGenerateAll = () => {
    setIsGeneratingAll(true);
    setShots(prev => prev.map(s => ({ ...s, isGenerating: true })));

    setTimeout(() => {
      setShots(prev => prev.map(s => {
        const isWide = s.id.endsWith("-A");
        const drawing = generateStudioBinderFrame(s.shotNumber, s.sceneSlug, isWide, artStyle);
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
            <Sparkles className="w-3.5 h-3.5" /> StudioBinder Film Storyboard Studio
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Cinematic Storyboard Studio
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            StudioBinder Hand-Drawn Ink & Charcoal Shading ආකෘතියෙන් සෑම දර්ශනයකටම ගැළපෙන Storyboard Frames.
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

      {/* Filter Bar with Art Style Switcher */}
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

        {/* Art Style Toggle */}
        <div className="flex items-center gap-2 bg-[#050b07] p-1 rounded-xl border border-emerald-950">
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
            Graphic Novel (Noir)
          </button>
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
                  {artStyle === "sketch_bw" ? "StudioBinder Sketch" : "Graphic Novel Noir"}
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