import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip as RTooltip,
  XAxis,
  YAxis,
} from "recharts";
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
  ChevronLeft,
  ChevronRight,
  TrendingDown,
  TrendingUp,
  PiggyBank,
  Wallet,
  ArrowDownRight,
  ArrowUpRight,
  CalendarDays,
  Flame,
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { CountUp } from "@/components/CountUp";

export const Route = createFileRoute("/_app/budget")({
  component: BudgetPage,
  head: () => ({
    meta: [
      { title: "Budget — Maison" },
      { name: "description", content: "Vue d'ensemble du budget familial — prévu vs réel, évolution et enveloppes d'épargne." },
    ],
  }),
});

// ---------- Mock data ----------

const MONTHS_FR = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];
const MONTHS_FR_LONG = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];

type CatKey =
  | "logement" | "energie" | "transport" | "alimentation" | "sante"
  | "personnel" | "abonnements" | "loisirs" | "animaux" | "cadeaux" | "divers";

const categories: { key: CatKey; label: string; icon: typeof Home; budget: number; actual: number }[] = [
  { key: "logement",     label: "Logement",     icon: Home,           budget: 1300, actual: 1320 },
  { key: "energie",      label: "Énergie",      icon: Zap,            budget: 220,  actual: 240 },
  { key: "transport",    label: "Transport",    icon: Car,            budget: 350,  actual: 310 },
  { key: "alimentation", label: "Alimentation", icon: ShoppingBasket, budget: 750,  actual: 820 },
  { key: "sante",        label: "Santé",        icon: Heart,          budget: 180,  actual: 95 },
  { key: "personnel",    label: "Personnel",    icon: Sparkles,       budget: 150,  actual: 210 },
  { key: "abonnements",  label: "Abonnements",  icon: Repeat,         budget: 90,   actual: 90 },
  { key: "loisirs",      label: "Loisirs",      icon: Music,          budget: 200,  actual: 260 },
  { key: "animaux",      label: "Animaux",      icon: PawPrint,       budget: 120,  actual: 110 },
  { key: "cadeaux",      label: "Cadeaux",      icon: Gift,           budget: 50,   actual: 30 },
  { key: "divers",       label: "Divers",       icon: Package,        budget: 80,   actual: 140 },
];

// 12 mois glissants, current month = last
// Spend ~4000-4700, income ~5200, +2680 in May (pécule), +1900 in December (prime)
// Spend spikes on big-bill months: Mars (Eau), Août (Assurance), Octobre (Mazout), Novembre (Taxe), Décembre (Mutuelle)
const rolling = [
  { m: "Juil", spend: 4150, income: 5200 },
  { m: "Août", spend: 4680, income: 5200 }, // assurance habitation
  { m: "Sep",  spend: 4100, income: 5200 },
  { m: "Oct",  spend: 4520, income: 5200 }, // mazout
  { m: "Nov",  spend: 4610, income: 5200 }, // taxe voiture
  { m: "Déc",  spend: 4720, income: 7100 }, // prime + mutuelle
  { m: "Jan",  spend: 4080, income: 5200 },
  { m: "Fév",  spend: 4020, income: 5200 },
  { m: "Mar",  spend: 4380, income: 5200 }, // eau T1
  { m: "Avr",  spend: 4150, income: 5200 },
  { m: "Mai",  spend: 4200, income: 7880 }, // pécule
  { m: "Juin", spend: 4400, income: 5200 }, // current
];

// 12-month calendar pressure (calendar year Jan..Dec)
type Bill = { label: string; amount: number; kind?: "income" };
const calendarBills: Record<number, Bill[]> = {
  0: [],                                          // Jan
  1: [],                                          // Fév
  2: [{ label: "Eau (T1)", amount: 180 }],        // Mars
  3: [],                                          // Avr
  4: [{ label: "Pécule", amount: 2680, kind: "income" }], // Mai
  5: [],                                          // Juin
  6: [],                                          // Juil
  7: [{ label: "Assurance habitation", amount: 420 }], // Août
  8: [],                                          // Sep
  9: [{ label: "Mazout", amount: 1100 }],         // Oct
  10: [{ label: "Taxe de circulation", amount: 320 }], // Nov
  11: [{ label: "Prime", amount: 1900, kind: "income" }, { label: "Mutuelle", amount: 480 }], // Déc
};

const envelopes = [
  { key: "annualisation", label: "Annualisation", contrib: 650, balance: 4100, tone: "primary" as const },
  { key: "projets",       label: "Projets",       contrib: 425, balance: 5100, tone: "accent"  as const },
  { key: "loisirs",       label: "Loisirs",       contrib: 425, balance: 2300, tone: "warm"    as const },
  { key: "pension",       label: "Pension",       contrib: 170, balance: 2040, tone: "primary" as const },
];

const monthlyAnnualProvision = 650;
const annualBalance = 4100;

// ---------- helpers ----------

const eur = (n: number) =>
  new Intl.NumberFormat("fr-BE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);

// ---------- page ----------

function BudgetPage() {
  const now = new Date();
  const [monthOffset, setMonthOffset] = useState(0); // 0 = current
  const [rollingView, setRollingView] = useState(false);

  const viewDate = useMemo(() => {
    const d = new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
    return d;
  }, [monthOffset, now]);

  const monthLabel = `${MONTHS_FR_LONG[viewDate.getMonth()]} ${viewDate.getFullYear()}`;

  // KPIs (snapshot — same regardless of selected month in this prototype)
  const entrees = 5200;
  const depenses = categories.reduce((s, c) => s + c.actual, 0); // = 4625; close to 4400 brief — using sum for consistency
  const totalBudget = categories.reduce((s, c) => s + c.budget, 0);
  const provision = monthlyAnnualProvision;
  const net = entrees - depenses - provision;
  const epargne = envelopes.reduce((s, e) => s + e.contrib, 0); // 1670

  const kpis = [
    { label: "Entrées",  value: entrees,  delta: 0,    icon: ArrowDownRight, tone: "primary" as const },
    { label: "Dépenses", value: depenses, delta: depenses - totalBudget, icon: ArrowUpRight, tone: "warm" as const, invert: true },
    { label: "Net",      value: net,      delta: net,  icon: Wallet,         tone: "default" as const },
    { label: "Épargne",  value: epargne,  delta: 0,    icon: PiggyBank,      tone: "primary" as const },
  ];

  const sortedCats = [...categories].sort((a, b) => b.actual - a.actual);

  const avgSpend = Math.round(rolling.reduce((s, r) => s + r.spend, 0) / rolling.length);
  const currentIdx = rolling.length - 1;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Budget"
        subtitle="Vue d'ensemble du mois — prévu, réel, et ce qui arrive."
        action={
          <button
            type="button"
            onClick={() => setRollingView((v) => !v)}
            className={
              "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors " +
              (rollingView
                ? "border-foreground bg-foreground text-background"
                : "border-border bg-card text-muted-foreground hover:text-foreground")
            }
          >
            <CalendarDays className="h-3.5 w-3.5" />
            12 mois glissants
          </button>
        }
      />

      {/* Month selector */}
      <div className="flex items-center justify-between gap-3 rounded-2xl border border-border/60 bg-card px-4 py-3 shadow-soft">
        <button
          type="button"
          onClick={() => setMonthOffset((o) => o - 1)}
          className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          aria-label="Mois précédent"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="text-center">
          <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Période</p>
          <p className="font-serif text-lg capitalize tracking-tight">{monthLabel}</p>
        </div>
        <button
          type="button"
          onClick={() => setMonthOffset((o) => Math.min(0, o + 1))}
          disabled={monthOffset >= 0}
          className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground disabled:opacity-30 disabled:hover:bg-transparent"
          aria-label="Mois suivant"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 stagger sm:grid-cols-4">
        {kpis.map((k) => {
          const isPos = (k.invert ? -1 : 1) * k.delta >= 0;
          const Icon = k.icon;
          return (
            <div
              key={k.label}
              className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card p-5 shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{k.label}</p>
                <span
                  className={
                    "grid h-8 w-8 place-items-center rounded-full " +
                    (k.tone === "warm"
                      ? "bg-warm/15 text-warm"
                      : k.tone === "primary"
                      ? "bg-primary/10 text-primary"
                      : "bg-secondary text-foreground")
                  }
                >
                  <Icon className="h-4 w-4" />
                </span>
              </div>
              <p className="mt-3 font-serif text-3xl tracking-tight tabular-nums">
                <CountUp to={k.value} />
                <span className="ml-1 text-base text-muted-foreground">€</span>
              </p>
              {k.delta !== 0 && (
                <p
                  className={
                    "mt-1 inline-flex items-center gap-1 text-xs font-medium tabular-nums " +
                    (isPos ? "text-success" : "text-warm")
                  }
                >
                  {isPos ? <TrendingDown className="h-3 w-3" /> : <TrendingUp className="h-3 w-3" />}
                  {k.delta > 0 ? "+" : ""}{eur(k.delta)} vs prévu
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* CATEGORIES */}
      <section className="rounded-2xl border border-border/60 bg-card p-5 shadow-soft sm:p-7 anim-slide-up">
        <header className="mb-5 flex items-end justify-between gap-3">
          <div>
            <h2 className="font-serif text-2xl tracking-tight">Catégories</h2>
            <p className="mt-1 text-sm text-muted-foreground">Prévu vs réel — triées par dépense</p>
          </div>
          <p className="text-xs text-muted-foreground tabular-nums">
            {eur(depenses)} / {eur(totalBudget)}
          </p>
        </header>

        <ul className="space-y-2">
          {sortedCats.map((c, i) => (
            <CategoryRow key={c.key} cat={c} index={i} />
          ))}
        </ul>
      </section>

      {/* ROLLING 12M CHART */}
      <section className="rounded-2xl border border-border/60 bg-card p-5 shadow-soft sm:p-7 anim-slide-up">
        <header className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-serif text-2xl tracking-tight">Évolution</h2>
            <p className="mt-1 text-sm text-muted-foreground">12 derniers mois — entrées vs dépenses</p>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-primary" /> Entrées
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-warm" /> Dépenses
            </span>
            <span className="hidden items-center gap-1.5 sm:inline-flex">
              <span className="h-px w-4 border-t border-dashed border-muted-foreground/60" /> Moy.
            </span>
          </div>
        </header>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={rolling} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="gradIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradSpend" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--warm)" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="var(--warm)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="m"
                stroke="var(--muted-foreground)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="var(--muted-foreground)"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `${Math.round(v / 1000)}k`}
              />
              <RTooltip
                contentStyle={{
                  background: "var(--popover)",
                  border: "1px solid var(--border)",
                  borderRadius: 12,
                  fontSize: 12,
                  color: "var(--popover-foreground)",
                }}
                formatter={(v: number) => eur(v)}
                labelStyle={{ color: "var(--muted-foreground)", fontSize: 11 }}
              />
              <ReferenceLine
                y={avgSpend}
                stroke="var(--muted-foreground)"
                strokeDasharray="4 4"
                label={{ value: `Moy. ${eur(avgSpend)}`, position: "insideTopRight", fontSize: 10, fill: "var(--muted-foreground)" }}
              />
              <ReferenceLine
                x={rolling[currentIdx].m}
                stroke="var(--foreground)"
                strokeOpacity={0.25}
                strokeDasharray="2 4"
              />
              <Area
                type="monotone"
                dataKey="income"
                name="Entrées"
                stroke="var(--primary)"
                strokeWidth={2}
                fill="url(#gradIncome)"
              />
              <Area
                type="monotone"
                dataKey="spend"
                name="Dépenses"
                stroke="var(--warm)"
                strokeWidth={2}
                fill="url(#gradSpend)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* PRESSURE + ANNUALISATION */}
      <section className="grid gap-5 lg:grid-cols-3">
        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-soft sm:p-7 anim-slide-up lg:col-span-2">
          <header className="mb-5">
            <h2 className="font-serif text-2xl tracking-tight">Pression de l'année</h2>
            <p className="mt-1 text-sm text-muted-foreground">Calendrier des grosses échéances</p>
          </header>
          <PressureStrip />
        </div>

        <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-soft sm:p-7 anim-slide-up">
          <header className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="font-serif text-xl tracking-tight">Annualisation</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">Provision mensuelle</p>
            </div>
            <span className="grid h-9 w-9 place-items-center rounded-full bg-primary/10 text-primary">
              <Flame className="h-4 w-4 anim-breathe" />
            </span>
          </header>
          <p className="mt-2 font-serif text-4xl tracking-tight tabular-nums">
            <CountUp to={monthlyAnnualProvision} />
            <span className="ml-1 text-base text-muted-foreground">€/mois</span>
          </p>
          <div className="mt-5 rounded-xl bg-secondary/60 p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Solde actuel</p>
            <p className="mt-1 font-serif text-2xl tabular-nums">{eur(annualBalance)}</p>
            <p className="mt-2 text-xs text-muted-foreground">
              Lisse les grosses factures (mazout, assurance, taxes) pour qu'aucun mois ne soit écrasé.
            </p>
          </div>
        </div>
      </section>

      {/* ENVELOPES */}
      <section className="anim-slide-up">
        <header className="mb-4 flex items-end justify-between">
          <h2 className="font-serif text-2xl tracking-tight">Enveloppes d'épargne</h2>
          <p className="text-xs text-muted-foreground tabular-nums">{eur(epargne)}/mois</p>
        </header>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {envelopes.map((e) => (
            <EnvelopeCard key={e.key} env={e} />
          ))}
        </div>
      </section>
    </div>
  );
}

// ---------- subcomponents ----------

function CategoryRow({ cat, index }: { cat: typeof categories[number]; index: number }) {
  const [open, setOpen] = useState(false);
  const Icon = cat.icon;
  const pct = Math.min(100, (cat.actual / cat.budget) * 100);
  const over = cat.actual > cat.budget;
  const remaining = cat.budget - cat.actual;
  const overflowPct = over ? Math.min(60, ((cat.actual - cat.budget) / cat.budget) * 100) : 0;

  return (
    <li
      className={
        "group rounded-xl border bg-card/40 px-3 py-3 transition-all duration-300 hover:bg-secondary/40 " +
        (over ? "border-warm/30" : "border-border/40")
      }
      style={{ animationDelay: `${index * 30}ms` }}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-3 text-left"
      >
        <span
          className={
            "grid h-9 w-9 shrink-0 place-items-center rounded-full transition-colors " +
            (over ? "bg-warm/15 text-warm" : "bg-secondary text-foreground/70")
          }
        >
          <Icon className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <p className="truncate font-medium">{cat.label}</p>
            <p className="shrink-0 text-sm tabular-nums">
              <span className={over ? "text-warm font-semibold" : ""}>{eur(cat.actual)}</span>
              <span className="text-muted-foreground"> / {eur(cat.budget)}</span>
            </p>
          </div>
          <div className="relative mt-2 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className={
                "absolute inset-y-0 left-0 rounded-full transition-[width] duration-700 ease-out " +
                (over ? "bg-warm" : "bg-primary")
              }
              style={{ width: `${pct}%` }}
            />
            {over && (
              <div
                className="absolute inset-y-0 left-full rounded-r-full bg-warm/40 transition-[width] duration-700"
                style={{ width: `${overflowPct}%` }}
              />
            )}
          </div>
          <div className="mt-1.5 flex items-center justify-between text-[11px] tabular-nums">
            <span className="text-muted-foreground">{Math.round((cat.actual / cat.budget) * 100)}% du budget</span>
            <span className={over ? "text-warm" : "text-success"}>
              {over ? `+${eur(-remaining)} dépassement` : `${eur(remaining)} restant`}
            </span>
          </div>
        </div>
      </button>
      {open && (
        <div className="mt-3 grid gap-1.5 border-t border-border/40 pt-3 pl-12 text-xs text-muted-foreground anim-slide-up">
          <div className="flex justify-between"><span>Ligne récurrente</span><span className="tabular-nums">{eur(Math.round(cat.actual * 0.6))}</span></div>
          <div className="flex justify-between"><span>Variable</span><span className="tabular-nums">{eur(Math.round(cat.actual * 0.3))}</span></div>
          <div className="flex justify-between"><span>Exceptionnel</span><span className="tabular-nums">{eur(cat.actual - Math.round(cat.actual * 0.6) - Math.round(cat.actual * 0.3))}</span></div>
        </div>
      )}
    </li>
  );
}

function PressureStrip() {
  // Compute monthly pressure based on bills (excluding income)
  const pressure = MONTHS_FR.map((_, idx) => {
    const bills = calendarBills[idx] ?? [];
    const cost = bills.filter((b) => b.kind !== "income").reduce((s, b) => s + b.amount, 0);
    return cost;
  });
  const maxP = Math.max(...pressure, 1);

  return (
    <div className="grid grid-cols-6 gap-2 sm:grid-cols-12">
      {MONTHS_FR.map((m, idx) => {
        const bills = calendarBills[idx] ?? [];
        const cost = pressure[idx];
        const intensity = cost / maxP; // 0..1
        const isCurrent = idx === new Date().getMonth();
        return (
          <div
            key={m}
            className={
              "group relative flex flex-col rounded-xl border p-2 transition-all duration-300 hover:-translate-y-0.5 " +
              (isCurrent ? "border-foreground/60" : "border-border/40")
            }
            style={{
              background: `linear-gradient(180deg, color-mix(in oklab, var(--warm) ${Math.round(intensity * 22)}%, var(--card)) 0%, var(--card) 100%)`,
            }}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">{m}</span>
              {cost > 0 && (
                <span
                  className="inline-block h-1.5 w-1.5 rounded-full"
                  style={{ background: `color-mix(in oklab, var(--warm) ${30 + intensity * 70}%, transparent)` }}
                  aria-hidden
                />
              )}
            </div>
            <div className="mt-1.5 flex flex-1 flex-col gap-1">
              {bills.length === 0 && (
                <span className="text-[10px] text-muted-foreground/50">—</span>
              )}
              {bills.map((b) => (
                <span
                  key={b.label}
                  className={
                    "truncate rounded-md px-1.5 py-0.5 text-[10px] font-medium leading-tight " +
                    (b.kind === "income"
                      ? "bg-success/15 text-success"
                      : "bg-warm/15 text-warm")
                  }
                  title={`${b.label} · ${eur(b.amount)}`}
                >
                  {b.label}
                </span>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function EnvelopeCard({ env }: { env: typeof envelopes[number] }) {
  // Sparkline showing balance growth over 12 months
  const data = useMemo(() => {
    const start = Math.max(0, env.balance - env.contrib * 11);
    return Array.from({ length: 12 }, (_, i) => ({ i, v: start + env.contrib * i + Math.sin(i * 1.3) * env.contrib * 0.15 }));
  }, [env]);

  const toneRing =
    env.tone === "warm"
      ? "bg-warm/15 text-warm"
      : env.tone === "accent"
      ? "bg-accent/20 text-accent-foreground"
      : "bg-primary/10 text-primary";

  const stroke =
    env.tone === "warm" ? "var(--warm)" : env.tone === "accent" ? "var(--accent)" : "var(--primary)";

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card p-5 shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">{env.label}</p>
        <span className={"grid h-8 w-8 place-items-center rounded-full " + toneRing}>
          <PiggyBank className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-3 font-serif text-2xl tracking-tight tabular-nums">
        <CountUp to={env.balance} /><span className="ml-1 text-sm text-muted-foreground">€</span>
      </p>
      <p className="mt-0.5 text-xs text-muted-foreground tabular-nums">+ {eur(env.contrib)} / mois</p>

      <div className="-mx-2 mt-3 h-10">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
            <defs>
              <linearGradient id={`env-${env.key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={stroke} stopOpacity={0.3} />
                <stop offset="100%" stopColor={stroke} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area type="monotone" dataKey="v" stroke={stroke} strokeWidth={1.5} fill={`url(#env-${env.key})`} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
