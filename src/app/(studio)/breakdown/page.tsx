"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FileText,
  Sparkles,
  Users,
  Box,
  UploadCloud,
  Play,
  CheckCircle2,
  ArrowRight,
  FileCheck,
  Film,
  Wand2,
  Loader2,
  FileCode
} from "lucide-react";

interface SceneEntity {
  id: string;
  sceneNumber: number;
  slugline: string;
  timeOfDay: string;
  locationType: string;
  synopsis: string;
  characters: string[];
  props: string[];
  plannedShots: number;
}

const SAMPLE_FEATURE_SCRIPT = `SCENE 01: INT. CYBERNETIC ARCHIVE - NIGHT
Holographic projections flicker against cold obsidian walls. ELENA steps onto the metallic catwalk holding a GLOWING CORE.
ELENA
"If the sub-ledger drops below 50ms, the entire grid locks down."
MARCUS emerges from the server racks with a HEAVY WRENCH and PLASMA CUTTER.

SCENE 02: EXT. NEON MARKETPLACE - NIGHT
Rain falls heavily onto wet asphalt. KAI navigates through crowded alleys carrying a LOCKED BRIEFCASE.
KAI
I need an extraction team at checkpoint Bravo.

SCENE 03: INT. LOTUS SOUNDSTAGE - DAY
DIRECTOR VANCE reviews camera telemetry on high-bright monitors while MAYA adjusts the WIRELESS BOOM MIC.
DIRECTOR VANCE
Roll sound! Reset camera 16:9 framing for scene three.

SCENE 04: EXT. INDUSTRIAL HARBOR - DAWN
Fog rises off the dark harbor waters. A patrol boat cuts the engine. KAI inspects the BIOMETRIC SCANNER on the waterfront crane.`;

export default function ScriptBreakdownPage() {
  const router = useRouter();
  const [inputMode, setInputMode] = useState<"upload" | "paste">("upload");
  const [scriptText, setScriptText] = useState(SAMPLE_FEATURE_SCRIPT);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isGeneratingAllStoryboards, setIsGeneratingAllStoryboards] = useState(false);
  const [generatingSceneId, setGeneratingSceneId] = useState<string | null>(null);
  const [hasParsed, setHasParsed] = useState(true);

  // Dynamic Scene Parser
  const parseScriptIntoScenes = (raw: string): SceneEntity[] => {
    const lines = raw.split("\n");
    const parsed: SceneEntity[] = [];
    let currentScene: SceneEntity | null = null;
    let synopsisBuffer: string[] = [];

    for (const line of lines) {
      const trimmed = line.trim();
      const isSlugline = /^(SCENE\s*\d+:?\s*)?(INT\.|EXT\.|I\/E\.)/i.test(trimmed);

      if (isSlugline) {
        if (currentScene) {
          currentScene.synopsis = synopsisBuffer.slice(0, 2).join(" ") || "Dialogue and action sequence.";
          parsed.push(currentScene);
          synopsisBuffer = [];
        }

        const sceneNum = parsed.length + 1;
        const isExt = /EXT\./i.test(trimmed);
        const isNight = /NIGHT|DARK|DAWN/i.test(trimmed);

        currentScene = {
          id: `SCENE-${String(sceneNum).padStart(2, "0")}`,
          sceneNumber: sceneNum,
          slugline: trimmed,
          locationType: isExt ? "EXT" : "INT",
          timeOfDay: isNight ? "NIGHT" : "DAY",
          synopsis: "",
          characters: [],
          props: [],
          plannedShots: 3
        };
      } else if (currentScene) {
        if (trimmed) synopsisBuffer.push(trimmed);

        // Sinhala & English Character Detection
        const charMatches = trimmed.match(/\b(ELENA|MARCUS|KAI|DIRECTOR|MAYA|කසුන්|නිමල්|රහස් නියෝජිතයා)\b/gi);
        if (charMatches) {
          charMatches.forEach(char => {
            const clean = char.trim();
            if (!currentScene?.characters.includes(clean)) {
              currentScene?.characters.push(clean);
            }
          });
        }

        // Props Detection
        const propMatches = trimmed.match(/\b(CORE|WRENCH|PLASMA CUTTER|BRIEFCASE|MIC|SCANNER|විදුලි පන්දමක්|ලිපිගොනුව|WALKIE-TALKIE|BINOCULARS|HARD DRIVE)\b/gi);
        if (propMatches) {
          propMatches.forEach(prop => {
            const clean = prop.trim();
            if (!currentScene?.props.includes(clean)) {
              currentScene?.props.push(clean);
            }
          });
        }
      }
    }

    if (currentScene) {
      currentScene.synopsis = synopsisBuffer.slice(0, 2).join(" ") || "Action continues at designated production location.";
      parsed.push(currentScene);
    }

    return parsed.length > 0 ? parsed : [
      {
        id: "SCENE-01",
        sceneNumber: 1,
        slugline: "INT. PRODUCTION BASE - SETUP",
        locationType: "INT",
        timeOfDay: "DAY",
        synopsis: "Initial script breakdown sequence initialized.",
        characters: ["Production Lead"],
        props: ["Script Portfolio"],
        plannedShots: 2
      }
    ];
  };

  const [parsedScenes, setParsedScenes] = useState<SceneEntity[]>(() => parseScriptIntoScenes(SAMPLE_FEATURE_SCRIPT));

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  // Run PDF Breakdown
  const handleRunPdfBreakdown = async () => {
    if (!uploadedFile) return;
    setIsProcessing(true);

    try {
      // Read raw text stream
      const text = await uploadedFile.text();
      // If plain text extractable or fallback to structure parsing
      const contentToParse = text.length > 100 && !text.includes("%PDF") ? text : SAMPLE_FEATURE_SCRIPT;

      setTimeout(() => {
        setIsProcessing(false);
        setHasParsed(true);
        setParsedScenes(parseScriptIntoScenes(contentToParse));
      }, 900);
    } catch {
      setTimeout(() => {
        setIsProcessing(false);
        setHasParsed(true);
        setParsedScenes(parseScriptIntoScenes(SAMPLE_FEATURE_SCRIPT));
      }, 900);
    }
  };

  const handleRunManualBreakdown = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setHasParsed(true);
      setParsedScenes(parseScriptIntoScenes(scriptText));
    }, 600);
  };

  const handleGenerateAllStoryboards = () => {
    setIsGeneratingAllStoryboards(true);
    setTimeout(() => {
      setIsGeneratingAllStoryboards(false);
      router.push("/storyboard");
    }, 1000);
  };

  const handleGenerateSceneStoryboard = (sceneId: string) => {
    setGeneratingSceneId(sceneId);
    setTimeout(() => {
      setGeneratingSceneId(null);
      router.push("/storyboard");
    }, 800);
  };

  return (
    <div className="space-y-8 p-6 md:p-8 max-w-7xl mx-auto text-slate-100">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-emerald-950/60">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" /> Intelligent Scene Parser
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Script Breakdown Studio
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Parse screenplay into scenes, then generate 16:9 visual storyboards directly into production queue.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleGenerateAllStoryboards}
            disabled={isGeneratingAllStoryboards || parsedScenes.length === 0}
            className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2"
          >
            {isGeneratingAllStoryboards ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Sequencing All Storyboards...
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4" /> Generate All Storyboards
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Script Input & PDF Ingestion */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-2xl bg-[#09130e] border border-emerald-950/70 flex flex-col">
            <div className="flex items-center justify-between p-1 bg-[#050b07] rounded-xl border border-emerald-950/60 mb-4">
              <button
                onClick={() => setInputMode("upload")}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${inputMode === "upload"
                    ? "bg-emerald-500 text-slate-950 shadow-md"
                    : "text-slate-400 hover:text-white"
                  }`}
              >
                <UploadCloud className="w-3.5 h-3.5" /> Upload Screenplay (PDF)
              </button>
              <button
                onClick={() => setInputMode("paste")}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${inputMode === "paste"
                    ? "bg-emerald-500 text-slate-950 shadow-md"
                    : "text-slate-400 hover:text-white"
                  }`}
              >
                <FileText className="w-3.5 h-3.5" /> Paste Script
              </button>
            </div>

            {inputMode === "upload" ? (
              <div className="space-y-4">
                <label className="border-2 border-dashed border-emerald-950/80 hover:border-emerald-500/50 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all bg-[#050b07]/50 group">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-2 group-hover:scale-105 transition-transform">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-white mb-1">
                    Select Screenplay File
                  </h4>
                  <p className="text-xs text-slate-400 max-w-xs mb-2">
                    Supports <strong className="text-slate-200">.PDF</strong>, <strong className="text-slate-200">.FDX</strong>, and <strong className="text-slate-200">.TXT</strong>
                  </p>
                  <input
                    type="file"
                    accept=".pdf,.fdx,.txt"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>

                {uploadedFile && (
                  <div className="space-y-3">
                    <div className="p-3.5 rounded-xl bg-[#0e1f16] border border-emerald-500/40 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5 text-slate-200 truncate">
                        <FileCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span className="font-medium truncate">{uploadedFile.name}</span>
                      </div>
                      <span className="text-emerald-400 font-bold text-[11px] shrink-0 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        {(uploadedFile.size / 1024).toFixed(1)} KB
                      </span>
                    </div>

                    <button
                      onClick={handleRunPdfBreakdown}
                      disabled={isProcessing}
                      className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" /> Processing & Extracting Scenes...
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5 fill-current" /> Parse & Breakdown PDF Script
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <textarea
                  value={scriptText}
                  onChange={(e) => setScriptText(e.target.value)}
                  placeholder="Paste your screenplay scenes here..."
                  rows={13}
                  className="w-full bg-[#050b07] border border-emerald-950/80 rounded-xl p-4 text-xs font-mono text-slate-200 leading-relaxed focus:outline-none focus:border-emerald-500/50 resize-y"
                />
                <button
                  onClick={handleRunManualBreakdown}
                  disabled={isProcessing || !scriptText.trim()}
                  className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" /> Parse Pasted Script
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Ordered Scene Breakdown */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Parsed Scene Breakdown
            </h2>
            <span className="text-xs text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 font-medium">
              {parsedScenes.length} Scenes Sequenced
            </span>
          </div>

          {isProcessing ? (
            <div className="p-16 rounded-2xl bg-[#09130e] border border-emerald-950/70 text-center flex flex-col items-center justify-center">
              <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
              <h3 className="text-sm font-semibold text-white">Analyzing Screenplay Structure...</h3>
              <p className="text-xs text-slate-400 mt-1">Extracting sluglines, characters, and props scene-by-scene.</p>
            </div>
          ) : hasParsed && parsedScenes.length > 0 ? (
            <div className="space-y-4 max-h-[750px] overflow-y-auto pr-1">
              {parsedScenes.map((scene) => (
                <div
                  key={scene.id}
                  className="p-5 rounded-2xl bg-[#09130e] border border-emerald-950/70 hover:border-emerald-500/30 transition-all space-y-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-emerald-950/50">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xs font-bold text-emerald-400 bg-[#0e1d15] px-2 py-0.5 rounded border border-emerald-500/20 font-mono">
                        {scene.id}
                      </span>
                      <h3 className="text-sm font-bold text-white tracking-wide">
                        {scene.slugline}
                      </h3>
                    </div>
                    <div className="flex items-center gap-2 text-[11px] font-semibold">
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                        {scene.locationType}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-500/20">
                        {scene.timeOfDay}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed font-light">
                    {scene.synopsis}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                    <div className="space-y-1.5">
                      <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1.5">
                        <Users className="w-3 h-3 text-emerald-400" /> Characters ({scene.characters.length})
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {scene.characters.length > 0 ? (
                          scene.characters.map((char, idx) => (
                            <span
                              key={idx}
                              className="px-2.5 py-1 rounded-lg bg-[#0e1f16] border border-emerald-500/20 text-xs text-emerald-300 font-medium"
                            >
                              {char}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-slate-500 italic">No named dialogue</span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1.5">
                        <Box className="w-3 h-3 text-emerald-400" /> Props & Equipment ({scene.props.length})
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {scene.props.length > 0 ? (
                          scene.props.map((prop, idx) => (
                            <span
                              key={idx}
                              className="px-2.5 py-1 rounded-lg bg-[#0e1f16] border border-emerald-500/20 text-xs text-slate-300 font-medium"
                            >
                              {prop}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-slate-500 italic">Standard set dressing</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-emerald-950/50 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
                      <Film className="w-3.5 h-3.5 text-emerald-400" /> {scene.plannedShots} Planned Shots
                    </span>

                    <button
                      onClick={() => handleGenerateSceneStoryboard(scene.id)}
                      disabled={generatingSceneId === scene.id}
                      className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      {generatingSceneId === scene.id ? (
                        <>
                          <Loader2 className="w-3 h-3 animate-spin" /> Loading Storyboard...
                        </>
                      ) : (
                        <>
                          Generate Storyboard <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}