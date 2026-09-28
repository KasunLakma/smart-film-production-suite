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
    { name: "Dash", href: "/dashboard", icon: LayoutDashboard },
    { name: "Script", href: "/breakdown", icon: FileText },
    { name: "Board", href: "/storyboard", icon: Film },
    { name: "Budget", href: "/financials", icon: DollarSign },
    { name: "Roster", href: "/roster", icon: Users },
    { name: "Locs", href: "/locations", icon: MapPin },
  ];

  return (
    <div className="min-h-screen bg-[#070b09] text-zinc-100 flex flex-col md:flex-row font-sans selection:bg-emerald-500 selection:text-black">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-white/5 bg-[#0a110d]/80 backdrop-blur-2xl p-5 justify-between h-screen sticky top-0 shrink-0">
        <div>
          <div className="flex items-center justify-between pb-6 border-b border-white/5">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-serif font-bold text-white tracking-tight">eclat</span>
              <span className="text-[10px] font-mono tracking-widest text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-500/30">STUDIO</span>
            </div>
            <Link href="/" className="text-xs text-zinc-400 hover:text-white flex items-center gap-1 transition-colors">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Exit</span>
            </Link>
          </div>

          <nav className="mt-6 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-xs font-medium transition-all ${isActive
                      ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-[0_0_20px_rgba(16,185,129,0.15)]"
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5"
                    }`}
                >
                  <Icon className="w-4 h-4 text-emerald-400" />
                  <span>{item.name === "Dash" ? "Dashboard" : item.name === "Script" ? "Screenplay" : item.name === "Board" ? "Storyboard" : item.name === "Budget" ? "Financials" : item.name === "Locs" ? "Locations" : item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md text-[11px] text-zinc-300">
          <p className="font-semibold text-emerald-400">Project: Neon Horizon</p>
          <p className="text-[10px] text-zinc-500 mt-0.5">Pre-Production Active</p>
        </div>
      </aside>

      {/* Main Screen Content Viewport */}
      <main className="flex-1 min-w-0 overflow-y-auto pb-28 md:pb-8 p-4 sm:p-6 md:p-8">
        {children}
      </main>

      {/* Mobile Floating Glass Capsule Navigation Bar */}
      <div className="md:hidden fixed bottom-4 inset-x-0 z-50 flex justify-center px-4 pointer-events-none">
        <nav className="pointer-events-auto bg-[#121915]/90 backdrop-blur-2xl border border-white/15 rounded-full px-3 py-2 flex items-center gap-1.5 shadow-[0_15px_35px_rgba(0,0,0,0.7)]">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center w-12 h-12 rounded-full transition-all ${isActive
                    ? "bg-emerald-500 text-black shadow-[0_0_15px_rgba(16,185,129,0.5)] scale-105"
                    : "text-zinc-400 hover:text-white"
                  }`}
              >
                <Icon className="w-4 h-4" />
                <span className={`text-[8px] mt-0.5 font-medium tracking-tight ${isActive ? "text-black font-semibold" : "text-zinc-400"}`}>
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}