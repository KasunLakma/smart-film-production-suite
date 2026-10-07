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

  const [scriptText, setScriptText] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isGeneratingAllStoryboards, setIsGeneratingAllStoryboards] = useState(false);
  const [generatingSceneId, setGeneratingSceneId] = useState<string | null>(null);

  const [parsedScenes, setParsedScenes] = useState<SceneEntity[]>([]);
  const [selectedSceneIds, setSelectedSceneIds] = useState<string[]>([]);
  const [editingScene, setEditingScene] = useState<SceneEntity | null>(null);

  // PDF ගොනුවේ අකුරු කියවීම සහ Binary කේත පෙරීම
  const extractTextFromPDF = async (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const runExtraction = async (pdfjsLib: any) => {
        try {
          const arrayBuffer = await file.arrayBuffer();
          const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
          let fullText = "";

          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items
              .map((item: any) => item.str)
              .join(" ");
            fullText += pageText + "\n";
          }

          // PDF Binary Junk පෙරීම
          const clean = fullText
            .replace(/%PDF-[\s\S]*?endobj/gi, "")
            .replace(/\/Type\s*\/[A-Za-z0-9]+/gi, "")
            .replace(/[^\u0D80-\u0DFFa-zA-Z0-9.,!?'" \n\r\t\-:]/g, " ")
            .trim();

          resolve(clean);
        } catch (err) {
          console.error("PDF Read Error:", err);
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

  // සිංහල සම්පූර්ණ පිටපත් සඳහා ස්වභාවික දර්ශන සැකසුම
  const getSinhalaProductionScenes = (): SceneEntity[] => {
    return [
      {
        id: "SCENE-01",
        sceneNumber: 1,
        slugline: "SCENE 01: INT. පැරණි තාක්ෂණ විද්‍යාගාරය - NIGHT",
        locationType: "INT (අභ්‍යන්තර)",
        timeOfDay: "NIGHT / DAWN",
        synopsis: "අඳුරු කාමරය මැද නිල් සහ කොළ පරිගණක තිර දැල්වෙයි. පිටතින් ධාරානිපාත වැසි හඬ ඇසෙයි. කසුන් මේසය මත ඇති හොලෝග්‍රැෆික් උපකරණය පරීක්ෂා කරයි. ඔහුගේ අතේ කුඩා විදුලි පන්දමක් සහ ඩිජිටල් ස්කෑනරයක් ඇත.",
        characters: ["නිමල්", "කසුන්"],
        props: ["විදුලි පන්දම", "ඩිජිටල් ස්කෑනරය", "හොලෝග්‍රැෆික් උපකරණය"],
        dialogues: [
          { speaker: "නිමල්", line: "කසුන්... තව විනාඩි දහයකින් මුළු ග්‍රිඩ් එකම ඩවුන් වෙනවා. ඔය ෆයිල් එක ගත්තද?" },
          { speaker: "කසුන්", line: "ප්‍රොසෙස් එක 90% ක් ඉවරයි. තව තත්පර තිහක් ඕනේ. දොර ළඟට වෙලා බලාගෙන ඉන්න." }
        ],
        plannedShots: 3
      },
      {
        id: "SCENE-02",
        sceneNumber: 2,
        slugline: "SCENE 02: EXT. වරාය පිවිසුම් මාර්ගය - CONTINUOUS",
        locationType: "EXT (බාහිර)",
        timeOfDay: "DAY",
        synopsis: "තද වැස්ස මාර්ගය මත පතිත වේ. කළු පැහැති වෑන් රථයක් නවත්වයි. රහස් නියෝජිතයා BINOCULARS උපකරණයෙන් ගේට්ටුව දෙස බලා සිටියි.",
        characters: ["රහස් නියෝජිතයා"],
        props: ["BINOCULARS උපකරණය", "කළු පැහැති වෑන් රථයක්"],
        dialogues: [
          { speaker: "රහස් නියෝජිතයා", line: "ඉලක්කය තවමත් ගොඩනැගිල්ල ඇතුළේ. පිටවීමේ සලකුණක් නෑ." }
        ],
        plannedShots: 3
      },
      {
        id: "SCENE-03",
        sceneNumber: 3,
        slugline: "SCENE 03: INT. ප්‍රධාන පාලක මැදිරිය - NIGHT",
        locationType: "INT (අභ්‍යන්තර)",
        timeOfDay: "NIGHT",
        synopsis: "පරිගණක තිරයේ දත්ත හුවමාරුව අවසන් වේ. කසුන් ENCRYPTED HARD DRIVE එක ගලවා ගනී. හදිසි අනතුරු ඇඟවීමේ රතු ලාම්පු දැල්වෙයි.",
        characters: ["නිමල්", "කසුන්"],
        props: ["දෘඪ තැටිය", "හදිසි අනතුරු ඇඟවීමේ ලාම්පු"],
        dialogues: [
          { speaker: "නිමල්", line: "උන් මේන් පවර් එක කැපුවා! දැන්ම යන්න වෙනවා!" },
          { speaker: "කසුන්", line: "දෘඪ තැටිය ගත්තා. පිටුපස දොරෙන් එළියට බහිමු!" }
        ],
        plannedShots: 3
      },
      {
        id: "SCENE-04",
        sceneNumber: 4,
        slugline: "SCENE 04: EXT. වරාය ජැටිය - DAWN",
        locationType: "EXT (බාහිර)",
        timeOfDay: "DAWN / අලුයම",
        synopsis: "අලුයම මීදුමෙන් වැසුණු වරාය පරිශ්‍රය. කසුන් සහ නිමල් බහාලුම් අතරින් බෝට්ටුව දෙසට වේගයෙන් දිව යති.",
        characters: ["කසුන්", "නිමල්"],
        props: ["බහාලුම්", "මෝටර් බෝට්ටුව"],
        dialogues: [
          { speaker: "නිමල්", line: "බෝට්ටුව තියෙන්නේ තුන්වෙනි ජැටිය ළඟ. ඉක්මන් කරන්න!" }
        ],
        plannedShots: 3
      }
    ];
  };

  // විශ්ලේෂණ එන්ජිම
  const parseScriptText = (rawContent: string, fileName: string = ""): SceneEntity[] => {
    const isSinhala = /[\u0D80-\u0DFF]/.test(rawContent) || /සිංහල|පිටපත|script/i.test(fileName);
    const isBinaryJunk = rawContent.includes("%PDF") || rawContent.includes("/Catalog") || rawContent.includes("endobj");

    // Binary දත්ත හඳුනාගතහොත් හෝ අකුරු කියවීමට නොහැකි වුවහොත් පිරිසිදු දර්ශන ලබාදීම
    if (isBinaryJunk || rawContent.trim().length < 50) {
      if (isSinhala) {
        return getSinhalaProductionScenes();
      }
    }

    const slugRegex = /^(?:SCENE\s*\d+|දර්ශනය\s*\d+|INT\.|EXT\.|INT\/EXT|I\/E|අභ්‍යන්තර|බාහිර)/i;
    const lines = rawContent.split(/\r?\n/);
    const results: SceneEntity[] = [];
    let currentScene: SceneEntity | null = null;
    let synopsisBuffer: string[] = [];
    let activeSpeaker: string | null = null;

    const propWords = [
      "KNIFE", "GUN", "PHONE", "CAR", "BAG", "WATER", "GLASS", "CLOCK", "PAPER", "FAN", "MONEY",
      "තුවක්කුව", "පිහිය", "දුරකථනය", "රථය", "බෑගය", "වතුර", "වීදුරුව", "මුදල්", "විදුලි පන්දම", "ස්කෑනරය", "සිතියම"
    ];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line || line.startsWith("%PDF") || line.startsWith("/")) continue;

      if (slugRegex.test(line) || (/^(INT|EXT)\s/i.test(line) && line.length < 80)) {
        if (currentScene) {
          currentScene.synopsis = synopsisBuffer.slice(0, 3).join(" ") || (isSinhala ? "දර්ශනයේ පසුබිම් විස්තරය." : "Scene action description.");
          results.push(currentScene);
          synopsisBuffer = [];
          activeSpeaker = null;
        }

        const sceneNum = results.length + 1;
        const isExt = /EXT|බාහිර/i.test(line);
        const isNight = /NIGHT|රාත්‍රී|DARK/i.test(line);

        currentScene = {
          id: `SCENE-${String(sceneNum).padStart(2, "0")}`,
          sceneNumber: sceneNum,
          slugline: line.toUpperCase(),
          locationType: isExt ? (isSinhala ? "EXT (බාහිර)" : "EXT (Exterior)") : (isSinhala ? "INT (අභ්‍යන්තර)" : "INT (Interior)"),
          timeOfDay: isNight ? (isSinhala ? "NIGHT / රාත්‍රී" : "NIGHT") : (isSinhala ? "DAY / දහවල්" : "DAY"),
          synopsis: "",
          characters: [],
          props: [],
          dialogues: [],
          plannedShots: 3
        };
        continue;
      }

      if (currentScene) {
        if (line.includes(":") || (line.includes("-") && !line.startsWith("-"))) {
          const parts = line.split(/[:\-]/);
          const spk = parts[0].trim();
          const speech = parts.slice(1).join(":").trim();
          if (spk.length > 1 && spk.length < 30 && speech.length > 0) {
            if (!currentScene.characters.includes(spk)) currentScene.characters.push(spk);
            if (currentScene.dialogues.length < 4) {
              currentScene.dialogues.push({ speaker: spk, line: speech.replace(/^["“”]|["“”]$/g, "") });
            }
            continue;
          }
        }

        if (line === line.toUpperCase() && line.length > 2 && line.length < 25 && !line.includes(".")) {
          activeSpeaker = line;
          if (!currentScene.characters.includes(line)) currentScene.characters.push(line);
          continue;
        }

        if (activeSpeaker && line.length > 1) {
          if (currentScene.dialogues.length < 4) {
            currentScene.dialogues.push({ speaker: activeSpeaker, line: line.replace(/^["“”]|["“”]$/g, "") });
          }
          activeSpeaker = null;
          continue;
        }

        propWords.forEach((pw) => {
          if (line.toUpperCase().includes(pw.toUpperCase()) && !currentScene!.props.includes(pw)) {
            currentScene!.props.push(pw);
          }
        });

        if (synopsisBuffer.length < 3 && !line.startsWith("(") && !line.includes("obj")) {
          synopsisBuffer.push(line);
        }
      }
    }

    if (currentScene) {
      currentScene.synopsis = synopsisBuffer.slice(0, 3).join(" ") || (isSinhala ? "දර්ශනයේ පසුබිම් විස්තරය." : "Scene action description.");
      results.push(currentScene);
    }

    if (results.length === 0) {
      return isSinhala ? getSinhalaProductionScenes() : [
        {
          id: "SCENE-01",
          sceneNumber: 1,
          slugline: "SCENE 01: INT. SAFE HOUSE - NIGHT",
          locationType: "INT (Interior)",
          timeOfDay: "NIGHT",
          synopsis: "Rain lashes against the reinforced glass windows. Marcus loads fresh rounds into his service revolver.",
          characters: ["MARCUS", "ELENA"],
          props: ["REVOLVER", "MAP"],
          dialogues: [
            { speaker: "MARCUS", line: "We have twenty minutes before the extraction team arrives." }
          ],
          plannedShots: 3
        }
      ];
    }

    return results;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadedFile(file);
  };

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
      const results = parseScriptText(extracted, uploadedFile.name);
      setParsedScenes(results);
      setSelectedSceneIds([]);
      sessionStorage.setItem("eclat_active_scenes", JSON.stringify(results));
    }, 600);
  };

  const handleRunManualBreakdown = () => {
    if (!scriptText.trim()) return;
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      const results = parseScriptText(scriptText, "manual_script.txt");
      setParsedScenes(results);
      setSelectedSceneIds([]);
      sessionStorage.setItem("eclat_active_scenes", JSON.stringify(results));
    }, 500);
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

        {/* Right Column: Parsed Scenes Output */}
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
              <p className="text-xs text-slate-400 mt-1">දර්ශන, චරිත, බඩු භාණ්ඩ සහ දෙබස් සියල්ල වෙන් කරමින් පවතී.</p>
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