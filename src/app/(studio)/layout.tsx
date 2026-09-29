"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Film,
  DollarSign,
  Users,
  MapPin,
  ArrowLeft
} from "lucide-react";

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { name: "Script", href: "/breakdown", icon: FileText },
    { name: "Storyboard", href: "/storyboard", icon: Film },
    { name: "Budget", href: "/financials", icon: DollarSign },
    { name: "Roster", href: "/roster", icon: Users },
    { name: "Locations", href: "/locations", icon: MapPin },
  ];

  return (
    <div className="min-h-screen bg-[#07140e] text-slate-100 flex flex-col md:flex-row font-sans">
      {/* PC View: Full Left Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-emerald-950 bg-[#0a1a12]/90 backdrop-blur-md p-5 justify-between h-screen sticky top-0 shrink-0">
        <div>
          <div className="flex items-center justify-between pb-6 border-b border-emerald-900/40">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-serif font-bold text-white tracking-tight">eclat</span>
              <span className="text-[10px] font-mono tracking-widest text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800/60">STUDIO</span>
            </div>
            <Link href="/" className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Exit</span>
            </Link>
          </div>

          <nav className="mt-6 space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${isActive
                      ? "bg-emerald-600/20 text-emerald-300 border border-emerald-500/30"
                      : "text-slate-400 hover:text-slate-200 hover:bg-emerald-950/40"
                    }`}
                >
                  <Icon className="w-4 h-4 text-emerald-400" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-3.5 rounded-xl bg-emerald-950/50 border border-emerald-900/50 text-[11px] text-emerald-300 font-mono">
          <p className="font-semibold text-white">Project: Neon Horizon</p>
          <p className="text-[10px] text-slate-400">Pre-Production Active</p>
        </div>
      </aside>

      {/* Main Viewport */}
      <main className="flex-1 min-w-0 overflow-y-auto pb-24 md:pb-8 p-4 md:p-8">
        {children}
      </main>

      {/* Mobile View: Floating Glass App Navigation Bar */}
      <div className="md:hidden fixed bottom-3 inset-x-0 z-50 flex justify-center px-4 pointer-events-none">
        <nav className="pointer-events-auto bg-[#0d2217]/95 backdrop-blur-xl border border-emerald-800/50 rounded-full px-3 py-2 flex items-center gap-1 shadow-[0_10px_30px_rgba(0,0,0,0.8)]">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center w-12 h-11 rounded-full transition-all ${isActive
                    ? "bg-emerald-500 text-black font-semibold shadow-[0_0_15px_rgba(16,185,129,0.4)]"
                    : "text-slate-400 hover:text-slate-200"
                  }`}
              >
                <Icon className="w-4 h-4" />
                <span className="text-[8px] mt-0.5 tracking-tight">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}