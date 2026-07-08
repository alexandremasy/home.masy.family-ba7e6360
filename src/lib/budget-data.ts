import {
  Home, Zap, Car, ShoppingBasket, Heart, Sparkles, Repeat,
  Music, PawPrint, Gift, Package, type LucideIcon,
} from "lucide-react";

export const MONTHS_FR = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];
export const MONTHS_FR_LONG = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];

export type CatKey =
  | "logement" | "energie" | "transport" | "alimentation" | "sante"
  | "personnel" | "abonnements" | "loisirs" | "animaux" | "cadeaux" | "divers";

export type Category = {
  key: CatKey;
  label: string;
  icon: LucideIcon;
  budget: number;
  actual: number;
  color: string; // CSS color (oklch)
  subs: { label: string; actual: number }[];
};

export const categories: Category[] = [
  { key: "logement", label: "Logement", icon: Home, budget: 1300, actual: 1320, color: "oklch(0.62 0.10 195)",
    subs: [{ label: "Loyer", actual: 1100 }, { label: "Charges", actual: 180 }, { label: "Entretien", actual: 40 }] },
  { key: "energie", label: "Énergie", icon: Zap, budget: 220, actual: 240, color: "oklch(0.74 0.14 65)",
    subs: [{ label: "Électricité", actual: 140 }, { label: "Gaz", actual: 100 }] },
  { key: "transport", label: "Transport", icon: Car, budget: 350, actual: 310, color: "oklch(0.74 0.13 35)",
    subs: [{ label: "Carburant", actual: 220 }, { label: "Parking", actual: 60 }, { label: "Entretien", actual: 30 }] },
  { key: "alimentation", label: "Alimentation", icon: ShoppingBasket, budget: 750, actual: 820, color: "oklch(0.68 0.13 145)",
    subs: [{ label: "Courses", actual: 620 }, { label: "Restaurants", actual: 140 }, { label: "Livraison", actual: 60 }] },
  { key: "sante", label: "Santé", icon: Heart, budget: 180, actual: 95, color: "oklch(0.70 0.14 10)",
    subs: [{ label: "Pharmacie", actual: 55 }, { label: "Médecin", actual: 40 }] },
  { key: "personnel", label: "Personnel", icon: Sparkles, budget: 150, actual: 210, color: "oklch(0.72 0.10 305)",
    subs: [{ label: "Soins", actual: 120 }, { label: "Vêtements", actual: 90 }] },
  { key: "abonnements", label: "Abonnements", icon: Repeat, budget: 90, actual: 90, color: "oklch(0.65 0.12 250)",
    subs: [{ label: "Netflix", actual: 18 }, { label: "Spotify", actual: 12 }, { label: "iCloud", actual: 10 }, { label: "Téléphone", actual: 50 }] },
  { key: "loisirs", label: "Loisirs", icon: Music, budget: 200, actual: 260, color: "oklch(0.70 0.13 100)",
    subs: [{ label: "Sorties", actual: 160 }, { label: "Cinéma", actual: 40 }, { label: "Livres", actual: 60 }] },
  { key: "animaux", label: "Animaux", icon: PawPrint, budget: 120, actual: 110, color: "oklch(0.66 0.10 50)",
    subs: [{ label: "Croquettes", actual: 80 }, { label: "Vétérinaire", actual: 30 }] },
  { key: "cadeaux", label: "Cadeaux", icon: Gift, budget: 50, actual: 30, color: "oklch(0.70 0.14 340)",
    subs: [{ label: "Anniversaires", actual: 30 }] },
  { key: "divers", label: "Divers", icon: Package, budget: 80, actual: 140, color: "oklch(0.55 0.02 220)",
    subs: [{ label: "Non catégorisé", actual: 140 }] },
];

export const rolling12 = [
  { m: "Juil", spend: 4150, income: 5200 },
  { m: "Août", spend: 4680, income: 5200 },
  { m: "Sep",  spend: 4100, income: 5200 },
  { m: "Oct",  spend: 4520, income: 5200 },
  { m: "Nov",  spend: 4610, income: 5200 },
  { m: "Déc",  spend: 4720, income: 7100 },
  { m: "Jan",  spend: 4080, income: 5200 },
  { m: "Fév",  spend: 4020, income: 5200 },
  { m: "Mar",  spend: 4380, income: 5200 },
  { m: "Avr",  spend: 4150, income: 5200 },
  { m: "Mai",  spend: 4200, income: 7880 },
  { m: "Juin", spend: 4400, income: 5200 },
];

export type Bill = { label: string; amount: number; kind?: "income" };
export const calendarBills: Record<number, Bill[]> = {
  0: [], 1: [],
  2: [{ label: "Eau (T1)", amount: 180 }],
  3: [],
  4: [{ label: "Pécule", amount: 2680, kind: "income" }],
  5: [], 6: [],
  7: [{ label: "Assurance habitation", amount: 420 }],
  8: [],
  9: [{ label: "Mazout", amount: 1100 }],
  10: [{ label: "Taxe de circulation", amount: 320 }],
  11: [{ label: "Prime", amount: 1900, kind: "income" }, { label: "Mutuelle", amount: 480 }],
};

export const envelopes = [
  { key: "annualisation", label: "Annualisation", contrib: 650, balance: 4100, tone: "primary" as const },
  { key: "projets",       label: "Projets",       contrib: 425, balance: 5100, tone: "accent"  as const },
  { key: "loisirs",       label: "Loisirs",       contrib: 425, balance: 2300, tone: "warm"    as const },
  { key: "pension",       label: "Pension",       contrib: 170, balance: 2040, tone: "primary" as const },
];

export const monthlyAnnualProvision = 650;
export const annualBalance = 4100;

export const incomeSources = [
  { label: "Salaires", value: 4600, color: "oklch(0.62 0.10 195)" },
  { label: "Allocations", value: 320, color: "oklch(0.72 0.12 145)" },
  { label: "Primes", value: 280, color: "oklch(0.74 0.14 65)" },
];

export const eur = (n: number) =>
  new Intl.NumberFormat("fr-BE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);

export const eur2 = (n: number) =>
  new Intl.NumberFormat("fr-BE", { style: "currency", currency: "EUR", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);

// ---------- Transactions (mock) ----------

export type Recurrence = "Mensuelle" | "Trimestrielle" | "Annuelle" | "Au besoin";
export type Provenance = "Importé" | "Édité";

export type Transaction = {
  id: string;
  date: string; // ISO yyyy-mm-dd
  label: string;
  category: CatKey;
  sub: string;
  amount: number; // negative = expense
  recurrence: Recurrence;
  provenance: Provenance;
};

// Stable 50-row mock for "this month"
const _today = new Date();
const _ym = (d: number) => {
  const dd = new Date(_today.getFullYear(), _today.getMonth(), d);
  return dd.toISOString().slice(0, 10);
};

export const transactionsSeed: Transaction[] = [
  { id: "t01", date: _ym(1),  label: "Loyer",                    category: "logement",    sub: "Loyer",         amount: -1100, recurrence: "Mensuelle", provenance: "Importé" },
  { id: "t02", date: _ym(2),  label: "Carrefour Drive",          category: "alimentation", sub: "Courses",      amount: -86.40, recurrence: "Au besoin", provenance: "Importé" },
  { id: "t03", date: _ym(2),  label: "Total Énergie - Élec",     category: "energie",     sub: "Électricité",   amount: -140,  recurrence: "Mensuelle", provenance: "Importé" },
  { id: "t04", date: _ym(3),  label: "Netflix",                  category: "abonnements", sub: "Netflix",       amount: -17.99, recurrence: "Mensuelle", provenance: "Importé" },
  { id: "t05", date: _ym(3),  label: "Spotify Family",           category: "abonnements", sub: "Spotify",       amount: -12.99, recurrence: "Mensuelle", provenance: "Importé" },
  { id: "t06", date: _ym(4),  label: "Colruyt",                  category: "alimentation", sub: "Courses",      amount: -64.20, recurrence: "Au besoin", provenance: "Importé" },
  { id: "t07", date: _ym(5),  label: "Pharmacie de la Place",    category: "sante",       sub: "Pharmacie",     amount: -22.30, recurrence: "Au besoin", provenance: "Importé" },
  { id: "t08", date: _ym(5),  label: "Q8 Carburant",             category: "transport",   sub: "Carburant",     amount: -78.50, recurrence: "Au besoin", provenance: "Importé" },
  { id: "t09", date: _ym(6),  label: "Restaurant Da Mimmo",      category: "alimentation", sub: "Restaurants",  amount: -56.00, recurrence: "Au besoin", provenance: "Importé" },
  { id: "t10", date: _ym(6),  label: "Gaz Naturel",              category: "energie",     sub: "Gaz",           amount: -100,  recurrence: "Mensuelle", provenance: "Importé" },
  { id: "t11", date: _ym(7),  label: "Carrefour",                category: "alimentation", sub: "Courses",      amount: -112.80, recurrence: "Au besoin", provenance: "Importé" },
  { id: "t12", date: _ym(7),  label: "Charges communes",         category: "logement",    sub: "Charges",       amount: -180,  recurrence: "Mensuelle", provenance: "Importé" },
  { id: "t13", date: _ym(8),  label: "Cinéma UGC",               category: "loisirs",     sub: "Cinéma",        amount: -28.00, recurrence: "Au besoin", provenance: "Importé" },
  { id: "t14", date: _ym(9),  label: "Vétérinaire — Mila",       category: "animaux",     sub: "Vétérinaire",   amount: -30.00, recurrence: "Au besoin", provenance: "Importé" },
  { id: "t15", date: _ym(9),  label: "Royal Canin 12kg",         category: "animaux",     sub: "Croquettes",    amount: -80.00, recurrence: "Trimestrielle", provenance: "Importé" },
  { id: "t16", date: _ym(10), label: "Bar à vin",                category: "loisirs",     sub: "Sorties",       amount: -42.50, recurrence: "Au besoin", provenance: "Importé" },
  { id: "t17", date: _ym(10), label: "Salaire net",              category: "divers",      sub: "Salaire",       amount: 4600,  recurrence: "Mensuelle", provenance: "Importé" },
  { id: "t18", date: _ym(11), label: "Carrefour",                category: "alimentation", sub: "Courses",      amount: -97.10, recurrence: "Au besoin", provenance: "Importé" },
  { id: "t19", date: _ym(11), label: "Coiffeur",                 category: "personnel",   sub: "Soins",         amount: -45.00, recurrence: "Au besoin", provenance: "Importé" },
  { id: "t20", date: _ym(12), label: "Zara",                     category: "personnel",   sub: "Vêtements",     amount: -89.90, recurrence: "Au besoin", provenance: "Importé" },
  { id: "t21", date: _ym(12), label: "Amazon — divers",          category: "divers",      sub: "Non catégorisé", amount: -34.99, recurrence: "Au besoin", provenance: "Importé" },
  { id: "t22", date: _ym(13), label: "Restaurant — Jules",       category: "alimentation", sub: "Restaurants",  amount: -84.00, recurrence: "Au besoin", provenance: "Édité" },
  { id: "t23", date: _ym(13), label: "Proximus Mobile",          category: "abonnements", sub: "Téléphone",     amount: -50.00, recurrence: "Mensuelle", provenance: "Importé" },
  { id: "t24", date: _ym(14), label: "Q8 Carburant",             category: "transport",   sub: "Carburant",     amount: -71.80, recurrence: "Au besoin", provenance: "Importé" },
  { id: "t25", date: _ym(14), label: "Parking Indigo",           category: "transport",   sub: "Parking",       amount: -60.00, recurrence: "Mensuelle", provenance: "Importé" },
  { id: "t26", date: _ym(15), label: "Allocations familiales",   category: "divers",      sub: "Allocations",   amount: 320,   recurrence: "Mensuelle", provenance: "Importé" },
  { id: "t27", date: _ym(15), label: "Colruyt",                  category: "alimentation", sub: "Courses",      amount: -78.40, recurrence: "Au besoin", provenance: "Importé" },
  { id: "t28", date: _ym(16), label: "iCloud+",                  category: "abonnements", sub: "iCloud",        amount: -9.99, recurrence: "Mensuelle", provenance: "Importé" },
  { id: "t29", date: _ym(16), label: "Médecin généraliste",      category: "sante",       sub: "Médecin",       amount: -40.00, recurrence: "Au besoin", provenance: "Importé" },
  { id: "t30", date: _ym(17), label: "Brico — petit outillage",  category: "logement",    sub: "Entretien",     amount: -40.00, recurrence: "Au besoin", provenance: "Importé" },
  { id: "t31", date: _ym(17), label: "Uber Eats",                category: "alimentation", sub: "Livraison",    amount: -32.50, recurrence: "Au besoin", provenance: "Importé" },
  { id: "t32", date: _ym(18), label: "Cadeau anniv Marie",       category: "cadeaux",     sub: "Anniversaires", amount: -30.00, recurrence: "Au besoin", provenance: "Importé" },
  { id: "t33", date: _ym(18), label: "Librairie Filigranes",     category: "loisirs",     sub: "Livres",        amount: -60.00, recurrence: "Au besoin", provenance: "Importé" },
  { id: "t34", date: _ym(19), label: "Carrefour",                category: "alimentation", sub: "Courses",      amount: -103.20, recurrence: "Au besoin", provenance: "Importé" },
  { id: "t35", date: _ym(19), label: "Total Carburant",          category: "transport",   sub: "Carburant",     amount: -69.90, recurrence: "Au besoin", provenance: "Importé" },
  { id: "t36", date: _ym(20), label: "Sorties bar",              category: "loisirs",     sub: "Sorties",       amount: -38.00, recurrence: "Au besoin", provenance: "Importé" },
  { id: "t37", date: _ym(20), label: "Soins esthétiques",        category: "personnel",   sub: "Soins",         amount: -75.00, recurrence: "Au besoin", provenance: "Édité" },
  { id: "t38", date: _ym(21), label: "Apple — divers",           category: "divers",      sub: "Non catégorisé", amount: -29.99, recurrence: "Au besoin", provenance: "Importé" },
  { id: "t39", date: _ym(22), label: "Carrefour",                category: "alimentation", sub: "Courses",      amount: -88.50, recurrence: "Au besoin", provenance: "Importé" },
  { id: "t40", date: _ym(22), label: "Restaurant — sushi",       category: "alimentation", sub: "Restaurants",  amount: -54.00, recurrence: "Au besoin", provenance: "Importé" },
];

export const RECURRENCES: Recurrence[] = ["Mensuelle", "Trimestrielle", "Annuelle", "Au besoin"];

export const importPreviewMock = {
  filename: "isavemoney-export-juin.xlsx",
  totals: { nouvelles: 12, inchangees: 38, modifiees: 3, protegees: 2 },
  modifiees: [
    { label: "Carrefour Drive", date: "2025-06-02", oldAmount: 86.4, newAmount: 92.1, category: "Alimentation › Courses" },
    { label: "Q8 Carburant", date: "2025-06-05", oldAmount: 78.5, newAmount: 82.0, category: "Transport › Carburant" },
    { label: "Restaurant Da Mimmo", date: "2025-06-06", oldAmount: 56.0, newAmount: 61.5, category: "Alimentation › Restaurants" },
  ],
  protegees: [
    { label: "Restaurant — Jules", date: "2025-06-13", amount: 84.0, category: "Alimentation › Restaurants" },
    { label: "Soins esthétiques", date: "2025-06-20", amount: 75.0, category: "Personnel › Soins" },
  ],
  nouvelles: [
    { label: "Decathlon", date: "2025-06-24", amount: -45.9, category: "Loisirs › Sport" },
    { label: "Brico Plan-it", date: "2025-06-25", amount: -22.3, category: "Logement › Entretien" },
    { label: "Boulangerie", date: "2025-06-25", amount: -8.4, category: "Alimentation › Courses" },
  ],
};

export const importHistory = [
  { filename: "isavemoney-export-mai.xlsx", date: "2025-06-01", month: "Mai 2025", added: 41, updated: 2 },
  { filename: "isavemoney-export-avril.xlsx", date: "2025-05-02", month: "Avril 2025", added: 38, updated: 1 },
  { filename: "isavemoney-export-mars.xlsx", date: "2025-04-03", month: "Mars 2025", added: 44, updated: 4 },
];

// ---------- Planification: recurring postes ----------

export type Recurrence4 = "Mensuelle" | "Trimestrielle" | "Annuelle" | "Au besoin";
export const RECURRENCES4: Recurrence4[] = ["Mensuelle", "Trimestrielle", "Annuelle", "Au besoin"];

export type Poste = {
  id: string;
  category: CatKey;
  sub: string;
  label: string;
  amount: number;        // unit amount per occurrence
  budget: number;        // planned budget per occurrence
  recurrence: Recurrence4;
  months: number[];      // 0..11 occurrences
};

export function defaultMonthsFor(rec: Recurrence4, anchor = 0): number[] {
  if (rec === "Mensuelle") return [0,1,2,3,4,5,6,7,8,9,10,11];
  if (rec === "Trimestrielle") {
    const base = ((anchor % 3) + 3) % 3;
    return [base, base + 3, base + 6, base + 9];
  }
  return [anchor];
}

export const postesSeed: Poste[] = [
  // Logement
  { id: "p01", category: "logement",    sub: "Loyer",                label: "Loyer",                amount: 1100, budget: 1100, recurrence: "Mensuelle",     months: defaultMonthsFor("Mensuelle") },
  { id: "p02", category: "logement",    sub: "Charges",              label: "Charges communes",     amount: 180,  budget: 180,  recurrence: "Mensuelle",     months: defaultMonthsFor("Mensuelle") },
  { id: "p03", category: "logement",    sub: "Eau",                  label: "Eau",                  amount: 180,  budget: 180,  recurrence: "Trimestrielle", months: defaultMonthsFor("Trimestrielle", 2) },
  { id: "p04", category: "logement",    sub: "Assurance",            label: "Assurance habitation", amount: 420,  budget: 420,  recurrence: "Annuelle",      months: [7] },
  { id: "p05", category: "logement",    sub: "Entretien",            label: "Petits travaux",       amount: 200,  budget: 250,  recurrence: "Au besoin",     months: [9] },
  // Énergie
  { id: "p10", category: "energie",     sub: "Électricité",          label: "Électricité",          amount: 140,  budget: 140,  recurrence: "Mensuelle",     months: defaultMonthsFor("Mensuelle") },
  { id: "p11", category: "energie",     sub: "Gaz",                  label: "Gaz",                  amount: 100,  budget: 100,  recurrence: "Mensuelle",     months: defaultMonthsFor("Mensuelle") },
  { id: "p12", category: "energie",     sub: "Mazout",               label: "Mazout",               amount: 1500, budget: 1500, recurrence: "Au besoin",     months: [9] },
  // Alimentation
  { id: "p20", category: "alimentation",sub: "Courses",              label: "Courses",              amount: 600,  budget: 650,  recurrence: "Mensuelle",     months: defaultMonthsFor("Mensuelle") },
  // Transport
  { id: "p30", category: "transport",   sub: "Carburant",            label: "Carburant",            amount: 220,  budget: 220,  recurrence: "Mensuelle",     months: defaultMonthsFor("Mensuelle") },
  { id: "p31", category: "transport",   sub: "Parking",              label: "Parking",              amount: 60,   budget: 60,   recurrence: "Mensuelle",     months: defaultMonthsFor("Mensuelle") },
  { id: "p32", category: "transport",   sub: "Taxe de circulation",  label: "Taxe de circulation",  amount: 320,  budget: 320,  recurrence: "Annuelle",      months: [10] },
  { id: "p33", category: "transport",   sub: "Entretien voiture",    label: "Entretien voiture",    amount: 600,  budget: 600,  recurrence: "Annuelle",      months: [3] },
  // Santé
  { id: "p40", category: "sante",       sub: "Mutuelle",             label: "Mutuelle",             amount: 480,  budget: 480,  recurrence: "Annuelle",      months: [11] },
  // Abonnements
  { id: "p50", category: "abonnements", sub: "Téléphone",            label: "Proximus Mobile",      amount: 50,   budget: 50,   recurrence: "Mensuelle",     months: defaultMonthsFor("Mensuelle") },
  { id: "p51", category: "abonnements", sub: "Netflix",              label: "Netflix",              amount: 18,   budget: 18,   recurrence: "Mensuelle",     months: defaultMonthsFor("Mensuelle") },
  { id: "p52", category: "abonnements", sub: "Spotify",              label: "Spotify",              amount: 13,   budget: 13,   recurrence: "Mensuelle",     months: defaultMonthsFor("Mensuelle") },
  { id: "p53", category: "abonnements", sub: "iCloud",               label: "iCloud+",              amount: 10,   budget: 10,   recurrence: "Mensuelle",     months: defaultMonthsFor("Mensuelle") },
  // Loisirs
  { id: "p60", category: "loisirs",     sub: "Sorties",              label: "Sorties & restos",     amount: 150,  budget: 200,  recurrence: "Mensuelle",     months: defaultMonthsFor("Mensuelle") },
  { id: "p61", category: "loisirs",     sub: "Vacances",             label: "Vacances été",         amount: 1800, budget: 1800, recurrence: "Annuelle",      months: [6] },
  // Animaux
  { id: "p70", category: "animaux",     sub: "Croquettes",           label: "Royal Canin 12kg",     amount: 80,   budget: 80,   recurrence: "Trimestrielle", months: defaultMonthsFor("Trimestrielle", 0) },
  // Cadeaux
  { id: "p80", category: "cadeaux",     sub: "Cadeaux fin d'année",  label: "Cadeaux fin d'année",  amount: 600,  budget: 600,  recurrence: "Annuelle",      months: [11] },
  // Divers
  { id: "p90", category: "divers",      sub: "Impôts",               label: "Solde impôts",         amount: 900,  budget: 900,  recurrence: "Annuelle",      months: [5] },
];

export const _now = new Date();
export const currentMonthIdx = _now.getMonth();
export const currentYear = _now.getFullYear();

export type TemporalState = "passe" | "en-cours" | "futur";
export function temporalState(monthIdx: number, year = currentYear): TemporalState {
  if (year < currentYear) return "passe";
  if (year > currentYear) return "futur";
  if (monthIdx < currentMonthIdx) return "passe";
  if (monthIdx === currentMonthIdx) return "en-cours";
  return "futur";
}

// Projected amount = sum of postes whose `months` includes this index.
export function projectedForMonth(postes: Poste[], idx: number): number {
  return postes.filter(p => p.months.includes(idx)).reduce((s, p) => s + p.amount, 0);
}
export function budgetForMonth(postes: Poste[], idx: number): number {
  return postes.filter(p => p.months.includes(idx)).reduce((s, p) => s + p.budget, 0);
}

// Non-monthly bills landing in `idx` (used for pressure strip projections).
export function nonMonthlyBills(postes: Poste[], idx: number) {
  return postes
    .filter(p => p.recurrence !== "Mensuelle" && p.months.includes(idx))
    .map(p => ({ label: p.label, amount: p.amount }));
}

// Monthly annualisation provision = (sum of all non-monthly amounts over the year) / 12.
export function annualisationProvision(postes: Poste[]): number {
  const total = postes
    .filter(p => p.recurrence !== "Mensuelle")
    .reduce((s, p) => s + p.amount * p.months.length, 0);
  return Math.round(total / 12);
}

// Real "actual" for past + part of current month — reuses the existing categories actuals
// (scaled to "en cours" partial progression for current month).
export function actualForMonth(idx: number, state: TemporalState): number {
  const fullMonth = categories.reduce((s, c) => s + c.actual, 0);
  if (state === "passe") return Math.round(fullMonth * (0.92 + (idx % 5) * 0.03));
  if (state === "en-cours") {
    const day = _now.getDate();
    const total = new Date(currentYear, currentMonthIdx + 1, 0).getDate();
    return Math.round(fullMonth * (day / total));
  }
  return 0;
}

/* ---------- Home helpers (Vue d'ensemble) ---------- */

// Verdict grammar — two axes, hierarchical (cause → consequence):
//   axis A (cause):       trajectory vs the spending budget (projectedTotal vs budgetYear)
//   axis B (consequence): does the projected net still cover the planned savings?
// Severity (color) is driven by the CONSEQUENCE; the label names the CAUSE.
// Overspending only matters to the extent it eats the épargne.
//   ok       → on budget AND savings covered            (green)
//   absorbed → over budget BUT savings still covered    (mustard — named, not alarming)
//   warn     → net positive but planned savings not met (terracotta — the overshoot bites)
//   over     → projected net negative — dissaving       (red — the only true alarm)
export type VerdictStatus = "ok" | "absorbed" | "warn" | "over";
export type AnnualVerdict = {
  status: VerdictStatus;
  label: string;
  hint: string;
  budgetYear: number;
  realisedYTD: number;
  projectedRest: number;
  projectedTotal: number;
  deltaEur: number;
  deltaPct: number;
  expectedByNow: number;
  netProjected: number;
  savingsRate: number;
  spendDeltaYTD: number;
  spendDeltaPct: number;
  savingsTarget: number;
  savingsOnTrack: boolean;
};

// Tolerance on the trajectory axis before an overshoot is "named" (plan: ±2 %).
const TRAJECTORY_TOLERANCE_PCT = 2;

export function annualVerdict(): AnnualVerdict {
  const monthlyBudget = categories.reduce((s, c) => s + c.budget, 0);
  const budgetYear = monthlyBudget * 12;
  let realisedYTD = 0;
  for (let i = 0; i <= currentMonthIdx; i++) {
    const st = temporalState(i);
    realisedYTD += rolling12[i]?.spend ?? actualForMonth(i, st);
  }
  let projectedRest = 0;
  for (let i = currentMonthIdx + 1; i < 12; i++) {
    projectedRest += projectedForMonth(postesSeed, i);
  }
  const day = _now.getDate();
  const daysInMonth = new Date(currentYear, currentMonthIdx + 1, 0).getDate();
  const remainingOfCurrent = Math.round(monthlyBudget * (1 - day / daysInMonth));
  const projectedTotal = realisedYTD + remainingOfCurrent + projectedRest;

  const deltaEur = projectedTotal - budgetYear;
  const deltaPct = (deltaEur / budgetYear) * 100;
  const expectedByNow = Math.round(budgetYear * ((currentMonthIdx + day / daysInMonth) / 12));

  const spendDeltaYTD = realisedYTD - expectedByNow;
  const spendDeltaPct = expectedByNow > 0 ? (spendDeltaYTD / expectedByNow) * 100 : 0;

  const totalIncome = rolling12.reduce((s, r) => s + r.income, 0);
  const netProjected = totalIncome - projectedTotal;
  const savingsRate = Math.max(0, Math.round((netProjected / totalIncome) * 100));

  const savingsTarget = envelopes.reduce((s, e) => s + e.contrib * 12, 0);
  const savingsOnTrack = netProjected >= savingsTarget;

  // Axis A — cause: is the spending trajectory over budget (beyond tolerance)?
  const overBudget = deltaPct > TRAJECTORY_TOLERANCE_PCT;
  // Axis B — consequence: deficit < 0 ≤ eating-into-savings < savingsTarget ≤ covered.
  const savingsGap = savingsTarget - netProjected;

  let status: VerdictStatus;
  let label: string;
  let hint: string;
  if (netProjected < 0) {
    status = "over";
    label = "Déficit projeté — on puise dans les réserves";
    hint = `Les dépenses projetées dépassent les revenus de l'année : net ${eur(netProjected)}. L'épargne recule.`;
  } else if (!savingsOnTrack) {
    status = "warn";
    label = overBudget ? "Le dépassement entame l'épargne" : "Épargne sous l'objectif";
    hint = overBudget
      ? `${deltaEur >= 0 ? "+" : ""}${eur(deltaEur)} vs budget dépenses : le net projeté (${eur(netProjected)}) ne couvre plus l'objectif d'épargne de ${eur(savingsTarget)} — il manque ${eur(savingsGap)}.`
      : `Dépenses dans le budget, mais le net projeté (${eur(netProjected)}) reste sous l'objectif d'épargne de ${eur(savingsTarget)} — il manque ${eur(savingsGap)}.`;
  } else if (overBudget) {
    status = "absorbed";
    label = "Dépassement absorbé — l'épargne tient";
    hint = `${eur(deltaEur)} au-dessus du budget dépenses, mais le net projeté (${eur(netProjected)}) couvre l'objectif d'épargne de ${eur(savingsTarget)}.`;
  } else {
    status = "ok";
    label = "Dans les clous";
    hint = `Trajectoire dans le budget et épargne sur objectif — net projeté ${eur(netProjected)}, objectif ${eur(savingsTarget)} couvert.`;
  }

  return {
    status, label, hint,
    budgetYear, realisedYTD, projectedRest: projectedRest + remainingOfCurrent,
    projectedTotal, deltaEur, deltaPct, expectedByNow,
    netProjected, savingsRate,
    spendDeltaYTD, spendDeltaPct,
    savingsTarget, savingsOnTrack,
  };
}

// Freshness stamp — a verdict is only as good as its last import ("no import → no
// monitoring"). Mock: last complete import = previous month. Real app: from /budget/imports.
export function dataFreshness(): { asOfLabel: string; lastImportLabel: string } {
  const asOfLabel = _now.toLocaleDateString("fr-BE", { day: "numeric", month: "long" });
  const lastIdx = (currentMonthIdx + 11) % 12;
  return { asOfLabel, lastImportLabel: `${MONTHS_FR_LONG[lastIdx].toLowerCase()} importé` };
}

// rolling12 is stored current-month-first; realign to calendar order (Jan..Déc).
function monthlyFlows(): { income: number; spend: number }[] {
  const byName = new Map(rolling12.map((r) => [r.m, r]));
  return MONTHS_FR.map((m) => {
    const r = byName.get(m);
    return { income: r?.income ?? 0, spend: r?.spend ?? 0 };
  });
}

// Graph A — cumulative income vs expense across the year, réalisé (solid) then
// projeté (dashed). The gap between the two curves = the year's savings capacity.
// Projection = the "en-cours" month carries both series so solid → dashed is seamless.
export function flowsSeries() {
  const flows = monthlyFlows();
  let cumIn = 0;
  let cumDep = 0;
  return MONTHS_FR.map((m, i) => {
    const st = temporalState(i);
    cumIn += flows[i].income;
    cumDep += flows[i].spend;
    const future = st === "futur";
    const bridge = future || st === "en-cours";
    return {
      m, idx: i,
      inReel: future ? null : cumIn,
      inProj: bridge ? cumIn : null,
      depReel: future ? null : cumDep,
      depProj: bridge ? cumDep : null,
    };
  });
}

// Graph B — the "bas de laine" (accumulated savings) across the year + its healthy
// floor. Pressure = how close the curve dips toward / below the floor.
// floorMonths = healthy reserve expressed in months of average spend (placeholder = 3,
// pending Alex's real threshold).
export function savingsStockSeries(floorMonths = 3) {
  const flows = monthlyFlows();
  const avgSpend = flows.reduce((s, f) => s + f.spend, 0) / 12;
  const floor = Math.round(avgSpend * floorMonths);
  const perEnv = envelopes.map((e) => envelopeSeries(e));
  const series = MONTHS_FR.map((m, i) => {
    const st = temporalState(i);
    const stock = perEnv.reduce((s, arr) => s + (arr[i]?.v ?? 0), 0);
    const future = st === "futur";
    const bridge = future || st === "en-cours";
    return { m, idx: i, reel: future ? null : stock, proj: bridge ? stock : null, floor };
  });
  const projectedEnd = series[11].proj ?? series[11].reel ?? 0;
  return { series, floor, projectedEnd, floorMonths };
}

export function cumulativeSeries() {
  const monthlyBudget = categories.reduce((s, c) => s + c.budget, 0);
  let cumReal = 0;
  let cumProj = 0;
  let cumBudget = 0;
  return MONTHS_FR.map((m, i) => {
    cumBudget += monthlyBudget;
    const st = temporalState(i);
    const spend = rolling12[i]?.spend ?? actualForMonth(i, st);
    if (st === "passe") {
      cumReal += spend;
      cumProj = cumReal;
    } else if (st === "en-cours") {
      cumReal += spend;
      cumProj = cumReal;
    } else {
      cumProj += projectedForMonth(postesSeed, i);
    }
    const isFuture = st === "futur";
    return {
      m,
      idx: i,
      reel: st === "futur" ? null : cumReal,
      // Junction point: the projection line starts AT the last real point ("en-cours"
      // month carries both), so réalisé → projeté reads as one continuous walk.
      projete: isFuture ? cumProj : st === "en-cours" ? cumReal : null,
      budget: cumBudget,
      tolMin: Math.round(cumBudget * 0.95),
      tolMax: Math.round(cumBudget * 1.05),
    };
  });
}

export type UpcomingBill = {
  id: string;
  monthIdx: number;
  monthLabel: string;
  label: string;
  category: CatKey;
  amount: number;
  monthsAway: number;
  provisionAvailable: number;
  coverage: "covered" | "partial" | "uncovered";
  coveragePct: number;
};

export function upcomingBigBills(n = 5, minAmount = 300): UpcomingBill[] {
  const provisionPerMonth = annualisationProvision(postesSeed);
  const results: UpcomingBill[] = [];
  const startBalance = annualBalance;
  for (let step = 0; step < 12 && results.length < n; step++) {
    const idx = (currentMonthIdx + step) % 12;
    const bills = postesSeed.filter(
      (p) => p.recurrence !== "Mensuelle" && p.months.includes(idx) && p.amount >= minAmount,
    );
    for (const b of bills) {
      const provisionAvailable = startBalance + provisionPerMonth * step;
      const coveragePct = Math.min(100, Math.round((provisionAvailable / b.amount) * 100));
      const coverage: UpcomingBill["coverage"] =
        coveragePct >= 100 ? "covered" : coveragePct >= 60 ? "partial" : "uncovered";
      results.push({
        id: b.id,
        monthIdx: idx,
        monthLabel: MONTHS_FR_LONG[idx],
        label: b.label,
        category: b.category,
        amount: b.amount,
        monthsAway: step,
        provisionAvailable,
        coverage,
        coveragePct,
      });
      if (results.length >= n) break;
    }
  }
  return results;
}

export function envelopeSeries(env: { key: string; balance: number; contrib: number }) {
  const seed = env.key.split("").reduce((s, c) => s + c.charCodeAt(0), 0);
  return Array.from({ length: 12 }, (_, i) => {
    const wobble = Math.sin((i + seed) * 0.9) * env.contrib * 0.35;
    const drain = i === 3 || i === 9 ? -env.contrib * 2.2 : 0;
    const base = Math.max(0, env.balance - env.contrib * (11 - i)) + wobble + drain;
    return { i, v: Math.max(0, Math.round(base)) };
  });
}

export function categoryTrend(cat: Category) {
  const seed = cat.key.split("").reduce((s, c) => s + c.charCodeAt(0), 0);
  return Array.from({ length: 6 }, (_, i) => ({
    i,
    v: Math.round(cat.actual * (0.82 + Math.sin((i + seed) * 0.7) * 0.16 + i * 0.02)),
  }));
}

export function nextBillForCategory(catKey: CatKey): { monthIdx: number; label: string; amount: number } | null {
  for (let step = 0; step < 12; step++) {
    const idx = (currentMonthIdx + step) % 12;
    const b = postesSeed.find(
      (p) => p.category === catKey && p.recurrence !== "Mensuelle" && p.months.includes(idx),
    );
    if (b) return { monthIdx: idx, label: b.label, amount: b.amount };
  }
  return null;
}

// Annual figures for a category, used by the year overview.
// ytdActual = cumul réalisé à date (mock : actual mensuel × mois écoulés + fraction du mois courant)
// annualBudget = budget mensuel × 12.
export function annualForCategory(cat: Category): { ytdActual: number; annualBudget: number } {
  const day = _now.getDate();
  const daysInMonth = new Date(currentYear, currentMonthIdx + 1, 0).getDate();
  const monthsFactor = currentMonthIdx + day / daysInMonth;
  return {
    ytdActual: Math.round(cat.actual * monthsFactor),
    annualBudget: cat.budget * 12,
  };
}



