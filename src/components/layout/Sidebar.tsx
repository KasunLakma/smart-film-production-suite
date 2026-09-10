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
        <div className="flex items-center gap-3 px-2 py-1">
          <div className="p-2 rounded-lg bg-studio-accent/10 border border-studio-accent/20 text-studio-accent">
            <Clapperboard className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-100 tracking-wider text-sm">
                SMART FILM
              </span>
              <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-studio-accent/20 text-studio-accent border border-studio-accent/30 tracking-widest">
                STUDIO
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Production Suite</p>
          </div>
        </div>

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
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 ${
                  isActive
                    ? "bg-studio-accent text-white font-medium shadow-md shadow-studio-accent/20"
                    : "text-slate-400 hover:text-slate-200 hover:bg-studio-800/70"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Role Badge */}
      <div className="bg-studio-800 border border-studio-700 rounded-lg p-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-full bg-studio-700 flex items-center justify-center text-slate-300 shrink-0">
            <User className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-bold text-slate-200 tracking-wider uppercase truncate">
              DIRECTOR / PRODUCER
            </p>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-studio-surplus" />
              <span className="text-[10px] text-slate-400 font-medium">Online</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
