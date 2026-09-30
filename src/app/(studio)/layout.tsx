"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Film,
  Sparkles,
  Camera,
  Layers,
  Plus,
  ArrowRight,
  Eye,
  SlidersHorizontal,
  CheckCircle2,
  Video
} from "lucide-react";

interface StoryboardShot {
  id: string;
  shotNumber: string;
  sceneSlug: string;
  shotType: string;
  lens: string;
  cameraMovement: string;
  visualPrompt: string;
  imageUrl?: string;
}

export default function StoryboardPage() {
  const [filterScene, setFilterScene] = useState("ALL");

  const shots: StoryboardShot[] = [
    {
      id: "shot-1",
      shotNumber: "SHOT 01A",
      sceneSlug: "SCENE 01: CYBERNETIC ARCHIVE",
      shotType: "Extreme Wide Shot (EWS)",
      lens: "24mm Anamorphic T2.0",
      cameraMovement: "Slow Push-In Dolly",
      visualPrompt: "Holographic projections flicker against cold obsidian walls. Low-angle dolly tracking along high metallic catwalk.",
      imageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80"
    },
    {
      id: "shot-2",
      shotNumber: "SHOT 01B",
      sceneSlug: "SCENE 01: CYBERNETIC ARCHIVE",
      shotType: "Medium Close-Up (MCU)",
      lens: "50mm Prime T1.5",
      cameraMovement: "Static Eye-Level",
      visualPrompt: "Elena's tactical goggles reflect pulsing cyan terminal code. Tight dialogue facial framing with shallow depth of field.",
      imageUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80"
    },
    {
      id: "shot-3",
      shotNumber: "SHOT 01C",
      sceneSlug: "SCENE 01: CYBERNETIC ARCHIVE",
      shotType: "Over-the-Shoulder (OTS)",
      lens: "85mm Portrait Prime",
      cameraMovement: "Handheld Subtle Shake",
      visualPrompt: "Marcus emerges from server rack shadows holding a heavy wrench. Over-the-shoulder perspective focusing on Elena's vest.",
      imageUrl: "https://images.unsplash.com/photo-1511447333015-45b65e60f6d5?auto=format&fit=crop&w=800&q=80"
    },
    {
      id: "shot-4",
      shotNumber: "SHOT 02A",
      sceneSlug: "SCENE 02: NEON MARKETPLACE",
      shotType: "High Angle Wide",
      lens: "35mm Cine Lens",
      cameraMovement: "Crane Downward Boom",
      visualPrompt: "Rain-slicked cyberpunk marketplace drenched in neon hues. Kai navigates through synthetic crowds carrying locked briefcase.",
      imageUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80"
    },
    {
      id: "shot-5",
      shotNumber: "SHOT 02B",
      sceneSlug: "SCENE 02: NEON MARKETPLACE",
      shotType: "Macro Insert Shot",
      lens: "100mm Macro Cine",
      cameraMovement: "Static Focus Rack",
      visualPrompt: "Biometric keypad on locked briefcase flashes active red encryption alert as rainwater pools on dark titanium casing.",
      imageUrl: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=800&q=80"
    },
    {
      id: "shot-6",
      shotNumber: "SHOT 02C",
      sceneSlug: "SCENE 02: NEON MARKETPLACE",
      shotType: "Dutch Tilt Tracking",
      lens: "28mm Ultra-Wide",
      cameraMovement: "Lateral Steadicam Follow",
      visualPrompt: "Low-angle side tracking following Kai's combat boots splashing through puddle reflections beneath holographic signage.",
      imageUrl: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80"
    }
  ];

  return (
    <div className="space-y-8 p-6 md:p-8 max-w-7xl mx-auto text-slate-100">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-emerald-950/60">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" /> Visual Shot Sequencing
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            16:9 Cinematic Storyboard
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Pre-visualize camera framing, lens specs, and director blocking for every breakdown scene.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/financials"
            className="px-4 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-semibold transition-all flex items-center gap-1.5"
          >
            Review Budget <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Control Bar: Scene Selector & Aspect Ratio Info */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-[#09130e] border border-emerald-950/70">
        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5">
            <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-400" /> Filter:
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
        </div>

        <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
          <span className="px-2.5 py-1 rounded bg-[#0e1d15] border border-emerald-500/20 text-emerald-400 font-mono">
            16:9 DCI Flat (1.78:1)
          </span>
          <span className="text-slate-500">•</span>
          <span>4K UHD Ready</span>
        </div>
      </div>

      {/* 16:9 Storyboard Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {shots.map((shot) => (
          <div
            key={shot.id}
            className="group rounded-2xl bg-[#09130e] border border-emerald-950/70 hover:border-emerald-500/40 transition-all overflow-hidden flex flex-col shadow-lg"
          >
            {/* 16:9 Aspect Ratio Frame Container */}
            <div className="relative aspect-video w-full bg-[#050a07] overflow-hidden border-b border-emerald-950/60">
              {shot.imageUrl ? (
                <img
                  src={shot.imageUrl}
                  alt={shot.shotNumber}
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 brightness-90 contrast-110"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-600">
                  <Video className="w-8 h-8 mb-2" />
                  <span className="text-xs">No frame generated</span>
                </div>
              )}

              {/* Shot Tag Badges */}
              <div className="absolute top-3 left-3 flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-slate-950/80 backdrop-blur-md border border-emerald-500/30 text-emerald-300 text-[11px] font-bold font-mono">
                  {shot.shotNumber}
                </span>
              </div>

              <div className="absolute bottom-2 right-2">
                <span className="px-2 py-0.5 rounded bg-black/75 backdrop-blur-sm text-[10px] font-mono text-slate-300">
                  16:9 Frame
                </span>
              </div>
            </div>

            {/* Shot Details Content */}
            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div>
                <p className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider mb-1">
                  {shot.sceneSlug}
                </p>
                <h3 className="text-sm font-bold text-white mb-2">
                  {shot.shotType}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed font-light line-clamp-3">
                  "{shot.visualPrompt}"
                </p>
              </div>

              {/* Technical Optics Details */}
              <div className="pt-3 border-t border-emerald-950/60 grid grid-cols-2 gap-2 text-[11px]">
                <div className="bg-[#0e1d15] p-2 rounded-lg border border-emerald-950/80">
                  <span className="text-slate-500 block text-[10px] uppercase">Optics / Lens</span>
                  <span className="text-slate-200 font-medium">{shot.lens}</span>
                </div>
                <div className="bg-[#0e1d15] p-2 rounded-lg border border-emerald-950/80">
                  <span className="text-slate-500 block text-[10px] uppercase">Camera Movement</span>
                  <span className="text-slate-200 font-medium">{shot.cameraMovement}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}