import { FileText, Sparkles } from "lucide-react";

export default function BreakdownPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-studio-700">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-emerald-400" />
            Script Breakdown
          </h1>
          <p className="text-sm text-emerald-100/70 mt-1">
            Element tagging, scene breakdown sheets, and talent requirement analysis.
          </p>
        </div>
        <span className="px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-700/50 text-emerald-300 text-xs font-mono font-semibold flex items-center gap-1.5 shadow-[0_0_10px_rgba(22,163,74,0.2)]">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          LLM Engine v2.4
        </span>
      </div>

      <div className="p-8 rounded-xl bg-studio-800 border border-studio-700 text-center text-slate-300 font-mono text-sm space-y-2">
        <p className="text-emerald-400 font-bold">Script Breakdown Workspace Modules Active</p>
        <p className="text-xs text-slate-400">Scene character extraction, props tagging, and location requirements synchronized.</p>
      </div>
    </div>
  );
}
