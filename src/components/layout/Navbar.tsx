import { Film, CheckCircle2, Wifi } from "lucide-react";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-20 h-14 px-6 bg-studio-900/80 backdrop-blur-md border-b border-studio-700 flex items-center justify-between shrink-0">
      {/* Left side: Active Project & Build Verification Badge */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 text-slate-100 font-bold text-sm tracking-wide font-mono">
          <Film className="w-4 h-4 text-emerald-400" />
          <span>PROJECT: NEON HORIZON</span>
        </div>
        <span className="h-4 w-px bg-studio-700" />
        <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-700/50 text-emerald-400 text-[11px] font-semibold tracking-wider uppercase shadow-[0_0_10px_rgba(22,163,74,0.2)]">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>v1.0.0 READY</span>
        </div>
      </div>

      {/* Right side: Real-time Status & Profile Placeholder */}
      <div className="flex items-center gap-4">
        {/* Real-time Status Indicator */}
        <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-studio-800 border border-studio-700 text-xs">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <Wifi className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-[11px] font-semibold text-emerald-200 tracking-wide uppercase font-mono">
            LIVE SYSTEM
          </span>
        </div>

        {/* Profile Placeholder */}
        <div className="flex items-center gap-2 pl-2 border-l border-studio-700">
          <div className="w-8 h-8 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center shadow-[0_0_12px_rgba(22,163,74,0.3)] transition-all cursor-pointer">
            KL
          </div>
        </div>
      </div>
    </header>
  );
}
