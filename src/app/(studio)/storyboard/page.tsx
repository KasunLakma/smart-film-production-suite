"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  SlidersHorizontal,
  Video,
  RefreshCw,
  Loader2,
  Wand2,
  FileText
} from "lucide-react";

interface StoryboardShot {
  id: string;
  sceneId: string;
  shotNumber: string;
  sceneSlug: string;
  shotType: string;
  lens: string;
  cameraMovement: string;
  visualPrompt: string;
  imageUrl?: string;
  isGenerating?: boolean;
}

// සිනමාත්මක සැබෑ Cinematic Visuals එකතුව
const CINEMATIC_VISUAL_PRESETS: Record<string, string[]> = {
  "SCENE-01": [
    "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=1200&q=80", // Cyber dark room
    "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80"  // Tech terminal
  ],
  "SCENE-02": [
    "https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=1200&q=80", // Wet neon rainy street
    "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1200&q=80"  // Surveillance look
  ],
  "SCENE-03": [
    "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1200&q=80", // Control room / servers
    "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80"  // Hard drive / glowing lights
  ],
  "SCENE-04": [
    "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=1200&q=80", // Foggy docks container yard
    "https://images.unsplash.com/photo-1494412574643-ff11b0a5c1c3?auto=format&fit=crop&w=1200&q=80"  // Harbor boat dawn
  ]
};

export default function StoryboardPage() {
  const [filterScene, setFilterScene] = useState("ALL");
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);
  const [shots, setShots] = useState<StoryboardShot[]>([]);
  const [sceneList, setSceneList] = useState<{ id: string; slugline: string }[]>([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedScenes = localStorage.getItem("active_screenplay_scenes");
      const activeFilter = localStorage.getItem("storyboard_filter") || "ALL";

      if (storedScenes) {
        try {
          const parsed = JSON.parse(storedScenes);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setSceneList(parsed.map(s => ({ id: s.id, slugline: s.slugline })));

            // Generate initial shot structures
            const generatedShots: StoryboardShot[] = [];

            parsed.forEach((scene, scnIdx) => {
              const isTargetScene = activeFilter === "ALL" || activeFilter === scene.id;

              // Shot A
              generatedShots.push({
                id: `shot-${scene.id}-A`,
                sceneId: scene.id,
                shotNumber: `SHOT ${String(scnIdx + 1).padStart(2, "0")}A`,
                sceneSlug: scene.slugline,
                shotType: "Wide Master Framing (WMS)",
                lens: "24mm Anamorphic T2.0",
                cameraMovement: "Slow Push-In Tracking",
                visualPrompt: `${scene.synopsis.slice(0, 100)}... පසුතල උපකරණ: ${scene.props.join(", ") || "ස්වාභාවික සැකසුම"}`,
                // Target scene එක පමණක් generate වීම simulate කරයි
                isGenerating: isTargetScene,
                imageUrl: ""
              });

              // Shot B
              generatedShots.push({
                id: `shot-${scene.id}-B`,
                sceneId: scene.id,
                shotNumber: `SHOT ${String(scnIdx + 1).padStart(2, "0")}B`,
                sceneSlug: scene.slugline,
                shotType: "Medium Close Action (MCU)",
                lens: "50mm Prime T1.5",
                cameraMovement: "Static Eye-level",
                visualPrompt: `චරිත කෙරෙහි අවධානය: ${scene.characters.join(" & ") || "ප්‍රධාන චරිත"}`,
                isGenerating: isTargetScene,
                imageUrl: ""
              });
            });

            setShots(generatedShots);
            setFilterScene(activeFilter);

            // Simulation: තෝරාගත් target scene එකේ shots ටික පමණක් තත්පර 1.2 කින් render වී Image එක වැටීම
            setTimeout(() => {
              setShots(prev => prev.map(shot => {
                const isTarget = activeFilter === "ALL" || activeFilter === shot.sceneId;
                if (isTarget) {
                  const presets = CINEMATIC_VISUAL_PRESETS[shot.sceneId] || [
                    "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1200&q=80",
                    "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1200&q=80"
                  ];
                  const img = shot.id.endsWith("-A") ? presets[0] : presets[1];

                  return {
                    ...shot,
                    isGenerating: false,
                    imageUrl: img
                  };
                }
                return { ...shot, isGenerating: false };
              }));
            }, 1200);
          }
        } catch {
          // fallback
        }
      }
    }
  }, []);

  // Single Frame On-Demand Generation
  const handleGenerateFrame = (shotId: string) => {
    setShots(prev => prev.map(s => s.id === shotId ? { ...s, isGenerating: true } : s));

    setTimeout(() => {
      setShots(prev => prev.map(s => {
        if (s.id === shotId) {
          const presets = CINEMATIC_VISUAL_PRESETS[s.sceneId] || [
            "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=1200&q=80"
          ];
          const img = s.id.endsWith("-A") ? presets[0] : presets[1];
          return {
            ...s,
            isGenerating: false,
            imageUrl: img
          };
        }
        return s;
      }));
    }, 1200);
  };

  // Generate All Scenes
  const handleGenerateAll = () => {
    setIsGeneratingAll(true);
    setShots(prev => prev.map(s => ({ ...s, isGenerating: true })));

    setTimeout(() => {
      setShots(prev => prev.map(s => {
        const presets = CINEMATIC_VISUAL_PRESETS[s.sceneId] || [
          "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?auto=format&fit=crop&w=1200&q=80",
          "https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=1200&q=80"
        ];
        return {
          ...s,
          isGenerating: false,
          imageUrl: s.id.endsWith("-A") ? presets[0] : presets[1]
        };
      }));
      setIsGeneratingAll(false);
    }, 1500);
  };

  const filteredShots = filterScene === "ALL"
    ? shots
    : shots.filter(s => s.sceneId === filterScene);

  return (
    <div className="space-y-8 p-6 md:p-8 max-w-7xl mx-auto text-slate-100">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-emerald-950/60">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" /> AI Visual Shot Sequencing
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            16:9 Cinematic Storyboard
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Breakdown එකෙන් තෝරාගත් දර්ශන සඳහා පමණක් 16:9 සිනමාත්මක visuals නිවැරදිව මෙහි Generate වේ.
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
                <Loader2 className="w-4 h-4 animate-spin" /> Synthesizing All Sequences...
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4" /> Generate All Frames
              </>
            )}
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-[#09130e] border border-emerald-950/70">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5 mr-1">
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
            16:9 Cinema Scope
          </span>
          <span className="text-slate-500">•</span>
          <span>FLUX Visual Pipeline</span>
        </div>
      </div>

      {/* 16:9 Shots Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredShots.map((shot) => (
          <div
            key={shot.id}
            className="group rounded-2xl bg-[#09130e] border border-emerald-950/70 hover:border-emerald-500/40 transition-all overflow-hidden flex flex-col shadow-lg"
          >
            {/* 16:9 Visual Container */}
            <div className="relative aspect-video w-full bg-[#050a07] overflow-hidden border-b border-emerald-950/60 flex items-center justify-center">
              {shot.isGenerating ? (
                <div className="w-full h-full flex flex-col items-center justify-center bg-[#07130c] text-emerald-400 space-y-2">
                  <Loader2 className="w-8 h-8 animate-spin" />
                  <span className="text-xs font-medium tracking-wide">Synthesizing 16:9 Shot Frame...</span>
                </div>
              ) : shot.imageUrl ? (
                <>
                  <img
                    src={shot.imageUrl}
                    alt={shot.shotNumber}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 brightness-90 contrast-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-end p-3">
                    <button
                      onClick={() => handleGenerateFrame(shot.id)}
                      className="px-2.5 py-1 rounded-lg bg-black/80 hover:bg-emerald-500 hover:text-slate-950 text-white text-[11px] font-semibold flex items-center gap-1.5 transition-all border border-emerald-500/30 cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" /> Regenerate
                    </button>
                  </div>
                </>
              ) : (
                <div className="w-full h-full p-4 flex flex-col items-center justify-center text-center bg-[#060c08] border border-dashed border-emerald-950/80 rounded-t-2xl">
                  <Video className="w-8 h-8 text-slate-600 mb-2" />
                  <p className="text-xs text-slate-400 mb-3 font-medium">Frame not synthesized yet</p>
                  <button
                    onClick={() => handleGenerateFrame(shot.id)}
                    className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Wand2 className="w-3.5 h-3.5" /> Generate Frame
                  </button>
                </div>
              )}

              {/* Badges */}
              <div className="absolute top-3 left-3 flex items-center gap-2 pointer-events-none">
                <span className="px-2 py-0.5 rounded bg-slate-950/80 backdrop-blur-md border border-emerald-500/30 text-emerald-300 text-[11px] font-bold font-mono">
                  {shot.shotNumber}
                </span>
              </div>

              <div className="absolute bottom-2 right-2 pointer-events-none">
                <span className="px-2 py-0.5 rounded bg-black/75 backdrop-blur-sm text-[10px] font-mono text-slate-300">
                  16:9 DCI
                </span>
              </div>
            </div>

            {/* Details */}
            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div>
                <p className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider mb-1 truncate">
                  {shot.sceneSlug}
                </p>
                <h3 className="text-sm font-bold text-white mb-2">
                  {shot.shotType}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed font-light line-clamp-3">
                  "{shot.visualPrompt}"
                </p>
              </div>

              {/* Optics */}
              <div className="pt-3 border-t border-emerald-950/60 grid grid-cols-2 gap-2 text-[11px]">
                <div className="bg-[#0e1d15] p-2 rounded-lg border border-emerald-950/80">
                  <span className="text-slate-500 block text-[10px] uppercase">Optics / Lens</span>
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