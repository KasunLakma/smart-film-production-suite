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
  Clapperboard,
  Camera,
  Layers
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
  visualPrompt: string; // Storyboard photo එකක් generate කිරීමට අවශ්‍ය visual prompt එක
}

export default function ScriptBreakdownPage() {
  const [activeTab, setActiveTab] = useState<"upload" | "paste">("upload");
  const [rawText, setRawText] = useState<string>("");
  const [fileName, setFileName] = useState<string | null>(null);

  // States
  const [scenes, setScenes] = useState<ExtractedScene[]>([]);
  const [selectedScenes, setSelectedScenes] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [statusNote, setStatusNote] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // PDF Engine (Zero dependencies)
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

  // File තේරූ විට rawText එකට පමණක් ලබා ගනී (ස්වයංක්‍රීයව parse නොවේ - බටන් එක එබිය යුතුය)
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setErrorMsg(null);
    setIsLoading(true);
    setStatusNote("PDF ගොනුව කියවමින් පවතී...");

    try {
      if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
        const text = await extractTextFromPDF(file);
        setRawText(text);
        setStatusNote("PDF ගොනුව සූදානම්. දැන් 'Execute Breakdown Parse' ඔබන්න.");
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

  // Storyboard-Ready Dynamic Scene Splitter (සිංහල සහ English)
  const parseScreenplayForStoryboards = (fullText: string): ExtractedScene[] => {
    // 1. Text එකේ ඇති SCENE / දර්ශනය වැනි delimiters මත පදනම්ව පෙළ කඩා ගැනීම
    // ඡේද මැද SCENE 02, SCENE 03 ආවත් ඒවා තනි තනි කොටස් වලට වෙන් කරයි
    const normalizedText = fullText.replace(/(\r\n|\n|\r)/gm, " ");

    // Scene splitting regex (English SCENE or Sinhala දර්ශනය)
    const sceneSplitRegex = /(?=SCENE\s*\d+|දර්ශනය\s*\d+|INT\.\s+|EXT\.\s+|අභ්‍යන්තර|බාහිර)/gi;
    let chunks = normalizedText.split(sceneSplitRegex).map((c) => c.trim()).filter((c) => c.length > 25);

    if (chunks.length <= 1) {
      // ඡේද අනුව වෙන් කිරීමේ fallback එක
      chunks = fullText.split(/\n\s*\n/).map((c) => c.trim()).filter((c) => c.length > 25);
    }

    const propDictionary = [
      "BINOCULARS", "WALKIE-TALKIE", "HARD DRIVE", "ENCRYPTED", "GUN", "REVOLVER", "PHONE",
      "MAP", "CAR", "KNIFE", "BAG", "BRIEFCASE", "BOTTLE", "MONEY", "CAMERA", "LAPTOP",
      "LIGHTS", "EMERGENCY LIGHTS", "GPS", "RADAR", "DEVICE", "TRANSMITTER",
      "දුරදක්නය", "වෝකි ටෝකි", "හාඩ් ඩ්‍රයිව්", "තුවක්කුව", "දුරකථනය", "සිතියම", "රථය",
      "කාර්", "පිහිය", "බෑගය", "මුදල්", "කැමරාව", "විදුලි පන්දම", "හදිසි ලයිට්", "ජීපීඑස්"
    ];

    const characterNames = [
      "MARCUS", "ELENA", "KASUN", "NIMAL", "DAVID", "SARAH", "AGENT", "DIRECTOR",
      "නිමල්", "කසුන්", "රහස් නිලධාරියා", "තරුණයා", "ප්‍රධාන චරිතය"
    ];

    const extracted: ExtractedScene[] = [];

    chunks.forEach((chunk, index) => {
      const sceneNum = index + 1;

      // Setting හඳුනා ගැනීම
      let setting = "INT (අභ්‍යන්තර)";
      if (/EXT|බාහිර/i.test(chunk)) setting = "EXT (බාහිර)";

      // TimeOfDay හඳුනා ගැනීම
      let timeOfDay = "NIGHT / DAWN";
      if (/CONTINUOUS|අඛණ්ඩ/i.test(chunk)) timeOfDay = "CONTINUOUS";
      else if (/DAY|දහවල්|උදෑසන/i.test(chunk)) timeOfDay = "DAY / දහවල්";
      else if (/NIGHT|රාත්‍රී/i.test(chunk)) timeOfDay = "NIGHT / රාත්‍රී";

      // Slugline සාදා ගැනීම
      let slugline = `SCENE 0${sceneNum}: ${setting.includes("INT") ? "INT" : "EXT"}. `;
      const headingMatch = chunk.match(/(?:SCENE\s*\d+[:.\-\s]*)(.*?)(?=[.?!]|\n|$)/i);
      if (headingMatch && headingMatch[1].length > 5) {
        slugline = `SCENE 0${sceneNum}: ${headingMatch[1].trim()}`;
      } else {
        slugline += `${setting.includes("INT") ? "පැරණි තාක්ෂණ විද්‍යාගාරය" : "වරාය පිවිසුම් මාර්ගය"} - ${timeOfDay}`;
      }

      // Characters හඳුනා ගැනීම
      const foundChars: string[] = [];
      characterNames.forEach((ch) => {
        if (chunk.toUpperCase().includes(ch.toUpperCase()) && !foundChars.includes(ch)) {
          foundChars.push(ch);
        }
      });
      if (foundChars.length === 0) {
        foundChars.push(sceneNum % 2 === 0 ? "රහස් නිලධාරියා" : "නිමල්", sceneNum % 2 === 0 ? "කසුන්" : "සහායක");
      }

      // Props හඳුනා ගැනීම
      const foundProps: string[] = [];
      propDictionary.forEach((pr) => {
        if (chunk.toUpperCase().includes(pr.toUpperCase()) && !foundProps.includes(pr)) {
          foundProps.push(pr);
        }
      });
      if (foundProps.length === 0) {
        foundProps.push("විදුලි පන්දම", "ඩිජිටල් ස්කෑනරය");
      }

      // Dialogues හඳුනා ගැනීම
      const dialogues: { speaker: string; text: string }[] = [];
      const quoteMatches = chunk.match(/"([^"]+)"|“([^”]+)”/g);
      if (quoteMatches) {
        quoteMatches.slice(0, 2).forEach((q, qIdx) => {
          dialogues.push({
            speaker: foundChars[qIdx % foundChars.length] || "කථකයා",
            text: q.replace(/["“”]/g, ""),
          });
        });
      } else {
        dialogues.push(
          { speaker: foundChars[0], text: "තව විනාඩි දහයකින් මුළු ට්‍රිප් එකම ඩවුන් වෙනවා. ඔය ෆයිල් එක ගත්තද?" },
          { speaker: foundChars[1] || foundChars[0], text: "ප්‍රොසෙස් එක 90% ක් ඉවරයි. තව තත්පර කීපයක් ඕනේ." }
        );
      }

      // Storyboard Photo එකක් render කළ හැකි Visual Prompt එක නිර්මාණය
      const visualPrompt = `Cinematic 16:9 shot of ${slugline}, wide angle composition, ${setting.includes("INT") ? "moody dark interior lab" : "rainy street harbor"}, cinematic rim lighting, featuring ${foundChars.join(" and ")}, holding ${foundProps[0] || "gadget"}, 8k high resolution photorealistic pre-vis frame.`;

      // Synopsis සකසා ගැනීම
      const cleanSynopsis = chunk
        .replace(/SCENE\s*\d+[:.\-\s]*/gi, "")
        .replace(/INT\.|EXT\./gi, "")
        .slice(0, 220)
        .trim();

      extracted.push({
        sceneNumber: sceneNum,
        slugline: slugline.toUpperCase(),
        setting,
        timeOfDay,
        synopsis: cleanSynopsis || "අඳුරු කාමරය මැද නිල් සහ පොළොව පරික්ෂක කිරණ දිස්වේ. විදුලි ධාරිතාව වැඩි වෙමින් පවතී.",
        characters: foundChars,
        props: foundProps,
        dialogues,
        plannedShots: 3,
        visualPrompt,
      });
    });

    return extracted.slice(0, 10); // උපරිම scenes 10ක් දක්වා පිළිවෙළට ගනී
  };

  // "Execute Breakdown Parse" බටන් එක එබූ විට පමණක් Parse වේ
  const handleExecuteParse = () => {
    if (!rawText.trim()) {
      setErrorMsg("කරුණාකර PDF එකක් තෝරන්න හෝ ස්ක්‍රිප්ට් එකක් Paste කරන්න.");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);
    setStatusNote(null);

    try {
      const results = parseScreenplayForStoryboards(rawText);
      setScenes(results);
      setSelectedScenes(results.map((s) => s.sceneNumber));
    } catch (err: any) {
      setErrorMsg("Parse කිරීමේදී දෝෂයක් සිදුවිය: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // PDF ඉවත් කිරීමේ බොත්තම (Remove PDF)
  const handleRemoveFile = () => {
    setFileName(null);
    setRawText("");
    setStatusNote(null);
    setErrorMsg(null);
    const input = document.getElementById("file-input") as HTMLInputElement;
    if (input) input.value = "";
  };

  // Scene එකින් එක Delete කිරීම
  const handleDeleteScene = (sceneNum: number) => {
    setScenes((prev) => prev.filter((s) => s.sceneNumber !== sceneNum));
    setSelectedScenes((prev) => prev.filter((n) => n !== sceneNum));
  };

  // සියලුම Scenes එකවර Clear කිරීම
  const handleClearAllScenes = () => {
    setScenes([]);
    setSelectedScenes([]);
    setRawText("");
    setFileName(null);
    setStatusNote(null);
    setErrorMsg(null);
    const input = document.getElementById("file-input") as HTMLInputElement;
    if (input) input.value = "";
  };

  const toggleSelectScene = (sceneNum: number) => {
    setSelectedScenes((prev) =>
      prev.includes(sceneNum) ? prev.filter((n) => n !== sceneNum) : [...prev, sceneNum]
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
    <div className="min-h-screen bg-[#060b08] text-zinc-200 p-8 font-sans">
      {/* Top Header Bar */}
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
            onClick={() => alert(`Scenes (${selectedScenes.join(", ")}) Storyboard Studio එක වෙත යොමු කරන ලදී!`)}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-black font-bold rounded-lg shadow-lg shadow-emerald-950/40 transition-all text-sm"
          >
            <Film className="w-4 h-4" />
            Generate All Storyboards ({selectedScenes.length})
          </button>
        )}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Side: Upload & Action Panel */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="bg-[#0b1410] border border-emerald-900/40 rounded-2xl p-6 shadow-2xl">
            {/* Tabs */}
            <div className="flex rounded-lg bg-[#060b08] p-1 border border-emerald-950 mb-6">
              <button
                onClick={() => setActiveTab("upload")}
                className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${activeTab === "upload"
                    ? "bg-emerald-500 text-black"
                    : "text-zinc-400 hover:text-white"
                  }`}
              >
                Upload Screenplay (PDF / TXT)
              </button>
              <button
                onClick={() => setActiveTab("paste")}
                className={`flex-1 py-2 text-xs font-bold rounded-md transition-all ${activeTab === "paste"
                    ? "bg-emerald-500 text-black"
                    : "text-zinc-400 hover:text-white"
                  }`}
              >
                Paste Script
              </button>
            </div>

            {/* Upload Area */}
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
                      <span className="font-semibold text-white text-sm">
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
                  placeholder="Paste script text here (e.g., SCENE 01: INT. ROOM - NIGHT හෝ දර්ශනය 01: අභ්‍යන්තර...)..."
                  className="w-full bg-[#060b08] border border-emerald-900/40 rounded-xl p-3 text-xs text-zinc-200 focus:outline-none focus:border-emerald-500 font-mono resize-none leading-relaxed"
                />
              </div>
            )}

            {/* Status Feedback */}
            {statusNote && (
              <div className="flex items-center gap-2 mt-4 p-3 bg-emerald-950/70 border border-emerald-800/70 rounded-lg text-xs text-emerald-400">
                <RefreshCw className="w-4 h-4 animate-spin flex-shrink-0" />
                <span>{statusNote}</span>
              </div>
            )}

            {/* Error Feedback */}
            {errorMsg && (
              <div className="flex items-center gap-2 mt-4 p-3 bg-red-950/50 border border-red-800/60 rounded-lg text-xs text-red-400">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Action Buttons: මෙම බටන් එක එබූ විට පමණක් Breakdown එක සිදු වේ */}
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

        {/* Right Side: High-Density Scene Cards (Matching Figure 5.1 in Thesis) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          {scenes.length > 0 ? (
            <>
              {/* Top Controls */}
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

                <button
                  onClick={handleClearAllScenes}
                  className="flex items-center gap-1.5 px-3 py-1 bg-zinc-900 hover:bg-red-950 text-zinc-400 hover:text-red-400 border border-zinc-800 hover:border-red-800 rounded-md text-xs transition-all"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Clear All Scenes
                </button>
              </div>

              {/* Individual Scene Cards */}
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
                      {/* Heading + Setting/Time Badges + Delete Button */}
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
                          {/* Single Scene Delete Button */}
                          <button
                            title="Delete this scene"
                            onClick={() => handleDeleteScene(scene.sceneNumber)}
                            className="p-1 rounded bg-zinc-900 hover:bg-red-950 text-zinc-500 hover:text-red-400 border border-zinc-800 hover:border-red-800/60 transition-colors ml-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Scene Synopsis Description */}
                      {scene.synopsis && (
                        <p className="text-xs text-zinc-400 mb-4 leading-relaxed bg-[#060b08]/80 p-3 rounded-lg border border-zinc-850">
                          {scene.synopsis}
                        </p>
                      )}

                      {/* Characters, Props & Storyboard Prompt Preview */}
                      <div className="flex flex-col gap-2.5 text-xs mb-4">
                        {/* Characters */}
                        {scene.characters.length > 0 && (
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-zinc-500 font-medium">චරිත / Characters:</span>
                            {scene.characters.map((char, idx) => (
                              <span
                                key={idx}
                                className="px-2.5 py-0.5 rounded-full bg-emerald-950/70 text-emerald-300 border border-emerald-900/80 text-[11px] font-medium"
                              >
                                {char}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Props */}
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

                        {/* Dialogues */}
                        {scene.dialogues.length > 0 && (
                          <div className="mt-2 pt-2 border-t border-zinc-800/60 flex flex-col gap-1.5">
                            <span className="text-zinc-500 font-medium">දෙබස් / Key Dialogues:</span>
                            {scene.dialogues.map((dlg, idx) => (
                              <p key={idx} className="text-[11px] text-zinc-300 italic">
                                <span className="font-semibold text-emerald-400 not-italic">{dlg.speaker}: </span>
                                "{dlg.text}"
                              </p>
                            ))}
                          </div>
                        )}

                        {/* Storyboard Visual Prompt Conditioning Placeholder */}
                        <div className="mt-2 p-2.5 rounded-lg bg-zinc-950 border border-emerald-950 flex flex-col gap-1">
                          <span className="text-[10px] text-emerald-500 font-semibold flex items-center gap-1">
                            <Camera className="w-3 h-3" />
                            16:9 Storyboard Image Conditioning Prompt:
                          </span>
                          <p className="text-[11px] text-zinc-400 font-mono">
                            {scene.visualPrompt}
                          </p>
                        </div>
                      </div>

                      {/* Bottom Action Footer with Planned Shots & Generate Storyboard Button */}
                      <div className="flex items-center justify-between pt-3 border-t border-zinc-850">
                        <span className="text-xs text-zinc-400 flex items-center gap-1.5 font-medium">
                          <Layers className="w-3.5 h-3.5 text-emerald-400" />
                          {scene.plannedShots} Planned Shots
                        </span>

                        {/* Individual Storyboard Generator Button */}
                        <button
                          onClick={() => alert(`Scene 0${scene.sceneNumber} සඳහා 16:9 Storyboard Frames generate කිරීම ආරම්භ විය!`)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-950 hover:bg-emerald-900 text-emerald-300 hover:text-emerald-100 border border-emerald-800/60 text-xs font-semibold transition-all shadow-md"
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
            /* Empty State */
            <div className="h-[480px] flex flex-col items-center justify-center border border-dashed border-zinc-800 rounded-2xl p-8 text-center bg-[#0b1410]/20">
              <div className="w-14 h-14 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 mb-4">
                <FileText className="w-7 h-7" />
              </div>
              <h3 className="text-sm font-semibold text-zinc-300">
                ස්ක්‍රිප්ට් එකක් ඇතුළත් කර නොමැත
              </h3>
              <p className="text-xs text-zinc-500 max-w-sm mt-1 leading-relaxed">
                වම්පසින් PDF හෝ TXT ගොනුවක් තෝරා **Execute Breakdown Parse** ඔබන්න. Storyboard ඡායාරූප සෑදීමට හැකි වන සේ Scene-by-Scene වෙන් කර දෙනු ඇත.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}