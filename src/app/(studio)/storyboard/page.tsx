"use client";

import React, { useState } from "react";
import {
  Film,
  Camera,
  Plus,
  Download,
  Sliders,
  Eye,
  Edit3,
  Upload,
  RefreshCw,
  Sparkles,
  User,
  Tag,
  Layers,
  Video,
  CheckCircle2,
  X,
  ChevronDown,
  Maximize2,
  Ratio,
  Maximize,
} from "lucide-react";

interface ShotCard {
  id: string;
  shotNumber: string;
  sceneNumber: string;
  cameraMovement: string;
  lensSpec: string;
  timeOfDay: "NIGHT" | "DAY" | "DAWN" | "DUSK";
  visualPrompt: string;
  characters: string[];
  props: string[];
  aspectRatio: "16:9" | "2.39:1";
  framingType:
    | "ESTABLISHING WIDE"
    | "MEDIUM CLOSE-UP"
    | "OVER-THE-SHOULDER"
    | "EXTREME CLOSE-UP"
    | "DOLLY TRACK";
  isGenerating?: boolean;
}

const INITIAL_SHOTS: ShotCard[] = [
  {
    id: "shot-1",
    shotNumber: "SHOT 01A",
    sceneNumber: "SCENE 14",
    cameraMovement: "WIDE - 24MM",
    lensSpec: "Anamorphic 24mm f/1.8",
    timeOfDay: "NIGHT",
    framingType: "ESTABLISHING WIDE",
    visualPrompt:
      "Holographic projections flicker against cold obsidian archive walls. Low-angle dolly tracking along high metallic catwalk.",
    characters: ["ELENA"],
    props: ["NEON DECODER", "GLOWING CORE"],
    aspectRatio: "16:9",
  },
  {
    id: "shot-2",
    shotNumber: "SHOT 01B",
    sceneNumber: "SCENE 14",
    cameraMovement: "CLOSE UP - 50MM",
    lensSpec: "Prime 50mm f/1.4",
    timeOfDay: "NIGHT",
    framingType: "MEDIUM CLOSE-UP",
    visualPrompt:
      "Elena's tactical goggles reflect pulsing cyan terminal code. Sotto dialogue facial framing with shallow depth of field.",
    characters: ["ELENA"],
    props: ["NEON DECODER"],
    aspectRatio: "16:9",
  },
  {
    id: "shot-3",
    shotNumber: "SHOT 01C",
    sceneNumber: "SCENE 14",
    cameraMovement: "DOLLY TRACK - 35MM",
    lensSpec: "Cine Prime 35mm f/2.0",
    timeOfDay: "NIGHT",
    framingType: "OVER-THE-SHOULDER",
    visualPrompt:
      "Marcus emerges from server rack shadows holding a heavy wrench. Over-the-shoulder perspective focusing on Elena's tactical vest.",
    characters: ["MARCUS", "ELENA"],
    props: ["HEAVY WRENCH", "SERVER RACK"],
    aspectRatio: "16:9",
  },
  {
    id: "shot-4",
    shotNumber: "SHOT 02A",
    sceneNumber: "SCENE 15",
    cameraMovement: "WIDE - 18MM",
    lensSpec: "Ultra Wide 18mm f/2.8",
    timeOfDay: "NIGHT",
    framingType: "ESTABLISHING WIDE",
    visualPrompt:
      "Rain slicked cyberpunk marketplace drenched in green neon signage. Kai navigates through synthetic crowd carrying a locked briefcase.",
    characters: ["KAI"],
    props: ["LOCKED BRIEFCASE"],
    aspectRatio: "16:9",
  },
  {
    id: "shot-5",
    shotNumber: "SHOT 02B",
    sceneNumber: "SCENE 15",
    cameraMovement: "MACRO - 85MM",
    lensSpec: "Macro Prime 85mm f/1.4",
    timeOfDay: "NIGHT",
    framingType: "EXTREME CLOSE-UP",
    visualPrompt:
      "Biometric keypad on locked briefcase flashes active red encryption alert as raindrops pool on dark titanium casing.",
    characters: ["KAI"],
    props: ["LOCKED BRIEFCASE"],
    aspectRatio: "16:9",
  },
  {
    id: "shot-6",
    shotNumber: "SHOT 03A",
    sceneNumber: "SCENE 16",
    cameraMovement: "CRANE TRACK - 28MM",
    lensSpec: "Wide Cine 28mm f/2.0",
    timeOfDay: "DAWN",
    framingType: "DOLLY TRACK",
    visualPrompt:
      "Overhead crane camera tracking squad crossing rooftop solar array as searchlight beams cut through atmospheric morning fog.",
    characters: ["ELENA", "MARCUS"],
    props: ["COMMUNICATIONS TOWER"],
    aspectRatio: "16:9",
  },
];

export default function StoryboardPage() {
  const [shots, setShots] = useState<ShotCard[]>(INITIAL_SHOTS);
  const [globalAspectRatio, setGlobalAspectRatio] = useState<"16:9" | "2.39:1">("16:9");
  const [selectedProject, setSelectedProject] = useState("PROJECT: NEON HORIZON");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingShot, setEditingShot] = useState<ShotCard | null>(null);

  // Add Shot Modal Form State
  const [newShotNumber, setNewShotNumber] = useState("SHOT 04A");
  const [newSceneNumber, setNewSceneNumber] = useState("SCENE 17");
  const [newCameraMovement, setNewCameraMovement] = useState("MEDIUM - 35MM");
  const [newFramingType, setNewFramingType] = useState<ShotCard["framingType"]>(
    "MEDIUM CLOSE-UP"
  );
  const [newTimeOfDay, setNewTimeOfDay] = useState<ShotCard["timeOfDay"]>("NIGHT");
  const [newVisualPrompt, setNewVisualPrompt] = useState(
    "Low angle tracking shot through narrow obsidian corridor."
  );
  const [newCharacters, setNewCharacters] = useState("ELENA, KAI");
  const [newProps, setNewProps] = useState("DATA DRIVE");

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleAddShotCard = (e: React.FormEvent) => {
    e.preventDefault();
    const newCard: ShotCard = {
      id: `shot-${Date.now()}`,
      shotNumber: newShotNumber,
      sceneNumber: newSceneNumber,
      cameraMovement: newCameraMovement,
      lensSpec: "Cine Prime 35mm f/1.8",
      timeOfDay: newTimeOfDay,
      framingType: newFramingType,
      visualPrompt: newVisualPrompt,
      characters: newCharacters.split(",").map((c) => c.trim()).filter(Boolean),
      props: newProps.split(",").map((p) => p.trim()).filter(Boolean),
      aspectRatio: globalAspectRatio,
    };

    setShots([newCard, ...shots]);
    setIsAddModalOpen(false);
    triggerToast(`Added ${newCard.shotNumber} (${newCard.cameraMovement}) to Storyboard!`);
  };

  const handleRegenerateFraming = (id: string) => {
    setShots((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isGenerating: true } : s))
    );

    setTimeout(() => {
      setShots((prev) =>
        prev.map((s) => (s.id === id ? { ...s, isGenerating: false } : s))
      );
      triggerToast("Regenerated 16:9 framing prompt & aspect ratio alignment!");
    }, 800);
  };

  const handleExportShotList = () => {
    triggerToast(`Exported ${shots.length} 16:9 Widescreen Shot Cards to CSV/PDF!`);
  };

  return (
    <div className="space-y-6 font-sans text-slate-100 selection:bg-emerald-500 selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-950 border border-emerald-600 text-emerald-200 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-mono font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Top Control & Navigation Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-studio-700">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2.5">
            <Film className="w-6 h-6 text-emerald-400" />
            16:9 Spatial Storyboard Visualizer
          </h1>
          <p className="text-sm text-emerald-100/70 mt-1">
            Widescreen shot sequence planning, camera motion annotations, and spatial prompt conditioning.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Project Filter Selector */}
          <div className="relative">
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="bg-studio-900 border border-studio-700 rounded-xl px-3.5 py-2 text-xs font-mono text-emerald-300 focus:outline-none focus:border-emerald-500 cursor-pointer appearance-none pr-8"
            >
              <option value="PROJECT: NEON HORIZON">PROJECT: NEON HORIZON</option>
              <option value="PROJECT: OBSIDIAN CORE">PROJECT: OBSIDIAN CORE</option>
              <option value="PROJECT: CYBER RUN">PROJECT: CYBER RUN</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-emerald-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Aspect Ratio Toggle (16:9 vs 2.39:1) */}
          <div className="bg-studio-900 p-1 rounded-xl border border-studio-700 flex items-center text-xs font-mono">
            <button
              onClick={() => setGlobalAspectRatio("16:9")}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 font-medium ${
                globalAspectRatio === "16:9"
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Ratio className="w-3.5 h-3.5" />
              <span>16:9 Widescreen</span>
            </button>
            <button
              onClick={() => setGlobalAspectRatio("2.39:1")}
              className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 font-medium ${
                globalAspectRatio === "2.39:1"
                  ? "bg-emerald-700 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Maximize className="w-3.5 h-3.5" />
              <span>2.39:1 Anamorphic</span>
            </button>
          </div>

          {/* Export Shot List Utility */}
          <button
            onClick={handleExportShotList}
            className="bg-studio-900 hover:bg-studio-800 border border-studio-700 text-slate-200 text-xs font-mono px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Export Shot List</span>
          </button>

          {/* Add Shot Card Modal Trigger */}
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium px-4 py-2 rounded-xl shadow-[0_0_15px_rgba(22,163,74,0.35)] transition-all flex items-center gap-1.5 hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            <span>Add Shot Card</span>
          </button>
        </div>
      </div>

      {/* Main 16:9 Shot Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {shots.map((shot) => (
          <div
            key={shot.id}
            className="bg-studio-900 border border-studio-700 rounded-xl overflow-hidden shadow-xl flex flex-col justify-between hover:border-emerald-500/60 transition-all duration-300 group"
          >
            {/* Card Top Header */}
            <div className="p-3.5 bg-studio-950 border-b border-studio-700 flex items-center justify-between font-mono text-xs">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold">
                  {shot.shotNumber}
                </span>
                <span className="text-slate-400 font-semibold">{shot.sceneNumber}</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-studio-800 text-emerald-400 border border-emerald-800/60">
                  {shot.cameraMovement}
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-studio-800 text-slate-300">
                  {shot.timeOfDay}
                </span>
              </div>
            </div>

            {/* 16:9 Widescreen Canvas Box */}
            <div className="p-4 space-y-3">
              <div
                className={`w-full rounded-lg bg-studio-950/90 border border-studio-700 flex flex-col justify-between p-4 relative group/canvas overflow-hidden transition-all ${
                  globalAspectRatio === "2.39:1" ? "aspect-[2.39/1]" : "aspect-video"
                }`}
              >
                {/* Canvas Overlay Glow */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />

                {/* Framing Badge & Spec Overlay */}
                <div className="relative z-10 flex items-center justify-between text-[10px] font-mono">
                  <span className="px-2 py-0.5 rounded bg-emerald-950/90 text-emerald-400 border border-emerald-700/50 font-semibold shadow">
                    {shot.framingType}
                  </span>
                  <span className="text-slate-400 bg-black/60 px-2 py-0.5 rounded">
                    {shot.lensSpec}
                  </span>
                </div>

                {/* Center Visual Prompt Text / Generating Indicator */}
                <div className="relative z-10 my-auto text-center px-2">
                  {shot.isGenerating ? (
                    <div className="space-y-2 py-4">
                      <RefreshCw className="w-6 h-6 text-emerald-400 animate-spin mx-auto" />
                      <p className="text-xs font-mono text-emerald-300 animate-pulse">
                        Conditioning 16:9 Spatial Framing...
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs font-mono text-slate-200 line-clamp-3 leading-relaxed drop-shadow">
                      "{shot.visualPrompt}"
                    </p>
                  )}
                </div>

                {/* Hover Action Overlay Icons */}
                <div className="relative z-10 flex items-center justify-between text-[10px] font-mono text-emerald-300/80 pt-2 border-t border-emerald-900/40">
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-emerald-400" />
                    LSMDC Spatial Tagged
                  </span>
                  <span className="text-slate-400">{globalAspectRatio} Frame</span>
                </div>
              </div>

              {/* Character Presence Chips & Props */}
              <div className="space-y-2 font-mono text-xs pt-1">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold mr-1">
                    Cast:
                  </span>
                  {shot.characters.map((char) => (
                    <span
                      key={char}
                      className="px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800 text-[11px] font-semibold flex items-center gap-1"
                    >
                      <User className="w-3 h-3 text-emerald-400" />
                      {char}
                    </span>
                  ))}
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold mr-1">
                    Props:
                  </span>
                  {shot.props.map((prop) => (
                    <span
                      key={prop}
                      className="px-2 py-0.5 rounded bg-studio-800 text-slate-300 border border-studio-700 text-[11px] flex items-center gap-1"
                    >
                      <Tag className="w-3 h-3 text-emerald-400" />
                      {prop}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Card Action Buttons Footer */}
            <div className="p-3 bg-studio-950 border-t border-studio-700 grid grid-cols-3 gap-2 font-mono text-[11px]">
              <button
                onClick={() => setEditingShot(shot)}
                className="py-1.5 rounded bg-studio-900 hover:bg-studio-800 border border-studio-700 text-slate-300 hover:text-emerald-300 transition-colors flex items-center justify-center gap-1"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Angle</span>
              </button>

              <button
                onClick={() => triggerToast(`Uploaded sketch layer to ${shot.shotNumber}!`)}
                className="py-1.5 rounded bg-studio-900 hover:bg-studio-800 border border-studio-700 text-slate-300 hover:text-emerald-300 transition-colors flex items-center justify-center gap-1"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload</span>
              </button>

              <button
                onClick={() => handleRegenerateFraming(shot.id)}
                className="py-1.5 rounded bg-emerald-950 hover:bg-emerald-900 border border-emerald-800 text-emerald-300 transition-colors flex items-center justify-center gap-1"
              >
                <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
                <span>Regen</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Shot Card Modal Overlay */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
          <div className="relative w-full max-w-lg bg-studio-900 border border-studio-700 rounded-2xl overflow-hidden shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-studio-700 pb-3">
              <div className="flex items-center gap-2">
                <Film className="w-5 h-5 text-emerald-400" />
                <h3 className="font-mono text-base font-bold text-white">
                  Add 16:9 Shot Card
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddShotCard} className="space-y-4 font-mono text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">SHOT NUMBER</label>
                  <input
                    type="text"
                    value={newShotNumber}
                    onChange={(e) => setNewShotNumber(e.target.value)}
                    required
                    className="w-full bg-studio-950 border border-studio-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">SCENE NUMBER</label>
                  <input
                    type="text"
                    value={newSceneNumber}
                    onChange={(e) => setNewSceneNumber(e.target.value)}
                    required
                    className="w-full bg-studio-950 border border-studio-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">CAMERA MOVEMENT</label>
                  <input
                    type="text"
                    value={newCameraMovement}
                    onChange={(e) => setNewCameraMovement(e.target.value)}
                    required
                    className="w-full bg-studio-950 border border-studio-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">TIME OF DAY</label>
                  <select
                    value={newTimeOfDay}
                    onChange={(e) =>
                      setNewTimeOfDay(e.target.value as ShotCard["timeOfDay"])
                    }
                    className="w-full bg-studio-950 border border-studio-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="NIGHT">NIGHT</option>
                    <option value="DAY">DAY</option>
                    <option value="DAWN">DAWN</option>
                    <option value="DUSK">DUSK</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-slate-400 block mb-1">VISUAL PROMPT (LSMDC CONDITIONAL)</label>
                <textarea
                  value={newVisualPrompt}
                  onChange={(e) => setNewVisualPrompt(e.target.value)}
                  required
                  rows={3}
                  className="w-full bg-studio-950 border border-studio-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-emerald-500 leading-relaxed resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-slate-400 block mb-1">CHARACTERS (COMMA SEPARATED)</label>
                  <input
                    type="text"
                    value={newCharacters}
                    onChange={(e) => setNewCharacters(e.target.value)}
                    className="w-full bg-studio-950 border border-studio-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-slate-400 block mb-1">PROPS (COMMA SEPARATED)</label>
                  <input
                    type="text"
                    value={newProps}
                    onChange={(e) => setNewProps(e.target.value)}
                    className="w-full bg-studio-950 border border-studio-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-studio-700 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-studio-950 border border-studio-700 text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium shadow-[0_0_15px_rgba(22,163,74,0.4)]"
                >
                  Create Shot Card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Angle Modal Overlay */}
      {editingShot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
          <div className="relative w-full max-w-md bg-studio-900 border border-studio-700 rounded-2xl overflow-hidden shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-studio-700 pb-3">
              <div className="flex items-center gap-2">
                <Edit3 className="w-5 h-5 text-emerald-400" />
                <h3 className="font-mono text-base font-bold text-white">
                  Edit Angle: {editingShot.shotNumber}
                </h3>
              </div>
              <button
                onClick={() => setEditingShot(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 font-mono text-xs">
              <div>
                <label className="text-slate-400 block mb-1">CAMERA MOVEMENT BADGE</label>
                <input
                  type="text"
                  value={editingShot.cameraMovement}
                  onChange={(e) =>
                    setEditingShot({ ...editingShot, cameraMovement: e.target.value })
                  }
                  className="w-full bg-studio-950 border border-studio-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">LENS & APERTURE SPEC</label>
                <input
                  type="text"
                  value={editingShot.lensSpec}
                  onChange={(e) =>
                    setEditingShot({ ...editingShot, lensSpec: e.target.value })
                  }
                  className="w-full bg-studio-950 border border-studio-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">VISUAL PROMPT</label>
                <textarea
                  value={editingShot.visualPrompt}
                  onChange={(e) =>
                    setEditingShot({ ...editingShot, visualPrompt: e.target.value })
                  }
                  rows={3}
                  className="w-full bg-studio-950 border border-studio-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-emerald-500 leading-relaxed resize-none"
                />
              </div>

              <div className="pt-3 border-t border-studio-700 flex justify-end gap-3">
                <button
                  onClick={() => setEditingShot(null)}
                  className="px-4 py-2 rounded-lg bg-studio-950 border border-studio-700 text-slate-300"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShots((prev) =>
                      prev.map((s) => (s.id === editingShot.id ? editingShot : s))
                    );
                    triggerToast(`Updated angle & lens spec for ${editingShot.shotNumber}!`);
                    setEditingShot(null);
                  }}
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
