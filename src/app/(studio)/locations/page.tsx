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
  X
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
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [locations, setLocations] = useState<LocationItem[]>([
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
  ]);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    sceneSlug: "",
    category: "Soundstage" as LocationItem["category"],
    address: "",
    permitStatus: "Cleared" as LocationItem["permitStatus"],
    powerSupply: "",
    lightingType: "",
    imageUrl: ""
  });

  const handleAddLocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.address) return;

    const newLoc: LocationItem = {
      id: `LOC-${String(locations.length + 1).padStart(2, "0")}`,
      name: formData.name,
      sceneSlug: formData.sceneSlug || "SCENE EXTRACTION PENDING",
      category: formData.category,
      address: formData.address,
      permitStatus: formData.permitStatus,
      powerSupply: formData.powerSupply || "Standard Auxiliary Power",
      lightingType: formData.lightingType || "Natural / Ambient Rig",
      imageUrl: formData.imageUrl || "https://images.unsplash.com/photo-1511447333015-45b65e60f6d5?auto=format&fit=crop&w=800&q=80"
    };

    setLocations([newLoc, ...locations]);
    setFormData({
      name: "",
      sceneSlug: "",
      category: "Soundstage",
      address: "",
      permitStatus: "Cleared",
      powerSupply: "",
      lightingType: "",
      imageUrl: ""
    });
    setIsModalOpen(false);
  };

  const filteredLocations = filterType === "ALL"
    ? locations
    : locations.filter(loc => loc.category === filterType);

  const clearedPermits = locations.filter(l => l.permitStatus === "Cleared").length;
  const inReviewPermits = locations.filter(l => l.permitStatus === "In Review").length;

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
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2 cursor-pointer"
          >
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
          <h3 className="text-2xl font-bold text-white mt-1">{locations.length} Locations</h3>
          <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Fully mapped
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[#09130e] border border-emerald-950/70">
          <p className="text-xs uppercase tracking-wider text-slate-400 font-medium">Permit Readiness</p>
          <h3 className="text-2xl font-bold text-emerald-400 mt-1">{clearedPermits} Cleared</h3>
          <p className="text-xs text-amber-400 mt-1 flex items-center gap-1">
            <Clock className="w-3 h-3" /> {inReviewPermits} Under review
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[#09130e] border border-emerald-950/70">
          <p className="text-xs uppercase tracking-wider text-slate-400 font-medium">Primary Hub</p>
          <h3 className="text-xl font-bold text-white mt-1 truncate">Colombo Sector 07</h3>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-emerald-400" /> Active staging base
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-[#09130e] border border-emerald-950/70">
          <p className="text-xs uppercase tracking-wider text-slate-400 font-medium">Estimated Daily Fees</p>
          <h3 className="text-2xl font-bold text-teal-300 mt-1">$14,250</h3>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-400" /> Soundstage & city fee
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

      {/* Location Cards */}
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

              {/* Technical Infrastructure */}
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

      {/* Add Location Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-lg bg-[#09130e] border border-emerald-500/40 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-emerald-950/70">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-400" /> Add Scouted Film Location
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-[#0e1d15]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddLocation} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Location Name / Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Victoria Dam Spillway, Fort Railway Terminal"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-[#050b07] border border-emerald-950/80 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500/60"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Target Scene Slug</label>
                  <input
                    type="text"
                    placeholder="e.g. SCENE 05: EXT. ROAD"
                    value={formData.sceneSlug}
                    onChange={(e) => setFormData({ ...formData, sceneSlug: e.target.value })}
                    className="w-full bg-[#050b07] border border-emerald-950/80 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500/60"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as LocationItem["category"] })}
                    className="w-full bg-[#050b07] border border-emerald-950/80 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500/60"
                  >
                    <option value="Soundstage">Soundstage</option>
                    <option value="Exterior Street">Exterior Street</option>
                    <option value="Industrial Docks">Industrial Docks</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Physical Address / Geo Area</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Main Street, Pettah, Colombo 11"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full bg-[#050b07] border border-emerald-950/80 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500/60"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Permit Status</label>
                  <select
                    value={formData.permitStatus}
                    onChange={(e) => setFormData({ ...formData, permitStatus: e.target.value as LocationItem["permitStatus"] })}
                    className="w-full bg-[#050b07] border border-emerald-950/80 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500/60"
                  >
                    <option value="Cleared">Cleared</option>
                    <option value="In Review">In Review</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Power Grid Specs</label>
                  <input
                    type="text"
                    placeholder="e.g. Mobile 40kVA Generator"
                    value={formData.powerSupply}
                    onChange={(e) => setFormData({ ...formData, powerSupply: e.target.value })}
                    className="w-full bg-[#050b07] border border-emerald-950/80 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500/60"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Lighting Base</label>
                  <input
                    type="text"
                    placeholder="e.g. High-Pressure Sodium Floods"
                    value={formData.lightingType}
                    onChange={(e) => setFormData({ ...formData, lightingType: e.target.value })}
                    className="w-full bg-[#050b07] border border-emerald-950/80 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500/60"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Image URL (Optional)</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    className="w-full bg-[#050b07] border border-emerald-950/80 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500/60"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-emerald-950/60">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20"
                >
                  Save Location
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}