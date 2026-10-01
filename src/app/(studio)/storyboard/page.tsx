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
  Palette,
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
  synopsis: string;
  characters: string[];
  props: string[];
  englishActionPrompt: string;
  imageUrl?: string;
  isGenerating?: boolean;
}

// ඕනෑම පිටපතක (සිංහල හෝ ඉංග්‍රීසි) ඕනෑම Scene එකක් කියවා Dynamic Storyboard Prompt එකක් සෑදීමේ Engine එක
function buildDynamicStoryboardPrompt(
  scene: any,
  isWide: boolean,
  artStyle: "comic_color" | "sketch_bw"
): string {
  const fullText = `${scene.slugline || ""} ${scene.synopsis || ""}`.toLowerCase();

  // 1. පරිසරය හඳුනාගැනීම (Environment Extraction)
  let environment = "cinematic interior location, atmospheric architectural details";
  if (/විද්‍යාගාර|lab|research|computer|තාක්ෂණ/.test(fullText)) {
    environment = "underground cybernetics laboratory, glowing computer terminal screens, holographic devices";
  } else if (/වරාය|port|harbor|dock|බෝට්ටු|නැව/.test(fullText)) {
    environment = "coastal harbor shipping yard, massive stacked freight containers, wet asphalt ground";
  } else if (/පාර|street|road|alley|මාර්ග/.test(fullText)) {
    environment = "urban city street, neon reflections on tarmac, misty alleyway";
  } else if (/කාමර|room|house|නිවස|ගෙදර/.test(fullText)) {
    environment = "dimly lit interior room, rustic dramatic shadows, moody window light";
  } else if (/කැල|forest|jungle|ගස්/.test(fullText)) {
    environment = "dense mystical forest, tall mossy trees, atmospheric foggy woodland path";
  } else if (/පාලක|control|office|කාර්යාල/.test(fullText)) {
    environment = "tactical operations control command room, glowing mainframe consoles";
  }

  // 2. කාලය සහ ආලෝකය (Lighting & Time of Day)
  const isNight = /night|රාත්‍රී|රෑ|dark|අඳුරු/.test(fullText);
  const isDawn = /dawn|morning|අලුයම|උදෑසන/.test(fullText);
  let lighting = "cinematic dramatic lighting with deep shadows";
  if (isNight) lighting = "dark nighttime atmosphere, high contrast noir chiaroscuro shadows, edge lighting";
  else if (isDawn) lighting = "early dawn morning fog, soft diffused mist, atmospheric rim lighting";

  // 3. චරිත සහ භාණ්ඩ (Characters & Props Action)
  const charDesc = scene.characters && scene.characters.length > 0
    ? `cinematic film characters (${scene.characters.join(", ")})`
    : "tactical film operative";

  const propDesc = scene.props && scene.props.length > 0
    ? `interacting with ${scene.props.slice(0, 2).join(", ")}`
    : "taking decisive action";

  // 4. Shot Composition
  const shotFraming = isWide
    ? `dynamic wide establishing shot of ${environment}, ${lighting}, ${charDesc} in background, rule of thirds, deep focal depth`
    : `intense medium close-up shot, sharp focus on ${charDesc}, ${propDesc}, expressive emotional face, ${environment} soft blurred in background`;

  // 5. Art Style Triggers (StudioBinder Sketch හෝ Graphic Novel Comic Art)
  if (artStyle === "comic_color") {
    return `graphic novel comic book illustration, dynamic comic panel, ${shotFraming}, bold black ink linework, vibrant cel shaded colors, GTA graphic novel comic style, dramatic comic layout, clean comic art, no realistic photo, no blur, no text`;
  } else {
    return `black and white film storyboard drawing, studiobinder ink sketch, dynamic comic storyboard frame, ${shotFraming}, detailed pencil linework, crosshatching shading, cinematic concept sketch, film storyboard panel, no realistic photo, no color, no watermark`;
  }
}

export default function StoryboardPage() {
  const [filterScene, setFilterScene] = useState("ALL");
  const [artStyle, setArtStyle] = useState<"comic_color" | "sketch_bw">("comic_color");
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);
  const [shots, setShots] = useState<StoryboardShot[]>([]);
  const [sceneList, setSceneList] = useState<{ id: string; slugline: string }[]>([]);

  const generateAiImageUrl = (prompt: string, seed: number) => {
    const encoded = encodeURIComponent(prompt);
    return `https://image.pollinations.ai/prompt/${encoded}?width=1024&height=576&model=flux&nologo=true&seed=${seed}`;
  };

  const reloadSingleShot = (shotId: string, promptText: string) => {
    setShots(prev => prev.map(s => s.id === shotId ? { ...s, isGenerating: true } : s));
    const randomSeed = Math.floor(Math.random() * 900000) + 100000;
    const freshUrl = generateAiImageUrl(promptText, randomSeed);

    setTimeout(() => {
      setShots(prev => prev.map(s => s.id === shotId ? {
        ...s,
        imageUrl: freshUrl,
        isGenerating: false
      } : s));
    }, 1500);
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

            // ඕනෑම script එකකින් එන ඕනෑම scene එකක් dynamic ලෙස කියවීම
            parsed.forEach((scene: any, index: number) => {
              const isTarget = activeFilter === "ALL" || activeFilter === scene.id;

              const widePrompt = buildDynamicStoryboardPrompt(scene, true, artStyle);
              const closePrompt = buildDynamicStoryboardPrompt(scene, false, artStyle);

              const seedA = 10000 + index * 200 + (artStyle === "comic_color" ? 1 : 2);
              const seedB = 50000 + index * 200 + (artStyle === "comic_color" ? 3 : 4);

              newShots.push({
                id: `shot-${scene.id}-A`,
                sceneId: scene.id,
                shotNumber: `SHOT ${String(index + 1).padStart(2, "0")}A`,
                sceneSlug: scene.slugline,
                shotType: "Wide Master Framing (WMS)",
                lens: "28mm Anamorphic T2.0",
                cameraMovement: "Slow Push-In Tracking",
                synopsis: scene.synopsis || "",
                characters: scene.characters || [],
                props: scene.props || [],
                englishActionPrompt: widePrompt,
                isGenerating: isTarget,
                imageUrl: isTarget ? generateAiImageUrl(widePrompt, seedA) : ""
              });

              newShots.push({
                id: `shot-${scene.id}-B`,
                sceneId: scene.id,
                shotNumber: `SHOT ${String(index + 1).padStart(2, "0")}B`,
                sceneSlug: scene.slugline,
                shotType: "Medium Close Action (MCU)",
                lens: "50mm Prime T1.5",
                cameraMovement: "Static Eye-Level",
                synopsis: scene.synopsis || "",
                characters: scene.characters || [],
                props: scene.props || [],
                englishActionPrompt: closePrompt,
                isGenerating: isTarget,
                imageUrl: isTarget ? generateAiImageUrl(closePrompt, seedB) : ""
              });
            });

            setShots(newShots);
            setFilterScene(activeFilter);

            setTimeout(() => {
              setShots(prev => prev.map(s => ({ ...s, isGenerating: false })));
            }, 1200);
          }
        } catch { }
      }
    }
  }, [artStyle]);

  const handleGenerateAll = () => {
    setIsGeneratingAll(true);
    setShots(prev => prev.map(s => ({ ...s, isGenerating: true })));

    shots.forEach((shot, idx) => {
      setTimeout(() => {
        reloadSingleShot(shot.id, shot.englishActionPrompt);
        if (idx === shots.length - 1) {
          setIsGeneratingAll(false);
        }
      }, idx * 800);
    });
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
            <Sparkles className="w-3.5 h-3.5" /> Universal Script Storyboard Engine
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Comic Storyboard Visualizer
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            ඕනෑම තිර පිටපතක දර්ශන විග්‍රහ කර සැබෑ Comic Panel & Sketch Storyboard visuals AI මඟින් ජනනය කරයි.
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

      {/* Control Bar: Scene Selector & Art Style Switcher */}
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
        <div className="flex items-center gap-2 bg-[#050b07] p-1 rounded-xl border border-emerald-950">
          <span className="text-xs text-slate-400 px-2 flex items-center gap-1">
            <Palette className="w-3.5 h-3.5 text-emerald-400" /> Style:
          </span>
          <button
            onClick={() => setArtStyle("comic_color")}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${artStyle === "comic_color"
                ? "bg-emerald-500 text-slate-950 shadow"
                : "text-slate-400 hover:text-white"
              }`}
          >
            Graphic Novel (Color)
          </button>
          <button
            onClick={() => setArtStyle("sketch_bw")}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${artStyle === "sketch_bw"
                ? "bg-emerald-500 text-slate-950 shadow"
                : "text-slate-400 hover:text-white"
              }`}
          >
            StudioBinder (B&W Sketch)
          </button>
        </div>
      </div>

      {/* Storyboard Shots Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredShots.map((shot) => (
          <div
            key={shot.id}
            className="group rounded-2xl bg-[#09130e] border border-emerald-950/70 hover:border-emerald-500/40 transition-all overflow-hidden flex flex-col shadow-lg"
          >
            {/* Visual Container */}
            <div className="relative aspect-video w-full bg-[#050a07] overflow-hidden border-b border-emerald-950/60 flex items-center justify-center">
              {shot.isGenerating ? (
                <div className="w-full h-full flex flex-col items-center justify-center bg-[#07130c] text-emerald-400 space-y-2 p-4 text-center">
                  <Loader2 className="w-8 h-8 animate-spin" />
                  <span className="text-xs font-medium tracking-wide">Drawing Storyboard Frame from Script...</span>
                  <span className="text-[11px] text-slate-400 max-w-xs truncate">{shot.sceneSlug}</span>
                </div>
              ) : shot.imageUrl ? (
                <>
                  <img
                    src={shot.imageUrl}
                    alt={shot.shotNumber}
                    className={`w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 ${artStyle === "sketch_bw" ? "filter grayscale contrast-125" : ""
                      }`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-end p-3">
                    <button
                      onClick={() => reloadSingleShot(shot.id, shot.englishActionPrompt)}
                      className="px-2.5 py-1 rounded-lg bg-black/80 hover:bg-emerald-500 hover:text-slate-950 text-white text-[11px] font-semibold flex items-center gap-1.5 transition-all border border-emerald-500/30 cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" /> Redraw Panel
                    </button>
                  </div>
                </>
              ) : (
                <div className="w-full h-full p-4 flex flex-col items-center justify-center text-center bg-[#060c08] border border-dashed border-emerald-950/80 rounded-t-2xl">
                  <Video className="w-8 h-8 text-slate-600 mb-2" />
                  <p className="text-xs text-slate-400 mb-3 font-medium">Panel not rendered yet</p>
                  <button
                    onClick={() => reloadSingleShot(shot.id, shot.englishActionPrompt)}
                    className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Wand2 className="w-3.5 h-3.5" /> Draw Panel
                  </button>
                </div>
              )}

              {/* Badges */}
              <div className="absolute top-3 left-3 flex items-center gap-2 pointer-events-none">
                <span className="px-2 py-0.5 rounded bg-slate-950/90 backdrop-blur-md border border-white/20 text-white text-[11px] font-bold font-mono">
                  {shot.shotNumber}
                </span>
              </div>

              <div className="absolute bottom-2 right-2 pointer-events-none">
                <span className="px-2 py-0.5 rounded bg-black/75 backdrop-blur-sm text-[10px] font-mono text-emerald-400 border border-emerald-950">
                  {artStyle === "comic_color" ? "Graphic Novel Art" : "StudioBinder Sketch"}
                </span>
              </div>
            </div>

            {/* Description */}
            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div>
                <p className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider mb-1 truncate">
                  {shot.sceneSlug}
                </p>
                <h3 className="text-sm font-bold text-white mb-2">
                  {shot.shotType}
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed font-light line-clamp-3">
                  "{shot.englishActionPrompt}"
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