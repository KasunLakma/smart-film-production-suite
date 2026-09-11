import React from "react";
import {
  LayoutDashboard,
  FileText,
  Film,
  DollarSign,
  TrendingUp,
  Sparkles,
  Users,
  CheckCircle2,
  Clock,
  ArrowUpRight,
} from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-studio-700">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2.5">
            <LayoutDashboard className="w-6 h-6 text-emerald-400" />
            Studio Dashboard
          </h1>
          <p className="text-sm text-emerald-100/70 mt-1">
            Real-time overview of production milestones, screenplay parsing, and budget health.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-700/50 text-emerald-300 text-xs font-mono font-semibold flex items-center gap-1.5 shadow-[0_0_10px_rgba(22,163,74,0.2)]">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            AI Breakdown Active
          </span>
        </div>
      </div>

      {/* Top Metric Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Scenes */}
        <div className="p-5 rounded-xl bg-studio-800 border border-studio-700 hover:border-emerald-600/50 transition-all group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 uppercase font-semibold tracking-wider font-mono">
              Total Scenes
            </span>
            <div className="p-2 rounded-lg bg-emerald-950 border border-emerald-700/50 text-emerald-400 group-hover:text-emerald-300 transition-colors">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <p className="text-3xl font-bold text-white tracking-tight">42</p>
            <span className="text-xs font-mono text-emerald-400 flex items-center gap-0.5">
              <ArrowUpRight className="w-3.5 h-3.5" /> +6 parsed today
            </span>
          </div>
          <div className="mt-3 w-full bg-studio-900 rounded-full h-1.5 overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full" style={{ width: "85%" }} />
          </div>
        </div>

        {/* Card 2: Breakdown Status */}
        <div className="p-5 rounded-xl bg-studio-800 border border-studio-700 hover:border-emerald-600/50 transition-all group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 uppercase font-semibold tracking-wider font-mono">
              Breakdown Status
            </span>
            <div className="p-2 rounded-lg bg-emerald-950 border border-emerald-700/50 text-emerald-400 group-hover:text-emerald-300 transition-colors">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <p className="text-3xl font-bold text-emerald-400 tracking-tight">88%</p>
            <span className="text-xs font-mono text-slate-400">37 / 42 scenes</span>
          </div>
          <div className="mt-3 w-full bg-studio-900 rounded-full h-1.5 overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full" style={{ width: "88%" }} />
          </div>
        </div>

        {/* Card 3: Active Budget Variance */}
        <div className="p-5 rounded-xl bg-studio-800 border border-studio-700 hover:border-emerald-600/50 transition-all group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 uppercase font-semibold tracking-wider font-mono">
              Budget Health
            </span>
            <div className="p-2 rounded-lg bg-emerald-950 border border-emerald-700/50 text-emerald-400 group-hover:text-emerald-300 transition-colors">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <p className="text-3xl font-bold text-white tracking-tight">On Track</p>
            <span className="text-xs font-mono text-emerald-400 font-semibold">
              +$4,200 Surplus
            </span>
          </div>
          <div className="mt-3 w-full bg-studio-900 rounded-full h-1.5 overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full" style={{ width: "94%" }} />
          </div>
        </div>

        {/* Card 4: Storyboard Frames */}
        <div className="p-5 rounded-xl bg-studio-800 border border-studio-700 hover:border-emerald-600/50 transition-all group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 uppercase font-semibold tracking-wider font-mono">
              16:9 Storyboards
            </span>
            <div className="p-2 rounded-lg bg-emerald-950 border border-emerald-700/50 text-emerald-400 group-hover:text-emerald-300 transition-colors">
              <Film className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <p className="text-3xl font-bold text-white tracking-tight">128</p>
            <span className="text-xs font-mono text-emerald-400">16:9 Widescreen</span>
          </div>
          <div className="mt-3 w-full bg-studio-900 rounded-full h-1.5 overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full" style={{ width: "72%" }} />
          </div>
        </div>
      </div>

      {/* Production Highlights Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Scene Activity */}
        <div className="lg:col-span-2 p-6 rounded-xl bg-studio-800 border border-studio-700 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-studio-700">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-400" />
              Recent Screenplay Parsing & Breakdown Logs
            </h2>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-950 px-2.5 py-1 rounded border border-emerald-800">
              Live Engine
            </span>
          </div>

          <div className="space-y-3">
            <div className="p-3.5 rounded-lg bg-studio-900 border border-studio-700/80 flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 font-mono text-xs border border-emerald-800">
                    INT. CYBERNETIC ARCHIVE - NIGHT
                  </span>
                  <span className="text-xs text-slate-400 font-mono">Scene 14</span>
                </div>
                <p className="text-xs text-slate-300">
                  Extracted 3 character roles, 2 props, and set 16:9 lighting parameters.
                </p>
              </div>
              <span className="text-xs font-mono text-emerald-400 font-semibold shrink-0">
                12m ago
              </span>
            </div>

            <div className="p-3.5 rounded-lg bg-studio-900 border border-studio-700/80 flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 font-mono text-xs border border-emerald-800">
                    EXT. NEON MARKETPLACE - DAY
                  </span>
                  <span className="text-xs text-slate-400 font-mono">Scene 15</span>
                </div>
                <p className="text-xs text-slate-300">
                  Location permit cost calculated & synced to daily rate budget ledger.
                </p>
              </div>
              <span className="text-xs font-mono text-emerald-400 font-semibold shrink-0">
                45m ago
              </span>
            </div>
          </div>
        </div>

        {/* Crew & Roster Quick Panel */}
        <div className="p-6 rounded-xl bg-studio-800 border border-studio-700 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-studio-700">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-400" />
              Active Roster
            </h2>
            <span className="text-xs font-mono text-emerald-300">4 On Call</span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div className="flex justify-between items-center p-2.5 rounded bg-studio-900 border border-studio-700">
              <span className="text-slate-200">Director of Photography</span>
              <span className="text-emerald-400 font-semibold">Ready</span>
            </div>
            <div className="flex justify-between items-center p-2.5 rounded bg-studio-900 border border-studio-700">
              <span className="text-slate-200">Lead VFX Supervisor</span>
              <span className="text-emerald-400 font-semibold">Active</span>
            </div>
            <div className="flex justify-between items-center p-2.5 rounded bg-studio-900 border border-studio-700">
              <span className="text-slate-200">Line Producer</span>
              <span className="text-emerald-400 font-semibold">Synced</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
