"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Clapperboard,
  LayoutDashboard,
  FileText,
  Film,
  DollarSign,
  User,
} from "lucide-react";

const NAV_ITEMS = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Script Breakdown",
    href: "/breakdown",
    icon: FileText,
  },
  {
    name: "16:9 Storyboard",
    href: "/storyboard",
    icon: Film,
  },
  {
    name: "Live Financials",
    href: "/financials",
    icon: DollarSign,
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 min-h-screen bg-studio-900 border-r border-studio-700 p-4 flex flex-col justify-between shrink-0 select-none z-30">
      {/* Brand Header */}
      <div className="space-y-6">
        <Link href="/" className="flex items-center gap-3 px-2 py-1 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-800 p-[1px] shadow-[0_0_15px_rgba(22,163,74,0.35)] transition-transform group-hover:scale-105">
            <div className="w-full h-full bg-studio-900 rounded-[11px] flex items-center justify-center">
              <Clapperboard className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="font-serif-display text-2xl font-bold tracking-tight text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.3)]">
                eclat
              </span>
              <span className="text-[10px] tracking-[0.22em] font-mono px-2 py-0.5 rounded bg-emerald-950/90 border border-emerald-700/50 text-emerald-400 font-semibold uppercase shadow-[0_0_10px_rgba(22,163,74,0.3)]">
                STUDIO
              </span>
            </div>
            <p className="text-[11px] text-emerald-200/60 font-medium">
              Pre-Production Suite
            </p>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-r-lg text-sm transition-all duration-150 ${
                  isActive
                    ? "bg-emerald-900/40 text-emerald-300 border-l-2 border-emerald-500 font-medium shadow-sm"
                    : "text-slate-300 hover:bg-studio-800 hover:text-emerald-200"
                }`}
              >
                <Icon
                  className={`w-4 h-4 ${
                    isActive ? "text-emerald-400" : "text-slate-400"
                  }`}
                />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Role Badge */}
      <div className="bg-studio-800 border border-studio-700 rounded-lg p-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-full bg-emerald-950 border border-emerald-700/60 flex items-center justify-center text-emerald-300 shrink-0">
            <User className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-bold text-slate-200 tracking-wider uppercase truncate">
              DIRECTOR / PRODUCER
            </p>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-studio-surplus animate-pulse" />
              <span className="text-[10px] text-emerald-300/80 font-medium">
                eclat Workspace
              </span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
