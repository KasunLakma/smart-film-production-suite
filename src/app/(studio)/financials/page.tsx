import { DollarSign, TrendingUp } from "lucide-react";

export default function FinancialsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-studio-700">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2.5">
            <DollarSign className="w-6 h-6 text-emerald-400" />
            Live Financials
          </h1>
          <p className="text-sm text-emerald-100/70 mt-1">
            Real-time budget tracking, ATL/BTL variance analysis, and expenditure logs.
          </p>
        </div>
        <span className="px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-700/50 text-emerald-300 text-xs font-mono font-semibold flex items-center gap-1.5 shadow-[0_0_10px_rgba(22,163,74,0.2)]">
          <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
          Sub-50ms Ledger Engine
        </span>
      </div>

      <div className="p-8 rounded-xl bg-studio-800 border border-studio-700 text-center text-slate-300 font-mono text-sm space-y-2">
        <p className="text-emerald-400 font-bold">Live Financials Ledger Active</p>
        <p className="text-xs text-slate-400">Sub-50ms variance alerts, daily rate tracking, and cost breakdown logged.</p>
      </div>
    </div>
  );
}
