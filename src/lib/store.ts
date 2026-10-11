"use client";

import { useEffect, useState } from "react";

/* ------------------------------------------------------------------
   eclat — shared project storage (browser localStorage)
   Every page reads/writes through these helpers so that the script,
   budget, team, locations and call sheets always stay connected.
------------------------------------------------------------------- */

export const KEYS = {
  scenes: "eclat_scenes_v1",
  sessionScenes: "eclat_active_scenes", // used by the Script page (kept for compatibility)
  meta: "eclat_script_meta_v1",
  budget: "eclat_budget_v1",
  roster: "eclat_roster_v1",
  locations: "eclat_locations_v1",
  callsheets: "eclat_callsheets_v1",
} as const;

export interface SceneLite {
  id: string;
  sceneNumber: number;
  slugline: string;
  timeOfDay: string;
  locationType: string;
  synopsis: string;
  characters: string[];
  props: string[];
  visualPrompt?: string;
}

export interface ScriptMeta {
  chars: number;
  at: number;
}

export function uid(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}${Date.now().toString(36).slice(-3)}`;
}

export function money(n: number): string {
  const v = Number.isFinite(n) ? Math.round(n) : 0;
  return "Rs. " + v.toLocaleString("en-US");
}

/* ---------- scenes (from the Script page) ---------- */

export function loadScenes(): SceneLite[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = sessionStorage.getItem(KEYS.sessionScenes) || localStorage.getItem(KEYS.scenes);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function loadMeta(): ScriptMeta | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEYS.meta);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/** "SCENE 03: INT. OLD LIBRARY - NIGHT" -> "OLD LIBRARY" */
export function locationNameOf(slugline: string): string {
  let s = String(slugline || "").trim();
  s = s.replace(/^(SCENE|දර්ශනය)\s*\d+\s*[:\-.]?\s*/i, "");
  s = s.replace(/^(INT\/EXT|EXT\/INT|INT|EXT|I\/E)\.?\s*[-–]?\s*/i, "");
  s = s.replace(/\s*[-–]\s*(DAY|NIGHT|DAWN|DUSK|MORNING|EVENING|AFTERNOON|CONTINUOUS|LATER)\b.*$/i, "");
  s = s.replace(/\s+/g, " ").trim();
  return s || "Unnamed location";
}

export function isExterior(scene: { locationType?: string; slugline?: string }): boolean {
  return /^EXT/i.test(scene.locationType || "") || /\bEXT\b/i.test(scene.slugline || "");
}

export function isNight(scene: { timeOfDay?: string }): boolean {
  return /NIGHT|DUSK/i.test(scene.timeOfDay || "");
}

/** Names the parser adds only as placeholders when no character was found */
export function isPlaceholderCharacter(name: string): boolean {
  return /^(LEAD CHARACTER|ප්‍රධාන චරිතය)$/i.test(name.trim());
}

/* ---------- persistent state hook ---------- */

export function usePersistentState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        const isObj = (x: unknown) => x && typeof x === "object" && !Array.isArray(x);
        setValue(isObj(initial) && isObj(parsed) ? ({ ...(initial as object), ...parsed } as T) : parsed);
      }
    } catch {
      /* ignore corrupted data */
    }
    setReady(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* storage full */
    }
  }, [key, value, ready]);

  return [value, setValue, ready] as const;
}

/* ---------- save / open the whole project as one file ---------- */

export function exportProjectFile() {
  const data: Record<string, unknown> = {};
  Object.values(KEYS).forEach((k) => {
    if (k === KEYS.sessionScenes) return;
    const raw = localStorage.getItem(k);
    if (raw) {
      try {
        data[k] = JSON.parse(raw);
      } catch {
        /* skip */
      }
    }
  });
  const blob = new Blob([JSON.stringify({ app: "eclat", version: 1, exportedAt: new Date().toISOString(), data }, null, 2)], {
    type: "application/json",
  });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `eclat-project-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(a.href);
}

export async function importProjectFile(file: File): Promise<boolean> {
  try {
    const parsed = JSON.parse(await file.text());
    if (parsed?.app !== "eclat" || typeof parsed.data !== "object") return false;
    const allowed = new Set<string>(Object.values(KEYS));
    Object.entries(parsed.data).forEach(([k, v]) => {
      if (allowed.has(k)) localStorage.setItem(k, JSON.stringify(v));
    });
    sessionStorage.removeItem(KEYS.sessionScenes);
    return true;
  } catch {
    return false;
  }
}

export function downloadCsv(filename: string, rows: (string | number)[][]) {
  const esc = (v: string | number) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const csv = "\uFEFF" + rows.map((r) => r.map(esc).join(",")).join("\n");
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  a.download = filename;
  a.click();
  URL.revokeObjectURL(a.href);
}
