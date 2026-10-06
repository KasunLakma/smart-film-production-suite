"use client";

import React, { useState } from "react";
import {
  FileText,
  UploadCloud,
  Sparkles,
  CheckSquare,
  Square,
  AlertCircle,
  RefreshCw,
  Film,
  Trash2,
  X,
  ArrowRight,
  Clapperboard
} from "lucide-react";

interface ExtractedScene {
  sceneNumber: number;
  slugline: string;
  setting: string;
  timeOfDay: string;
  synopsis: string;
  characters: string[];
  props: string[];
  dialogues: { speaker: string; text: string }[];
}

export default function ScriptBreakdownPage() {
  const [activeTab, setActiveTab] = useState<"upload" | "paste">("upload");
  const [rawText, setRawText] = useState<string>("");
  const [fileName, setFileName] = useState<string | null>(null);

  // Scene State (ආරම්භයේදී හිස් array එකක් තැබීමෙන් පරණ script මැකී පවතී)
  const [scenes, setScenes] = useState<ExtractedScene[]>([]);
  const [selectedScenes, setSelectedScenes] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [statusNote, setStatusNote] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Client-Side PDF Text Extractor
  const extractTextFromPDF = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const loadScript = () => {
        const script = document.createElement("script");
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
        script.onload = async () => {
          try {
            const pdfjsLib = (window as any).pdfjsLib;
            pdfjsLib.GlobalWorkerOptions.workerSrc =
              "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            let fullText = "";

            for (let i = 1; i <= pdf.numPages; i++) {
              const page = await pdf.getPage(i);
              const textContent = await page.getTextContent();
              const pageText = textContent.items
                .map((item: any) => item.str)
                .join(" ");
              fullText += pageText + "\n\n";
            }
            resolve(fullText);
          } catch (err) {
            reject(err);
          }
        };
        script.onerror = () => reject(new Error("PDF Engine එක load කරගත නොහැකි විය."));
        document.body.appendChild(script);
      };

      if ((window as any).pdfjsLib) {
        const pdfjsLib = (window as any).pdfjsLib;
        file.arrayBuffer().then(async (arrayBuffer) => {
          try {
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            let fullText = "";
            for (let i = 1; i <= pdf.numPages; i++) {
              const page = await pdf.getPage(i);
              const textContent = await page.getTextContent();
              const pageText = textContent.items
                .map((item: any) => item.str)
                .join(" ");
              fullText += pageText + "\n\n";
            }
            resolve(fullText);
          } catch (e) {
            reject(e);
          }
        });
      } else {
        loadScript();
      }
    });
  };

  // සිංහල & ඉංග්‍රීසි Script Parser Engine
  const parseScreenplayDynamic = (text: string): ExtractedScene[] => {
    const rawLines = text.split(/\r?\n/);
    const parsed: ExtractedScene[] = [];
    let currentScene: ExtractedScene | null = null;

    // විවිධාකාර Scene Headings හඳුනා ගැනීමේ RegEx
    const sceneRegex = /(?:SCENE|දර්ශනය|දර්ශන|INT\.|EXT\.|INT\/EXT|අභ්‍යන්තර|බාහිර)[\s.:\-_0-9]/i;

    const propDictionary = [
      "GUN", "REVOLVER", "PISTOL", "PHONE", "MOBILE", "MAP", "CAR", "VEHICLE", "KNIFE", "DAGGER",
      "BAG", "BACKPACK", "BRIEFCASE", "BOTTLE", "GLASS", "MONEY", "CASH", "CAMERA", "LAPTOP",
      "COMPUTER", "TORCH", "FLASHLIGHT", "KEY", "KEYS", "LETTER", "DOCUMENT", "ENVELOPE", "SCANNER",
      "තුවක්කුව", "පිස්තෝලය", "දුරකථනය", "සෙලියුලර්", "සිතියම", "කාර්", "රථය", "වාහනය", "පිහිය",
      "බෑගය", "බෑග්", "බෝතලය", "වීදුරුව", "මුදල්", "සල්ලි", "කැමරාව", "ලැප්ටොප්", "පරිගණකය",
      "විදුලි පන්දම", "පන්දම", "යතුර", "යතුරු", "ලිපිය", "සටහන", "ලියුම", "ස්කෑනරය", "ෆයිල්", "ෆෝල්ඩරය"
    ];

    for (let i = 0; i < rawLines.length; i++) {
      const line = rawLines[i].trim();
      if (!line) continue;

      // 1. Scene Heading එකක් හමුවූ විට
      if (sceneRegex.test(line) || line.toUpperCase().startsWith("SCENE") || line.startsWith("දර්ශනය")) {
        if (currentScene) {
          parsed.push(currentScene);
        }

        let setting = "SCENE";
        if (/INT|අභ්‍යන්තර/i.test(line)) setting = "INT (අභ්‍යන්තර)";
        else if (/EXT|බාහිර/i.test(line)) setting = "EXT (බාහිර)";

        let timeOfDay = "DAY";
        if (/NIGHT|රාත්‍රී/i.test(line)) timeOfDay = "NIGHT / රාත්‍රී";
        else if (/DAY|දවල්|දහවල්|උදෑසන/i.test(line)) timeOfDay = "DAY / දහවල්";
        else if (/CONTINUOUS|අඛණ්ඩ/i.test(line)) timeOfDay = "CONTINUOUS";

        currentScene = {
          sceneNumber: parsed.length + 1,
          slugline: line.replace(/^#+\s*/, ""),
          setting,
          timeOfDay,
          synopsis: "",
          characters: [],
          props: [],
          dialogues: [],
        };
        continue;
      }

      // 2. Scene එකක් ඇතුළත දත්ත කියවීම
      if (currentScene) {
        // දෙබස් හඳුනා ගැනීම (Speaker: Dialogue හෝ Speaker - Dialogue)
        if (line.includes(":") || (line.includes("-") && !line.startsWith("-"))) {
          const delimiter = line.includes(":") ? ":" : "-";
          const parts = line.split(delimiter);
          const speakerCandidate = parts[0].trim();
          const speechCandidate = parts.slice(1).join(delimiter).trim();

          if (speakerCandidate.length > 1 && speakerCandidate.length < 35 && speechCandidate.length > 0) {
            if (!currentScene.characters.includes(speakerCandidate)) {
              currentScene.characters.push(speakerCandidate);
            }
            currentScene.dialogues.push({
              speaker: speakerCandidate,
              text: speechCandidate,
            });
            continue;
          }
        }

        // Props හඳුනා ගැනීම
        for (const prop of propDictionary) {
          if (line.toUpperCase().includes(prop.toUpperCase()) && !currentScene.props.includes(prop)) {
            currentScene.props.push(prop);
          }
        }

        // Synopsis (දර්ශන පසුබිම් විස්තරය)
        if (!currentScene.synopsis && line.length > 25 && !line.includes(":")) {
          currentScene.synopsis = line;
        }
      }
    }

    if (currentScene) {
      parsed.push(currentScene);
    }

    // ස්ක්‍රිප්ට් එකේ විශේෂ headings නොමැති නම්, ඡේද අනුව Scenes සාදයි
    if (parsed.length === 0 && text.trim().length > 0) {
      const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim().length > 10);
      paragraphs.slice(0, 5).forEach((p, idx) => {
        const foundChars: string[] = [];
        const foundProps: string[] = [];
        const lines = p.split("\n");
        const dialogues: { speaker: string; text: string }[] = [];

        lines.forEach((l) => {
          if (l.includes(":")) {
            const [spk, txt] = l.split(":");
            if (spk && txt && spk.length < 25) {
              if (!foundChars.includes(spk.trim())) foundChars.push(spk.trim());
              dialogues.push({ speaker: spk.trim(), text: txt.trim() });
            }
          }
          propDictionary.forEach((prop) => {
            if (l.toUpperCase().includes(prop.toUpperCase()) && !foundProps.includes(prop)) {
              foundProps.push(prop);
            }
          });
        });

        parsed.push({
          sceneNumber: idx + 1,
          slugline: `SCENE 0${idx + 1}: දර්ශනය ${idx + 1} - SEQUENCE`,
          setting: idx % 2 === 0 ? "INT (අභ්‍යන්තර)" : "EXT (බාහිර)",
          timeOfDay: idx % 2 === 0 ? "NIGHT / රාත්‍රී" : "DAY / දහවල්",
          synopsis: p.slice(0, 150) + "...",
          characters: foundChars.length > 0 ? foundChars : [`චරිතය ${idx + 1}`],
          props: foundProps.length > 0 ? foundProps : ["ප්‍රධාන උපකරණය"],
          dialogues,
        });
      });
    }

    return parsed;
  };

  // File Upload Handling
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setErrorMsg(null);
    setIsLoading(true);

    try {
      if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
        setStatusNote("PDF පිටපත කියවමින් පවතී...");
        const extracted = await extractTextFromPDF(file);
        setRawText(extracted);
        setStatusNote("Screenplay එක විශ්ලේෂණය කරමින්...");

        const results = parseScreenplayDynamic(extracted);
        setScenes(results);
        setSelectedScenes(results.map((s) => s.sceneNumber));
        setStatusNote(null);
      } else {
        const reader = new FileReader();
        reader.onload = (event) => {
          const content = event.target?.result as string;
          setRawText(content);
          const results = parseScreenplayDynamic(content);
          setScenes(results);
          setSelectedScenes(results.map((s) => s.sceneNumber));
        };
        reader.readAsText(file);
      }
    } catch (err: any) {
      setErrorMsg("ගොනුව කියවීමේදී දෝෂයක් සිදුවිය: " + (err.message || ""));
    } finally {
      setIsLoading(false);
    }
  };

  // Execute Parse Button
  const handleExecuteParse = () => {
    if (!rawText.trim()) {
      setErrorMsg("කරුණාකර PDF/TXT ගොනුවක් තෝරන්න හෝ පෙළ Paste කරන්න.");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const results = parseScreenplayDynamic(rawText);
      setScenes(results);
      setSelectedScenes(results.map((s) => s.sceneNumber));
    } catch (err) {
      setErrorMsg("ස්ක්‍‍රිප්ට් එක Parse කිරීමේදී දෝෂයක් සිදුවිය.");
    } finally {
      setIsLoading(false);
    }
  };

  // තෝරාගත් PDF/File එක ඉවත් කිරීම
  const handleRemoveFile = () => {
    setFileName(null);
    setRawText("");
    setErrorMsg(null);
    setStatusNote(null);
    const fileInput = document.getElementById("script-pdf-file-input") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  // සීන් එකින් එක Delete කිරීම
  const handleDeleteSingleScene = (sceneNum: number) => {
    setScenes((prev) => prev.filter((s) => s.sceneNumber !== sceneNum));
    setSelectedScenes((prev) => prev.filter((n) => n !== sceneNum));
  };

  // සියලුම Scenes මකා දැමීම
  const handleClearAllScenes = () => {
    setScenes([]);
    setSelectedScenes([]);
    setRawText("");
    setFileName(null);
    setErrorMsg(null);
    setStatusNote(null);
    const fileInput = document.getElementById("script-pdf-file-input") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  const toggleSelectScene = (num: number) => {
    setSelectedScenes((prev) =>
      prev.includes(num) ? prev.filter((n) => n !== num) : [...prev, num]
    );
  };

  const handleSelectAll = () => {
    if (selectedScenes.length === scenes.length) {
      setSelectedScenes([]);
    } else {
      setSelectedScenes(scenes.map((s) => s.sceneNumber));
    }
  };

  return (
    <div className="min-h-screen bg-[#070d0a] text-zinc-200 p-8">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-emerald-950/80 text-emerald-400 border border-emerald-800/50 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            INTELLIGENT SCENE PARSER (සිංහල & ENGLISH)
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Script Breakdown Studio
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            තීර පිටපත Scene-by-Scene, චරිත, බඩු භාණ්ඩ සහ දෙබස් වෙන් කර නිෂ්පාදන පූර්වයට යොමු කරන්න.
          </p>
        </div>

        {scenes.length > 0 && (
          <button
            onClick={() => alert(`Scenes (${selectedScenes.join(", ")}) forwarded to 16:9 Storyboard Canvas!`)}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold rounded-lg shadow-lg shadow-emerald-950/30 transition-all text-sm"
          >
            <Film className="w-4 h-4" />
            Generate All Storyboards ({selectedScenes.length})
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Side: Upload / Paste */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="bg-[#0b1410] border border-emerald-900/30 rounded-2xl p-6 shadow-xl">
            <div className="flex rounded-lg bg-[#070d0a] p-1 border border-emerald-950 mb-6">
              <button
                onClick={() => setActiveTab("upload")}
                className={`flex-1 py-2 text-xs font-semibold rounded-md transition-all ${activeTab === "upload"
                    ? "bg-emerald-500 text-black"
                    : "text-zinc-400 hover:text-white"
                  }`}
              >
                Upload Screenplay (PDF / TXT)
              </button>
              <button
                onClick={() => setActiveTab("paste")}
                className={`flex-1 py-2 text-xs font-semibold rounded-md transition-all ${activeTab === "paste"
                    ? "bg-emerald-500 text-black"
                    : "text-zinc-400 hover:text-white"
                  }`}
              >
                Paste Script
              </button>
            </div>

            {activeTab === "upload" ? (
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-emerald-900/40 rounded-xl p-8 hover:border-emerald-600/50 transition-colors bg-[#070d0a]/50 relative">
                {fileName ? (
                  /* තෝරාගත් File එක පෙන්වන සහ Remove කරන කොටස */
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-emerald-950/80 flex items-center justify-center text-emerald-400 border border-emerald-800/40">
                      <Clapperboard className="w-6 h-6" />
                    </div>
                    <span className="font-semibold text-emerald-300 text-sm text-center px-4">
                      {fileName}
                    </span>
                    <button
                      onClick={handleRemoveFile}
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-950/60 hover:bg-red-900/80 text-red-300 border border-red-800/50 rounded-md text-xs transition-all"
                    >
                      <X className="w-3.5 h-3.5" />
                      Remove PDF File
                    </button>
                  </div>
                ) : (
                  <>
                    <input
                      type="file"
                      id="script-pdf-file-input"
                      accept=".pdf,.txt,.fdx,.fountain"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                    <label
                      htmlFor="script-pdf-file-input"
                      className="flex flex-col items-center cursor-pointer text-center"
                    >
                      <div className="w-12 h-12 rounded-full bg-emerald-950/80 flex items-center justify-center text-emerald-400 mb-4 border border-emerald-800/40">
                        <UploadCloud className="w-6 h-6" />
                      </div>
                      <span className="font-medium text-white text-sm">
                        Select Screenplay File
                      </span>
                      <span className="text-xs text-zinc-500 mt-1">
                        Supports Sinhala & English PDFs, .TXT, and .FDX
                      </span>
                    </label>
                  </>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <textarea
                  rows={9}
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  placeholder="Paste script text here (e.g., SCENE 01: INT. ROOM - NIGHT හෝ දර්ශනය 01: අභ්‍යන්තර කාමරය...)..."
                  className="w-full bg-[#070d0a] border border-emerald-900/40 rounded-xl p-3 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500 font-mono resize-none leading-relaxed"
                />
              </div>
            )}

            {/* Status Feedback */}
            {statusNote && (
              <div className="flex items-center gap-2 mt-4 p-3 bg-emerald-950/60 border border-emerald-800/60 rounded-lg text-xs text-emerald-400">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>{statusNote}</span>
              </div>
            )}

            {/* Error Message */}
            {errorMsg && (
              <div className="flex items-center gap-2 mt-4 p-3 bg-red-950/40 border border-red-800/50 rounded-lg text-xs text-red-400">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="mt-6">
              <button
                disabled={isLoading}
                onClick={handleExecuteParse}
                className="w-full py-3 px-4 bg-emerald-500 hover:bg-emerald-400 text-black font-semibold rounded-lg text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/20 transition-all disabled:opacity-50"
              >
                {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                Execute Breakdown Parse
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Parsed Scenes Output Drawer */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          {scenes.length > 0 ? (
            <>
              {/* Controls Bar */}
              <div className="flex items-center justify-between pb-2 border-b border-zinc-800 px-1">
                <button
                  onClick={handleSelectAll}
                  className="flex items-center gap-2 text-xs text-zinc-400 hover:text-white"
                >
                  {selectedScenes.length === scenes.length ? (
                    <CheckSquare className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Square className="w-4 h-4" />
                  )}
                  Select All ({scenes.length})
                </button>

                {/* සම්පූර්ණ Scenes Clear කිරීමේ බොත්තම */}
                <button
                  onClick={handleClearAllScenes}
                  className="flex items-center gap-1.5 px-3 py-1 bg-zinc-900 hover:bg-red-950/60 text-zinc-400 hover:text-red-400 border border-zinc-800 hover:border-red-800/50 rounded-md text-xs transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Clear All Scenes
                </button>
              </div>

              {/* Scene Cards List */}
              <div className="flex flex-col gap-4 max-h-[750px] overflow-y-auto pr-2 custom-scrollbar">
                {scenes.map((scene) => {
                  const isSelected = selectedScenes.includes(scene.sceneNumber);
                  return (
                    <div
                      key={scene.sceneNumber}
                      className={`p-5 rounded-2xl border transition-all ${isSelected
                          ? "bg-[#0b1410] border-emerald-800/60 shadow-lg shadow-emerald-950/20"
                          : "bg-[#070d0a] border-zinc-850 opacity-70"
                        }`}
                    >
                      {/* Scene Heading & Delete Single Scene */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3">
                          <button onClick={() => toggleSelectScene(scene.sceneNumber)}>
                            {isSelected ? (
                              <CheckSquare className="w-4 h-4 text-emerald-400" />
                            ) : (
                              <Square className="w-4 h-4 text-zinc-600" />
                            )}
                          </button>
                          <span className="text-xs px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono">
                            SCENE-{String(scene.sceneNumber).padStart(2, "0")}
                          </span>
                          <h3 className="font-semibold text-white text-sm">
                            {scene.slugline}
                          </h3>
                        </div>

                        {/* Setting, Time & Delete Scene Button */}
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/40">
                            {scene.setting}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                            {scene.timeOfDay}
                          </span>

                          {/* තනි Scene එක Delete කිරීමේ බොත්තම */}
                          <button
                            title="Delete this scene"
                            onClick={() => handleDeleteSingleScene(scene.sceneNumber)}
                            className="p-1 rounded bg-zinc-900 hover:bg-red-950/80 text-zinc-500 hover:text-red-400 border border-zinc-800 hover:border-red-800/50 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Scene Synopsis */}
                      {scene.synopsis && (
                        <p className="text-xs text-zinc-400 mb-4 leading-relaxed bg-[#070d0a]/60 p-3 rounded-lg border border-zinc-800/50">
                          {scene.synopsis}
                        </p>
                      )}

                      {/* Characters & Props Chips */}
                      <div className="flex flex-col gap-2.5 text-xs mb-4">
                        {/* Characters */}
                        {scene.characters.length > 0 && (
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-zinc-500 font-medium">චරිත / Characters ({scene.characters.length}):</span>
                            {scene.characters.map((char, idx) => (
                              <span
                                key={idx}
                                className="px-2.5 py-0.5 rounded-full bg-emerald-950/50 text-emerald-400 border border-emerald-900/60 text-[11px]"
                              >
                                {char}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Props */}
                        {scene.props.length > 0 && (
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-zinc-500 font-medium">උපකරණ / Props ({scene.props.length}):</span>
                            {scene.props.map((prop, idx) => (
                              <span
                                key={idx}
                                className="px-2.5 py-0.5 rounded-full bg-zinc-800/80 text-zinc-300 border border-zinc-700/50 text-[11px]"
                              >
                                {prop}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Dialogues */}
                        {scene.dialogues.length > 0 && (
                          <div className="mt-2 pt-2 border-t border-zinc-800/50 flex flex-col gap-1.5">
                            <span className="text-zinc-500 font-medium">දෙබස් / Key Dialogues ({scene.dialogues.length}):</span>
                            {scene.dialogues.map((dlg, idx) => (
                              <p key={idx} className="text-[11px] text-zinc-300 italic">
                                <span className="font-semibold text-emerald-400 not-italic">{dlg.speaker}: </span>
                                "{dlg.text}"
                              </p>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* පතුලේ ඇති "Generate Storyboard →" Button එක */}
                      <div className="flex items-center justify-between pt-3 border-t border-zinc-850/80">
                        <span className="text-[11px] text-zinc-500">
                          {scene.dialogues.length > 0 ? `${scene.dialogues.length} Dialogue beats` : "Visual Scene Block"}
                        </span>
                        <button
                          onClick={() => alert(`Generating 16:9 Storyboard for Scene ${scene.sceneNumber} (${scene.slugline})...`)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950 hover:bg-emerald-900 text-emerald-300 hover:text-emerald-200 border border-emerald-800/50 text-xs font-medium transition-all"
                        >
                          Generate Storyboard
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            /* හිස් State */
            <div className="h-[480px] flex flex-col items-center justify-center border border-dashed border-zinc-800 rounded-2xl p-8 text-center bg-[#0b1410]/20">
              <div className="w-14 h-14 rounded-full bg-zinc-900/80 border border-zinc-800 flex items-center justify-center text-zinc-500 mb-4">
                <FileText className="w-7 h-7" />
              </div>
              <h3 className="text-sm font-semibold text-zinc-300">
                ස්ක්‍රිප්ට් එකක් ඇතුළත් කර නොමැත
              </h3>
              <p className="text-xs text-zinc-500 max-w-sm mt-1 leading-relaxed">
                වම්පසින් PDF හෝ TXT ගොනුවක් තෝරා හෝ පෙළ Paste කර **Execute Breakdown Parse** ක්ලික් කරන්න.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}