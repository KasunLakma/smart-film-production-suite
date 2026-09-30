"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Users,
  Sparkles,
  UserPlus,
  Phone,
  Mail,
  CheckCircle2,
  Clock,
  SlidersHorizontal,
  ArrowRight,
  ShieldCheck,
  Clapperboard
} from "lucide-react";

interface Member {
  id: string;
  name: string;
  role: string;
  department: "Direction" | "Camera" | "Art & Props" | "Sound" | "Cast";
  dayRate: number;
  contact: string;
  status: "Confirmed" | "On Call" | "Pending";
}

export default function RosterPage() {
  const [filterDept, setFilterDept] = useState("ALL");

  const members: Member[] = [
    {
      id: "MBR-01",
      name: "Marcus Vance",
      role: "Lead Actor ('Marcus')",
      department: "Cast",
      dayRate: 1200,
      contact: "marcus.vance@agency.com",
      status: "Confirmed"
    },
    {
      id: "MBR-02",
      name: "Elena Rostova",
      role: "Lead Actress ('Elena')",
      department: "Cast",
      dayRate: 1400,
      contact: "elena.rostova@agency.com",
      status: "Confirmed"
    },
    {
      id: "MBR-03",
      name: "Kasun Lakmal",
      role: "Director of Photography (DP)",
      department: "Camera",
      dayRate: 950,
      contact: "+94 77 123 4567",
      status: "Confirmed"
    },
    {
      id: "MBR-04",
      name: "Sarah Chen",
      role: "Gaffer / Chief Lighting Tech",
      department: "Camera",
      dayRate: 650,
      contact: "sarah.lighting@cinemail.com",
      status: "Confirmed"
    },
    {
      id: "MBR-05",
      name: "David Kross",
      role: "Production Designer",
      department: "Art & Props",
      dayRate: 800,
      contact: "david.design@studios.com",
      status: "Confirmed"
    },
    {
      id: "MBR-06",
      name: "Maya Lin",
      role: "Location Sound Recordist",
      department: "Sound",
      dayRate: 700,
      contact: "maya.sound@audiofx.net",
      status: "On Call"
    },
    {
      id: "MBR-07",
      name: "Julian Rivera",
      role: "First Assistant Director (1st AD)",
      department: "Direction",
      dayRate: 850,
      contact: "julian.ad@directorsguild.org",
      status: "Confirmed"
    }
  ];

  const filteredMembers = filterDept === "ALL"
    ? members
    : members.filter(m => m.department === filterDept);

  const totalDailyBurn = members.reduce((sum, m) => sum + m.dayRate, 0);

  return (
    <div className="space-y-8 p-6 md:p-8 max-w-7xl mx-auto text-slate-100">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-emerald-950/60">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5" /> Personnel Logistics
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Cast & Crew Roster
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Coordinate departmental call sheets, day rates, and production contact credentials.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2">
            <UserPlus className="w-4 h-4" /> Add Crew Member
          </button>
          <Link
            href="/dashboard"
            className="px-4 py-2.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-semibold transition-all flex items-center gap-1.5"
          >
            Dashboard <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Roster Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-6 rounded-2xl bg-[#09130e] border border-emerald-950/70">
          <p className="text-xs uppercase tracking-wider text-slate-400 font-medium">Active Production Roster</p>
          <h3 className="text-3xl font-extrabold text-white mt-2">{members.length} Members</h3>
          <p className="text-xs text-emerald-400 mt-2 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> All contracts signed
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-[#09130e] border border-emerald-950/70">
          <p className="text-xs uppercase tracking-wider text-slate-400 font-medium">Confirmed Call Sheets</p>
          <h3 className="text-3xl font-extrabold text-emerald-400 mt-2">
            {members.filter(m => m.status === "Confirmed").length} / {members.length}
          </h3>
          <p className="text-xs text-emerald-400 mt-2 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Ready for Day 01 Shoot
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-[#09130e] border border-emerald-950/70">
          <p className="text-xs uppercase tracking-wider text-slate-400 font-medium">Estimated Daily Payroll</p>
          <h3 className="text-3xl font-extrabold text-teal-300 mt-2">${totalDailyBurn.toLocaleString()}</h3>
          <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-teal-400" /> Per shooting day
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-[#09130e] border border-emerald-950/70">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-400 mr-1" />
          {["ALL", "Direction", "Camera", "Art & Props", "Sound", "Cast"].map((dept) => (
            <button
              key={dept}
              onClick={() => setFilterDept(dept)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${filterDept === dept
                  ? "bg-emerald-500 text-slate-950 font-bold"
                  : "bg-[#0e1d15] text-slate-300 hover:text-white"
                }`}
            >
              {dept}
            </button>
          ))}
        </div>

        <span className="text-xs text-slate-400 font-medium">
          Showing {filteredMembers.length} records
        </span>
      </div>

      {/* Roster Table */}
      <div className="p-6 rounded-2xl bg-[#09130e] border border-emerald-950/70 space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-emerald-950/70 text-slate-400 uppercase tracking-wider font-semibold">
                <th className="py-3 px-4">Member Name</th>
                <th className="py-3 px-4">Role / Title</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Day Rate</th>
                <th className="py-3 px-4">Contact Info</th>
                <th className="py-3 px-4">Call Sheet Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-950/40 text-slate-300 font-light">
              {filteredMembers.map((member) => (
                <tr key={member.id} className="hover:bg-[#0c1a13] transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-white">
                    {member.name}
                  </td>
                  <td className="py-3.5 px-4 text-emerald-300 font-medium">
                    {member.role}
                  </td>
                  <td className="py-3.5 px-4 text-slate-400">
                    {member.department}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-medium text-white">
                    ${member.dayRate.toLocaleString()}/day
                  </td>
                  <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                    {member.contact}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${member.status === "Confirmed"
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                      }`}>
                      {member.status}
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