import { LayoutDashboard } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-studio-700">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <LayoutDashboard className="w-6 h-6 text-studio-accent" />
            Studio Dashboard
          </h1>
          <p className="text-sm text-slate-400">
            Overview of production milestones, scene counts, and project status.
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-studio-900 border border-studio-700">
          <p className="text-xs text-slate-400 uppercase font-semibold">Total Scenes</p>
          <p className="text-2xl font-bold text-slate-100 mt-1">42</p>
        </div>
        <div className="p-4 rounded-xl bg-studio-900 border border-studio-700">
          <p className="text-xs text-slate-400 uppercase font-semibold">Breakdown Status</p>
          <p className="text-2xl font-bold text-studio-surplus mt-1">88% Complete</p>
        </div>
        <div className="p-4 rounded-xl bg-studio-900 border border-studio-700">
          <p className="text-xs text-slate-400 uppercase font-semibold">Active Budget Variance</p>
          <p className="text-2xl font-bold text-studio-accent mt-1">On Track</p>
        </div>
      </div>
    </div>
  );
}
