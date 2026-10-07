"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  Sparkles,
  Users,
  Box,
  UploadCloud,
  Play,
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

export default function ScriptBreakdownPage() {
  const router = useRouter();
  const [inputMode, setInputMode] = useState<"upload" | "paste">("upload");

  // පේජ් එක මුලින්ම විවෘත වන විට කිසිදු දත්තයක් නොමැතිව හිස්ව පවතී
  const [scriptText, setScriptText] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isGeneratingAllStoryboards, setIsGeneratingAllStoryboards] = useState(false);
  const [generatingSceneId, setGeneratingSceneId] = useState<string | null>(null);

  const [parsedScenes, setParsedScenes] = useState<SceneEntity[]>([]);
  const [selectedSceneIds, setSelectedSceneIds] = useState<string[]>([]);
  const [editingScene, setEditingScene] = useState<SceneEntity | null>(null);

  // විශාල PDF පිටපත් (100+ Pages) සියල්ල සම්පූර්ණයෙන්ම කියවා ගැනීමේ එන්ජිම
  const extractTextFromPDF = async (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const runExtraction = async (pdfjsLib: any) => {
        try {
          const arrayBuffer = await file.arrayBuffer();
          const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
          let fullText = "";

          // මුළු පිටු සංඛ්‍යාවම කියවීම
          const numPages = pdf.numPages;
          for (let i = 1; i <= numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items
              .map((item: any) => item.str)
              .join(" ");
            fullText += pageText + "\n\n";
          }
          resolve(fullText);
        } catch (err) {
          console.error("PDF Reading Error", err);
          resolve("");
        }
      };

      if ((window as any).pdfjsLib) {
        runExtraction((window as any).pdfjsLib);
      } else {
        const script = document.createElement("script");
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
        script.onload = () => {
          const pdfjsLib = (window as any).pdfjsLib;
          pdfjsLib.GlobalWorkerOptions.workerSrc =
            "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
          runExtraction(pdfjsLib);
        };
        script.onerror = () => resolve("");
        document.body.appendChild(script);
      }
    });
  };

  // විශ්වීය Screenplay Scene Tokenizer (සිංහල & English ඕනෑම පිටපතකට)
  const parseScriptIntoScenes = (raw: string): SceneEntity[] => {
    if (!raw.trim()) return [];

    const isSinhala = /[\u0D80-\u0DFF]/.test(raw);

    // Sluglines හඳුනා ගැනීමේ Comprehensive RegEx (INT, EXT, SCENE, දර්ශනය, අභ්‍යන්තර, බාහිර)
    const sluglinePattern = /^(?:SCENE\s*\d+[:.\-\s]*|දර්ශනය\s*\d+[:.\-\s]*|(?:INT|EXT|INT\/EXT|I\/E|අභ්‍යන්තර|බාහිර)[\s.:\-_])/i;

    const lines = raw.split(/\r?\n/);
    const parsed: SceneEntity[] = [];
    let currentScene: SceneEntity | null = null;
    let synopsisBuffer: string[] = [];
    let currentSpeaker: string | null = null;

    const propDictionary = [
      "KNIFE", "SWITCH-KNIFE", "SWITCHBLADE", "GUN", "REVOLVER", "PISTOL", "WATER", "GLASS", "PITCHER",
      "FAN", "CLOCK", "PAPER", "BALLOT", "NOTEPAD", "NEWSPAPER", "CIGARETTE", "MATCHES", "DIAGRAM",
      "BINOCULARS", "WALKIE-TALKIE", "HARD DRIVE", "PHONE", "CAR", "BAG", "BRIEFCASE", "MONEY", "CAMERA",
      "පිහිය", "තුවක්කුව", "දුරකථනය", "සිතියම", "වතුර", "වීදුරුව", "පුවත්පත", "විදුලි පන්දම", "ස්කෑනරය",
      "රථය", "කාර්", "බෑගය", "මුදල්", "දෘඪ තැටිය", "ඔරලෝසුව", "ලියුම"
    ];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // 1. Scene Heading හඳුනා ගැනීම
      if (sluglinePattern.test(line) || (/^(INT\.|EXT\.|INT |EXT )/i.test(line) && line.length < 90)) {
        if (currentScene) {
          currentScene.synopsis = synopsisBuffer.slice(0, 4).join(" ") || (isSinhala ? "දර්ශනයේ පසුතල විස්තරය සහ පසුබිම් ක්‍රියාදාමය." : "Dramatic scene sequence and location staging.");
          parsed.push(currentScene);
          synopsisBuffer = [];
          currentSpeaker = null;
        }

        const sceneNum = parsed.length + 1;
        const isExt = /EXT|බාහිර/i.test(line);
        const isNight = /NIGHT|රාත්‍රී|DARK|අඳුරු/i.test(line);
        const isDawn = /DAWN|DUSK|අලුයම/i.test(line);

        let timeStr = isNight ? (isSinhala ? "NIGHT / රාත්‍රී" : "NIGHT") : (isSinhala ? "DAY / දහවල්" : "DAY");
        if (isDawn) timeStr = isSinhala ? "DAWN / අලුයම" : "DAWN";
        if (/SAME|CONTINUOUS|අඛණ්ඩ/i.test(line)) timeStr = "CONTINUOUS";

        currentScene = {
          id: `SCENE-${String(sceneNum).padStart(2, "0")}`,
          sceneNumber: sceneNum,
          slugline: line.toUpperCase(),
          locationType: isExt ? (isSinhala ? "EXT (බාහිර)" : "EXT (Exterior)") : (isSinhala ? "INT (අභ්‍යන්තර)" : "INT (Interior)"),
          timeOfDay: timeStr,
          synopsis: "",
          characters: [],
          props: [],
          dialogues: [],
          plannedShots: 3
        };
        continue;
      }

      // 2. Scene එකක් ඇතුළත Dialogues, Characters, Props හඳුනා ගැනීම
      if (currentScene) {
        // Dialogue: Speaker: Dialogue හෝ Speaker (All-Caps) ඊළඟ පේළියේ දෙබස
        if (line.includes(":") || (line.includes("-") && !line.startsWith("-"))) {
          const delimiter = line.includes(":") ? ":" : "-";
          const parts = line.split(delimiter);
          const speakerCandidate = parts[0].trim();
          const speechCandidate = parts.slice(1).join(delimiter).trim();

          if (speakerCandidate.length > 1 && speakerCandidate.length < 35 && speechCandidate.length > 0) {
            if (!currentScene.characters.includes(speakerCandidate)) {
              currentScene.characters.push(speakerCandidate);
            }
            if (currentScene.dialogues.length < 5) {
              currentScene.dialogues.push({
                speaker: speakerCandidate,
                line: speechCandidate.replace(/^["“”]|["“”]$/g, "")
              });
            }
            continue;
          }
        }

        // Uppercase Speaker Header (උදා: JUROR #8, FOREMAN, JUDGE)
        if (line === line.toUpperCase() && line.length > 2 && line.length < 30 && !line.includes(".") && !line.includes(",")) {
          currentSpeaker = line;
          if (!currentScene.characters.includes(line)) {
            currentScene.characters.push(line);
          }
          continue;
        }

        // පෙර පේළියේ Speaker කෙනෙක් සිටී නම් ඊළඟ පේළිය Dialogue එකක් ලෙස ගැනීම
        if (currentSpeaker && line.length > 2) {
          if (currentScene.dialogues.length < 5) {
            currentScene.dialogues.push({
              speaker: currentSpeaker,
              line: line.replace(/^["“”]|["“”]$/g, "")
            });
          }
          currentSpeaker = null;
          continue;
        }

        // Props හඳුනා ගැනීම
        for (const prop of propDictionary) {
          if (line.toUpperCase().includes(prop.toUpperCase()) && !currentScene.props.includes(prop)) {
            currentScene.props.push(prop);
          }
        }

        // Action Line / Synopsis buffer
        if (synopsisBuffer.length < 4 && !line.startsWith("(")) {
          synopsisBuffer.push(line);
        }
      }
    }

    if (currentScene) {
      currentScene.synopsis = synopsisBuffer.slice(0, 4).join(" ") || (isSinhala ? "දර්ශනයේ පසුතල විස්තරය සහ පසුබිම් ක්‍රියාදාමය." : "Dramatic scene sequence and location staging.");
      parsed.push(currentScene);
    }

    // ස්ක්‍රිප්ට් එකේ සම්මත Sluglines නොමැති නම් ඡේද අනුව Scenes වෙන් කිරීමේ Dynamic Parser
    if (parsed.length <= 1 && raw.trim().length > 100) {
      const dynamicChunks = raw.split(/\n\s*\n/).filter((p) => p.trim().length > 40);
      return dynamicChunks.map((chunk, idx) => {
        const sceneNum = idx + 1;
        const isExt = /EXT|බාහිර/i.test(chunk);
        const isNight = /NIGHT|රාත්‍රී/i.test(chunk);

        const foundChars: string[] = [];
        const charMatches = chunk.match(/([A-Z\u0D80-\u0DFF]{3,20})(?=\s*[:\-])/g);
        if (charMatches) {
          charMatches.forEach((c) => {
            if (!foundChars.includes(c.trim()) && foundChars.length < 5) foundChars.push(c.trim());
          });
        }

        const foundProps: string[] = [];
        propDictionary.forEach((pr) => {
          if (chunk.toUpperCase().includes(pr.toUpperCase()) && !foundProps.includes(pr)) {
            foundProps.push(pr);
          }
        });

        return {
          id: `SCENE-${String(sceneNum).padStart(2, "0")}`,
          sceneNumber: sceneNum,
          slugline: `SCENE ${String(sceneNum).padStart(2, "0")}: ${isExt ? "EXT. SCENE SEQUENCE" : "INT. SCENE SEQUENCE"} - ${isNight ? "NIGHT" : "DAY"}`,
          locationType: isExt ? (isSinhala ? "EXT (බාහිර)" : "EXT (Exterior)") : (isSinhala ? "INT (අභ්‍යන්තර)" : "INT (Interior)"),
          timeOfDay: isNight ? (isSinhala ? "NIGHT / රාත්‍රී" : "NIGHT") : (isSinhala ? "DAY / දහවල්" : "DAY"),
          synopsis: chunk.slice(0, 220).trim() + "...",
          characters: foundChars.length > 0 ? foundChars : [isSinhala ? "ප්‍රධාන චරිතය" : "LEAD ROLE"],
          props: foundProps.length > 0 ? foundProps : [isSinhala ? "සාමාන්‍ය භාණ්ඩ" : "KEY ASSET"],
          dialogues: [],
          plannedShots: 3
        };
      });
    }

    return parsed;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadedFile(file);
  };

  // PDF Script Breakdown Execution
  const handleRunPdfBreakdown = async () => {
    if (!uploadedFile) return;

    setIsProcessing(true);
    let extracted = "";

    try {
      if (uploadedFile.type === "application/pdf" || uploadedFile.name.endsWith(".pdf")) {
        extracted = await extractTextFromPDF(uploadedFile);
      } else {
        extracted = await uploadedFile.text();
      }
    } catch (e) {
      console.error(e);
    }

    setScriptText(extracted);

    setTimeout(() => {
      setIsProcessing(false);
      const results = parseScriptIntoScenes(extracted);
      setParsedScenes(results);
      setSelectedSceneIds([]);
      sessionStorage.setItem("eclat_active_scenes", JSON.stringify(results));
    }, 600);
  };

  // Paste Text Breakdown Execution
  const handleRunManualBreakdown = () => {
    if (!scriptText.trim()) return;
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      const results = parseScriptIntoScenes(scriptText);
      setParsedScenes(results);
      setSelectedSceneIds([]);
      sessionStorage.setItem("eclat_active_scenes", JSON.stringify(results));
    }, 500);
  };

  // සම්පූර්ණ Script එක සහ Scenes ඉවත් කිරීමේ බොත්තම (Remove Script Button)
  const handleRemoveScriptAndClear = () => {
    setUploadedFile(null);
    setScriptText("");
    setParsedScenes([]);
    setSelectedSceneIds([]);
    sessionStorage.removeItem("eclat_active_scenes");
    sessionStorage.removeItem("eclat_storyboard_frames");
    const fileInput = document.getElementById("file-input-upload") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  const handleDeleteScene = (id: string) => {
    const updated = parsedScenes.filter((s) => s.id !== id);
    setParsedScenes(updated);
    setSelectedSceneIds((prev) => prev.filter((selectedId) => selectedId !== id));
    sessionStorage.setItem("eclat_active_scenes", JSON.stringify(updated));
  };

  const handleToggleSelect = (id: string) => {
    if (selectedSceneIds.includes(id)) {
      setSelectedSceneIds((prev) => prev.filter((item) => item !== id));
    } else {
      setSelectedSceneIds((prev) => [...prev, id]);
    }
  };

  const handleToggleSelectAll = () => {
    if (selectedSceneIds.length === parsedScenes.length) {
      setSelectedSceneIds([]);
    } else {
      setSelectedSceneIds(parsedScenes.map((s) => s.id));
    }
  };

  const handleDeleteSelected = () => {
    const updated = parsedScenes.filter((s) => !selectedSceneIds.includes(s.id));
    setParsedScenes(updated);
    setSelectedSceneIds([]);
    sessionStorage.setItem("eclat_active_scenes", JSON.stringify(updated));
  };

  const handleClearAllScenes = () => {
    setParsedScenes([]);
    setSelectedSceneIds([]);
    sessionStorage.removeItem("eclat_active_scenes");
  };

  const handleSaveEditedScene = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingScene) return;
    const updated = parsedScenes.map((s) => (s.id === editingScene.id ? editingScene : s));
    setParsedScenes(updated);
    sessionStorage.setItem("eclat_active_scenes", JSON.stringify(updated));
    setEditingScene(null);
  };

  // Storyboard Studio වෙත යෑම
  const handleGenerateAllStoryboards = () => {
    setIsGeneratingAllStoryboards(true);
    sessionStorage.setItem("eclat_active_scenes", JSON.stringify(parsedScenes));
    setTimeout(() => {
      setIsGeneratingAllStoryboards(false);
      router.push("/storyboard");
    }, 600);
  };

  const handleGenerateSceneStoryboard = (sceneId: string) => {
    setGeneratingSceneId(sceneId);
    sessionStorage.setItem("eclat_active_scenes", JSON.stringify(parsedScenes));
    setTimeout(() => {
      setGeneratingSceneId(null);
      router.push("/storyboard");
    }, 500);
  };

  return (
    <div className="space-y-8 p-6 md:p-8 max-w-7xl mx-auto text-slate-100 font-sans">
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
                <Wand2 className="w-4 h-4" /> Generate All Storyboards ({parsedScenes.length})
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Upload / Paste */}
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
                <label className="border-2 border-dashed border-emerald-950/80 hover:border-emerald-500/50 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all bg-[#050607]/50 group">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-2 group-hover:scale-105 transition-transform">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-white mb-1">Select Screenplay File</h4>
                  <p className="text-xs text-slate-400 max-w-xs mb-2">
                    Supports <strong className="text-slate-200">.PDF</strong>,{" "}
                    <strong className="text-slate-200">.FDX</strong>, and{" "}
                    <strong className="text-slate-200">.TXT</strong>
                  </p>
                  <input
                    id="file-input-upload"
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
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-emerald-400 font-bold text-[11px] bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          {(uploadedFile.size / 1024).toFixed(1)} KB
                        </span>
                        {/* Remove Uploaded Script Button */}
                        <button
                          onClick={handleRemoveScriptAndClear}
                          className="p-1 rounded bg-red-950/60 hover:bg-red-900 text-red-400 border border-red-800/40 transition-colors"
                          title="Remove uploaded script"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={handleRunPdfBreakdown}
                      disabled={isProcessing}
                      className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" /> තිර පිටපතේ සියලුම Scenes වෙන් කරමින් පවතී...
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
                  placeholder="ඔබේ තිර පිටපත මෙහි paste කරන්න (සිංහල හෝ English)..."
                  rows={13}
                  className="w-full bg-[#050607] border border-emerald-950/80 rounded-xl p-4 text-xs font-mono text-slate-200 leading-relaxed focus:outline-none focus:border-emerald-500/50 resize-y"
                />
                <div className="flex items-center gap-2">
                  {scriptText && (
                    <button
                      onClick={handleRemoveScriptAndClear}
                      className="px-3 py-3 rounded-xl bg-red-950/60 hover:bg-red-900 border border-red-800/40 text-red-400 text-xs font-bold transition-all"
                      title="Clear Script"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={handleRunManualBreakdown}
                    disabled={isProcessing || !scriptText.trim()}
                    className="flex-1 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" /> Parse Pasted Script
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Parsed Scenes Output List */}
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
              <h3 className="text-sm font-semibold text-white">තිර පිටපත විශ්ලේෂණය කරමින් පවතී...</h3>
              <p className="text-xs text-slate-400 mt-1">දර්ශන, චරිත, බඩු භාණ්ඩ සහ දෙබස් සම්පූර්ණයෙන්ම වෙන් කරමින් පවතී.</p>
            </div>
          ) : parsedScenes.length > 0 ? (
            <div className="space-y-4 max-h-[750px] overflow-y-auto pr-1 custom-scrollbar">
              {parsedScenes.map((scene) => {
                const isSelected = selectedSceneIds.includes(scene.id);
                return (
                  <div
                    key={scene.id}
                    className={`p-5 rounded-2xl bg-[#09130e] border transition-all space-y-4 ${isSelected
                        ? "border-emerald-500 bg-[#0d1d14]"
                        : "border-emerald-950/70 hover:border-emerald-500/30"
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
                      {/* Characters */}
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
                            <span className="text-xs text-slate-500 italic">ප්‍රධාන චරිත</span>
                          )}
                        </div>
                      </div>

                      {/* Props */}
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

                    {/* Dialogues */}
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
                        <Film className="w-3.5 h-3.5 text-emerald-400" />
                        {scene.plannedShots} Planned Shots
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
              <p className="text-sm font-medium">කිසිදු Scene එකක් ඇතුළත් කර නොමැත.</p>
              <p className="text-xs text-slate-500 mt-1">දකුණු පසින් PDF ගොනුවක් Upload කර හෝ පෙළ Paste කර Parse කරන්න.</p>
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
                  className="w-full bg-[#050607] border border-emerald-950/80 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500/60"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Location Type</label>
                  <select
                    value={editingScene.locationType}
                    onChange={(e) => setEditingScene({ ...editingScene, locationType: e.target.value })}
                    className="w-full bg-[#050607] border border-emerald-950/80 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500/60"
                  >
                    <option value="INT (අභ්‍යන්තර)">INT (අභ්‍යන්තර)</option>
                    <option value="EXT (බාහිර)">EXT (බාහිර)</option>
                    <option value="INT (Interior)">INT (Interior)</option>
                    <option value="EXT (Exterior)">EXT (Exterior)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Time of Day</label>
                  <input
                    type="text"
                    value={editingScene.timeOfDay}
                    onChange={(e) => setEditingScene({ ...editingScene, timeOfDay: e.target.value })}
                    className="w-full bg-[#050607] border border-emerald-950/80 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500/60"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Synopsis / Action Line</label>
                <textarea
                  rows={3}
                  value={editingScene.synopsis}
                  onChange={(e) => setEditingScene({ ...editingScene, synopsis: e.target.value })}
                  className="w-full bg-[#050607] border border-emerald-950/80 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500/60 leading-relaxed"
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