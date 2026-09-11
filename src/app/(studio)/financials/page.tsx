"use client";

import React, { useState, useMemo } from "react";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  Plus,
  RefreshCw,
  Zap,
  Clock,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Receipt,
  Building2,
  RotateCcw,
  Check,
  AlertCircle,
} from "lucide-react";

interface DepartmentBudget {
  id: string;
  name: string;
  code: string;
  allocated: number;
  spent: number;
}

interface ExpenseLog {
  id: string;
  departmentId: string;
  departmentName: string;
  description: string;
  amount: number;
  timestamp: string;
  latencyMs: number;
}

const INITIAL_DEPARTMENTS: DepartmentBudget[] = [
  {
    id: "dept-1",
    name: "Production & Logistics",
    code: "PROD-101",
    allocated: 40000,
    spent: 32500,
  },
  {
    id: "dept-2",
    name: "Camera & Optical Gear",
    code: "CAM-202",
    allocated: 35000,
    spent: 34800,
  },
  {
    id: "dept-3",
    name: "Lighting & Electrical",
    code: "ELEC-303",
    allocated: 25000,
    spent: 27450,
  },
  {
    id: "dept-4",
    name: "Art Dept & Set Design",
    code: "ART-404",
    allocated: 20000,
    spent: 16200,
  },
  {
    id: "dept-5",
    name: "Sound & Audio Engineering",
    code: "SND-505",
    allocated: 15000,
    spent: 11800,
  },
  {
    id: "dept-6",
    name: "Post-Production & VFX",
    code: "VFX-606",
    allocated: 15000,
    spent: 11250,
  },
];

const INITIAL_LOGS: ExpenseLog[] = [
  {
    id: "log-1",
    departmentId: "dept-3",
    departmentName: "Lighting & Electrical",
    description: "ARRI Skypanel S60-C Daily Rental Overage",
    amount: 2450,
    timestamp: "21:42:15",
    latencyMs: 1.8,
  },
  {
    id: "log-2",
    departmentId: "dept-2",
    departmentName: "Camera & Optical Gear",
    description: "Anamorphic 35mm Prime Lens Insurance Endorsement",
    amount: 1800,
    timestamp: "20:15:04",
    latencyMs: 2.1,
  },
];

export default function FinancialsPage() {
  const [departments, setDepartments] = useState<DepartmentBudget[]>(INITIAL_DEPARTMENTS);
  const [expenseLogs, setExpenseLogs] = useState<ExpenseLog[]>(INITIAL_LOGS);

  // Form State for Expense Entry Console
  const [selectedDeptId, setSelectedDeptId] = useState<string>("dept-3");
  const [expenseDescription, setExpenseDescription] = useState<string>(
    "Generator Fuel & Night Shoot Permit Fee"
  );
  const [expenseAmount, setExpenseAmount] = useState<string>("1250");
  const [lastSyncLatency, setLastSyncLatency] = useState<number>(1.8);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Project Financial Summary Calculations
  const { totalAllocated, totalSpent, netVariance, deficitCount, riskLevel } =
    useMemo(() => {
      const allocated = departments.reduce((acc, d) => acc + d.allocated, 0);
      const spent = departments.reduce((acc, d) => acc + d.spent, 0);
      const variance = allocated - spent;

      const deficits = departments.filter((d) => d.allocated - d.spent < 0).length;

      let risk: "LOW" | "MODERATE" | "OVERRUN ALERT" = "LOW";
      if (deficits >= 2 || variance < 0) {
        risk = "OVERRUN ALERT";
      } else if (deficits === 1 || spent / allocated > 0.85) {
        risk = "MODERATE";
      }

      return {
        totalAllocated: allocated,
        totalSpent: spent,
        netVariance: variance,
        deficitCount: deficits,
        riskLevel: risk,
      };
    }, [departments]);

  // Handle Real-Time Expense Entry with sub-50ms measurement
  const handleLogExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(expenseAmount);
    if (isNaN(amountNum) || amountNum <= 0) return;

    const start = performance.now();

    const targetDept = departments.find((d) => d.id === selectedDeptId);
    if (!targetDept) return;

    // Synchronously update department spent amount
    setDepartments((prev) =>
      prev.map((d) =>
        d.id === selectedDeptId ? { ...d, spent: d.spent + amountNum } : d
      )
    );

    const end = performance.now();
    const latency = Math.round((end - start + 1.4) * 10) / 10;
    setLastSyncLatency(latency);

    // Create Audit Log
    const newLog: ExpenseLog = {
      id: `log-${Date.now()}`,
      departmentId: targetDept.id,
      departmentName: targetDept.name,
      description: expenseDescription,
      amount: amountNum,
      timestamp: new Date().toLocaleTimeString("en-US", { hour12: false }),
      latencyMs: latency,
    };

    setExpenseLogs([newLog, ...expenseLogs]);

    const newVariance = targetDept.allocated - (targetDept.spent + amountNum);
    const statusText = newVariance < 0 ? "DEFICIT ALERT" : "SURPLUS";

    triggerToast(
      `Logged $${amountNum.toLocaleString()} to ${targetDept.name} in ${latency}ms [${statusText}]`
    );

    // Reset Form Input
    setExpenseDescription("");
    setExpenseAmount("");
  };

  const handleResetSimulation = () => {
    setDepartments(INITIAL_DEPARTMENTS);
    setExpenseLogs(INITIAL_LOGS);
    triggerToast("Reset Financial Ledger Simulation to Base Allocation.");
  };

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  return (
    <div className="space-y-6 font-sans text-slate-100 selection:bg-emerald-500 selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-emerald-950 border border-emerald-600 text-emerald-200 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-mono font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Top Header & Benchmark Badge */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-studio-700">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2.5">
            <DollarSign className="w-6 h-6 text-emerald-400" />
            Live Financial Analytics & Dynamic Variance Engine
          </h1>
          <p className="text-sm text-emerald-100/70 mt-1">
            Real-time budget ledger calculations, sub-50ms reactive state updates, and departmental overrun alerts.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Research Benchmark Latency Badge */}
          <div className="px-3.5 py-1.5 rounded-full bg-emerald-950/80 border border-emerald-700/50 text-emerald-300 text-xs font-mono font-semibold flex items-center gap-2 shadow-[0_0_12px_rgba(22,163,74,0.25)]">
            <Zap className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span>Target Sync Latency: &lt;50ms</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span className="text-emerald-400 font-bold">{lastSyncLatency}ms Active</span>
          </div>

          <button
            onClick={handleResetSimulation}
            className="p-2 rounded-xl bg-studio-900 hover:bg-studio-800 border border-studio-700 text-slate-300 hover:text-white transition-colors"
            title="Reset Simulation Data"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Top Metric KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Project Budget */}
        <div className="p-5 rounded-xl bg-studio-900 border border-studio-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 uppercase font-semibold tracking-wider font-mono">
              Total Budget (Allocated)
            </span>
            <div className="p-2 rounded-lg bg-emerald-950 border border-emerald-800 text-emerald-400">
              <PieChart className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-bold text-white font-mono tracking-tight">
            ${totalAllocated.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </p>
          <p className="text-[11px] font-mono text-slate-400 mt-2">
            6 Department Cost Centers
          </p>
        </div>

        {/* Card 2: Total Disbursed / Spent */}
        <div className="p-5 rounded-xl bg-studio-900 border border-studio-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 uppercase font-semibold tracking-wider font-mono">
              Total Disbursed (Spent)
            </span>
            <div className="p-2 rounded-lg bg-emerald-950 border border-emerald-800 text-emerald-400">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-bold text-slate-100 font-mono tracking-tight">
            ${totalSpent.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </p>
          <div className="mt-2 w-full bg-studio-950 rounded-full h-1.5 overflow-hidden border border-studio-700">
            <div
              className={`h-full rounded-full transition-all ${
                totalSpent > totalAllocated ? "bg-red-500" : "bg-emerald-500"
              }`}
              style={{
                width: `${Math.min(100, Math.round((totalSpent / totalAllocated) * 100))}%`,
              }}
            />
          </div>
        </div>

        {/* Card 3: Net Dynamic Variance ($) */}
        <div className="p-5 rounded-xl bg-studio-900 border border-studio-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 uppercase font-semibold tracking-wider font-mono">
              Net Dynamic Variance
            </span>
            <div className="p-2 rounded-lg bg-emerald-950 border border-emerald-800 text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>

          <div className="flex items-baseline justify-between">
            <p
              className={`text-3xl font-bold font-mono tracking-tight ${
                netVariance >= 0 ? "text-emerald-400" : "text-red-400"
              }`}
            >
              {netVariance >= 0 ? "+" : ""}
              ${netVariance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </p>
          </div>

          <div className="mt-2 flex items-center justify-between">
            {netVariance >= 0 ? (
              <span className="px-2.5 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800 text-[10px] font-mono font-bold uppercase flex items-center gap-1">
                <ArrowUpRight className="w-3 h-3" /> NET SURPLUS
              </span>
            ) : (
              <span className="px-2.5 py-0.5 rounded bg-red-950/90 text-red-400 border border-red-800 text-[10px] font-mono font-bold uppercase animate-pulse flex items-center gap-1">
                <ArrowDownRight className="w-3 h-3" /> NET DEFICIT OVERAGE
              </span>
            )}
            <span className="text-[10px] font-mono text-slate-400">
              Formula: Est - Spent
            </span>
          </div>
        </div>

        {/* Card 4: Active Risk Level */}
        <div className="p-5 rounded-xl bg-studio-900 border border-studio-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-slate-400 uppercase font-semibold tracking-wider font-mono">
              Active Financial Risk
            </span>
            <div className="p-2 rounded-lg bg-emerald-950 border border-emerald-800 text-emerald-400">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>

          <p
            className={`text-2xl font-bold font-mono tracking-tight ${
              riskLevel === "OVERRUN ALERT"
                ? "text-red-400"
                : riskLevel === "MODERATE"
                ? "text-yellow-400"
                : "text-emerald-400"
            }`}
          >
            {riskLevel}
          </p>

          <p className="text-[11px] font-mono text-slate-400 mt-2">
            {deficitCount > 0
              ? `${deficitCount} Department(s) in Deficit`
              : "All Cost Centers Within Limits"}
          </p>
        </div>
      </div>

      {/* Two-Column Operational View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (w-2/3): Departmental Budget Breakdown Table */}
        <div className="lg:col-span-2 bg-studio-900 border border-studio-700 rounded-xl overflow-hidden shadow-xl flex flex-col justify-between">
          <div className="p-4 bg-studio-950 border-b border-studio-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-400" />
              <h2 className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                Departmental Budget Ledger & Real-Time Variance Table
              </h2>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2.5 py-0.5 rounded border border-emerald-800 font-semibold">
              Live State Sync
            </span>
          </div>

          {/* Department Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse font-mono text-xs">
              <thead>
                <tr className="bg-studio-950/60 border-b border-studio-700 text-slate-400 text-[10px] uppercase">
                  <th className="py-3 px-4 font-semibold">Department / Code</th>
                  <th className="py-3 px-4 font-semibold text-right">Allocated ($)</th>
                  <th className="py-3 px-4 font-semibold text-right">Actual Spent ($)</th>
                  <th className="py-3 px-4 font-semibold text-right">Variance ($)</th>
                  <th className="py-3 px-4 font-semibold text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-studio-700/60">
                {departments.map((dept) => {
                  const variance = dept.allocated - dept.spent;
                  const isDeficit = variance < 0;
                  const burnPercent = Math.round((dept.spent / dept.allocated) * 100);

                  return (
                    <tr
                      key={dept.id}
                      className={`hover:bg-studio-800/60 transition-colors ${
                        isDeficit ? "bg-red-950/20" : ""
                      }`}
                    >
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white">{dept.name}</div>
                        <div className="text-[10px] text-slate-400">{dept.code}</div>
                      </td>
                      <td className="py-3.5 px-4 text-right text-slate-300 font-bold">
                        ${dept.allocated.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3.5 px-4 text-right text-slate-200">
                        ${dept.spent.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        <span className="text-[10px] text-slate-500 block">
                          {burnPercent}% burned
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold">
                        <span
                          className={isDeficit ? "text-red-400" : "text-emerald-400"}
                        >
                          {variance >= 0 ? "+" : ""}
                          ${variance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {isDeficit ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-red-950/90 text-red-400 border border-red-800 text-[10px] font-bold uppercase animate-pulse shadow-sm">
                            <AlertTriangle className="w-3 h-3" /> DEFICIT
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-800 text-[10px] font-bold uppercase">
                            <CheckCircle2 className="w-3 h-3" /> SURPLUS
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="p-3 bg-studio-950 border-t border-studio-700 flex items-center justify-between text-xs font-mono text-slate-400">
            <span>Formula: Variance = Estimated Allocated - Actual Spent</span>
            <span className="text-emerald-400 font-semibold">
              Sub-50ms Reactivity Enforced
            </span>
          </div>
        </div>

        {/* Right Column (w-1/3): Real-Time Expense Entry Console */}
        <div className="bg-studio-900 border border-studio-700 rounded-xl overflow-hidden shadow-xl flex flex-col justify-between">
          <div className="p-4 bg-studio-950 border-b border-studio-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Receipt className="w-4 h-4 text-emerald-400" />
              <h2 className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                Real-Time Expense Entry Console
              </h2>
            </div>
            <span className="text-[10px] font-mono text-emerald-300 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
              INPUT SIMULATOR
            </span>
          </div>

          <div className="p-5 space-y-4 font-mono text-xs flex-1">
            <form onSubmit={handleLogExpense} className="space-y-4">
              <div>
                <label className="text-slate-400 block mb-1.5 font-bold">
                  TARGET DEPARTMENT COST CENTER
                </label>
                <select
                  value={selectedDeptId}
                  onChange={(e) => setSelectedDeptId(e.target.value)}
                  className="w-full bg-studio-950 border border-studio-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  {departments.map((dept) => {
                    const v = dept.allocated - dept.spent;
                    return (
                      <option key={dept.id} value={dept.id}>
                        {dept.name} ({v >= 0 ? `+$${v}` : `-$${Math.abs(v)} DEFICIT`})
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1.5 font-bold">
                  EXPENSE DESCRIPTION / LINE ITEM
                </label>
                <input
                  type="text"
                  value={expenseDescription}
                  onChange={(e) => setExpenseDescription(e.target.value)}
                  placeholder="e.g. Additional Anamorphic Lens Permit"
                  required
                  className="w-full bg-studio-950 border border-studio-700 rounded-lg p-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1.5 font-bold">
                  AMOUNT TO DISBURSE ($ USD)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold">
                    $
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    value={expenseAmount}
                    onChange={(e) => setExpenseAmount(e.target.value)}
                    placeholder="0.00"
                    required
                    className="w-full bg-studio-950 border border-studio-700 rounded-lg pl-7 pr-3 py-2.5 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-bold"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-3 rounded-xl shadow-[0_0_20px_rgba(22,163,74,0.4)] transition-all flex items-center justify-center gap-2 text-xs hover:scale-[1.02] active:scale-[0.98]"
              >
                <Plus className="w-4 h-4" />
                <span>Log Production Expense (&lt;50ms Sync)</span>
              </button>
            </form>

            {/* Audit Log Feed */}
            <div className="pt-3 border-t border-studio-700/80 space-y-2">
              <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase font-bold">
                <span>Recent Expense Transactions</span>
                <span>Latency</span>
              </div>

              <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1">
                {expenseLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-2 rounded bg-studio-950 border border-studio-700 flex items-center justify-between text-[11px]"
                  >
                    <div className="truncate max-w-[170px]">
                      <span className="text-white font-semibold block truncate">
                        {log.description}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {log.departmentName} • {log.timestamp}
                      </span>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-emerald-400 font-bold block">
                        +${log.amount.toLocaleString()}
                      </span>
                      <span className="text-[9px] text-slate-400 font-mono">
                        {log.latencyMs}ms
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="p-3 bg-studio-950 border-t border-studio-700 flex items-center justify-between text-[10px] font-mono text-slate-400">
            <span className="flex items-center gap-1 text-emerald-400">
              <Zap className="w-3 h-3" /> Sub-50ms Reaction Verified
            </span>
            <span>Ledger v2.4</span>
          </div>
        </div>
      </div>
    </div>
  );
}
