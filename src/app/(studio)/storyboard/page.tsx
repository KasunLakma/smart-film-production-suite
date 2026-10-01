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

const DEFAULT_SHOTS: StoryboardShot[] = [
  {
    id: "shot-1",
    sceneId: "SCENE-01",
    shotNumber: "SHOT 01A",
    sceneSlug: "SCENE 01: INT. පැරණි තාක්ෂණ විද්‍යාගාරය - NIGHT",
    shotType: "Extreme Wide Shot (EWS)",
    lens: "24mm Anamorphic T2.0",
    cameraMovement: "Slow Push-In Dolly",
    visualPrompt: "අඳුරු විද්‍යාගාරය තුළ හෝලෝග්‍රැෆික් තිර නිල් සහ කොළ එළියෙන් දැල්වෙයි. කසුන් මේසය අසල සිටී.",
    imageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "shot-2",
    sceneId: "SCENE-01",
    shotNumber: "SHOT 01B",
    sceneSlug: "SCENE 01: INT. පැරණි තාක්ෂණ විද්‍යාගාරය - NIGHT",
    shotType: "Medium Close-Up (MCU)",
    lens: "50mm Prime T1.5",
    cameraMovement: "Static Eye-Level",
    visualPrompt: "කසුන් කුඩා විදුලි පන්දමක් සහ ඩිජිටල් ස්කෑනරය අතැතිව දත්ත පරීක්ෂා කරයි.",
    imageUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "shot-3",
    sceneId: "SCENE-02",
    shotNumber: "SHOT 02A",
    sceneSlug: "SCENE 02: EXT. වරාය පිවිසුම් මාර්ගය - CONTINUOUS",
    shotType: "High Angle Wide",
    lens: "35mm Cine Lens",
    cameraMovement: "Crane Downward Boom",
    visualPrompt: "ධාරානිපාත වැසි මැද කළු පැහැති වැන් රථයක් වරාය පිවිසුම අසල නවතා ඇත.",
    imageUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80"
  }
];

export default function StoryboardPage() {
  const [filterScene, setFilterScene] = useState("ALL");
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);
  const [shots, setShots] = useState<StoryboardShot[]>(DEFAULT_SHOTS);
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

            const generatedShots: StoryboardShot[] = [];
            const sampleImages = [
              "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80",
              "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80",
              "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80",
              "https://images.unsplash.com/photo-1511447333015-45b65e60f6d5?auto=format&fit=crop&w=800&q=80",
              "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80"
            ];

            parsed.forEach((scene, scnIdx) => {
              generatedShots.push({
                id: `shot-${scene.id}-A`,
                sceneId: scene.id,
                shotNumber: `SHOT ${String(scnIdx + 1).padStart(2, "0")}A`,
                sceneSlug: scene.slugline,
                shotType: "Wide Master Framing (WMS)",
                lens: "28mm Anamorphic",
                cameraMovement: "Slow Push-In Tracking",
                visualPrompt: `${scene.synopsis.slice(0, 120)}... Props: ${scene.props.join(", ") || "Set dressing"}`,
                imageUrl: sampleImages[scnIdx % sampleImages.length]
              });

              generatedShots.push({
                id: `shot-${scene.id}-B`,
                sceneId: scene.id,
                shotNumber: `SHOT ${String(scnIdx + 1).padStart(2, "0")}B`,
                sceneSlug: scene.slugline,
                shotType: "Medium Close Action (MCU)",
                lens: "50mm Prime T1.8",
                cameraMovement: "Handheld Eye-level",
                visualPrompt: `Focus on ${scene.characters.join(" & ") || "Lead characters"} during intense sequence.`,
                imageUrl: scnIdx === 0 ? sampleImages[1] : ""
              });
            });

            setShots(generatedShots);
            setFilterScene(activeFilter);
          }
        } catch {
          // fallback
        }
      }
    }
  }, []);

  const handleGenerateFrame = (shotId: string) => {
    setShots(prev => prev.map(s => s.id === shotId ? { ...s, isGenerating: true } : s));

    setTimeout(() => {
      setShots(prev => prev.map(s => {
        if (s.id === shotId) {
          return {
            ...s,
            isGenerating: false,
            imageUrl: "https://images.unsplash.com/photo-1511447333015-45b65e60f6d5?auto=format&fit=crop&w=800&q=80"
          };
        }
        return s;
      }));
    }, 1200);
  };

  const handleGenerateAll = () => {
    setIsGeneratingAll(true);
    setTimeout(() => {
      setShots(prev => prev.map(s => ({
        ...s,
        imageUrl: s.imageUrl || "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80"
      })));
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
            Breakdown එකෙන් ලබාගත් Scenes සඳහා 16:9 cinematic storyboard visuals පිළිවෙළට මෙහි පෙළගස්වයි.
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
            disabled={isGeneratingAll}
            className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2 cursor-pointer"
          >
            {isGeneratingAll ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Synthesizing All Frames...
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4" /> Generate All Frames
              </>
            )}
          </button>
        </div>
      </div>

      {/* Control Bar: Scene Selector */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-[#09130e] border border-emerald-950/70">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium text-slate-400 flex items-center gap-1.5 mr-1">
            <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-400" /> Scene Filter:
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
            16:9 DCI Flat (1.78:1)
          </span>
          <span className="text-slate-500">•</span>
          <span>FLUX Visual Pipeline</span>
        </div>
      </div>

      {/* 16:9 Storyboard Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredShots.map((shot) => (
          <div
            key={shot.id}
            className="group rounded-2xl bg-[#09130e] border border-emerald-950/70 hover:border-emerald-500/40 transition-all overflow-hidden flex flex-col shadow-lg"
          >
            <div className="relative aspect-video w-full bg-[#050a07] overflow-hidden border-b border-emerald-950/60 flex items-center justify-center">
              {shot.isGenerating ? (
                <div className="w-full h-full flex flex-col items-center justify-center bg-[#07130c] text-emerald-400 space-y-2">
                  <Loader2 className="w-8 h-8 animate-spin" />
                  <span className="text-xs font-medium tracking-wide">Synthesizing 16:9 Frame...</span>
                </div>
              ) : shot.imageUrl ? (
                <>
                  <img
                    src={shot.imageUrl}
                    alt={shot.shotNumber}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 brightness-90 contrast-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-end p-3">
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
                  <p className="text-xs text-slate-400 mb-3 font-medium">No visual generated for this shot</p>
                  <button
                    onClick={() => handleGenerateFrame(shot.id)}
                    className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Wand2 className="w-3.5 h-3.5" /> Generate Frame
                  </button>
                </div>
              )}

              <div className="absolute top-3 left-3 flex items-center gap-2 pointer-events-none">
                <span className="px-2 py-0.5 rounded bg-slate-950/80 backdrop-blur-md border border-emerald-500/30 text-emerald-300 text-[11px] font-bold font-mono">
                  {shot.shotNumber}
                </span>
              </div>

              <div className="absolute bottom-2 right-2 pointer-events-none">
                <span className="px-2 py-0.5 rounded bg-black/75 backdrop-blur-sm text-[10px] font-mono text-slate-300">
                  16:9 Frame
                </span>
              </div>
            </div>

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