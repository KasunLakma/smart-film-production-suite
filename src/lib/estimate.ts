/* ------------------------------------------------------------------
   Budget estimator — turns the scenes found in the script into a
   first-draft film budget. Pure functions (no React) so it is easy to
   test and to explain in the thesis:

     scenes -> shooting days -> (people + equipment + places + things)
            -> department totals -> + permits/insurance + safety buffer

   All prices are EDITABLE defaults (Sri Lankan rupees). They are
   planning placeholders, not real quotations.
------------------------------------------------------------------- */

export interface RateCard {
  leadActorPerDay: number;
  supportingActorPerDay: number;
  smallRolePerDay: number;
  crewPerPersonPerDay: number;
  nightExtraPct: number; // extra % paid to crew for night shooting
  cameraPackagePerDay: number;
  lightingGripPerDay: number;
  soundPackagePerDay: number;
  indoorLocationPerDay: number;
  outdoorLocationPerDay: number;
  setDressingPerIndoorLocation: number;
  propPerItem: number;
  costumePerCharacter: number;
  makeupHairPerDay: number;
  transportPerDay: number;
  mealPerPersonPerDay: number;
  postPerMinute: number;
}

export const DEFAULT_RATES: RateCard = {
  leadActorPerDay: 60000,
  supportingActorPerDay: 25000,
  smallRolePerDay: 10000,
  crewPerPersonPerDay: 12000,
  nightExtraPct: 25,
  cameraPackagePerDay: 90000,
  lightingGripPerDay: 50000,
  soundPackagePerDay: 25000,
  indoorLocationPerDay: 40000,
  outdoorLocationPerDay: 25000,
  setDressingPerIndoorLocation: 30000,
  propPerItem: 3000,
  costumePerCharacter: 6000,
  makeupHairPerDay: 15000,
  transportPerDay: 30000,
  mealPerPersonPerDay: 1800,
  postPerMinute: 40000,
};

export const RATE_LABELS: Record<keyof RateCard, { label: string; unit: string }> = {
  leadActorPerDay: { label: "Main actor", unit: "per day" },
  supportingActorPerDay: { label: "Supporting actor", unit: "per day" },
  smallRolePerDay: { label: "Small-role actor", unit: "per day" },
  crewPerPersonPerDay: { label: "Crew member (average)", unit: "per day" },
  nightExtraPct: { label: "Extra pay for night shoots", unit: "%" },
  cameraPackagePerDay: { label: "Camera & lenses", unit: "per day" },
  lightingGripPerDay: { label: "Lights & rigging", unit: "per day" },
  soundPackagePerDay: { label: "Sound equipment", unit: "per day" },
  indoorLocationPerDay: { label: "Indoor location", unit: "per day" },
  outdoorLocationPerDay: { label: "Outdoor location", unit: "per day" },
  setDressingPerIndoorLocation: { label: "Set decoration (each indoor place)", unit: "each" },
  propPerItem: { label: "Prop (each item)", unit: "each" },
  costumePerCharacter: { label: "Costume (each main/supporting actor)", unit: "each" },
  makeupHairPerDay: { label: "Make-up & hair team", unit: "per day" },
  transportPerDay: { label: "Vehicles & fuel", unit: "per day" },
  mealPerPersonPerDay: { label: "Meals (each person)", unit: "per day" },
  postPerMinute: { label: "Editing, colour, sound mix, music", unit: "per film minute" },
};

export interface EstimateSettings {
  scenesPerDay: number; // how many scenes the team can shoot in one day
  crewSize: number; // people working behind the camera each day
  insurancePct: number; // permits, insurance, legal
  bufferPct: number; // safety buffer for surprises
}

export const DEFAULT_SETTINGS: EstimateSettings = {
  scenesPerDay: 3,
  crewSize: 15,
  insurancePct: 3,
  bufferPct: 10,
};

export const DEPARTMENTS = [
  "Actors",
  "Crew",
  "Camera & Lights",
  "Sound",
  "Locations",
  "Art, Props & Costume",
  "Makeup & Hair",
  "Transport & Food",
  "Editing & Finishing",
  "Permits & Insurance",
  "Safety Buffer",
  "Other",
] as const;

export const DEPT_HELP: Record<string, { en: string; si: string }> = {
  Actors: { en: "Pay for the people acting in front of the camera", si: "කැමරාව ඉදිරිපිට රඟපාන නළු නිලියන්ගේ ගෙවීම්" },
  Crew: { en: "Director, camera team, assistants and everyone behind the camera", si: "අධ්‍යක්ෂ, කැමරා කණ්ඩායම් ඇතුළු කැමරාව පිටුපස සිටින සියලු දෙනා" },
  "Camera & Lights": { en: "Renting cameras, lenses, lights and rigging", si: "කැමරා, ලෙන්ස්, ආලෝකකරණ උපකරණ කුලියට ගැනීම" },
  Sound: { en: "Microphones and sound recording equipment", si: "මයික්‍රොෆෝන සහ ශබ්ද පටිගත කිරීමේ උපකරණ" },
  Locations: { en: "Paying to film at houses, streets, studios and other places", si: "ස්ථාන, නිවාස, වීදි, ස්ටුඩියෝ වල රූගත කිරීමට ගෙවීම්" },
  "Art, Props & Costume": { en: "Things seen on screen: props, set decoration, clothes", si: "තිරයේ පෙනෙන දේවල්: උපකරණ, සැරසිලි, ඇඳුම්" },
  "Makeup & Hair": { en: "Make-up artists and hair stylists", si: "රූපලාවන්‍ය සහ කෙස් සැරසිලි" },
  "Transport & Food": { en: "Vehicles, fuel, and meals for the team", si: "වාහන, ඉන්ධන සහ කණ්ඩායමේ ආහාර" },
  "Editing & Finishing": { en: "Editing, colour, sound mixing and music after filming", si: "රූගත කිරීමෙන් පසු සංස්කරණය, වර්ණ, ශබ්ද මිශ්‍රණය, සංගීතය" },
  "Permits & Insurance": { en: "Permissions, insurance and legal costs", si: "අවසර පත්‍ර, රක්ෂණය සහ නීතිමය වියදම්" },
  "Safety Buffer": { en: "Extra money kept aside for surprises", si: "අනපේක්ෂිත දේවලට වෙන්කර තබන අමතර මුදල" },
  Other: { en: "Anything that does not fit above", si: "ඉහත කිසිවකට නොගැලපෙන වෙනත් දේ" },
};

export interface PlanLine {
  id: string;
  department: string;
  item: string;
  qty: number;
  unit: string;
  unitCost: number;
  note: string;
}

export interface EstimateSummary {
  scenes: number;
  locations: number;
  characters: number;
  props: number;
  shootingDays: number;
  nightScenes: number;
  runtimeMin: number;
}

export interface EstimateScene {
  id: string;
  sceneNumber: number;
  slugline: string;
  timeOfDay: string;
  locationType: string;
  characters: string[];
  props: string[];
}

export const lineAmount = (l: PlanLine) => (Number(l.qty) || 0) * (Number(l.unitCost) || 0);

const PLACEHOLDER = /^(LEAD CHARACTER|ප්‍රධාන චරිතය)$/i;
const PROP_PLACEHOLDER = /^(KEY SCENE PROP|ප්‍රධාන පසුතල උපකරණ)$/i;

function locName(slugline: string): string {
  let s = String(slugline || "").trim();
  s = s.replace(/^(SCENE|දර්ශනය)\s*\d+\s*[:\-.]?\s*/i, "");
  s = s.replace(/^(INT\/EXT|EXT\/INT|INT|EXT|I\/E)\.?\s*[-–]?\s*/i, "");
  s = s.replace(/\s*[-–]\s*(DAY|NIGHT|DAWN|DUSK|MORNING|EVENING|AFTERNOON|CONTINUOUS|LATER)\b.*$/i, "");
  return s.replace(/\s+/g, " ").trim().toUpperCase() || "UNNAMED";
}

const isExt = (s: EstimateScene) => /^EXT/i.test(s.locationType || "") || /\bEXT\b/i.test(s.slugline || "");
const isNightScene = (s: EstimateScene) => /NIGHT|DUSK/i.test(s.timeOfDay || "");

let counter = 0;
const lid = () => `ln-${Date.now().toString(36)}-${(counter++).toString(36)}`;

export function estimateBudget(
  scenes: EstimateScene[],
  scriptChars: number | null,
  settings: EstimateSettings,
  rates: RateCard
): { lines: PlanLine[]; summary: EstimateSummary } {
  const spd = Math.max(1, Number(settings.scenesPerDay) || 3);
  const crew = Math.max(1, Number(settings.crewSize) || 1);
  const n = scenes.length;
  const days = Math.max(1, Math.ceil(n / spd));

  // ---- characters: how many scenes each one appears in
  const appear = new Map<string, number>();
  scenes.forEach((s) => {
    const seen = new Set<string>();
    (s.characters || []).forEach((c) => {
      const name = String(c).trim();
      if (!name || PLACEHOLDER.test(name)) return;
      const key = name.toUpperCase();
      if (!seen.has(key)) {
        seen.add(key);
        appear.set(key, (appear.get(key) || 0) + 1);
      }
    });
  });
  const ranked = Array.from(appear.entries()).sort((a, b) => b[1] - a[1]);
  const leadThreshold = Math.max(3, Math.ceil(n * 0.25));
  const leads = ranked.filter(([, c]) => c >= leadThreshold).slice(0, 4);
  const leadKeys = new Set(leads.map(([k]) => k));
  const supporting = ranked.filter(([k, c]) => !leadKeys.has(k) && c >= 2);
  const supKeys = new Set(supporting.map(([k]) => k));
  const small = ranked.filter(([k]) => !leadKeys.has(k) && !supKeys.has(k));

  const personDays = (list: [string, number][]) =>
    list.reduce((sum, [, c]) => sum + Math.min(days, Math.max(1, Math.ceil(c / spd))), 0);

  // ---- locations: group scenes by place
  const places = new Map<string, { count: number; ext: number }>();
  scenes.forEach((s) => {
    const k = locName(s.slugline);
    const p = places.get(k) || { count: 0, ext: 0 };
    p.count++;
    if (isExt(s)) p.ext++;
    places.set(k, p);
  });
  let indoorDays = 0;
  let outdoorDays = 0;
  let indoorPlaces = 0;
  places.forEach((p) => {
    const d = Math.max(1, Math.ceil(p.count / spd));
    if (p.ext > p.count / 2) outdoorDays += d;
    else {
      indoorDays += d;
      indoorPlaces++;
    }
  });

  // ---- props
  const propSet = new Set<string>();
  scenes.forEach((s) =>
    (s.props || []).forEach((p) => {
      const v = String(p).trim().toLowerCase();
      if (v && !PROP_PLACEHOLDER.test(v)) propSet.add(v);
    })
  );

  const nightScenes = scenes.filter(isNightScene).length;
  const nightShare = n ? nightScenes / n : 0;

  // ---- run time: about 1 script page = 1 minute
  const pages = scriptChars && scriptChars > 0 ? scriptChars / 1800 : n * 1.3;
  const runtimeMin = Math.min(240, Math.max(1, Math.round(pages)));

  const L: PlanLine[] = [];
  const add = (department: string, item: string, qty: number, unit: string, unitCost: number, note: string) =>
    L.push({ id: lid(), department, item, qty: Math.round(qty * 100) / 100, unit, unitCost: Math.round(unitCost), note });

  // Actors
  if (leads.length) {
    add("Actors", `Main actors (${leads.length})`, personDays(leads), "actor-days", rates.leadActorPerDay,
      `${leads.length} main characters, each needed on the days their scenes are shot`);
  }
  if (supporting.length) {
    add("Actors", `Supporting actors (${supporting.length})`, personDays(supporting), "actor-days", rates.supportingActorPerDay,
      "Characters who appear in 2 or more scenes");
  }
  if (small.length) {
    add("Actors", `Small roles (${small.length})`, personDays(small), "actor-days", rates.smallRolePerDay,
      "Characters who appear in only 1 scene");
  }
  if (!ranked.length) {
    add("Actors", "Actors (no characters found in script)", days * 3, "actor-days", rates.supportingActorPerDay,
      "Assumed 3 actors per shooting day — edit this");
  }

  // Crew
  add("Crew", `Crew (${crew} people)`, crew * days, "person-days", rates.crewPerPersonPerDay,
    `${crew} people × ${days} shooting days`);
  if (nightShare > 0) {
    add("Crew", "Night-shoot extra pay", Math.round(nightShare * crew * days), "person-days",
      rates.crewPerPersonPerDay * (rates.nightExtraPct / 100),
      `${nightScenes} night scenes · ${rates.nightExtraPct}% extra pay`);
  }

  // Equipment
  add("Camera & Lights", "Camera & lenses", days, "days", rates.cameraPackagePerDay, `${days} shooting days`);
  add("Camera & Lights", "Lights & rigging", days, "days", rates.lightingGripPerDay, `${days} shooting days`);
  add("Sound", "Sound equipment", days, "days", rates.soundPackagePerDay, `${days} shooting days`);

  // Locations
  if (indoorDays) add("Locations", `Indoor places (${indoorPlaces})`, indoorDays, "location-days", rates.indoorLocationPerDay,
    "Houses, rooms, studios and other indoor places");
  if (outdoorDays) add("Locations", `Outdoor places (${places.size - indoorPlaces})`, outdoorDays, "location-days", rates.outdoorLocationPerDay,
    "Streets, gardens, beaches and other outdoor places");

  // Art
  if (propSet.size) add("Art, Props & Costume", `Props (${propSet.size} items)`, propSet.size, "items", rates.propPerItem,
    "Objects found in the script");
  if (indoorPlaces) add("Art, Props & Costume", "Set decoration (indoor places)", indoorPlaces, "places", rates.setDressingPerIndoorLocation,
    "Dressing each indoor place to look right on camera");
  if (leads.length + supporting.length) add("Art, Props & Costume", "Costumes", leads.length + supporting.length, "actors",
    rates.costumePerCharacter, "For main and supporting actors");

  add("Makeup & Hair", "Make-up & hair team", days, "days", rates.makeupHairPerDay, `${days} shooting days`);

  const castOnSet = Math.min(8, leads.length + Math.ceil(supporting.length / 2) + 1);
  add("Transport & Food", "Vehicles & fuel", days, "days", rates.transportPerDay, `${days} shooting days`);
  add("Transport & Food", "Meals for cast & crew", (crew + castOnSet) * days, "meals", rates.mealPerPersonPerDay,
    `${crew} crew + about ${castOnSet} cast × ${days} days`);

  add("Editing & Finishing", `Editing, colour, sound mix, music (${runtimeMin} min film)`, runtimeMin, "minutes", rates.postPerMinute,
    "About 1 script page = 1 minute of film");

  const sub = L.reduce((t, l) => t + lineAmount(l), 0);
  const ins = (sub * settings.insurancePct) / 100;
  add("Permits & Insurance", "Permits, insurance & legal", 1, "lump sum", ins, `${settings.insurancePct}% of everything above`);
  const buf = ((sub + ins) * settings.bufferPct) / 100;
  add("Safety Buffer", "Safety buffer for surprises", 1, "lump sum", buf, `${settings.bufferPct}% kept aside`);

  return {
    lines: L,
    summary: {
      scenes: n,
      locations: places.size,
      characters: ranked.length,
      props: propSet.size,
      shootingDays: days,
      nightScenes,
      runtimeMin,
    },
  };
}
