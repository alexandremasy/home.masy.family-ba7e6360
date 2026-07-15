// ============================================================
// Maison domain — Repas · Courses · Anniversaires
// All data is mocked. No persistence.
// ============================================================

import type { WeatherCond } from "./mock-data";
export type { WeatherCond };

export type Role = "protéine" | "légume" | "féculent" | "sauce" | "garniture";
export type Unit = "pièce" | "g" | "gousse" | "botte";
export type Densite = "complet" | "léger";
export type Temperature = "chaud" | "froid";
export type Effort = 1 | 2 | 3 | 4 | 5; // 1 = rapide, 5 = long
export type Base =
  | "assiette" | "pâtes" | "bowl" | "salade" | "quiche" | "pizza" | "gratin"
  | "soupe" | "wrap" | "tarte" | "chili" | "curry" | "raclette" | "potée"
  | "risotto" | "lasagne";

export interface Composant {
  name: string;
  role: Role;
  qty: number;
  unit: Unit;
}

export interface Dish {
  id: string;
  name: string;                    // alias
  base: Base;
  modifiers: Composant[];
  densite: Densite;
  temperature: Temperature;
  emportable: boolean;             // lunchbox friendly
  rechauffable: boolean;
  effort: Effort;                  // weekend cooking load
  rendement: 1 | 2 | 3;            // slots covered by one cook (couple)
  tags?: string[];
  dernierServiLe?: string;         // ISO date
}

export type Slot = "midi" | "soir";
export interface PlanEntry {
  date: string;     // ISO yyyy-mm-dd
  slot: Slot;
  dishId: string;
  batchOfDate?: string;   // reference to the cook date, if this slot is a leftover from a batch
  note?: string;
}

// ------------------------------------------------------------
// Catalogue
// ------------------------------------------------------------
export const dishes: Dish[] = [
  {
    id: "saumon-riz-epinards", name: "Saumon riz épinards", base: "assiette",
    modifiers: [
      { name: "saumon", role: "protéine", qty: 400, unit: "g" },
      { name: "riz", role: "féculent", qty: 300, unit: "g" },
      { name: "épinards", role: "légume", qty: 300, unit: "g" },
    ],
    densite: "complet", temperature: "chaud", emportable: true, rechauffable: true, effort: 2, rendement: 1,
    dernierServiLe: "2026-06-30",
  },
  {
    id: "roti-haricots-croquettes", name: "Rôti haricots croquettes", base: "assiette",
    modifiers: [
      { name: "rôti de porc", role: "protéine", qty: 500, unit: "g" },
      { name: "haricots verts", role: "légume", qty: 400, unit: "g" },
      { name: "croquettes", role: "féculent", qty: 12, unit: "pièce" },
    ],
    densite: "complet", temperature: "chaud", emportable: true, rechauffable: true, effort: 3, rendement: 2,
    dernierServiLe: "2026-06-22",
  },
  {
    id: "poulet-moutarde-gratin", name: "Poulet moutarde gratin dauphinois", base: "assiette",
    modifiers: [
      { name: "cuisses de poulet", role: "protéine", qty: 4, unit: "pièce" },
      { name: "haricots verts", role: "légume", qty: 300, unit: "g" },
      { name: "pommes de terre", role: "féculent", qty: 1000, unit: "g" },
      { name: "moutarde", role: "sauce", qty: 2, unit: "pièce" },
    ],
    densite: "complet", temperature: "chaud", emportable: true, rechauffable: true, effort: 4, rendement: 2,
  },
  {
    id: "quiche-saumon-epinards", name: "Quiche saumon épinards", base: "quiche",
    modifiers: [
      { name: "saumon", role: "protéine", qty: 250, unit: "g" },
      { name: "épinards", role: "légume", qty: 250, unit: "g" },
      { name: "pâte brisée", role: "féculent", qty: 1, unit: "pièce" },
    ],
    densite: "complet", temperature: "chaud", emportable: true, rechauffable: true, effort: 2, rendement: 2,
  },
  {
    id: "pizza-poulet-oignon", name: "Pizza poulet oignon", base: "pizza",
    modifiers: [
      { name: "blanc de poulet", role: "protéine", qty: 300, unit: "g" },
      { name: "oignon", role: "légume", qty: 2, unit: "pièce" },
      { name: "pâte à pizza", role: "féculent", qty: 2, unit: "pièce" },
      { name: "tomate", role: "sauce", qty: 1, unit: "pièce" },
      { name: "mozzarella", role: "garniture", qty: 250, unit: "g" },
    ],
    densite: "complet", temperature: "chaud", emportable: false, rechauffable: true, effort: 2, rendement: 1,
  },
  {
    id: "chili", name: "Chili con carne", base: "chili",
    modifiers: [
      { name: "boeuf haché", role: "protéine", qty: 600, unit: "g" },
      { name: "haricots rouges", role: "légume", qty: 500, unit: "g" },
      { name: "tomate", role: "sauce", qty: 3, unit: "pièce" },
      { name: "oignon", role: "légume", qty: 2, unit: "pièce" },
      { name: "poivron", role: "légume", qty: 2, unit: "pièce" },
    ],
    densite: "complet", temperature: "chaud", emportable: true, rechauffable: true, effort: 3, rendement: 3,
    tags: ["batch"],
  },
  {
    id: "curry-poulet", name: "Curry de poulet", base: "curry",
    modifiers: [
      { name: "blanc de poulet", role: "protéine", qty: 500, unit: "g" },
      { name: "courgette", role: "légume", qty: 2, unit: "pièce" },
      { name: "riz", role: "féculent", qty: 300, unit: "g" },
      { name: "curry", role: "sauce", qty: 1, unit: "pièce" },
      { name: "lait de coco", role: "sauce", qty: 1, unit: "pièce" },
    ],
    densite: "complet", temperature: "chaud", emportable: true, rechauffable: true, effort: 3, rendement: 2,
  },
  {
    id: "lasagne", name: "Lasagne bolognaise", base: "lasagne",
    modifiers: [
      { name: "boeuf haché", role: "protéine", qty: 500, unit: "g" },
      { name: "tomate", role: "sauce", qty: 4, unit: "pièce" },
      { name: "pâte lasagne", role: "féculent", qty: 1, unit: "pièce" },
      { name: "mozzarella", role: "garniture", qty: 300, unit: "g" },
    ],
    densite: "complet", temperature: "chaud", emportable: true, rechauffable: true, effort: 4, rendement: 3,
    tags: ["batch"],
  },
  {
    id: "salade-poulet-avocat", name: "Salade repas poulet avocat", base: "salade",
    modifiers: [
      { name: "blanc de poulet", role: "protéine", qty: 300, unit: "g" },
      { name: "avocat", role: "légume", qty: 2, unit: "pièce" },
      { name: "salade", role: "légume", qty: 1, unit: "pièce" },
      { name: "tomate", role: "légume", qty: 3, unit: "pièce" },
    ],
    densite: "complet", temperature: "froid", emportable: true, rechauffable: false, effort: 1, rendement: 1,
    tags: ["été"],
  },
  {
    id: "wrap-thon", name: "Wrap thon crudités", base: "wrap",
    modifiers: [
      { name: "thon", role: "protéine", qty: 2, unit: "pièce" },
      { name: "salade", role: "légume", qty: 1, unit: "pièce" },
      { name: "tomate", role: "légume", qty: 2, unit: "pièce" },
      { name: "wraps", role: "féculent", qty: 4, unit: "pièce" },
    ],
    densite: "léger", temperature: "froid", emportable: true, rechauffable: false, effort: 1, rendement: 1,
  },
  {
    id: "bowl-saumon-avocat", name: "Bowl saumon avocat riz", base: "bowl",
    modifiers: [
      { name: "saumon", role: "protéine", qty: 300, unit: "g" },
      { name: "avocat", role: "légume", qty: 2, unit: "pièce" },
      { name: "riz", role: "féculent", qty: 250, unit: "g" },
      { name: "concombre", role: "légume", qty: 1, unit: "pièce" },
    ],
    densite: "complet", temperature: "froid", emportable: true, rechauffable: false, effort: 2, rendement: 1,
  },
  {
    id: "soupe-potiron", name: "Soupe de potiron", base: "soupe",
    modifiers: [
      { name: "potiron", role: "légume", qty: 1000, unit: "g" },
      { name: "oignon", role: "légume", qty: 1, unit: "pièce" },
      { name: "crème", role: "sauce", qty: 1, unit: "pièce" },
    ],
    densite: "léger", temperature: "chaud", emportable: true, rechauffable: true, effort: 1, rendement: 2,
  },
  {
    id: "tarte-tomate-mozza", name: "Tarte tomate mozzarella", base: "tarte",
    modifiers: [
      { name: "tomate", role: "légume", qty: 5, unit: "pièce" },
      { name: "mozzarella", role: "garniture", qty: 250, unit: "g" },
      { name: "pâte brisée", role: "féculent", qty: 1, unit: "pièce" },
    ],
    densite: "léger", temperature: "chaud", emportable: true, rechauffable: true, effort: 2, rendement: 2,
  },
  {
    id: "raclette", name: "Raclette", base: "raclette",
    modifiers: [
      { name: "fromage à raclette", role: "protéine", qty: 600, unit: "g" },
      { name: "charcuterie", role: "protéine", qty: 400, unit: "g" },
      { name: "pommes de terre", role: "féculent", qty: 1500, unit: "g" },
      { name: "cornichons", role: "garniture", qty: 1, unit: "pièce" },
    ],
    densite: "complet", temperature: "chaud", emportable: false, rechauffable: false, effort: 1, rendement: 1,
    tags: ["hiver", "convivial"],
  },
  {
    id: "risotto-champignons", name: "Risotto champignons", base: "risotto",
    modifiers: [
      { name: "riz arborio", role: "féculent", qty: 300, unit: "g" },
      { name: "champignons", role: "légume", qty: 400, unit: "g" },
      { name: "parmesan", role: "garniture", qty: 100, unit: "g" },
      { name: "oignon", role: "légume", qty: 1, unit: "pièce" },
    ],
    densite: "complet", temperature: "chaud", emportable: true, rechauffable: true, effort: 3, rendement: 2,
  },
  {
    id: "pates-pesto-poulet", name: "Pâtes pesto poulet", base: "pâtes",
    modifiers: [
      { name: "pâtes", role: "féculent", qty: 400, unit: "g" },
      { name: "blanc de poulet", role: "protéine", qty: 300, unit: "g" },
      { name: "pesto", role: "sauce", qty: 1, unit: "pièce" },
      { name: "tomate cerise", role: "légume", qty: 250, unit: "g" },
    ],
    densite: "complet", temperature: "chaud", emportable: true, rechauffable: true, effort: 1, rendement: 1,
  },
  {
    id: "gratin-courgettes", name: "Gratin de courgettes", base: "gratin",
    modifiers: [
      { name: "courgette", role: "légume", qty: 4, unit: "pièce" },
      { name: "oeuf", role: "protéine", qty: 4, unit: "pièce" },
      { name: "gruyère", role: "garniture", qty: 200, unit: "g" },
    ],
    densite: "léger", temperature: "chaud", emportable: true, rechauffable: true, effort: 2, rendement: 2,
  },
  {
    id: "potee", name: "Potée liégeoise", base: "potée",
    modifiers: [
      { name: "saucisse", role: "protéine", qty: 4, unit: "pièce" },
      { name: "chou vert", role: "légume", qty: 1, unit: "pièce" },
      { name: "pommes de terre", role: "féculent", qty: 800, unit: "g" },
      { name: "carotte", role: "légume", qty: 4, unit: "pièce" },
    ],
    densite: "complet", temperature: "chaud", emportable: true, rechauffable: true, effort: 3, rendement: 3,
    tags: ["hiver", "batch"],
  },
];

export function dishById(id: string): Dish | undefined {
  return dishes.find((d) => d.id === id);
}

// ------------------------------------------------------------
// Planning window — a sliding 10-day plan starting "tomorrow"
// ------------------------------------------------------------
export function iso(d: Date): string {
  return d.toISOString().slice(0, 10);
}
export function addDays(d: Date, n: number): Date {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}
export function frDay(d: Date): string {
  return d.toLocaleDateString("fr-BE", { weekday: "short", day: "numeric", month: "short" });
}
export function frLongDay(d: Date): string {
  return d.toLocaleDateString("fr-BE", { weekday: "long", day: "numeric", month: "long" });
}
export function isWeekend(d: Date): boolean {
  const g = d.getDay();
  return g === 0 || g === 6;
}

// Reference "today" — start-of-day so the window is stable across renders.
export const TODAY = (() => { const t = new Date(); t.setHours(0, 0, 0, 0); return t; })();

// Window: from tomorrow through +10 days
export const WINDOW_START = addDays(TODAY, 1);
export const WINDOW_DAYS: Date[] = Array.from({ length: 10 }, (_, i) => addDays(WINDOW_START, i));

// Calendar view: monday of the week containing TODAY.
export const CAL_START = addDays(TODAY, -((TODAY.getDay() + 6) % 7));

/**
 * Two weeks of calendar, scrolled by ONE week at a time.
 * `offsetWeeks` shifts the anchor by 7 days, so consecutive views overlap —
 * which mirrors the sliding plan window (see MAISON-BRIEF, Module 1).
 */
export function calWeeks(offsetWeeks: number): Date[][] {
  const start = addDays(CAL_START, offsetWeeks * 7);
  const days = Array.from({ length: 14 }, (_, i) => addDays(start, i));
  return [days.slice(0, 7), days.slice(7)];
}

// Note: no isPast()/isInWindow() helper on purpose — every day in the grid is fully
// visible and editable. The sliding window is a planning concept, not a UI gate.

// ------------------------------------------------------------
// Per-day weather (mocked, deterministic from the date so SSR and client agree)
// ------------------------------------------------------------
export interface DayWeather { cond: WeatherCond; maxC: number; minC: number; heatwave: boolean }

const COND_CYCLE: WeatherCond[] = [
  "partly", "sun", "sun", "rain", "cloud", "partly", "sun",
  "storm", "partly", "cloud", "sun", "rain", "partly", "sun",
];

export function dayWeather(d: Date): DayWeather {
  const seed = d.getDate() + d.getMonth() * 31;
  const cond = COND_CYCLE[seed % COND_CYCLE.length];
  const maxC = 16 + ((seed * 7) % 12); // 16–27
  return { cond, maxC, minC: maxC - 6 - (seed % 3), heatwave: maxC >= 26 };
}

/** The hint the suggestion engine consumes for a given day. */
export function weatherHintFor(d: Date): WeatherHint {
  const w = dayWeather(d);
  return { heatwave: w.heatwave, label: `${condLabel(w.cond)}, ${w.maxC}°` };
}

export function condLabel(c: WeatherCond): string {
  return {
    sun: "Ensoleillé", cloud: "Couvert", partly: "Éclaircies",
    rain: "Pluie", storm: "Orages", snow: "Neige", fog: "Brouillard",
  }[c];
}

// Seed plan — realistic weekday-lunch batch + varied dinners
const PLAN_SEED: Array<{ dayOffset: number; slot: Slot; dishId: string; batchOffset?: number }> = [
  // Day 0 (tomorrow)
  { dayOffset: 0, slot: "midi", dishId: "chili" },
  { dayOffset: 0, slot: "soir", dishId: "soupe-potiron" },
  // Day 1
  { dayOffset: 1, slot: "midi", dishId: "chili", batchOffset: 0 },
  { dayOffset: 1, slot: "soir", dishId: "tarte-tomate-mozza" },
  // Day 2
  { dayOffset: 2, slot: "midi", dishId: "quiche-saumon-epinards" },
  { dayOffset: 2, slot: "soir", dishId: "wrap-thon" },
  // Day 3
  { dayOffset: 3, slot: "midi", dishId: "quiche-saumon-epinards", batchOffset: 2 },
  { dayOffset: 3, slot: "soir", dishId: "gratin-courgettes" },
  // Day 4 (weekend cook day)
  { dayOffset: 4, slot: "midi", dishId: "pates-pesto-poulet" },
  { dayOffset: 4, slot: "soir", dishId: "lasagne" },
  // Day 5 (weekend)
  { dayOffset: 5, slot: "midi", dishId: "salade-poulet-avocat" },
  { dayOffset: 5, slot: "soir", dishId: "raclette" },
  // Day 6
  { dayOffset: 6, slot: "midi", dishId: "lasagne", batchOffset: 4 },
  { dayOffset: 6, slot: "soir", dishId: "soupe-potiron" },
  // Day 7
  { dayOffset: 7, slot: "midi", dishId: "curry-poulet" },
  { dayOffset: 7, slot: "soir", dishId: "bowl-saumon-avocat" },
  // Day 8
  { dayOffset: 8, slot: "midi", dishId: "curry-poulet", batchOffset: 7 },
  { dayOffset: 8, slot: "soir", dishId: "tarte-tomate-mozza" },
  // Day 9
  { dayOffset: 9, slot: "midi", dishId: "risotto-champignons" },
];

export const initialPlan: PlanEntry[] = PLAN_SEED.map((p) => ({
  date: iso(addDays(WINDOW_START, p.dayOffset)),
  slot: p.slot,
  dishId: p.dishId,
  batchOfDate: p.batchOffset !== undefined ? iso(addDays(WINDOW_START, p.batchOffset)) : undefined,
}));

// ------------------------------------------------------------
// Suggestions engine (mocked)
// ------------------------------------------------------------
export interface Suggestion {
  dish: Dish;
  reason: string;
  score: number;
  /** An existing cook still covers slots — finishing it beats cooking something new. */
  leftover?: boolean;
  /** Its cook is fully placed. Demoted, never removed — you may still want it. */
  exhausted?: boolean;
  /** Slots this dish's current cook still has to fill. */
  remaining?: number;
  /** Times it already sits on the window. */
  placed?: number;
}

/**
 * Mock: rank dishes by suitability for a slot on a given date, given the plan.
 *
 * Only ONE rule removes a dish: the weekday-midi hard constraint (must be
 * emportable + réchauffable). Everything else only moves it up or down — a plan
 * is a proposal, not a gate.
 *
 * - Rendement drives repetition: one cook covers N slots, so a dish already
 *   planned but not yet exhausted ranks FIRST; once exhausted it is demoted out
 *   of the shortlist but stays pickable (MAISON-BRIEF: "a large dish cooked once
 *   covers N slots").
 * - Boosts weather-plausible dishes, penalises component overlap (variété),
 *   boosts batch on weekend.
 *
 * `limit` widens the ranked pool — 6 is the inspiration default, more when browsing.
 */
export function suggestFor(date: Date, slot: Slot, plan: PlanEntry[], weather?: WeatherHint, limit = 6): Suggestion[] {
  const weekend = isWeekend(date);
  const isMidi = slot === "midi";

  // Count component usage across the window
  const compCount = new Map<string, number>();
  const dishCount = new Map<string, number>();
  for (const p of plan) {
    dishCount.set(p.dishId, (dishCount.get(p.dishId) ?? 0) + 1);
    const d = dishById(p.dishId);
    d?.modifiers.forEach((m) => compCount.set(m.name, (compCount.get(m.name) ?? 0) + 1));
  }

  const heat = weather?.heatwave ?? false;

  // flatMap, not map: the ONE hard rule drops the dish from the pool entirely.
  // Everything below only reorders.
  const scored: Suggestion[] = dishes.flatMap((dish) => {
    let s = 50;
    let reason = "";

    // The only hard rule: a weekday lunch has to travel and reheat.
    if (!weekend && isMidi && (!dish.emportable || !dish.rechauffable)) return [];

    // Rendement rules the repetition. One cook covers `rendement` slots:
    //  - some still open → finishing it beats cooking anew, so it leads
    //  - all placed      → demoted well out of the shortlist, but still pickable
    const placed = dishCount.get(dish.id) ?? 0;
    const remaining = dish.rendement - placed;
    const exhausted = remaining <= 0;

    // Density default
    if (slot === "midi" && dish.densite === "complet") s += 8;
    if (slot === "soir" && dish.densite === "léger") s += 8;
    // Heatwave overrides
    if (heat && dish.temperature === "froid") s += 15;
    if (heat && dish.temperature === "chaud") s -= 6;

    // Batch preference on weekend
    if (weekend && dish.tags?.includes("batch")) s += 10;

    // Effort constraint: weekday = no long dishes
    if (!weekend && dish.effort >= 4) s -= 12;

    // Variety, at component level (the pinned dish repeats, everything else varies)
    const overlap = dish.modifiers.reduce((acc, m) => acc + Math.min(2, compCount.get(m.name) ?? 0), 0);
    s -= overlap * 2;

    if (exhausted) {
      // Enough to leave the shortlist, not enough to vanish — you may still
      // deliberately want it twice.
      s -= 45;
      reason = `déjà ${placed}× sur la fenêtre`;
      return [{ dish, reason, score: s, exhausted: true, placed, remaining: 0 }];
    }

    const leftover = placed > 0;
    if (leftover) {
      // Outranks the component-overlap penalty it necessarily incurs against itself.
      s += 40;
      reason = `à écouler · ${remaining} créneau${remaining > 1 ? "x" : ""}`;
      return [{ dish, reason, score: s, leftover, remaining, placed }];
    }

    if (heat && dish.temperature === "froid") reason = "canicule → froid";
    else if (weekend && dish.tags?.includes("batch")) reason = "batch weekend";
    else reason = "";

    return { dish, reason, score: s, remaining };
  });

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

export interface WeatherHint {
  heatwave: boolean;
  label: string;
}

// Mocked coherence signals for the current window
export function coherenceSignals(plan: PlanEntry[]): Array<{ tone: "warn" | "info"; text: string }> {
  const compCount = new Map<string, number>();
  const proteinCount = new Map<string, number>();
  for (const p of plan) {
    const d = dishById(p.dishId);
    d?.modifiers.forEach((m) => {
      compCount.set(m.name, (compCount.get(m.name) ?? 0) + 1);
      if (m.role === "protéine") proteinCount.set(m.name, (proteinCount.get(m.name) ?? 0) + 1);
    });
  }

  const out: Array<{ tone: "warn" | "info"; text: string }> = [];
  proteinCount.forEach((n, name) => {
    if (n >= 4) out.push({ tone: "warn", text: `Beaucoup de ${name} cette fenêtre (${n} slots).` });
  });
  // Batch info
  const batchDishes = new Set(plan.filter((p) => !p.batchOfDate).map((p) => p.dishId).filter((id) => (dishById(id)?.rendement ?? 1) >= 2));
  if (batchDishes.size >= 2) out.push({ tone: "info", text: `${batchDishes.size} dishes en batch : couvrent plusieurs slots.` });

  // Weekend load
  const weekendEffort = plan
    .filter((p) => isWeekend(new Date(p.date)) && !p.batchOfDate)
    .reduce((a, p) => a + (dishById(p.dishId)?.effort ?? 0), 0);
  if (weekendEffort >= 10) out.push({ tone: "warn", text: `Charge cuisson weekend élevée (${weekendEffort}/15).` });
  else out.push({ tone: "info", text: `Charge cuisson weekend : ${weekendEffort}/15.` });

  return out;
}

// ------------------------------------------------------------
// Courses — staples + derived aggregation
// ------------------------------------------------------------
export interface StapleItem {
  name: string;
  qty: number;
  unit: Unit;
  category: string;
  checked: boolean;      // default = pre-checked (in the list)
}

export const staples: StapleItem[] = [
  { name: "pain", qty: 2, unit: "pièce", category: "Base", checked: true },
  { name: "lait", qty: 2, unit: "pièce", category: "Base", checked: true },
  { name: "café", qty: 1, unit: "pièce", category: "Base", checked: true },
  { name: "oeufs", qty: 12, unit: "pièce", category: "Base", checked: true },
  { name: "beurre", qty: 1, unit: "pièce", category: "Base", checked: true },
  { name: "yaourt", qty: 8, unit: "pièce", category: "Base", checked: false },
  { name: "banane", qty: 6, unit: "pièce", category: "Fruits", checked: true },
  { name: "pomme", qty: 6, unit: "pièce", category: "Fruits", checked: false },
];

export type ItemSource = "derived" | "staple" | "manual";
export interface CourseItem {
  key: string;
  name: string;
  qty: number;
  unit: Unit;
  category: string;
  source: ItemSource;
  checked: boolean;
  fromDishes?: string[]; // dish names contributing
}

const componentCategory = (role: Role, name: string): string => {
  if (role === "protéine") return "Protéines";
  if (role === "légume") return "Fruits & légumes";
  if (role === "féculent") return "Épicerie";
  if (role === "sauce" || role === "garniture") {
    if (["mozzarella", "gruyère", "parmesan", "fromage à raclette", "crème"].includes(name)) return "Frais";
    return "Épicerie";
  }
  return "Autres";
};

export function deriveCourses(plan: PlanEntry[], stapleState: StapleItem[], manual: CourseItem[]): CourseItem[] {
  // Only count cook events — a batch leftover reuses the same cook.
  const cookEvents = plan.filter((p) => !p.batchOfDate);
  const agg = new Map<string, { qty: number; unit: Unit; role: Role; dishes: Set<string> }>();

  for (const e of cookEvents) {
    const d = dishById(e.dishId);
    if (!d) continue;
    for (const m of d.modifiers) {
      const key = `${m.name}|${m.unit}`;
      const prev = agg.get(key);
      if (prev) {
        prev.qty += m.qty;
        prev.dishes.add(d.name);
      } else {
        agg.set(key, { qty: m.qty, unit: m.unit, role: m.role, dishes: new Set([d.name]) });
      }
    }
  }

  const derived: CourseItem[] = [];
  agg.forEach((v, key) => {
    const [name] = key.split("|");
    derived.push({
      key: `d:${key}`,
      name,
      qty: v.qty,
      unit: v.unit,
      category: componentCategory(v.role, name),
      source: "derived",
      checked: true,
      fromDishes: Array.from(v.dishes),
    });
  });

  const stapleItems: CourseItem[] = stapleState.map((s) => ({
    key: `s:${s.name}`,
    name: s.name,
    qty: s.qty,
    unit: s.unit,
    category: s.category,
    source: "staple",
    checked: s.checked,
  }));

  return [...derived, ...stapleItems, ...manual];
}

// ------------------------------------------------------------
// Anniversaires
// ------------------------------------------------------------
export type SliderRegistre = number; // 0 pudique — 100 complice
export type SliderChaleur = number;  // 0 sobre — 100 tendre
export type SliderHumour = number;   // 0 sincère — 100 taquin
export type SliderLongueur = number; // 0 bref — 100 développé

export interface Sliders {
  registre: SliderRegistre;
  chaleur: SliderChaleur;
  humour: SliderHumour;
  longueur: SliderLongueur;
}

export interface HistoryEntry {
  year: number;
  message: string;
}

export interface Person {
  id: string;
  name: string;
  dob: string;                // ISO
  langue: "fr" | "en";
  relation: string;           // free label ("maman", "beau-frère", "amie d'enfance"…)
  defaultSliders: Sliders;
  matiereLibre: string;       // free-form notes — the personalisation source
  history: HistoryEntry[];
}

// Fixed reference year used to compute "next birthday" — keeps mock stable.
export const REF_YEAR = TODAY.getFullYear();

export const people: Person[] = [
  {
    id: "leo",
    name: "Léo",
    dob: `${REF_YEAR - 34}-07-15`,
    langue: "fr",
    relation: "frère",
    defaultSliders: { registre: 78, chaleur: 60, humour: 80, longueur: 45 },
    matiereLibre:
      "Vient de déménager à Amsterdam pour un nouveau job (design d'interaction). On s'appelle presque tous les dimanches. En ce moment il apprend la guitare et il râle contre son voisin qui met du techno. Notre blague récurrente : le pain aux graines de sa mère qu'on planque quand il vient. On était partis rouler en Ardennes en septembre — souvenir des crêpes à minuit dans son van.",
    history: [
      { year: REF_YEAR - 1, message: "Frangin. 33 ans. On roule encore mieux ensemble. Bon anniversaire." },
      { year: REF_YEAR - 2, message: "Léo — tellement fier de ce que tu construis. Bises, à dimanche." },
    ],
  },
  {
    id: "maman",
    name: "Maman",
    dob: `${REF_YEAR - 68}-11-03`,
    langue: "fr",
    relation: "maman",
    defaultSliders: { registre: 35, chaleur: 90, humour: 20, longueur: 55 },
    matiereLibre:
      "Retraitée depuis deux ans, s'est mise au jardinage sérieusement — a réussi ses tomates cœur de boeuf cette année. Adore quand on lui envoie des photos des enfants sans qu'elle demande. Petit passage difficile en début d'année avec papa mais ça va mieux. Notre rituel : tarte aux pommes du dimanche.",
    history: [
      { year: REF_YEAR - 1, message: "Bon anniversaire maman. Merci pour tout, vraiment. On pense à toi très fort aujourd'hui." },
    ],
  },
  {
    id: "sophie",
    name: "Sophie",
    dob: `${REF_YEAR - 39}-08-22`,
    langue: "fr",
    relation: "amie d'enfance",
    defaultSliders: { registre: 90, chaleur: 55, humour: 95, longueur: 35 },
    matiereLibre:
      "20 ans qu'on se connaît. Bosse dans l'édition à Bruxelles. On a un running gag sur ses ex qui s'appellent tous Julien (elle en est à trois). Vient de finir son premier semi-marathon. Adore quand on lui envoie des memes de chats absurdes.",
    history: [
      { year: REF_YEAR - 1, message: "Sophie ! 38 ans, toujours aussi insupportable. Je t'aime. Bisou." },
      { year: REF_YEAR - 3, message: "Bon anniv la miss. RDV pour un verre très vite promis." },
    ],
  },
  {
    id: "papi",
    name: "Papi Jean",
    dob: `${REF_YEAR - 82}-02-14`,
    langue: "fr",
    relation: "grand-père",
    defaultSliders: { registre: 25, chaleur: 85, humour: 30, longueur: 40 },
    matiereLibre:
      "82 ans, encore autonome. Ancien menuisier, il a fabriqué le berceau des enfants. On l'appelle chaque semaine — il aime raconter la guerre et le jardin. Reçoit rarement des messages écrits, un vrai plaisir pour lui.",
    history: [],
  },
  {
    id: "clara",
    name: "Clara",
    dob: `${REF_YEAR - 8}-04-11`,
    langue: "fr",
    relation: "filleule",
    defaultSliders: { registre: 60, chaleur: 95, humour: 70, longueur: 25 },
    matiereLibre:
      "8 ans, en pleine phase 'je veux être vétérinaire ET astronaute'. On lui a offert des jumelles pour Noël, elle observe les oiseaux du balcon. Rire contagieux. On se voit peu (ses parents à Toulouse) mais on lit ensemble par visio le mardi soir.",
    history: [
      { year: REF_YEAR - 1, message: "Joyeux 7 ans à la meilleure astronaute-vétérinaire du monde 🚀🐕 Gros bisous ma Clara." },
    ],
  },
  {
    id: "tom",
    name: "Tom",
    dob: `${REF_YEAR - 42}-12-01`,
    langue: "fr",
    relation: "beau-frère",
    defaultSliders: { registre: 55, chaleur: 50, humour: 60, longueur: 30 },
    matiereLibre:
      "Beau-frère depuis 10 ans. On boit un scotch ensemble aux fêtes. Toujours un peu réservé mais fidèle en amitié. Vient de racheter une vieille moto qu'il retape dans son garage — projet du moment.",
    history: [],
  },
];

/** Age at the next birthday within REF_YEAR (assuming they turn on that date). */
export function upcomingAge(p: Person, at: Date = TODAY): number {
  const dob = new Date(p.dob);
  const next = new Date(at.getFullYear(), dob.getMonth(), dob.getDate());
  if (next < at) next.setFullYear(next.getFullYear() + 1);
  return next.getFullYear() - dob.getFullYear();
}

export function nextBirthday(p: Person, at: Date = TODAY): Date {
  const dob = new Date(p.dob);
  const next = new Date(at.getFullYear(), dob.getMonth(), dob.getDate());
  if (next < at) next.setFullYear(next.getFullYear() + 1);
  return next;
}

export function daysUntil(d: Date, from: Date = TODAY): number {
  return Math.round((d.getTime() - from.getTime()) / 86_400_000);
}

/**
 * Mocked message generator. Produces a plausible personal draft that
 * visibly changes with the sliders and with the free-text comment.
 *
 * The floor (sincere, never generic) is enforced by ALWAYS pulling one
 * concrete detail from matièreLibre.
 */
export function generateMessage(p: Person, s: Sliders, comment: string, seed = 0): string {
  const age = upcomingAge(p);
  // Extract a couple of concrete details from the free notes (sentence-level).
  const sentences = p.matiereLibre.split(/(?<=[.!?])\s+/).filter((x) => x.length > 6);
  const detailA = sentences[seed % Math.max(1, sentences.length)] ?? "";
  const detailB = sentences[(seed + 2) % Math.max(1, sentences.length)] ?? "";

  const opening =
    s.registre < 40
      ? `Bon anniversaire ${p.name}.`
      : s.registre < 75
      ? `Hey ${p.name} —`
      : `${p.name} !!`;

  const warmth =
    s.chaleur > 75
      ? " Je pense à toi très fort aujourd'hui."
      : s.chaleur > 45
      ? " On pense à toi aujourd'hui."
      : "";

  const humour =
    s.humour > 75
      ? ` ${age} ans — c'est officiel, tu es vieux/vieille (mais dans le bon sens).`
      : s.humour > 45
      ? ` ${age} ans, et toujours aussi toi.`
      : "";

  const personal =
    s.longueur > 60
      ? ` ${detailA} ${detailB}`
      : s.longueur > 30
      ? ` ${detailA}`
      : "";

  const closing =
    s.chaleur > 70
      ? " Je t'embrasse."
      : s.registre < 40
      ? " À très vite."
      : " Bisou.";

  let base = `${opening}${warmth}${humour}${personal}${closing}`.replace(/\s+/g, " ").trim();

  // Comment influence — a couple of trivial hooks so the effect is visible.
  const c = comment.trim().toLowerCase();
  if (c) {
    if (/(plus court|shorter|bref|court)/.test(c)) {
      base = `${opening}${humour || warmth} ${detailA}${closing}`.replace(/\s+/g, " ").trim();
    }
    if (/(plus long|développé|long)/.test(c)) {
      base = `${base} ${detailB}`.trim();
    }
    if (/(clin d'?oeil|nod|allusion) .+/.test(c)) {
      const m = c.match(/(?:clin d'?oeil|nod|allusion)\s+(?:à|to|au|a)?\s*(.+)/);
      if (m) base = `${base} Et bien sûr — un mot pour ${m[1]}.`;
    }
    if (/(humour|drôle|marrant|funnier)/.test(c)) {
      base = `${base} (Prépare-toi, l'année ${age} sera pire que la précédente.)`;
    }
  }

  return base;
}
