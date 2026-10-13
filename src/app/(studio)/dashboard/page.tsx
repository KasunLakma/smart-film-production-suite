"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { FileText, Film, Wallet, Users, MapPin, ClipboardList, CheckCircle2, Circle, ArrowRight, Clapperboard } from "lucide-react";
import { KEYS, loadScenes, money, clearEverything, exportProjectFile, importProjectFile } from "@/lib/store";
import { PageHeader, Card, btnDanger } from "@/components/ui";
import { Trash2, Download, FolderOpen } from "lucide-react";

interface Stats {
  scenes: number;
  planned: number;
  spent: number;
  teamTotal: number;
  teamConfirmed: number;
  castedChars: number;
  chars: number;
  places: number;
  placesReady: number;
  unplacedScenes: number;
  sheets: number;
  storyboardFrames: number;
}

const read = (key: string): any => {
  try {
    return JSON.parse(localStorage.getItem(key) || "null");
  } catch {
    return null;
  }
};

export default function DashboardPage() {
  const [s, setS] = useState<Stats | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const openProject = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (await importProjectFile(f)) window.location.reload();
    else window.alert("This file is not an eclat project file.");
    e.target.value = "";
  };

  useEffect(() => {
    const scenes = loadScenes();
    const budget = read(KEYS.budget);
    const roster = read(KEYS.roster);
    const locs = read(KEYS.locations);
    const sheets = read(KEYS.callsheets);

    const planned = (budget?.lines || []).reduce((t: number, l: any) => t + (Number(l.qty) || 0) * (Number(l.unitCost) || 0), 0);
    const spent = (budget?.expenses || []).reduce((t: number, e: any) => t + (Number(e.amount) || 0), 0);
    const team = (roster?.team || []).filter((m: any) => m.status !== "Declined");
    const chars = new Set<string>();
    scenes.forEach((sc) => (sc.characters || []).forEach((c) => c && !/^(LEAD CHARACTER|ප්‍රධාන චරිතය)$/i.test(c) && chars.add(c.trim().toUpperCase())));
    const casted = Array.from(chars).filter((c) => roster?.casting?.[c]).length;
    const items = locs?.items || [];
    const linked = new Set(items.flatMap((l: any) => l.sceneIds || []));
    let frames = 0;
    try {
      Object.keys(localStorage).filter((k) => k.startsWith("cine_storyboard_cache_")).forEach((k) => (frames += Object.keys(JSON.parse(localStorage.getItem(k) || "{}")).length));
    } catch { }

    setS({
      scenes: scenes.length,
      planned,
      spent,
      teamTotal: team.length,
      teamConfirmed: team.filter((m: any) => m.status === "Confirmed").length,
      castedChars: casted,
      chars: chars.size,
      places: items.length,
      placesReady: items.filter((l: any) => l.status === "Approved" || l.status === "Booked").length,
      unplacedScenes: scenes.filter((sc) => !linked.has(sc.id)).length,
      sheets: (sheets?.sheets || []).length,
      storyboardFrames: frames,
    });
  }, []);

  const steps = s
    ? [
        { done: s.scenes > 0, title: "Upload your script", text: s.scenes > 0 ? `${s.scenes} scenes found` : "Add a story or screenplay (Sinhala or English)", href: "/breakdown", icon: FileText },
        { done: s.storyboardFrames > 0, title: "Create storyboard pictures", text: s.storyboardFrames > 0 ? `${s.storyboardFrames} pictures made` : "See each scene as a picture", href: "/storyboard", icon: Film },
        { done: s.planned > 0, title: "Work out the budget", text: s.planned > 0 ? `Planned ${money(s.planned)}` : "How much will the film cost?", href: "/financials", icon: Wallet },
        { done: s.teamTotal > 0, title: "Build your cast & crew", text: s.teamTotal > 0 ? `${s.teamTotal} people, ${s.castedChars}/${s.chars} characters cast` : "Find actors and crew", href: "/roster", icon: Users },
        { done: s.places > 0 && s.unplacedScenes === 0, title: "Choose filming places", text: s.places > 0 ? `${s.places} places · ${s.unplacedScenes} scenes still need one` : "Find places for your scenes", href: "/locations", icon: MapPin },
        { done: s.sheets > 0, title: "Make call sheets", text: s.sheets > 0 ? `${s.sheets} shooting days planned` : "One page per shooting day", href: "/callsheet", icon: ClipboardList },
      ]
    : [];
  const next = steps.find((x) => !x.done);

  return (
    <div className="space-y-6 p-4 md:p-8 max-w-7xl mx-auto text-slate-100">
      <PageHeader
        icon={<Clapperboard className="w-3.5 h-3.5" />}
        badge="Home"
        title="Your Film at a Glance"
        subtitle="Everything about your film in one place: script, pictures, money, people, places and daily plans."
        sinhala="ඔබේ චිත්‍රපටය ගැන සියල්ල එකම තැනක: කතාව, පින්තූර, මුදල්, පුද්ගලයින්, ස්ථාන සහ දෛනික සැලසුම්."
        actions={next && <Link href={next.href} className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs inline-flex items-center gap-2">Next: {next.title} <ArrowRight className="w-3.5 h-3.5" /></Link>}
      />

      {s && (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <Card><p className="text-xs uppercase text-slate-400">Scenes in script</p><p className="text-3xl font-bold text-white mt-1">{s.scenes}</p></Card>
            <Card><p className="text-xs uppercase text-slate-400">Budget (plan)</p><p className="text-2xl font-bold text-white mt-1">{money(s.planned)}</p><p className="text-xs text-emerald-300 mt-1">Spent {money(s.spent)}</p></Card>
            <Card><p className="text-xs uppercase text-slate-400">Team</p><p className="text-3xl font-bold text-white mt-1">{s.teamTotal}</p><p className="text-xs text-emerald-300 mt-1">{s.teamConfirmed} confirmed</p></Card>
            <Card><p className="text-xs uppercase text-slate-400">Places ready</p><p className="text-3xl font-bold text-white mt-1">{s.placesReady}<span className="text-base text-slate-400"> / {s.places}</span></p></Card>
          </div>

          <Card>
            <h2 className="text-base font-bold text-white mb-1">Your steps</h2>
            <p className="text-xs text-slate-400 mb-4">Follow them in order, or jump to any step. ඕනෑම පියවරකට කෙලින්ම යන්න පුලුවන්.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {steps.map((st, i) => {
                const Icon = st.icon;
                return (
                  <Link key={st.href} href={st.href} className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${st.done ? "bg-emerald-500/5 border-emerald-500/25" : "bg-[#0b1a12] border-emerald-950/70 hover:border-emerald-600/40"}`}>
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0"><Icon className="w-5 h-5" /></div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-white">{i + 1}. {st.title}</p>
                      <p className="text-xs text-slate-400 truncate">{st.text}</p>
                    </div>
                    {st.done ? <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" /> : <Circle className="w-5 h-5 text-slate-600 shrink-0" />}
                  </Link>
                );
              })}
            </div>
          </Card>

          <Card>
            <h2 className="text-base font-bold text-white mb-1">Save or share your project</h2>
            <p className="text-xs text-slate-400 mb-3">Your work is kept in this browser only. Save a file to make a backup, or to send the whole project to your director, producer or friends. They open it here with “Open project”. · ප්‍රොජෙක්ට් එක ෆයිල් එකක් ලෙස සුරකින්න / යවන්න.</p>
            <div className="flex flex-wrap gap-2">
              <button onClick={exportProjectFile} className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs inline-flex items-center gap-2 cursor-pointer"><Download className="w-3.5 h-3.5" /> Save project file</button>
              <button onClick={() => fileRef.current?.click()} className="px-4 py-2.5 rounded-xl bg-[#0e1d15] hover:bg-emerald-950 border border-emerald-900/60 text-slate-200 text-xs font-medium inline-flex items-center gap-2 cursor-pointer"><FolderOpen className="w-3.5 h-3.5" /> Open project file</button>
              <input ref={fileRef} type="file" accept=".json,application/json" className="hidden" onChange={openProject} />
            </div>
          </Card>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-red-900/40 bg-red-950/10">
            <div>
              <p className="text-sm font-semibold text-red-300">Start a new film</p>
              <p className="text-xs text-slate-400">Deletes the script, budget, team, places, call sheets and pictures saved in this browser. අලුත් චිත්‍රපටයක් පටන් ගැනීමට සියල්ල මකයි.</p>
            </div>
            <button
              className={btnDanger}
              onClick={() => {
                if (!window.confirm("Delete EVERYTHING saved for this film in this browser?\n\nTip: press Cancel, then use “Save project” in the left menu first if you want a backup.\n\nසියල්ලම මකන්නද?")) return;
                if (!window.confirm("Are you really sure? This cannot be undone.")) return;
                clearEverything();
                window.location.reload();
              }}
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete everything
            </button>
          </div>

          <p className="text-[11px] text-slate-500">Your work is saved in this browser. To keep a copy or share it with your director/producer, use the <b>Save project file</b> button above and send them the file; they can open it with <b>Open project file</b>.</p>
        </>
      )}
    </div>
  );
}
