"use client";

import { useState } from "react";
import Link from "next/link";
import {
  DollarSign,
  Sparkles,
  TrendingUp,
  Plus,
  Layers,
  ArrowRight,
  CheckCircle2,
  FileSpreadsheet,
  X
} from "lucide-react";

interface ExpenseItem {
  id: string;
  item: string;
  department: string;
  allocated: number;
  spent: number;
  status: "Approved" | "Pending" | "Over Budget";
}

export default function FinancialsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [expenses, setExpenses] = useState<ExpenseItem[]>([
    {
      id: "EXP-101",
      item: "ARRI Alexa Mini LF & Anamorphic Lenses",
      department: "Camera & Optics",
      allocated: 35000,
      spent: 32000,
      status: "Approved"
    },
    {
      id: "EXP-102",
      item: "Soundstage Stage B (3 Shooting Days)",
      department: "Locations",
      allocated: 20000,
      spent: 18500,
      status: "Approved"
    },
    {
      id: "EXP-103",
      item: "Cybernetic Obsidian Catwalk Set Construction",
      department: "Art & Props",
      allocated: 25000,
      spent: 24000,
      status: "Approved"
    },
    {
      id: "EXP-104",
      item: "Boom Mic & Wireless Transmitter Kits",
      department: "Sound & Audio",
      allocated: 8000,
      spent: 6000,
      status: "Approved"
    },
    {
      id: "EXP-105",
      item: "Stunt Safety Coordination & Wire Rigs",
      department: "Cast & Stunts",
      allocated: 12000,
      spent: 4000,
      status: "Pending"
    }
  ]);

  // Form State
  const [formData, setFormData] = useState({
    item: "",
    department: "Camera & Optics",
    allocated: "",
    spent: "",
    status: "Approved" as "Approved" | "Pending"
  });

  const totalBudget = 150000;
  const totalSpent = expenses.reduce((sum, item) => sum + item.spent, 0);
  const remaining = totalBudget - totalSpent;

  const departmentSummary = [
    { name: "Camera & Optics", allocated: 40000, color: "bg-emerald-500" },
    { name: "Art & Production Design", allocated: 35000, color: "bg-teal-400" },
    { name: "Locations & Soundstages", allocated: 25000, color: "bg-emerald-600" },
    { name: "Cast, Crew & Stunts", allocated: 30000, color: "bg-cyan-500" },
    { name: "Sound, Grip & Electric", allocated: 20000, color: "bg-emerald-400" }
  ];

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.item || !formData.spent) return;

    const newExpense: ExpenseItem = {
      id: `EXP-${100 + expenses.length + 1}`,
      item: formData.item,
      department: formData.department,
      allocated: Number(formData.allocated) || Number(formData.spent),
      spent: Number(formData.spent),
      status: formData.status
    };

    setExpenses([newExpense, ...expenses]);
    setFormData({
      item: "",
      department: "Camera & Optics",
      allocated: "",
      spent: "",
      status: "Approved"
    });
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-8 p-6 md:p-8 max-w-7xl mx-auto text-slate-100">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-emerald-950/60">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" /> Department Cost Control
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Production Financials & Ledger
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Real-time tracking of line-item expenditures against allocated department budgets.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Log Line Expense
          </button>
          <Link
            href="/roster"
            className="px-4 py-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-semibold transition-all flex items-center gap-1.5"
          >
            Crew Roster <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Financial Health Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-6 rounded-2xl bg-[#09130e] border border-emerald-950/70">
          <p className="text-xs uppercase tracking-wider text-slate-400 font-medium">Total Allocated Budget</p>
          <h3 className="text-3xl font-extrabold text-white mt-2">${totalBudget.toLocaleString()}</h3>
          <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" /> Full production package
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-[#09130e] border border-emerald-950/70">
          <p className="text-xs uppercase tracking-wider text-slate-400 font-medium">Committed / Spent</p>
          <h3 className="text-3xl font-extrabold text-emerald-400 mt-2">${totalSpent.toLocaleString()}</h3>
          <p className="text-xs text-emerald-400 mt-2 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> {((totalSpent / totalBudget) * 100).toFixed(1)}% of total budget utilized
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-[#09130e] border border-emerald-950/70">
          <p className="text-xs uppercase tracking-wider text-slate-400 font-medium">Remaining Buffer</p>
          <h3 className="text-3xl font-extrabold text-teal-300 mt-2">${remaining.toLocaleString()}</h3>
          <p className="text-xs text-teal-400 mt-2 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> No deficit recorded
          </p>
        </div>
      </div>

      {/* Department Breakdown Section */}
      <div className="p-6 rounded-2xl bg-[#09130e] border border-emerald-950/70 space-y-5">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <Layers className="w-4 h-4 text-emerald-400" /> Department Allocations & Burn
        </h2>

        <div className="space-y-4">
          {departmentSummary.map((dept, idx) => {
            const deptSpent = expenses
              .filter(e => e.department.toLowerCase().includes(dept.name.split(" ")[0].toLowerCase()))
              .reduce((sum, e) => sum + e.spent, 0);
            const percentage = Math.round((deptSpent / dept.allocated) * 100);

            return (
              <div key={idx} className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-white">{dept.name}</span>
                  <span className="text-slate-400">
                    <strong className="text-emerald-300">${deptSpent.toLocaleString()}</strong> /${dept.allocated.toLocaleString()} ({percentage}%)
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#050b07] overflow-hidden border border-emerald-950/40">
                  <div
                    className={`h-full rounded-full ${dept.color} transition-all duration-500`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Detailed Line-Item Ledger Table */}
      <div className="p-6 rounded-2xl bg-[#09130e] border border-emerald-950/70 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-emerald-400" /> Recent Expense Records
          </h2>
          <span className="text-xs text-slate-400">{expenses.length} Records Logged</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-emerald-950/70 text-slate-400 uppercase tracking-wider font-semibold">
                <th className="py-3 px-4">Ref Code</th>
                <th className="py-3 px-4">Expense Description</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Allocated</th>
                <th className="py-3 px-4">Amount Spent</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-950/40 text-slate-300 font-light">
              {expenses.map((row) => (
                <tr key={row.id} className="hover:bg-[#0c1a13] transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">{row.id}</td>
                  <td className="py-3.5 px-4 font-medium text-white">{row.item}</td>
                  <td className="py-3.5 px-4 text-slate-400">{row.department}</td>
                  <td className="py-3.5 px-4 font-mono">${row.allocated.toLocaleString()}</td>
                  <td className="py-3.5 px-4 font-mono font-medium text-emerald-300">${row.spent.toLocaleString()}</td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${row.status === "Approved"
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      }`}>
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Expense Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-lg bg-[#09130e] border border-emerald-500/40 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-emerald-950/70">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-400" /> Log New Line Expense
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-[#0e1d15]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddExpense} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Expense Description</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Anamorphic Lens Rental, Drone Pilot Fee"
                  value={formData.item}
                  onChange={(e) => setFormData({ ...formData, item: e.target.value })}
                  className="w-full bg-[#050b07] border border-emerald-950/80 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500/60"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Department</label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="w-full bg-[#050b07] border border-emerald-950/80 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500/60"
                  >
                    <option value="Camera & Optics">Camera & Optics</option>
                    <option value="Art & Production Design">Art & Production Design</option>
                    <option value="Locations & Soundstages">Locations & Soundstages</option>
                    <option value="Cast & Stunts">Cast & Stunts</option>
                    <option value="Sound & Audio">Sound & Audio</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Approval Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as "Approved" | "Pending" })}
                    className="w-full bg-[#050b07] border border-emerald-950/80 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500/60"
                  >
                    <option value="Approved">Approved</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Allocated Budget ($)</label>
                  <input
                    type="number"
                    placeholder="e.g. 5000"
                    value={formData.allocated}
                    onChange={(e) => setFormData({ ...formData, allocated: e.target.value })}
                    className="w-full bg-[#050b07] border border-emerald-950/80 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500/60"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Actual Amount Spent ($)</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 4500"
                    value={formData.spent}
                    onChange={(e) => setFormData({ ...formData, spent: e.target.value })}
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
                  Save Line Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}