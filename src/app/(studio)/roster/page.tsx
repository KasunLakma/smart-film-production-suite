"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Users, Search, UserPlus, Trash2, Pencil, ClipboardList, Download, CheckCircle2, UserCheck, Drama } from "lucide-react";
import { KEYS, usePersistentState, loadScenes, money, uid, downloadCsv, SceneLite, isPlaceholderCharacter } from "@/lib/store";
import {
  ACTOR_ROLES,
  CREW_ROLES,
  DEFAULT_ROSTER,
  RosterState,
  Person,
  TeamMember,
  TeamStatus,
  SAMPLE_PEOPLE,
  charKey,
} from "@/lib/roster";
import { PageHeader, HelpBox, Card, Field, Modal, EmptyState, Pill, inputCls, btnPrimary, btnGhost, btnDanger } from "@/components/ui";

type Tab = "find" | "team" | "cast";

const blankPerson = (): Person => ({
  id: uid("p"),
  name: "",
  kind: "Actor",
  role: "Supporting actor",
  ageRange: "",
  languages: ["Sinhala"],
  city: "",
  experience: "",
  dayRate: 0,
  contact: "",
  notes: "",
  available: true,
});

export default function RosterPage() {
  const [roster, setRoster, ready] = usePersistentState<RosterState>(KEYS.roster, DEFAULT_ROSTER);
  const [scenes, setScenes] = useState<SceneLite[]>([]);
  const [tab, setTab] = useState<Tab>("find");

  // filters
  const [q, setQ] = useState("");
  const [kind, setKind] = useState("ALL");
  const [role, setRole] = useState("ALL");
  const [lang, setLang] = useState("ALL");
  const [maxRate, setMaxRate] = useState("");
  const [onlyFree, setOnlyFree] = useState(false);
  const [showSamples, setShowSamples] = useState(true);

  const [editing, setEditing] = useState<Person | null>(null);
  const [adding, setAdding] = useState<{ person: Person; member: TeamMember } | null>(null);

  useEffect(() => setScenes(loadScenes()), []);

  // first visit: put example profiles in the directory
  useEffect(() => {
    if (ready && !roster.seeded) {
      setRoster((r) => ({ ...r, directory: [...SAMPLE_PEOPLE, ...r.directory], seeded: true }));
    }
  }, [ready, roster.seeded, setRoster]);

  const { directory, team, casting } = roster;
  const personById = useMemo(() => new Map(directory.map((p) => [p.id, p])), [directory]);
  const inTeam = (pid: string) => team.some((m) => m.personId === pid);

  const allRoles = useMemo(() => Array.from(new Set(directory.map((p) => p.role))).sort(), [directory]);
  const allLangs = useMemo(() => Array.from(new Set(directory.flatMap((p) => p.languages))).sort(), [directory]);

  const filtered = directory.filter((p) => {
    if (!showSamples && p.isSample) return false;
    if (kind !== "ALL" && p.kind !== kind) return false;
    if (role !== "ALL" && p.role !== role) return false;
    if (lang !== "ALL" && !p.languages.includes(lang)) return false;
    if (maxRate && p.dayRate > Number(maxRate)) return false;
    if (onlyFree && !p.available) return false;
    if (q.trim()) {
      const hay = `${p.name} ${p.role} ${p.city} ${p.experience} ${p.notes}`.toLowerCase();
      if (!hay.includes(q.trim().toLowerCase())) return false;
    }
    return true;
  });

  /* ---------- characters from the script ---------- */
  const characters = useMemo(() => {
    const map = new Map<string, { name: string; count: number }>();
    scenes.forEach((s) => {
      const seen = new Set<string>();
      (s.characters || []).forEach((c) => {
        if (!c || isPlaceholderCharacter(c)) return;
        const k = charKey(c);
        if (seen.has(k)) return;
        seen.add(k);
        const cur = map.get(k) || { name: c.trim(), count: 0 };
        cur.count++;
        map.set(k, cur);
      });
    });
    return Array.from(map.entries())
      .map(([key, v]) => ({ key, ...v }))
      .sort((a, b) => b.count - a.count);
  }, [scenes]);

  /* ---------- actions ---------- */
  const startAdd = (p: Person) =>
    setAdding({
      person: p,
      member: { id: uid("tm"), personId: p.id, roleOnFilm: p.role, status: "Shortlisted", dayRate: p.dayRate, days: 5 },
    });

  const saveMember = () => {
    if (!adding) return;
    setRoster((r) => ({ ...r, team: [...r.team, adding.member] }));
    setAdding(null);
    setTab("team");
  };

  const updateMember = (id: string, patch: Partial<TeamMember>) =>
    setRoster((r) => ({ ...r, team: r.team.map((m) => (m.id === id ? { ...m, ...patch } : m)) }));

  const removeMember = (id: string) => {
    if (!window.confirm("Remove this person from your team?")) return;
    setRoster((r) => {
      const m = r.team.find((x) => x.id === id);
      const casting = { ...r.casting };
      if (m) Object.keys(casting).forEach((k) => casting[k] === m.personId && delete casting[k]);
      return { ...r, team: r.team.filter((x) => x.id !== id), casting };
    });
  };

  const savePerson = () => {
    if (!editing) return;
    if (!editing.name.trim()) return window.alert("Please write the name.");
    setRoster((r) => {
      const exists = r.directory.some((p) => p.id === editing.id);
      return { ...r, directory: exists ? r.directory.map((p) => (p.id === editing.id ? { ...editing, isSample: false } : p)) : [editing, ...r.directory] };
    });
    setEditing(null);
  };

  const deletePerson = (p: Person) => {
    if (!window.confirm(`Delete ${p.name} from the list?`)) return;
    setRoster((r) => ({
      ...r,
      directory: r.directory.filter((x) => x.id !== p.id),
      team: r.team.filter((m) => m.personId !== p.id),
      casting: Object.fromEntries(Object.entries(r.casting).filter(([, v]) => v !== p.id)),
    }));
  };

  const removeSamples = () => {
    if (!window.confirm("Remove all the example (Sample) profiles? Profiles you added yourself stay.")) return;
    setRoster((r) => {
      const ids = new Set(r.directory.filter((p) => p.isSample).map((p) => p.id));
      return {
        ...r,
        directory: r.directory.filter((p) => !p.isSample),
        team: r.team.filter((m) => !ids.has(m.personId)),
        casting: Object.fromEntries(Object.entries(r.casting).filter(([, v]) => !ids.has(v))),
      };
    });
  };

  const castActor = (charName: string, personId: string, appearances: number) => {
    setRoster((r) => {
      const key = charKey(charName);
      const casting = { ...r.casting };
      if (!personId) {
        delete casting[key];
        return { ...r, casting };
      }
      casting[key] = personId;
      let team = r.team;
      const person = r.directory.find((p) => p.id === personId);
      if (person && !team.some((m) => m.personId === personId)) {
        team = [
          ...team,
          { id: uid("tm"), personId, roleOnFilm: `Plays ${charName}`, status: "Shortlisted", dayRate: person.dayRate, days: Math.max(1, Math.ceil(appearances / 3)) },
        ];
      }
      return { ...r, casting, team };
    });
  };

  const activeTeam = team.filter((m) => m.status !== "Declined");
  const teamCost = activeTeam.reduce((t, m) => t + m.dayRate * m.days, 0);
  const actorsInDirectory = directory.filter((p) => p.kind === "Actor");
  const actorsInTeam = actorsInDirectory.filter((p) => inTeam(p.id));
  const castedCount = characters.filter((c) => casting[c.key]).length;

  const exportTeam = () =>
    downloadCsv("my-team.csv", [
      ["Name", "Type", "Role on this film", "Status", "Day rate (Rs.)", "Days", "Total (Rs.)", "Contact"],
      ...team.map((m) => {
        const p = personById.get(m.personId);
        return [p?.name || "?", p?.kind || "", m.roleOnFilm, m.status, m.dayRate, m.days, m.dayRate * m.days, p?.contact || ""];
      }),
    ]);

  const statusTone = (s: TeamStatus) => (s === "Confirmed" ? "green" : s === "Declined" ? "red" : "amber");

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

  return (
    <div className="space-y-6 p-4 md:p-8 max-w-7xl mx-auto text-slate-100">
      <PageHeader
        icon={<Users className="w-3.5 h-3.5" />}
        badge="Cast & Crew"
        title="Find Your Actors and Crew"
        subtitle="Search for people, build your team, and choose who plays each character in your script."
        sinhala="නළු නිලියන් සහ කණ්ඩායම හොයාගෙන, ඔබේ කතාවේ චරිත වලට රඟපාන්නේ කවුදැයි තෝරන්න."
        actions={
          <Link href="/callsheet" className={btnPrimary}>
            <ClipboardList className="w-3.5 h-3.5" /> Make a call sheet
          </Link>
        }
      />

      <HelpBox>
        <p><b>1. Find People</b>: search by name, job, city or language. Press <b>“Add to my team”</b> on the people you like.</p>
        <p><b>2. Cast the Characters</b>: for every character in your script, choose which actor will play it.</p>
        <p><b>3. My Team</b>: see everyone you chose, change their status (Shortlisted → Confirmed) and see the total cost.</p>
        <p className="text-emerald-300/80">ඔබ දැක්වෙන “Sample” පැතිකඩ උදාහරණ පමණි (සැබෑ පුද්ගලයින් නොවේ). ඔබේම අයව “Add a person” මගින් එකතු කරන්න.</p>
      </HelpBox>

      <div className="flex flex-wrap gap-2">
        <TabBtn id="find">Find People ({directory.length})</TabBtn>
        <TabBtn id="team">My Team ({team.length})</TabBtn>
        <TabBtn id="cast">Cast the Characters ({castedCount}/{characters.length})</TabBtn>
      </div>

      {/* ================= FIND ================= */}
      {tab === "find" && (
        <div className="space-y-4">
          <Card className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
              <div className="md:col-span-2 relative">
                <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
                <input className={`${inputCls} pl-9`} placeholder="Search name, job, city…" value={q} onChange={(e) => setQ(e.target.value)} />
              </div>
              <select className={inputCls} value={kind} onChange={(e) => setKind(e.target.value)}>
                <option value="ALL">Actors & Crew</option>
                <option value="Actor">Actors only</option>
                <option value="Crew">Crew only</option>
              </select>
              <select className={inputCls} value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="ALL">Any job</option>
                {allRoles.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
              <select className={inputCls} value={lang} onChange={(e) => setLang(e.target.value)}>
                <option value="ALL">Any language</option>
                {allLangs.map((l) => <option key={l} value={l}>{l}</option>)}
              </select>
              <input type="number" min={0} className={inputCls} placeholder="Max Rs. per day" value={maxRate} onChange={(e) => setMaxRate(e.target.value)} />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300">
                <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={onlyFree} onChange={(e) => setOnlyFree(e.target.checked)} /> Only people who are free</label>
                <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={showSamples} onChange={(e) => setShowSamples(e.target.checked)} /> Show example profiles</label>
                <span className="text-slate-500">{filtered.length} people found</span>
              </div>
              <div className="flex gap-2">
                {directory.some((p) => p.isSample) && <button className={btnGhost} onClick={removeSamples}>Remove example profiles</button>}
                <button className={btnPrimary} onClick={() => setEditing(blankPerson())}><UserPlus className="w-3.5 h-3.5" /> Add a person</button>
              </div>
            </div>
          </Card>

          {filtered.length === 0 ? (
            <EmptyState icon={<Search className="w-8 h-8" />} title="Nobody matches" text="Try removing a filter, or add the person yourself with “Add a person”." />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filtered.map((p) => (
                <div key={p.id} className="rounded-2xl bg-[#09130e] border border-emerald-950/70 hover:border-emerald-500/30 p-5 flex flex-col gap-3 transition-all">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-white truncate">{p.name}</h3>
                      <p className="text-xs text-emerald-300">{p.role}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <Pill tone={p.kind === "Actor" ? "blue" : "slate"}>{p.kind}</Pill>
                      <Pill tone={p.available ? "green" : "red"}>{p.available ? "Free" : "Busy"}</Pill>
                    </div>
                  </div>
                  <div className="text-xs text-slate-300 space-y-1">
                    <p>📍 {p.city || "—"}{p.ageRange ? ` · Age ${p.ageRange}` : ""}</p>
                    <p>🗣 {p.languages.join(", ") || "—"}</p>
                    {p.experience && <p>🎬 {p.experience}</p>}
                    {p.contact && <p>📞 {p.contact}</p>}
                    {p.notes && <p className="text-slate-400">{p.notes}</p>}
                  </div>
                  <div className="flex items-center justify-between mt-auto pt-3 border-t border-emerald-950/60">
                    <p className="text-sm font-bold text-white">{money(p.dayRate)} <span className="text-[11px] font-normal text-slate-400">/ day</span></p>
                    <div className="flex items-center gap-2">
                      <button onClick={() => setEditing(p)} className="text-slate-400 hover:text-emerald-300 cursor-pointer" title="Edit"><Pencil className="w-3.5 h-3.5" /></button>
                      <button onClick={() => deletePerson(p)} className="text-slate-500 hover:text-red-400 cursor-pointer" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
                      {inTeam(p.id) ? (
                        <Pill tone="green">In my team</Pill>
                      ) : (
                        <button className={btnPrimary} onClick={() => startAdd(p)}><UserCheck className="w-3.5 h-3.5" /> Add to my team</button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ================= TEAM ================= */}
      {tab === "team" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card><p className="text-xs uppercase text-slate-400">People in team</p><p className="text-2xl font-bold text-white mt-1">{activeTeam.length}</p></Card>
            <Card><p className="text-xs uppercase text-slate-400">Confirmed</p><p className="text-2xl font-bold text-emerald-300 mt-1">{team.filter((m) => m.status === "Confirmed").length}</p></Card>
            <Card><p className="text-xs uppercase text-slate-400">Estimated pay for the team</p><p className="text-2xl font-bold text-white mt-1">{money(teamCost)}</p></Card>
          </div>

          {team.length === 0 ? (
            <EmptyState icon={<Users className="w-8 h-8" />} title="Your team is empty" text="Go to “Find People” and press “Add to my team” on the people you want."
              action={<button className={btnPrimary} onClick={() => setTab("find")}>Find people</button>} />
          ) : (
            <Card>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-bold text-white">My team</h2>
                <button onClick={exportTeam} className={btnGhost}><Download className="w-3.5 h-3.5" /> Download list (Excel)</button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs min-w-[760px]">
                  <thead>
                    <tr className="text-left text-slate-400 border-b border-emerald-950/70">
                      <th className="py-2 pr-3 font-medium">Name</th>
                      <th className="py-2 pr-3 font-medium">Job on this film</th>
                      <th className="py-2 pr-3 font-medium">Status</th>
                      <th className="py-2 pr-3 font-medium w-28">Pay per day</th>
                      <th className="py-2 pr-3 font-medium w-20">Days</th>
                      <th className="py-2 pr-3 font-medium text-right">Total</th>
                      <th className="w-8" />
                    </tr>
                  </thead>
                  <tbody>
                    {team.map((m) => {
                      const p = personById.get(m.personId);
                      return (
                        <tr key={m.id} className="border-b border-emerald-950/40 align-middle">
                          <td className="py-2.5 pr-3">
                            <p className="text-white font-semibold">{p?.name || "(removed)"}</p>
                            <p className="text-[10px] text-slate-500">{p?.contact || "No contact added"}</p>
                          </td>
                          <td className="py-2.5 pr-3"><input className={inputCls} value={m.roleOnFilm} onChange={(e) => updateMember(m.id, { roleOnFilm: e.target.value })} /></td>
                          <td className="py-2.5 pr-3">
                            <select className={inputCls} value={m.status} onChange={(e) => updateMember(m.id, { status: e.target.value as TeamStatus })}>
                              <option>Shortlisted</option><option>Confirmed</option><option>Declined</option>
                            </select>
                            <div className="mt-1"><Pill tone={statusTone(m.status)}>{m.status}</Pill></div>
                          </td>
                          <td className="py-2.5 pr-3"><input type="number" min={0} className={inputCls} value={m.dayRate} onChange={(e) => updateMember(m.id, { dayRate: Number(e.target.value) })} /></td>
                          <td className="py-2.5 pr-3"><input type="number" min={0} className={inputCls} value={m.days} onChange={(e) => updateMember(m.id, { days: Number(e.target.value) })} /></td>
                          <td className="py-2.5 pr-3 text-right font-semibold text-white">{money(m.status === "Declined" ? 0 : m.dayRate * m.days)}</td>
                          <td><button onClick={() => removeMember(m.id)} className="text-slate-500 hover:text-red-400 cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <p className="text-[11px] text-slate-500 mt-3">These are planned payments. Add the real payments in the <Link className="text-emerald-300 underline" href="/financials">Budget page</Link> when you pay them.</p>
            </Card>
          )}
        </div>
      )}

      {/* ================= CAST ================= */}
      {tab === "cast" && (
        <div className="space-y-4">
          {characters.length === 0 ? (
            <EmptyState icon={<Drama className="w-8 h-8" />} title="No characters yet" text="Upload your script on the Script page first. The characters found in it will appear here."
              action={<Link href="/breakdown" className={btnPrimary}>Go to Script page</Link>} />
          ) : (
            <Card>
              <h2 className="text-base font-bold text-white">Who plays whom?</h2>
              <p className="text-xs text-slate-400 mb-4">Choose an actor for each character. The actor is added to “My Team” automatically and shows up on the call sheets. ({castedCount} of {characters.length} characters have an actor.)</p>
              <div className="space-y-2">
                {characters.map((c) => {
                  const chosen = casting[c.key] ? personById.get(casting[c.key]) : undefined;
                  return (
                    <div key={c.key} className="grid grid-cols-1 md:grid-cols-[1fr_320px_140px] gap-3 items-center p-3 rounded-xl bg-[#0b1a12] border border-emerald-950/70">
                      <div>
                        <p className="text-sm font-semibold text-white">{c.name}</p>
                        <p className="text-[11px] text-slate-400">appears in {c.count} scene{c.count > 1 ? "s" : ""}</p>
                      </div>
                      <select className={inputCls} value={casting[c.key] || ""} onChange={(e) => castActor(c.name, e.target.value, c.count)}>
                        <option value="">— nobody chosen yet —</option>
                        {actorsInTeam.length > 0 && (
                          <optgroup label="Actors in my team">
                            {actorsInTeam.map((p) => <option key={p.id} value={p.id}>{p.name} · {p.role}</option>)}
                          </optgroup>
                        )}
                        <optgroup label="Other actors in the list">
                          {actorsInDirectory.filter((p) => !inTeam(p.id)).map((p) => <option key={p.id} value={p.id}>{p.name} · {p.role}</option>)}
                        </optgroup>
                      </select>
                      <div className="text-right text-xs">
                        {chosen ? <span className="text-emerald-300 font-semibold">{money(chosen.dayRate)}/day</span> : <Pill tone="amber">Needs an actor</Pill>}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}
        </div>
      )}

      {/* ===== add to team ===== */}
      {adding && (
        <Modal title={`Add ${adding.person.name} to my team`} onClose={() => setAdding(null)}>
          <div className="space-y-4">
            <Field label="Job on this film"><input className={inputCls} value={adding.member.roleOnFilm} onChange={(e) => setAdding({ ...adding, member: { ...adding.member, roleOnFilm: e.target.value } })} /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Pay per day (Rs.)"><input type="number" min={0} className={inputCls} value={adding.member.dayRate} onChange={(e) => setAdding({ ...adding, member: { ...adding.member, dayRate: Number(e.target.value) } })} /></Field>
              <Field label="Number of days"><input type="number" min={1} className={inputCls} value={adding.member.days} onChange={(e) => setAdding({ ...adding, member: { ...adding.member, days: Number(e.target.value) } })} /></Field>
            </div>
            <Field label="Status">
              <select className={inputCls} value={adding.member.status} onChange={(e) => setAdding({ ...adding, member: { ...adding.member, status: e.target.value as TeamStatus } })}>
                <option>Shortlisted</option><option>Confirmed</option>
              </select>
            </Field>
            <div className="flex justify-end gap-2 pt-2 border-t border-emerald-950/60">
              <button className={btnGhost} onClick={() => setAdding(null)}>Cancel</button>
              <button className={btnPrimary} onClick={saveMember}><CheckCircle2 className="w-3.5 h-3.5" /> Add</button>
            </div>
          </div>
        </Modal>
      )}

      {/* ===== add / edit person ===== */}
      {editing && (
        <Modal title={directory.some((p) => p.id === editing.id) ? "Edit person" : "Add a person"} onClose={() => setEditing(null)}>
          <div className="space-y-4">
            <Field label="Name"><input autoFocus className={inputCls} value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Actor or crew?">
                <select className={inputCls} value={editing.kind} onChange={(e) => setEditing({ ...editing, kind: e.target.value as "Actor" | "Crew", role: e.target.value === "Actor" ? ACTOR_ROLES[0] : CREW_ROLES[0] })}>
                  <option value="Actor">Actor</option><option value="Crew">Crew</option>
                </select>
              </Field>
              <Field label="Job / role">
                <input list="role-options" className={inputCls} value={editing.role} onChange={(e) => setEditing({ ...editing, role: e.target.value })} />
                <datalist id="role-options">{(editing.kind === "Actor" ? ACTOR_ROLES : CREW_ROLES).map((r) => <option key={r} value={r} />)}</datalist>
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="City"><input className={inputCls} value={editing.city} onChange={(e) => setEditing({ ...editing, city: e.target.value })} /></Field>
              <Field label="Age range (actors)"><input className={inputCls} placeholder="e.g. 25–35" value={editing.ageRange} onChange={(e) => setEditing({ ...editing, ageRange: e.target.value })} /></Field>
            </div>
            <Field label="Languages" hint="Separate with commas"><input className={inputCls} value={editing.languages.join(", ")} onChange={(e) => setEditing({ ...editing, languages: e.target.value.split(",").map((x) => x.trim()).filter(Boolean) })} /></Field>
            <Field label="Experience"><input className={inputCls} placeholder="e.g. 5 years in TV drama" value={editing.experience} onChange={(e) => setEditing({ ...editing, experience: e.target.value })} /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Pay per day (Rs.)"><input type="number" min={0} className={inputCls} value={editing.dayRate || ""} onChange={(e) => setEditing({ ...editing, dayRate: Number(e.target.value) })} /></Field>
              <Field label="Phone / email"><input className={inputCls} value={editing.contact} onChange={(e) => setEditing({ ...editing, contact: e.target.value })} /></Field>
            </div>
            <Field label="Notes"><input className={inputCls} value={editing.notes} onChange={(e) => setEditing({ ...editing, notes: e.target.value })} /></Field>
            <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer"><input type="checkbox" checked={editing.available} onChange={(e) => setEditing({ ...editing, available: e.target.checked })} /> This person is free to work</label>
            <div className="flex justify-end gap-2 pt-2 border-t border-emerald-950/60">
              <button className={btnGhost} onClick={() => setEditing(null)}>Cancel</button>
              <button className={btnPrimary} onClick={savePerson}><CheckCircle2 className="w-3.5 h-3.5" /> Save</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
