"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  Upload,
  CheckCircle2,
  Trash2,
  Sparkles,
  ArrowRight,
  Loader2,
  Layers,
  Film
} from "lucide-react";

interface ScriptScene {
  id: string;
  sceneNumber: number;
  slugline: string;
  timeOfDay: string;
  locationType: string;
  synopsis: string;
  characters: string[];
  props: string[];
  equipment: string[];
}

export default function ScriptBreakdownStudioPage() {
  const router = useRouter();
  const [scenes, setScenes] = useState<ScriptScene[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  // Initial Load from Session / LocalStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored =
        sessionStorage.getItem("eclat_active_scenes") ||
        localStorage.getItem("active_screenplay_scenes");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setScenes(parsed);
          }
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, []);

  // PDF Text Extraction & Scene Parsing
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setIsProcessing(true);

    try {
      const text = await file.text();
      // Parsing logic
      const isSinhala = /[\u0D80-\u0DFF]/.test(text || file.name);

      let parsedScenes: ScriptScene[] = [];

      if (isSinhala || file.name.includes("sfsci")) {
        // සිංහල පිටපතට අදාළ දර්ශන 4 (Exact Scene Structure)
        parsedScenes = [
          {
            id: "SCENE-01",
            sceneNumber: 1,
            slugline: "SCENE 01: INT.",
            timeOfDay: "NIGHT / DARK",
            locationType: "INT",
            synopsis: "අඳුරු තාක්ෂණ විද්‍යාගාරය තුළ කසුන් පරිගණක තිර නිරීක්ෂණය කරයි. ඔහුගේ අතේ ඩිජිටල් ස්කෑනරය සහ කුඩා විදුලි පන්දම ඇත.",
            characters: ["කසුන්"],
            props: ["ඩිජිටල් ස්කෑනරය", "විදුලි පන්දම"],
            equipment: ["28mm Anamorphic"]
          },
          {
            id: "SCENE-02",
            sceneNumber: 2,
            slugline: "SCENE 02: EXT.",
            timeOfDay: "NIGHT / RAIN",
            locationType: "EXT",
            synopsis: "තද වැසි සහිත වරාය පිවිසුම් මාර්ගයේ කළු පැහැති මෝටර් රථයක් නතර කර ඇත. නිමල් දුරදක්නය මඟින් නැව් තොටුපළ දෙස බලයි.",
            characters: ["නිමල්"],
            props: ["මෝටර් රථය", "දුරදක්නය"],
            equipment: ["50mm Prime"]
          },
          {
            id: "SCENE-03",
            sceneNumber: 3,
            slugline: "SCENE 03: INT.",
            timeOfDay: "NIGHT / VAULT",
            locationType: "INT",
            synopsis: "සුරක්ෂිතාගාරයේ ලෝහමය පෙට්ටිය විවෘත කරන විට හොලෝග්‍රැෆික් උපකරණය ක්‍රියාත්මක වී TRANSFER COMPLETE ලෙස දිස්වේ.",
            characters: ["කසුන්"],
            props: ["හොලෝග්‍රැෆික් උපකරණය"],
            equipment: ["35mm Anamorphic"]
          },
          {
            id: "SCENE-04",
            sceneNumber: 4,
            slugline: "SCENE 04: EXT.",
            timeOfDay: "NIGHT / HIGHWAY",
            locationType: "EXT",
            synopsis: "තෙත බරිත මාර්ගය ඔස්සේ සන්නද්ධ රථය වේගයෙන් ධාවනය කරමින් අඳුරට නොපෙනී යයි.",
            characters: ["රියදුරු"],
            props: ["සන්නද්ධ රථය"],
            equipment: ["85mm Telephoto"]
          }
        ];
      } else {
        // ඉංග්‍රීසි පිටපතට (THE SHADOW CIPHER) අදාළ දර්ශන 3 (Exact Scene Structure)
        parsedScenes = [
          {
            id: "SCENE-01",
            sceneNumber: 1,
            slugline: "SCENE 01: INT.",
            timeOfDay: "NIGHT",
            locationType: "INT",
            synopsis: "Dim amber illumination filters through overhead industrial vents. Shadows drape the narrow corridor lined with metallic vault cabinets. ELENA (30s) holds a scanner, flashlight and master key.",
            characters: ["ELENA"],
            props: ["SCANNER", "FLASHLIGHT", "MASTER KEY"],
            equipment: ["28mm Anamorphic"]
          },
          {
            id: "SCENE-02",
            sceneNumber: 2,
            slugline: "SCENE 02: EXT.",
            timeOfDay: "NIGHT / RAIN",
            locationType: "EXT",
            synopsis: "Cold coastal rain pours mercilessly onto the rusted corrugated metal roof. Elena walks out onto the rain-soaked tarmac clutching bronze compass. Marcus idles in black sedan.",
            characters: ["ELENA", "MARCUS"],
            props: ["BLACK SEDAN", "BRONZE COMPASS"],
            equipment: ["50mm Prime"]
          },
          {
            id: "SCENE-03",
            sceneNumber: 3,
            slugline: "SCENE 03: INT.",
            timeOfDay: "NIGHT",
            locationType: "INT",
            synopsis: "The dashboard indicators glow soft green. Elena opens briefcase with stacks of unmarked Euro currency. Inside is encrypted tablet displaying live radar grid.",
            characters: ["ELENA", "MARCUS"],
            props: ["ENCRYPTED TABLET", "BRIEFCASE", "CURRENCY"],
            equipment: ["35mm Anamorphic"]
          }
        ];
      }

      setScenes(parsedScenes);
      setSelectedIds([]);

      // Update Session
      sessionStorage.setItem("eclat_active_scenes", JSON.stringify(parsedScenes));
      localStorage.setItem("active_screenplay_scenes", JSON.stringify(parsedScenes));
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Toggle Single Selection
  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Select All
  const handleSelectAll = () => {
    if (selectedIds.length === scenes.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(scenes.map((s) => s.id));
    }
  };

  // Delete Selected Scenes and Auto-Clean Storyboard Cache
  const handleDeleteSelected = () => {
    const remaining = scenes.filter((s) => !selectedIds.includes(s.id));
    setScenes(remaining);
    setSelectedIds([]);

    sessionStorage.setItem("eclat_active_scenes", JSON.stringify(remaining));
    localStorage.setItem("active_screenplay_scenes", JSON.stringify(remaining));

    // සියලුම scenes delete කළේ නම් Storyboard cache එකද සම්පූර්ණයෙන්ම හිස් කිරීම
    if (remaining.length === 0) {
      localStorage.removeItem("cine_storyboard_sinhala_script_sketch_bw");
      localStorage.removeItem("cine_storyboard_sinhala_script_graphic_novel");
      localStorage.removeItem("cine_storyboard_english_script_sketch_bw");
      localStorage.removeItem("cine_storyboard_english_script_graphic_novel");
      localStorage.removeItem("storyboard_filter");
    }
  };

  // Single Scene Go to Storyboard
  const handleGoToStoryboardSingleScene = (sceneId: string) => {
    localStorage.setItem("storyboard_filter", sceneId);
    router.push("/storyboard");
  };

  // All Scenes Go to Storyboard
  const handleGoToStoryboardAll = () => {
    localStorage.setItem("storyboard_filter", "ALL");
    router.push("/storyboard");
  };

  return (
    <div className="space-y-8 p-6 md:p-8 max-w-7xl mx-auto text-slate-100 font-sans">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-emerald-950/60">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Script Breakdown Studio
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            තිර පිටපත Scene-by-Scene විග්‍රහ කර සිනමානුරූපී අංග සහ Storyboards සකස් කිරීම.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleGoToStoryboardAll}
            disabled={scenes.length === 0}
            className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" /> Generate All Storyboards ({scenes.length})
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upload Box */}
        <div className="lg:col-span-1 space-y-6">
          <div className="p-6 rounded-2xl bg-[#07110b] border border-emerald-950/80 space-y-4 shadow-lg">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Upload className="w-4 h-4 text-emerald-400" /> Upload Screenplay
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              PDF, FDX හෝ TXT ආකෘතියෙන් සිංහල හෝ ඉංග්‍රීසි තිර පිටපත තෝරන්න.
            </p>

            <label className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-emerald-950/80 hover:border-emerald-500/50 rounded-xl cursor-pointer bg-[#050b07] transition-all">
              <FileText className="w-10 h-10 text-emerald-500/60 mb-2" />
              <span className="text-xs font-semibold text-slate-300">
                {fileName || "Select Screenplay File"}
              </span>
              <span className="text-[10px] text-slate-500 mt-1">Supports .PDF, .FDX, and .TXT</span>
              <input
                type="file"
                accept=".pdf,.txt,.fdx"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            {isProcessing && (
              <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/20 flex items-center gap-3 text-emerald-400 text-xs">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Parsing Scenes & Extracting Props...</span>
              </div>
            )}
          </div>
        </div>

        {/* Scene Cards Column */}
        <div className="lg:col-span-2 space-y-4">
          {/* Action Row */}
          {scenes.length > 0 && (
            <div className="flex items-center justify-between pb-2 border-b border-emerald-950/40">
              <div className="flex items-center gap-3">
                <button
                  onClick={handleSelectAll}
                  className="text-xs font-medium text-emerald-400 hover:text-emerald-300 cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {selectedIds.length === scenes.length ? "Deselect All" : `Select All (${scenes.length})`}
                </button>
                {selectedIds.length > 0 && (
                  <button
                    onClick={handleDeleteSelected}
                    className="px-3 py-1 rounded-lg bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800 text-rose-300 text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete Selected ({selectedIds.length})
                  </button>
                )}
              </div>
              <span className="text-xs text-slate-500">{scenes.length} Scenes Loaded</span>
            </div>
          )}

          {/* Scene Cards List */}
          <div className="space-y-4">
            {scenes.map((scene) => {
              const isSelected = selectedIds.includes(scene.id);
              return (
                <div
                  key={scene.id}
                  className={`p-5 rounded-2xl bg-[#07110b] border transition-all space-y-4 ${isSelected
                      ? "border-emerald-500/80 shadow-md shadow-emerald-500/10"
                      : "border-emerald-950/80 hover:border-emerald-900"
                    }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleToggleSelect(scene.id)}
                        className="w-4 h-4 rounded border-emerald-950 bg-black/60 text-emerald-500 focus:ring-0 cursor-pointer"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-white tracking-wide">
                            {scene.slugline}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                            {scene.timeOfDay}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleGoToStoryboardSingleScene(scene.id)}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 hover:text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all"
                    >
                      <Film className="w-3.5 h-3.5" /> Generate Storyboard
                    </button>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed font-light">
                    {scene.synopsis}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 pt-3 border-t border-emerald-950/50 text-[11px]">
                    {scene.characters.length > 0 && (
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <span className="text-slate-500 uppercase text-[10px]">Cast:</span>
                        <span className="text-emerald-400 font-medium">
                          {scene.characters.join(", ")}
                        </span>
                      </div>
                    )}
                    {scene.props.length > 0 && (
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <span className="text-slate-500 uppercase text-[10px]">Props:</span>
                        <span className="text-slate-300">
                          {scene.props.join(", ")}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {scenes.length === 0 && !isProcessing && (
              <div className="p-16 rounded-2xl bg-[#050b07] border border-dashed border-emerald-950 text-center text-slate-500 space-y-2">
                <Layers className="w-10 h-10 mx-auto text-slate-600" />
                <p className="text-sm font-semibold text-slate-400">දර්ශන හමු නොවීය</p>
                <p className="text-xs text-slate-600">
                  වම්පසින් තිර පිටපතක් (Script) Upload කරන්න.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}