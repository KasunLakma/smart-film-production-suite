"use client";

import React, { useEffect, useState } from "react";
import { HelpCircle, ChevronDown, X } from "lucide-react";

export const inputCls =
  "w-full bg-[#050b07] border border-emerald-950/80 rounded-xl px-3 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/60";

export const btnPrimary =
  "px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all inline-flex items-center justify-center gap-2 cursor-pointer";

export const btnGhost =
  "px-3.5 py-2 rounded-xl bg-[#0e1d15] hover:bg-emerald-950 border border-emerald-900/60 text-slate-200 text-xs font-medium transition-all inline-flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50";

export const btnDanger =
  "px-2.5 py-1.5 rounded-lg bg-red-950/30 hover:bg-red-900/50 border border-red-900/40 text-red-300 text-[11px] font-medium transition-all inline-flex items-center gap-1.5 cursor-pointer";

export function PageHeader({
  icon,
  badge,
  title,
  subtitle,
  sinhala,
  actions,
}: {
  icon?: React.ReactNode;
  badge: string;
  title: string;
  subtitle: string;
  sinhala?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-emerald-950/60 print:hidden">
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-2">
          {icon} {badge}
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">{title}</h1>
        <p className="text-slate-300 text-sm mt-1 max-w-2xl">{subtitle}</p>
        {sinhala && <p className="text-emerald-300/80 text-sm mt-0.5 max-w-2xl">{sinhala}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
}

/** A friendly "How does this page work?" box that can be folded away */
export function HelpBox({ title = "How does this page work?", children }: { title?: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  // ෆෝන් වල ඉඩ ඉතිරි කිරීමට උපදෙස් පෙට්ටිය මුලින් වසා තබයි
  useEffect(() => {
    if (window.innerWidth < 640) setOpen(false);
  }, []);
  return (
    <div className="rounded-xl bg-emerald-500/5 border border-emerald-500/20 print:hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-2 px-4 py-3 text-left cursor-pointer"
      >
        <span className="flex items-center gap-2 text-sm font-semibold text-emerald-300">
          <HelpCircle className="w-4 h-4" /> {title}
        </span>
        <ChevronDown className={`w-4 h-4 text-emerald-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="px-4 pb-4 text-sm text-slate-300 leading-relaxed space-y-2">{children}</div>}
    </div>
  );
}

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`rounded-2xl bg-[#09130e] border border-emerald-950/70 p-5 ${className}`}>{children}</div>;
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold text-slate-300 mb-1">{label}</span>
      {children}
      {hint && <span className="block text-[11px] text-slate-500 mt-1">{hint}</span>}
    </label>
  );
}

export function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm print:hidden">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-[#09130e] border border-emerald-900/60 shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-emerald-950/70">
          <h3 className="text-base font-bold text-white">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  text,
  action,
}: {
  icon?: React.ReactNode;
  title: string;
  text: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-emerald-900/60 bg-[#08110c] p-10 text-center flex flex-col items-center gap-2">
      {icon && <div className="text-emerald-500/70">{icon}</div>}
      <h3 className="text-sm font-semibold text-white">{title}</h3>
      <p className="text-xs text-slate-400 max-w-md">{text}</p>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

export const STATUS_COLORS: Record<string, string> = {
  green: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  amber: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  red: "bg-red-500/15 text-red-300 border-red-500/30",
  slate: "bg-slate-500/15 text-slate-300 border-slate-500/30",
  blue: "bg-sky-500/15 text-sky-300 border-sky-500/30",
};

export function Pill({ tone = "slate", children }: { tone?: keyof typeof STATUS_COLORS; children: React.ReactNode }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[10px] font-semibold ${STATUS_COLORS[tone]}`}>
      {children}
    </span>
  );
}
