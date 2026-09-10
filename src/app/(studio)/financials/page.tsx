import { DollarSign } from "lucide-react";

export default function FinancialsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-studio-700">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <DollarSign className="w-6 h-6 text-studio-accent" />
            Live Financials
          </h1>
          <p className="text-sm text-slate-400">
            Real-time budget tracking, ATL/BTL variance analysis, and expenditure logs.
          </p>
        </div>
      </div>
      <div className="p-8 rounded-xl bg-studio-900 border border-studio-700 text-center text-slate-400">
        Live Financials ledger active.
      </div>
    </div>
  );
}
