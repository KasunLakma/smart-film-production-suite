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

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Breakdown", href: "/breakdown", icon: FileText },
    { name: "Storyboard", href: "/storyboard", icon: Film },
    { name: "Financials", href: "/financials", icon: DollarSign },
    { name: "Roster", href: "/roster", icon: Users },
    { name: "Locations", href: "/locations", icon: MapPin },
  ];

  return (
    <div className="min-h-screen bg-[#07160d] text-slate-100 flex flex-col md:flex-row font-sans">
      {/* 1. Desktop Persistent Sidebar (Hidden on Mobile) */}
      <aside className="hidden md:flex flex-col w-64 border-r border-emerald-900/40 bg-[#0d2818]/90 backdrop-blur-md p-4 justify-between h-screen sticky top-0 shrink-0">
        <div>
          <div className="flex items-center justify-between pb-6 border-b border-emerald-900/50">
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-serif font-bold text-white tracking-tight">eclat</span>
              <span className="text-[10px] font-mono tracking-widest text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800/60">STUDIO</span>
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
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-medium transition-all ${isActive
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

        <div className="p-3 rounded-lg bg-emerald-950/40 border border-emerald-900/40 text-[11px] text-emerald-300/80 font-mono">
          <p className="font-semibold text-emerald-300">Project: Neon Horizon</p>
          <p className="text-[10px] text-slate-400">Pre-Production Active</p>
        </div>
      </aside>

      {/* 2. Main Viewport Container */}
      <main className="flex-1 min-w-0 overflow-y-auto pb-24 md:pb-8">
        {children}
      </main>

      {/* 3. Mobile App Bottom Navigation Bar (Visible only below md screens) */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-50 bg-[#0d2818]/95 border-t border-emerald-900/60 backdrop-blur-lg flex justify-around items-center py-2 px-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium transition-colors ${isActive ? "text-emerald-400 font-semibold" : "text-slate-400 hover:text-slate-200"
                }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}