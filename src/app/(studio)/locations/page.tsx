"use client";

import { useState } from "react";
import Link from "next/link";
import {
  MapPin,
  Zap,
  Sliders,
  DollarSign,
  CheckCircle2,
  Clock,
  Plus
} from "lucide-react";

interface LocationItem {
  id: string;
  name: string;
  sceneTag: string;
  address: string;
  category: string;
  status: "Cleared" | "Under Review";
  imageUrl: string;
  powerGrid: string;
  rigging: string;
  dailyFee: string;
}

const initialLocations: LocationItem[] = [
  {
    id: "loc-01",
    name: "Metro Soundstage 4 — Cyber Archive",
    sceneTag: "SCENE 01 / INT. CYBERNETIC ARCHIVE",
    address: "Cinematix City Studios 02, Colombo",
    category: "Soundstage",
    status: "Cleared",
    imageUrl: "https://images.unsplash.com/photo-1518133910546-b6c2fb7d79e3?auto=format&fit=crop&w=900&q=80",
    powerGrid: "3-Phase 400A Grid",
    rigging: "Full Controlled Rig (Dimmer)",
    dailyFee: "$5,500"
  },
  {
    id: "loc-02",
    name: "Lotus Tower Neon Alleyway",
    sceneTag: "SCENE 02 / EXT. NEON MARKETPLACE",
    address: "D.R. Wijewardena Mawatha, Colombo 10",
    category: "Exterior Street",
    status: "Cleared",
    imageUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=900&q=80",
    powerGrid: "Mobile 60kVA Generator",
    rigging: "Ambient Practical Neon (Wet Surface)",
    dailyFee: "$4,250"
  },
  {
    id: "loc-03",
    name: "Old Port Docklands Sub-Level",
    sceneTag: "SCENE 03 / EXT. WATERFRONT DOCKS",
    address: "Port Access Road, Northern Gate 3",
    category: "Industrial Docks",
    status: "Under Review",
    imageUrl: "https://images.unsplash.com/photo-1578575437130-527eed3abbec?auto=format&fit=crop&w=900&q=80",
    powerGrid: "On-site Auxiliary Tie-In",
    rigging: "Sodium High-Pressure / Flood Rig",
    dailyFee: "$4,500"
  }
];

export default function LocationsPage() {
  const [filter, setFilter] = useState("ALL");
  const [locations] = useState<LocationItem[]>(initialLocations);

  const filteredLocations = filter === "ALL"
    ? locations
    : locations.filter(l => l.category.toLowerCase().includes(filter.toLowerCase()));

  return (
    <div className="space-y-8 p-6 md:p-8 max-w-7xl mx-auto text-slate-100">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-emerald-950/60">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <MapPin className="w-3.5 h-3.5" /> Environmental Logistics
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Location Scouting & Permits
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Tactical location scouting nodes, environmental parameter tracking, and permit status hub.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2 cursor-pointer">
            <Plus className="w-4 h-4" /> Add Scouted Location
          </button>
          <Link
            href="/dashboard"
            className="px-4 py-2.5 rounded-xl bg-[#09130e] hover:bg-[#0e1d15] border border-emerald-950 text-slate-300 text-xs font-semibold transition-all flex items-center gap-2"
          >
            Dashboard
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-[#09130e] border border-emerald-950/70">
          <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Scouted Sites</span>
          <div className="text-xl font-bold text-white">3 Locations</div>
          <span className="text-[11px] text-emerald-400 mt-1 block">Fully mapped</span>
        </div>
        <div className="p-4 rounded-xl bg-[#09130e] border border-emerald-950/70">
          <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Permit Readiness</span>
          <div className="text-xl font-bold text-emerald-400">2 Cleared</div>
          <span className="text-[11px] text-amber-400 mt-1 block">1 Under review</span>
        </div>
        <div className="p-4 rounded-xl bg-[#09130e] border border-emerald-950/70">
          <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Primary Hub</span>
          <div className="text-xl font-bold text-white">Colombo Sector 07</div>
          <span className="text-[11px] text-slate-400 mt-1 block">Active staging area</span>
        </div>
        <div className="p-4 rounded-xl bg-[#09130e] border border-emerald-950/70">
          <span className="text-[10px] uppercase font-mono text-slate-400 block mb-1">Estimated Daily Fees</span>
          <div className="text-xl font-bold text-white">$14,250</div>
          <span className="text-[11px] text-slate-400 mt-1 block">Soundstage & city permits</span>
        </div>
      </div>

      <div className="flex items-center gap-2 p-1.5 rounded-xl bg-[#09130e] border border-emerald-950/70 w-fit">
        <button
          onClick={() => setFilter("ALL")}
          className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${filter === "ALL" ? "bg-emerald-500 text-slate-950 font-bold" : "text-slate-400 hover:text-white"
            }`}
        >
          ALL
        </button>
        <button
          onClick={() => setFilter("Soundstage")}
          className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${filter === "Soundstage" ? "bg-emerald-500 text-slate-950 font-bold" : "text-slate-400 hover:text-white"
            }`}
        >
          Soundstage
        </button>
        <button
          onClick={() => setFilter("Exterior")}
          className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${filter === "Exterior" ? "bg-emerald-500 text-slate-950 font-bold" : "text-slate-400 hover:text-white"
            }`}
        >
          Exterior Street
        </button>
        <button
          onClick={() => setFilter("Docks")}
          className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${filter === "Docks" ? "bg-emerald-500 text-slate-950 font-bold" : "text-slate-400 hover:text-white"
            }`}
        >
          Industrial Docks
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredLocations.map((loc) => (
          <div
            key={loc.id}
            className="group rounded-2xl bg-[#09130e] border border-emerald-950/70 hover:border-emerald-500/40 transition-all overflow-hidden flex flex-col shadow-lg"
          >
            <div className="relative aspect-video w-full bg-[#050a07] overflow-hidden border-b border-emerald-950/60">
              <img
                src={loc.imageUrl}
                alt={loc.name}
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-3 left-3">
                <span className="px-2 py-0.5 rounded bg-black/80 backdrop-blur-md text-[10px] font-mono text-slate-300 border border-slate-700">
                  {loc.category}
                </span>
              </div>
              <div className="absolute top-3 right-3">
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono border flex items-center gap-1 ${loc.status === "Cleared"
                      ? "bg-emerald-950/90 text-emerald-400 border-emerald-700"
                      : "bg-amber-950/90 text-amber-400 border-amber-700"
                    }`}
                >
                  {loc.status === "Cleared" ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                  {loc.status}
                </span>
              </div>
            </div>

            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div>
                <p className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider mb-1">
                  {loc.sceneTag}
                </p>
                <h3 className="text-sm font-bold text-white mb-1">{loc.name}</h3>
                <p className="text-xs text-slate-400 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-500" /> {loc.address}
                </p>
              </div>

              <div className="space-y-2 pt-3 border-t border-emerald-950/60 text-[11px]">
                <div className="bg-[#0e1d15] p-2 rounded-lg border border-emerald-950/80 flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Zap className="w-3 h-3 text-emerald-400" /> Power Grid
                  </span>
                  <span className="text-slate-200 font-mono text-[10px]">{loc.powerGrid}</span>
                </div>
                <div className="bg-[#0e1d15] p-2 rounded-lg border border-emerald-950/80 flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <Sliders className="w-3 h-3 text-emerald-400" /> Rigging Spec
                  </span>
                  <span className="text-slate-200 font-mono text-[10px]">{loc.rigging}</span>
                </div>
                <div className="bg-[#0e1d15] p-2 rounded-lg border border-emerald-950/80 flex items-center justify-between">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <DollarSign className="w-3 h-3 text-emerald-400" /> Est. Daily Fee
                  </span>
                  <span className="text-emerald-400 font-bold font-mono text-[11px]">{loc.dailyFee}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}