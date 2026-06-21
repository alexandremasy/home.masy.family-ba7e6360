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
