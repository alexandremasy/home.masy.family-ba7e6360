import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, ArrowDownRight, ArrowUpRight, PiggyBank, Filter, X, TrendingDown, TrendingUp } from "lucide-react";
import { CountUp } from "@/components/CountUp";
import {
  categories, calendarBills, envelopes, incomeSources,
  monthlyAnnualProvision, MONTHS_FR_LONG, eur,
  type Category, type CatKey,
} from "@/lib/budget-data";
import { Button } from "@/components/ui/button";
import { BudgetBar } from "@/components/BudgetBar";
import { Eyebrow } from "@/components/Eyebrow";
import { Panel } from "@/components/Card";

export const Route = createFileRoute("/_app/budget/mensuel")({
  component: MensuelPage,
  head: () => ({
    meta: [
      { title: "Mensuel — Budget" },
      { name: "description", content: "Vue mensuelle : entrées, dépenses, prévu vs réel et catégories." },
    ],
  }),
});

function MensuelPage() {
  const now = new Date();
  const [monthOffset, setMonthOffset] = useState(0);
  const [rolling, setRolling] = useState(false);
  const [focusCat, setFocusCat] = useState<CatKey | null>(null);
  const [showOver, setShowOver] = useState(false);
  const [showPlanned, setShowPlanned] = useState(true);

  const viewDate = useMemo(
    () => new Date(now.getFullYear(), now.getMonth() + monthOffset, 1),
    [monthOffset, now],
  );
  const monthLabel = `${MONTHS_FR_LONG[viewDate.getMonth()]} ${viewDate.getFullYear()}`;

  const filtered = focusCat ? categories.filter((c) => c.key === focusCat) : categories;
  const entrees = incomeSources.reduce((s, i) => s + i.value, 0);
  const depenses = filtered.reduce((s, c) => s + c.actual, 0);
  const budget = filtered.reduce((s, c) => s + c.budget, 0);
  const provision = monthlyAnnualProvision;
  const net = entrees - categories.reduce((s, c) => s + c.actual, 0) - provision;
  const epargne = envelopes.reduce((s, e) => s + e.contrib, 0);

  // KPI deltas vs prévu
  const totalActual = categories.reduce((s, c) => s + c.actual, 0);
  const totalBudget = categories.reduce((s, c) => s + c.budget, 0);
  const expenseDelta = totalActual - totalBudget;

  const bills = calendarBills[viewDate.getMonth()] ?? [];

  return (
    <div className="space-y-8 anim-slide-up">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Eyebrow size="xs">Budget · Mensuel</Eyebrow>
          <h1 className="mt-1 font-serif text-3xl tracking-tight sm:text-4xl capitalize">{monthLabel}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline" size="iconRound"
            onClick={() => setMonthOffset((o) => o - 1)}
            aria-label="Mois précédent"
          ><ChevronLeft className="h-4 w-4" /></Button>
          <Button
            variant="outline" size="iconRound"
            onClick={() => setMonthOffset((o) => Math.min(0, o + 1))}
            disabled={monthOffset >= 0}
            aria-label="Mois suivant"
          ><ChevronRight className="h-4 w-4" /></Button>
          <div className="ml-2 inline-flex rounded-full border border-border/60 bg-card p-0.5 text-xs">
            <button
              onClick={() => setRolling(false)}
              className={"rounded-full px-3 py-1 transition-colors " + (!rolling ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground")}
            >Calendaire</button>
            <button
              onClick={() => setRolling(true)}
              className={"rounded-full px-3 py-1 transition-colors " + (rolling ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground")}
            >12 mois glissants</button>
          </div>
        </div>
      </div>

      {/* KPI Hero */}
      <div className="grid gap-3 stagger sm:grid-cols-2 lg:grid-cols-4">
        <Kpi label="Entrées"   value={entrees} icon={ArrowDownRight} tone="primary" delta={0} />
        <Kpi label="Dépenses"  value={totalActual} icon={ArrowUpRight} tone="mustard" delta={expenseDelta} invertDelta />
        <Kpi label="Net"       value={net} icon={TrendingUp} tone={net >= 0 ? "success" : "warm"} />
        <Kpi label="Épargne"   value={epargne} icon={PiggyBank} tone="primary" />
      </div>

      {/* Active cross-filter chip */}
      {focusCat && (
        <div className="flex items-center gap-2 anim-slide-up">
          <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs text-primary">
            <Filter className="h-3 w-3" />
            Filtré : {categories.find((c) => c.key === focusCat)?.label}
            <button onClick={() => setFocusCat(null)} className="ml-1 grid h-4 w-4 place-items-center rounded-full hover:bg-primary/20" aria-label="Effacer le filtre">
              <X className="h-2.5 w-2.5" />
            </button>
          </span>
        </div>
      )}

      {/* Income & Donut */}
      <div className="grid gap-5 lg:grid-cols-2">
        <IncomePanel />
        <DonutPanel focusCat={focusCat} onFocus={setFocusCat} />
      </div>

      {/* Prévu vs Réel par catégorie */}
      <Panel className="anim-slide-up">
        <header className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-serif text-xl tracking-tight">Prévu vs réel</h2>
            <p className="mt-1 text-sm text-muted-foreground">Triées par dépense — touchez pour explorer</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <Toggle on={showPlanned} onChange={setShowPlanned} label="Afficher le prévu" />
            <Toggle on={showOver} onChange={setShowOver} label="Surligner les dépassements" />
          </div>
        </header>

        <ul className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {[...filtered].sort((a, b) => b.actual - a.actual).map((c, i) => (
            <CategoryRow key={c.key} cat={c} index={i} showPlanned={showPlanned} highlightOver={showOver} />
          ))}
        </ul>
      </Panel>

      {/* Pression du mois */}
      {bills.length > 0 && (
        <Panel className="anim-slide-up">
          <header className="mb-4">
            <h2 className="font-serif text-lg tracking-tight">Pression du mois</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">Grosses échéances non mensuelles qui atterrissent ce mois-ci</p>
          </header>
          <div className="flex flex-wrap gap-2">
            {bills.map((b) => (
              <span key={b.label}
                className={"inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm " +
                  (b.kind === "income"
                    ? "border-success/30 bg-success/10 text-success"
                    : "border-warm/30 bg-warm/10 text-warm")}>
                {b.label}
                <span className="font-medium tabular-nums">{b.kind === "income" ? "+" : "−"}{eur(b.amount)}</span>
              </span>
            ))}
          </div>
        </Panel>
      )}

      <div className="text-center text-xs text-muted-foreground">
        Besoin d'aller au détail ? <Link to="/budget/transactions" className="underline-offset-4 hover:underline">Ouvrir les transactions →</Link>
      </div>
    </div>
  );
}

// ---------- subcomponents ----------

function Kpi({ label, value, icon: Icon, tone, delta, invertDelta }: {
  label: string; value: number; icon: typeof ArrowDownRight;
  tone: "primary" | "warm" | "mustard" | "success";
  delta?: number; invertDelta?: boolean;
}) {
  const toneCls =
    tone === "warm" ? "bg-warm/15 text-warm"
    : tone === "success" ? "bg-success/15 text-success"
    : "bg-primary/10 text-primary";
  const showDelta = typeof delta === "number" && delta !== 0;
  // For dépenses, positive delta (réel > prévu) is bad → red
  const isBad = showDelta && (invertDelta ? delta! > 0 : delta! < 0);
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card p-5 shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift">
      <div className="flex items-center justify-between">
        <Eyebrow>{label}</Eyebrow>
        <span className={"grid h-8 w-8 place-items-center rounded-full " + toneCls}>
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-3 font-serif text-3xl tracking-tight tabular-nums">
        <CountUp to={value} /><span className="ml-1 text-base text-muted-foreground">€</span>
      </p>
      {showDelta && (
        <p className={"mt-1 inline-flex items-center gap-1 text-xs tabular-nums " + (isBad ? "text-warm" : "text-success")}>
          {delta! > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          {delta! > 0 ? "+" : ""}{eur(delta!)} vs prévu
        </p>
      )}
    </div>
  );
}

function Toggle({ on, onChange, label }: { on: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      onClick={() => onChange(!on)}
      className={"inline-flex items-center gap-2 rounded-full border px-2.5 py-1 transition-colors " +
        (on ? "border-foreground/30 bg-foreground text-background" : "border-border/60 bg-card text-muted-foreground hover:text-foreground")}
    >
      <span className={"h-1.5 w-1.5 rounded-full " + (on ? "bg-background" : "bg-muted-foreground")} />
      {label}
    </button>
  );
}

function IncomePanel() {
  const total = incomeSources.reduce((s, i) => s + i.value, 0);
  const max = Math.max(...incomeSources.map((i) => i.value));
  return (
    <Panel as="div">
      <header className="mb-4 flex items-end justify-between gap-3">
        <div>
          <h2 className="font-serif text-xl tracking-tight">Entrées</h2>
          <p className="mt-1 text-sm text-muted-foreground">Sources du mois</p>
        </div>
        <p className="font-serif text-lg tabular-nums">{eur(total)}</p>
      </header>
      <ul className="space-y-3 stagger">
        {incomeSources.map((s) => {
          const pct = (s.value / max) * 100;
          return (
            <li key={s.label} className="group">
              <div className="mb-1 flex items-baseline justify-between text-sm">
                <span className="font-medium">{s.label}</span>
                <span className="tabular-nums text-muted-foreground">{eur(s.value)}</span>
              </div>
              <div className="relative h-3 w-full overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full transition-[width] duration-700 ease-out"
                  style={{ width: `${pct}%`, background: s.color }}
                />
              </div>
            </li>
          );
        })}
      </ul>
    </Panel>
  );
}

function DonutPanel({ focusCat, onFocus }: { focusCat: CatKey | null; onFocus: (k: CatKey | null) => void }) {
  // Top-5 + Autres
  const sorted = [...categories].sort((a, b) => b.actual - a.actual);
  const top5 = sorted.slice(0, 5);
  const autres = sorted.slice(5);
  const autresTotal = autres.reduce((s, c) => s + c.actual, 0);
  const slices = [
    ...top5.map((c) => ({ key: c.key as CatKey | "autres", label: c.label, value: c.actual, budget: c.budget, color: c.color })),
    { key: "autres" as const, label: "Autres", value: autresTotal, budget: autres.reduce((s, c) => s + c.budget, 0), color: "oklch(0.55 0.02 220)" },
  ];
  const total = slices.reduce((s, x) => s + x.value, 0);

  // SVG donut
  const size = 220, stroke = 28, r = (size - stroke) / 2, c = 2 * Math.PI * r;
  let offset = 0;
  const [hover, setHover] = useState<string | null>(null);
  const focusKey = hover ?? focusCat;
  const focused = slices.find((s) => s.key === focusKey);

  return (
    <Panel as="div">
      <header className="mb-4 flex items-end justify-between gap-3">
        <div>
          <h2 className="font-serif text-xl tracking-tight">Dépenses</h2>
          <p className="mt-1 text-sm text-muted-foreground">Top 5 + Autres — touchez une part pour filtrer</p>
        </div>
        <p className="font-serif text-lg tabular-nums">{eur(total)}</p>
      </header>
      <div className="grid gap-5 sm:grid-cols-[auto_1fr] sm:items-center">
        <div className="relative mx-auto" style={{ width: size, height: size }}>
          <svg viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
            <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--secondary)" strokeWidth={stroke} />
            {slices.map((s) => {
              const len = (s.value / total) * c;
              const dash = `${len} ${c - len}`;
              const isFocus = focusKey === s.key;
              const el = (
                <circle
                  key={s.key}
                  cx={size/2} cy={size/2} r={r}
                  fill="none"
                  stroke={s.color}
                  strokeWidth={isFocus ? stroke + 4 : stroke}
                  strokeDasharray={dash}
                  strokeDashoffset={-offset}
                  className="cursor-pointer transition-all duration-300"
                  style={{ opacity: focusKey && !isFocus ? 0.35 : 1 }}
                  onMouseEnter={() => setHover(s.key)}
                  onMouseLeave={() => setHover(null)}
                  onClick={() => s.key !== "autres" && onFocus(focusCat === s.key ? null : (s.key as CatKey))}
                />
              );
              offset += len;
              return el;
            })}
          </svg>
          <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
            {focused ? (
              <div className="anim-pop-in">
                <Eyebrow size="xs">{focused.label}</Eyebrow>
                <p className="font-serif text-xl tabular-nums">{eur(focused.value)}</p>
                <p className="text-xs text-muted-foreground tabular-nums">{Math.round((focused.value/total)*100)}%</p>
              </div>
            ) : (
              <div>
                <Eyebrow size="xs">Total</Eyebrow>
                <p className="font-serif text-xl tabular-nums">{eur(total)}</p>
              </div>
            )}
          </div>
        </div>
        <ul className="grid gap-1.5 text-sm">
          {slices.map((s) => {
            const pct = Math.round((s.value/total)*100);
            const isFocus = focusKey === s.key;
            return (
              <li
                key={s.key}
                onMouseEnter={() => setHover(s.key)}
                onMouseLeave={() => setHover(null)}
                onClick={() => s.key !== "autres" && onFocus(focusCat === s.key ? null : (s.key as CatKey))}
                className={"flex cursor-pointer items-center gap-3 rounded-lg px-2 py-1 transition-colors " + (isFocus ? "bg-secondary" : "hover:bg-secondary/50")}
              >
                <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ background: s.color }} />
                <span className="flex-1 truncate">{s.label}</span>
                <span className="tabular-nums text-muted-foreground">{pct}%</span>
                <span className="w-16 text-right tabular-nums">{eur(s.value)}</span>
              </li>
            );
          })}
        </ul>
      </div>
    </Panel>
  );
}

function CategoryRow({ cat, index, showPlanned, highlightOver }: {
  cat: Category; index: number; showPlanned: boolean; highlightOver: boolean;
}) {
  const [open, setOpen] = useState(false);
  const Icon = cat.icon;
  const pct = showPlanned ? Math.min(100, (cat.actual / cat.budget) * 100) : 100;
  const over = cat.actual > cat.budget;
  const remaining = cat.budget - cat.actual;
  const overflowPct = over ? Math.min(60, ((cat.actual - cat.budget) / cat.budget) * 100) : 0;
  const emphasize = highlightOver && over;

  return (
    <li
      className={
        "group rounded-xl border bg-card/40 px-3 py-3 transition-all duration-300 hover:bg-secondary/40 " +
        (emphasize ? "border-warm/50 ring-1 ring-warm/20" : over ? "border-warm/30" : "border-border/40")
      }
      style={{ animationDelay: `${index * 30}ms` }}
    >
      <button type="button" onClick={() => setOpen((o) => !o)} className="flex w-full items-center gap-3 text-left">
        <span className={"grid h-9 w-9 shrink-0 place-items-center rounded-full transition-colors " +
          (over ? "bg-warm/15 text-warm" : "bg-secondary text-foreground/70")}>
          <Icon className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <p className="truncate font-medium">{cat.label}</p>
            <p className="shrink-0 text-sm tabular-nums">
              <span className={over ? "font-semibold text-warm" : ""}>{eur(cat.actual)}</span>
              {showPlanned && <span className="text-muted-foreground"> / {eur(cat.budget)}</span>}
            </p>
          </div>
          <BudgetBar value={pct} overflow={over && showPlanned ? overflowPct : 0} />
          {showPlanned && (
            <div className="mt-1.5 flex items-center justify-between text-xs tabular-nums">
              <span className="text-muted-foreground">{Math.round((cat.actual / cat.budget) * 100)}% du budget</span>
              <span className={over ? "text-warm" : "text-success"}>
                {over ? `+${eur(-remaining)} dépassement` : `${eur(remaining)} restant`}
              </span>
            </div>
          )}
        </div>
      </button>
      {open && (
        <div className="mt-3 grid gap-1.5 border-t border-border/40 pt-3 pl-12 text-xs anim-slide-up">
          {cat.subs.map((s) => (
            <div key={s.label} className="flex justify-between text-muted-foreground">
              <span>{s.label}</span>
              <span className="tabular-nums">{eur(s.actual)}</span>
            </div>
          ))}
          <Link
            to="/budget/transactions"
            className="mt-2 inline-flex w-fit items-center gap-1 text-xs text-primary underline-offset-4 hover:underline"
          >Voir tout dans Transactions →</Link>
        </div>
      )}
    </li>
  );
}
