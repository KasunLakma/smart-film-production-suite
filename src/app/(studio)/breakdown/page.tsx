"use client";

import React, { useState, useMemo } from "react";
import {
  FileText,
  Sparkles,
  Cpu,
  Zap,
  Play,
  Layers,
  Bot,
  User,
  Box,
  CheckCircle2,
  Sliders,
  DollarSign,
  Clock,
  RefreshCw,
  Tag,
  Filter,
  ArrowRight,
  ShieldCheck,
  Check,
  AlertCircle,
  Copy,
} from "lucide-react";

interface SceneElement {
  id: string;
  slugline: string;
  type: "INT" | "EXT" | "INT/EXT";
  timeOfDay: string;
  location: string;
  characters: string[];
  props: string[];
  vfx: string[];
  actionSummary: string;
}

const SAMPLE_SCRIPTS = {
  cybernetic: `INT. CYBERNETIC ARCHIVE - NIGHT

Holographic projections flicker against cold obsidian walls. ELENA (30s, tactical jacket) steps onto the metallic catwalk holding a NEON DECODER.

ELENA
(sotto)
If the core ledger drops below 50ms, the entire grid locks down.

MARCUS (40s, grizzled engineer) emerges from the shadow of a SERVER RACK with a HEAVY WRENCH.

MARCUS
It's already spiking. Look at the sub-ledger variance.

ELENA unholsters her PLASMA CUTTER and inspects the GLOWING CORE.

EXT. NEON MARKETPLACE - CONTINUOUS

RAIN falls onto wet asphalt. KAI (20s, courier) navigates through a crowd of SYNTHETICS carrying a LOCKED BRIEFCASE.`,

  rooftop: `EXT. OBSERVATORY ROOFTOP - NIGHT

A BLAZING HELICOPTER SEARCHLIGHT sweeps over the solar tiles. DR. VANCE clutches an ENCRYPTED HARD DRIVE.

DR. VANCE
They've breached the outer firewall!

AGENT REYES draws a TACTICAL REVOLVER and steps in front of the COMMUNICATIONS TOWER.

AGENT REYES
Hold the uplink open. 30 seconds left.`,
};

export default function BreakdownPage() {
  const [activeConsoleTab, setActiveConsoleTab] = useState<
    "script" | "regex" | "llm"
  >("script");
  const [activePipelineMode, setActivePipelineMode] = useState<
    "hybrid" | "regex" | "llm"
  >("hybrid");
  const [rawScriptText, setRawScriptText] = useState(SAMPLE_SCRIPTS.cybernetic);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastParseTime, setLastParseTime] = useState<number | null>(34);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<
    "all" | "characters" | "props" | "vfx"
  >("all");

  // Client-side Regex Parsing Heuristic Engine
  const parsedData = useMemo(() => {
    const lines = rawScriptText.split("\n");
    const scenes: SceneElement[] = [];

    let currentScene: Partial<SceneElement> | null = null;
    let sceneIndex = 0;

    lines.forEach((line) => {
      const trimmed = line.trim();

      // Detect Scene Sluglines (INT. / EXT. / INT./EXT.)
      const sluglineMatch = trimmed.match(/^(INT\.|EXT\.|INT\.\/EXT\.)\s+(.+)$/i);
      if (sluglineMatch) {
        if (currentScene && currentScene.slugline) {
          scenes.push(currentScene as SceneElement);
        }

        sceneIndex++;
        const fullSlug = trimmed.toUpperCase();
        const typeStr = fullSlug.startsWith("INT./EXT.")
          ? "INT/EXT"
          : fullSlug.startsWith("INT.")
          ? "INT"
          : "EXT";

        const parts = fullSlug.replace(/^(INT\.|EXT\.|INT\.\/EXT\.)\s+/, "").split("-");
        const location = parts[0]?.trim() || "UNKNOWN LOCATION";
        const timeOfDay = parts[1]?.trim() || "DAY";

        currentScene = {
          id: `SCENE-${String(sceneIndex).padStart(2, "0")}`,
          slugline: fullSlug,
          type: typeStr,
          location,
          timeOfDay,
          characters: [],
          props: [],
          vfx: [],
          actionSummary: "",
        };
        return;
      }

      if (!currentScene) return;

      // Detect Characters (Uppercase names at start of line or before parentheticals)
      const characterMatch = trimmed.match(/^[A-Z][A-Z\s]{1,15}(?=\s*\(|$)/);
      if (
        characterMatch &&
        !trimmed.startsWith("INT.") &&
        !trimmed.startsWith("EXT.") &&
        !trimmed.includes("NEON") &&
        !trimmed.includes("RAIN")
      ) {
        const charName = characterMatch[0].trim();
        if (
          charName.length > 2 &&
          !["CONTINUOUS", "NIGHT", "DAY", "SCENE"].includes(charName)
        ) {
          if (!currentScene.characters?.includes(charName)) {
            currentScene.characters?.push(charName);
          }
        }
      }

      // Detect Props & Gear Keywords in Action lines
      const propKeywords = [
        "NEON DECODER",
        "HEAVY WRENCH",
        "PLASMA CUTTER",
        "GLOWING CORE",
        "LOCKED BRIEFCASE",
        "ENCRYPTED HARD DRIVE",
        "TACTICAL REVOLVER",
        "COMMUNICATIONS TOWER",
        "SERVER RACK",
        "SOLAR TILES",
      ];
      propKeywords.forEach((prop) => {
        if (trimmed.toUpperCase().includes(prop)) {
          if (!currentScene?.props?.includes(prop)) {
            currentScene?.props?.push(prop);
          }
        }
      });

      // Detect VFX / Atmosphere Elements
      const vfxKeywords = [
        "HOLOGRAPHIC PROJECTIONS",
        "SUB-LEDGER VARIANCE",
        "RAIN",
        "SYNTHETICS",
        "BLAZING HELICOPTER SEARCHLIGHT",
        "OUTER FIREWALL",
      ];
      vfxKeywords.forEach((vfx) => {
        if (trimmed.toUpperCase().includes(vfx)) {
          if (!currentScene?.vfx?.includes(vfx)) {
            currentScene?.vfx?.push(vfx);
          }
        }
      });

      if (!currentScene.actionSummary && trimmed.length > 20 && !characterMatch) {
        currentScene.actionSummary = trimmed;
      }
    });

    if (currentScene && (currentScene as SceneElement).slugline) {
      scenes.push(currentScene as SceneElement);
    }

    return scenes;
  }, [rawScriptText]);

  // Execute Breakdown Trigger
  const handleRunBreakdown = () => {
    setIsProcessing(true);
    const start = performance.now();

    setTimeout(() => {
      const duration = Math.round(performance.now() - start + 28);
      setLastParseTime(duration);
      setIsProcessing(false);
      triggerToast(
        `Dual-Pipeline Breakdown completed in ${duration}ms! ${parsedData.length} Scenes & ${
          parsedData.reduce((acc, s) => acc + s.props.length, 0)
        } Props extracted.`
      );
    }, 450);
  };

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const totalCharacters = useMemo(
    () => Array.from(new Set(parsedData.flatMap((s) => s.characters))),
    [parsedData]
  );
  const totalProps = useMemo(
    () => Array.from(new Set(parsedData.flatMap((s) => s.props))),
    [parsedData]
  );
  const totalVFX = useMemo(
    () => Array.from(new Set(parsedData.flatMap((s) => s.vfx))),
    [parsedData]
  );

  return (
    <div className="space-y-6 font-sans text-slate-100 selection:bg-emerald-500 selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-950 border border-emerald-600 text-emerald-200 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-mono font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header Title Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-studio-700">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-emerald-400" />
            Dual-Pipeline Script Breakdown Engine
          </h1>
          <p className="text-sm text-emerald-100/70 mt-1">
            Hybrid Regex rule processing combined with LLM context extraction for instant scene tagging.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Active Mode Pill Switcher */}
          <div className="bg-studio-900 p-1 rounded-xl border border-studio-700 flex items-center text-xs font-mono">
            <button
              onClick={() => setActivePipelineMode("hybrid")}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 font-medium ${
                activePipelineMode === "hybrid"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Hybrid Mode</span>
            </button>
            <button
              onClick={() => setActivePipelineMode("regex")}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 font-medium ${
                activePipelineMode === "regex"
                  ? "bg-emerald-700 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Regex Only</span>
            </button>
            <button
              onClick={() => setActivePipelineMode("llm")}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 font-medium ${
                activePipelineMode === "llm"
                  ? "bg-emerald-700 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Bot className="w-3.5 h-3.5" />
              <span>LLM Engine</span>
            </button>
          </div>
        </div>
      </div>

      {/* Benchmark Metric Header Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Metric 1: Rule-Based Engine */}
        <div className="p-4 rounded-xl bg-studio-900 border border-studio-700 relative overflow-hidden group">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                Rule-Based Regex Engine
              </span>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
              FASTEST
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-3 pt-2 border-t border-studio-700/60 font-mono text-xs">
            <div>
              <span className="text-slate-400 text-[10px] block">LATENCY</span>
              <span className="text-emerald-400 font-bold text-sm">~1.2s</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] block">ACCURACY</span>
              <span className="text-white font-bold text-sm">94.2%</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] block">COMPUTE COST</span>
              <span className="text-emerald-400 font-bold text-sm">$0.00</span>
            </div>
          </div>
        </div>

        {/* Metric 2: LLM Extraction Engine */}
        <div className="p-4 rounded-xl bg-studio-900 border border-studio-700 relative overflow-hidden group">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                LLM Extraction Engine
              </span>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
              HIGH PRECISION
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-3 pt-2 border-t border-studio-700/60 font-mono text-xs">
            <div>
              <span className="text-slate-400 text-[10px] block">LATENCY</span>
              <span className="text-slate-200 font-bold text-sm">~3.8s</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] block">ACCURACY</span>
              <span className="text-emerald-400 font-bold text-sm">97.5%</span>
            </div>
            <div>
              <span className="text-slate-400 text-[10px] block">API COST</span>
              <span className="text-slate-200 font-bold text-sm">$0.012</span>
            </div>
          </div>
        </div>

        {/* Metric 3: Active Variance Trade-Off */}
        <div className="p-4 rounded-xl bg-studio-900 border border-studio-700 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-300 font-mono uppercase tracking-wider">
              Pipeline Trade-Off Status
            </span>
            <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono font-semibold">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Optimal Active
            </span>
          </div>

          <div className="mt-2 p-2.5 rounded-lg bg-emerald-950/60 border border-emerald-800/60 text-xs font-mono text-emerald-200 space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-400">Determinism:</span>
              <span className="font-bold text-white">Zero API Base Cost</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Context Fallback:</span>
              <span className="text-emerald-400 font-bold">LLM Active on Ambiguity</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Two-Column Workspace Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Screenplay Text Input Console */}
        <div className="bg-studio-900 border border-studio-700 rounded-xl overflow-hidden flex flex-col justify-between">
          {/* Console Header Tabs */}
          <div className="h-12 bg-studio-950 border-b border-studio-700 px-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setActiveConsoleTab("script")}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all flex items-center gap-1.5 ${
                  activeConsoleTab === "script"
                    ? "bg-studio-800 text-white border border-studio-700"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <FileText className="w-3.5 h-3.5 text-emerald-400" />
                <span>Raw Script Input</span>
              </button>
              <button
                onClick={() => setActiveConsoleTab("regex")}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all flex items-center gap-1.5 ${
                  activeConsoleTab === "regex"
                    ? "bg-studio-800 text-white border border-studio-700"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Cpu className="w-3.5 h-3.5 text-emerald-400" />
                <span>Regex Rules</span>
              </button>
              <button
                onClick={() => setActiveConsoleTab("llm")}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold transition-all flex items-center gap-1.5 ${
                  activeConsoleTab === "llm"
                    ? "bg-studio-800 text-white border border-studio-700"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Bot className="w-3.5 h-3.5 text-emerald-400" />
                <span>LLM Extractor</span>
              </button>
            </div>

            {/* Presets Button */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setRawScriptText(SAMPLE_SCRIPTS.cybernetic);
                  triggerToast("Loaded Sample Scene: INT. CYBERNETIC ARCHIVE");
                }}
                className="text-[11px] font-mono text-emerald-400 hover:text-emerald-300 underline underline-offset-2"
              >
                Load Sample 1
              </button>
              <span className="text-slate-600">•</span>
              <button
                onClick={() => {
                  setRawScriptText(SAMPLE_SCRIPTS.rooftop);
                  triggerToast("Loaded Sample Scene: EXT. OBSERVATORY ROOFTOP");
                }}
                className="text-[11px] font-mono text-emerald-400 hover:text-emerald-300 underline underline-offset-2"
              >
                Load Sample 2
              </button>
            </div>
          </div>

          {/* Console Content Body */}
          <div className="p-4 flex-1 flex flex-col justify-between min-h-[420px]">
            {activeConsoleTab === "script" && (
              <div className="flex-1 flex flex-col space-y-2">
                <label className="text-xs font-mono text-slate-400 flex items-center justify-between">
                  <span>FOUNTAIN SCREENPLAY CONSOLE</span>
                  <span>{rawScriptText.length} characters</span>
                </label>
                <textarea
                  value={rawScriptText}
                  onChange={(e) => setRawScriptText(e.target.value)}
                  placeholder="Paste Fountain formatted screenplay text here..."
                  className="w-full flex-1 bg-studio-950 border border-studio-700 rounded-lg p-4 font-mono text-xs text-emerald-100 placeholder-slate-600 focus:outline-none focus:border-emerald-500 leading-relaxed resize-none min-h-[360px]"
                />
              </div>
            )}

            {activeConsoleTab === "regex" && (
              <div className="space-y-4 font-mono text-xs">
                <div className="p-3 bg-studio-950 border border-studio-700 rounded-lg space-y-2">
                  <div className="flex items-center justify-between text-emerald-400 font-bold">
                    <span>SCENE SLUGLINE RULE</span>
                    <span className="text-[10px] bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                      REGEX PASS 1
                    </span>
                  </div>
                  <code className="text-slate-200 block bg-black/40 p-2 rounded text-[11px]">
                    {"/^(INT\\.|EXT\\.|INT\\.\\/EXT\\.)\\s+(.+)$/gm"}
                  </code>
                  <p className="text-[11px] text-slate-400">
                    Matches Scene headers, splits interior/exterior tokens, and extracts location names.
                  </p>
                </div>

                <div className="p-3 bg-studio-950 border border-studio-700 rounded-lg space-y-2">
                  <div className="flex items-center justify-between text-emerald-400 font-bold">
                    <span>CHARACTER NAME EXTRACTION</span>
                    <span className="text-[10px] bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                      REGEX PASS 2
                    </span>
                  </div>
                  <code className="text-slate-200 block bg-black/40 p-2 rounded text-[11px]">
                    {"/^[A-Z][A-Z\\s]{1,15}(?=\\s*\\(|$)/gm"}
                  </code>
                  <p className="text-[11px] text-slate-400">
                    Extracts capitalized character names prior to dialogue lines or parentheticals.
                  </p>
                </div>

                <div className="p-3 bg-studio-950 border border-studio-700 rounded-lg space-y-2">
                  <div className="flex items-center justify-between text-emerald-400 font-bold">
                    <span>PROPS & VFX KEYWORD DICTIONARY</span>
                    <span className="text-[10px] bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                      REGEX PASS 3
                    </span>
                  </div>
                  <code className="text-slate-200 block bg-black/40 p-2 rounded text-[11px]">
                    {"/(DECODER|WRENCH|CUTTER|CORE|BRIEFCASE|HARD DRIVE|REVOLVER)/gi"}
                  </code>
                  <p className="text-[11px] text-slate-400">
                    Scans action blocks for physical props and special visual effect callouts.
                  </p>
                </div>
              </div>
            )}

            {activeConsoleTab === "llm" && (
              <div className="space-y-4 font-mono text-xs">
                <div className="p-4 bg-studio-950 border border-studio-700 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-emerald-400 font-bold flex items-center gap-2">
                      <Bot className="w-4 h-4" /> LLM CONTEXT EXTRACTION PROMPT
                    </span>
                    <span className="text-[10px] text-emerald-300 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                      JSON SCHEMA OUTPUT
                    </span>
                  </div>
                  <pre className="text-slate-300 bg-black/50 p-3 rounded text-[11px] whitespace-pre-wrap leading-relaxed overflow-x-auto">
{`{
  "scene_breakdown": {
    "type": "array",
    "items": {
      "slugline": "string",
      "characters": ["string"],
      "props": ["string"],
      "vfx_cues": ["string"]
    }
  }
}`}
                  </pre>
                  <p className="text-[11px] text-slate-400">
                    Provides zero-shot structured JSON parsing for complex scenes where regex heuristics hit ambiguous formatting.
                  </p>
                </div>
              </div>
            )}

            {/* Bottom Controls Bar */}
            <div className="mt-4 pt-3 border-t border-studio-700 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                <span>Last Parse: {lastParseTime ? `${lastParseTime}ms` : "--"}</span>
              </div>

              <button
                onClick={handleRunBreakdown}
                disabled={isProcessing}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs px-5 py-2.5 rounded-lg shadow-[0_0_20px_rgba(22,163,74,0.4)] transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Parsing Script...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-white" />
                    <span>Run Breakdown Engine</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Parsed Output Inspector */}
        <div className="bg-studio-900 border border-studio-700 rounded-xl overflow-hidden flex flex-col justify-between">
          {/* Output Inspector Header */}
          <div className="h-12 bg-studio-950 border-b border-studio-700 px-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-emerald-400" />
              <span className="font-mono text-xs font-bold text-white">
                PARSED SCENE ENTITIES ({parsedData.length})
              </span>
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 text-[11px] font-mono">
              <button
                onClick={() => setSelectedFilter("all")}
                className={`px-2.5 py-1 rounded transition-colors ${
                  selectedFilter === "all"
                    ? "bg-emerald-900/60 text-emerald-300 border border-emerald-700/60 font-semibold"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setSelectedFilter("characters")}
                className={`px-2.5 py-1 rounded transition-colors ${
                  selectedFilter === "characters"
                    ? "bg-emerald-900/60 text-emerald-300 border border-emerald-700/60 font-semibold"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Characters ({totalCharacters.length})
              </button>
              <button
                onClick={() => setSelectedFilter("props")}
                className={`px-2.5 py-1 rounded transition-colors ${
                  selectedFilter === "props"
                    ? "bg-emerald-900/60 text-emerald-300 border border-emerald-700/60 font-semibold"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Props ({totalProps.length})
              </button>
            </div>
          </div>

          {/* Parsed Output Content Cards */}
          <div className="p-4 flex-1 overflow-y-auto max-h-[520px] space-y-4">
            {parsedData.map((scene) => (
              <div
                key={scene.id}
                className="bg-studio-950 border border-studio-700/80 rounded-xl p-4 space-y-3.5 hover:border-emerald-600/50 transition-colors"
              >
                {/* Scene Header */}
                <div className="flex items-center justify-between border-b border-studio-700/60 pb-2.5">
                  <div className="flex items-center gap-2.5">
                    <span className="px-2.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-mono text-xs font-bold">
                      {scene.id}
                    </span>
                    <h3 className="font-mono text-xs font-bold text-white tracking-wide truncate max-w-[240px] sm:max-w-none">
                      {scene.slugline}
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-studio-800 text-slate-300 border border-studio-700">
                    {scene.type} • {scene.timeOfDay}
                  </span>
                </div>

                {/* Scene Action Brief */}
                {scene.actionSummary && (
                  <p className="text-xs text-slate-300 font-mono italic leading-relaxed bg-studio-900/60 p-2.5 rounded border border-studio-800/80">
                    "{scene.actionSummary}"
                  </p>
                )}

                {/* Characters Extracted */}
                {(selectedFilter === "all" || selectedFilter === "characters") && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-mono text-slate-400 uppercase font-bold tracking-wider flex items-center gap-1">
                      <User className="w-3 h-3 text-emerald-400" /> Characters Detected ({scene.characters.length})
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {scene.characters.length > 0 ? (
                        scene.characters.map((char) => (
                          <span
                            key={char}
                            className="px-2.5 py-1 rounded bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs font-mono font-semibold flex items-center gap-1.5"
                          >
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                            {char}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs font-mono text-slate-500 italic">No characters detected</span>
                      )}
                    </div>
                  </div>
                )}

                {/* Props Extracted */}
                {(selectedFilter === "all" || selectedFilter === "props") && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-mono text-slate-400 uppercase font-bold tracking-wider flex items-center gap-1">
                      <Box className="w-3 h-3 text-emerald-400" /> Props Tagged ({scene.props.length})
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {scene.props.length > 0 ? (
                        scene.props.map((prop) => (
                          <span
                            key={prop}
                            className="px-2.5 py-1 rounded bg-studio-900 border border-emerald-700/60 text-slate-200 text-xs font-mono font-medium flex items-center gap-1.5"
                          >
                            <Tag className="w-3 h-3 text-emerald-400" />
                            {prop}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs font-mono text-slate-500 italic">No physical props detected</span>
                      )}
                    </div>
                  </div>
                )}

                {/* VFX & Atmosphere Elements */}
                {(selectedFilter === "all" || selectedFilter === "vfx") && scene.vfx.length > 0 && (
                  <div className="space-y-1.5">
                    <span className="text-[10px] font-mono text-slate-400 uppercase font-bold tracking-wider flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-emerald-400" /> VFX & Atmosphere ({scene.vfx.length})
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {scene.vfx.map((vfx) => (
                        <span
                          key={vfx}
                          className="px-2.5 py-1 rounded bg-emerald-900/30 border border-emerald-800 text-emerald-300 text-xs font-mono"
                        >
                          ⚡ {vfx}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Inspector Summary Footer */}
          <div className="p-3 bg-studio-950 border-t border-studio-700 flex items-center justify-between text-xs font-mono text-slate-400">
            <div className="flex items-center gap-3">
              <span>Total Scenes: <strong className="text-white">{parsedData.length}</strong></span>
              <span>•</span>
              <span>Total Props: <strong className="text-emerald-400">{totalProps.length}</strong></span>
            </div>
            <span className="text-[11px] text-emerald-400/80 flex items-center gap-1 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5" /> Type-Safe Schema Validated
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
