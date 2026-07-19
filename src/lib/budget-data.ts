import {
  Home,
  Zap,
  Car,
  ShoppingBasket,
  Heart,
  Sparkles,
  Repeat,
  Music,
  PawPrint,
  Gift,
  Package,
  Wallet,
  PiggyBank,
  type LucideIcon,
} from "lucide-react";

export const MONTHS_FR = [
  "Jan",
  "Fév",
  "Mar",
  "Avr",
  "Mai",
  "Juin",
  "Juil",
  "Août",
  "Sep",
  "Oct",
  "Nov",
  "Déc",
];
export const MONTHS_FR_LONG = [
  "Janvier",
  "Février",
  "Mars",
  "Avril",
  "Mai",
  "Juin",
  "Juillet",
  "Août",
  "Septembre",
  "Octobre",
  "Novembre",
  "Décembre",
];

export type CatKey =
  | "logement"
  | "energie"
  | "transport"
  | "alimentation"
  | "sante"
  | "personnel"
  | "abonnements"
  | "loisirs"
  | "animaux"
  | "cadeaux"
  | "divers";

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
  {
    key: "logement",
    label: "Logement",
    icon: Home,
    budget: 1300,
    actual: 1320,
    color: "oklch(0.62 0.10 195)",
    subs: [
      { label: "Loyer", actual: 1100 },
      { label: "Charges", actual: 180 },
      { label: "Entretien", actual: 40 },
    ],
  },
  {
    key: "energie",
    label: "Énergie",
    icon: Zap,
    budget: 220,
    actual: 240,
    color: "oklch(0.74 0.14 65)",
    subs: [
      { label: "Électricité", actual: 140 },
      { label: "Gaz", actual: 100 },
    ],
  },
  {
    key: "transport",
    label: "Transport",
    icon: Car,
    budget: 350,
    actual: 310,
    color: "oklch(0.74 0.13 35)",
    subs: [
      { label: "Carburant", actual: 220 },
      { label: "Parking", actual: 60 },
      { label: "Entretien", actual: 30 },
    ],
  },
  {
    key: "alimentation",
    label: "Alimentation",
    icon: ShoppingBasket,
    budget: 750,
    actual: 820,
    color: "oklch(0.68 0.13 145)",
    subs: [
      { label: "Courses", actual: 620 },
      { label: "Restaurants", actual: 140 },
      { label: "Livraison", actual: 60 },
    ],
  },
  {
    key: "sante",
    label: "Santé",
    icon: Heart,
    budget: 180,
    actual: 95,
    color: "oklch(0.70 0.14 10)",
    subs: [
      { label: "Pharmacie", actual: 55 },
      { label: "Médecin", actual: 40 },
    ],
  },
  {
    key: "personnel",
    label: "Personnel",
    icon: Sparkles,
    budget: 150,
    actual: 210,
    color: "oklch(0.72 0.10 305)",
    subs: [
      { label: "Soins", actual: 120 },
      { label: "Vêtements", actual: 90 },
    ],
  },
  {
    key: "abonnements",
    label: "Abonnements",
    icon: Repeat,
    budget: 90,
    actual: 90,
    color: "oklch(0.65 0.12 250)",
    subs: [
      { label: "Netflix", actual: 18 },
      { label: "Spotify", actual: 12 },
      { label: "iCloud", actual: 10 },
      { label: "Téléphone", actual: 50 },
    ],
  },
  {
    key: "loisirs",
    label: "Loisirs",
    icon: Music,
    budget: 200,
    actual: 260,
    color: "oklch(0.70 0.13 100)",
    subs: [
      { label: "Sorties", actual: 160 },
      { label: "Cinéma", actual: 40 },
      { label: "Livres", actual: 60 },
    ],
  },
  {
    key: "animaux",
    label: "Animaux",
    icon: PawPrint,
    budget: 120,
    actual: 110,
    color: "oklch(0.66 0.10 50)",
    subs: [
      { label: "Croquettes", actual: 80 },
      { label: "Vétérinaire", actual: 30 },
    ],
  },
  {
    key: "cadeaux",
    label: "Cadeaux",
    icon: Gift,
    budget: 50,
    actual: 30,
    color: "oklch(0.70 0.14 340)",
    subs: [{ label: "Anniversaires", actual: 30 }],
  },
  {
    key: "divers",
    label: "Divers",
    icon: Package,
    budget: 80,
    actual: 140,
    color: "oklch(0.55 0.02 220)",
    subs: [{ label: "Non catégorisé", actual: 140 }],
  },
];

export const rolling12 = [
  { m: "Juil", spend: 4150, income: 5200 },
  { m: "Août", spend: 4680, income: 5200 },
  { m: "Sep", spend: 4100, income: 5200 },
  { m: "Oct", spend: 4520, income: 5200 },
  { m: "Nov", spend: 4610, income: 5200 },
  { m: "Déc", spend: 4720, income: 7100 },
  { m: "Jan", spend: 4080, income: 5200 },
  { m: "Fév", spend: 4020, income: 5200 },
  { m: "Mar", spend: 4380, income: 5200 },
  { m: "Avr", spend: 4150, income: 5200 },
  { m: "Mai", spend: 4200, income: 7880 },
  { m: "Juin", spend: 4400, income: 5200 },
];

export type Bill = { label: string; amount: number; kind?: "income" };
export const calendarBills: Record<number, Bill[]> = {
  0: [],
  1: [],
  2: [{ label: "Eau (T1)", amount: 180 }],
  3: [],
  4: [{ label: "Pécule", amount: 2680, kind: "income" }],
  5: [],
  6: [],
  7: [{ label: "Assurance habitation", amount: 420 }],
  8: [],
  9: [{ label: "Mazout", amount: 1100 }],
  10: [{ label: "Taxe de circulation", amount: 320 }],
  11: [
    { label: "Prime", amount: 1900, kind: "income" },
    { label: "Mutuelle", amount: 480 },
  ],
};

export const envelopes = [
  {
    key: "annualisation",
    label: "Annualisation",
    contrib: 650,
    balance: 4100,
    tone: "primary" as const,
  },
  { key: "projets", label: "Projets", contrib: 425, balance: 5100, tone: "mustard" as const },
  { key: "loisirs", label: "Loisirs", contrib: 425, balance: 2300, tone: "mustard" as const },
  { key: "pension", label: "Pension", contrib: 170, balance: 2040, tone: "primary" as const },
];

export const monthlyAnnualProvision = 650;
export const annualBalance = 4100;

export const incomeSources = [
  { label: "Salaires", value: 4600, color: "oklch(0.62 0.10 195)" },
  { label: "Allocations", value: 320, color: "oklch(0.72 0.12 145)" },
  { label: "Primes", value: 280, color: "oklch(0.74 0.14 65)" },
];

export const eur = (n: number) =>
  new Intl.NumberFormat("fr-BE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(n);

export const eur2 = (n: number) =>
  new Intl.NumberFormat("fr-BE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(n);

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
  {
    id: "t01",
    date: _ym(1),
    label: "Loyer",
    category: "logement",
    sub: "Loyer",
    amount: -1100,
    recurrence: "Mensuelle",
    provenance: "Importé",
  },
  {
    id: "t02",
    date: _ym(2),
    label: "Carrefour Drive",
    category: "alimentation",
    sub: "Courses",
    amount: -86.4,
    recurrence: "Au besoin",
    provenance: "Importé",
  },
  {
    id: "t03",
    date: _ym(2),
    label: "Total Énergie - Élec",
    category: "energie",
    sub: "Électricité",
    amount: -140,
    recurrence: "Mensuelle",
    provenance: "Importé",
  },
  {
    id: "t04",
    date: _ym(3),
    label: "Netflix",
    category: "abonnements",
    sub: "Netflix",
    amount: -17.99,
    recurrence: "Mensuelle",
    provenance: "Importé",
  },
  {
    id: "t05",
    date: _ym(3),
    label: "Spotify Family",
    category: "abonnements",
    sub: "Spotify",
    amount: -12.99,
    recurrence: "Mensuelle",
    provenance: "Importé",
  },
  {
    id: "t06",
    date: _ym(4),
    label: "Colruyt",
    category: "alimentation",
    sub: "Courses",
    amount: -64.2,
    recurrence: "Au besoin",
    provenance: "Importé",
  },
  {
    id: "t07",
    date: _ym(5),
    label: "Pharmacie de la Place",
    category: "sante",
    sub: "Pharmacie",
    amount: -22.3,
    recurrence: "Au besoin",
    provenance: "Importé",
  },
  {
    id: "t08",
    date: _ym(5),
    label: "Q8 Carburant",
    category: "transport",
    sub: "Carburant",
    amount: -78.5,
    recurrence: "Au besoin",
    provenance: "Importé",
  },
  {
    id: "t09",
    date: _ym(6),
    label: "Restaurant Da Mimmo",
    category: "alimentation",
    sub: "Restaurants",
    amount: -56.0,
    recurrence: "Au besoin",
    provenance: "Importé",
  },
  {
    id: "t10",
    date: _ym(6),
    label: "Gaz Naturel",
    category: "energie",
    sub: "Gaz",
    amount: -100,
    recurrence: "Mensuelle",
    provenance: "Importé",
  },
  {
    id: "t11",
    date: _ym(7),
    label: "Carrefour",
    category: "alimentation",
    sub: "Courses",
    amount: -112.8,
    recurrence: "Au besoin",
    provenance: "Importé",
  },
  {
    id: "t12",
    date: _ym(7),
    label: "Charges communes",
    category: "logement",
    sub: "Charges",
    amount: -180,
    recurrence: "Mensuelle",
    provenance: "Importé",
  },
  {
    id: "t13",
    date: _ym(8),
    label: "Cinéma UGC",
    category: "loisirs",
    sub: "Cinéma",
    amount: -28.0,
    recurrence: "Au besoin",
    provenance: "Importé",
  },
  {
    id: "t14",
    date: _ym(9),
    label: "Vétérinaire — Mila",
    category: "animaux",
    sub: "Vétérinaire",
    amount: -30.0,
    recurrence: "Au besoin",
    provenance: "Importé",
  },
  {
    id: "t15",
    date: _ym(9),
    label: "Royal Canin 12kg",
    category: "animaux",
    sub: "Croquettes",
    amount: -80.0,
    recurrence: "Trimestrielle",
    provenance: "Importé",
  },
  {
    id: "t16",
    date: _ym(10),
    label: "Bar à vin",
    category: "loisirs",
    sub: "Sorties",
    amount: -42.5,
    recurrence: "Au besoin",
    provenance: "Importé",
  },
  {
    id: "t17",
    date: _ym(10),
    label: "Salaire net",
    category: "divers",
    sub: "Salaire",
    amount: 4600,
    recurrence: "Mensuelle",
    provenance: "Importé",
  },
  {
    id: "t18",
    date: _ym(11),
    label: "Carrefour",
    category: "alimentation",
    sub: "Courses",
    amount: -97.1,
    recurrence: "Au besoin",
    provenance: "Importé",
  },
  {
    id: "t19",
    date: _ym(11),
    label: "Coiffeur",
    category: "personnel",
    sub: "Soins",
    amount: -45.0,
    recurrence: "Au besoin",
    provenance: "Importé",
  },
  {
    id: "t20",
    date: _ym(12),
    label: "Zara",
    category: "personnel",
    sub: "Vêtements",
    amount: -89.9,
    recurrence: "Au besoin",
    provenance: "Importé",
  },
  {
    id: "t21",
    date: _ym(12),
    label: "Amazon — divers",
    category: "divers",
    sub: "Non catégorisé",
    amount: -34.99,
    recurrence: "Au besoin",
    provenance: "Importé",
  },
  {
    id: "t22",
    date: _ym(13),
    label: "Restaurant — Jules",
    category: "alimentation",
    sub: "Restaurants",
    amount: -84.0,
    recurrence: "Au besoin",
    provenance: "Édité",
  },
  {
    id: "t23",
    date: _ym(13),
    label: "Proximus Mobile",
    category: "abonnements",
    sub: "Téléphone",
    amount: -50.0,
    recurrence: "Mensuelle",
    provenance: "Importé",
  },
  {
    id: "t24",
    date: _ym(14),
    label: "Q8 Carburant",
    category: "transport",
    sub: "Carburant",
    amount: -71.8,
    recurrence: "Au besoin",
    provenance: "Importé",
  },
  {
    id: "t25",
    date: _ym(14),
    label: "Parking Indigo",
    category: "transport",
    sub: "Parking",
    amount: -60.0,
    recurrence: "Mensuelle",
    provenance: "Importé",
  },
  {
    id: "t26",
    date: _ym(15),
    label: "Allocations familiales",
    category: "divers",
    sub: "Allocations",
    amount: 320,
    recurrence: "Mensuelle",
    provenance: "Importé",
  },
  {
    id: "t27",
    date: _ym(15),
    label: "Colruyt",
    category: "alimentation",
    sub: "Courses",
    amount: -78.4,
    recurrence: "Au besoin",
    provenance: "Importé",
  },
  {
    id: "t28",
    date: _ym(16),
    label: "iCloud+",
    category: "abonnements",
    sub: "iCloud",
    amount: -9.99,
    recurrence: "Mensuelle",
    provenance: "Importé",
  },
  {
    id: "t29",
    date: _ym(16),
    label: "Médecin généraliste",
    category: "sante",
    sub: "Médecin",
    amount: -40.0,
    recurrence: "Au besoin",
    provenance: "Importé",
  },
  {
    id: "t30",
    date: _ym(17),
    label: "Brico — petit outillage",
    category: "logement",
    sub: "Entretien",
    amount: -40.0,
    recurrence: "Au besoin",
    provenance: "Importé",
  },
  {
    id: "t31",
    date: _ym(17),
    label: "Uber Eats",
    category: "alimentation",
    sub: "Livraison",
    amount: -32.5,
    recurrence: "Au besoin",
    provenance: "Importé",
  },
  {
    id: "t32",
    date: _ym(18),
    label: "Cadeau anniv Marie",
    category: "cadeaux",
    sub: "Anniversaires",
    amount: -30.0,
    recurrence: "Au besoin",
    provenance: "Importé",
  },
  {
    id: "t33",
    date: _ym(18),
    label: "Librairie Filigranes",
    category: "loisirs",
    sub: "Livres",
    amount: -60.0,
    recurrence: "Au besoin",
    provenance: "Importé",
  },
  {
    id: "t34",
    date: _ym(19),
    label: "Carrefour",
    category: "alimentation",
    sub: "Courses",
    amount: -103.2,
    recurrence: "Au besoin",
    provenance: "Importé",
  },
  {
    id: "t35",
    date: _ym(19),
    label: "Total Carburant",
    category: "transport",
    sub: "Carburant",
    amount: -69.9,
    recurrence: "Au besoin",
    provenance: "Importé",
  },
  {
    id: "t36",
    date: _ym(20),
    label: "Sorties bar",
    category: "loisirs",
    sub: "Sorties",
    amount: -38.0,
    recurrence: "Au besoin",
    provenance: "Importé",
  },
  {
    id: "t37",
    date: _ym(20),
    label: "Soins esthétiques",
    category: "personnel",
    sub: "Soins",
    amount: -75.0,
    recurrence: "Au besoin",
    provenance: "Édité",
  },
  {
    id: "t38",
    date: _ym(21),
    label: "Apple — divers",
    category: "divers",
    sub: "Non catégorisé",
    amount: -29.99,
    recurrence: "Au besoin",
    provenance: "Importé",
  },
  {
    id: "t39",
    date: _ym(22),
    label: "Carrefour",
    category: "alimentation",
    sub: "Courses",
    amount: -88.5,
    recurrence: "Au besoin",
    provenance: "Importé",
  },
  {
    id: "t40",
    date: _ym(22),
    label: "Restaurant — sushi",
    category: "alimentation",
    sub: "Restaurants",
    amount: -54.0,
    recurrence: "Au besoin",
    provenance: "Importé",
  },
];

export const RECURRENCES: Recurrence[] = ["Mensuelle", "Trimestrielle", "Annuelle", "Au besoin"];

export const importPreviewMock = {
  filename: "isavemoney-export-juin.xlsx",
  totals: { nouvelles: 12, inchangees: 38, modifiees: 3, protegees: 2 },
  modifiees: [
    {
      label: "Carrefour Drive",
      date: "2025-06-02",
      oldAmount: 86.4,
      newAmount: 92.1,
      category: "Alimentation › Courses",
    },
    {
      label: "Q8 Carburant",
      date: "2025-06-05",
      oldAmount: 78.5,
      newAmount: 82.0,
      category: "Transport › Carburant",
    },
    {
      label: "Restaurant Da Mimmo",
      date: "2025-06-06",
      oldAmount: 56.0,
      newAmount: 61.5,
      category: "Alimentation › Restaurants",
    },
  ],
  protegees: [
    {
      label: "Restaurant — Jules",
      date: "2025-06-13",
      amount: 84.0,
      category: "Alimentation › Restaurants",
    },
    { label: "Soins esthétiques", date: "2025-06-20", amount: 75.0, category: "Personnel › Soins" },
  ],
  nouvelles: [
    { label: "Decathlon", date: "2025-06-24", amount: -45.9, category: "Loisirs › Sport" },
    { label: "Brico Plan-it", date: "2025-06-25", amount: -22.3, category: "Logement › Entretien" },
    { label: "Boulangerie", date: "2025-06-25", amount: -8.4, category: "Alimentation › Courses" },
  ],
};

export const importHistory = [
  {
    filename: "isavemoney-export-mai.xlsx",
    date: "2025-06-01",
    month: "Mai 2025",
    added: 41,
    updated: 2,
  },
  {
    filename: "isavemoney-export-avril.xlsx",
    date: "2025-05-02",
    month: "Avril 2025",
    added: 38,
    updated: 1,
  },
  {
    filename: "isavemoney-export-mars.xlsx",
    date: "2025-04-03",
    month: "Mars 2025",
    added: 44,
    updated: 4,
  },
];

// ---------- Planification: recurring postes ----------

export type Recurrence4 = "Mensuelle" | "Trimestrielle" | "Annuelle" | "Au besoin";
export const RECURRENCES4: Recurrence4[] = ["Mensuelle", "Trimestrielle", "Annuelle", "Au besoin"];

export type Poste = {
  id: string;
  category: CatKey;
  sub: string;
  label: string;
  amount: number; // unit amount per occurrence
  budget: number; // planned budget per occurrence
  recurrence: Recurrence4;
  months: number[]; // 0..11 occurrences
};

export function defaultMonthsFor(rec: Recurrence4, anchor = 0): number[] {
  if (rec === "Mensuelle") return [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  if (rec === "Trimestrielle") {
    const base = ((anchor % 3) + 3) % 3;
    return [base, base + 3, base + 6, base + 9];
  }
  return [anchor];
}

export const postesSeed: Poste[] = [
  // Logement
  {
    id: "p01",
    category: "logement",
    sub: "Loyer",
    label: "Loyer",
    amount: 1100,
    budget: 1100,
    recurrence: "Mensuelle",
    months: defaultMonthsFor("Mensuelle"),
  },
  {
    id: "p02",
    category: "logement",
    sub: "Charges",
    label: "Charges communes",
    amount: 180,
    budget: 180,
    recurrence: "Mensuelle",
    months: defaultMonthsFor("Mensuelle"),
  },
  {
    id: "p03",
    category: "logement",
    sub: "Eau",
    label: "Eau",
    amount: 180,
    budget: 180,
    recurrence: "Trimestrielle",
    months: defaultMonthsFor("Trimestrielle", 2),
  },
  {
    id: "p04",
    category: "logement",
    sub: "Assurance",
    label: "Assurance habitation",
    amount: 420,
    budget: 420,
    recurrence: "Annuelle",
    months: [7],
  },
  {
    id: "p05",
    category: "logement",
    sub: "Entretien",
    label: "Petits travaux",
    amount: 200,
    budget: 250,
    recurrence: "Au besoin",
    months: [9],
  },
  // Énergie
  {
    id: "p10",
    category: "energie",
    sub: "Électricité",
    label: "Électricité",
    amount: 140,
    budget: 140,
    recurrence: "Mensuelle",
    months: defaultMonthsFor("Mensuelle"),
  },
  {
    id: "p11",
    category: "energie",
    sub: "Gaz",
    label: "Gaz",
    amount: 100,
    budget: 100,
    recurrence: "Mensuelle",
    months: defaultMonthsFor("Mensuelle"),
  },
  {
    id: "p12",
    category: "energie",
    sub: "Mazout",
    label: "Mazout",
    amount: 1500,
    budget: 1500,
    recurrence: "Annuelle",
    months: [9],
  },
  // Alimentation
  {
    id: "p20",
    category: "alimentation",
    sub: "Courses",
    label: "Courses",
    amount: 600,
    budget: 650,
    recurrence: "Mensuelle",
    months: defaultMonthsFor("Mensuelle"),
  },
  // Transport
  {
    id: "p30",
    category: "transport",
    sub: "Carburant",
    label: "Carburant",
    amount: 220,
    budget: 220,
    recurrence: "Mensuelle",
    months: defaultMonthsFor("Mensuelle"),
  },
  {
    id: "p31",
    category: "transport",
    sub: "Parking",
    label: "Parking",
    amount: 60,
    budget: 60,
    recurrence: "Mensuelle",
    months: defaultMonthsFor("Mensuelle"),
  },
  {
    id: "p32",
    category: "transport",
    sub: "Taxe de circulation",
    label: "Taxe de circulation",
    amount: 320,
    budget: 320,
    recurrence: "Annuelle",
    months: [10],
  },
  {
    id: "p33",
    category: "transport",
    sub: "Entretien voiture",
    label: "Entretien voiture",
    amount: 600,
    budget: 600,
    recurrence: "Annuelle",
    months: [3],
  },
  // Santé
  {
    id: "p40",
    category: "sante",
    sub: "Mutuelle",
    label: "Mutuelle",
    amount: 480,
    budget: 480,
    recurrence: "Annuelle",
    months: [11],
  },
  // Abonnements
  {
    id: "p50",
    category: "abonnements",
    sub: "Téléphone",
    label: "Proximus Mobile",
    amount: 50,
    budget: 50,
    recurrence: "Mensuelle",
    months: defaultMonthsFor("Mensuelle"),
  },
  {
    id: "p51",
    category: "abonnements",
    sub: "Netflix",
    label: "Netflix",
    amount: 18,
    budget: 18,
    recurrence: "Mensuelle",
    months: defaultMonthsFor("Mensuelle"),
  },
  {
    id: "p52",
    category: "abonnements",
    sub: "Spotify",
    label: "Spotify",
    amount: 13,
    budget: 13,
    recurrence: "Mensuelle",
    months: defaultMonthsFor("Mensuelle"),
  },
  {
    id: "p53",
    category: "abonnements",
    sub: "iCloud",
    label: "iCloud+",
    amount: 10,
    budget: 10,
    recurrence: "Mensuelle",
    months: defaultMonthsFor("Mensuelle"),
  },
  // Loisirs
  {
    id: "p60",
    category: "loisirs",
    sub: "Sorties",
    label: "Sorties & restos",
    amount: 150,
    budget: 200,
    recurrence: "Mensuelle",
    months: defaultMonthsFor("Mensuelle"),
  },
  {
    id: "p61",
    category: "loisirs",
    sub: "Vacances",
    label: "Vacances été",
    amount: 1800,
    budget: 1800,
    recurrence: "Annuelle",
    months: [6],
  },
  // Animaux
  {
    id: "p70",
    category: "animaux",
    sub: "Croquettes",
    label: "Royal Canin 12kg",
    amount: 80,
    budget: 80,
    recurrence: "Trimestrielle",
    months: defaultMonthsFor("Trimestrielle", 0),
  },
  // Cadeaux
  {
    id: "p80",
    category: "cadeaux",
    sub: "Cadeaux fin d'année",
    label: "Cadeaux fin d'année",
    amount: 600,
    budget: 600,
    recurrence: "Annuelle",
    months: [11],
  },
  // Divers
  {
    id: "p90",
    category: "divers",
    sub: "Impôts",
    label: "Solde impôts",
    amount: 900,
    budget: 900,
    recurrence: "Annuelle",
    months: [5],
  },
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
  return postes.filter((p) => p.months.includes(idx)).reduce((s, p) => s + p.amount, 0);
}
export function budgetForMonth(postes: Poste[], idx: number): number {
  return postes.filter((p) => p.months.includes(idx)).reduce((s, p) => s + p.budget, 0);
}

// Non-monthly bills landing in `idx` (used for pressure strip projections).
export function nonMonthlyBills(postes: Poste[], idx: number) {
  return postes
    .filter((p) => p.recurrence !== "Mensuelle" && p.months.includes(idx))
    .map((p) => ({ label: p.label, amount: p.amount }));
}

// Monthly annualisation provision = (Σ annuel + Σ trimestriel) / 12.
// Alex's model (Budget-2024.xlsx, 🌅 K4): only the predictable-lumpy is smoothed.
// « Au besoin » is DELIBERATELY excluded — unpredictable, it hits the current flow when it
// lands, it is never provisioned. Mensuel is excluded too (already a flat flow).
export function annualisationProvision(postes: Poste[]): number {
  const total = postes
    .filter((p) => p.recurrence === "Trimestrielle" || p.recurrence === "Annuelle")
    .reduce((s, p) => s + p.amount * p.months.length, 0);
  return Math.round(total / 12);
}

// Recurring monthly income (the plan's top line).
export const monthlyIncome = incomeSources.reduce((s, i) => s + i.value, 0);

/* ==========================================================================
   PLANIFICATION — Alex's real taxonomy (from Budget-2024.xlsx 📅) and the
   prévu↔réel binding. A poste = a leaf sous-catégorie under a sous-groupe under
   a catégorie. Its réel is the 12 imported monthly actuals (the "data liées"
   that let you read cadence and set the payment month). Prévu is hand-set and
   never derived. NOTE: this is a representative EXTRACT of the real sheet (not
   all ~100 postes) and lives beside the other screens' `categories` until the
   whole budget section is unified onto this taxonomy at production time.
   ========================================================================== */

export type PlanKind = "entree" | "depense" | "epargne";

// "Ponctuel" = irregular dated occurrences with per-hit amounts. Unlike the 4 smoothable
// cadences (fixed amount × even spread), a ponctuel poste carries a list of {month, amount}:
// the primes case (pécule in May, 13e mois in December, different amounts). Predictable, so
// it enters the annual equilibrium — but it is NEVER provisioned (income lumps fund the year,
// they aren't smoothed like outgoing lumps).
export type PlanRecurrence = Recurrence4 | "Ponctuel";
export type PlanOccurrence = { m: number; amount: number }; // m = 0..11

export type PlanPoste = {
  id: string;
  cat: string; // catégorie (Logement, Famille, …)
  group: string; // sous-groupe (Énergies, Voiture, …)
  label: string; // poste (Mazout, Carburant, …)
  amount: number; // prévu per occurrence (per month for Mensuelle); ignored for Ponctuel
  recurrence: PlanRecurrence;
  months: number[]; // planned occurrence months (0..11) — kept in sync with occurrences for Ponctuel
  occurrences?: PlanOccurrence[]; // only for Ponctuel — dated, per-hit amounts (primes)
  sensor?: "mazout"; // physical-state signal surfaced beside the poste
};

// Annual prévu of a poste, in its own cadence. Ponctuel = Σ occurrence amounts; else amount × hits.
export function planPosteYear(p: PlanPoste): number {
  if (p.recurrence === "Ponctuel") return (p.occurrences ?? []).reduce((s, o) => s + o.amount, 0);
  if (p.recurrence === "Au besoin") return p.amount; // yearly envelope, no schedule
  return p.amount * p.months.length;
}

// Ordered category list (drives section order + icons). Family: Entrées first, dépenses
// in the middle, Épargne last — the plan's equilibrium reads top-to-bottom.
export const PLAN_CATS: { cat: string; icon: LucideIcon; kind: PlanKind }[] = [
  { cat: "Entrées", icon: Wallet, kind: "entree" },
  { cat: "Logement", icon: Home, kind: "depense" },
  { cat: "Famille", icon: Sparkles, kind: "depense" },
  { cat: "Déplacements", icon: Car, kind: "depense" },
  { cat: "Nourriture", icon: ShoppingBasket, kind: "depense" },
  { cat: "Santé & Soins", icon: Heart, kind: "depense" },
  { cat: "Cadeaux & Donations", icon: Gift, kind: "depense" },
  { cat: "Divers", icon: Package, kind: "depense" },
  { cat: "Épargne", icon: PiggyBank, kind: "epargne" },
];

const CAT_KIND = new Map<string, PlanKind>(PLAN_CATS.map((c) => [c.cat, c.kind]));
export const planKindOf = (p: PlanPoste): PlanKind => CAT_KIND.get(p.cat) ?? "depense";

export const planPostesSeed: PlanPoste[] = [
  // ---- Entrées ----
  {
    id: "e-sal",
    cat: "Entrées",
    group: "Revenus",
    label: "Salaires",
    amount: 4350,
    recurrence: "Mensuelle",
    months: defaultMonthsFor("Mensuelle"),
  },
  {
    id: "e-alloc",
    cat: "Entrées",
    group: "Revenus",
    label: "Allocations",
    amount: 320,
    recurrence: "Mensuelle",
    months: defaultMonthsFor("Mensuelle"),
  },
  {
    id: "e-palim",
    cat: "Entrées",
    group: "Revenus",
    label: "Pension alimentaire",
    amount: 200,
    recurrence: "Mensuelle",
    months: defaultMonthsFor("Mensuelle"),
  },
  {
    id: "e-prime",
    cat: "Entrées",
    group: "Revenus",
    label: "Primes",
    amount: 0,
    recurrence: "Ponctuel",
    months: [4, 11],
    occurrences: [
      { m: 4, amount: 2680 },
      { m: 11, amount: 1900 },
    ],
  },
  // ---- Logement ----
  {
    id: "l-hab",
    cat: "Logement",
    group: "Assurances",
    label: "Habitation",
    amount: 513,
    recurrence: "Annuelle",
    months: [7],
  },
  {
    id: "l-dec",
    cat: "Logement",
    group: "Assurances",
    label: "Décès",
    amount: 526,
    recurrence: "Annuelle",
    months: [9],
  },
  {
    id: "l-mai",
    cat: "Logement",
    group: "Crédits",
    label: "Maison",
    amount: 847,
    recurrence: "Mensuelle",
    months: defaultMonthsFor("Mensuelle"),
  },
  {
    id: "l-toit",
    cat: "Logement",
    group: "Crédits",
    label: "Toit & Bardage",
    amount: 89,
    recurrence: "Mensuelle",
    months: defaultMonthsFor("Mensuelle"),
  },
  {
    id: "l-elec",
    cat: "Logement",
    group: "Énergies",
    label: "Électricité",
    amount: 140,
    recurrence: "Mensuelle",
    months: defaultMonthsFor("Mensuelle"),
  },
  {
    id: "l-eau",
    cat: "Logement",
    group: "Énergies",
    label: "Eau",
    amount: 100,
    recurrence: "Trimestrielle",
    months: defaultMonthsFor("Trimestrielle", 2),
  },
  {
    id: "l-maz",
    cat: "Logement",
    group: "Énergies",
    label: "Mazout",
    amount: 1000,
    recurrence: "Annuelle",
    months: [9],
    sensor: "mazout",
  },
  {
    id: "l-pel",
    cat: "Logement",
    group: "Énergies",
    label: "Pellet",
    amount: 500,
    recurrence: "Annuelle",
    months: [10],
  },
  {
    id: "l-cad",
    cat: "Logement",
    group: "Taxes & Impôts",
    label: "Cadastre",
    amount: 150,
    recurrence: "Annuelle",
    months: [8],
  },
  {
    id: "l-pou",
    cat: "Logement",
    group: "Taxes & Impôts",
    label: "Poubelles",
    amount: 100,
    recurrence: "Annuelle",
    months: [10],
  },
  // ---- Famille ----
  {
    id: "f-pen",
    cat: "Famille",
    group: "Épargnes",
    label: "Pension",
    amount: 165,
    recurrence: "Mensuelle",
    months: defaultMonthsFor("Mensuelle"),
  },
  {
    id: "f-1pw",
    cat: "Famille",
    group: "Services",
    label: "1Password",
    amount: 115,
    recurrence: "Annuelle",
    months: [5],
  },
  {
    id: "f-net",
    cat: "Famille",
    group: "Services",
    label: "Internet",
    amount: 55,
    recurrence: "Mensuelle",
    months: defaultMonthsFor("Mensuelle"),
  },
  {
    id: "f-tel",
    cat: "Famille",
    group: "Services",
    label: "Téléphonie",
    amount: 40,
    recurrence: "Mensuelle",
    months: defaultMonthsFor("Mensuelle"),
  },
  {
    id: "f-coif",
    cat: "Famille",
    group: "Soins",
    label: "Coiffeur",
    amount: 40,
    recurrence: "Mensuelle",
    months: defaultMonthsFor("Mensuelle"),
  },
  {
    id: "f-ong",
    cat: "Famille",
    group: "Soins",
    label: "Ongles",
    amount: 25,
    recurrence: "Mensuelle",
    months: defaultMonthsFor("Mensuelle"),
  },
  {
    id: "f-netf",
    cat: "Famille",
    group: "Loisirs",
    label: "Netflix",
    amount: 19,
    recurrence: "Mensuelle",
    months: defaultMonthsFor("Mensuelle"),
  },
  {
    id: "f-spo",
    cat: "Famille",
    group: "Loisirs",
    label: "Spotify",
    amount: 15,
    recurrence: "Mensuelle",
    months: defaultMonthsFor("Mensuelle"),
  },
  {
    id: "f-spt",
    cat: "Famille",
    group: "Loisirs",
    label: "Sport",
    amount: 50,
    recurrence: "Mensuelle",
    months: defaultMonthsFor("Mensuelle"),
  },
  {
    id: "f-vac",
    cat: "Famille",
    group: "Loisirs",
    label: "Vacances",
    amount: 1500,
    recurrence: "Au besoin",
    months: [6],
  },
  // ---- Déplacements ----
  {
    id: "d-ass",
    cat: "Déplacements",
    group: "Voiture",
    label: "Assurance",
    amount: 127,
    recurrence: "Mensuelle",
    months: defaultMonthsFor("Mensuelle"),
  },
  {
    id: "d-car",
    cat: "Déplacements",
    group: "Voiture",
    label: "Carburant",
    amount: 90,
    recurrence: "Mensuelle",
    months: defaultMonthsFor("Mensuelle"),
  },
  {
    id: "d-ent",
    cat: "Déplacements",
    group: "Voiture",
    label: "Entretien",
    amount: 500,
    recurrence: "Annuelle",
    months: [3],
  },
  {
    id: "d-tax",
    cat: "Déplacements",
    group: "Voiture",
    label: "Taxe de circulation",
    amount: 340,
    recurrence: "Annuelle",
    months: [10],
  },
  {
    id: "d-par",
    cat: "Déplacements",
    group: "Voiture",
    label: "Parking",
    amount: 55,
    recurrence: "Au besoin",
    months: [0],
  },
  // ---- Nourriture ----
  {
    id: "n-cou",
    cat: "Nourriture",
    group: "Courses",
    label: "Courses",
    amount: 750,
    recurrence: "Mensuelle",
    months: defaultMonthsFor("Mensuelle"),
  },
  {
    id: "n-res",
    cat: "Nourriture",
    group: "Extérieur",
    label: "Restaurant",
    amount: 150,
    recurrence: "Mensuelle",
    months: defaultMonthsFor("Mensuelle"),
  },
  {
    id: "n-ani",
    cat: "Nourriture",
    group: "Animaux",
    label: "Animalerie",
    amount: 150,
    recurrence: "Mensuelle",
    months: defaultMonthsFor("Mensuelle"),
  },
  // ---- Santé & Soins ----
  {
    id: "s-cot",
    cat: "Santé & Soins",
    group: "Mutuelle",
    label: "Cotisation",
    amount: 300,
    recurrence: "Annuelle",
    months: [0],
  },
  {
    id: "s-kin",
    cat: "Santé & Soins",
    group: "Services",
    label: "Kinésithérapeute",
    amount: 280,
    recurrence: "Mensuelle",
    months: defaultMonthsFor("Mensuelle"),
  },
  {
    id: "s-ost",
    cat: "Santé & Soins",
    group: "Services",
    label: "Ostéopathe",
    amount: 400,
    recurrence: "Annuelle",
    months: [4],
  },
  {
    id: "s-vet",
    cat: "Santé & Soins",
    group: "Services",
    label: "Vétérinaire",
    amount: 200,
    recurrence: "Annuelle",
    months: [2],
  },
  {
    id: "s-pha",
    cat: "Santé & Soins",
    group: "Biens",
    label: "Pharmacie",
    amount: 50,
    recurrence: "Mensuelle",
    months: defaultMonthsFor("Mensuelle"),
  },
  // ---- Cadeaux & Donations ----
  {
    id: "c-fin",
    cat: "Cadeaux & Donations",
    group: "Occasions",
    label: "Cadeaux fin d'année",
    amount: 600,
    recurrence: "Annuelle",
    months: [11],
  },
  {
    id: "c-ann",
    cat: "Cadeaux & Donations",
    group: "Occasions",
    label: "Anniversaires",
    amount: 400,
    recurrence: "Au besoin",
    months: [3],
  },
  // ---- Divers ----
  {
    id: "x-vis",
    cat: "Divers",
    group: "Divers",
    label: "Visa",
    amount: 60,
    recurrence: "Mensuelle",
    months: defaultMonthsFor("Mensuelle"),
  },
  // ---- Épargne (cibles) ----
  {
    id: "s-proj",
    cat: "Épargne",
    group: "Enveloppes",
    label: "Projets",
    amount: 500,
    recurrence: "Mensuelle",
    months: defaultMonthsFor("Mensuelle"),
  },
  {
    id: "s-lois",
    cat: "Épargne",
    group: "Enveloppes",
    label: "Loisirs",
    amount: 300,
    recurrence: "Mensuelle",
    months: defaultMonthsFor("Mensuelle"),
  },
  {
    id: "s-pens",
    cat: "Épargne",
    group: "Enveloppes",
    label: "Pension (retraite)",
    amount: 165,
    recurrence: "Mensuelle",
    months: defaultMonthsFor("Mensuelle"),
  },
];

// Per-year plan. The household budget grows ~5%/yr, so past years read leaner and next year
// is seeded indexed-up from the current one. The year-suffixed id keeps each year's postes
// distinct and reshuffles the réel seed. Past = read-only archive; next year = editable draft
// (a "Préparation" you can fill before it starts). Only ±1 year of future — no far horizon.
export const PLAN_MIN_YEAR = currentYear - 3;
export const PLAN_MAX_YEAR = currentYear + 1;
export function planPostesForYear(year: number): PlanPoste[] {
  if (year === currentYear) return planPostesSeed;
  const factor = Math.pow(0.95, currentYear - year); // past → <1, next year → indexed up
  return planPostesSeed.map((p) => ({
    ...p,
    id: `${p.id}@${year}`,
    amount: Math.round(p.amount * factor),
    occurrences: p.occurrences?.map((o) => ({ ...o, amount: Math.round(o.amount * factor) })),
  }));
}

// Réel is IMPORTED data — independent of the plan. So it must anchor to the poste's seed
// baseline, never the live-edited prévu: editing the prévision must not move the réel (only
// the écart shifts). Resolves the unedited seed poste from the id (the `@year` suffix, or the
// current-year seed).
function baselinePoste(p: PlanPoste): PlanPoste {
  const [, ys] = p.id.split("@");
  const yr = ys ? Number(ys) : currentYear;
  return planPostesForYear(yr).find((x) => x.id === p.id) ?? p;
}

// The 12 imported monthly actuals for a poste (the "data liées"). Deterministic mock, anchored
// to the seed baseline (see above):
//   Mensuelle → ~flat with a small wobble; Trimestrielle → spikes at its occurrences;
//   Annuelle → one spike, possibly shifted ±1 month off the plan (things move — that shift
//   is exactly what you need to SEE to correct the payment month); Au besoin → scattered.
export function posteMonthly(p: PlanPoste): number[] {
  const b = baselinePoste(p);
  const seed = b.id.split("").reduce((s, c) => s + c.charCodeAt(0), 0);
  const out = new Array(12).fill(0);
  if (b.recurrence === "Mensuelle") {
    for (let i = 0; i < 12; i++)
      out[i] = Math.round(b.amount * (1 + Math.sin((i + seed) * 0.9) * 0.09));
  } else if (b.recurrence === "Trimestrielle") {
    b.months.forEach((m) => {
      out[m] = Math.round(b.amount * (1 + ((seed % 9) - 4) / 100));
    });
  } else if (b.recurrence === "Annuelle") {
    const planned = b.months[0] ?? 0;
    const shift = (seed % 3) - 1; // -1, 0, +1 → the real payment may drift
    const actual = (((planned + shift) % 12) + 12) % 12;
    out[actual] = Math.round(b.amount * (1 + ((seed % 11) - 4) / 100));
  } else if (b.recurrence === "Ponctuel") {
    // each dated occurrence lands at its month, may drift ±1
    (b.occurrences ?? []).forEach((o, k) => {
      const shift = ((seed + k) % 3) - 1;
      const actual = (((o.m + shift) % 12) + 12) % 12;
      out[actual] += Math.round(o.amount * (1 + (((seed + k) % 11) - 4) / 100));
    });
  } else {
    // Au besoin — scattered small hits
    const n = 2 + (seed % 3);
    for (let k = 0; k < n; k++) {
      const m = (seed * 7 + k * 5) % 12;
      out[m] += Math.round((b.amount / n) * (1 + (((seed + k) % 5) - 2) / 100));
    }
  }
  return out;
}

export const planReelYear = (p: PlanPoste): number => posteMonthly(p).reduce((s, v) => s + v, 0);
export const planPrevuYear = (p: PlanPoste): number => planPosteYear(p);

// The prévu spread over the 12 months (the plan as a monthly series, to compare against réel):
// Mensuelle → flat; Ponctuel → its dated occurrences; else → the amount at each occurrence month.
export function prevuMonthly(p: PlanPoste): number[] {
  const out = new Array(12).fill(0);
  if (p.recurrence === "Mensuelle") {
    for (let i = 0; i < 12; i++) out[i] = p.amount;
  } else if (p.recurrence === "Ponctuel") {
    (p.occurrences ?? []).forEach((o) => {
      out[o.m] += o.amount;
    });
  } else if (p.recurrence === "Au besoin") {
    /* envelope — no scheduled monthly prévu */
  } else {
    p.months.forEach((m) => {
      out[m] = p.amount;
    });
  } // Trimestrielle / Annuelle
  return out;
}

// Same poste, one calendar year earlier — to surface last year's réel beside this year's plan.
// Matches on the base id (strips the `@year` suffix planPostesForYear appends).
export function planPostePrevYear(p: PlanPoste, year: number): PlanPoste | undefined {
  const base = p.id.split("@")[0];
  return planPostesForYear(year - 1).find((x) => x.id.split("@")[0] === base);
}

// Median of the réel over the months where something actually landed (robust "typical hit",
// less skewed by an outlier month than the mean). Zero months are ignored.
export function planReelMedian(p: PlanPoste): number {
  const hits = posteMonthly(p)
    .filter((v) => v > 0)
    .sort((a, b) => a - b);
  if (!hits.length) return 0;
  const mid = Math.floor(hits.length / 2);
  return hits.length % 2 ? hits[mid] : Math.round((hits[mid - 1] + hits[mid]) / 2);
}
// Comparison figure on the poste's own cadence: per-occurrence (avg of hit months) for
// Mensuelle & Trimestrielle, year total for Annuelle & Au besoin. Like-for-like with prévu.
export function planReelCadence(p: PlanPoste): number {
  if (p.recurrence === "Mensuelle" || p.recurrence === "Trimestrielle") {
    const hits = posteMonthly(p).filter((v) => v > 0);
    return hits.length ? Math.round(hits.reduce((s, v) => s + v, 0) / hits.length) : 0;
  }
  return planReelYear(p);
}

// The PLAN's equilibrium (Budget-2024 🌅, at plan level — targets, not réel). It is an
// ANNUAL budget: Entrées − Dépenses − Épargne cibles = Marge, all summed over the year
// (each poste in its own cadence). Marge < 0 → the plan over-commits ("dans le rouge").
// `provision` (the monthly set-aside for the non-mensuel) and `auBesoin` are informational;
// au besoin is excluded from the equilibrium (it hits the margin when it lands).
export type PlanCascade = {
  entrees: number;
  depenses: number;
  epargne: number;
  marge: number; // annual €
  provision: number; // monthly set-aside (info)
  auBesoin: number; // annual, out of plan (info)
};
export function planCascade(postes: PlanPoste[]): PlanCascade {
  let entrees = 0,
    depenses = 0,
    epargne = 0,
    auBesoin = 0,
    provBase = 0;
  for (const p of postes) {
    const kind = planKindOf(p);
    const yearly = planPosteYear(p);
    if (kind === "entree") entrees += yearly;
    else if (kind === "epargne") epargne += yearly;
    else if (p.recurrence === "Au besoin") auBesoin += yearly;
    else {
      depenses += yearly;
      if (p.recurrence !== "Mensuelle") provBase += yearly;
    }
  }
  const marge = entrees - depenses - epargne;
  return { entrees, depenses, epargne, marge, provision: Math.round(provBase / 12), auBesoin };
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
  axes: {
    label: string;
    tone: "ok" | "warn" | "over";
    value: string;
    pct?: string;
    tag: string;
    explain: string;
  }[];
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
  reserveStart: number;
  reserveEnd: number;
  reserveFloor: number;
};

// Tolerance on the trajectory axis before an overshoot is "named" (plan: ±2 %).
const TRAJECTORY_TOLERANCE_PCT = 2;

export function annualVerdict(view: BudgetView = "rolling"): AnnualVerdict {
  const cells = horizonMonths(view);
  const horizonWord = view === "rolling" ? "sur les 12 mois" : "fin d'année";
  const monthlyBudget = categories.reduce((s, c) => s + c.budget, 0);
  const budgetYear = monthlyBudget * cells.length;

  // Realised = cells up to the last import; projection = the rest of the horizon.
  let realisedYTD = 0;
  let realisedIncome = 0;
  let projSpend = 0;
  let projIncome = 0;
  for (const c of cells) {
    if (c.isReal) {
      realisedYTD += c.spend;
      realisedIncome += c.income;
    } else {
      projSpend += c.spend;
      projIncome += c.income;
    }
  }
  const projectedTotal = realisedYTD + projSpend;
  const projectedIncome = realisedIncome + projIncome;
  const projectedRest = projSpend;

  const deltaEur = projectedTotal - budgetYear;
  const deltaPct = budgetYear > 0 ? (deltaEur / budgetYear) * 100 : 0;
  const realShare = cells.filter((c) => c.isReal).length / cells.length;
  const expectedByNow = Math.round(budgetYear * realShare);
  const spendDeltaYTD = realisedYTD - expectedByNow;
  const spendDeltaPct = expectedByNow > 0 ? (spendDeltaYTD / expectedByNow) * 100 : 0;

  const netProjected = projectedIncome - projectedTotal;
  const savingsRate =
    projectedIncome > 0 ? Math.max(0, Math.round((netProjected / projectedIncome) * 100)) : 0;

  // Reserve health — same trajectory as the Réserve chart (stock vs healthy floor).
  const stock = savingsStockSeries(view);
  const reserveStart = stock.series[0]?.reel ?? 0;
  const reserveEnd = stock.projectedEnd;
  const reserveFloor = stock.floor;
  const savingsTarget = envelopes.reduce((s, e) => s + e.contrib * 12, 0);
  const savingsOnTrack = reserveEnd >= reserveFloor;

  // Grammar: severity from the CONSEQUENCE (the reserve), label names the CAUSE (budget).
  const overBudget = deltaPct > TRAJECTORY_TOLERANCE_PCT;
  const draining = reserveEnd < reserveStart; // year ends with less than it started
  const belowFloor = reserveEnd < reserveFloor; // reserve too thin to be safe

  let status: VerdictStatus;
  let label: string;
  let hint: string;
  if (netProjected < 0 || draining) {
    status = "over";
    label = "On puise dans la réserve";
    hint = draining
      ? `La réserve finit l'année à ${eur(reserveEnd)}, sous son point de départ (${eur(reserveStart)}) — on désépargne.`
      : `Net annuel projeté négatif (${eur(netProjected)}) : les dépenses passent devant les revenus.`;
  } else if (belowFloor) {
    status = "warn";
    label = "Réserve sous le seuil sain";
    hint = `La réserve atterrit à ${eur(reserveEnd)}, sous le seuil sain de ${eur(reserveFloor)} — il manque ${eur(reserveFloor - reserveEnd)}.`;
  } else if (overBudget) {
    status = "absorbed";
    label = "Dépassement absorbé — réserve saine";
    hint = `${eur(deltaEur)} au-dessus du budget dépenses, mais la réserve tient au-dessus du seuil (${eur(reserveEnd)} ≥ ${eur(reserveFloor)}).`;
  } else {
    status = "ok";
    label = "Dans les clous";
    hint = `Trajectoire dans le budget et réserve saine — atterrissage ${eur(reserveEnd)}, seuil ${eur(reserveFloor)}.`;
  }

  // Two boxes. LEFT = the year's finances: how far off budget (combien) + how GRAVE it
  // is (gravity = the consequence on the reserve, not the size). RIGHT = the reserve:
  // where it lands at the current pace + is it healthy.
  const gravityWord =
    status === "over"
      ? "Critique"
      : status === "warn"
        ? "À surveiller"
        : status === "absorbed"
          ? "Absorbé"
          : "Sain";
  const gravityTone: "ok" | "warn" | "over" =
    status === "over" ? "over" : status === "warn" ? "warn" : "ok";
  const gravityExplain =
    status === "over"
      ? draining
        ? "Le dépassement fait reculer la réserve — on désépargne."
        : "Les dépenses passent devant les revenus — à corriger."
      : status === "warn"
        ? "Le dépassement fait tomber la réserve sous le seuil sain — à surveiller."
        : status === "absorbed"
          ? "Dépassement couvert par les revenus : on épargne moins, mais la réserve tient."
          : "Dépenses dans le budget, réserve saine — rien à signaler.";

  const axes: AnnualVerdict["axes"] = [
    {
      label: "Finances",
      tone: gravityTone,
      value: (deltaEur >= 0 ? "+" : "−") + eur(Math.abs(deltaEur)),
      pct: `${deltaPct >= 0 ? "+" : "−"}${Math.abs(deltaPct).toFixed(0)} %`,
      tag: gravityWord,
      explain: gravityExplain,
    },
    {
      label: "Réserve",
      tone: draining ? "over" : belowFloor ? "warn" : "ok",
      value: eur(reserveEnd),
      tag: draining ? "À risque" : belowFloor ? "À renforcer" : "Saine",
      explain: draining
        ? `Au rythme actuel, la réserve recule vers ${eur(reserveEnd)} ${horizonWord}, sous son point de départ (${eur(reserveStart)}).`
        : belowFloor
          ? `Au rythme actuel, la réserve atterrit à ${eur(reserveEnd)} ${horizonWord}, sous le seuil sain de ${eur(reserveFloor)}.`
          : `Au rythme actuel, la réserve atterrit à ${eur(reserveEnd)} ${horizonWord}, au-dessus du seuil sain de ${eur(reserveFloor)}.`,
    },
  ];

  return {
    status,
    label,
    hint,
    axes,
    budgetYear,
    realisedYTD,
    projectedRest,
    projectedTotal,
    deltaEur,
    deltaPct,
    expectedByNow,
    netProjected,
    savingsRate,
    spendDeltaYTD,
    spendDeltaPct,
    savingsTarget,
    savingsOnTrack,
    reserveStart,
    reserveEnd,
    reserveFloor,
  };
}

// Freshness — a verdict is only as good as its last import ("no import → no monitoring").
// Data runs through the last imported month; everything after is projection. Mock: the
// previous month. Real app: from /budget/imports.
export function dataFreshness(): { lastMonth: string } {
  const idx = lastImportedMonthIdx < 0 ? 11 : lastImportedMonthIdx;
  return { lastMonth: MONTHS_FR_LONG[idx].toLowerCase() };
}

// rolling12 is stored current-month-first; realign to calendar order (Jan..Déc).
function monthlyFlows(): { income: number; spend: number }[] {
  const byName = new Map(rolling12.map((r) => [r.m, r]));
  return MONTHS_FR.map((m) => {
    const r = byName.get(m);
    return { income: r?.income ?? 0, spend: r?.spend ?? 0 };
  });
}

// The projection boundary is the LAST IMPORT, NOT "now" — and imports may lag several
// months. Absolute-month arithmetic so a window can cross the year boundary.
export const IMPORT_LAG = 2; // mock: last import lags 'now' by N months (May when it's July)
export const currentAbs = currentYear * 12 + currentMonthIdx;
export const lastImportAbs = currentAbs - IMPORT_LAG;
// Same, as a 0..11 index in the current year (freshness / projection basis).
export const lastImportedMonthIdx = Math.max(-1, currentMonthIdx - IMPORT_LAG);

// Scheduled non-monthly events for a month (from calendarBills) split income / charge.
// These are what make the projection lumpy — some months charges > entrées → annualisation.
function lumpFor(i: number): { income: number; charge: number } {
  const bills = calendarBills[i] ?? [];
  return {
    income: bills.filter((b) => b.kind === "income").reduce((s, b) => s + b.amount, 0),
    charge: bills.filter((b) => b.kind !== "income").reduce((s, b) => s + b.amount, 0),
  };
}

// Projection basis — the recurring run-rate from the IMPORTED months only. Lumpy
// non-monthly events are added on top per month (lumpFor), so the projection is
// bumpy, not a smooth line. Recalculated every render → moves as imports land.
export function projectionBasis() {
  const flows = monthlyFlows();
  let inSum = 0;
  let depSum = 0;
  let n = 0;
  for (let i = 0; i <= lastImportedMonthIdx; i++) {
    inSum += flows[i].income;
    depSum += flows[i].spend;
    n++;
  }
  return {
    avgIncome: n ? Math.round(inSum / n) : 0,
    avgSpend: n ? Math.round(depSum / n) : 0,
    realizedMonths: n,
  };
}

export type BudgetView = "rolling" | number; // 'rolling' window, or a calendar year

export const viewTitle = (view: BudgetView): string =>
  view === "rolling" ? "Budget glissant" : `Année ${view}`;

export interface HorizonCell {
  label: string;
  calIdx: number;
  abs: number;
  isReal: boolean;
  isToday: boolean;
  isLastImport: boolean;
  income: number;
  spend: number;
}

// The ordered months for a view. Rolling = a 12-month window around now (5 back → 6
// ahead); a year = its 12 calendar months. Réel = up to the LAST IMPORT (which may lag
// 'now' by several months → those extra months are speculative). Projected months carry
// the run-rate + scheduled lumpy events (bumpy, not smooth).
export function horizonMonths(view: BudgetView): HorizonCell[] {
  const flows = monthlyFlows();
  const { avgIncome, avgSpend } = projectionBasis();
  const absList: number[] = [];
  if (view === "rolling") {
    for (let o = -5; o <= 6; o++) absList.push(currentAbs + o);
  } else {
    for (let i = 0; i < 12; i++) absList.push(view * 12 + i);
  }
  return absList.map((abs) => {
    const calIdx = ((abs % 12) + 12) % 12;
    const isReal = abs <= lastImportAbs;
    const lump = lumpFor(calIdx);
    return {
      label: MONTHS_FR[calIdx],
      calIdx,
      abs,
      isReal,
      isToday: abs === currentAbs,
      isLastImport: abs === lastImportAbs,
      income: isReal ? flows[calIdx].income : avgIncome + lump.income,
      spend: isReal ? flows[calIdx].spend : avgSpend + lump.charge,
    };
  });
}

// PER-MONTH TRIPLE flow (entrées / dépenses / épargne) over a view's horizon. NOT
// cumulative: a cumulative curve only ever rises, so épargne looks like it grows even in
// months that overspend — the reading Alex flagged as false. Monthly, a heavy month makes
// dépenses climb toward entrées and épargne dip, telling the same story as the month strip.
// The cumulative accumulation lives in the Réserve chart (savingsStockSeries) instead.
// Réel (solid) through the last import; projeté (dashed) after, bridged at the junction so
// the line reads as one continuous walk. épargne = the month's gap (income − spend).
export function flowsSeries(view: BudgetView = "rolling") {
  const cells = horizonMonths(view);
  let lastRealIdx = -1;
  cells.forEach((c, i) => {
    if (c.isReal) lastRealIdx = i;
  });
  return cells.map((c, i) => {
    const ep = Math.max(0, c.income - c.spend);
    const projected = !c.isReal;
    const bridge = projected || i === lastRealIdx; // projeté line starts at the last real point
    return {
      m: c.label,
      idx: i,
      calIdx: c.calIdx,
      year: Math.floor(c.abs / 12),
      isReal: c.isReal,
      isToday: c.isToday,
      isLastImport: c.isLastImport,
      spend: c.spend,
      income: c.income,
      inReel: projected ? null : c.income,
      inProj: bridge ? c.income : null,
      depReel: projected ? null : c.spend,
      depProj: bridge ? c.spend : null,
      epReel: projected ? null : ep,
      epProj: bridge ? ep : null,
    };
  });
}

// Monthly overview of the year — entrées / dépenses / épargne per month, calendar
// order. `rolling=true` returns a 12-month window ending at the current month (the
// data is already a rolling series, we just relabel). Future months flagged for styling.
export function monthlyOverview(rolling = false) {
  const flows = monthlyFlows();
  const rows = MONTHS_FR.map((m, i) => {
    const income = flows[i].income;
    const spend = flows[i].spend;
    return {
      m,
      idx: i,
      income,
      spend,
      epargne: Math.max(0, income - spend),
      state: temporalState(i),
    };
  });
  if (!rolling) return rows;
  // Rolling 12: window ending at current month → [current-11 … current].
  return Array.from({ length: 12 }, (_, k) => {
    const i = (currentMonthIdx - 11 + k + 12) % 12;
    return { ...rows[i], state: temporalState(i) };
  });
}

// Graph B — the "bas de laine" (accumulated savings) across the year + its healthy
// floor. Pressure = how close the curve dips toward / below the floor.
// floorMonths = healthy reserve expressed in months of average spend (placeholder = 3,
// pending Alex's real threshold).
// The reserve is DRIVEN by the flows: reserve = accumulated net (income − spend). It is
// anchored to the known balance at the last import (the envelopes total), then grows or
// shrinks with the projected net — so overspending visibly slows/erodes it, and the
// number is consistent with the flux curve (no independent mock).
export function savingsStockSeries(view: BudgetView = "rolling", floorMonths = 3) {
  const cells = horizonMonths(view);
  const flows = monthlyFlows();
  const avgSpend = flows.reduce((s, f) => s + f.spend, 0) / 12;
  const floor = Math.round(avgSpend * floorMonths);
  const anchor = envelopes.reduce((s, e) => s + e.balance, 0); // known reserve at the last import
  let lastRealIdx = -1;
  cells.forEach((c, i) => {
    if (c.isReal) lastRealIdx = i;
  });
  let cum = 0;
  const cums = cells.map((c) => (cum += c.income - c.spend));
  const cumAtAnchor = lastRealIdx >= 0 ? cums[lastRealIdx] : 0;
  const series = cells.map((c, i) => {
    const stock = Math.max(0, Math.round(anchor + cums[i] - cumAtAnchor));
    const projected = !c.isReal;
    const bridge = projected || i === lastRealIdx;
    return {
      m: c.label,
      idx: i,
      reel: projected ? null : stock,
      proj: bridge ? stock : null,
      floor,
    };
  });
  const last = series[series.length - 1];
  const projectedEnd = last.proj ?? last.reel ?? 0;
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

// Every non-monthly occurrence in the next `monthsAhead` months (all that the
// Planification defines beyond the monthly run-rate) — no amount floor, no count cap.
// Trimestrielle/annuelle postes appear once per occurrence inside the window.
export function upcomingBills(monthsAhead = 12): UpcomingBill[] {
  const provisionPerMonth = annualisationProvision(postesSeed);
  const startBalance = annualBalance;
  const results: UpcomingBill[] = [];
  for (let step = 0; step < monthsAhead; step++) {
    const idx = (currentMonthIdx + step) % 12;
    const bills = postesSeed.filter((p) => p.recurrence !== "Mensuelle" && p.months.includes(idx));
    for (const b of bills) {
      const provisionAvailable = startBalance + provisionPerMonth * step;
      const coveragePct = Math.min(100, Math.round((provisionAvailable / b.amount) * 100));
      const coverage: UpcomingBill["coverage"] =
        coveragePct >= 100 ? "covered" : coveragePct >= 60 ? "partial" : "uncovered";
      results.push({
        id: `${b.id}-${step}`,
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
    }
  }
  return results;
}

// Monthly balance history for an envelope — the reserve sparkline plots these REAL points
// (1 point = 1 month, coherent with the monthly timeline). Seeded ~8 months back, ending at the
// current month = `balance`. In the app, each manual reconciliation (or import) appends a month.
export function envelopeHistory(env: {
  key: string;
  balance: number;
  contrib: number;
}): { m: string; v: number }[] {
  const N = 8;
  const seed = env.key.split("").reduce((s, c) => s + c.charCodeAt(0), 0);
  return Array.from({ length: N }, (_, i) => {
    const back = N - 1 - i; // months before the current one
    const calIdx = (((currentMonthIdx - back) % 12) + 12) % 12;
    const wobble = Math.sin((i + seed) * 0.9) * env.contrib * 0.3;
    const v =
      back === 0 ? env.balance : Math.max(0, Math.round(env.balance - env.contrib * back + wobble));
    return { m: MONTHS_FR[calIdx], v };
  });
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

// 12-month glissant spend for a category — the trend the overview cares about ("où dépense-t-on
// plus ?"), split RÉEL (known, ≤ dernier import) vs PROJETÉ (anticipated, dashed after), same
// boundary as the flux/reserve. Deterministic, centered on the typical monthly `actual` with a
// per-category drift so the direction reads; `v` is the raw value (for the vs-budget average).
export function categoryTrend12(
  cat: Category,
): { m: string; v: number; real: number | null; proj: number | null }[] {
  const seed = cat.key.split("").reduce((s, c) => s + c.charCodeAt(0), 0);
  const slope = (((seed % 7) - 3) / 3) * cat.actual * 0.04; // per-month drift ≈ ±4% of actual
  const absList: number[] = [];
  for (let o = -5; o <= 6; o++) absList.push(currentAbs + o);
  let lastRealIdx = -1;
  absList.forEach((abs, i) => {
    if (abs <= lastImportAbs) lastRealIdx = i;
  });
  return absList.map((abs, i) => {
    const calIdx = ((abs % 12) + 12) % 12;
    const wobble = Math.sin((i + seed) * 0.8) * cat.actual * 0.06;
    // centre on (i - 5.5) so the MEAN stays ≈ actual (→ the "vs budget" chip is credible).
    const v = Math.max(0, Math.round(cat.actual + slope * (i - 5.5) + wobble));
    const projected = abs > lastImportAbs;
    const bridge = projected || i === lastRealIdx; // projeté line starts at the last real point
    return { m: MONTHS_FR[calIdx], v, real: projected ? null : v, proj: bridge ? v : null };
  });
}

// Year-over-year change for a category (this year vs last), deterministic mock. +% = on dépense
// plus que l'an dernier dans cette catégorie.
export function categoryYoY(cat: Category): number {
  const seed = cat.key.split("").reduce((s, c) => s + c.charCodeAt(0), 0);
  const factor = 0.85 + (seed % 28) / 100; // prior year = 0.85..1.12 × this year
  return Math.round((1 / factor - 1) * 100);
}

export function nextBillForCategory(
  catKey: CatKey,
): { monthIdx: number; label: string; amount: number } | null {
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
// ytdActual     = cumul réalisé à date (mock : actual mensuel × mois écoulés + fraction du mois courant)
// annualBudget  = budget mensuel × 12.
// expectedToDate = « où on devrait être aujourd'hui » = budget mensuel × mois écoulés → permet de
//                  lire le RYTHME (dérape-t-on ?) au lieu de comparer au budget annuel entier (qui,
//                  en milieu d'année, laisse tout paraître sous contrôle).
export function annualForCategory(cat: Category): {
  ytdActual: number;
  annualBudget: number;
  expectedToDate: number;
} {
  const day = _now.getDate();
  const daysInMonth = new Date(currentYear, currentMonthIdx + 1, 0).getDate();
  const monthsFactor = currentMonthIdx + day / daysInMonth;
  return {
    ytdActual: Math.round(cat.actual * monthsFactor),
    annualBudget: cat.budget * 12,
    expectedToDate: Math.round(cat.budget * monthsFactor),
  };
}
