"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Wallet,
  Calculator,
  Plus,
  Trash2,
  ChevronDown,
  Download,
  AlertTriangle,
  FileText,
  Settings2,
  Pencil,
  CheckCircle2,
} from "lucide-react";
import { KEYS, usePersistentState, loadScenes, loadMeta, money, uid, downloadCsv, SceneLite } from "@/lib/store";
import {
  DEFAULT_RATES,
  DEFAULT_SETTINGS,
  DEPARTMENTS,
  DEPT_HELP,
  RATE_LABELS,
  estimateBudget,
  lineAmount,
  PlanLine,
  RateCard,
  EstimateSettings,
  EstimateSummary,
} from "@/lib/estimate";
import { PageHeader, HelpBox, Card, Field, Modal, EmptyState, Pill, inputCls, btnPrimary, btnGhost, btnDanger } from "@/components/ui";

interface Expense {
  id: string;
  date: string;
  department: string;
  description: string;
  amount: number;
  paidTo: string;
  note: string;
}

interface BudgetState {
  settings: EstimateSettings;
  rates: RateCard;
  lines: PlanLine[];
  expenses: Expense[];
  summary: EstimateSummary | null;
  estimatedAt: number | null;
}

const DEFAULT_BUDGET: BudgetState = {
  settings: DEFAULT_SETTINGS,
  rates: DEFAULT_RATES,
  lines: [],
  expenses: [],
  summary: null,
  estimatedAt: null,
};

const today = () => new Date().toISOString().slice(0, 10);

export default function FinancialsPage() {
  const [budget, setBudget, ready] = usePersistentState<BudgetState>(KEYS.budget, DEFAULT_BUDGET);
  const [scenes, setScenes] = useState<SceneLite[]>([]);
  const [chars, setChars] = useState<number | null>(null);
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [showSettings, setShowSettings] = useState(false);
  const [filterDept, setFilterDept] = useState("ALL");
  const [form, setForm] = useState<Expense | null>(null);

  useEffect(() => {
    setScenes(loadScenes());
    setChars(loadMeta()?.chars ?? null);
  }, []);

  const { lines, expenses, settings, rates } = budget;

  const plannedTotal = useMemo(() => lines.reduce((t, l) => t + lineAmount(l), 0), [lines]);
  const spentTotal = useMemo(() => expenses.reduce((t, e) => t + (Number(e.amount) || 0), 0), [expenses]);
  const left = plannedTotal - spentTotal;
  const pct = plannedTotal > 0 ? (spentTotal / plannedTotal) * 100 : 0;

  const byDept = useMemo(
    () =>
      DEPARTMENTS.map((d) => ({
        dept: d as string,
        lines: lines.filter((l) => l.department === d),
        planned: lines.filter((l) => l.department === d).reduce((t, l) => t + lineAmount(l), 0),
        spent: expenses.filter((e) => e.department === d).reduce((t, e) => t + (Number(e.amount) || 0), 0),
      })).filter((x) => x.lines.length > 0 || x.spent > 0),
    [lines, expenses]
  );

  const barTone = (p: number) => (p > 100 ? "bg-red-500" : p >= 80 ? "bg-amber-400" : "bg-emerald-500");

  /* ---------------- actions ---------------- */

  const runEstimate = () => {
    if (scenes.length === 0) return;
    if (lines.length > 0 && !window.confirm("Re-calculate the plan from your script? Any changes you made to the planned amounts will be replaced. Your spending records will NOT be touched.")) return;
    const r = estimateBudget(scenes, chars, settings, rates);
    setBudget((b) => ({ ...b, lines: r.lines, summary: r.summary, estimatedAt: Date.now() }));
  };

  const updateLine = (id: string, patch: Partial<PlanLine>) =>
    setBudget((b) => ({ ...b, lines: b.lines.map((l) => (l.id === id ? { ...l, ...patch } : l)) }));

  const addLine = (department: string) =>
    setBudget((b) => ({
      ...b,
      lines: [...b.lines, { id: uid("ln"), department, item: "New cost", qty: 1, unit: "each", unitCost: 0, note: "" }],
    }));

  const deleteLine = (id: string) => setBudget((b) => ({ ...b, lines: b.lines.filter((l) => l.id !== id) }));

  const saveExpense = () => {
    if (!form) return;
    if (!form.description.trim() || !(Number(form.amount) > 0)) {
      window.alert("Please write what the money was spent on and the amount.");
      return;
    }
    setBudget((b) => {
      const exists = b.expenses.some((e) => e.id === form.id);
      return {
        ...b,
        expenses: exists ? b.expenses.map((e) => (e.id === form.id ? form : e)) : [form, ...b.expenses],
      };
    });
    setForm(null);
  };

  const deleteExpense = (id: string) => {
    if (window.confirm("Delete this spending record?")) setBudget((b) => ({ ...b, expenses: b.expenses.filter((e) => e.id !== id) }));
  };

  const shownExpenses = [...expenses]
    .filter((e) => filterDept === "ALL" || e.department === filterDept)
    .sort((a, b) => (a.date < b.date ? 1 : -1));

  const exportPlan = () =>
    downloadCsv("budget-plan.csv", [
      ["Department", "Item", "Quantity", "Unit", "Cost each (Rs.)", "Total (Rs.)", "Note"],
      ...lines.map((l) => [l.department, l.item, l.qty, l.unit, l.unitCost, Math.round(lineAmount(l)), l.note]),
      ["", "", "", "", "TOTAL PLANNED", Math.round(plannedTotal), ""],
    ]);

  const exportSpending = () =>
    downloadCsv("spending-record.csv", [
      ["Date", "Department", "What it was for", "Amount (Rs.)", "Paid to", "Note"],
      ...expenses.map((e) => [e.date, e.department, e.description, e.amount, e.paidTo, e.note]),
      ["", "", "TOTAL SPENT", Math.round(spentTotal), "", ""],
    ]);

  /* ---------------- UI ---------------- */

  return (
    <div className="space-y-6 p-4 md:p-8 max-w-7xl mx-auto text-slate-100">
      <PageHeader
        icon={<Wallet className="w-3.5 h-3.5" />}
        badge="Budget"
        title="Film Budget & Spending"
        subtitle="See how much the film will cost, then record every rupee you spend while shooting."
        sinhala="චිත්‍රපටයට කොපමණ වියදමක් යයිද බලන්න, රූගත කරන අතරතුර වියදම් කරන හැම රුපියලක්ම මෙහි සටහන් කරන්න."
        actions={
          <>
            <button onClick={exportPlan} disabled={!lines.length} className={btnGhost}>
              <Download className="w-3.5 h-3.5" /> Download plan (Excel)
            </button>
            <button onClick={exportSpending} disabled={!expenses.length} className={btnGhost}>
              <Download className="w-3.5 h-3.5" /> Download spending
            </button>
          </>
        }
      />

      <HelpBox>
        <p><b>Step 1.</b> Upload your script on the <Link href="/breakdown" className="text-emerald-300 underline">Script page</Link>. Then press <b>“Work out the budget from my script”</b> below.</p>
        <p><b>Step 2.</b> Check the numbers. You can change any amount: the prices here are only a starting guess.</p>
        <p><b>Step 3.</b> While shooting, press <b>“Add spending”</b> every time money is paid. The bars show how much is left.</p>
        <p className="text-emerald-300/80">පියවර 1: Script පිටුවේ script එක දමන්න. 2: පහළ බොත්තම එබූ විට ඇස්තමේන්තුව ලැබේ; අගයන් ඔබට වෙනස් කළ හැක. 3: රූගත කරන විට වියදම් එකතු කරන්න.</p>
      </HelpBox>

      {!ready ? null : (
        <>
          {/* ------- summary ------- */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <p className="text-xs uppercase tracking-wider text-slate-400">Total budget (plan)</p>
              <p className="text-3xl font-bold text-white mt-1">{money(plannedTotal)}</p>
              <p className="text-xs text-slate-500 mt-1">මුළු සැලසුම් කළ බජට් එක</p>
            </Card>
            <Card>
              <p className="text-xs uppercase tracking-wider text-slate-400">Spent so far</p>
              <p className="text-3xl font-bold text-emerald-300 mt-1">{money(spentTotal)}</p>
              <p className="text-xs text-slate-500 mt-1">{plannedTotal > 0 ? `${pct.toFixed(1)}% of the budget used` : "No budget yet"} · මෙතෙක් වියදම</p>
            </Card>
            <Card>
              <p className="text-xs uppercase tracking-wider text-slate-400">Money left</p>
              <p className={`text-3xl font-bold mt-1 ${left < 0 ? "text-red-400" : "text-white"}`}>{money(left)}</p>
              <p className="text-xs text-slate-500 mt-1">{left < 0 ? "Over budget!" : "Still available"} · ඉතිරි මුදල</p>
            </Card>
          </div>

          {plannedTotal > 0 && (
            <div>
              <div className="w-full h-3 rounded-full bg-[#050b07] overflow-hidden border border-emerald-950/60">
                <div className={`h-full ${barTone(pct)} transition-all`} style={{ width: `${Math.min(100, pct)}%` }} />
              </div>
              {pct > 100 && (
                <div className="mt-3 flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
                  <AlertTriangle className="w-4 h-4 shrink-0" /> You have spent {money(spentTotal - plannedTotal)} more than the whole budget.
                </div>
              )}
              {pct >= 80 && pct <= 100 && (
                <div className="mt-3 flex items-center gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-sm">
                  <AlertTriangle className="w-4 h-4 shrink-0" /> Careful: more than 80% of the budget is already used.
                </div>
              )}
            </div>
          )}

          {/* ------- estimate from script ------- */}
          <Card>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Calculator className="w-4 h-4 text-emerald-400" /> Work out the budget from my script
                </h2>
                {scenes.length > 0 ? (
                  <p className="text-sm text-slate-300 mt-1">
                    Your script has <b>{scenes.length} scenes</b>. The computer will count the places, actors and props, guess the number of shooting days, and add up the likely costs.
                  </p>
                ) : (
                  <p className="text-sm text-amber-300 mt-1">
                    No script found yet. Go to the <Link href="/breakdown" className="underline">Script page</Link> and upload your script first.
                  </p>
                )}
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => setShowSettings(!showSettings)} className={btnGhost}>
                  <Settings2 className="w-3.5 h-3.5" /> Change assumptions & prices
                </button>
                <button onClick={runEstimate} disabled={scenes.length === 0} className={btnPrimary}>
                  <Calculator className="w-3.5 h-3.5" /> {lines.length ? "Re-calculate" : "Work out the budget"}
                </button>
              </div>
            </div>

            {budget.summary && (
              <div className="mt-4 grid grid-cols-2 md:grid-cols-6 gap-2 text-center">
                {[
                  ["Scenes", budget.summary.scenes],
                  ["Places", budget.summary.locations],
                  ["Characters", budget.summary.characters],
                  ["Props", budget.summary.props],
                  ["Shooting days", budget.summary.shootingDays],
                  ["Film length", `${budget.summary.runtimeMin} min`],
                ].map(([label, val]) => (
                  <div key={String(label)} className="rounded-xl bg-[#0b1a12] border border-emerald-950/70 py-2">
                    <p className="text-lg font-bold text-white">{val}</p>
                    <p className="text-[11px] text-slate-400">{label}</p>
                  </div>
                ))}
              </div>
            )}

            {showSettings && (
              <div className="mt-5 pt-5 border-t border-emerald-950/70 space-y-5">
                <div>
                  <h3 className="text-sm font-semibold text-white mb-2">How will you shoot?</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <Field label="Scenes shot per day" hint="Usually 2 to 5">
                      <input type="number" min={1} className={inputCls} value={settings.scenesPerDay}
                        onChange={(e) => setBudget((b) => ({ ...b, settings: { ...b.settings, scenesPerDay: Number(e.target.value) } }))} />
                    </Field>
                    <Field label="Crew size" hint="People behind the camera">
                      <input type="number" min={1} className={inputCls} value={settings.crewSize}
                        onChange={(e) => setBudget((b) => ({ ...b, settings: { ...b.settings, crewSize: Number(e.target.value) } }))} />
                    </Field>
                    <Field label="Permits & insurance (%)">
                      <input type="number" min={0} className={inputCls} value={settings.insurancePct}
                        onChange={(e) => setBudget((b) => ({ ...b, settings: { ...b.settings, insurancePct: Number(e.target.value) } }))} />
                    </Field>
                    <Field label="Safety buffer (%)" hint="Extra for surprises">
                      <input type="number" min={0} className={inputCls} value={settings.bufferPct}
                        onChange={(e) => setBudget((b) => ({ ...b, settings: { ...b.settings, bufferPct: Number(e.target.value) } }))} />
                    </Field>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white mb-1">Prices used in the estimate (Rs.)</h3>
                  <p className="text-xs text-slate-400 mb-3">These are starting guesses, not real quotations. Change them to match the prices you really get, then press “Re-calculate”.</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {(Object.keys(RATE_LABELS) as (keyof RateCard)[]).map((k) => (
                      <Field key={k} label={`${RATE_LABELS[k].label} (${RATE_LABELS[k].unit})`}>
                        <input type="number" min={0} className={inputCls} value={rates[k]}
                          onChange={(e) => setBudget((b) => ({ ...b, rates: { ...b.rates, [k]: Number(e.target.value) } }))} />
                      </Field>
                    ))}
                  </div>
                  <button className={`${btnGhost} mt-3`} onClick={() => setBudget((b) => ({ ...b, rates: DEFAULT_RATES, settings: DEFAULT_SETTINGS }))}>
                    Put back the original prices
                  </button>
                </div>
              </div>
            )}
          </Card>

          {/* ------- department plan ------- */}
          <Card>
            <h2 className="text-base font-bold text-white mb-1">Where the money goes</h2>
            <p className="text-xs text-slate-400 mb-4">Press a row to see the details and change the numbers. ඕනෑම පේළියක් එබූ විට විස්තර පෙනේ.</p>

            {byDept.length === 0 ? (
              <EmptyState
                icon={<FileText className="w-8 h-8" />}
                title="No budget yet"
                text="Press “Work out the budget” above to create a first draft from your script."
              />
            ) : (
              <div className="space-y-2">
                {byDept.map(({ dept, lines: dl, planned, spent }) => {
                  const p = planned > 0 ? (spent / planned) * 100 : spent > 0 ? 101 : 0;
                  const isOpen = open[dept];
                  return (
                    <div key={dept} className="rounded-xl bg-[#0b1a12] border border-emerald-950/70">
                      <button onClick={() => setOpen({ ...open, [dept]: !isOpen })} className="w-full text-left p-4 cursor-pointer">
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-white flex items-center gap-2">
                              {dept}
                              {p > 100 && <Pill tone="red">Over budget</Pill>}
                              {p >= 80 && p <= 100 && <Pill tone="amber">Almost used up</Pill>}
                            </p>
                            <p className="text-[11px] text-slate-400 truncate">{DEPT_HELP[dept]?.en} · {DEPT_HELP[dept]?.si}</p>
                          </div>
                          <div className="flex items-center gap-4 shrink-0">
                            <div className="text-right">
                              <p className="text-sm font-bold text-white">{money(planned)}</p>
                              <p className="text-[11px] text-emerald-300">spent {money(spent)}</p>
                            </div>
                            <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                          </div>
                        </div>
                        <div className="mt-3 w-full h-2 rounded-full bg-[#050b07] overflow-hidden border border-emerald-950/40">
                          <div className={`h-full ${barTone(p)}`} style={{ width: `${Math.min(100, p)}%` }} />
                        </div>
                      </button>

                      {isOpen && (
                        <div className="px-4 pb-4 overflow-x-auto">
                          <table className="w-full text-xs min-w-[640px]">
                            <thead>
                              <tr className="text-left text-slate-400">
                                <th className="py-2 pr-2 font-medium">What</th>
                                <th className="py-2 pr-2 font-medium w-20">How many</th>
                                <th className="py-2 pr-2 font-medium w-24">Cost each (Rs.)</th>
                                <th className="py-2 pr-2 font-medium w-28 text-right">Total</th>
                                <th className="w-8" />
                              </tr>
                            </thead>
                            <tbody>
                              {dl.map((l) => (
                                <tr key={l.id} className="border-t border-emerald-950/60 align-top">
                                  <td className="py-2 pr-2">
                                    <input className={inputCls} value={l.item} onChange={(e) => updateLine(l.id, { item: e.target.value })} />
                                    {l.note && <p className="text-[10px] text-slate-500 mt-1">{l.note}</p>}
                                  </td>
                                  <td className="py-2 pr-2">
                                    <input type="number" min={0} className={inputCls} value={l.qty} onChange={(e) => updateLine(l.id, { qty: Number(e.target.value) })} />
                                    <p className="text-[10px] text-slate-500 mt-1">{l.unit}</p>
                                  </td>
                                  <td className="py-2 pr-2">
                                    <input type="number" min={0} className={inputCls} value={l.unitCost} onChange={(e) => updateLine(l.id, { unitCost: Number(e.target.value) })} />
                                  </td>
                                  <td className="py-2 pr-2 text-right font-semibold text-white pt-3">{money(lineAmount(l))}</td>
                                  <td className="py-2 pt-2.5">
                                    <button onClick={() => deleteLine(l.id)} className="text-slate-500 hover:text-red-400 cursor-pointer" title="Remove">
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          <button onClick={() => addLine(dept)} className={`${btnGhost} mt-3`}>
                            <Plus className="w-3.5 h-3.5" /> Add another cost here
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* ------- spending log ------- */}
          <Card>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="text-base font-bold text-white">Spending record</h2>
                <p className="text-xs text-slate-400">Write down every payment made during the film. හැම ගෙවීමක්ම මෙහි සටහන් කරන්න.</p>
              </div>
              <div className="flex gap-2">
                <select className={`${inputCls} w-auto`} value={filterDept} onChange={(e) => setFilterDept(e.target.value)}>
                  <option value="ALL">All departments</option>
                  {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
                <button
                  className={btnPrimary}
                  onClick={() => setForm({ id: uid("exp"), date: today(), department: "Crew", description: "", amount: 0, paidTo: "", note: "" })}
                >
                  <Plus className="w-3.5 h-3.5" /> Add spending
                </button>
              </div>
            </div>

            {shownExpenses.length === 0 ? (
              <EmptyState
                icon={<Wallet className="w-8 h-8" />}
                title="Nothing recorded yet"
                text="When you pay for anything (food, fuel, equipment, a location…) press “Add spending” and write it down."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs min-w-[680px]">
                  <thead>
                    <tr className="text-left text-slate-400 border-b border-emerald-950/70">
                      <th className="py-2 pr-3 font-medium">Date</th>
                      <th className="py-2 pr-3 font-medium">What it was for</th>
                      <th className="py-2 pr-3 font-medium">Department</th>
                      <th className="py-2 pr-3 font-medium">Paid to</th>
                      <th className="py-2 pr-3 font-medium text-right">Amount</th>
                      <th className="w-16" />
                    </tr>
                  </thead>
                  <tbody>
                    {shownExpenses.map((e) => (
                      <tr key={e.id} className="border-b border-emerald-950/40">
                        <td className="py-2.5 pr-3 text-slate-300 whitespace-nowrap">{e.date}</td>
                        <td className="py-2.5 pr-3 text-white font-medium">
                          {e.description}
                          {e.note && <span className="block text-[10px] text-slate-500 font-normal">{e.note}</span>}
                        </td>
                        <td className="py-2.5 pr-3 text-slate-300">{e.department}</td>
                        <td className="py-2.5 pr-3 text-slate-300">{e.paidTo || "—"}</td>
                        <td className="py-2.5 pr-3 text-right font-semibold text-emerald-300">{money(e.amount)}</td>
                        <td className="py-2.5">
                          <div className="flex gap-2 justify-end">
                            <button onClick={() => setForm(e)} className="text-slate-400 hover:text-emerald-300 cursor-pointer" title="Edit"><Pencil className="w-3.5 h-3.5" /></button>
                            <button onClick={() => deleteExpense(e.id)} className="text-slate-500 hover:text-red-400 cursor-pointer" title="Delete"><Trash2 className="w-3.5 h-3.5" /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </>
      )}

      {form && (
        <Modal title={expenses.some((e) => e.id === form.id) ? "Change spending record" : "Add spending"} onClose={() => setForm(null)}>
          <div className="space-y-4">
            <Field label="What was the money spent on?">
              <input autoFocus className={inputCls} placeholder="e.g. Lunch for the crew, Day 3" value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Amount (Rs.)">
                <input type="number" min={0} className={inputCls} value={form.amount || ""} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} />
              </Field>
              <Field label="Date">
                <input type="date" className={inputCls} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
              </Field>
            </div>
            <Field label="Which department?" hint={DEPT_HELP[form.department]?.en}>
              <select className={inputCls} value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })}>
                {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </Field>
            <Field label="Paid to (optional)">
              <input className={inputCls} placeholder="Shop, person or company" value={form.paidTo} onChange={(e) => setForm({ ...form, paidTo: e.target.value })} />
            </Field>
            <Field label="Note (optional)">
              <input className={inputCls} value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} />
            </Field>
            <div className="flex justify-end gap-2 pt-2 border-t border-emerald-950/60">
              <button className={btnGhost} onClick={() => setForm(null)}>Cancel</button>
              <button className={btnPrimary} onClick={saveExpense}><CheckCircle2 className="w-3.5 h-3.5" /> Save</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
