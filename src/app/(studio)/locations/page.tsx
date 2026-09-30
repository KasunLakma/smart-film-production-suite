"use client";

import { useState } from "react";
import Link from "next/link";
import {
  MapPin,
  Sparkles,
  Plus,
  CheckCircle2,
  Clock,
  Sun,
  Zap,
  ShieldCheck,
  ArrowRight,
  SlidersHorizontal,
  Compass
} from "lucide-react";

interface LocationItem {
  id: string;
  name: string;
  sceneSlug: string;
  category: "Soundstage" | "Exterior Street" | "Industrial Docks";
  address: string;
  permitStatus: "Cleared" | "In Review" | "Pending";
  powerSupply: string;
  lightingType: string;
  imageUrl: string;
}

export default function LocationsPage() {
  const [filterType, setFilterType] = useState("ALL");

  const locations: LocationItem[] = [
    {
      id: "LOC-01",
      name: "Metro Soundstage 4 — Cyber Archive",
      sceneSlug: "SCENE 01: INT. CYBERNETIC ARCHIVE",
      category: "Soundstage",
      address: "Creative City Sector 02, Colombo",
      permitStatus: "Cleared",
      powerSupply: "3-Phase 400A Grid",
      lightingType: "Full Controlled Rig (Overhead Truss)",
      imageUrl: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80"
    },
    {
      id: "LOC-02",
      name: "Lotus Tower Neon Alleyway",
      sceneSlug: "SCENE 02: EXT. NEON MARKETPLACE",
      category: "Exterior Street",
      address: "D.R. Wijewardena Mawatha, Colombo 10",
      permitStatus: "Cleared",
      powerSupply: "Mobile 60kVA Generator",
      lightingType: "Ambient Practical Neon (Night Wet Look)",
      imageUrl: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80"
    },
    {
      id: "LOC-03",
      name: "Old Port Docklands Sub-Level",
      sceneSlug: "SCENE 03: EXT. WATERFRONT DOCKS",
      category: "Industrial Docks",
      address: "Port Access Road, Northern Gate 3",
      permitStatus: "In Review",
      powerSupply: "On-site Auxiliary Tie-In",
      lightingType: "Sodium High-Pressure / Floodlights",
      imageUrl: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80"
    }
  ];

  const filteredLocations = filterType === "ALL"
    ? locations
    : locations.filter(loc => loc.category === filterType);

  return (
    <div className="space-y-8 p-6 md:p-8 max-w-7xl mx-auto text-slate-100">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-emerald-950/60">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" /> Environmental Logistics
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Location Scouting & Permits
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Tactical location scouting matrix, environmental parameter tracking, and permit status hub.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Scouted Location
          </button>
          <Link
            href="/dashboard"
            className="px-4 py-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-semibold transition-all flex items-center gap-1.5"
          >
            Dashboard <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-[#09130e] border border-emerald-950/70">
          <p className="text-xs uppercase tracking-wider text-slate-400 font-medium">Scouted Sites</p>
          <h3 className="text-2xl font-bold text-white mt-1">3 Locations</h3>
          <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Fully mapped
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[#09130e] border border-emerald-950/70">
          <p className="text-xs uppercase tracking-wider text-slate-400 font-medium">Permit Readiness</p>
          <h3 className="text-2xl font-bold text-emerald-400 mt-1">2 Cleared</h3>
          <p className="text-xs text-amber-400 mt-1 flex items-center gap-1">
            <Clock className="w-3 h-3" /> 1 Under review
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[#09130e] border border-emerald-950/70">
          <p className="text-xs uppercase tracking-wider text-slate-400 font-medium">Primary Hub</p>
          <h3 className="text-xl font-bold text-white mt-1 truncate">Colombo Sector 07</h3>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
            <MapPin className="w-3 h-3 text-emerald-400" /> Active staging base
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[#09130e] border border-emerald-950/70">
          <p className="text-xs uppercase tracking-wider text-slate-400 font-medium">Estimated Daily Fees</p>
          <h3 className="text-2xl font-bold text-teal-300 mt-1">$14,250</h3>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-teal-400" /> Soundstage & city fee
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-[#09130e] border border-emerald-950/70">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-400 mr-1" />
          {["ALL", "Soundstage", "Exterior Street", "Industrial Docks"].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterType(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${filterType === cat
                  ? "bg-emerald-500 text-slate-950 font-bold"
                  : "bg-[#0e1d15] text-slate-300 hover:text-white"
                }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <span className="text-xs text-slate-400 font-medium">
          Showing {filteredLocations.length} locations
        </span>
      </div>

      {/* Location Cards (16:9 Visual Preview) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredLocations.map((loc) => (
          <div
            key={loc.id}
            className="group rounded-2xl bg-[#09130e] border border-emerald-950/70 hover:border-emerald-500/40 transition-all overflow-hidden flex flex-col shadow-lg"
          >
            {/* 16:9 Location Visual */}
            <div className="relative aspect-video w-full bg-[#050a07] overflow-hidden border-b border-emerald-950/60">
              <img
                src={loc.imageUrl}
                alt={loc.name}
                className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500 brightness-90 contrast-110"
              />
              <div className="absolute top-3 left-3">
                <span className="px-2 py-0.5 rounded bg-slate-950/80 backdrop-blur-md border border-emerald-500/30 text-emerald-300 text-[11px] font-bold font-mono">
                  {loc.category}
                </span>
              </div>
              <div className="absolute top-3 right-3">
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold backdrop-blur-md ${loc.permitStatus === "Cleared"
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                    : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                  }`}>
                  {loc.permitStatus}
                </span>
              </div>
            </div>

            {/* Content Details */}
            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
              <div>
                <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider block mb-1">
                  {loc.sceneSlug}
                </span>
                <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors">
                  {loc.name}
                </h3>
                <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> {loc.address}
                </p>
              </div>

              {/* Technical Optics & Infrastructure */}
              <div className="pt-3 border-t border-emerald-950/60 grid grid-cols-2 gap-2 text-[11px]">
                <div className="bg-[#0e1d15] p-2.5 rounded-lg border border-emerald-950/80">
                  <span className="text-slate-500 block text-[10px] uppercase flex items-center gap-1">
                    <Zap className="w-3 h-3 text-emerald-400" /> Power Grid
                  </span>
                  <span className="text-slate-200 font-medium truncate block mt-0.5">{loc.powerSupply}</span>
                </div>
                <div className="bg-[#0e1d15] p-2.5 rounded-lg border border-emerald-950/80">
                  <span className="text-slate-500 block text-[10px] uppercase flex items-center gap-1">
                    <Sun className="w-3 h-3 text-emerald-400" /> Lighting Base
                  </span>
                  <span className="text-slate-200 font-medium truncate block mt-0.5">{loc.lightingType}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}