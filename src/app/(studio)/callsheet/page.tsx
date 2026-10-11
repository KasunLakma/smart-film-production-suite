"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ClipboardList, Plus, Copy, Trash2, Printer, Wand2, CalendarDays } from "lucide-react";
import {
  KEYS,
  usePersistentState,
  loadScenes,
  uid,
  locationNameOf,
  isExterior,
  isPlaceholderCharacter,
  SceneLite,
} from "@/lib/store";
import { DEFAULT_ROSTER, RosterState, charKey } from "@/lib/roster";
import { DEFAULT_LOCATIONS, LocationsState } from "@/lib/locations";
import { PageHeader, HelpBox, Card, Field, EmptyState, inputCls, btnPrimary, btnGhost, btnDanger } from "@/components/ui";

interface CastCall {
  call: string;
  makeup: string;
  onSet: string;
  note: string;
}

interface CallSheet {
  id: string;
  title: string;
  date: string;
  dayNo: number;
  crewCall: string;
  shootCall: string;
  breakfast: string;
  lunch: string;
  wrap: string;
  director: string;
  producer: string;
  baseLocation: string;
  address: string;
  nearestHospital: string;
  sceneIds: string[];
  castCalls: Record<string, CastCall>;
  crewCalls: Record<string, { include: boolean; call: string }>;
  notes: string;
  transportNotes: string;
  deptNotes: string;
}

interface SheetsState {
  sheets: CallSheet[];
  activeId: string | null;
}

const DEFAULT_SHEETS: SheetsState = { sheets: [], activeId: null };

const sceneChars = (s: SceneLite) =>
  (s.characters || []).filter((c) => c && !isPlaceholderCharacter(c));

export default function CallSheetPage() {
  const [state, setState, ready] = usePersistentState<SheetsState>(KEYS.callsheets, DEFAULT_SHEETS);
  const [roster] = usePersistentState<RosterState>(KEYS.roster, DEFAULT_ROSTER);
  const [locs] = usePersistentState<LocationsState>(KEYS.locations, DEFAULT_LOCATIONS);
  const [scenes, setScenes] = useState<SceneLite[]>([]);
  const [scenesPerDay, setScenesPerDay] = useState(3);

  useEffect(() => {
    setScenes(loadScenes());
    try {
      const b = JSON.parse(localStorage.getItem(KEYS.budget) || "{}");
      if (b?.settings?.scenesPerDay > 0) setScenesPerDay(b.settings.scenesPerDay);
    } catch { }
  }, []);

  const { sheets, activeId } = state;
  const sheet = sheets.find((s) => s.id === activeId) || null;
  const personById = useMemo(() => new Map(roster.directory.map((p) => [p.id, p])), [roster.directory]);

  /* ---------- defaults taken from the team ---------- */
  const findByRole = (re: RegExp, not?: RegExp) => {
    const m = roster.team.find((t) => {
      if (t.status === "Declined") return false;
      const text = `${t.roleOnFilm} ${personById.get(t.personId)?.role || ""}`;
      return re.test(text) && !(not && not.test(text));
    });
    return m ? personById.get(m.personId)?.name.replace(/^Sample · /, "") || "" : "";
  };

  const blankSheet = (dayNo: number, sceneIds: string[] = []): CallSheet => ({
    id: uid("cs"),
    title: `Day ${dayNo}`,
    date: "",
    dayNo,
    crewCall: "06:00",
    shootCall: "07:30",
    breakfast: "06:30",
    lunch: "13:00",
    wrap: "19:00",
    director: findByRole(/director/i, /photograph|assistant|art |casting/i),
    producer: findByRole(/producer/i, /executive|line|assistant/i),
    baseLocation: "",
    address: "",
    nearestHospital: "",
    sceneIds,
    castCalls: {},
    crewCalls: {},
    notes: "",
    transportNotes: "",
    deptNotes: "",
  });

  /* ---------- actions ---------- */
  const patch = (p: Partial<CallSheet>) =>
    setState((s) => ({ ...s, sheets: s.sheets.map((x) => (x.id === s.activeId ? { ...x, ...p } : x)) }));

  const newSheet = () => {
    const sh = blankSheet(sheets.length + 1);
    setState((s) => ({ sheets: [...s.sheets, sh], activeId: sh.id }));
  };

  const duplicate = () => {
    if (!sheet) return;
    const copy = { ...sheet, id: uid("cs"), dayNo: sheets.length + 1, title: `${sheet.title} (copy)` };
    setState((s) => ({ sheets: [...s.sheets, copy], activeId: copy.id }));
  };

  const remove = (id: string) => {
    if (!window.confirm("Delete this call sheet?")) return;
    setState((s) => {
      const rest = s.sheets.filter((x) => x.id !== id);
      return { sheets: rest, activeId: s.activeId === id ? rest[0]?.id ?? null : s.activeId };
    });
  };

  /** Group scenes by place (to avoid travelling), then cut into shooting days */
  const autoPlan = () => {
    if (scenes.length === 0) return;
    if (sheets.length > 0 && !window.confirm("This replaces all your current call sheets with a new plan. Continue?")) return;
    const groups = new Map<string, SceneLite[]>();
    scenes.forEach((s) => {
      const k = locationNameOf(s.slugline).toUpperCase();
      groups.set(k, [...(groups.get(k) || []), s]);
    });
    const ordered = Array.from(groups.values()).flat();
    const days: string[][] = [];
    for (let i = 0; i < ordered.length; i += scenesPerDay) days.push(ordered.slice(i, i + scenesPerDay).map((s) => s.id));
    const made = days.map((ids, i) => {
      const sh = blankSheet(i + 1, ids);
      const first = scenes.find((s) => s.id === ids[0]);
      if (first) sh.baseLocation = locationNameOf(first.slugline);
      return sh;
    });
    setState({ sheets: made, activeId: made[0]?.id ?? null });
  };

  const toggleScene = (id: string) => {
    if (!sheet) return;
    patch({ sceneIds: sheet.sceneIds.includes(id) ? sheet.sceneIds.filter((x) => x !== id) : [...sheet.sceneIds, id] });
  };

  /* ---------- derived data for the open sheet ---------- */
  const sheetScenes = useMemo(
    () => (sheet ? scenes.filter((s) => sheet.sceneIds.includes(s.id)).sort((a, b) => a.sceneNumber - b.sceneNumber) : []),
    [sheet, scenes]
  );

  const castRows = useMemo(() => {
    const seen = new Map<string, string>();
    sheetScenes.forEach((s) => sceneChars(s).forEach((c) => !seen.has(charKey(c)) && seen.set(charKey(c), c.trim())));
    return Array.from(seen.entries()).map(([key, name]) => {
      const person = roster.casting[key] ? personById.get(roster.casting[key]) : undefined;
      return { key, name, actor: person?.name.replace(/^Sample · /, "") || "", contact: person?.contact || "" };
    });
  }, [sheetScenes, roster.casting, personById]);

  const crewRows = useMemo(
    () =>
      roster.team
        .filter((m) => m.status !== "Declined" && personById.get(m.personId)?.kind === "Crew")
        .map((m) => ({ id: m.id, role: m.roleOnFilm, name: personById.get(m.personId)!.name.replace(/^Sample · /, ""), contact: personById.get(m.personId)!.contact })),
    [roster.team, personById]
  );

  const locationOf = (s: SceneLite) => {
    const l = locs.items.find((x) => x.sceneIds.includes(s.id));
    return l ? `${l.name}${l.area ? ", " + l.area : ""}` : locationNameOf(s.slugline);
  };

  const castCall = (key: string): CastCall => sheet?.castCalls[key] || { call: sheet?.crewCall || "", makeup: "", onSet: sheet?.shootCall || "", note: "" };
  const setCastCall = (key: string, p: Partial<CastCall>) => sheet && patch({ castCalls: { ...sheet.castCalls, [key]: { ...castCall(key), ...p } } });
  const crewCall = (id: string) => sheet?.crewCalls[id] || { include: true, call: sheet?.crewCall || "" };
  const setCrewCall = (id: string, p: Partial<{ include: boolean; call: string }>) => sheet && patch({ crewCalls: { ...sheet.crewCalls, [id]: { ...crewCall(id), ...p } } });

  const dayLabel = sheet ? `Day ${sheet.dayNo} of ${sheets.length}` : "";
  const dateLabel = sheet?.date ? new Date(sheet.date + "T00:00").toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" }) : "Date not set";

  /* ---------- UI ---------- */
  return (
    <div className="space-y-6 p-4 md:p-8 max-w-[1400px] mx-auto text-slate-100 print:p-0 print:max-w-none">
      <PageHeader
        icon={<ClipboardList className="w-3.5 h-3.5" />}
        badge="Call Sheet"
        title="Daily Call Sheets"
        subtitle="One page for each shooting day: who must come, when, where, and which scenes will be filmed."
        sinhala="රූගත කරන දවසක් සඳහා එක පිටුවක්: කවුරුන් කොයි වෙලාවට කොහෙට එන්නද සහ කුමන දර්ශන රූගත කරනවාද."
        actions={
          <Link href="/roster" className={btnGhost}>← Cast & Crew</Link>
        }
      />

      <HelpBox>
        <p><b>Quick way:</b> press <b>“Plan all days from my script”</b>. The computer puts scenes from the same place together and makes one call sheet for each day.</p>
        <p><b>Then</b> open a day on the left, set the date and times, and tick the scenes. The page on the right is exactly what will be printed.</p>
        <p><b>Finally</b> press <b>Print / Save as PDF</b> and send it to the cast and crew.</p>
        <p className="text-emerald-300/80">“Cast & Crew” පිටුවේ නළු නිලියන් සහ කණ්ඩායම තෝරා තිබුණොත් ඔවුන්ගේ නම් ඉබේම මෙහි පෙනේ.</p>
      </HelpBox>

      {!ready ? null : (
        <div className="grid grid-cols-1 xl:grid-cols-[400px_1fr] gap-6 items-start">
          {/* ================= LEFT: editor ================= */}
          <div className="space-y-4 print:hidden">
            <Card className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <button className={btnPrimary} onClick={autoPlan} disabled={scenes.length === 0}><Wand2 className="w-3.5 h-3.5" /> Plan all days from my script</button>
                <button className={btnGhost} onClick={newSheet}><Plus className="w-3.5 h-3.5" /> New blank day</button>
              </div>
              {scenes.length === 0 && (
                <p className="text-xs text-amber-300">No script yet: upload one on the <Link className="underline" href="/breakdown">Script page</Link> to use the quick plan.</p>
              )}
              {scenes.length > 0 && <p className="text-[11px] text-slate-500">{scenesPerDay} scenes per day (you can change this on the Budget page).</p>}

              {sheets.length > 0 && (
                <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1">
                  {sheets.map((s) => (
                    <div key={s.id} className={`flex items-center justify-between gap-2 p-2.5 rounded-xl border cursor-pointer text-xs ${s.id === activeId ? "bg-emerald-500/15 border-emerald-500/40" : "bg-[#0b1a12] border-emerald-950/70 hover:border-emerald-700/50"}`}
                      onClick={() => setState((st) => ({ ...st, activeId: s.id }))}>
                      <div className="min-w-0">
                        <p className="font-semibold text-white truncate">Day {s.dayNo} · {s.title}</p>
                        <p className="text-[10px] text-slate-400">{s.date || "No date"} · {s.sceneIds.length} scene{s.sceneIds.length === 1 ? "" : "s"}</p>
                      </div>
                      <button onClick={(e) => { e.stopPropagation(); remove(s.id); }} className="text-slate-500 hover:text-red-400 cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {sheet && (
              <>
                <Card className="space-y-3">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2"><CalendarDays className="w-4 h-4 text-emerald-400" /> Day details</h3>
                  <Field label="Title"><input className={inputCls} value={sheet.title} onChange={(e) => patch({ title: e.target.value })} /></Field>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Shooting date"><input type="date" className={inputCls} value={sheet.date} onChange={(e) => patch({ date: e.target.value })} /></Field>
                    <Field label="Day number"><input type="number" min={1} className={inputCls} value={sheet.dayNo} onChange={(e) => patch({ dayNo: Number(e.target.value) })} /></Field>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <Field label="Crew arrives"><input type="time" className={inputCls} value={sheet.crewCall} onChange={(e) => patch({ crewCall: e.target.value })} /></Field>
                    <Field label="Filming starts"><input type="time" className={inputCls} value={sheet.shootCall} onChange={(e) => patch({ shootCall: e.target.value })} /></Field>
                    <Field label="Breakfast"><input type="time" className={inputCls} value={sheet.breakfast} onChange={(e) => patch({ breakfast: e.target.value })} /></Field>
                    <Field label="Lunch"><input type="time" className={inputCls} value={sheet.lunch} onChange={(e) => patch({ lunch: e.target.value })} /></Field>
                    <Field label="Expected finish"><input type="time" className={inputCls} value={sheet.wrap} onChange={(e) => patch({ wrap: e.target.value })} /></Field>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Director"><input className={inputCls} value={sheet.director} onChange={(e) => patch({ director: e.target.value })} /></Field>
                    <Field label="Producer"><input className={inputCls} value={sheet.producer} onChange={(e) => patch({ producer: e.target.value })} /></Field>
                  </div>
                  <Field label="Where do we meet?" hint="Name of the place everyone should come to"><input className={inputCls} value={sheet.baseLocation} onChange={(e) => patch({ baseLocation: e.target.value })} /></Field>
                  <Field label="Address / how to get there"><input className={inputCls} value={sheet.address} onChange={(e) => patch({ address: e.target.value })} /></Field>
                  <Field label="Nearest hospital"><input className={inputCls} value={sheet.nearestHospital} onChange={(e) => patch({ nearestHospital: e.target.value })} /></Field>
                </Card>

                <Card className="space-y-2">
                  <h3 className="text-sm font-bold text-white">Which scenes today?</h3>
                  {scenes.length === 0 ? (
                    <p className="text-xs text-slate-400">No scenes yet. Upload your script first.</p>
                  ) : (
                    <div className="max-h-64 overflow-y-auto space-y-1 pr-1">
                      {scenes.map((s) => (
                        <label key={s.id} className="flex items-start gap-2 text-xs p-2 rounded-lg hover:bg-emerald-950/40 cursor-pointer">
                          <input type="checkbox" className="mt-0.5" checked={sheet.sceneIds.includes(s.id)} onChange={() => toggleScene(s.id)} />
                          <span className="text-slate-200"><b>Scene {s.sceneNumber}</b> · {locationNameOf(s.slugline)} <span className="text-slate-500">({isExterior(s) ? "outdoor" : "indoor"}, {s.timeOfDay})</span></span>
                        </label>
                      ))}
                    </div>
                  )}
                </Card>

                {castRows.length > 0 && (
                  <Card className="space-y-2">
                    <h3 className="text-sm font-bold text-white">Actor times</h3>
                    <p className="text-[11px] text-slate-500">Change the time only if an actor must come earlier or later.</p>
                    {castRows.map((c) => {
                      const cc = castCall(c.key);
                      return (
                        <div key={c.key} className="p-2.5 rounded-xl bg-[#0b1a12] border border-emerald-950/70 space-y-2">
                          <p className="text-xs font-semibold text-white">{c.name} <span className="text-slate-400 font-normal">· {c.actor || "no actor chosen"}</span></p>
                          <div className="grid grid-cols-3 gap-2">
                            <label className="text-[10px] text-slate-400">Arrives<input type="time" className={inputCls} value={cc.call} onChange={(e) => setCastCall(c.key, { call: e.target.value })} /></label>
                            <label className="text-[10px] text-slate-400">Make-up<input type="time" className={inputCls} value={cc.makeup} onChange={(e) => setCastCall(c.key, { makeup: e.target.value })} /></label>
                            <label className="text-[10px] text-slate-400">On set<input type="time" className={inputCls} value={cc.onSet} onChange={(e) => setCastCall(c.key, { onSet: e.target.value })} /></label>
                          </div>
                          <input className={inputCls} placeholder="Note (e.g. bring own shoes)" value={cc.note} onChange={(e) => setCastCall(c.key, { note: e.target.value })} />
                        </div>
                      );
                    })}
                  </Card>
                )}

                <Card className="space-y-2">
                  <h3 className="text-sm font-bold text-white">Crew needed today</h3>
                  {crewRows.length === 0 ? (
                    <p className="text-xs text-slate-400">No crew in your team yet. Add them on the <Link className="underline" href="/roster">Cast & Crew page</Link>.</p>
                  ) : (
                    crewRows.map((c) => {
                      const cc = crewCall(c.id);
                      return (
                        <div key={c.id} className="flex items-center gap-2 text-xs">
                          <input type="checkbox" checked={cc.include} onChange={(e) => setCrewCall(c.id, { include: e.target.checked })} />
                          <span className="flex-1 text-slate-200 truncate">{c.name} <span className="text-slate-500">· {c.role}</span></span>
                          <input type="time" className={`${inputCls} w-28`} value={cc.call} onChange={(e) => setCrewCall(c.id, { call: e.target.value })} />
                        </div>
                      );
                    })
                  )}
                </Card>

                <Card className="space-y-3">
                  <Field label="Important notes for everyone"><textarea rows={3} className={inputCls} value={sheet.notes} onChange={(e) => patch({ notes: e.target.value })} /></Field>
                  <Field label="Transport notes"><textarea rows={2} className={inputCls} value={sheet.transportNotes} onChange={(e) => patch({ transportNotes: e.target.value })} /></Field>
                  <Field label="Notes for departments (camera, art, sound…)"><textarea rows={2} className={inputCls} value={sheet.deptNotes} onChange={(e) => patch({ deptNotes: e.target.value })} /></Field>
                  <button className={btnGhost} onClick={duplicate}><Copy className="w-3.5 h-3.5" /> Copy this day</button>
                </Card>
              </>
            )}
          </div>

          {/* ================= RIGHT: printable paper ================= */}
          <div>
            {!sheet ? (
              <EmptyState
                icon={<ClipboardList className="w-10 h-10" />}
                title="No call sheet open"
                text="Press “Plan all days from my script” on the left, or make a blank day, then choose it from the list."
              />
            ) : (
              <div className="space-y-3">
                <div className="flex justify-end print:hidden">
                  <button className={btnPrimary} onClick={() => window.print()}><Printer className="w-3.5 h-3.5" /> Print / Save as PDF</button>
                </div>

                <div className="print-paper bg-white text-black rounded-md shadow-2xl p-6 md:p-8 text-[12px] leading-snug" style={{ fontFamily: "Arial, Helvetica, sans-serif" }}>
                  {/* header */}
                  <div className="border-2 border-black grid grid-cols-[1fr_1.3fr_1fr]">
                    <div className="p-2 border-r-2 border-black space-y-1">
                      <p><b>Director:</b> {sheet.director || "—"}</p>
                      <p><b>Producer:</b> {sheet.producer || "—"}</p>
                      <p><b>Meet at:</b> {sheet.baseLocation || "—"}</p>
                      <p><b>Address:</b> {sheet.address || "—"}</p>
                    </div>
                    <div className="p-2 text-center flex flex-col items-center justify-center">
                      <p className="text-xl font-extrabold">{sheet.title || "Call Sheet"}</p>
                      <p className="text-base">{dayLabel}</p>
                      <p className="mt-1">{dateLabel}</p>
                    </div>
                    <div className="p-2 border-l-2 border-black space-y-1">
                      <p><b>Crew arrives:</b> {sheet.crewCall || "—"}</p>
                      <p><b>Filming starts:</b> {sheet.shootCall || "—"}</p>
                      <p><b>Breakfast:</b> {sheet.breakfast || "—"}</p>
                      <p><b>Lunch:</b> {sheet.lunch || "—"}</p>
                      <p><b>Expected finish:</b> {sheet.wrap || "—"}</p>
                    </div>
                  </div>
                  <div className="border-2 border-t-0 border-black bg-gray-200 px-2 py-1"><b>Nearest hospital:</b> {sheet.nearestHospital || "—"}</div>

                  <div className="mt-3 border-2 border-black">
                    <div className="bg-gray-200 text-center font-bold py-1 border-b-2 border-black">Important notes</div>
                    <div className="p-2 min-h-[36px] whitespace-pre-wrap">{sheet.notes || " "}</div>
                  </div>

                  {/* scenes */}
                  <table className="w-full border-2 border-black border-collapse mt-3">
                    <thead>
                      <tr className="bg-gray-200 text-left">
                        {["Scene", "In/Out", "What happens", "Day/Night", "Actors in the scene", "Location"].map((h) => (
                          <th key={h} className="border border-black px-1.5 py-1 font-bold">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {sheetScenes.length === 0 ? (
                        <tr><td colSpan={6} className="border border-black px-2 py-3 text-center text-gray-500">No scenes chosen for this day</td></tr>
                      ) : sheetScenes.map((s) => (
                        <tr key={s.id} className="align-top">
                          <td className="border border-black px-1.5 py-1 font-bold">{s.sceneNumber}</td>
                          <td className="border border-black px-1.5 py-1">{isExterior(s) ? "EXT" : "INT"}</td>
                          <td className="border border-black px-1.5 py-1">{s.synopsis || locationNameOf(s.slugline)}</td>
                          <td className="border border-black px-1.5 py-1">{s.timeOfDay}</td>
                          <td className="border border-black px-1.5 py-1">{sceneChars(s).join(", ") || "—"}</td>
                          <td className="border border-black px-1.5 py-1">{locationOf(s)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* cast */}
                  <table className="w-full border-2 border-black border-collapse mt-3">
                    <thead>
                      <tr className="bg-gray-200 text-left">
                        {["Character", "Actor", "Arrives", "Make-up", "On set", "Phone", "Notes"].map((h) => (
                          <th key={h} className="border border-black px-1.5 py-1 font-bold">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {castRows.length === 0 ? (
                        <tr><td colSpan={7} className="border border-black px-2 py-3 text-center text-gray-500">No actors for the chosen scenes</td></tr>
                      ) : castRows.map((c) => {
                        const cc = castCall(c.key);
                        return (
                          <tr key={c.key}>
                            <td className="border border-black px-1.5 py-1 font-semibold">{c.name}</td>
                            <td className="border border-black px-1.5 py-1">{c.actor || "—"}</td>
                            <td className="border border-black px-1.5 py-1">{cc.call || "—"}</td>
                            <td className="border border-black px-1.5 py-1">{cc.makeup || "—"}</td>
                            <td className="border border-black px-1.5 py-1">{cc.onSet || "—"}</td>
                            <td className="border border-black px-1.5 py-1">{c.contact || ""}</td>
                            <td className="border border-black px-1.5 py-1">{cc.note}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  {/* transport + dept notes */}
                  <div className="mt-3 border-2 border-black">
                    <div className="bg-gray-200 font-bold px-2 py-1 border-b-2 border-black">Transport notes</div>
                    <div className="p-2 min-h-[28px] whitespace-pre-wrap">{sheet.transportNotes || " "}</div>
                  </div>
                  <div className="mt-3 border-2 border-black">
                    <div className="bg-gray-200 font-bold px-2 py-1 border-b-2 border-black">Notes for departments</div>
                    <div className="p-2 min-h-[28px] whitespace-pre-wrap">{sheet.deptNotes || " "}</div>
                  </div>

                  {/* crew */}
                  <table className="w-full border-2 border-black border-collapse mt-3">
                    <thead>
                      <tr className="bg-gray-200 text-left">
                        {["Crew job", "Name", "Arrives", "Phone"].map((h) => (
                          <th key={h} className="border border-black px-1.5 py-1 font-bold">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {crewRows.filter((c) => crewCall(c.id).include).length === 0 ? (
                        <tr><td colSpan={4} className="border border-black px-2 py-3 text-center text-gray-500">No crew chosen</td></tr>
                      ) : crewRows.filter((c) => crewCall(c.id).include).map((c) => (
                        <tr key={c.id}>
                          <td className="border border-black px-1.5 py-1">{c.role}</td>
                          <td className="border border-black px-1.5 py-1 font-semibold">{c.name}</td>
                          <td className="border border-black px-1.5 py-1">{crewCall(c.id).call || "—"}</td>
                          <td className="border border-black px-1.5 py-1">{c.contact || ""}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  <div className="grid grid-cols-3 gap-6 mt-8 text-center text-[11px]">
                    {["Director", "1st Assistant Director", "Production Manager"].map((r) => (
                      <div key={r} className="border-t border-black pt-1">{r}</div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
