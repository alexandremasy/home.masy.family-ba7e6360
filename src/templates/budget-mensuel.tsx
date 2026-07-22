import { Link } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ArrowDownRight,
  ArrowUpRight,
  PiggyBank,
  Filter,
  X,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { CountUp } from "@/components/count-up";
import { eur } from "@/lib/budget-data";
import { Button } from "@/components/button";
import { BudgetBar } from "@/components/budget-bar";
import { DataState } from "@/components/data-state";
import { Eyebrow } from "@/components/eyebrow";
import { Card } from "@/components/card";

/* ─────────────────────────────────────────────────────────────────────────────
   The month, as a page.

   Its props are its OWN shapes. Amounts are magnitudes here — a page that shows
   "Entrées" next to "Dépenses" is already saying which way each one goes, and a
   sign on top of that would be noise.

   The month and the calendaire/glissant switch are the caller's, because they
   are what a summary is fetched for. The cross-filter is not: it narrows
   categories already in hand, so it lives here with the other readings — which
   rows are open, which slice is hovered, whether the plan is shown at all.
   ──────────────────────────────────────────────────────────────────────────── */

/** One income source, as a bar. */
export interface MonthIncomeView {
  label: string;
  value: number;
  /** The bar's fill — a CSS colour, the caller's palette. */
  color: string;
}

/** One expense category: what was spent, what was planned, and its breakdown. */
export interface MonthCategoryView {
  /** Opaque category identity — the cross-filter and the donut key on it. */
  key: string;
  label: string;
  /** The swatch and the donut slice. */
  color: string;
  /** Whatever marks the category — an icon, an emoji. */
  icon?: ReactNode;
  actual: number;
  /** Planned. Zero means there is no plan, and the page stops comparing. */
  budget: number;
  subs: { label: string; actual: number }[];
}

/** A big non-monthly bill landing this month. */
export interface MonthPressureView {
  label: string;
  amount: number;
  kind: "income" | "expense";
}

export interface MensuelTemplateProps {
  /** The month being shown, already worded. */
  monthLabel: string;
  /** Is the window the trailing 12 months rather than the calendar month. */
  rolling: boolean;
  onRollingChange: (rolling: boolean) => void;
  onPrevMonth: () => void;
  /** Omit to disable the forward chevron — there is no next month to show. */
  onNextMonth?: () => void;
  income: number;
  expenses: number;
  net: number;
  savings: number;
  /** Spent minus planned. Omit when nothing is planned — there is nothing to compare. */
  expenseDelta?: number;
  incomeSources: MonthIncomeView[];
  categories: MonthCategoryView[];
  /** Big non-monthly bills landing this month. Empty renders no section. */
  pressure?: MonthPressureView[];
  /** Where "Ouvrir les transactions" and the per-category links go. */
  transactionsTo: string;
  /** The month is still on its way. */
  loading?: boolean;
  /** It could not be loaded. */
  error?: boolean;
  onRetry?: () => void;
}

export function MensuelTemplate({
  monthLabel,
  rolling,
  onRollingChange,
  onPrevMonth,
  onNextMonth,
  income,
  expenses,
  net,
  savings,
  expenseDelta,
  incomeSources,
  categories,
  pressure = [],
  transactionsTo,
  loading = false,
  error = false,
  onRetry,
}: MensuelTemplateProps) {
  // A cross-filter over categories already in hand — no query keys on it.
  const [focusCat, setFocusCat] = useState<string | null>(null);
  const [showOver, setShowOver] = useState(false);
  const [showPlanned, setShowPlanned] = useState(true);

  const filtered = focusCat ? categories.filter((c) => c.key === focusCat) : categories;

  return (
    <div className="space-y-8 anim-slide-up">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Eyebrow size="xs">Budget · Mensuel</Eyebrow>
          <h1 className="mt-1 text-3xl tracking-tight sm:text-4xl capitalize">
            {rolling ? `12 mois → ${monthLabel}` : monthLabel}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="iconRound"
            onClick={onPrevMonth}
            aria-label="Mois précédent"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="iconRound"
            onClick={onNextMonth}
            disabled={!onNextMonth}
            aria-label="Mois suivant"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <div className="ml-2 inline-flex rounded-full border border-border/60 bg-card p-0.5 text-xs">
            <button
              onClick={() => onRollingChange(false)}
              className={
                "rounded-full px-3 py-1 transition-colors " +
                (!rolling
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground")
              }
            >
              Calendaire
            </button>
            <button
              onClick={() => onRollingChange(true)}
              className={
                "rounded-full px-3 py-1 transition-colors " +
                (rolling
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground")
              }
            >
              12 mois glissants
            </button>
          </div>
        </div>
      </div>

      {loading || error ? (
        <DataState status={error ? "error" : "loading"} label="le mois" onRetry={onRetry} />
      ) : (
        <>
          {/* KPI Hero */}
          <div className="grid gap-3 stagger sm:grid-cols-2 lg:grid-cols-4">
            <Kpi label="Entrées" value={income} icon={ArrowDownRight} tone="primary" />
            <Kpi
              label="Dépenses"
              value={expenses}
              icon={ArrowUpRight}
              tone="mustard"
              delta={expenseDelta}
              invertDelta
            />
            <Kpi label="Net" value={net} icon={TrendingUp} tone={net >= 0 ? "success" : "warm"} />
            <Kpi label="Épargne" value={savings} icon={PiggyBank} tone="primary" />
          </div>

          {/* Active cross-filter chip */}
          {focusCat && (
            <div className="flex items-center gap-2 anim-slide-up">
              <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs text-primary">
                <Filter className="h-3 w-3" />
                Filtré : {categories.find((c) => c.key === focusCat)?.label}
                <button
                  onClick={() => setFocusCat(null)}
                  className="ml-1 grid h-4 w-4 place-items-center rounded-full hover:bg-primary/20"
                  aria-label="Effacer le filtre"
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              </span>
            </div>
          )}

          {/* Income & Donut */}
          <div className="grid gap-5 lg:grid-cols-2">
            <IncomePanel sources={incomeSources} />
            <DonutPanel cats={categories} focusCat={focusCat} onFocus={setFocusCat} />
          </div>

          {/* Prévu vs Réel par catégorie */}
          <Card
            variant="solid"
            className="anim-slide-up"
            title="Prévu vs réel"
            subline="Triées par dépense — touchez pour explorer"
            trailing={
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <Toggle on={showPlanned} onChange={setShowPlanned} label="Afficher le prévu" />
                <Toggle on={showOver} onChange={setShowOver} label="Surligner les dépassements" />
              </div>
            }
          >
            {filtered.length === 0 ? (
              <p className="text-sm text-muted-foreground">Aucune dépense pour cette période.</p>
            ) : (
              <ul className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                {[...filtered]
                  .sort((a, b) => b.actual - a.actual)
                  .map((c, i) => (
                    <CategoryRow
                      key={c.key}
                      cat={c}
                      index={i}
                      showPlanned={showPlanned}
                      highlightOver={showOver}
                      transactionsTo={transactionsTo}
                    />
                  ))}
              </ul>
            )}
          </Card>

          {/* Pression du mois */}
          {pressure.length > 0 && (
            <Card
              variant="solid"
              className="anim-slide-up"
              title="Pression du mois"
              subline="Grosses échéances non mensuelles qui atterrissent ce mois-ci"
            >
              <div className="flex flex-wrap gap-2">
                {pressure.map((b) => (
                  <span
                    key={b.label}
                    className={
                      "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm " +
                      (b.kind === "income"
                        ? "border-success/30 bg-success/10 text-success"
                        : "border-warm/30 bg-warm/10 text-warm")
                    }
                  >
                    {b.label}
                    <span className="font-semibold tabular-nums">
                      {b.kind === "income" ? "+" : "−"}
                      {eur(b.amount)}
                    </span>
                  </span>
                ))}
              </div>
            </Card>
          )}
        </>
      )}

      <div className="text-center text-xs text-muted-foreground">
        Besoin d'aller au détail ?{" "}
        <Link to={transactionsTo} className="underline-offset-4 hover:underline">
          Ouvrir les transactions →
        </Link>
      </div>
    </div>
  );
}

// ---------- subcomponents ----------

function Kpi({
  label,
  value,
  icon: Icon,
  tone,
  delta,
  invertDelta,
}: {
  label: string;
  value: number;
  icon: typeof ArrowDownRight;
  tone: "primary" | "warm" | "mustard" | "success";
  delta?: number;
  invertDelta?: boolean;
}) {
  const toneCls =
    tone === "warm"
      ? "bg-warm/15 text-warm"
      : tone === "mustard"
        ? "bg-mustard/15 text-mustard"
        : tone === "success"
          ? "bg-success/15 text-success"
          : "bg-primary/10 text-primary";
  const showDelta = typeof delta === "number" && delta !== 0;
  // For dépenses, positive delta (réel > prévu) is bad → red
  const isBad = showDelta && (invertDelta ? delta! > 0 : delta! < 0);
  return (
    <Card
      as="div"
      className="group relative transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift"
    >
      <div className="flex items-center justify-between">
        <Eyebrow>{label}</Eyebrow>
        <span className={"grid h-8 w-8 place-items-center rounded-full " + toneCls}>
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-3 text-3xl tracking-tight tabular-nums">
        <CountUp to={Math.round(value)} />
        <span className="ml-1 text-base text-muted-foreground">€</span>
      </p>
      {showDelta && (
        <p
          className={
            "mt-1 inline-flex items-center gap-1 text-xs tabular-nums " +
            (isBad ? "text-warm" : "text-success")
          }
        >
          {delta! > 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          {delta! > 0 ? "+" : ""}
          {eur(delta!)} vs prévu
        </p>
      )}
    </Card>
  );
}

function Toggle({
  on,
  onChange,
  label,
}: {
  on: boolean;
  onChange: (v: boolean) => void;
  label: string;
}) {
  return (
    <button
      onClick={() => onChange(!on)}
      className={
        "inline-flex items-center gap-2 rounded-full border px-2.5 py-1 transition-colors " +
        (on
          ? "border-foreground/30 bg-foreground text-background"
          : "border-border/60 bg-card text-muted-foreground hover:text-foreground")
      }
    >
      <span
        className={"h-1.5 w-1.5 rounded-full " + (on ? "bg-background" : "bg-muted-foreground")}
      />
      {label}
    </button>
  );
}

function IncomePanel({ sources }: { sources: MonthIncomeView[] }) {
  const total = sources.reduce((s, i) => s + i.value, 0);
  const max = Math.max(1, ...sources.map((i) => i.value));
  return (
    <Card
      variant="solid"
      as="div"
      title="Entrées"
      subline="Sources du mois"
      trailing={<p className="text-lg tabular-nums">{eur(total)}</p>}
    >
      {sources.length === 0 ? (
        <p className="text-sm text-muted-foreground">Aucune entrée sur la période.</p>
      ) : (
        <ul className="space-y-3 stagger">
          {sources.map((s) => {
            const pct = (s.value / max) * 100;
            return (
              <li key={s.label} className="group">
                <div className="mb-1 flex items-baseline justify-between text-sm">
                  <span className="font-semibold">{s.label}</span>
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
      )}
    </Card>
  );
}

function DonutPanel({
  cats,
  focusCat,
  onFocus,
}: {
  cats: MonthCategoryView[];
  focusCat: string | null;
  onFocus: (k: string | null) => void;
}) {
  // Top-5 + Autres
  const sorted = [...cats].sort((a, b) => b.actual - a.actual);
  const top5 = sorted.slice(0, 5);
  const autres = sorted.slice(5);
  const slices = [
    ...top5.map((c) => ({ key: c.key, label: c.label, value: c.actual, color: c.color })),
    {
      key: "autres",
      label: "Autres",
      value: autres.reduce((s, c) => s + c.actual, 0),
      color: "oklch(0.55 0.02 220)",
    },
  ].filter((s) => s.value > 0);
  const total = Math.max(
    1,
    slices.reduce((s, x) => s + x.value, 0),
  );

  // SVG donut
  const size = 220,
    stroke = 28,
    r = (size - stroke) / 2,
    c = 2 * Math.PI * r;
  let offset = 0;
  const [hover, setHover] = useState<string | null>(null);
  const focusKey = hover ?? focusCat;
  const focused = slices.find((s) => s.key === focusKey);

  return (
    <Card
      variant="solid"
      as="div"
      title="Dépenses"
      subline="Top 5 + Autres — touchez une part pour filtrer"
      trailing={<p className="text-lg tabular-nums">{eur(total)}</p>}
    >
      <div className="grid gap-5 sm:grid-cols-[auto_1fr] sm:items-center">
        <div className="relative mx-auto" style={{ width: size, height: size }}>
          <svg viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
            <circle
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke="var(--secondary)"
              strokeWidth={stroke}
            />
            {slices.map((s) => {
              const len = (s.value / total) * c;
              const dash = `${len} ${c - len}`;
              const isFocus = focusKey === s.key;
              const el = (
                <circle
                  key={s.key}
                  cx={size / 2}
                  cy={size / 2}
                  r={r}
                  fill="none"
                  stroke={s.color}
                  strokeWidth={isFocus ? stroke + 4 : stroke}
                  strokeDasharray={dash}
                  strokeDashoffset={-offset}
                  className="cursor-pointer transition-all duration-300"
                  style={{ opacity: focusKey && !isFocus ? 0.35 : 1 }}
                  onMouseEnter={() => setHover(s.key)}
                  onMouseLeave={() => setHover(null)}
                  onClick={() => s.key !== "autres" && onFocus(focusCat === s.key ? null : s.key)}
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
                <p className="text-xl tabular-nums">{eur(focused.value)}</p>
                <p className="text-xs text-muted-foreground tabular-nums">
                  {Math.round((focused.value / total) * 100)}%
                </p>
              </div>
            ) : (
              <div>
                <Eyebrow size="xs">Total</Eyebrow>
                <p className="text-xl tabular-nums">{eur(total)}</p>
              </div>
            )}
          </div>
        </div>
        <ul className="grid gap-1.5 text-sm">
          {slices.map((s) => {
            const pct = Math.round((s.value / total) * 100);
            const isFocus = focusKey === s.key;
            return (
              <li
                key={s.key}
                onMouseEnter={() => setHover(s.key)}
                onMouseLeave={() => setHover(null)}
                onClick={() => s.key !== "autres" && onFocus(focusCat === s.key ? null : s.key)}
                className={
                  "flex cursor-pointer items-center gap-3 rounded-lg px-2 py-1 transition-colors " +
                  (isFocus ? "bg-secondary" : "hover:bg-secondary/50")
                }
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
    </Card>
  );
}

function CategoryRow({
  cat,
  index,
  showPlanned,
  highlightOver,
  transactionsTo,
}: {
  cat: MonthCategoryView;
  index: number;
  showPlanned: boolean;
  highlightOver: boolean;
  transactionsTo: string;
}) {
  const [open, setOpen] = useState(false);
  // No budget means no plan to compare against — the bar fills and says nothing.
  const hasBudget = cat.budget > 0;
  const compare = showPlanned && hasBudget;
  const pct = compare ? Math.min(100, (cat.actual / cat.budget) * 100) : 100;
  const over = hasBudget && cat.actual > cat.budget;
  const remaining = cat.budget - cat.actual;
  const overflowPct = over ? Math.min(60, ((cat.actual - cat.budget) / cat.budget) * 100) : 0;
  const emphasize = highlightOver && over;

  return (
    <li
      className={
        "group rounded-xl border bg-card/40 px-3 py-3 transition-all duration-300 hover:bg-secondary/40 " +
        (emphasize
          ? "border-warm/50 ring-1 ring-warm/20"
          : over
            ? "border-warm/30"
            : "border-border/40")
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
          {cat.icon}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <p className="truncate font-semibold">{cat.label}</p>
            <p className="shrink-0 text-sm tabular-nums">
              <span className={over ? "font-semibold text-warm" : ""}>{eur(cat.actual)}</span>
              {compare && <span className="text-muted-foreground"> / {eur(cat.budget)}</span>}
            </p>
          </div>
          <BudgetBar value={pct} overflow={over && showPlanned ? overflowPct : 0} />
          {compare && (
            <div className="mt-1.5 flex items-center justify-between text-xs tabular-nums">
              <span className="text-muted-foreground">
                {Math.round((cat.actual / cat.budget) * 100)}% du budget
              </span>
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
            to={transactionsTo}
            className="mt-2 inline-flex w-fit items-center gap-1 text-xs text-primary underline-offset-4 hover:underline"
          >
            Voir tout dans Transactions →
          </Link>
        </div>
      )}
    </li>
  );
}
