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
  MessageSquare,
  Trash2,
  Edit2,
  X,
  CheckSquare,
  Square
} from "lucide-react";

interface DialogueItem {
  speaker: string;
  line: string;
}

interface SceneEntity {
  id: string;
  sceneNumber: number;
  slugline: string;
  timeOfDay: string;
  locationType: string;
  synopsis: string;
  characters: string[];
  props: string[];
  dialogues: DialogueItem[];
  plannedShots: number;
}

const SINHALA_SCRIPT_TEMPLATE = `SCENE 01: INT. පැරණි තාක්ෂණ විද්‍යාගාරය - NIGHT
අඳුරු කාමරය මැද නිල් සහ කොළ පරිගණක තිර දැල්වෙයි. පිටතින් ධාරානිපාත වැසි හඬ ඇසෙයි. කසුන් මේසය මත ඇති හෝලෝග්‍රැෆික් උපකරණය පරීක්ෂා කරයි. ඔහුගේ අතේ කුඩා විදුලි පන්දමක් සහ ඩිජිටල් ස්කෑනරයක් ඇත.

නිමල්
"කසුන්... තව විනාඩි දහයකින් මුළු ග්‍රිඩ් එකම ඩවුන් වෙනවා. ඔය ෆයිල් එක ගත්තද?"

කසුන්
"ප්‍රොසෙස් එක 90% ක් ඉවරයි. තව තත්පර තිහක් ඕනේ. දොර ළඟට වෙලා බලාගෙන ඉන්න."

SCENE 02: EXT. වරාය පිවිසුම් මාර්ගය - CONTINUOUS
තද වැස්ස මාර්ගය මත පතිත වේ. කළු පැහැති වැන් රථයක් නවත්වයි. රහස් නියෝජිතයා BINOCULARS උපකරණයෙන් ගේට්ටුව දෙස බලා සිටියි.

රහස් නියෝජිතයා
"ඉලක්කය තවමත් ගොඩනැගිල්ල ඇතුළේ. පිටවීමේ සලකුණක් නෑ."

SCENE 03: INT. ප්‍රධාන පාලක මැදිරිය - NIGHT
පරිගණක තිරයේ දත්ත හුවමාරුව අවසන් වේ. කසුන් ENCRYPTED HARD DRIVE එක ගලවා ගනී. හදිසි අනතුරු ඇඟවීමේ රතු ලාම්පු දැල්වෙයි.

නිමල්
"උන් මේන් පවර් එක කැපුවා! දැන්ම යන්න වෙනවා!"

කසුන්
"දෘඪ තැටිය ගත්තා. පිටුපස දොරෙන් එළියට බහිමු!"

SCENE 04: EXT. වරාය අංගනය - DAWN
අලුයම මීදුමෙන් වැසුණු වරාය පරිශ්‍රය. කසුන් සහ නිමල් බහාලුම් අතරින් බෝට්ටුව දෙසට වේගයෙන් දිව යති.

නිමල්
"බෝට්ටුව තියෙන්නේ තුන්වෙනි ජැටිය ළඟ. ඉක්මන් කරන්න!"`;

export default function ScriptBreakdownPage() {
  const router = useRouter();
  const [inputMode, setInputMode] = useState<"upload" | "paste">("upload");
  const [scriptText, setScriptText] = useState(SINHALA_SCRIPT_TEMPLATE);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isGeneratingAllStoryboards, setIsGeneratingAllStoryboards] = useState(false);
  const [generatingSceneId, setGeneratingSceneId] = useState<string | null>(null);
  const [hasParsed, setHasParsed] = useState(true);

  const [selectedSceneIds, setSelectedSceneIds] = useState<string[]>([]);
  const [editingScene, setEditingScene] = useState<SceneEntity | null>(null);

  const parseScriptIntoScenes = (raw: string): SceneEntity[] => {
    const lines = raw.split("\n");
    const parsed: SceneEntity[] = [];
    let currentScene: SceneEntity | null = null;
    let synopsisBuffer: string[] = [];
    let currentSpeaker: string | null = null;

    for (const rawLine of lines) {
      const trimmed = rawLine.trim();
      if (!trimmed) continue;

      const isSlugline = /^(SCENE\s*\d+:?|දර්ශනය\s*\d+:?|(INT\.|EXT\.|I\/E\.|අභ්‍යන්තර|බාහිර))/i.test(trimmed);

      if (isSlugline) {
        if (currentScene) {
          currentScene.synopsis = synopsisBuffer.slice(0, 3).join(" ") || "දර්ශනයේ පසුතල විස්තරය සහ පසුබිම් ක්‍රියාදාමය.";
          parsed.push(currentScene);
          synopsisBuffer = [];
          currentSpeaker = null;
        }

        const sceneNum = parsed.length + 1;
        const isExt = /EXT\.|බාහිර/i.test(trimmed);
        const isNight = /NIGHT|රෑ|රාත්‍රී|DAWN|අලුයම|DARK/i.test(trimmed);

        currentScene = {
          id: `SCENE-${String(sceneNum).padStart(2, "0")}`,
          sceneNumber: sceneNum,
          slugline: trimmed,
          locationType: isExt ? "EXT (බාහිර)" : "INT (අභ්‍යන්තර)",
          timeOfDay: isNight ? "NIGHT / DAWN" : "DAY",
          synopsis: "",
          characters: [],
          props: [],
          dialogues: [],
          plannedShots: 3
        };
      } else if (currentScene) {
        const isCharacterCue = /^(කසුන්|නිමල්|රහස් නියෝජිතයා|ELENA|MARCUS|KAI|DIRECTOR|MAYA)$/i.test(trimmed);

        if (isCharacterCue) {
          currentSpeaker = trimmed;
          if (!currentScene.characters.includes(trimmed)) {
            currentScene.characters.push(trimmed);
          }
        } else if (trimmed.startsWith('"') || (currentSpeaker && trimmed.length > 2)) {
          const dialogueSpeaker = currentSpeaker || "Character";
          currentScene.dialogues.push({
            speaker: dialogueSpeaker,
            line: trimmed.replace(/^["“]|["”]$/g, "")
          });
          currentSpeaker = null;
        } else {
          synopsisBuffer.push(trimmed);
          const inlineChars = trimmed.match(/\b(කසුන්|නිමල්|රහස් නියෝජිතයා|ELENA|MARCUS|KAI)\b/gi);
          if (inlineChars) {
            inlineChars.forEach((c) => {
              const cleaned = c.trim();
              if (!currentScene?.characters.includes(cleaned)) {
                currentScene?.characters.push(cleaned);
              }
            });
          }
        }

        if (/විදුලි පන්දමක්|පන්දම/i.test(trimmed) && !currentScene.props.includes("විදුලි පන්දම")) currentScene.props.push("විදුලි පන්දම");
        if (/ස්කෑනරයක්|ස්කෑනර්/i.test(trimmed) && !currentScene.props.includes("ඩිජිටල් ස්කෑනරය")) currentScene.props.push("ඩිජිටල් ස්කෑනරය");
        if (/WALKIE-TALKIE|සන්නිවේදන/i.test(trimmed) && !currentScene.props.includes("Walkie-Talkie")) currentScene.props.push("Walkie-Talkie");
        if (/BINOCULARS|දුරදක්නය/i.test(trimmed) && !currentScene.props.includes("දුරදක්නය (Binoculars)")) currentScene.props.push("දුරදක්නය (Binoculars)");
        if (/HARD DRIVE|දෘඪ තැටිය/i.test(trimmed) && !currentScene.props.includes("Encrypted Hard Drive")) currentScene.props.push("Encrypted Hard Drive");
        if (/බහාලුම්|CONTAINER/i.test(trimmed) && !currentScene.props.includes("බහාලුම් (Containers)")) currentScene.props.push("බහාලුම් (Containers)");
        if (/හෝලෝග්‍රැෆික්/i.test(trimmed) && !currentScene.props.includes("හෝලෝග්‍රැෆික් උපකරණය")) currentScene.props.push("හෝලෝග්‍රැෆික් උපකරණය");
      }
    }

    if (currentScene) {
      currentScene.synopsis = synopsisBuffer.slice(0, 3).join(" ") || "දර්ශනයේ පසුතල විස්තරය සහ පසුබිම් ක්‍රියාදාමය.";
      parsed.push(currentScene);
    }

    return parsed;
  };

  const [parsedScenes, setParsedScenes] = useState<SceneEntity[]>(() => parseScriptIntoScenes(SINHALA_SCRIPT_TEMPLATE));

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFile(file);
    }
  };

  const handleRunPdfBreakdown = () => {
    if (!uploadedFile) return;
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setHasParsed(true);
      setSelectedSceneIds([]);
      setParsedScenes(parseScriptIntoScenes(SINHALA_SCRIPT_TEMPLATE));
    }, 800);
  };

  const handleRunManualBreakdown = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setHasParsed(true);
      setSelectedSceneIds([]);
      setParsedScenes(parseScriptIntoScenes(scriptText));
    }, 600);
  };

  const handleDeleteScene = (id: string) => {
    setParsedScenes(prev => prev.filter(s => s.id !== id));
    setSelectedSceneIds(prev => prev.filter(selectedId => selectedId !== id));
  };

  const handleToggleSelect = (id: string) => {
    if (selectedSceneIds.includes(id)) {
      setSelectedSceneIds(prev => prev.filter(item => item !== id));
    } else {
      setSelectedSceneIds(prev => [...prev, id]);
    }
  };

  const handleToggleSelectAll = () => {
    if (selectedSceneIds.length === parsedScenes.length) {
      setSelectedSceneIds([]);
    } else {
      setSelectedSceneIds(parsedScenes.map(s => s.id));
    }
  };

  const handleDeleteSelected = () => {
    setParsedScenes(prev => prev.filter(s => !selectedSceneIds.includes(s.id)));
    setSelectedSceneIds([]);
  };

  const handleClearAllScenes = () => {
    setParsedScenes([]);
    setSelectedSceneIds([]);
  };

  const handleSaveEditedScene = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingScene) return;

    setParsedScenes(prev => prev.map(s => s.id === editingScene.id ? editingScene : s));
    setEditingScene(null);
  };

  // Navigate & Pass Data to Storyboard
  const handleGenerateAllStoryboards = () => {
    setIsGeneratingAllStoryboards(true);
    if (typeof window !== "undefined") {
      localStorage.setItem("active_screenplay_scenes", JSON.stringify(parsedScenes));
      localStorage.setItem("storyboard_filter", "ALL");
    }
    setTimeout(() => {
      setIsGeneratingAllStoryboards(false);
      router.push("/storyboard");
    }, 900);
  };

  const handleGenerateSceneStoryboard = (sceneId: string) => {
    setGeneratingSceneId(sceneId);
    if (typeof window !== "undefined") {
      localStorage.setItem("active_screenplay_scenes", JSON.stringify(parsedScenes));
      localStorage.setItem("storyboard_filter", sceneId);
    }
    setTimeout(() => {
      setGeneratingSceneId(null);
      router.push("/storyboard");
    }, 700);
  };

  return (
    <div className="space-y-8 p-6 md:p-8 max-w-7xl mx-auto text-slate-100">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-emerald-950/60">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" /> Intelligent Scene Parser (සිංහල & English)
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Script Breakdown Studio
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            තිර පිටපත Scene-by-Scene, චරිත, බඩු භාණ්ඩ සහ දෙබස් වෙන් කර නිෂ්පාදන පුවරුවට යොමු කරන්න.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleGenerateAllStoryboards}
            disabled={isGeneratingAllStoryboards || parsedScenes.length === 0}
            className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2 cursor-pointer"
          >
            {isGeneratingAllStoryboards ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Sequencing Storyboards...
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4" /> Generate All Storyboards
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column */}
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
                  <h4 className="text-sm font-bold text-white mb-1">Select Screenplay File</h4>
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
                          <Loader2 className="w-4 h-4 animate-spin" /> පිටපතේ Scenes වෙන් කරමින් පවතී...
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
                  placeholder="ඔබේ තිර පිටපත මෙහි paste කරන්න..."
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

        {/* Right Column */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-[#09130e] border border-emerald-950/70 rounded-xl">
            <div className="flex items-center gap-3">
              <button
                onClick={handleToggleSelectAll}
                disabled={parsedScenes.length === 0}
                className="text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-2 transition-colors disabled:opacity-40"
              >
                {selectedSceneIds.length === parsedScenes.length && parsedScenes.length > 0 ? (
                  <CheckSquare className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Square className="w-4 h-4 text-slate-500" />
                )}
                Select All ({parsedScenes.length})
              </button>

              {selectedSceneIds.length > 0 && (
                <button
                  onClick={handleDeleteSelected}
                  className="px-2.5 py-1 rounded-lg bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 text-xs font-semibold flex items-center gap-1.5 transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete Selected ({selectedSceneIds.length})
                </button>
              )}
            </div>

            {parsedScenes.length > 0 && (
              <button
                onClick={handleClearAllScenes}
                className="text-xs text-slate-400 hover:text-red-400 transition-colors"
              >
                Clear All
              </button>
            )}
          </div>

          {isProcessing ? (
            <div className="p-16 rounded-2xl bg-[#09130e] border border-emerald-950/70 text-center flex flex-col items-center justify-center">
              <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
              <h3 className="text-sm font-semibold text-white">තිර පිටපත පරීක්ෂා කරමින් පවතී...</h3>
              <p className="text-xs text-slate-400 mt-1">දර්ශන, චරිත, බඩු භාණ්ඩ සහ දෙබස් වෙන් කරමින් පවතී.</p>
            </div>
          ) : hasParsed && parsedScenes.length > 0 ? (
            <div className="space-y-4 max-h-[750px] overflow-y-auto pr-1">
              {parsedScenes.map((scene) => {
                const isSelected = selectedSceneIds.includes(scene.id);

                return (
                  <div
                    key={scene.id}
                    className={`p-5 rounded-2xl bg-[#09130e] border transition-all space-y-4 ${isSelected ? "border-emerald-500 bg-[#0d1d14]" : "border-emerald-950/70 hover:border-emerald-500/30"
                      }`}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-emerald-950/50">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => handleToggleSelect(scene.id)}
                          className="text-slate-400 hover:text-white"
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-emerald-400" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-600" />
                          )}
                        </button>
                        <span className="text-xs font-bold text-emerald-400 bg-[#0e1d15] px-2 py-0.5 rounded border border-emerald-500/20 font-mono">
                          {scene.id}
                        </span>
                        <h3 className="text-sm font-bold text-white tracking-wide">
                          {scene.slugline}
                        </h3>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px] font-semibold">
                          {scene.locationType}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-500/20 text-[11px] font-semibold">
                          {scene.timeOfDay}
                        </span>

                        <button
                          onClick={() => setEditingScene(scene)}
                          className="p-1.5 rounded-lg bg-[#0e1d15] hover:bg-emerald-500/20 text-slate-400 hover:text-emerald-300 border border-emerald-950/80 transition-all ml-1"
                          title="Edit Scene"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleDeleteScene(scene.id)}
                          className="p-1.5 rounded-lg bg-[#0e1d15] hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-emerald-950/80 transition-all"
                          title="Delete Scene"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed font-light">
                      {scene.synopsis}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                      <div className="space-y-1.5">
                        <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1.5">
                          <Users className="w-3 h-3 text-emerald-400" /> චරිත / Characters ({scene.characters.length})
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
                            <span className="text-xs text-slate-500 italic">පසුබිම් චරිත පමණි</span>
                          )}
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <span className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1.5">
                          <Box className="w-3 h-3 text-emerald-400" /> උපකරණ / Props ({scene.props.length})
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
                            <span className="text-xs text-slate-500 italic">සාමාන්‍ය පසුතල සැකසුම</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {scene.dialogues && scene.dialogues.length > 0 && (
                      <div className="p-3 rounded-xl bg-[#060c08] border border-emerald-950/60 space-y-2 mt-2">
                        <span className="text-[11px] uppercase tracking-wider text-emerald-400 font-semibold flex items-center gap-1.5">
                          <MessageSquare className="w-3 h-3 text-emerald-400" /> දෙබස් / Key Dialogues ({scene.dialogues.length})
                        </span>
                        <div className="space-y-1.5 divide-y divide-emerald-950/30">
                          {scene.dialogues.map((dlg, dIdx) => (
                            <div key={dIdx} className="pt-1.5 first:pt-0 text-xs">
                              <span className="font-semibold text-emerald-300 font-mono text-[11px] mr-2">
                                {dlg.speaker}:
                              </span>
                              <span className="text-slate-300 italic font-light">
                                "{dlg.line}"
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

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
                );
              })}
            </div>
          ) : (
            <div className="p-12 rounded-2xl bg-[#09130e] border border-dashed border-emerald-950 text-center text-slate-400">
              <Film className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-sm font-medium">කිසිදු Scene එකක් නැත. කරුණාකර පිටපතක් Parse කරන්න.</p>
            </div>
          )}
        </div>
      </div>

      {/* Edit Scene Modal */}
      {editingScene && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-lg bg-[#09130e] border border-emerald-500/40 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-emerald-950/70">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-emerald-400" /> Edit Scene ({editingScene.id})
              </h3>
              <button
                onClick={() => setEditingScene(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-[#0e1d15]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditedScene} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Slugline / Title</label>
                <input
                  type="text"
                  required
                  value={editingScene.slugline}
                  onChange={(e) => setEditingScene({ ...editingScene, slugline: e.target.value })}
                  className="w-full bg-[#050b07] border border-emerald-950/80 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500/60"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Location Type</label>
                  <select
                    value={editingScene.locationType}
                    onChange={(e) => setEditingScene({ ...editingScene, locationType: e.target.value })}
                    className="w-full bg-[#050b07] border border-emerald-950/80 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500/60"
                  >
                    <option value="INT (අභ්‍යන්තර)">INT (අභ්‍යන්තර)</option>
                    <option value="EXT (බාහිර)">EXT (බාහිර)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Time of Day</label>
                  <input
                    type="text"
                    value={editingScene.timeOfDay}
                    onChange={(e) => setEditingScene({ ...editingScene, timeOfDay: e.target.value })}
                    className="w-full bg-[#050b07] border border-emerald-950/80 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500/60"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Synopsis / Action Line</label>
                <textarea
                  rows={3}
                  value={editingScene.synopsis}
                  onChange={(e) => setEditingScene({ ...editingScene, synopsis: e.target.value })}
                  className="w-full bg-[#050b07] border border-emerald-950/80 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500/60 leading-relaxed"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-emerald-950/60">
                <button
                  type="button"
                  onClick={() => setEditingScene(null)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}