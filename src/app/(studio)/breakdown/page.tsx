"use client";

import { useState } from "react";
import Link from "next/link";
import {
  FileText,
  Sparkles,
  Users,
  Box,
  MapPin,
  Play,
  CheckCircle2,
  ArrowRight,
  Layers,
  RotateCcw
} from "lucide-react";

const SAMPLE_SCRIPT = `SCENE 01: INT. CYBERNETIC ARCHIVE - NIGHT

Holographic projections flicker against cold obsidian walls. ELENA (30s, tactical jacket) steps onto the metallic catwalk holding a GLOWING CORE.

ELENA
(whispering)
"If the sub-ledger drops below 50ms, the entire grid locks down."

MARCUS (40s, grizzled engineer) emerges from the shadows on a SERVER RACK with a HEAVY WRENCH.

MARCUS
It's already spiking. Look at the balance variance.

ELENA activates her PLASMA CUTTER and inspects the GLOWING CORE.

EXT. NEON MARKETPLACE - CONTINUOUS

RAIN falls onto wet asphalt. KAI (20s, courier) navigates through a crowd of SYNTHETICS carrying a LOCKED BRIEFCASE.`;

interface SceneEntity {
  id: string;
  slugline: string;
  timeOfDay: string;
  locationType: string;
  synopsis: string;
  characters: string[];
  props: string[];
}

export default function ScriptBreakdownPage() {
  const [scriptText, setScriptText] = useState(SAMPLE_SCRIPT);
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasParsed, setHasParsed] = useState(true);

  // Demo parsed state data
  const parsedScenes: SceneEntity[] = [
    {
      id: "SCENE-01",
      slugline: "INT. CYBERNETIC ARCHIVE - NIGHT",
      locationType: "INT",
      timeOfDay: "NIGHT",
      synopsis: "Elena and Marcus inspect a spiking server sub-ledger while holding an unstable glowing core.",
      characters: ["Elena", "Marcus"],
      props: ["Glowing Core", "Server Rack", "Heavy Wrench", "Plasma Cutter"]
    },
    {
      id: "SCENE-02",
      slugline: "EXT. NEON MARKETPLACE - CONTINUOUS",
      locationType: "EXT",
      timeOfDay: "NIGHT",
      synopsis: "Kai navigates rain-slicked streets carrying a locked briefcase among synthetics.",
      characters: ["Kai", "Synthetics"],
      props: ["Locked Briefcase", "Rain Gear"]
    }
  ];

  const handleRunBreakdown = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setHasParsed(true);
    }, 800);
  };

  const handleReset = () => {
    setScriptText("");
    setHasParsed(false);
  };

  return (
    <div className="space-y-8 p-6 md:p-8 max-w-7xl mx-auto text-slate-100">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-emerald-950/60">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" /> Intelligent Parsing
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Script Breakdown Studio
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Input screenplay text to automatically categorize scene sluglines, characters, and key props.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setScriptText(SAMPLE_SCRIPT)}
            className="px-4 py-2 rounded-xl bg-[#09130e] hover:bg-[#0e1d15] border border-emerald-950/80 text-xs font-medium text-slate-300 transition-colors"
          >
            Load Sample Script
          </button>
          <Link
            href="/storyboard"
            className="px-4 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-semibold transition-all flex items-center gap-1.5"
          >
            View Storyboards <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Main Two-Column Workflow Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Script Editor (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-2xl bg-[#09130e] border border-emerald-950/70 flex flex-col h-full">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400" /> Screenplay Input
              </h2>
              <span className="text-[11px] text-slate-500">Standard Fountain / Script</span>
            </div>

            <textarea
              value={scriptText}
              onChange={(e) => setScriptText(e.target.value)}
              placeholder="Paste your screenplay scene text here..."
              rows={16}
              className="w-full bg-[#050b07] border border-emerald-950/80 rounded-xl p-4 text-xs font-mono text-slate-200 leading-relaxed focus:outline-none focus:border-emerald-500/50 resize-y transition-colors"
            />

            <div className="mt-4 flex items-center gap-3">
              <button
                onClick={handleRunBreakdown}
                disabled={isProcessing || !scriptText.trim()}
                className="flex-1 py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>Processing Breakdown...</>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" /> Run Script Breakdown
                  </>
                )}
              </button>

              <button
                onClick={handleReset}
                title="Clear input"
                className="p-3 rounded-xl bg-[#0e1d15] hover:bg-[#13281e] border border-emerald-950/80 text-slate-400 hover:text-white transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Parsed Scenes & Entities Output (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Extracted Breakdown Elements
            </h2>
            <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 font-medium">
              {parsedScenes.length} Scenes Identified
            </span>
          </div>

          {hasParsed ? (
            <div className="space-y-4">
              {parsedScenes.map((scene) => (
                <div
                  key={scene.id}
                  className="p-5 rounded-2xl bg-[#09130e] border border-emerald-950/70 hover:border-emerald-500/30 transition-all space-y-4"
                >
                  {/* Scene Header */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-emerald-950/50">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xs font-bold text-emerald-400 bg-[#0e1d15] px-2 py-0.5 rounded border border-emerald-500/20">
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

                  {/* Synopsis */}
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {scene.synopsis}
                  </p>

                  {/* Entities Tags */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                    {/* Characters */}
                    <div className="space-y-1.5">
                      <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1.5">
                        <Users className="w-3 h-3 text-emerald-400" /> Characters ({scene.characters.length})
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {scene.characters.map((char, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-1 rounded-lg bg-[#0e1f16] border border-emerald-500/20 text-xs text-emerald-300 font-medium"
                          >
                            {char}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Props */}
                    <div className="space-y-1.5">
                      <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1.5">
                        <Box className="w-3 h-3 text-emerald-400" /> Props & Equipment ({scene.props.length})
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {scene.props.map((prop, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-1 rounded-lg bg-[#0e1f16] border border-emerald-500/20 text-xs text-slate-300 font-medium"
                          >
                            {prop}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 rounded-2xl bg-[#09130e] border border-emerald-950/70 text-center flex flex-col items-center justify-center">
              <FileText className="w-10 h-10 text-slate-600 mb-3" />
              <h3 className="text-sm font-semibold text-slate-300">No scenes parsed yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mt-1">
                Paste your screenplay text on the left and click "Run Script Breakdown" to view extracted scenes and elements.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}