"use client";

import { clearScriptDependents } from "@/lib/store";
import { useState, useEffect, useRef } from "react";
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

// සාමාන්‍ය screenplay format: චරිතයේ නම ලොකු අකුරින් තනි පේළියක, ඊට පහළින් දෙබස
const CUE_RE = /^([A-Z][A-Z0-9 .'\-]{1,30}?)(?:\s*\((?:V\.O\.|O\.S\.|O\.C\.|CONT[’']?D|FILTERED|ON [A-Z ]+|PRE-LAP)\))?\s*$/;
const NOT_A_NAME = /^(INT|EXT|I\/E|FADE|CUT|DISSOLVE|SMASH|CONTINUED|CONTINUOUS|MORE|THE END|TITLE|SUPER|ANGLE|CLOSE|INSERT|BACK TO|LATER|MONTAGE|FLASHBACK|END OF|OMITTED|SERIES OF|INTERCUT|SCENE|DAY|NIGHT)\b/;

const extractCues = (chunk: string): { names: string[]; dialogues: DialogueItem[] } => {
  const lines = chunk.split("\n").map((l) => l.trim());
  const counts = new Map<string, number>();
  const dialogues: DialogueItem[] = [];
  for (let i = 0; i < lines.length - 1; i++) {
    const line = lines[i];
    if (!line || line.length > 38 || /[.:!?]$/.test(line.replace(/\)$/, "")) ) continue;
    const m = line.match(CUE_RE);
    if (!m || NOT_A_NAME.test(line)) continue;
    const next = lines[i + 1];
    if (!next || CUE_RE.test(next)) continue; // දෙබසක් පහළින් තිබිය යුතුය
    const name = m[1].trim();
    counts.set(name, (counts.get(name) || 0) + 1);
    if (dialogues.length < 3) {
      // දෙබස = හිස් පේළියක් එන තුරු පේළි
      const spoken: string[] = [];
      for (let j = i + 1; j < lines.length && lines[j] && spoken.length < 4; j++) {
        if (!/^\(.*\)$/.test(lines[j])) spoken.push(lines[j]);
      }
      const text = spoken.join(" ").replace(/\s+/g, " ").trim();
      if (text.length > 2) dialogues.push({ speaker: name, line: text.slice(0, 180) });
    }
  }
  const names = Array.from(counts.entries()).sort((a, b) => b[1] - a[1]).map(([n]) => n);
  return { names, dialogues };
};

// පරීක්ෂණ: දර්ශන browser එකේ ස්ථිරව සුරකී (tab එක වැසුවත් නොමැකේ). Budget, Roster, Call Sheet, Locations පිටු මෙයින් කියවයි.
const persistScenes = (scenes: unknown) => {
  try {
    const j = JSON.stringify(scenes);
    sessionStorage.setItem("eclat_active_scenes", j);
    localStorage.setItem("eclat_scenes_v1", j);
  } catch { }
};
const clearScenes = () => {
  try {
    sessionStorage.removeItem("eclat_active_scenes");
    localStorage.removeItem("eclat_scenes_v1");
  } catch { }
};

export default function ScriptBreakdownPage() {
  const router = useRouter();
  const [inputMode, setInputMode] = useState<"upload" | "paste">("upload");

  const [scriptText, setScriptText] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState("");
  const [aiReport, setAiReport] = useState<{ total: number; ai: number; basic: number; reason: string; models: string[]; langWarn: number } | null>(null);
  const [isGeneratingAllStoryboards, setIsGeneratingAllStoryboards] = useState(false);

  const [parsedScenes, setParsedScenes] = useState<SceneEntity[]>([]);
  const [selectedSceneIds, setSelectedSceneIds] = useState<string[]>([]);
  const [editingScene, setEditingScene] = useState<SceneEntity | null>(null);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("eclat_active_scenes") || localStorage.getItem("eclat_scenes_v1");
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

  // Layout-aware PDF text extractor (වචන සහ පේළි ඇලීම වළක්වයි)
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

      let fullScript = "";
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();

        // සමහර PDF වල සෑම අකුරක්ම වෙන වෙනම text කොටසකි. ඒ නිසා අතරට හිස්තැන් දමන්නේ
        // කොටස් දෙකක් අතර සැබෑ ඉඩක් (gap) ඇති විට පමණි.
        let pageStr = "";
        let lastY: number | null = null;
        let lastEndX: number | null = null;
        let pendingBreak = false;

        for (const item of textContent.items as any[]) {
          const str: string = item.str;
          if (item.hasEOL) pendingBreak = true;
          if (!str) continue;
          const x = item.transform ? item.transform[4] : 0;
          const y = item.transform ? item.transform[5] : 0;
          const h = Math.abs(item.height || (item.transform && item.transform[3]) || 10) || 10;
          const w = item.width || 0;

          if (lastY === null) {
            pageStr += str;
          } else if (pendingBreak || Math.abs(y - lastY) > h * 0.6) {
            pageStr += "\n" + str;
          } else {
            const gap = lastEndX !== null ? x - lastEndX : 0;
            const needSpace = gap > h * 0.18 && !pageStr.endsWith(" ") && !str.startsWith(" ");
            pageStr += (needSpace ? " " : "") + str;
          }
          pendingBreak = !!item.hasEOL;
          lastY = y;
          lastEndX = x + w;
        }

        fullScript += pageStr + "\n\n";
      }

      if (fullScript.trim().length > 30) {
        // සිංහල PDF වල අකුරු කියවීම අවිශ්වාසයි (බොහෝ විට Google Docs/Word PDF වල ස්වර ලකුණු වැරදි තැන්වල වැටේ).
        // එය හඳුනාගෙන පරිශීලකයාට දැනුම් දෙයි.
        const hasSinhalaText = /[\u0D80-\u0DFF]/.test(fullScript);
        const controlChars = /[\u0000-\u0008\u000B\u000C\u000E-\u001F]/.test(fullScript);
        const wordsStartingWithVowelSign = (fullScript.match(/(?:^|\s)[\u0DD9\u0DDB]/gm) || []).length;
        if (hasSinhalaText && (controlChars || wordsStartingWithVowelSign >= 4)) {
          const goOn = window.confirm(
            "The Sinhala letters inside this PDF look scrambled (this happens with many PDFs made by Google Docs or Word).\n\nThe scenes may come out wrong.\n\nBetter: copy the text into “Paste Script”, or save it as a .txt file and upload that.\n\nPress OK to try anyway, or Cancel to stop.\n\nමේ PDF එකේ සිංහල අකුරු අවුල් වී ඇත. “Paste Script” හෝ .txt ෆයිල් එකක් භාවිතා කරන එක හොඳයි."
          );
          if (!goOn) throw new Error("Stopped: the Sinhala text in this PDF is not readable. Use Paste Script or a .txt file.");
        }
        return fullScript;
      }
    } catch (err) {
      if (err instanceof Error && err.message.startsWith("Stopped:")) throw err; // පරිශීලකයා නවත්වා ඇත
      console.warn("PDF.js layout extraction fallback:", err);
    }

    const buffer = await file.arrayBuffer();
    const decoder = new TextDecoder("utf-8", { fatal: false });
    return decoder.decode(buffer);
  };

  // High Precision Screenplay Parser
  const parseScriptContent = (rawText: string): SceneEntity[] => {
    let text = rawText.replace(/\r\n/g, "\n").trim();
    const isSinhala = /[\u0D80-\u0DFF]/.test(text);

    // Cover Page ඉවත් කිරීම
    const firstSceneIdx = text.search(/(?:^|\n)\s*(?:SCENE\s*0?1\b|දර්ශනය\s*0?1\b|\bINT[\.\s\-]+|\bEXT[\.\s\-]+|\bඅභ්‍යන්තර|\bබාහිර)/i);
    if (firstSceneIdx !== -1) {
      text = text.slice(firstSceneIdx).trim();
    }

    // Sluglines වෙන් කිරීම
    const splitRegex = /(?=(?:^|\n)\s*(?:SCENE\s*\d+|දර්ශනය\s*\d+|\bINT[\.\s\-]+|\bEXT[\.\s\-]+|\bINT\/EXT[\.\s\-]+|\bඅභ්‍යන්තර|\bබාහිර))/gi;
    let chunks = text.split(splitRegex).map(c => c.trim()).filter(c => c.length > 20);

    if (chunks.length === 0) {
      chunks = text.split(/\n\s*\n/).map(c => c.trim()).filter(c => c.length > 25);
    }

    // Comprehensive Props Token List
    const propKeywords = [
      "SCANNER", "FLASHLIGHT", "KEY", "MASTER KEY", "BRIEFCASE", "COMPASS", "BRONZE COMPASS", "SEDAN", "BLACK SEDAN",
      "TABLET", "WIRE CUTTERS", "PHONE", "GUN", "KNIFE", "BOTTLE", "BAG", "LETTER", "DOOR", "CLOCK", "CHAIR", "TABLE", "GLASS", "MONEY", "BINOCULARS",
      "ඩිජිටල් ස්කෑනරය", "විදුලි පන්දම", "යතුර", "ලියකියවිලි බෑගය", "මාලිමාව", "ලෝකඩ මාලිමාව", "කළු රථය", "ටැබ්ලට් පරිගණකය", "වයර් කටරය",
      "දුරකථනය", "තුවක්කුව", "පිහිය", "බෝතලය", "දොර", "ඔරලෝසුව", "පුටුව", "මේසය", "වීදුරුව", "මුදල්", "හොලෝග්‍රැෆික් උපකරණය", "දුරදක්නය"
    ];

    return chunks.map((chunk, index) => {
      const sceneNum = index + 1;
      const lines = chunk.split("\n").map(l => l.trim()).filter(Boolean);

      // Slugline Extraction (පළමු සම්පූර්ණ පේළියෙන්)
      let rawSlug = lines[0] || "";
      const slugMatch = rawSlug.match(/(?:SCENE\s*\d+[:.\-\s]*|දර්ශනය\s*\d+[:.\-\s]*|\bINT[\.\s\-]+|\bEXT[\.\s\-]+|\bඅභ්‍යන්තර|\bබාහිර)[^\.\n]*/i);

      let slugline = "";
      if (slugMatch) {
        slugline = slugMatch[0].trim().toUpperCase();
      } else {
        slugline = rawSlug.slice(0, 50).trim().toUpperCase();
      }

      if (!slugline.startsWith("SCENE") && !slugline.startsWith("දර්ශනය")) {
        slugline = isSinhala
          ? `දර්ශනය ${String(sceneNum).padStart(2, "0")}: ${slugline}`
          : `SCENE ${String(sceneNum).padStart(2, "0")}: ${slugline}`;
      }

      const isExt = /EXT|බාහිර/i.test(slugline) || /EXT|බාහිර/i.test(chunk);
      const isNight = /NIGHT|රාත්‍රී|DARK|DAWN/i.test(slugline) || /NIGHT|රාත්‍රී/i.test(chunk);

      // Clean Action / Narrative Text
      let narrativeLines = lines.filter((l, i) => {
        if (i === 0 && l.toUpperCase().includes("SCENE")) return false;
        if (l.toUpperCase() === slugline) return false;
        return true;
      });

      // Characters Extraction
      const characters: string[] = [];
      const charRegex = /\b([A-Z\u0D80-\u0DFF]{2,18})\b(?=\s*(?:\([^\)]*\))?\s*(?:\n|$|:|-))/g;

      lines.forEach(l => {
        const matches = l.match(charRegex);
        if (matches) {
          matches.forEach(m => {
            const name = m.trim().toUpperCase();
            const blacklist = ["SCENE", "INT", "EXT", "NIGHT", "DAY", "DAWN", "THE", "AND", "WITH", "TITLE", "WRITTEN", "GENRE", "දර්ශනය", "අභ්‍යන්තර", "බාහිර"];
            if (!blacklist.includes(name) && !characters.includes(name) && name.length >= 3 && characters.length < 4) {
              characters.push(name);
            }
          });
        }
      });

      if (characters.length === 0) {
        if (/ELENA/i.test(chunk)) characters.push("ELENA");
        if (/MARCUS/i.test(chunk)) characters.push("MARCUS");
        if (/කසුන්/i.test(chunk)) characters.push("කසුන්");
        if (/නිමල්/i.test(chunk)) characters.push("නිමල්");
      }
      if (characters.length === 0) {
        characters.push(isSinhala ? "ප්‍රධාන චරිතය" : "LEAD CHARACTER");
      }

      // Dialogues Extraction
      const dialogues: DialogueItem[] = [];
      for (let i = 0; i < lines.length - 1; i++) {
        const line = lines[i];
        const nextLine = lines[i + 1];

        // Character Name on its own line followed by spoken dialogue
        const isSpeaker = characters.includes(line.toUpperCase()) || /^[A-Z\u0D80-\u0DFF]{2,18}$/.test(line);
        if (isSpeaker && nextLine && !nextLine.toUpperCase().startsWith("SCENE") && dialogues.length < 3) {
          dialogues.push({
            speaker: line.toUpperCase(),
            line: nextLine.replace(/^["“”\(].*?["”\)]\s*/, "").replace(/^["“”]|["“”]$/g, "").trim()
          });
        }
        // Traditional Colon separator: "ELENA: Dialogue..."
        else if (line.includes(":") && !line.toUpperCase().startsWith("SCENE") && dialogues.length < 3) {
          const [spk, ...rest] = line.split(":");
          const cleanSpk = spk.trim().toUpperCase();
          const cleanLine = rest.join(":").trim();
          if (cleanSpk.length < 20 && cleanLine.length > 3) {
            dialogues.push({
              speaker: cleanSpk,
              line: cleanLine.replace(/^["“”]|["“”]$/g, "")
            });
          }
        }
      }

      // සාමාන්‍ය screenplay format එකක් නම් චරිත සහ දෙබස් එයින් ගනී (වඩා නිවැරදියි)
      const cueInfo = extractCues(chunk);
      if (cueInfo.names.length > 0) {
        characters.length = 0;
        cueInfo.names.slice(0, 8).forEach((n) => characters.push(n));
        if (cueInfo.dialogues.length > 0) {
          dialogues.length = 0;
          cueInfo.dialogues.forEach((d) => dialogues.push(d));
        }
      }

      // Props Extraction
      const props: string[] = [];
      propKeywords.forEach(p => {
        const regex = new RegExp(`\\b${p}\\b`, "i");
        if (regex.test(chunk) && !props.includes(p) && props.length < 4) {
          props.push(p.toUpperCase());
        }
      });
      if (props.length === 0) {
        props.push(isSinhala ? "ප්‍රධාන පසුතල උපකරණ" : "KEY SCENE PROP");
      }

      // Clean Synopsis
      let cleanSynopsis = narrativeLines
        .filter(l => !characters.includes(l.toUpperCase()) && !l.includes(":") && l.length > 15)
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();

      if (!cleanSynopsis || cleanSynopsis.length < 20) {
        cleanSynopsis = chunk.replace(slugline, "").replace(/\s+/g, " ").slice(0, 240);
      }
      const synopsis = cleanSynopsis.length > 240 ? cleanSynopsis.slice(0, 240) + "..." : cleanSynopsis;

      const visualPrompt = `Cinematic 16:9 movie still, ${isExt ? "exterior shot" : "interior shot"}, ${isNight ? "dramatic atmospheric night lighting" : "natural daylight illumination"}, 35mm anamorphic frame, 8k: ${slugline.replace(/[\u0D80-\u0DFF]/g, "location")}.`;

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

  // ---------- AI (Gemini) + Regex Hybrid Parsing ----------

  // දිග තිර පිටපතක් දර්ශන මායිම් වලින් (නැත්නම් හිස් පේළි වලින්) කොටස් වලට කඩයි
  const splitIntoChunks = (text: string, maxChars = 22000): string[] => {
    const lines = text.replace(/\r\n/g, "\n").split("\n");
    const slugRe = /^\s*(?:SCENE\s*\d+|දර්ශනය\s*\d+|INT[\.\s\-\/]|EXT[\.\s\-\/]|I\/E[\.\s]|අභ්‍යන්තර|බාහිර)/i;
    const chunks: string[] = [];
    let buf: string[] = [];
    let size = 0;

    const flush = () => {
      const t = buf.join("\n").trim();
      if (t.length > 0) chunks.push(t);
      buf = [];
      size = 0;
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const isBoundary = slugRe.test(line) || (line.trim() === "" && size > maxChars * 0.8);
      // සීමාවට ආසන්න වූ විට, දර්ශන මායිමකදී කොටස වසයි
      if (size >= maxChars * 0.7 && isBoundary) flush();
      // මායිමක් නොමැතිව සීමාව ඉක්මවූයේ නම් බලෙන් වසයි
      if (size >= maxChars * 1.3) flush();
      buf.push(line);
      size += line.length + 1;
    }
    flush();
    return chunks;
  };

  const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

  // එක chunk එකක් Gemini එකට යවයි (429/503 වලදී නැවත උත්සාහ කරයි)
  type ChunkResult = { scenes: any[] | null; reason?: "NO_KEY" | "BAD_JSON" | "FAILED" | "QUOTA" };
  const langRef = useRef<"si" | "en">("en"); // script එකේ භාෂාව (AI එකට පැහැදිලිව දැනුම් දෙයි)
  const modelsRef = useRef<Set<string>>(new Set());
  const langWarnRef = useRef(0);
  const aiDisabledRef = useRef(false); // quota ඉවර වූ විට ඉතිරි කොටස් සඳහා AI උත්සාහ නොකරයි
  const parseChunkWithAi = async (text: string): Promise<ChunkResult> => {
    if (aiDisabledRef.current) return { scenes: null, reason: "QUOTA" };
    for (let attempt = 0; attempt < 4; attempt++) {
      try {
        const res = await fetch("/api/screenplay/parse", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, language: langRef.current }),
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok && data.success && Array.isArray(data.scenes)) {
          if (data.model) modelsRef.current.add(String(data.model));
          if (data.languageOk === false) langWarnRef.current++;
          return { scenes: data.scenes };
        }
        if (data.code === "NO_KEY") {
          aiDisabledRef.current = true;
          return { scenes: null, reason: "NO_KEY" };
        }
        if (data.code === "DAILY_QUOTA") {
          aiDisabledRef.current = true;
          return { scenes: null, reason: "QUOTA" };
        }
        if (data.code === "BAD_JSON") return { scenes: null, reason: "BAD_JSON" };
        // Rate limit / overload නම් රැඳී සිට නැවත උත්සාහ කරයි
        await sleep(res.status === 429 ? 8000 * (attempt + 1) : 2500 * (attempt + 1));
      } catch {
        await sleep(2500 * (attempt + 1));
      }
    }
    return { scenes: null, reason: "FAILED" };
  };

  // කොටසක් අසාර්ථක වී ප්‍රතිචාරය කැපී ගියා නම් එය දෙකට බෙදා නැවත AI වෙත යවයි (regex එකට වැටීමට පෙර)
  const parseChunkRobust = async (
    text: string,
    depth = 0
  ): Promise<{ ai: any[] | null; text: string; reason?: string }[]> => {
    const r = await parseChunkWithAi(text);
    if (r.scenes && r.scenes.length > 0) return [{ ai: r.scenes, text }];

    if (r.reason === "BAD_JSON" && depth < 3 && text.length > 3000) {
      const lines = text.split("\n");
      const mid = Math.floor(lines.length / 2);
      const first = lines.slice(0, mid).join("\n");
      const second = lines.slice(mid).join("\n");
      if (first.trim().length > 200 && second.trim().length > 200) {
        const ra = await parseChunkRobust(first, depth + 1);
        const rb = await parseChunkRobust(second, depth + 1);
        return [...ra, ...rb];
      }
    }
    return [{ ai: null, text, reason: r.reason }];
  };

  const toStr = (v: any) => (typeof v === "string" ? v.trim() : "");
  const toArr = (v: any, max: number): string[] =>
    Array.isArray(v)
      ? Array.from(new Set(v.map(toStr).filter(Boolean))).slice(0, max)
      : [];

  // Gemini ප්‍රතිඵලය SceneEntity එකක් බවට හරවයි
  const aiSceneToEntity = (ai: any, sceneNum: number, isSinhala: boolean): SceneEntity => {
    const isExt = String(ai.locationType).toUpperCase().startsWith("EXT");
    const tod = String(ai.timeOfDay || "UNSPECIFIED").toUpperCase();
    const slugRaw = toStr(ai.slugline) || `Scene ${sceneNum}`;
    const prefix = isSinhala ? "දර්ශනය" : "SCENE";
    const slugline = /^(SCENE|දර්ශනය)\s*\d+/i.test(slugRaw)
      ? slugRaw.toUpperCase()
      : `${prefix} ${String(sceneNum).padStart(2, "0")}: ${slugRaw.toUpperCase()}`;

    const characters = toArr(ai.characters, 8);
    const props = toArr(ai.props, 8);
    const dialogues: DialogueItem[] = Array.isArray(ai.dialogues)
      ? ai.dialogues
          .map((d: any) => ({ speaker: toStr(d?.speaker).toUpperCase(), line: toStr(d?.line) }))
          .filter((d: DialogueItem) => d.speaker && d.line)
          .slice(0, 3)
      : [];

    return {
      id: `SCENE-${String(sceneNum).padStart(2, "0")}`,
      sceneNumber: sceneNum,
      slugline,
      locationType: isExt ? (isSinhala ? "EXT (බාහිර)" : "EXT (Exterior)") : (isSinhala ? "INT (අභ්‍යන්තර)" : "INT (Interior)"),
      timeOfDay: tod === "UNSPECIFIED" ? "DAY" : tod,
      synopsis: toStr(ai.synopsis).slice(0, 300),
      characters: characters.length ? characters : [isSinhala ? "ප්‍රධාන චරිතය" : "LEAD CHARACTER"],
      props: props.length ? props : [isSinhala ? "ප්‍රධාන පසුතල උපකරණ" : "KEY SCENE PROP"],
      dialogues,
      plannedShots: 3,
      visualPrompt: toStr(ai.visualDescriptionEN), // <- ඉංග්‍රීසි image prompt එක
    };
  };

  // AI මුලින්; එය අසාර්ථක chunk සඳහා පමණක් regex parser එක (fallback)
  // කොටස් දෙක බැගින් සමාන්තරව යවයි, හැදෙන දර්ශන ඒ සැණින් තිරයේ පෙන්වයි
  const parseWithAiHybrid = async (rawText: string): Promise<SceneEntity[]> => {
    const isSinhala = /[\u0D80-\u0DFF]/.test(rawText);
    // සිංහල අකුරු token වැඩි නිසා කොටස් කුඩා කරයි
    const chunks = splitIntoChunks(rawText, isSinhala ? 12000 : 16000);
    const all: SceneEntity[] = [];
    let aiPieces = 0;
    const PARALLEL = 2;

    let basicPieces = 0;
    let lastReason = "";
    aiDisabledRef.current = false;
    langRef.current = isSinhala ? "si" : "en";
    modelsRef.current = new Set();
    langWarnRef.current = 0;
    setAiReport(null);
    setParsedScenes([]);
    setSelectedSceneIds([]);

    for (let i = 0; i < chunks.length; i += PARALLEL) {
      const group = chunks.slice(i, i + PARALLEL);
      const last = Math.min(i + PARALLEL, chunks.length);
      setProgress(
        `AI විශ්ලේෂණය: කොටස ${i + 1}${last > i + 1 ? "-" + last : ""} / ${chunks.length} · දර්ශන ${all.length}ක් හමුවිය`
      );

      // කොටස් සමාන්තරව සකසන නමුත් ප්‍රතිඵල මුල් පිළිවෙලටම එකතු කරයි
      const results = await Promise.all(group.map((c) => parseChunkRobust(c)));

      for (const pieces of results) {
        for (const piece of pieces) {
          if (piece.ai && piece.ai.length > 0) {
            aiPieces++;
            piece.ai.forEach((s) => all.push(aiSceneToEntity(s, all.length + 1, isSinhala)));
          } else {
            // Fallback: regex parser
            basicPieces++;
            if (piece.reason) lastReason = piece.reason;
            parseScriptContent(piece.text).forEach((s) => {
              const n = all.length + 1;
              // සීන් නමේ අංකයත් සම්පූර්ණ script එකේ අංකයට ගැලපෙන ලෙස නිවැරදි කරයි
              const label = isSinhala ? "දර්ශනය" : "SCENE";
              all.push({
                ...s,
                id: `SCENE-${String(n).padStart(2, "0")}`,
                sceneNumber: n,
                slugline: s.slugline.replace(/^(SCENE|දර්ශනය)\s*\d+/i, `${label} ${String(n).padStart(2, "0")}`),
              });
            });
          }
        }
      }

      // අතරමැද ප්‍රතිඵල ඒ සැණින් පෙන්වයි
      setParsedScenes([...all]);
      setSelectedSceneIds(all.map((s) => s.id));

      if (last < chunks.length) await sleep(2000); // rate limit වලට ගෞරවය
    }

    setAiReport({
      total: aiPieces + basicPieces,
      ai: aiPieces,
      basic: basicPieces,
      reason: lastReason,
      models: Array.from(modelsRef.current),
      langWarn: langWarnRef.current,
    });
    return all;
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

      // Budget ඇස්තමේන්තුවට script එකේ දිග (චිත්‍රපටයේ විනාඩි ගණන) අවශ්‍ය නිසා සුරකී
      try {
        localStorage.setItem("eclat_script_meta_v1", JSON.stringify({ chars: rawContent.length, at: Date.now() }));
      } catch { }

      const scenes = await parseWithAiHybrid(rawContent);

      if (scenes.length > 0) {
        // පරණ තිර පිටපතේ storyboard පින්තූර cache එක මකා දමයි (අලුත් පිටපතට වැරදි පින්තූර නොපෙන්වීමට)
        try {
          Object.keys(localStorage)
            .filter((k) => k.startsWith("cine_storyboard_cache_") || k === "active_screenplay_scenes")
            .forEach((k) => localStorage.removeItem(k));
          sessionStorage.removeItem("eclat_storyboard_frames");
        } catch { }
        setParsedScenes(scenes);
        setSelectedSceneIds(scenes.map((s) => s.id));
        persistScenes(scenes);
      } else {
        alert("දර්ශන හඳුනා ගැනීමට නොහැකි විය.");
      }
    } catch (err: any) {
      console.error("Execution failed:", err);
      alert(`Breakdown අසාර්ථක විය: ${err.message}`);
    } finally {
      setIsProcessing(false);
      setProgress("");
    }
  };

  const handleRemoveScriptAndClear = () => {
    const hasOther = typeof window !== "undefined" && (localStorage.getItem("eclat_budget_v1") || localStorage.getItem("eclat_callsheets_v1") || localStorage.getItem("eclat_roster_v1"));
    if (hasOther && !window.confirm("Remove this script AND everything made from it?\n\nThis deletes: the budget plan, call sheets, actor choices and storyboard pictures.\nThis is kept: your spending records, people list and saved places.\n\nස්ක්‍රිප්ට් එකත්, ඒකෙන් හදපු බජට් සැලැස්ම, call sheet, නළු තේරීම් සහ පින්තූර මකන්නද?")) return;
    setUploadedFile(null);
    setScriptText("");
    setParsedScenes([]);
    setSelectedSceneIds([]);
    clearScenes();
    clearScriptDependents();
    const fileInput = document.getElementById("file-input-upload") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  const handleDeleteScene = (id: string) => {
    const updated = parsedScenes.filter((s) => s.id !== id);
    setParsedScenes(updated);
    setSelectedSceneIds((prev) => prev.filter((item) => item !== id));
    persistScenes(updated);
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
    persistScenes(updated);
  };

  const handleClearAllScenes = () => {
    const hasOther = typeof window !== "undefined" && (localStorage.getItem("eclat_budget_v1") || localStorage.getItem("eclat_callsheets_v1") || localStorage.getItem("eclat_roster_v1"));
    if (hasOther && !window.confirm("Remove this script AND everything made from it?\n\nThis deletes: the budget plan, call sheets, actor choices and storyboard pictures.\nThis is kept: your spending records, people list and saved places.\n\nස්ක්‍රිප්ට් එකත්, ඒකෙන් හදපු බජට් සැලැස්ම, call sheet, නළු තේරීම් සහ පින්තූර මකන්නද?")) return;
    setParsedScenes([]);
    setSelectedSceneIds([]);
    setAiReport(null);
    clearScenes();
    clearScriptDependents();
  };

  const handleSaveEditedScene = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingScene) return;
    const updated = parsedScenes.map((s) => (s.id === editingScene.id ? editingScene : s));
    setParsedScenes(updated);
    persistScenes(updated);
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
    // එක් දර්ශනයක් නම් ඒ දර්ශනයටම යොමු කර ඉබේම හදන්න පටන් ගනී
    router.push(
      targetScenes.length === 1
        ? `/storyboard?scene=${encodeURIComponent(targetScenes[0].id)}&auto=1`
        : "/storyboard"
    );
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
                    accept=".pdf,application/pdf,.txt,text/plain,.fdx"
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
                          <Loader2 className="w-4 h-4 animate-spin" /> {progress || "Processing Screenplay..."}
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

          {!isProcessing && aiReport && aiReport.langWarn > 0 && parsedScenes.length > 0 && (
            <div className="mb-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200">
              ⚠ In {aiReport.langWarn} part{aiReport.langWarn > 1 ? "s" : ""}, the AI wrote scene titles or summaries in English even though your script is Sinhala. You can fix any scene with the pencil icon, or press “Execute Dynamic Breakdown” again.
            </div>
          )}

          {!isProcessing && aiReport && parsedScenes.length > 0 && (
            aiReport.basic === 0 ? (
              <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300">
                ✅ The AI helper analysed the whole script ({aiReport.ai} parts).{aiReport.models.length > 0 && <span className="text-emerald-400/70"> AI model used: {aiReport.models.join(", ")}</span>}
              </div>
            ) : (
              <div className="mb-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 space-y-1">
                <p className="font-semibold text-sm">⚠ The AI helper could not analyse {aiReport.basic} of {aiReport.total} parts.</p>
                <p>
                  {aiReport.reason === "QUOTA"
                    ? "The free AI limit for today is used up (it resets around midday, Sri Lanka time)."
                    : aiReport.reason === "NO_KEY"
                      ? "The AI key is missing on this server."
                      : "The AI helper was busy or could not be reached."}{" "}
                  Those parts were split with simple rules instead, so characters and props may be less accurate.
                </p>
                <p className="text-amber-300/80">You can press “Execute Dynamic Breakdown” again later to try the AI helper again.</p>
              </div>
            )
          )}

          {isProcessing && parsedScenes.length > 0 && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3 text-xs text-emerald-300">
              <Loader2 className="w-4 h-4 animate-spin shrink-0" />
              <div>
                <p className="font-semibold">{progress}</p>
                <p className="text-slate-400 mt-0.5">දර්ශන හැදෙන විට පහළින් පෙනේ. මෙම පිටුව වසන්න එපා.</p>
              </div>
            </div>
          )}

          {isProcessing && parsedScenes.length === 0 ? (
            <div className="p-16 rounded-2xl bg-[#070e0a] border border-emerald-950/70 text-center flex flex-col items-center justify-center">
              <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
              <h3 className="text-sm font-semibold text-white">තිර පිටපත විශ්ලේෂණය කරමින් පවතී...</h3>
              <p className="text-xs text-slate-400 mt-1">දර්ශන, චරිත, උපකරණ සහ දෙබස් සජීවීව වෙන් කරමින් පවතී.</p>
              {progress && <p className="text-xs text-emerald-400 mt-3 font-mono">{progress}</p>}
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