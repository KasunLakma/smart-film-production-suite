"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  MapPin,
  Search,
  Plus,
  Trash2,
  Pencil,
  ExternalLink,
  Image as ImageIcon,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Car,
  Utensils,
  BedDouble,
  Toilet,
  Sparkles,
} from "lucide-react";
import { KEYS, usePersistentState, loadScenes, money, uid, locationNameOf, isExterior, SceneLite } from "@/lib/store";
import {
  DEFAULT_LOCATIONS,
  LOC_STATUSES,
  LOC_STATUS_HELP,
  LocationItem,
  LocationsState,
  LocStatus,
  mapsLink,
  photosLink,
} from "@/lib/locations";
import { PageHeader, HelpBox, Card, Field, Modal, EmptyState, Pill, inputCls, btnPrimary, btnGhost } from "@/components/ui";

interface Suggestion {
  name: string;
  area: string;
  country: string;
  type: string;
  whyItFits: string;
  bestTime: string;
  facilities: string;
  permits: string;
  roughDailyCost: string;
  caution: string;
}

type Tab = "mine" | "find";

const blank = (): LocationItem => ({
  id: uid("loc"),
  name: "",
  area: "",
  country: "Sri Lanka",
  type: "",
  status: "Idea",
  sceneIds: [],
  dailyFee: 0,
  contactName: "",
  contactPhone: "",
  address: "",
  permits: "",
  facilities: { power: false, parking: false, toilets: false, food: false, stay: false },
  whyItFits: "",
  bestTime: "",
  notes: "",
  source: "manual",
});

const statusTone = (s: LocStatus) =>
  s === "Booked" || s === "Approved" ? "green" : s === "Visited" ? "blue" : s === "Shortlisted" ? "amber" : "slate";

export default function LocationsPage() {
  const [state, setState, ready] = usePersistentState<LocationsState>(KEYS.locations, DEFAULT_LOCATIONS);
  const [scenes, setScenes] = useState<SceneLite[]>([]);
  const [tab, setTab] = useState<Tab>("mine");
  const [filter, setFilter] = useState("ALL");
  const [editing, setEditing] = useState<LocationItem | null>(null);

  // finder
  const [findSceneId, setFindSceneId] = useState("");
  const [need, setNeed] = useState("");
  const [region, setRegion] = useState<"sri_lanka" | "world">("sri_lanka");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [results, setResults] = useState<Suggestion[]>([]);

  useEffect(() => setScenes(loadScenes()), []);

  const items = state.items;
  const sceneById = useMemo(() => new Map(scenes.map((s) => [s.id, s])), [scenes]);

  /* scenes still without a place, grouped by the place name in the script */
  const unplaced = useMemo(() => {
    const linked = new Set(items.flatMap((l) => l.sceneIds));
    const groups = new Map<string, SceneLite[]>();
    scenes
      .filter((s) => !linked.has(s.id))
      .forEach((s) => {
        const k = locationNameOf(s.slugline);
        groups.set(k, [...(groups.get(k) || []), s]);
      });
    return Array.from(groups.entries()).map(([name, list]) => ({ name, scenes: list }));
  }, [scenes, items]);

  const shown = items.filter((l) => filter === "ALL" || l.status === filter);
  const readyFees = items.filter((l) => l.status === "Approved" || l.status === "Booked").reduce((t, l) => t + (l.dailyFee || 0), 0);

  /* ---------- actions ---------- */
  const selectScene = (id: string) => {
    setFindSceneId(id);
    const s = sceneById.get(id);
    if (s) {
      const place = locationNameOf(s.slugline);
      setNeed(
        `${isExterior(s) ? "Outdoor" : "Indoor"} place: ${place}. Time: ${s.timeOfDay}. ${s.synopsis || ""} ${s.visualPrompt ? "Look: " + s.visualPrompt : ""}`.trim()
      );
    }
  };

  const findPlaces = async () => {
    setError("");
    setResults([]);
    if (need.trim().length < 5) return setError("Please choose a scene or describe the place you need.");
    setLoading(true);
    try {
      const res = await fetch("/api/locations/suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ need, region }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        setResults(data.places || []);
        if (!data.places?.length) setError("No suggestions came back. Try describing the place in more detail.");
      } else if (data.code === "NO_KEY") {
        setError("The AI helper is not switched on (missing key). You can still add places yourself with “Add a place”.");
      } else if (res.status === 429) {
        setError("The AI helper is busy right now. Please wait a minute and press the button again.");
      } else {
        setError("Could not get suggestions right now. Please try again.");
      }
    } catch {
      setError("No internet connection? Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const linkedSceneIdsFor = (sceneId: string): string[] => {
    const s = sceneById.get(sceneId);
    if (!s) return [];
    const place = locationNameOf(s.slugline).toUpperCase();
    return scenes.filter((x) => locationNameOf(x.slugline).toUpperCase() === place).map((x) => x.id);
  };

  const addSuggestion = (p: Suggestion) => {
    const item: LocationItem = {
      ...blank(),
      name: p.name,
      area: p.area,
      country: p.country,
      type: p.type,
      status: "Idea",
      sceneIds: findSceneId ? linkedSceneIdsFor(findSceneId) : [],
      permits: p.permits,
      whyItFits: p.whyItFits,
      bestTime: p.bestTime,
      notes: [p.facilities && `Facilities: ${p.facilities}`, p.roughDailyCost && `Rough daily cost: ${p.roughDailyCost}`, p.caution && `Careful: ${p.caution}`].filter(Boolean).join("\n"),
      source: "ai",
    };
    setState((s) => ({ items: [item, ...s.items] }));
    setTab("mine");
  };

  const alreadyAdded = (p: Suggestion) => items.some((l) => l.name.toLowerCase() === p.name.toLowerCase());

  const save = () => {
    if (!editing) return;
    if (!editing.name.trim()) return window.alert("Please write the name of the place.");
    setState((s) => {
      const exists = s.items.some((l) => l.id === editing.id);
      return { items: exists ? s.items.map((l) => (l.id === editing.id ? editing : l)) : [editing, ...s.items] };
    });
    setEditing(null);
  };

  const remove = (l: LocationItem) => {
    if (window.confirm(`Delete “${l.name}”?`)) setState((s) => ({ items: s.items.filter((x) => x.id !== l.id) }));
  };

  const setStatus = (id: string, status: LocStatus) =>
    setState((s) => ({ items: s.items.map((l) => (l.id === id ? { ...l, status } : l)) }));

  const TabBtn = ({ id, children }: { id: Tab; children: React.ReactNode }) => (
    <button
      onClick={() => setTab(id)}
      className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
        tab === id ? "bg-emerald-500 text-slate-950" : "bg-[#0e1d15] text-slate-300 hover:text-white border border-emerald-950/70"
      }`}
    >
      {children}
    </button>
  );

  const Facility = ({ on, icon, label }: { on: boolean; icon: React.ReactNode; label: string }) => (
    <span title={label} className={`inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-md border ${on ? "text-emerald-300 border-emerald-500/30 bg-emerald-500/10" : "text-slate-600 border-slate-800 line-through"}`}>
      {icon} {label}
    </span>
  );

  return (
    <div className="space-y-6 p-4 md:p-8 max-w-7xl mx-auto text-slate-100">
      <PageHeader
        icon={<MapPin className="w-3.5 h-3.5" />}
        badge="Locations"
        title="Find and Manage Filming Places"
        subtitle="Discover places in Sri Lanka or anywhere in the world that suit your scenes, then keep all their details in one list."
        sinhala="ඔබේ දර්ශන වලට ගැලපෙන ලංකාවේ හෝ ලෝකයේ ඕනෑම තැනක් සොයාගෙන, ඒවායේ සියලු විස්තර එක් ලැයිස්තුවක තබාගන්න."
        actions={
          <button className={btnPrimary} onClick={() => setEditing(blank())}>
            <Plus className="w-3.5 h-3.5" /> Add a place
          </button>
        }
      />

      <HelpBox>
        <p><b>Find Places</b>: choose a scene from your script (or describe what you need). The AI helper suggests real places that could suit it.</p>
        <p><b>Add to My Places</b>: keep the ones you like. For each place you can write the price, owner’s phone, permission needed, and what is available there.</p>
        <p><b>Status</b> tells everyone how far you are: <i>Idea → Shortlisted → Visited → Approved → Booked</i>.</p>
        <p className="text-amber-300/90">⚠ The AI only gives ideas from general knowledge. Always call the owner or the authority and visit the place before you plan the shoot. Prices shown are rough guesses.</p>
      </HelpBox>

      <div className="flex flex-wrap gap-2">
        <TabBtn id="mine">My Places ({items.length})</TabBtn>
        <TabBtn id="find"><span className="inline-flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5" /> Find Places</span></TabBtn>
      </div>

      {/* ================= MY PLACES ================= */}
      {tab === "mine" && ready && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {LOC_STATUSES.map((st) => (
              <button key={st} onClick={() => setFilter(filter === st ? "ALL" : st)} title={LOC_STATUS_HELP[st]}
                className={`text-left p-3 rounded-xl border transition-all cursor-pointer ${filter === st ? "bg-emerald-500/15 border-emerald-500/40" : "bg-[#09130e] border-emerald-950/70 hover:border-emerald-700/50"}`}>
                <p className="text-xl font-bold text-white">{items.filter((l) => l.status === st).length}</p>
                <p className="text-[11px] text-slate-400">{st}</p>
              </button>
            ))}
          </div>

          {scenes.length > 0 && unplaced.length > 0 && (
            <Card className="border-amber-500/30">
              <p className="text-sm font-semibold text-amber-300 flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> {unplaced.length} place{unplaced.length > 1 ? "s" : ""} in your script still need{unplaced.length > 1 ? "" : "s"} a filming location</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {unplaced.slice(0, 12).map((u) => (
                  <button key={u.name} className={btnGhost} onClick={() => { selectScene(u.scenes[0].id); setTab("find"); }}>
                    {u.name} <span className="text-slate-500">({u.scenes.length} scene{u.scenes.length > 1 ? "s" : ""})</span> <Search className="w-3 h-3" />
                  </button>
                ))}
                {unplaced.length > 12 && <span className="text-xs text-slate-500 self-center">+ {unplaced.length - 12} more</span>}
              </div>
            </Card>
          )}

          {items.length === 0 ? (
            <EmptyState icon={<MapPin className="w-8 h-8" />} title="No places saved yet"
              text="Open “Find Places” to get ideas from the AI helper, or press “Add a place” if you already know where you will film."
              action={<button className={btnPrimary} onClick={() => setTab("find")}>Find places</button>} />
          ) : (
            <>
              <p className="text-xs text-slate-400">Daily fees of Approved and Booked places together: <b className="text-white">{money(readyFees)}</b> · Enter the real payments on the <Link className="underline text-emerald-300" href="/financials">Budget page</Link>.</p>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {shown.map((l) => (
                  <div key={l.id} className="rounded-2xl bg-[#09130e] border border-emerald-950/70 p-5 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="text-base font-bold text-white">{l.name}</h3>
                        <p className="text-xs text-emerald-300">{[l.type, l.area, l.country].filter(Boolean).join(" · ")}</p>
                      </div>
                      <select className={`${inputCls} w-auto`} value={l.status} onChange={(e) => setStatus(l.id, e.target.value as LocStatus)} title={LOC_STATUS_HELP[l.status]}>
                        {LOC_STATUSES.map((s) => <option key={s}>{s}</option>)}
                      </select>
                    </div>
                    <div><Pill tone={statusTone(l.status)}>{LOC_STATUS_HELP[l.status]}</Pill>{l.source === "ai" && <span className="ml-2"><Pill tone="blue">AI idea</Pill></span>}</div>

                    {l.whyItFits && <p className="text-xs text-slate-300">✨ {l.whyItFits}</p>}

                    <div className="flex flex-wrap gap-1.5">
                      <Facility on={l.facilities.power} icon={<Zap className="w-3 h-3" />} label="Power" />
                      <Facility on={l.facilities.parking} icon={<Car className="w-3 h-3" />} label="Parking" />
                      <Facility on={l.facilities.toilets} icon={<Toilet className="w-3 h-3" />} label="Toilets" />
                      <Facility on={l.facilities.food} icon={<Utensils className="w-3 h-3" />} label="Food" />
                      <Facility on={l.facilities.stay} icon={<BedDouble className="w-3 h-3" />} label="Stay nearby" />
                    </div>

                    <div className="text-xs text-slate-300 space-y-1">
                      {l.address && <p>📍 {l.address}</p>}
                      {(l.contactName || l.contactPhone) && <p>📞 {l.contactName} {l.contactPhone}</p>}
                      {l.permits && <p>📝 Permission: {l.permits}</p>}
                      {l.bestTime && <p>🕐 Best time: {l.bestTime}</p>}
                      {l.notes && <p className="text-slate-400 whitespace-pre-line">{l.notes}</p>}
                    </div>

                    <div className="text-xs">
                      <span className="text-slate-400">Scenes shot here: </span>
                      {l.sceneIds.length === 0 ? (
                        <span className="text-amber-300">none linked yet</span>
                      ) : (
                        l.sceneIds.slice(0, 10).map((id) => (
                          <span key={id} className="inline-block mr-1 mb-1 px-1.5 py-0.5 rounded bg-emerald-950 border border-emerald-900/60 text-emerald-200 text-[10px]">
                            Scene {sceneById.get(id)?.sceneNumber ?? "?"}
                          </span>
                        ))
                      )}
                      {l.sceneIds.length > 10 && <span className="text-slate-500"> +{l.sceneIds.length - 10}</span>}
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-3 border-t border-emerald-950/60">
                      <p className="text-sm font-bold text-white">{l.dailyFee ? money(l.dailyFee) : "Fee not set"} <span className="text-[11px] font-normal text-slate-400">/ day</span></p>
                      <div className="flex items-center gap-2">
                        <a href={mapsLink(l)} target="_blank" rel="noreferrer" className={btnGhost}><ExternalLink className="w-3.5 h-3.5" /> Map</a>
                        <a href={photosLink(l)} target="_blank" rel="noreferrer" className={btnGhost}><ImageIcon className="w-3.5 h-3.5" /> Photos</a>
                        <button onClick={() => setEditing(l)} className="text-slate-400 hover:text-emerald-300 cursor-pointer" title="Edit"><Pencil className="w-4 h-4" /></button>
                        <button onClick={() => remove(l)} className="text-slate-500 hover:text-red-400 cursor-pointer" title="Delete"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* ================= FIND ================= */}
      {tab === "find" && (
        <div className="space-y-4">
          <Card className="space-y-4">
            <Field label="1. Pick a scene from your script (optional)">
              <select className={inputCls} value={findSceneId} onChange={(e) => selectScene(e.target.value)}>
                <option value="">— I will describe it myself —</option>
                {scenes.map((s) => (
                  <option key={s.id} value={s.id}>Scene {s.sceneNumber} · {locationNameOf(s.slugline)} ({s.timeOfDay})</option>
                ))}
              </select>
              {scenes.length === 0 && <span className="block text-[11px] text-amber-300 mt-1">No script yet: <Link className="underline" href="/breakdown">upload one</Link> to pick scenes here.</span>}
            </Field>
            <Field label="2. What kind of place do you need?" hint="Example: an old colonial house with a big veranda, quiet, near the hills">
              <textarea rows={3} className={inputCls} value={need} onChange={(e) => setNeed(e.target.value)} />
            </Field>
            <div>
              <p className="text-xs font-semibold text-slate-300 mb-1">3. Where?</p>
              <div className="flex flex-wrap gap-4 text-xs text-slate-200">
                <label className="flex items-center gap-2 cursor-pointer"><input type="radio" checked={region === "sri_lanka"} onChange={() => setRegion("sri_lanka")} /> Only in Sri Lanka</label>
                <label className="flex items-center gap-2 cursor-pointer"><input type="radio" checked={region === "world"} onChange={() => setRegion("world")} /> Anywhere in the world</label>
              </div>
            </div>
            <button className={btnPrimary} onClick={findPlaces} disabled={loading}>
              {loading ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Looking for places… (about 10–30 seconds)</> : <><Search className="w-3.5 h-3.5" /> Find places</>}
            </button>
            {error && <p className="text-xs text-amber-300 flex items-center gap-2"><AlertTriangle className="w-4 h-4 shrink-0" /> {error}</p>}
          </Card>

          {results.length > 0 && (
            <>
              <p className="text-xs text-amber-300/90">⚠ These are AI ideas. Check each place yourself: call the owner or the authority, and look at real photos before you decide.</p>
              {findSceneId && sceneById.get(findSceneId) && (
                <p className="text-xs text-slate-400">When you add a place, it will be linked to all scenes set at “{locationNameOf(sceneById.get(findSceneId)!.slugline)}” ({linkedSceneIdsFor(findSceneId).length}).</p>
              )}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {results.map((p, i) => (
                  <div key={i} className="rounded-2xl bg-[#09130e] border border-emerald-950/70 p-5 space-y-3">
                    <div>
                      <h3 className="text-base font-bold text-white">{p.name}</h3>
                      <p className="text-xs text-emerald-300">{[p.type, p.area, p.country].filter(Boolean).join(" · ")}</p>
                    </div>
                    <div className="text-xs text-slate-300 space-y-1.5">
                      <p>✨ <b>Why it fits:</b> {p.whyItFits}</p>
                      <p>🕐 <b>Best time:</b> {p.bestTime}</p>
                      <p>🏗 <b>What is available:</b> {p.facilities}</p>
                      <p>📝 <b>Permission:</b> {p.permits}</p>
                      <p>💰 <b>Rough cost:</b> {p.roughDailyCost}</p>
                      {p.caution && <p className="text-amber-300/90">⚠ {p.caution}</p>}
                    </div>
                    <div className="flex items-center justify-between gap-2 pt-3 border-t border-emerald-950/60">
                      <div className="flex gap-2">
                        <a href={mapsLink({ name: p.name, area: p.area, country: p.country, address: "" })} target="_blank" rel="noreferrer" className={btnGhost}><ExternalLink className="w-3.5 h-3.5" /> Map</a>
                        <a href={photosLink(p)} target="_blank" rel="noreferrer" className={btnGhost}><ImageIcon className="w-3.5 h-3.5" /> Photos</a>
                      </div>
                      {alreadyAdded(p) ? <Pill tone="green">Added</Pill> : (
                        <button className={btnPrimary} onClick={() => addSuggestion(p)}><Plus className="w-3.5 h-3.5" /> Add to my places</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* ===== add / edit ===== */}
      {editing && (
        <Modal title={items.some((l) => l.id === editing.id) ? "Edit place" : "Add a place"} onClose={() => setEditing(null)}>
          <div className="space-y-4">
            <Field label="Name of the place"><input autoFocus className={inputCls} value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Kind of place" hint="Beach, old house, temple…"><input className={inputCls} value={editing.type} onChange={(e) => setEditing({ ...editing, type: e.target.value })} /></Field>
              <Field label="Status">
                <select className={inputCls} value={editing.status} onChange={(e) => setEditing({ ...editing, status: e.target.value as LocStatus })}>
                  {LOC_STATUSES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </Field>
              <Field label="Town / district"><input className={inputCls} value={editing.area} onChange={(e) => setEditing({ ...editing, area: e.target.value })} /></Field>
              <Field label="Country"><input className={inputCls} value={editing.country} onChange={(e) => setEditing({ ...editing, country: e.target.value })} /></Field>
            </div>
            <Field label="Full address / how to reach"><input className={inputCls} value={editing.address} onChange={(e) => setEditing({ ...editing, address: e.target.value })} /></Field>
            <div className="grid grid-cols-3 gap-3">
              <Field label="Price per day (Rs.)"><input type="number" min={0} className={inputCls} value={editing.dailyFee || ""} onChange={(e) => setEditing({ ...editing, dailyFee: Number(e.target.value) })} /></Field>
              <Field label="Owner / contact name"><input className={inputCls} value={editing.contactName} onChange={(e) => setEditing({ ...editing, contactName: e.target.value })} /></Field>
              <Field label="Phone"><input className={inputCls} value={editing.contactPhone} onChange={(e) => setEditing({ ...editing, contactPhone: e.target.value })} /></Field>
            </div>
            <Field label="Whose permission is needed?"><input className={inputCls} value={editing.permits} onChange={(e) => setEditing({ ...editing, permits: e.target.value })} /></Field>
            <div>
              <p className="text-xs font-semibold text-slate-300 mb-2">What is available there?</p>
              <div className="flex flex-wrap gap-4 text-xs text-slate-200">
                {([["power", "Electricity"], ["parking", "Parking"], ["toilets", "Toilets"], ["food", "Food nearby"], ["stay", "Hotels nearby"]] as const).map(([k, label]) => (
                  <label key={k} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={editing.facilities[k]} onChange={(e) => setEditing({ ...editing, facilities: { ...editing.facilities, [k]: e.target.checked } })} /> {label}
                  </label>
                ))}
              </div>
            </div>
            <Field label="Best time to film"><input className={inputCls} value={editing.bestTime} onChange={(e) => setEditing({ ...editing, bestTime: e.target.value })} /></Field>
            <Field label="Notes"><textarea rows={3} className={inputCls} value={editing.notes} onChange={(e) => setEditing({ ...editing, notes: e.target.value })} /></Field>
            <div>
              <p className="text-xs font-semibold text-slate-300 mb-2">Which scenes will be filmed here?</p>
              {scenes.length === 0 ? (
                <p className="text-xs text-slate-500">Upload your script to link scenes.</p>
              ) : (
                <div className="max-h-40 overflow-y-auto space-y-1 pr-1">
                  {scenes.map((s) => (
                    <label key={s.id} className="flex items-start gap-2 text-xs p-1.5 rounded hover:bg-emerald-950/40 cursor-pointer">
                      <input type="checkbox" className="mt-0.5" checked={editing.sceneIds.includes(s.id)}
                        onChange={(e) => setEditing({ ...editing, sceneIds: e.target.checked ? [...editing.sceneIds, s.id] : editing.sceneIds.filter((x) => x !== s.id) })} />
                      <span className="text-slate-200">Scene {s.sceneNumber} · {locationNameOf(s.slugline)}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-emerald-950/60">
              <button className={btnGhost} onClick={() => setEditing(null)}>Cancel</button>
              <button className={btnPrimary} onClick={save}><CheckCircle2 className="w-3.5 h-3.5" /> Save</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
