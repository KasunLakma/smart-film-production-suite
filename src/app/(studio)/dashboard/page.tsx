import Link from "next/link";
import {
  FileText,
  Film,
  DollarSign,
  Users,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Clock,
  Layers,
  PlusCircle,
  Clapperboard
} from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="space-y-8 p-6 md:p-8 max-w-7xl mx-auto text-slate-100">
      {/* Top Banner / Welcome Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0d1f17] via-[#091510] to-[#060c09] border border-emerald-950/70 p-6 md:p-8">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-3">
              <Sparkles className="w-3.5 h-3.5" /> Active Project
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Neon Horizon <span className="text-slate-400 text-base font-normal">(Feature Film)</span>
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-xl">
              Pre-production command center. Track your screenplay breakdown, storyboards, department budgets, and crew logistics.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <Link
              href="/breakdown"
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" /> Continue Breakdown
            </Link>
          </div>
        </div>

        {/* Ambient background glow */}
        <div className="absolute right-0 top-0 w-80 h-80 bg-emerald-500/10 blur-[100px] pointer-events-none rounded-full" />
      </div>

      {/* Production Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat 1 */}
        <div className="p-5 rounded-xl bg-[#09130e] border border-emerald-950/60 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-slate-400 font-medium">Extracted Scenes</p>
            <h3 className="text-2xl font-bold text-white mt-1">18 Scenes</h3>
            <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Ready for breakdown
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        {/* Stat 2 */}
        <div className="p-5 rounded-xl bg-[#09130e] border border-emerald-950/60 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-slate-400 font-medium">Storyboard Cards</p>
            <h3 className="text-2xl font-bold text-white mt-1">24 Shots</h3>
            <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
              <Film className="w-3 h-3" /> 16:9 Aspect Ratio
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        {/* Stat 3 */}
        <div className="p-5 rounded-xl bg-[#09130e] border border-emerald-950/60 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-slate-400 font-medium">Budget Balance</p>
            <h3 className="text-2xl font-bold text-white mt-1">+$16,000</h3>
            <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
              <DollarSign className="w-3 h-3" /> Within safe limit
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        {/* Stat 4 */}
        <div className="p-5 rounded-xl bg-[#09130e] border border-emerald-950/60 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-slate-400 font-medium">Cast & Crew</p>
            <h3 className="text-2xl font-bold text-white mt-1">32 Members</h3>
            <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
              <Users className="w-3 h-3" /> Call sheet synced
            </p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <Users className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Production Pipeline Roadmap (User Action Guide) */}
      <div className="p-6 rounded-2xl bg-[#09130e] border border-emerald-950/60">
        <h2 className="text-base font-bold text-white mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-emerald-400" /> Production Roadmap
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-[#0e1c15] border border-emerald-500/30">
            <span className="text-xs font-bold text-emerald-400 uppercase">Phase 1</span>
            <h4 className="text-sm font-semibold text-white mt-1">Script Breakdown</h4>
            <p className="text-xs text-slate-400 mt-1">Screenplay parsed into 18 scenes with character tags.</p>
            <div className="mt-3 text-xs text-emerald-400 font-medium flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Completed
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#0e1c15] border border-emerald-500/20">
            <span className="text-xs font-bold text-emerald-400 uppercase">Phase 2</span>
            <h4 className="text-sm font-semibold text-white mt-1">Storyboard Sequence</h4>
            <p className="text-xs text-slate-400 mt-1">24 of 48 keyframes generated with camera angle notes.</p>
            <div className="mt-3 text-xs text-amber-400 font-medium flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> In Progress (50%)
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#0b1610] border border-emerald-950/60 opacity-80">
            <span className="text-xs font-bold text-slate-400 uppercase">Phase 3</span>
            <h4 className="text-sm font-semibold text-white mt-1">Principal Photography</h4>
            <p className="text-xs text-slate-400 mt-1">Finalize call sheets and allocate daily department budgets.</p>
            <div className="mt-3 text-xs text-slate-400 font-medium flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> Pending Call Sheets
            </div>
          </div>
        </div>
      </div>

      {/* Studio Workspaces Navigation Cards */}
      <div>
        <h2 className="text-base font-bold text-white mb-4">Production Modules</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/breakdown"
            className="group p-5 rounded-xl bg-[#09130e] hover:bg-[#0c1a13] border border-emerald-950/60 hover:border-emerald-500/40 transition-all flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white group-hover:text-emerald-400 transition-colors">
                  Script Breakdown Engine
                </h3>
                <p className="text-xs text-slate-400">View and parse screenplay scenes, props, and characters.</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
          </Link>

          <Link
            href="/storyboard"
            className="group p-5 rounded-xl bg-[#09130e] hover:bg-[#0c1a13] border border-emerald-950/60 hover:border-emerald-500/40 transition-all flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
                <Film className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white group-hover:text-emerald-400 transition-colors">
                  16:9 Visual Storyboards
                </h3>
                <p className="text-xs text-slate-400">Organize cinematic frames, lens choices, and camera prompts.</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
          </Link>

          <Link
            href="/financials"
            className="group p-5 rounded-xl bg-[#09130e] hover:bg-[#0c1a13] border border-emerald-950/60 hover:border-emerald-500/40 transition-all flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white group-hover:text-emerald-400 transition-colors">
                  Budget Ledger & Variance
                </h3>
                <p className="text-xs text-slate-400">Track department expenses against total allocated budget.</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
          </Link>

          <Link
            href="/roster"
            className="group p-5 rounded-xl bg-[#09130e] hover:bg-[#0c1a13] border border-emerald-950/60 hover:border-emerald-500/40 transition-all flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="w-11 h-11 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white group-hover:text-emerald-400 transition-colors">
                  Cast & Crew Logistics
                </h3>
                <p className="text-xs text-slate-400">Manage rates, call times, and contact information.</p>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
          </Link>
        </div>
      </div>
    </div>
  );
}