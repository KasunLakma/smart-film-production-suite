"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  Clapperboard,
  Camera,
  Layers,
  Languages
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
  plannedShots: number;
  visualPrompt: string;
  detectedLang: "SINHALA" | "ENGLISH";
}

export default function ScriptBreakdownPage() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"upload" | "paste">("upload");
  const [rawText, setRawText] = useState<string>("");
  const [fileName, setFileName] = useState<string | null>(null);

  const [scenes, setScenes] = useState<ExtractedScene[]>([]);
  const [selectedScenes, setSelectedScenes] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [statusNote, setStatusNote] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    try {
      const savedScenes = sessionStorage.getItem("eclat_active_scenes");
      const savedFileName = sessionStorage.getItem("eclat_active_filename");
      if (savedScenes) {
        const parsed = JSON.parse(savedScenes);
        setScenes(parsed);
        setSelectedScenes(parsed.map((s: ExtractedScene) => s.sceneNumber));
      }
      if (savedFileName) setFileName(savedFileName);
    } catch (e) {
      console.error(e);
    }
  }, []);

  const updateScenesState = (newScenes: ExtractedScene[], name?: string | null) => {
    setScenes(newScenes);
    setSelectedScenes(newScenes.map((s) => s.sceneNumber));
    if (newScenes.length > 0) {
      sessionStorage.setItem("eclat_active_scenes", JSON.stringify(newScenes));
      if (name !== undefined) {
        if (name) sessionStorage.setItem("eclat_active_filename", name);
        else sessionStorage.removeItem("eclat_active_filename");
      }
    } else {
      sessionStorage.removeItem("eclat_active_scenes");
      sessionStorage.removeItem("eclat_active_filename");
    }
  };

  const extractTextFromPDF = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const runExtraction = async (pdfjsLib: any) => {
        try {
          const arrayBuffer = await file.arrayBuffer();
          const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
          let fullText = "";
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map((item: any) => item.str).join(" ");
            fullText += pageText + "\n\n";
          }
          resolve(fullText);
        } catch (err) {
          reject(err);
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
        script.onerror = () => reject(new Error("PDF Engine load failed."));
        document.body.appendChild(script);
      }
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setErrorMsg(null);
    setIsLoading(true);
    setStatusNote("PDF පිටපත කියවමින් පවතී...");

    try {
      if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
        const text = await extractTextFromPDF(file);
        setRawText(text);
        setStatusNote("PDF පිටපත සූදානම්. දැන් 'Execute Breakdown Parse' ඔබන්න.");
      } else {
        const reader = new FileReader();
        reader.onload = (event) => {
          const text = event.target?.result as string;
          setRawText(text);
          setStatusNote("ස්ක්‍රිප්ට් ගොනුව සූදානම්. දැන් 'Execute Breakdown Parse' ඔබන්න.");
        };
        reader.readAsText(file);
      }
    } catch (err: any) {
      setErrorMsg("PDF කියවීමේදී දෝෂයක්: " + (err.message || ""));
      setStatusNote(null);
    } finally {
      setIsLoading(false);
    }
  };

  // භාෂාව හඳුනාගෙන Storyboard Prompt එක සාදන Logic එක
  const buildEnglishVisualPrompt = (slugline: string, chunk: string, isInt: boolean, isNight: boolean, characters: string[], props: string[]) => {
    let locationEnv = "urban setting";
    const lower = (slugline + " " + chunk).toLowerCase();

    if (lower.includes("කාමර") || lower.includes("room") || lower.includes("safehouse") || lower.includes("නිවස")) {
      locationEnv = "interior moody safehouse room with wooden tables, rain beating against windows";
    } else if (lower.includes("විද්‍යාගාර") || lower.includes("lab") || lower.includes("server") || lower.includes("කම්පියුටර්")) {
      locationEnv = "high-tech research computer lab with glowing server racks and monitors";
    } else if (lower.includes("වරාය") || lower.includes("harbor") || lower.includes("port") || lower.includes("නැව")) {
      locationEnv = "misty dark shipping container harbor dock with cranes and sea mist";
    } else if (lower.includes("පාර") || lower.includes("street") || lower.includes("road") || lower.includes("වීදිය")) {
      locationEnv = "neon-lit wet city asphalt street reflecting rain";
    } else if (lower.includes("ගොඩනැගිල්ල") || lower.includes("building") || lower.includes("rooftop") || lower.includes("වහල")) {
      locationEnv = "industrial building rooftop overlooking a sprawling dark skyline";
    }

    const lighting = isNight ? "dramatic cinematic night lighting, low-key rim lights, neon reflections" : "natural cinematic daytime lighting, sharp directional sunlight";
    const charDesc = characters.length > 0 ? `cinematic characters (${characters.slice(0, 2).join(", ")}) in tense blocking` : "two focused agents";
    const propDesc = props.length > 0 ? `holding ${props[0]}` : "";

    return `Cinematic 16:9 movie still, ${isInt ? "interior" : "exterior"} shot of ${locationEnv}, ${charDesc} ${propDesc}, ${lighting}, 35mm lens anamorphic cinematography, ultra-detailed photorealistic frame, 8k resolution.`;
  };

  const parseScreenplayForStoryboards = (fullText: string): ExtractedScene[] => {
    // භාෂාව හඳුනා ගැනීම (Sinhala characters තිබේදැයි බැලීම)
    const isSinhala = /[\u0D80-\u0DFF]/.test(fullText);
    const detectedLang: "SINHALA" | "ENGLISH" = isSinhala ? "SINHALA" : "ENGLISH";

    const normalizedText = fullText.replace(/(\r\n|\n|\r)/gm, " ");
    const sceneSplitRegex = /(?=SCENE\s*\d+|දර්ශනය\s*\d+|INT\.\s+|EXT\.\s+|අභ්‍යන්තර|බාහිර)/gi;
    let chunks = normalizedText.split(sceneSplitRegex).map((c) => c.trim()).filter((c) => c.length > 25);

    if (chunks.length <= 1) {
      chunks = fullText.split(/\n\s*\n/).map((c) => c.trim()).filter((c) => c.length > 25);
    }

    const propDictionary = [
      "BINOCULARS", "WALKIE-TALKIE", "HARD DRIVE", "GUN", "REVOLVER", "PHONE",
      "MAP", "CAR", "KNIFE", "BAG", "BRIEFCASE", "BOTTLE", "MONEY", "CAMERA", "LAPTOP",
      "LIGHTS", "GPS", "දුරදක්නය", "වෝකි ටෝකි", "හාඩ් ඩ්‍රයිව්", "තුවක්කුව", "දුරකථනය",
      "සිතියම", "රථය", "කාර්", "පිහිය", "බෑගය", "මුදල්", "කැමරාව", "විදුලි පන්දම", "ජීපීඑස්"
    ];

    const extracted: ExtractedScene[] = [];

    chunks.forEach((chunk, index) => {
      const sceneNum = index + 1;
      const isInt = /INT|අභ්‍යන්තර/i.test(chunk);
      const isNight = /NIGHT|රාත්‍රී/i.test(chunk);

      let setting = isInt ? "INT (අභ්‍යන්තර)" : "EXT (බාහිර)";
      let timeOfDay = isNight ? "NIGHT / රාත්‍රී" : "DAY / දහවල්";

      let slugline = `SCENE 0${sceneNum}: ${isInt ? "INT" : "EXT"}. `;
      const headingMatch = chunk.match(/(?:SCENE\s*\d+[:.\-\s]*|දර්ශනය\s*\d+[:.\-\s]*)(.*?)(?=[.?!]|\n|$)/i);
      if (headingMatch && headingMatch[1].length > 4) {
        slugline = `SCENE 0${sceneNum}: ${headingMatch[1].trim()}`;
      } else {
        slugline += `${isInt ? "ආරක්ෂිත ස්ථානය (Safehouse)" : "පිටත මාර්ගය"} - ${timeOfDay}`;
      }

      // Characters
      const foundChars: string[] = [];
      const charCandidates = chunk.match(/([A-Z\u0D80-\u0DFF]{3,20})(?=\s*[:\-])/g);
      if (charCandidates) {
        charCandidates.forEach((c) => {
          const clean = c.trim();
          if (!foundChars.includes(clean) && clean.length < 25 && !clean.includes("SCENE") && !clean.includes("දර්ශනය")) {
            foundChars.push(clean);
          }
        });
      }
      if (foundChars.length === 0) {
        foundChars.push(isSinhala ? "නිමල්" : "MARCUS", isSinhala ? "කසුන්" : "ELENA");
      }

      // Props
      const foundProps: string[] = [];
      propDictionary.forEach((pr) => {
        if (chunk.toUpperCase().includes(pr.toUpperCase()) && !foundProps.includes(pr)) {
          foundProps.push(pr);
        }
      });
      if (foundProps.length === 0) {
        foundProps.push(isSinhala ? "සිතියම" : "MAP", isSinhala ? "දුරකථනය" : "PHONE");
      }

      // Dialogues
      const dialogues: { speaker: string; text: string }[] = [];
      const lines = chunk.split(/[\n.]/);
      lines.forEach((l) => {
        if (l.includes(":") || l.includes("-")) {
          const [spk, txt] = l.split(/[:\-]/);
          if (spk && txt && spk.trim().length < 25 && txt.trim().length > 3) {
            dialogues.push({ speaker: spk.trim(), text: txt.trim() });
          }
        }
      });

      // AI Conditioning English Prompt එකක් ජනනය කිරීම
      const visualPrompt = buildEnglishVisualPrompt(slugline, chunk, isInt, isNight, foundChars, foundProps);

      const cleanSynopsis = chunk.slice(0, 200).trim() + "...";

      extracted.push({
        sceneNumber: sceneNum,
        slugline: slugline.toUpperCase(),
        setting,
        timeOfDay,
        synopsis: cleanSynopsis,
        characters: foundChars,
        props: foundProps,
        dialogues: dialogues.slice(0, 3),
        plannedShots: 2,
        visualPrompt,
        detectedLang
      });
    });

    return extracted.slice(0, 8);
  };

  const handleExecuteParse = () => {
    if (!rawText.trim()) {
      setErrorMsg("කරුණාකර PDF එකක් තෝරන්න හෝ ස්ක්‍රිප්ට් එකක් Paste කරන්න.");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const results = parseScreenplayForStoryboards(rawText);
      updateScenesState(results, fileName);
    } catch (err: any) {
      setErrorMsg("Parse කිරීමේදී දෝෂයක්: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveFile = () => {
    setFileName(null);
    setRawText("");
    setStatusNote(null);
    setErrorMsg(null);
    sessionStorage.removeItem("eclat_active_filename");
    const input = document.getElementById("file-input") as HTMLInputElement;
    if (input) input.value = "";
  };

  const handleDeleteScene = (sceneNum: number) => {
    const updated = scenes.filter((s) => s.sceneNumber !== sceneNum);
    updateScenesState(updated);
  };

  const handleClearAllScenes = () => {
    updateScenesState([], null);
    setRawText("");
    setFileName(null);
    setStatusNote(null);
    setErrorMsg(null);
    const input = document.getElementById("file-input") as HTMLInputElement;
    if (input) input.value = "";
  };

  // Storyboard දත්ත රැගෙන Storyboard Studio වෙත යෑම
  const handleGenerateStoryboards = (targetScenes: ExtractedScene[]) => {
    if (targetScenes.length === 0) return;

    const storyboardCards = targetScenes.flatMap((sc) => [
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
        visualPrompt: sc.visualPrompt.replace("interior shot", "close-up shot on character expressions").replace("exterior shot", "tight action framing"),
        characters: sc.characters,
        props: sc.props,
        imageType: "close"
      }
    ]);

    sessionStorage.setItem("eclat_storyboard_frames", JSON.stringify(storyboardCards));
    router.push("/storyboard");
  };

  const toggleSelectScene = (sceneNum: number) => {
    setSelectedScenes((prev) =>
      prev.includes(sceneNum) ? prev.filter((n) => n !== sceneNum) : [...prev, sceneNum]
    );
  };

  const handleSelectAll = () => {
    if (selectedScenes.length === scenes.length) setSelectedScenes([]);
    else setSelectedScenes(scenes.map((s) => s.sceneNumber));
  };

  return (
    <div className="min-h-screen bg-[#060b08] text-zinc-200 p-8 font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950/90 text-emerald-400 border border-emerald-800/60 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            INTELLIGENT SCENE PARSER (සිංහල & ENGLISH)
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Script Breakdown Studio
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            තීර පිටපත Scene-by-Scene, චරිත, බඩු භාණ්ඩ සහ දෙබස් වෙන් කර නිෂ්පාදන පූර්වයට යොමු කරන්න.
          </p>
        </div>

        {scenes.length > 0 && (
          <button
            onClick={() => {
              const selected = scenes.filter((s) => selectedScenes.includes(s.sceneNumber));
              handleGenerateStoryboards(selected.length > 0 ? selected : scenes);
            }}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-lg shadow-lg shadow-emerald-950/40 transition-all text-sm"
          >
            <Film className="w-4 h-4" />
            Generate All Storyboards ({selectedScenes.length})
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Side: Upload Panel */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="bg-[#0b1410] border border-emerald-900/40 rounded-2xl p-6 shadow-2xl">
            <div className="flex rounded-lg bg-[#060b08] p-1 border border-emerald-950 mb-6">
              <button
                onClick={() => setActiveTab("upload")}
                className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${activeTab === "upload" ? "bg-emerald-500 text-black" : "text-zinc-400 hover:text-white"
                  }`}
              >
                Upload Screenplay (PDF / TXT)
              </button>
              <button
                onClick={() => setActiveTab("paste")}
                className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${activeTab === "paste" ? "bg-emerald-500 text-black" : "text-zinc-400 hover:text-white"
                  }`}
              >
                Paste Script
              </button>
            </div>

            {activeTab === "upload" ? (
              <div className="flex flex-col items-center justify-center border-2 border-dashed border-emerald-900/40 rounded-xl p-8 hover:border-emerald-600/50 transition-colors bg-[#060b08]/50 relative">
                {fileName ? (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-14 h-14 rounded-full bg-emerald-950 flex items-center justify-center text-emerald-400 border border-emerald-800">
                      <Clapperboard className="w-7 h-7" />
                    </div>
                    <span className="font-semibold text-emerald-300 text-sm text-center px-4">
                      {fileName}
                    </span>
                    <button
                      onClick={handleRemoveFile}
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-950/80 hover:bg-red-900 text-red-300 border border-red-800 rounded-md text-xs transition-all"
                    >
                      <X className="w-3.5 h-3.5" />
                      Remove PDF File
                    </button>
                  </div>
                ) : (
                  <>
                    <input
                      type="file"
                      id="file-input"
                      accept=".pdf,.txt,.fdx,.fountain"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                    <label
                      htmlFor="file-input"
                      className="flex flex-col items-center cursor-pointer text-center"
                    >
                      <div className="w-14 h-14 rounded-full bg-emerald-950/80 flex items-center justify-center text-emerald-400 mb-4 border border-emerald-800/50">
                        <UploadCloud className="w-7 h-7" />
                      </div>
                      <span className="font-semibold text-white text-sm">Select Screenplay File</span>
                      <span className="text-xs text-zinc-500 mt-1">Supports Sinhala & English PDFs, .TXT</span>
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
                  placeholder="Paste screenplay text here (සිංහල හෝ English)..."
                  className="w-full bg-[#060b08] border border-emerald-900/40 rounded-xl p-3 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500 font-mono resize-none leading-relaxed"
                />
              </div>
            )}

            {statusNote && (
              <div className="flex items-center gap-2 mt-4 p-3 bg-emerald-950/70 border border-emerald-800/70 rounded-lg text-xs text-emerald-400">
                <RefreshCw className="w-4 h-4 animate-spin flex-shrink-0" />
                <span>{statusNote}</span>
              </div>
            )}

            {errorMsg && (
              <div className="flex items-center gap-2 mt-4 p-3 bg-red-950/50 border border-red-800/60 rounded-lg text-xs text-red-400">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="mt-6">
              <button
                disabled={isLoading || (!rawText.trim() && !fileName)}
                onClick={handleExecuteParse}
                className="w-full py-3.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-xl text-sm flex items-center justify-center gap-2 shadow-xl shadow-emerald-950/30 transition-all disabled:opacity-40"
              >
                {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                Execute Breakdown Parse
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Parsed Scenes Output */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          {scenes.length > 0 ? (
            <>
              <div className="flex items-center justify-between pb-2 border-b border-zinc-800 px-1">
                <button
                  onClick={handleSelectAll}
                  className="flex items-center gap-2 text-xs font-medium text-zinc-400 hover:text-white"
                >
                  {selectedScenes.length === scenes.length ? (
                    <CheckSquare className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Square className="w-4 h-4" />
                  )}
                  Select All ({scenes.length})
                </button>

                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-zinc-800 text-zinc-300 border border-zinc-700">
                    <Languages className="w-3 h-3 text-emerald-400" />
                    Language: {scenes[0]?.detectedLang}
                  </span>
                  <button
                    onClick={handleClearAllScenes}
                    className="flex items-center gap-1.5 px-3 py-1 bg-zinc-900 hover:bg-red-950 text-zinc-400 hover:text-red-400 border border-zinc-800 hover:border-red-800 rounded-md text-xs transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Clear All
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-4 max-h-[750px] overflow-y-auto pr-2 custom-scrollbar">
                {scenes.map((scene) => {
                  const isSelected = selectedScenes.includes(scene.sceneNumber);
                  return (
                    <div
                      key={scene.sceneNumber}
                      className={`p-5 rounded-2xl border transition-all ${isSelected
                          ? "bg-[#0b1410] border-emerald-800/70 shadow-xl shadow-emerald-950/30"
                          : "bg-[#060b08] border-zinc-850 opacity-70"
                        }`}
                    >
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3">
                          <button onClick={() => toggleSelectScene(scene.sceneNumber)}>
                            {isSelected ? (
                              <CheckSquare className="w-4 h-4 text-emerald-400" />
                            ) : (
                              <Square className="w-4 h-4 text-zinc-600" />
                            )}
                          </button>
                          <span className="text-xs px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 font-mono font-bold">
                            SCENE-{String(scene.sceneNumber).padStart(2, "0")}
                          </span>
                          <h3 className="font-bold text-white text-sm">
                            {scene.slugline}
                          </h3>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/50">
                            {scene.setting}
                          </span>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                            {scene.timeOfDay}
                          </span>
                          <button
                            onClick={() => handleDeleteScene(scene.sceneNumber)}
                            className="p-1 rounded bg-zinc-900 hover:bg-red-950 text-zinc-500 hover:text-red-400 border border-zinc-800 ml-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Scene Synopsis */}
                      <p className="text-xs text-zinc-400 mb-3 leading-relaxed bg-[#060b08]/80 p-3 rounded-lg border border-zinc-850">
                        {scene.synopsis}
                      </p>

                      {/* Characters & Props */}
                      <div className="flex flex-col gap-2.5 text-xs mb-3">
                        {scene.characters.length > 0 && (
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-zinc-500 font-medium">චරිත / Characters:</span>
                            {scene.characters.map((char, idx) => (
                              <span
                                key={idx}
                                className="px-2.5 py-0.5 rounded-full bg-emerald-950/70 text-emerald-300 border border-emerald-900/80 text-[11px]"
                              >
                                {char}
                              </span>
                            ))}
                          </div>
                        )}

                        {scene.props.length > 0 && (
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-zinc-500 font-medium">උපකරණ / Props:</span>
                            {scene.props.map((prop, idx) => (
                              <span
                                key={idx}
                                className="px-2.5 py-0.5 rounded-full bg-zinc-800/90 text-zinc-200 border border-zinc-700/60 text-[11px]"
                              >
                                {prop}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Storyboard Prompt Preview */}
                      <div className="mb-4 p-2.5 rounded-lg bg-zinc-950 border border-emerald-950 flex flex-col gap-1">
                        <span className="text-[10px] text-emerald-500 font-semibold flex items-center gap-1">
                          <Camera className="w-3 h-3" />
                          Generated English Visual Conditioning Prompt (16:9):
                        </span>
                        <p className="text-[11px] text-zinc-400 font-mono italic">
                          "{scene.visualPrompt}"
                        </p>
                      </div>

                      {/* Bottom Button */}
                      <div className="flex items-center justify-between pt-3 border-t border-zinc-850">
                        <span className="text-xs text-zinc-400 flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5 text-emerald-400" />
                          {scene.plannedShots} Planned 16:9 Shots
                        </span>
                        <button
                          onClick={() => handleGenerateStoryboards([scene])}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800/60 text-xs font-semibold transition-all"
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
            <div className="h-[480px] flex flex-col items-center justify-center border border-dashed border-zinc-800 rounded-2xl p-8 text-center bg-[#0b1410]/20">
              <div className="w-14 h-14 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 mb-4">
                <FileText className="w-7 h-7" />
              </div>
              <h3 className="text-sm font-semibold text-zinc-300">ස්ක්‍රිප්ට් එකක් ඇතුළත් කර නොමැත</h3>
              <p className="text-xs text-zinc-500 max-w-sm mt-1 leading-relaxed">
                සිංහල හෝ English පිටපතක් ලබා දී **Execute Breakdown Parse** ඔබන්න. ස්ක්‍රිප්ට් එකේ භාෂාව හඳුනාගෙන Storyboard Prompt සකසා දෙනු ඇත.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}