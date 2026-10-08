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
  Download,
  Film
} from "lucide-react";

interface StoryboardShot {
  id: string;
  sceneId: string;
  sceneNumber: number;
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
  const [shots, setShots] = useState<StoryboardShot[]>([]);
  const [sceneList, setSceneList] = useState<{ id: string; slugline: string }[]>([]);
  const [activeScriptKey, setActiveScriptKey] = useState("");

  const scriptType = activeScriptKey.includes("sinhala") ? "sinhala" : "english";
  const STORAGE_KEY = activeScriptKey ? `cine_sb_manual_${scriptType}_${artStyle}` : "";

  const getSavedCache = (key = STORAGE_KEY): Record<string, { url: string; prompt: string }> => {
    if (!key || typeof window === "undefined") return {};
    try {
      const saved = localStorage.getItem(key) || localStorage.getItem(`cine_sb_${scriptType}_${artStyle}`);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  };

  const saveToCache = (shotId: string, url: string, prompt: string) => {
    if (!STORAGE_KEY || typeof window === "undefined") return;
    try {
      const current = getSavedCache(STORAGE_KEY);
      current[shotId] = { url, prompt };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
    } catch { }
  };

  const clearAllCache = () => {
    if (STORAGE_KEY && typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(`cine_sb_${scriptType}_${artStyle}`);
      setShots((prev) => prev.map((s) => ({ ...s, imageUrl: "", visualPrompt: "" })));
    }
  };

  // සිංහල හෝ ඉංග්‍රීසි සීන් එකට 100% ක් ගැලපෙන English Visual Prompt එක සෑදීම
  const generateScenePrompt = (shot: StoryboardShot, isWide: boolean): string => {
    const fullText = `${shot.sceneSlug} ${shot.synopsis} ${shot.props.join(" ")} ${shot.characters.join(" ")}`;
    const isSinhala = /[\u0D80-\u0DFF]/.test(fullText);

    let visualSubject = "";

    if (isSinhala) {
      if (shot.sceneNumber === 1 || /විද්‍යාගාර|විද්යාගාර|තාක්ෂණ|ස්කෑනර|පර්යේෂණාගාර/i.test(fullText)) {
        visualSubject = "high-tech research laboratory interior, glowing computer terminals, operative holding digital scanner and tactical beam flashlight";
      } else if (shot.sceneNumber === 2 || /වරාය|තොටුපළ|දුරදක්න|කන්ටේනර්/i.test(fullText)) {
        visualSubject = "industrial sea harbor container docks, pouring rain on wet asphalt, black sedan idling, operative holding military binoculars";
      } else if (shot.sceneNumber === 3 || /සුරක්ෂිතාගාර|හොලෝග්‍රැෆික්|TRANSFER|ලෝහමය/i.test(fullText)) {
        visualSubject = "underground high-security vault, metallic lockers, glowing holographic projection device displaying transfer complete";
      } else if (shot.sceneNumber === 4 || /සන්නද්ධ|ධාවන|මාර්ග|අධිවේගී/i.test(fullText)) {
        visualSubject = "tactical armored transport vehicle speeding along wet highway at night, bright headlights cutting through heavy storm";
      } else if (/රථ|කාර්|සෙඩාන්/i.test(fullText)) {
        visualSubject = "black sedan vehicle parked in atmospheric night setting";
      } else if (/කාමර|නිවස|ගෙදර/i.test(fullText)) {
        visualSubject = "cinematic interior house room with warm dramatic moody lighting";
      } else if (/පාර|වීදිය|නගර/i.test(fullText)) {
        visualSubject = "cinematic urban city street at dusk, wet pavement and ambient lighting";
      } else if (/කැලෑ|වනය|ගස්/i.test(fullText)) {
        visualSubject = "atmospheric dense forest scene, mist hanging between trees, cinematic lighting";
      } else if (/මුහුද|වෙරළ/i.test(fullText)) {
        visualSubject = "coastal ocean shore, dramatic sky and moody atmosphere";
      } else {
        visualSubject = "cinematic interior moody scene, atmospheric lighting, high contrast dramatic setup";
      }
    } else {
      if (shot.sceneNumber === 1 || /VAULT|LOCKER/i.test(fullText)) {
        visualSubject = "underground bank archive vault, rows of metallic locker drawers, concrete floor, Elena holding scanner, flashlight and master key";
      } else if (shot.sceneNumber === 2 || /HARBOR|WAREHOUSE|COMPASS/i.test(fullText)) {
        visualSubject = "cold coastal harbor warehouse exterior, heavy rain on corrugated roof, Elena holding bronze compass, black sedan idling";
      } else if (shot.sceneNumber === 3 || /SEDAN|TABLET|CURRENCY/i.test(fullText)) {
        visualSubject = "interior of black sedan moving at night, briefcase open with stacks of Euro currency, glowing encrypted tablet radar display";
      } else {
        const cleanSlug = shot.sceneSlug.replace(/^SCENE\s*\d+[:.\-\s]*/gi, "").trim();
        const cleanSynopsis = shot.synopsis.slice(0, 200).replace(/\s+/g, " ");
        const propsInfo = shot.props.length > 0 ? `, key props: ${shot.props.join(", ")}` : "";
        const charInfo = shot.characters.length > 0 ? `, featuring ${shot.characters.join(", ")}` : "";
        visualSubject = `${cleanSlug}, ${cleanSynopsis}${propsInfo}${charInfo}`;
      }
    }

    const framing = isWide
      ? "wide establishing master shot, deep focus, environmental perspective, 35mm anamorphic wide lens"
      : "medium close-up dramatic action framing, character expression and props in focus, 50mm prime cinematic lens";

    const style =
      artStyle === "sketch_bw"
        ? "StudioBinder storyboard sketch, pencil line art, charcoal shading, black and white monochrome storyboard panel, high contrast film previsualization"
        : "graphic novel storyboard panel, bold ink outlines, comic book color palette, vivid cinematic lighting, 35mm film illustration still";

    return `${visualSubject}, ${framing}, ${style}, 16:9 widescreen composition, 8k resolution, cinematic masterpiece`;
  };

  // Generate Frame බටන් එක ක්ලික් කළ විට පමණක් AI Image Synthesis වීම (Direct Instant Mode)
  const handleGenerateFrame = (shot: StoryboardShot) => {
    const isWide = shot.id.endsWith("-A");
    const prompt = generateScenePrompt(shot, isWide);
    const seed = Math.floor(Math.random() * 899999) + 100000;
    const finalUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=1280&height=720&seed=${seed}&nologo=true`;

    saveToCache(shot.id, finalUrl, prompt);
    setShots((prev) =>
      prev.map((s) =>
        s.id === shot.id
          ? {
            ...s,
            imageUrl: finalUrl,
            visualPrompt: prompt,
            isGenerating: false
          }
          : s
      )
    );

    try {
      fetch("/api/storyboard/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sceneNumber: shot.sceneNumber,
          slugline: shot.sceneSlug,
          synopsis: shot.synopsis,
          isWide,
          artStyle,
          props: shot.props,
          characters: shot.characters
        })
      }).catch(() => { });
    } catch { }
  };

  const handleGenerateAllFrames = () => {
    shots.forEach((shot) => {
      handleGenerateFrame(shot);
    });
  };

  // Initial Sync: Breakdown එකේ active scenes නැතිනම් Storyboard එක හිස්ව තැබීම
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedScenes =
        sessionStorage.getItem("eclat_active_scenes") ||
        localStorage.getItem("active_screenplay_scenes") ||
        localStorage.getItem("eclat_active_scenes");

      if (!storedScenes || storedScenes === "[]") {
        setShots([]);
        setSceneList([]);
        setActiveScriptKey("");
        return;
      }

      try {
        const parsed = JSON.parse(storedScenes);
        if (!Array.isArray(parsed) || parsed.length === 0) {
          setShots([]);
          setSceneList([]);
          setActiveScriptKey("");
          return;
        }

        const sampleText = parsed.map((s: any) => `${s.slugline} ${s.synopsis} ${(s.characters || []).join(" ")} ${(s.props || []).join(" ")}`).join(" ");
        const isSinhala = /[\u0D80-\u0DFF]/.test(sampleText);
        const scriptId = isSinhala ? "sinhala" : "english";
        setActiveScriptKey(scriptId);

        const currentKey = `cine_sb_manual_${scriptId}_${artStyle}`;
        let cached: Record<string, { url: string; prompt: string }> = {};
        try {
          const saved = localStorage.getItem(currentKey) || localStorage.getItem(`cine_sb_${scriptId}_${artStyle}`);
          if (saved) cached = JSON.parse(saved);
        } catch { }

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
            sceneNumber: index + 1,
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
            imageUrl: cached[idA]?.url || "",
            visualPrompt: cached[idA]?.prompt || ""
          });

          newShots.push({
            id: idB,
            sceneId: scene.id,
            sceneNumber: index + 1,
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
            imageUrl: cached[idB]?.url || "",
            visualPrompt: cached[idB]?.prompt || ""
          });
        });

        setShots(newShots);
      } catch (e) {
        console.error("Storyboard initial setup error:", e);
        setShots([]);
        setSceneList([]);
        setActiveScriptKey("");
      }
    }
  }, [artStyle]);

  const filteredShots =
    filterScene === "ALL" ? shots : shots.filter((s) => s.sceneId === filterScene);

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
            StudioBinder Hand-Drawn Ink & Comic Storyboard Visualization (Manual Trigger Mode).
          </p>
        </div>

        <div className="flex items-center gap-3">
          {shots.length > 0 && (
            <button
              onClick={handleGenerateAllFrames}
              className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all shadow-lg shadow-emerald-500/20 flex items-center gap-2 cursor-pointer"
            >
              <Wand2 className="w-4 h-4" /> Synthesize All Frames
            </button>
          )}
          <Link
            href="/breakdown"
            className="px-4 py-2.5 rounded-xl bg-[#09130e] hover:bg-[#0e1d15] border border-emerald-950 text-slate-300 text-xs font-semibold transition-all flex items-center gap-2"
          >
            <FileText className="w-4 h-4 text-emerald-400" /> Back to Script
          </Link>
          {shots.length > 0 && (
            <button
              onClick={clearAllCache}
              title="Reset cached frames"
              className="p-2.5 rounded-xl bg-[#09130e] hover:bg-rose-950/40 border border-emerald-950 hover:border-rose-800 text-slate-400 hover:text-rose-300 transition-all cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {shots.length === 0 ? (
        <div className="p-16 rounded-2xl bg-[#060c08] border border-dashed border-emerald-950 text-center space-y-3">
          <Film className="w-12 h-12 mx-auto text-emerald-600/40" />
          <h3 className="text-base font-bold text-slate-300">කිසිදු දර්ශනයක් තවමත් නොමැත</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            කරුණාකර Script Breakdown පිටුවට ගොස් සිංහල හෝ ඉංග්‍රීසි තිර පිටපතක් Upload කර දර්ශන සකසා ගන්න.
          </p>
          <Link
            href="/breakdown"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all"
          >
            Go to Breakdown Studio
          </Link>
        </div>
      ) : (
        <>
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
                      <span className="text-xs font-medium tracking-wide">
                        AI Synthesizing Cinematic Frame...
                      </span>
                      <span className="text-[11px] text-slate-400 max-w-xs truncate">
                        {shot.sceneSlug}
                      </span>
                    </div>
                  ) : shot.imageUrl ? (
                    <>
                      <img
                        src={shot.imageUrl}
                        alt={shot.shotNumber}
                        className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                        onError={(e) => {
                          const fallbackSeed = Math.floor(Math.random() * 899999) + 100000;
                          const promptText = shot.visualPrompt || "cinematic scene";
                          e.currentTarget.src = `https://image.pollinations.ai/prompt/${encodeURIComponent(promptText)}?width=1280&height=720&seed=${fallbackSeed}&nologo=true`;
                        }}
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
                          onClick={() => handleGenerateFrame(shot)}
                          className="px-2.5 py-1 rounded-lg bg-black/80 hover:bg-emerald-500 hover:text-slate-950 text-white text-[11px] font-semibold flex items-center gap-1.5 transition-all border border-emerald-500/30 cursor-pointer"
                        >
                          <RefreshCw className="w-3 h-3" /> Re-render Frame
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full p-4 flex flex-col items-center justify-center text-center bg-[#060c08]">
                      <button
                        onClick={() => handleGenerateFrame(shot)}
                        className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 flex items-center gap-2 cursor-pointer transition-all hover:scale-105"
                      >
                        <Wand2 className="w-3.5 h-3.5" /> Generate Frame
                      </button>
                      <span className="text-[11px] text-slate-500 mt-2">
                        Click to synthesize this 16:9 cinematic frame
                      </span>
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

                  {shot.visualPrompt && (
                    <div className="p-2.5 rounded-xl bg-[#030704] border border-emerald-950/80 space-y-1">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5" /> 100% English Visual Prompt
                      </div>
                      <p className="text-[11px] text-slate-300 font-mono leading-relaxed line-clamp-2">
                        {shot.visualPrompt}
                      </p>
                    </div>
                  )}

                  <div className="pt-2.5 border-t border-emerald-950/60 grid grid-cols-2 gap-2 text-[11px]">
                    <div className="bg-[#0e1d15] p-2 rounded-lg border border-emerald-950/80">
                      <span className="text-slate-500 block text-[10px] uppercase">Lens Angle</span>
                      <span className="text-slate-200 font-medium truncate block mt-0.5">
                        {shot.lens}
                      </span>
                    </div>
                    <div className="bg-[#0e1d15] p-2 rounded-lg border border-emerald-950/80">
                      <span className="text-slate-500 block text-[10px] uppercase">Movement</span>
                      <span className="text-slate-200 font-medium truncate block mt-0.5">
                        {shot.cameraMovement}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}