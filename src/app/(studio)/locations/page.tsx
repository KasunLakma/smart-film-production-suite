"use client";

import React, { useState, useMemo } from "react";
import {
  MapPin,
  ShieldAlert,
  Sun,
  Volume2,
  Zap,
  CheckCircle2,
  Clock,
  Plus,
  Search,
  Filter,
  Sparkles,
  X,
  Trash2,
  Edit2,
  ExternalLink,
  DollarSign,
  Building2,
  Navigation,
  Compass,
  AlertTriangle,
  FileCheck2,
  Truck,
  Maximize2,
  Camera,
} from "lucide-react";

// --- Types ---
export type PermitStatus = "Cleared" | "In Review" | "Denied";
export type NoiseLevel = "Quiet" | "Moderate" | "Loud";
export type SunOrientation =
  | "Golden Hour (17:30)"
  | "Backlit South-Facing"
  | "Controlled Studio Lighting"
  | "Direct Overhead Sun";
export type PowerSpec =
  | "Grid 230V 3-Phase"
  | "Generator Required 50kW"
  | "High Power 400A Tie-in"
  | "Standard 110V / 20A";
export type AccessibilityType =
  | "Heavy Truck & Vehicle Access"
  | "Freight Elevator Access"
  | "Hike In (200m Shuttle Needed)";

export interface LocationSite {
  id: string;
  name: string;
  category: "Soundstage" | "Exterior Urban" | "Interior Cybernetic" | "Industrial" | "Natural";
  linkedScenes: string; // e.g. "SCENE 01 & 04 - INT. ARCHIVE"
  permitStatus: PermitStatus;
  noiseLevel: NoiseLevel;
  sunOrientation: SunOrientation;
  powerSpec: PowerSpec;
  accessibility: AccessibilityType;
  coordinates: string;
  address: string;
  dailyCost: number;
  coverGradient: string;
  notes?: string;
  parkingCapacity?: string;
  nearestHospital?: string;
}

// --- Initial Mock Data (8 Scouted Sites matching Section 1.4 & Thompson 2021) ---
const INITIAL_LOCATIONS: LocationSite[] = [
  {
    id: "loc-1",
    name: "Metro Soundstage 4 — Cyber Archive",
    category: "Soundstage",
    linkedScenes: "SCENE 01 & 04 — INT. ARCHIVE",
    permitStatus: "Cleared",
    noiseLevel: "Quiet",
    sunOrientation: "Controlled Studio Lighting",
    powerSpec: "High Power 400A Tie-in",
    accessibility: "Freight Elevator Access",
    coordinates: "6.9271° N, 79.8612° E",
    address: "Studio City Sector 07, Colombo",
    dailyCost: 2850,
    coverGradient: "from-emerald-900/80 via-studio-900 to-emerald-950",
    notes: "Acoustic insulation rated STC 65. Pre-rigged overhead truss network.",
    parkingCapacity: "45 Vehicles / 6 Production Trucks",
    nearestHospital: "National Hospital (1.2 km)",
  },
  {
    id: "loc-2",
    name: "Lotus Tower Neon Alleyway",
    category: "Exterior Urban",
    linkedScenes: "SCENE 08 & 15 — EXT. NEON MARKET",
    permitStatus: "Cleared",
    noiseLevel: "Moderate",
    sunOrientation: "Golden Hour (17:30)",
    powerSpec: "Generator Required 50kW",
    accessibility: "Heavy Truck & Vehicle Access",
    coordinates: "6.9298° N, 79.8540° E",
    address: "D.R. Wijewardena Mawatha, Colombo 10",
    dailyCost: 2200,
    coverGradient: "from-blue-900/80 via-studio-900 to-indigo-950",
    notes: "Night permit cleared for wet down & atmospheric smoke FX between 19:00 - 05:00.",
    parkingCapacity: "12 Crew Vans / 2 Generator Trucks",
    nearestHospital: "Asiri Central Hospital (2.4 km)",
  },
  {
    id: "loc-3",
    name: "Old Port Docklands Sub-Level",
    category: "Industrial",
    linkedScenes: "SCENE 12 & 14 — INT. REACTOR BAY",
    permitStatus: "In Review",
    noiseLevel: "Loud",
    sunOrientation: "Backlit South-Facing",
    powerSpec: "Generator Required 50kW",
    accessibility: "Heavy Truck & Vehicle Access",
    coordinates: "6.9412° N, 79.8455° E",
    address: "Port Access Road, Harbour Gate 3",
    dailyCost: 1950,
    coverGradient: "from-amber-900/70 via-studio-900 to-studio-950",
    notes: "Awaiting Port Authority environmental clearance. Safety officer mandatory.",
    parkingCapacity: "25 Production Trucks",
    nearestHospital: "Port Hospital (0.8 km)",
  },
  {
    id: "loc-4",
    name: "High-Rise Glass Atrium & Helipad",
    category: "Interior Cybernetic",
    linkedScenes: "SCENE 03 & 09 — INT. CORPORATE TOWER",
    permitStatus: "Cleared",
    noiseLevel: "Quiet",
    sunOrientation: "Direct Overhead Sun",
    powerSpec: "Grid 230V 3-Phase",
    accessibility: "Freight Elevator Access",
    coordinates: "6.9315° N, 79.8472° E",
    address: "World Trade Center Level 34, Sector 01",
    dailyCost: 2400,
    coverGradient: "from-emerald-950 via-teal-900/70 to-studio-950",
    notes: "Sunday shoot window only. Floor load limit 500kg/m².",
    parkingCapacity: "Underground VIP Parking (15 Slots)",
    nearestHospital: "Durdans Hospital (3.1 km)",
  },
  {
    id: "loc-5",
    name: "Diyawanna Wetland Observatory",
    category: "Natural",
    linkedScenes: "SCENE 18 — EXT. OUTPOST DAWN",
    permitStatus: "In Review",
    noiseLevel: "Quiet",
    sunOrientation: "Golden Hour (17:30)",
    powerSpec: "Generator Required 50kW",
    accessibility: "Hike In (200m Shuttle Needed)",
    coordinates: "6.8920° N, 79.9140° E",
    address: "Diyawanna Reserve, Battaramulla",
    dailyCost: 1400,
    coverGradient: "from-green-900/80 via-emerald-950 to-studio-950",
    notes: "Wildlife Conservation Department permit under review. Eco-friendly silent generator required.",
    parkingCapacity: "Main Gate Lot (10 Vehicles)",
    nearestHospital: "Sri Jayawardenepura General Hospital (1.5 km)",
  },
  {
    id: "loc-6",
    name: "Grand Colonial Train Depot",
    category: "Exterior Urban",
    linkedScenes: "SCENE 05 & 06 — EXT. PLATFORM CHASE",
    permitStatus: "Cleared",
    noiseLevel: "Loud",
    sunOrientation: "Backlit South-Facing",
    powerSpec: "Grid 230V 3-Phase",
    accessibility: "Heavy Truck & Vehicle Access",
    coordinates: "6.9340° N, 79.8580° E",
    address: "Fort Railway Terminal, Sector 02",
    dailyCost: 1800,
    coverGradient: "from-slate-800 via-studio-900 to-emerald-950",
    notes: "Shoot window between 01:00 AM - 04:30 AM during train maintenance halt.",
    parkingCapacity: "Railway Logistics Yard",
    nearestHospital: "National Hospital (1.8 km)",
  },
  {
    id: "loc-7",
    name: "Subterranean Cyber Tunnel",
    category: "Interior Cybernetic",
    linkedScenes: "SCENE 22 — INT. ESCAPE TUNNEL",
    permitStatus: "Cleared",
    noiseLevel: "Moderate",
    sunOrientation: "Controlled Studio Lighting",
    powerSpec: "High Power 400A Tie-in",
    accessibility: "Freight Elevator Access",
    coordinates: "6.9240° N, 79.8650° E",
    address: "Metro Soundstage Underground Vault B",
    dailyCost: 1650,
    coverGradient: "from-cyan-950 via-studio-900 to-emerald-950",
    notes: "Full ventilation system active. Exhaust fans pre-installed.",
    parkingCapacity: "Stage 4 Annex Yard",
    nearestHospital: "National Hospital (1.1 km)",
  },
  {
    id: "loc-8",
    name: "Abandoned Textile Factory",
    category: "Industrial",
    linkedScenes: "SCENE 16 & 17 — EXT. WAREHOUSE HIDE",
    permitStatus: "Denied",
    noiseLevel: "Loud",
    sunOrientation: "Direct Overhead Sun",
    powerSpec: "Generator Required 50kW",
    accessibility: "Heavy Truck & Vehicle Access",
    coordinates: "6.8750° N, 79.8850° E",
    address: "Ratmalana Industrial Zone B",
    dailyCost: 0,
    coverGradient: "from-rose-950/80 via-studio-900 to-studio-950",
    notes: "Structural integrity audit failed. Structural reinforcement required prior to re-application.",
    parkingCapacity: "Factory Foreground Yard",
    nearestHospital: "Kalubowila Hospital (2.0 km)",
  },
];

export default function LocationsPage() {
  const [locations, setLocations] = useState<LocationSite[]>(INITIAL_LOCATIONS);
  const [permitFilter, setPermitFilter] = useState<string>("All");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedMapSite, setSelectedMapSite] = useState<LocationSite | null>(null);

  // Form State for Quick Location Submission
  const [formData, setFormData] = useState<{
    name: string;
    category: "Soundstage" | "Exterior Urban" | "Interior Cybernetic" | "Industrial" | "Natural";
    linkedScenes: string;
    permitStatus: PermitStatus;
    noiseLevel: NoiseLevel;
    sunOrientation: SunOrientation;
    powerSpec: PowerSpec;
    accessibility: AccessibilityType;
    coordinates: string;
    address: string;
    dailyCost: number | string;
    notes: string;
  }>({
    name: "",
    category: "Soundstage",
    linkedScenes: "SCENE 01 — INT. ARCHIVE",
    permitStatus: "In Review",
    noiseLevel: "Quiet",
    sunOrientation: "Controlled Studio Lighting",
    powerSpec: "Grid 230V 3-Phase",
    accessibility: "Heavy Truck & Vehicle Access",
    coordinates: "6.9271° N, 79.8612° E",
    address: "Sector 07 Studio Complex",
    dailyCost: "1500",
    notes: "",
  });

  // --- Top Analytical Metric Calculations ---
  const totalSites = locations.length;
  const clearedPermits = useMemo(
    () => locations.filter((l) => l.permitStatus === "Cleared").length,
    [locations]
  );
  const pendingPermits = useMemo(
    () => locations.filter((l) => l.permitStatus === "In Review").length,
    [locations]
  );
  const deniedPermits = useMemo(
    () => locations.filter((l) => l.permitStatus === "Denied").length,
    [locations]
  );

  const totalBudgetDisbursed = useMemo(
    () => locations.reduce((sum, l) => sum + l.dailyCost, 0),
    [locations]
  );

  const primaryBase = "Colombo Sector 07 Hub";

  // --- Filtered Locations ---
  const filteredLocations = useMemo(() => {
    return locations.filter((loc) => {
      if (permitFilter !== "All" && loc.permitStatus !== permitFilter) return false;
      if (categoryFilter !== "All" && loc.category !== categoryFilter) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = loc.name.toLowerCase().includes(q);
        const matchScene = loc.linkedScenes.toLowerCase().includes(q);
        const matchAddress = loc.address.toLowerCase().includes(q);
        if (!matchName && !matchScene && !matchAddress) return false;
      }

      return true;
    });
  }, [locations, permitFilter, categoryFilter, searchQuery]);

  // --- Handlers ---
  const handleSaveLocation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    const cost =
      typeof formData.dailyCost === "number"
        ? formData.dailyCost
        : parseFloat(formData.dailyCost) || 0;

    const newLoc: LocationSite = {
      id: `loc-${Date.now()}`,
      name: formData.name,
      category: formData.category,
      linkedScenes: formData.linkedScenes || "UNLINKED SCENE",
      permitStatus: formData.permitStatus,
      noiseLevel: formData.noiseLevel,
      sunOrientation: formData.sunOrientation,
      powerSpec: formData.powerSpec,
      accessibility: formData.accessibility,
      coordinates: formData.coordinates || "6.9271° N, 79.8612° E",
      address: formData.address || "Colombo Sector 07 Hub",
      dailyCost: cost,
      coverGradient:
        formData.category === "Soundstage"
          ? "from-emerald-900/80 via-studio-900 to-emerald-950"
          : formData.category === "Exterior Urban"
          ? "from-blue-900/80 via-studio-900 to-indigo-950"
          : formData.category === "Natural"
          ? "from-green-900/80 via-emerald-950 to-studio-950"
          : "from-amber-900/70 via-studio-900 to-studio-950",
      notes: formData.notes || "Newly submitted scout site.",
      parkingCapacity: "10 Vehicles",
      nearestHospital: "National Hospital (2.0 km)",
    };

    setLocations((prev) => [newLoc, ...prev]);
    setIsAddModalOpen(false);
  };

  const handleDeleteLocation = (id: string) => {
    if (confirm("Are you sure you want to remove this scouted location?")) {
      setLocations((prev) => prev.filter((l) => l.id !== id));
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-studio-700">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2.5">
              <MapPin className="w-6 h-6 text-emerald-400" />
              Location Scouting Board
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-700/60 text-emerald-300 font-mono text-xs font-semibold flex items-center gap-1 shadow-[0_0_10px_rgba(22,163,74,0.2)]">
              <Sparkles className="w-3 h-3 text-emerald-400 animate-pulse" />
              Section 4.1 Module 6
            </span>
          </div>
          <p className="text-sm text-emerald-100/70 mt-1">
            Tactical location scouting matrix, environmental parameter tracking, and permit status hub.
          </p>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-semibold flex items-center gap-2 transition-all shadow-[0_0_15px_rgba(22,163,74,0.3)] active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Scouted Location</span>
          </button>
        </div>
      </div>

      {/* Top Analytical Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Scouted Locations */}
        <div className="p-5 rounded-xl bg-studio-900 border border-studio-700 hover:border-emerald-600/50 transition-all group shadow-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 uppercase font-semibold tracking-wider font-mono">
              Scouted Sites
            </span>
            <div className="p-2 rounded-lg bg-emerald-950 border border-emerald-700/50 text-emerald-400 group-hover:text-emerald-300 transition-colors">
              <Compass className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <p className="text-3xl font-bold text-white tracking-tight font-mono">
              {totalSites} <span className="text-xs text-slate-400 font-normal">Sites</span>
            </p>
            <span className="text-xs font-mono text-emerald-400">
              {locations.filter((l) => l.category === "Soundstage").length} Stage / {locations.filter((l) => l.category !== "Soundstage").length} Field
            </span>
          </div>
          <div className="mt-3 w-full bg-studio-950 rounded-full h-1.5 overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full w-full" />
          </div>
        </div>

        {/* Card 2: Permits Cleared / Pending */}
        <div className="p-5 rounded-xl bg-studio-900 border border-studio-700 hover:border-emerald-600/50 transition-all group shadow-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 uppercase font-semibold tracking-wider font-mono">
              Permit Readiness
            </span>
            <div className="p-2 rounded-lg bg-emerald-950 border border-emerald-700/50 text-emerald-400 group-hover:text-emerald-300 transition-colors">
              <FileCheck2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <p className="text-3xl font-bold text-emerald-400 tracking-tight font-mono">
              {clearedPermits} <span className="text-xs text-slate-400 font-normal">Cleared</span>
            </p>
            <div className="text-xs font-mono text-slate-300 flex items-center gap-1.5">
              <span className="text-amber-400 font-semibold">{pendingPermits} Pending</span>
              {deniedPermits > 0 && (
                <>
                  <span className="text-slate-500">/</span>
                  <span className="text-rose-400 font-semibold">{deniedPermits} Denied</span>
                </>
              )}
            </div>
          </div>
          <div className="mt-3 w-full bg-studio-950 rounded-full h-1.5 overflow-hidden flex">
            <div
              className="bg-emerald-500 h-full"
              style={{ width: `${(clearedPermits / totalSites) * 100}%` }}
              title={`Cleared: ${clearedPermits}`}
            />
            <div
              className="bg-amber-400 h-full"
              style={{ width: `${(pendingPermits / totalSites) * 100}%` }}
              title={`Pending: ${pendingPermits}`}
            />
            <div
              className="bg-rose-500 h-full"
              style={{ width: `${(deniedPermits / totalSites) * 100}%` }}
              title={`Denied: ${deniedPermits}`}
            />
          </div>
        </div>

        {/* Card 3: Primary Shooting Base */}
        <div className="p-5 rounded-xl bg-studio-900 border border-studio-700 hover:border-emerald-600/50 transition-all group shadow-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 uppercase font-semibold tracking-wider font-mono">
              Primary Shooting Base
            </span>
            <div className="p-2 rounded-lg bg-emerald-950 border border-emerald-700/50 text-emerald-400 group-hover:text-emerald-300 transition-colors">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <p className="text-lg font-bold text-white tracking-tight font-mono truncate">
              {primaryBase}
            </p>
            <span className="text-[10px] font-mono text-emerald-300/90 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800 shrink-0">
              Active Hub
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>6.9271° N, 79.8612° E</span>
            <span className="text-emerald-400 font-semibold">Soundstage 4</span>
          </div>
        </div>

        {/* Card 4: Estimated Budget Disbursed */}
        <div className="p-5 rounded-xl bg-studio-900 border border-studio-700 hover:border-emerald-600/50 transition-all group shadow-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 uppercase font-semibold tracking-wider font-mono">
              Disbursed Daily Fees
            </span>
            <div className="p-2 rounded-lg bg-emerald-950 border border-emerald-700/50 text-emerald-400 group-hover:text-emerald-300 transition-colors">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <p className="text-3xl font-bold text-emerald-400 tracking-tight font-mono">
              ${totalBudgetDisbursed.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </p>
            <span className="text-[10px] font-mono text-slate-400">/ day active</span>
          </div>
          <div className="mt-3 w-full bg-studio-950 rounded-full h-1.5 overflow-hidden">
            <div className="bg-emerald-400 h-full rounded-full w-full" />
          </div>
        </div>
      </div>

      {/* Filter & Toolbar Controls */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-studio-900 p-3 rounded-xl border border-studio-700">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by site name, linked scene, or address..."
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-studio-950 border border-studio-700 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500 font-mono transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 overflow-x-auto">
          {/* Permit Filter */}
          <div className="flex items-center gap-1.5 bg-studio-950 border border-studio-700 px-3 py-1.5 rounded-lg shrink-0">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[11px] text-slate-400 font-mono">Permit:</span>
            <select
              value={permitFilter}
              onChange={(e) => setPermitFilter(e.target.value)}
              className="bg-transparent text-xs text-slate-200 font-mono focus:outline-none cursor-pointer"
            >
              <option value="All" className="bg-studio-900">All Statuses</option>
              <option value="Cleared" className="bg-studio-900">Cleared</option>
              <option value="In Review" className="bg-studio-900">In Review</option>
              <option value="Denied" className="bg-studio-900">Denied</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-1.5 bg-studio-950 border border-studio-700 px-3 py-1.5 rounded-lg shrink-0">
            <Building2 className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[11px] text-slate-400 font-mono">Type:</span>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-transparent text-xs text-slate-200 font-mono focus:outline-none cursor-pointer"
            >
              <option value="All" className="bg-studio-900">All Categories</option>
              <option value="Soundstage" className="bg-studio-900">Soundstage</option>
              <option value="Exterior Urban" className="bg-studio-900">Exterior Urban</option>
              <option value="Interior Cybernetic" className="bg-studio-900">Interior Cybernetic</option>
              <option value="Industrial" className="bg-studio-900">Industrial</option>
              <option value="Natural" className="bg-studio-900">Natural</option>
            </select>
          </div>

          <span className="text-xs font-mono text-slate-400 px-2 shrink-0">
            {filteredLocations.length} locations
          </span>
        </div>
      </div>

      {/* Visual Location Grid & Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredLocations.map((site) => (
          <div
            key={site.id}
            className="bg-studio-900 border border-studio-700 hover:border-emerald-600/60 rounded-xl overflow-hidden shadow-lg transition-all flex flex-col group"
          >
            {/* Card Header */}
            <div className="p-4 bg-studio-950 border-b border-studio-700 space-y-2">
              <div className="flex items-center justify-between gap-2 font-mono text-[10px]">
                <span className="px-2 py-0.5 rounded bg-emerald-950 border border-emerald-800 text-emerald-300 font-bold truncate max-w-[230px]">
                  {site.linkedScenes}
                </span>

                {/* Permit Status Chip */}
                <span
                  className={`px-2.5 py-0.5 rounded-full border font-bold uppercase tracking-wider shrink-0 flex items-center gap-1 ${
                    site.permitStatus === "Cleared"
                      ? "bg-emerald-950/90 text-emerald-300 border-emerald-700/60"
                      : site.permitStatus === "In Review"
                      ? "bg-amber-950/90 text-amber-300 border-amber-700/60"
                      : "bg-rose-950/90 text-rose-300 border-rose-700/60"
                  }`}
                >
                  {site.permitStatus === "Cleared" ? (
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  ) : site.permitStatus === "In Review" ? (
                    <Clock className="w-3 h-3 text-amber-400 animate-pulse" />
                  ) : (
                    <ShieldAlert className="w-3 h-3 text-rose-400" />
                  )}
                  <span>{site.permitStatus}</span>
                </span>
              </div>

              <h3 className="text-base font-bold text-white tracking-tight group-hover:text-emerald-300 transition-colors">
                {site.name}
              </h3>
            </div>

            {/* Image / 16:9 Aspect Preview Banner */}
            <div
              className={`aspect-video w-full bg-gradient-to-br ${site.coverGradient} relative p-4 flex flex-col justify-between overflow-hidden border-b border-studio-700`}
            >
              {/* Aspect Ratio Badge Overlay */}
              <div className="flex items-center justify-between z-10 font-mono text-[10px]">
                <span className="px-2 py-0.5 rounded bg-black/60 backdrop-blur-sm border border-white/10 text-slate-300 flex items-center gap-1">
                  <Camera className="w-3 h-3 text-emerald-400" />
                  16:9 Widescreen Frame
                </span>
                <span className="px-2 py-0.5 rounded bg-black/60 backdrop-blur-sm border border-white/10 text-emerald-400 font-bold">
                  {site.category}
                </span>
              </div>

              {/* Ambient Grid overlay representation */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#07160d15_1px,transparent_1px),linear-gradient(to_bottom,#07160d15_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />

              {/* Address / GPS Watermark inside banner */}
              <div className="z-10 font-mono text-[11px] text-slate-200/90 drop-shadow flex items-center gap-1">
                <Navigation className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="truncate">{site.address}</span>
              </div>
            </div>

            {/* Environmental Parameters (Chips/Tags) */}
            <div className="p-4 space-y-3 font-mono text-xs flex-1 bg-studio-900/90">
              <div className="grid grid-cols-2 gap-2">
                {/* Noise Level */}
                <div className="p-2 rounded bg-studio-950 border border-studio-700/80 flex items-center gap-2">
                  <Volume2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[9px] text-slate-400 uppercase">Noise Level</p>
                    <p className="text-[11px] font-semibold text-slate-200 truncate">
                      {site.noiseLevel}
                    </p>
                  </div>
                </div>

                {/* Sun / Light Orientation */}
                <div className="p-2 rounded bg-studio-950 border border-studio-700/80 flex items-center gap-2">
                  <Sun className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[9px] text-slate-400 uppercase">Lighting</p>
                    <p className="text-[11px] font-semibold text-slate-200 truncate">
                      {site.sunOrientation.split(" ")[0]}
                    </p>
                  </div>
                </div>

                {/* Power Availability */}
                <div className="p-2 rounded bg-studio-950 border border-studio-700/80 flex items-center gap-2">
                  <Zap className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[9px] text-slate-400 uppercase">Power Spec</p>
                    <p className="text-[11px] font-semibold text-slate-200 truncate">
                      {site.powerSpec.split(" ")[0]}
                    </p>
                  </div>
                </div>

                {/* Accessibility */}
                <div className="p-2 rounded bg-studio-950 border border-studio-700/80 flex items-center gap-2">
                  <Truck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[9px] text-slate-400 uppercase">Access</p>
                    <p className="text-[11px] font-semibold text-slate-200 truncate">
                      {site.accessibility.split(" ")[0]}
                    </p>
                  </div>
                </div>
              </div>

              {site.notes && (
                <p className="text-[11px] text-slate-300/80 font-sans italic line-clamp-2 pt-1 border-t border-studio-800">
                  "{site.notes}"
                </p>
              )}
            </div>

            {/* Card Footer */}
            <div className="p-4 bg-studio-950 border-t border-studio-700 flex items-center justify-between gap-3 font-mono text-xs">
              <div>
                <p className="text-[10px] text-slate-400 uppercase">Daily Rental Fee</p>
                <p className="text-sm font-bold text-emerald-300">
                  ${site.dailyCost.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  <span className="text-[10px] text-slate-400 font-normal">/day</span>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedMapSite(site)}
                  className="px-3 py-1.5 rounded-lg bg-studio-800 hover:bg-studio-700 text-emerald-300 border border-studio-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                  <span>View On Map</span>
                </button>
                <button
                  onClick={() => handleDeleteLocation(site.id)}
                  title="Remove location"
                  className="p-1.5 rounded hover:bg-rose-950/60 text-slate-400 hover:text-rose-400 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* --- QUICK LOCATION SUBMISSION DRAWER / MODAL --- */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-xl bg-studio-900 border border-studio-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 bg-studio-950 border-b border-studio-700 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-emerald-950 border border-emerald-700/60 text-emerald-400">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">
                    Submit New Scouted Location
                  </h3>
                  <p className="text-xs text-slate-400 font-mono">
                    Track environmental parameters and permit statuses instantly.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg hover:bg-studio-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={handleSaveLocation}
              className="p-6 overflow-y-auto space-y-4 font-sans text-xs flex-1"
            >
              {/* Site Name & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-mono text-[11px] uppercase tracking-wider mb-1">
                    Site Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="e.g. Metro Soundstage 5"
                    className="w-full px-3.5 py-2 rounded-lg bg-studio-950 border border-studio-700 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-mono text-[11px] uppercase tracking-wider mb-1">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        category: e.target.value as any,
                      }))
                    }
                    className="w-full px-3.5 py-2 rounded-lg bg-studio-950 border border-studio-700 text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
                  >
                    <option value="Soundstage">Soundstage</option>
                    <option value="Exterior Urban">Exterior Urban</option>
                    <option value="Interior Cybernetic">Interior Cybernetic</option>
                    <option value="Industrial">Industrial</option>
                    <option value="Natural">Natural</option>
                  </select>
                </div>
              </div>

              {/* Linked Scenes & Permit Status */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-mono text-[11px] uppercase tracking-wider mb-1">
                    Linked Scenes *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.linkedScenes}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        linkedScenes: e.target.value,
                      }))
                    }
                    placeholder="e.g. SCENE 01 & 04 — INT. ARCHIVE"
                    className="w-full px-3.5 py-2 rounded-lg bg-studio-950 border border-studio-700 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-mono text-[11px] uppercase tracking-wider mb-1">
                    Permit Status *
                  </label>
                  <select
                    value={formData.permitStatus}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        permitStatus: e.target.value as PermitStatus,
                      }))
                    }
                    className="w-full px-3.5 py-2 rounded-lg bg-studio-950 border border-studio-700 text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
                  >
                    <option value="Cleared">Cleared (Emerald)</option>
                    <option value="In Review">In Review (Amber)</option>
                    <option value="Denied">Denied (Red)</option>
                  </select>
                </div>
              </div>

              {/* Environmental Parameters */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-mono text-[11px] uppercase tracking-wider mb-1">
                    Noise Level *
                  </label>
                  <select
                    value={formData.noiseLevel}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        noiseLevel: e.target.value as NoiseLevel,
                      }))
                    }
                    className="w-full px-3.5 py-2 rounded-lg bg-studio-950 border border-studio-700 text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
                  >
                    <option value="Quiet">Quiet (Acoustic Treated)</option>
                    <option value="Moderate">Moderate Ambient</option>
                    <option value="Loud">Loud Industrial</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-mono text-[11px] uppercase tracking-wider mb-1">
                    Sun / Light Orientation
                  </label>
                  <select
                    value={formData.sunOrientation}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        sunOrientation: e.target.value as SunOrientation,
                      }))
                    }
                    className="w-full px-3.5 py-2 rounded-lg bg-studio-950 border border-studio-700 text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
                  >
                    <option value="Controlled Studio Lighting">Controlled Studio Lighting</option>
                    <option value="Golden Hour (17:30)">Golden Hour (17:30)</option>
                    <option value="Backlit South-Facing">Backlit South-Facing</option>
                    <option value="Direct Overhead Sun">Direct Overhead Sun</option>
                  </select>
                </div>
              </div>

              {/* Power Spec & Accessibility */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-mono text-[11px] uppercase tracking-wider mb-1">
                    Power Availability
                  </label>
                  <select
                    value={formData.powerSpec}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        powerSpec: e.target.value as PowerSpec,
                      }))
                    }
                    className="w-full px-3.5 py-2 rounded-lg bg-studio-950 border border-studio-700 text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
                  >
                    <option value="Grid 230V 3-Phase">Grid 230V 3-Phase</option>
                    <option value="Generator Required 50kW">Generator Required 50kW</option>
                    <option value="High Power 400A Tie-in">High Power 400A Tie-in</option>
                    <option value="Standard 110V / 20A">Standard 110V / 20A</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 font-mono text-[11px] uppercase tracking-wider mb-1">
                    Accessibility
                  </label>
                  <select
                    value={formData.accessibility}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        accessibility: e.target.value as AccessibilityType,
                      }))
                    }
                    className="w-full px-3.5 py-2 rounded-lg bg-studio-950 border border-studio-700 text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
                  >
                    <option value="Heavy Truck & Vehicle Access">Heavy Truck & Vehicle Access</option>
                    <option value="Freight Elevator Access">Freight Elevator Access</option>
                    <option value="Hike In (200m Shuttle Needed)">Hike In (200m Shuttle Needed)</option>
                  </select>
                </div>
              </div>

              {/* Fee & Address */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-mono text-[11px] uppercase tracking-wider mb-1">
                    Daily Permit / Rental Fee ($) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="50"
                    value={formData.dailyCost}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        dailyCost: e.target.value,
                      }))
                    }
                    placeholder="1500"
                    className="w-full px-3.5 py-2 rounded-lg bg-studio-950 border border-studio-700 text-emerald-400 font-bold font-mono focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-mono text-[11px] uppercase tracking-wider mb-1">
                    Address / Sector
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, address: e.target.value }))
                    }
                    placeholder="e.g. Sector 07 Studio City"
                    className="w-full px-3.5 py-2 rounded-lg bg-studio-950 border border-studio-700 text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-slate-300 font-mono text-[11px] uppercase tracking-wider mb-1">
                  Logistics & Safety Notes
                </label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, notes: e.target.value }))
                  }
                  placeholder="Special permits required, night windows, load limits..."
                  className="w-full px-3.5 py-2 rounded-lg bg-studio-950 border border-studio-700 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 font-sans"
                />
              </div>

              <div className="pt-4 border-t border-studio-700 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-studio-950 border border-studio-700 text-slate-400 hover:text-white font-mono"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold flex items-center gap-2 shadow-[0_0_15px_rgba(22,163,74,0.3)] transition-all"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save Location Card</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- TACTICAL MAP PREVIEW OVERLAY MODAL --- */}
      {selectedMapSite && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-3xl bg-studio-900 border border-studio-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-5 bg-studio-950 border-b border-studio-700 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-emerald-950 border border-emerald-700/60 text-emerald-400">
                  <Navigation className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    {selectedMapSite.name}
                  </h3>
                  <p className="text-xs text-emerald-400 font-mono">
                    GPS: {selectedMapSite.coordinates} — {selectedMapSite.address}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedMapSite(null)}
                className="p-1 rounded-lg hover:bg-studio-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tactical Grid Visualization */}
            <div className="p-6 overflow-y-auto space-y-6 font-mono text-xs">
              <div className="h-64 rounded-xl bg-studio-950 border border-studio-700 relative overflow-hidden flex flex-col justify-between p-4">
                <div className="flex items-center justify-between z-10">
                  <span className="px-2.5 py-1 rounded bg-emerald-950 border border-emerald-700/80 text-emerald-300 text-[10px] font-bold">
                    TACTICAL SCOUT RADAR
                  </span>
                  <span className="text-[10px] text-slate-400">SCALE: 1:500</span>
                </div>

                {/* Radar Grid Graphic */}
                <div className="absolute inset-0 bg-[radial-gradient(#16a34a15_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full border border-emerald-500/20 animate-ping pointer-events-none" />
                
                <div className="z-10 self-center text-center space-y-1">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-400 text-emerald-400 flex items-center justify-center mx-auto shadow-[0_0_15px_rgba(22,163,74,0.5)]">
                    <MapPin className="w-5 h-5 animate-bounce" />
                  </div>
                  <p className="text-sm font-bold text-white">{selectedMapSite.name}</p>
                  <p className="text-[10px] text-slate-400">{selectedMapSite.coordinates}</p>
                </div>

                <div className="flex items-center justify-between z-10 text-[10px] text-slate-400">
                  <span>BASE DISTANCE: 4.2 KM</span>
                  <span>PERMIT STATUS: {selectedMapSite.permitStatus.toUpperCase()}</span>
                </div>
              </div>

              {/* Logistics & Emergency Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-3.5 rounded-lg bg-studio-950 border border-studio-700 space-y-1">
                  <span className="text-[10px] text-slate-400">PARKING CAPACITY</span>
                  <p className="text-xs font-bold text-white">
                    {selectedMapSite.parkingCapacity || "20 Vehicles"}
                  </p>
                </div>
                <div className="p-3.5 rounded-lg bg-studio-950 border border-studio-700 space-y-1">
                  <span className="text-[10px] text-slate-400">NEAREST HOSPITAL</span>
                  <p className="text-xs font-bold text-emerald-400 truncate">
                    {selectedMapSite.nearestHospital || "National Hospital"}
                  </p>
                </div>
                <div className="p-3.5 rounded-lg bg-studio-950 border border-studio-700 space-y-1">
                  <span className="text-[10px] text-slate-400">DAILY PERMIT FEE</span>
                  <p className="text-xs font-bold text-emerald-300">
                    ${selectedMapSite.dailyCost.toLocaleString("en-US")} / day
                  </p>
                </div>
              </div>

              {selectedMapSite.notes && (
                <div className="p-4 rounded-lg bg-studio-950 border border-studio-700 space-y-1">
                  <span className="text-[10px] text-slate-400">SCOUT DIRECTIVES & PERMIT NOTES</span>
                  <p className="text-xs text-slate-300 font-sans">{selectedMapSite.notes}</p>
                </div>
              )}
            </div>

            <div className="p-4 bg-studio-950 border-t border-studio-700 flex justify-end">
              <button
                onClick={() => setSelectedMapSite(null)}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold"
              >
                Close Map Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
