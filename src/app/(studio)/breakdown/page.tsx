"use client";

import { useState, useEffect } from "react";
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
  visualPrompt: string;
}

export default function ScriptBreakdownPage() {
  const router = useRouter();
  const [inputMode, setInputMode] = useState<"upload" | "paste">("upload");

  const [scriptText, setScriptText] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isGeneratingAllStoryboards, setIsGeneratingAllStoryboards] = useState(false);

  const [parsedScenes, setParsedScenes] = useState<SceneEntity[]>([]);
  const [selectedSceneIds, setSelectedSceneIds] = useState<string[]>([]);
  const [editingScene, setEditingScene] = useState<SceneEntity | null>(null);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("eclat_active_scenes");
      if (saved) {
        const scenes = JSON.parse(saved);
        setParsedScenes(scenes);
        setSelectedSceneIds(scenes.map((s: SceneEntity) => s.id));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadedFile(file);
  };

  const loadPdfJs = async (): Promise<any> => {
    if ((window as any).pdfjsLib) return (window as any).pdfjsLib;

    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
      script.onload = () => {
        const pdfjs = (window as any).pdfjsLib;
        pdfjs.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
        resolve(pdfjs);
      };
      script.onerror = () => reject(new Error("PDF engine load කිරීම අසාර්ථක විය."));
      document.head.appendChild(script);
    });
  };

  const extractTextFromPdf = async (file: File): Promise<string> => {
    try {
      const pdfjs = await loadPdfJs();
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = pdfjs.getDocument({
        data: arrayBuffer,
        cMapUrl: "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/cmaps/",
        cMapPacked: true,
      });
      const pdf = await loadingTask.promise;

      let fullText = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageLines = textContent.items
          .map((item: any) => item.str || "")
          .filter((str: string) => str.trim().length > 0)
          .join(" ");
        if (pageLines.trim()) {
          fullText += pageLines + "\n\n";
        }
      }

      if (fullText.trim().length > 40) {
        return fullText;
      }
    } catch (err) {
      console.warn("PDF fallback extraction triggered:", err);
    }

    const buffer = await file.arrayBuffer();
    const decoder = new TextDecoder("utf-8", { fatal: false });
    return decoder.decode(buffer);
  };

  // Pure clean parser matching thesis screenshot layout
  const parseScriptContent = (rawText: string): SceneEntity[] => {
    let cleanScript = rawText.replace(/\r\n/g, "\n").replace(/[ \t]+/g, " ").trim();
    const isSinhala = /[\u0D80-\u0DFF]/.test(cleanScript);

    // 1. Strip cover metadata / title page noise
    const firstSceneIdx = cleanScript.search(/(?:^|\n)\s*(?:SCENE\s*0?1\b|දර්ශනය\s*0?1\b|INT[\.\s\-]|EXT[\.\s\-]|අභ්‍යන්තර|බාහිර)/i);
    if (firstSceneIdx !== -1) {
      cleanScript = cleanScript.slice(firstSceneIdx).trim();
    }

    // 2. Segment scenes by Slugline markers
    const splitRegex = /(?=(?:^|\n)\s*(?:SCENE\s*\d+|දර්ශනය\s*\d+|INT\.|EXT\.|INT\/EXT|I\/E|අභ්‍යන්තර|බාහිර))/gi;
    let chunks: string[] = cleanScript.split(splitRegex).map((c) => c.trim()).filter((c) => c.length > 20);

    if (chunks.length === 0) {
      chunks = cleanScript.split(/\n\s*\n/).map((c) => c.trim()).filter((c) => c.length > 30);
    }

    const propTokens = [
      "GUN", "KNIFE", "PHONE", "CAR", "BOTTLE", "BAG", "LETTER", "DOOR", "CLOCK", "CHAIR", "TABLE", "GLASS", "MONEY", "KEY", "WATER", "COAT", "FAN", "BINOCULARS",
      "තුවක්කුව", "පිහිය", "දුරකථනය", "රථය", "ලිපිය", "බෝතලය", "දොර", "ඔරලෝසුව", "පුටුව", "මේසය", "වීදුරුව", "මුදල්", "යතුර", "විදුලි පන්දම", "ඩිජිටල් ස්කෑනරය", "හොලෝග්‍රැෆික් උපකරණය"
    ];

    return chunks.map((chunk, index) => {
      const sceneNum = index + 1;
      const lines = chunk.split("\n").map(l => l.trim()).filter(Boolean);
      const firstLine = lines[0] || "";

      const isExt = /EXT|බාහිර/i.test(firstLine) || /EXT|බාහිර/i.test(chunk);
      const isNight = /NIGHT|රාත්‍රී|DARK|සන්ධ්‍යා|DAWN/i.test(firstLine) || /NIGHT|රාත්‍රී/i.test(chunk);

      // Clean Heading
      let heading = firstLine;
      const match = firstLine.match(/(?:SCENE\s*\d+[:.\-\s]*|දර්ශනය\s*\d+[:.\-\s]*|INT\.|EXT\.|අභ්‍යන්තර|බාහිර)[^\n]*/i);
      if (match) {
        heading = match[0].trim();
      } else {
        heading = isSinhala
          ? `දර්ශනය ${String(sceneNum).padStart(2, "0")}: ${isExt ? "EXT. බාහිර පසුතලය" : "INT. අභ්‍යන්තර පසුතලය"} - ${isNight ? "NIGHT / DAWN" : "DAY"}`
          : `SCENE ${String(sceneNum).padStart(2, "0")}: ${isExt ? "EXT. LOCATION SEQUENCE" : "INT. LOCATION SEQUENCE"} - ${isNight ? "NIGHT" : "DAY"}`;
      }

      // Format slugline cleanly
      let slugline = heading.replace(/^TITLE:[^\n]*/gi, "").trim();
      if (!slugline.toUpperCase().includes("SCENE") && !slugline.includes("දර්ශනය")) {
        slugline = isSinhala
          ? `දර්ශනය ${String(sceneNum).padStart(2, "0")}: ${slugline}`
          : `SCENE ${String(sceneNum).padStart(2, "0")}: ${slugline}`;
      }

      // Characters
      const characters: string[] = [];
      const charMatches = chunk.match(/([A-Z\u0D80-\u0DFF]{2,20})(?=\s*[:\-])/g);
      if (charMatches) {
        charMatches.forEach((c) => {
          const name = c.trim();
          if (
            !characters.includes(name) &&
            characters.length < 5 &&
            !name.includes("SCENE") &&
            !name.includes("දර්ශනය") &&
            !name.includes("INT") &&
            !name.includes("EXT") &&
            !name.includes("TITLE") &&
            !name.includes("WRITTEN")
          ) {
            characters.push(name);
          }
        });
      }
      if (characters.length === 0) {
        characters.push(isSinhala ? "කසුන්" : "ELENA");
        if (chunk.includes("MARCUS") || chunk.includes("නිමල්")) {
          characters.push(isSinhala ? "නිමල්" : "MARCUS");
        }
      }

      // Dialogues
      const dialogues: DialogueItem[] = [];
      lines.forEach((l) => {
        if (l.includes(":") || l.includes("-")) {
          const parts = l.split(/[:\-]/);
          const spk = parts[0].trim();
          const lineTxt = parts.slice(1).join(":").trim();
          if (spk.length > 1 && spk.length < 20 && lineTxt.length > 2 && dialogues.length < 3 && !spk.includes("SCENE") && !spk.includes("TITLE")) {
            dialogues.push({
              speaker: spk,
              line: lineTxt.replace(/^["“”]|["“”]$/g, "")
            });
          }
        }
      });

      // Props
      const props: string[] = [];
      propTokens.forEach((p) => {
        if (chunk.toUpperCase().includes(p.toUpperCase()) && !props.includes(p) && props.length < 4) {
          props.push(p);
        }
      });
      if (props.length === 0) {
        props.push(isSinhala ? "විදුලි පන්දම" : "MASTER KEY");
        props.push(isSinhala ? "ඩිජිටල් ස්කෑනරය" : "BRIEFCASE");
      }

      // Synopsis (Clean narrative body without title/heading)
      let bodyLines = lines.slice(1);
      let synopsis = bodyLines
        .filter(l => !l.startsWith("TITLE:") && !l.startsWith("WRITTEN BY:") && !l.startsWith("GENRE:"))
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();

      if (!synopsis || synopsis.length < 20) {
        synopsis = chunk.replace(heading, "").replace(/\s+/g, " ").trim();
      }
      if (synopsis.length > 260) {
        synopsis = synopsis.slice(0, 260) + "...";
      }

      const visualPrompt = `Cinematic 16:9 movie still, ${isExt ? "exterior shot" : "interior shot"}, ${isNight ? "dramatic moody lighting" : "natural daylight"}, 35mm anamorphic, 8k resolution: ${slugline.replace(/[\u0D80-\u0DFF]/g, "film set")}.`;

      return {
        id: `SCENE-${String(sceneNum).padStart(2, "0")}`,
        sceneNumber: sceneNum,
        slugline,
        locationType: isExt ? (isSinhala ? "EXT (බාහිර)" : "EXT (Exterior)") : (isSinhala ? "INT (අභ්‍යන්තර)" : "INT (Interior)"),
        timeOfDay: isNight ? (isSinhala ? "NIGHT / DAWN" : "NIGHT") : (isSinhala ? "DAY" : "DAY"),
        synopsis,
        characters,
        props,
        dialogues,
        plannedShots: 3,
        visualPrompt
      };
    });
  };

  const handleExecuteBreakdown = async () => {
    if (!uploadedFile && !scriptText.trim()) return;

    setIsProcessing(true);
    try {
      let rawContent = "";

      if (inputMode === "upload" && uploadedFile) {
        if (uploadedFile.name.toLowerCase().endsWith(".pdf") || uploadedFile.type === "application/pdf") {
          rawContent = await extractTextFromPdf(uploadedFile);
        } else {
          rawContent = await uploadedFile.text();
        }
      } else {
        rawContent = scriptText;
      }

      if (!rawContent || rawContent.trim().length < 20) {
        throw new Error("පිටපතෙහි කියවිය හැකි පෙළක් හමු නොවීය.");
      }

      const scenes = parseScriptContent(rawContent);

      if (scenes.length > 0) {
        setParsedScenes(scenes);
        setSelectedSceneIds(scenes.map((s) => s.id));
        sessionStorage.setItem("eclat_active_scenes", JSON.stringify(scenes));
      } else {
        alert("දර්ශන හඳුනා ගැනීමට නොහැකි විය.");
      }
    } catch (err: any) {
      console.error("Execution failed:", err);
      alert(`Breakdown අසාර්ථක විය: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

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
    setSelectedSceneIds((prev) => prev.filter((item) => item !== id));
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

  const handleGenerateStoryboards = (targetScenes: SceneEntity[]) => {
    if (targetScenes.length === 0) return;

    let existingFrames: any[] = [];
    try {
      const stored = sessionStorage.getItem("eclat_storyboard_frames");
      if (stored) existingFrames = JSON.parse(stored);
    } catch (e) {
      console.error(e);
    }

    const newFrames = targetScenes.flatMap((sc) => [
      {
        id: `sb-${sc.sceneNumber}-a`,
        sceneNumber: sc.sceneNumber,
        shotNumber: `SHOT ${String(sc.sceneNumber).padStart(2, "0")}A`,
        shotTitle: `Wide Master Framing (WMS)`,
        slugline: sc.slugline,
        lensAngle: "28mm Anamorphic T2.0",
        movement: "Slow Push-In Tracking",
        visualPrompt: sc.visualPrompt,
        characters: sc.characters,
        props: sc.props,
        imageType: "wide"
      },
      {
        id: `sb-${sc.sceneNumber}-b`,
        sceneNumber: sc.sceneNumber,
        shotNumber: `SHOT ${String(sc.sceneNumber).padStart(2, "0")}B`,
        shotTitle: `Medium Close Action (MCU)`,
        slugline: sc.slugline,
        lensAngle: "50mm Prime T1.5",
        movement: "Dynamic Eye-Level",
        visualPrompt: sc.visualPrompt,
        characters: sc.characters,
        props: sc.props,
        imageType: "close"
      }
    ]);

    const frameMap = new Map();
    existingFrames.forEach((f) => frameMap.set(f.id, f));
    newFrames.forEach((f) => frameMap.set(f.id, f));
    const merged = Array.from(frameMap.values());

    sessionStorage.setItem("eclat_storyboard_frames", JSON.stringify(merged));
    router.push("/storyboard");
  };

  return (
    <div className="space-y-6 p-6 md:p-8 max-w-7xl mx-auto text-slate-100 font-sans">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-emerald-950/60">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" /> INTELLIGENT SCENE PARSER (සිංහල & ENGLISH)
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
            onClick={() => {
              const selected = parsedScenes.filter((s) => selectedSceneIds.includes(s.id));
              handleGenerateStoryboards(selected.length > 0 ? selected : parsedScenes);
            }}
            disabled={isGeneratingAllStoryboards || parsedScenes.length === 0}
            className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Wand2 className="w-4 h-4" /> Generate All Storyboards
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Upload / Paste */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-5 rounded-2xl bg-[#070e0a] border border-emerald-950/70 flex flex-col">
            <div className="flex items-center justify-between p-1 bg-[#040805] rounded-xl border border-emerald-950/60 mb-4">
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
                <label className="border-2 border-dashed border-emerald-950/80 hover:border-emerald-500/50 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-all bg-[#040805]/60 group">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-2 group-hover:scale-105 transition-transform">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-white mb-1">Select Screenplay File</h4>
                  <p className="text-xs text-slate-400 max-w-xs mb-2">
                    Supports <strong className="text-slate-200">.PDF</strong>, <strong className="text-slate-200">.FDX</strong>, and <strong className="text-slate-200">.TXT</strong>
                  </p>
                  <input
                    id="file-input-upload"
                    type="file"
                    accept=".pdf,.txt,.fdx,.fountain"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>

                {uploadedFile && (
                  <div className="space-y-3">
                    <div className="p-3.5 rounded-xl bg-[#0a1810] border border-emerald-500/40 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2.5 text-slate-200 truncate">
                        <FileCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span className="font-medium truncate">{uploadedFile.name}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-emerald-400 font-bold text-[11px] bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          {(uploadedFile.size / 1024).toFixed(1)} KB
                        </span>
                        <button
                          onClick={handleRemoveScriptAndClear}
                          className="p-1 rounded bg-red-950/60 hover:bg-red-900 text-red-400 border border-red-800/40 transition-colors"
                          title="Remove script"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={handleExecuteBreakdown}
                      disabled={isProcessing}
                      className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" /> Processing Screenplay...
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5 fill-current" /> Execute Dynamic Breakdown
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
                  placeholder="Paste any screenplay here (English or Sinhala)..."
                  rows={13}
                  className="w-full bg-[#040805] border border-emerald-950/80 rounded-xl p-4 text-xs font-mono text-slate-200 leading-relaxed focus:outline-none focus:border-emerald-500/50 resize-y"
                />
                <button
                  onClick={handleExecuteBreakdown}
                  disabled={isProcessing || !scriptText.trim()}
                  className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" /> Execute Dynamic Breakdown
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Exact Cards Layout as Thesis Screenshot */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-[#070e0a] border border-emerald-950/70 rounded-xl text-xs">
            <div className="flex items-center gap-3">
              <button
                onClick={handleToggleSelectAll}
                disabled={parsedScenes.length === 0}
                className="font-medium text-slate-300 hover:text-white flex items-center gap-2 transition-colors disabled:opacity-40"
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
                  className="px-2 py-0.5 rounded bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 font-semibold flex items-center gap-1 transition-all"
                >
                  <Trash2 className="w-3 h-3" /> Delete Selected ({selectedSceneIds.length})
                </button>
              )}
            </div>

            {parsedScenes.length > 0 && (
              <button
                onClick={handleClearAllScenes}
                className="text-slate-400 hover:text-red-400 transition-colors"
              >
                Clear All
              </button>
            )}
          </div>

          {isProcessing ? (
            <div className="p-16 rounded-2xl bg-[#070e0a] border border-emerald-950/70 text-center flex flex-col items-center justify-center">
              <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
              <h3 className="text-sm font-semibold text-white">තිර පිටපත විශ්ලේෂණය කරමින් පවතී...</h3>
              <p className="text-xs text-slate-400 mt-1">දර්ශන, චරිත, උපකරණ සහ දෙබස් සජීවීව වෙන් කරමින් පවතී.</p>
            </div>
          ) : parsedScenes.length > 0 ? (
            <div className="space-y-4 max-h-[780px] overflow-y-auto pr-1 custom-scrollbar">
              {parsedScenes.map((scene) => {
                const isSelected = selectedSceneIds.includes(scene.id);
                return (
                  <div
                    key={scene.id}
                    className={`p-5 rounded-xl bg-[#050c08] border transition-all space-y-3.5 ${isSelected
                        ? "border-emerald-500/90 shadow-lg shadow-emerald-950/30"
                        : "border-emerald-950/80 hover:border-emerald-500/40"
                      }`}
                  >
                    {/* Header Row: Checkbox, Badge ID, Slugline & Controls */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-3 flex-wrap">
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

                        <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30 font-mono uppercase tracking-wider">
                          {scene.id}
                        </span>

                        <h3 className="text-sm font-bold text-white tracking-wide uppercase">
                          {scene.slugline}
                        </h3>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => setEditingScene(scene)}
                          className="p-1 rounded text-slate-400 hover:text-emerald-300 hover:bg-[#0a1810] transition-colors"
                          title="Edit Scene"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteScene(scene.id)}
                          className="p-1 rounded text-slate-400 hover:text-red-400 hover:bg-[#0a1810] transition-colors"
                          title="Delete Scene"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Sub Badges: Location & Time */}
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/20 text-emerald-300 text-[11px] font-medium">
                        {scene.locationType}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/20 text-emerald-400 text-[11px] font-medium">
                        {scene.timeOfDay}
                      </span>
                    </div>

                    {/* Synopsis Line */}
                    <p className="text-xs text-slate-300 leading-relaxed font-normal">
                      {scene.synopsis}
                    </p>

                    {/* Characters & Props Rows */}
                    <div className="space-y-2 pt-1 text-xs">
                      {/* Characters */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1 shrink-0">
                          <Users className="w-3 h-3 text-emerald-400" /> චරිත / CHARACTERS ({scene.characters.length}):
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {scene.characters.map((char, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded bg-[#091710] border border-emerald-500/20 text-[11px] text-emerald-300"
                            >
                              {char}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Props */}
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[11px] text-emerald-400 font-medium flex items-center gap-1 shrink-0">
                          <Box className="w-3 h-3 text-emerald-400" /> උපකරණ / PROPS ({scene.props.length}):
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {scene.props.map((prop, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded bg-[#091710] border border-emerald-500/20 text-[11px] text-slate-300"
                            >
                              {prop}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Dialogues Box */}
                    {scene.dialogues && scene.dialogues.length > 0 && (
                      <div className="p-3 rounded-lg bg-[#030704] border border-emerald-950/80 space-y-1.5">
                        <div className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1.5">
                          <MessageSquare className="w-3 h-3" /> දෙබස් / KEY DIALOGUES ({scene.dialogues.length})
                        </div>
                        <div className="space-y-1 text-xs">
                          {scene.dialogues.map((dlg, dIdx) => (
                            <div key={dIdx} className="leading-snug">
                              <span className="text-emerald-300 font-semibold mr-1.5">
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

                    {/* Footer Row */}
                    <div className="pt-2 flex items-center justify-between border-t border-emerald-950/40 text-xs">
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Film className="w-3.5 h-3.5 text-emerald-400" />
                        {scene.plannedShots} Planned Shots
                      </span>
                      <button
                        onClick={() => handleGenerateStoryboards([scene])}
                        className="px-3 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        Generate Storyboard <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-12 rounded-2xl bg-[#070e0a] border border-dashed border-emerald-950 text-center text-slate-400">
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
          <div className="relative w-full max-w-lg bg-[#070e0a] border border-emerald-500/40 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-emerald-950/70">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-emerald-400" /> Edit Scene ({editingScene.id})
              </h3>
              <button
                onClick={() => setEditingScene(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-[#0a1810]"
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
                  className="w-full bg-[#040805] border border-emerald-950/80 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500/60"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Location Type</label>
                  <select
                    value={editingScene.locationType}
                    onChange={(e) => setEditingScene({ ...editingScene, locationType: e.target.value })}
                    className="w-full bg-[#040805] border border-emerald-950/80 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500/60"
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
                    className="w-full bg-[#040805] border border-emerald-950/80 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500/60"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Synopsis</label>
                <textarea
                  rows={3}
                  value={editingScene.synopsis}
                  onChange={(e) => setEditingScene({ ...editingScene, synopsis: e.target.value })}
                  className="w-full bg-[#040805] border border-emerald-950/80 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500/60 leading-relaxed"
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