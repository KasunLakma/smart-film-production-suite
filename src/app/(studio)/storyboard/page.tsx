"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
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
  englishPrompt: string;
  imageUrl?: string;
  isGenerating?: boolean;
}

// දර්ශනයේ සාරාංශය සහ විස්තරය අනුව ගැළපෙන Cinematic English Prompt එකක් සෑදීම
const generateCinematicPrompt = (scene: any, isWide: boolean): string => {
  const fullText = `${scene.slugline || ""} ${scene.synopsis || ""}`.toLowerCase();

  const isNight = /night|රාත්‍රී|රෑ|dark|අඳුරු/.test(fullText);
  const timeDesc = isNight ? "night time, dramatic cinematic lighting, neon and rim lights" : "daylight, atmospheric natural film lighting";

  let environment = "cinematic film scene inside high tech underground laboratory, glowing monitors, server racks";
  if (/වරාය|port|harbor|dock|street|පාර/.test(fullText)) {
    environment = "cinematic rainy harbor dock street, shipping containers, wet asphalt reflections, parked dark vehicle";
  } else if (/පාලක|control|command|server/.test(fullText)) {
    environment = "dark technical control room, emergency red lights flashing, computer mainframe consoles";
  }

  const characters = scene.characters && scene.characters.length > 0
    ? scene.characters.join(", ")
    : "Sri Lankan young Asian male operative";

  const props = scene.props && scene.props.length > 0
    ? `holding ${scene.props.slice(0, 2).join(" and ")}`
    : "tactical equipment";

  if (isWide) {
    return `cinematic film still, 16:9 widescreen, master establishing wide shot of ${environment}, ${timeDesc}, ${characters} in distance, 35mm film photography, 8k resolution, photorealistic masterpiece, directed by Denis Villeneuve`;
  } else {
    return `cinematic film still, 16:9 widescreen, intense medium close up of ${characters}, ${props}, emotional tension, cinematic shallow depth of field, ${timeDesc}, Arri Alexa LF footage, highly detailed`;
  }
};

const getAiImageUrl = (prompt: string, seed: number) => {
  const encoded = encodeURIComponent(prompt);
  return `https://image.pollinations.ai/prompt/${encoded}?width=1280&height=720&model=flux&nologo=true&seed=${seed}`;
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

            const newShots: StoryboardShot[] = [];

            parsed.forEach((scene, index) => {
              const isTarget = activeFilter === "ALL" || activeFilter === scene.id;
              const widePrompt = generateCinematicPrompt(scene, true);
              const closePrompt = generateCinematicPrompt(scene, false);

              newShots.push({
                id: `shot-${scene.id}-A`,
                sceneId: scene.id,
                shotNumber: `SHOT ${String(index + 1).padStart(2, "0")}A`,
                sceneSlug: scene.slugline,
                shotType: "Wide Master Shot (WMS)",
                lens: "28mm Anamorphic T2.0",
                cameraMovement: "Slow Push-In Tracking",
                visualPrompt: `${scene.slugline} - පසුතලය සහ ආලෝක සැකැස්ම`,
                englishPrompt: widePrompt,
                isGenerating: isTarget,
                imageUrl: ""
              });

              newShots.push({
                id: `shot-${scene.id}-B`,
                sceneId: scene.id,
                shotNumber: `SHOT ${String(index + 1).padStart(2, "0")}B`,
                sceneSlug: scene.slugline,
                shotType: "Medium Close Action (MCU)",
                lens: "50mm Prime T1.5",
                cameraMovement: "Static Eye-Level",
                visualPrompt: `ක්‍රියාදාමය සහ චරිත ආවේගය`,
                englishPrompt: closePrompt,
                isGenerating: isTarget,
                imageUrl: ""
              });
            });

            setShots(newShots);
            setFilterScene(activeFilter);

            // ඉල්ලූ Scene එකට අදාළ සිනමාත්මක රූප Load කිරීම
            setTimeout(() => {
              setShots(prev => prev.map((shot, idx) => {
                const isTarget = activeFilter === "ALL" || activeFilter === shot.sceneId;
                if (isTarget) {
                  return {
                    ...shot,
                    isGenerating: false,
                    imageUrl: getAiImageUrl(shot.englishPrompt, 100 + idx * 77)
                  };
                }
                return { ...shot, isGenerating: false };
              }));
            }, 600);
          }
        } catch { }
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
            imageUrl: getAiImageUrl(s.englishPrompt, Math.floor(Math.random() * 99999))
          };
        }
        return s;
      }));
    }, 1200);
  };

  const handleGenerateAll = () => {
    setIsGeneratingAll(true);
    setShots(prev => prev.map(s => ({ ...s, isGenerating: true })));

    setTimeout(() => {
      setShots(prev => prev.map((s, idx) => ({
        ...s,
        isGenerating: false,
        imageUrl: getAiImageUrl(s.englishPrompt, 500 + idx * 33)
      })));
      setIsGeneratingAll(false);
    }, 1800);
  };

  const filteredShots = filterScene === "ALL"
    ? shots
    : shots.filter(s => s.sceneId === filterScene);

  return (
    <div className="space-y-8 p-6 md:p-8 max-w-7xl mx-auto text-slate-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-emerald-950/60">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" /> 16:9 Cinematic Shot Generator
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Production Storyboard Visualizer
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            දර්ශනයේ විස්තරය මත AI මඟින් ජනනය කළ සැබෑ සිනමාත්මක 16:9 Shot Frames.
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
                <Loader2 className="w-4 h-4 animate-spin" /> Rendering All Shots...
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4" /> Generate All Frames
              </>
            )}
          </button>
        </div>
      </div>

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
            16:9 DCI Scope
          </span>
          <span className="text-slate-500">•</span>
          <span>FLUX Cinematic Render</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredShots.map((shot) => (
          <div
            key={shot.id}
            className="group rounded-2xl bg-[#09130e] border border-emerald-950/70 hover:border-emerald-500/40 transition-all overflow-hidden flex flex-col shadow-lg"
          >
            <div className="relative aspect-video w-full bg-[#050a07] overflow-hidden border-b border-emerald-950/60 flex items-center justify-center">
              {shot.isGenerating ? (
                <div className="w-full h-full flex flex-col items-center justify-center bg-[#07130c] text-emerald-400 space-y-2">
                  <Loader2 className="w-8 h-8 animate-spin" />
                  <span className="text-xs font-medium tracking-wide">Rendering Cinematic Shot with AI...</span>
                </div>
              ) : shot.imageUrl ? (
                <>
                  <img
                    src={shot.imageUrl}
                    alt={shot.shotNumber}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 brightness-95 contrast-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-end p-3">
                    <button
                      onClick={() => handleGenerateFrame(shot.id)}
                      className="px-2.5 py-1 rounded-lg bg-black/80 hover:bg-emerald-500 hover:text-slate-950 text-white text-[11px] font-semibold flex items-center gap-1.5 transition-all border border-emerald-500/30 cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" /> Re-render Frame
                    </button>
                  </div>
                </>
              ) : (
                <div className="w-full h-full p-4 flex flex-col items-center justify-center text-center bg-[#060c08] border border-dashed border-emerald-950/80 rounded-t-2xl">
                  <Video className="w-8 h-8 text-slate-600 mb-2" />
                  <p className="text-xs text-slate-400 mb-3 font-medium">Shot not rendered yet</p>
                  <button
                    onClick={() => handleGenerateFrame(shot.id)}
                    className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Wand2 className="w-3.5 h-3.5" /> Generate Shot
                  </button>
                </div>
              )}

              <div className="absolute top-3 left-3 flex items-center gap-2 pointer-events-none">
                <span className="px-2 py-0.5 rounded bg-slate-950/90 backdrop-blur-md border border-white/20 text-white text-[11px] font-bold font-mono">
                  {shot.shotNumber}
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
                  "{shot.englishPrompt}"
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