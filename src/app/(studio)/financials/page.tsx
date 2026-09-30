"use client";

import { useState } from "react";
import Link from "next/link";
import {
  DollarSign,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Plus,
  Layers,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet
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
  const totalBudget = 150000;
  const totalSpent = 84500;
  const remaining = totalBudget - totalSpent;

  const expenses: ExpenseItem[] = [
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
  ];

  const departmentSummary = [
    { name: "Camera & Optics", allocated: 40000, spent: 32000, color: "bg-emerald-500" },
    { name: "Art & Production Design", allocated: 35000, spent: 24000, color: "bg-teal-400" },
    { name: "Locations & Soundstages", allocated: 25000, spent: 18500, color: "bg-emerald-600" },
    { name: "Cast, Crew & Stunts", allocated: 30000, spent: 4000, color: "bg-cyan-500" },
    { name: "Sound, Grip & Electric", allocated: 20000, spent: 6000, color: "bg-emerald-400" }
  ];

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
          <button className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2">
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
            <TrendingUp className="w-3.5 h-3.5" /> 56.3% of total budget utilized
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
            const percentage = Math.round((dept.spent / dept.allocated) * 100);
            return (
              <div key={idx} className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-white">{dept.name}</span>
                  <span className="text-slate-400">
                    <strong className="text-emerald-300">${dept.spent.toLocaleString()}</strong> /${dept.allocated.toLocaleString()} ({percentage}%)
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
    </div>
  );
}