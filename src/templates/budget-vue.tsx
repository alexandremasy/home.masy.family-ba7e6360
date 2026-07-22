import { Link } from "@tanstack/react-router";
import { useMemo, type ReactNode } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip as RTooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  AlertTriangle,
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  PiggyBank,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { CountUp } from "@/components/count-up";
import { MONTHS_FR, MONTHS_FR_LONG, eur } from "@/lib/budget-data";
import { Button } from "@/components/button";
import { BudgetBar } from "@/components/budget-bar";
import { Card } from "@/components/card";
import { DataState } from "@/components/data-state";
import { Eyebrow } from "@/components/eyebrow";

/* ─────────────────────────────────────────────────────────────────────────────
   The overview, as a page — the aggregate of the budget domain.

   Its props are its OWN shapes, and every judgement arrives already made: the
   verdict's status, an axis's tone, a bill's coverage. This page draws a year
   and lets you fall into a month; it does not decide whether the year is going
   well. That is measured — server-side over there, by the mock's own maths here.

   The month zoom is the caller's state because the month it lands on is what a
   summary gets fetched for. What the three temporal faces (passé · en cours ·
   futur) show is passed in ready: a page cannot know that a closed month wants
   a variance and a future one wants the plan.
   ──────────────────────────────────────────────────────────────────────────── */

/** One month of the flux curve. */
export interface FlowPointView {
  /** X label. */
  m: string;
  idx: number;
  /** Where a click on this month lands. */
  year: number;
  calIdx: number;
  /** Measured, not projected. */
  isReal: boolean;
  isToday?: boolean;
  /** The frontier: last month an import covers. */
  isLastImport?: boolean;
  inReel: number | null;
  inProj: number | null;
  depReel: number | null;
  depProj: number | null;
  epReel: number | null;
  epProj: number | null;
  /** What went out that month, for the strip's écart. */
  spend: number;
}

/** One reading of the year's health. */
export interface VerdictAxisView {
  label: string;
  /** The hero figure, already formatted. */
  value: string;
  /** A secondary figure next to it. */
  pct?: string;
  /** The status chip's text. */
  tag: string;
  /** The human line under it. */
  explain: string;
  tone: "ok" | "warn" | "over";
  /** Renders the axis as a link to the reserve page. */
  linksToReserve?: boolean;
}

export interface VerdictView {
  /** Colours the block's ring. */
  status: "ok" | "absorbed" | "warn" | "over";
  axes: VerdictAxisView[];
}

/** A non-monthly bill on its way. */
export interface UpcomingBillView {
  id: string;
  label: string;
  monthIdx: number;
  /** Where a click lands. */
  year: number;
  amount: number;
  monthsAway: number;
  coverage: "covered" | "partial" | "none";
  coveragePct: number;
}

/** The sinking-fund signal the annual verdict hides. */
export interface LiquidityView {
  /** The month that will be tight, if any. */
  tight?: {
    year: number;
    monthIdx: number;
    /** The bill that lands before it is provisioned. */
    bill?: { label: string; amount: number; shortfall: number };
  };
  /** Set when nothing is tight and something is being set aside. */
  coveredProvision?: number;
}

/** One category card of the "why" grid. */
export interface CategoryCardView {
  key: string;
  label: string;
  icon?: ReactNode;
  /** The sparkline's colour. */
  color: string;
  /** Monthly budget. Zero means there is none. */
  budget: number;
  /** Average spent over the window, compared to the budget. */
  avgSpent: number;
  /** Year-on-year, in percent. `null` when there is no twin to compare. */
  yoy: number | null;
  /** The year-ago label, for the YoY chip. */
  yoyLabel: string;
  /** 12 points: `real` up to the frontier, `proj` after. */
  trend: { m: string; real: number | null; proj: number | null; v: number }[];
}

/** One of the three figures above a month's detail. */
export interface MonthStatView {
  label: string;
  value: number;
  tone: "primary" | "warm" | "mustard" | "success";
  hint?: string;
  signed?: boolean;
}

/** A category line inside a month. */
export interface MonthCategoryView {
  key: string;
  label: string;
  icon?: ReactNode;
  actual: number;
  /** Zero means no budget was set — the page stops comparing. */
  budget: number;
}

/** A planned poste group, for a month that has not happened. */
export interface MonthPlannedView {
  key: string;
  label: string;
  icon?: ReactNode;
  total: number;
  /** The postes behind the total, already worded. */
  postes: string[];
}

/** Everything one month shows, in whichever of its three faces. */
export interface MonthDetailView {
  state: "passe" | "en-cours" | "futur";
  /** The three figures on top. */
  stats: MonthStatView[];
  /** Spending by category — `passe` and `en-cours`. */
  categories: MonthCategoryView[];
  /** How far into the month we are — `en-cours` only. */
  progress?: { day: number; total: number };
  /** What is planned — `futur` only. */
  planned?: MonthPlannedView[];
  /** The plan spread over the days — `futur` only. */
  plannedByDay?: { d: number; v: number }[];
  /** Non-monthly bills landing this month. */
  bills: { label: string; amount: number }[];
}

export interface BudgetVueTemplateProps {
  /** The window's title, already worded ("12 mois glissants", "2025"). */
  title: string;
  /** Step the window towards the rolling view. Omit to disable. */
  onPrevView?: () => void;
  /** Step it towards the past years. Omit to disable. */
  onNextView?: () => void;
  /** The month being looked at, or nothing. The caller owns it: a summary is fetched for it. */
  zoom: { year: number; monthIdx: number } | null;
  onZoom: (zoom: { year: number; monthIdx: number } | null) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  /** The year's verdict. Absent renders the loading state. */
  verdict?: VerdictView;
  /** How far the imports go, already worded. */
  freshLabel: string;
  flows: FlowPointView[];
  /** The monthly category budget the strip's écart is measured against. */
  monthlyBudget: number;
  upcoming: UpcomingBillView[];
  /** What is set aside every month for the non-monthly bills. */
  provision: number;
  liquidity?: LiquidityView;
  categories: CategoryCardView[];
  /** What the zoomed month shows. Absent while it loads. */
  month?: MonthDetailView;
  /** Where the reserve axis, the category cards and the plan link to. */
  reserveTo: string;
  /** Search params carried to the reserve page, so it opens on the same window. */
  reserveSearch?: Record<string, unknown>;
  mensuelTo: string;
  planificationTo: string;
  /** Nested routes (the reserve overlay) render here, over the vue. */
  children?: ReactNode;
  loading?: boolean;
  error?: boolean;
  onRetry?: () => void;
}

const axisCls = {
  ok: { fg: "text-success", dot: "bg-success", bg: "bg-success/15" },
  warn: { fg: "text-warm", dot: "bg-warm", bg: "bg-warm/15" },
  over: { fg: "text-destructive", dot: "bg-destructive", bg: "bg-destructive/15" },
} as const;

const ringOf = (status: VerdictView["status"]) =>
  status === "ok"
    ? "ring-success/30"
    : status === "absorbed"
      ? "ring-accent/40"
      : status === "warn"
        ? "ring-warm/40"
        : "ring-destructive/40";

function useYAxis(values: number[], step = 2000) {
  return useMemo(() => {
    const top = Math.max(step, Math.ceil(Math.max(...values, 0) / step) * step);
    return { yTop: top, yTicks: Array.from({ length: top / step + 1 }, (_, i) => i * step) };
  }, [values.join(",")]); // eslint-disable-line react-hooks/exhaustive-deps
}

export function BudgetVueTemplate({
  title,
  onPrevView,
  onNextView,
  zoom,
  onZoom,
  onPrevMonth,
  onNextMonth,
  verdict,
  freshLabel,
  flows,
  monthlyBudget,
  upcoming,
  provision,
  liquidity,
  categories,
  month,
  reserveTo,
  reserveSearch,
  mensuelTo,
  planificationTo,
  children,
  loading = false,
  error = false,
  onRetry,
}: BudgetVueTemplateProps) {
  return (
    // Full-bleed stage with the anniversaires-style wash header: cancel the shell px
    // so the wash reaches edge to edge, the inner wrapper re-adds padding.
    <div className="relative -mx-4 pt-16 sm:-mx-6">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-6 bottom-0 -z-10 bg-gradient-to-b from-mustard/10 to-transparent sm:-top-10 md:-top-24"
      />
      <div className="space-y-8 px-6 anim-slide-up sm:px-12">
        <header className="flex items-start justify-between gap-4">
          <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
            {zoom !== null ? (
              <Button
                onClick={() => onZoom(null)}
                variant="outline"
                size="iconRound"
                aria-label="Retour à la vue d'ensemble"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
            ) : (
              <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-mustard/15 text-mustard">
                <PiggyBank className="h-6 w-6" />
              </span>
            )}
            <div className="min-w-0">
              <Eyebrow tone="current" size="xs" className="text-mustard">
                Budget · {zoom === null ? "Vue d'ensemble" : "Mois"}
              </Eyebrow>
              <h1 className="text-2xl tracking-tight sm:text-3xl">
                {zoom === null ? (
                  title
                ) : (
                  <>
                    <button
                      onClick={() => onZoom(null)}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {title}
                    </button>
                    <span className="mx-2 text-muted-foreground/50">/</span>
                    <span className="capitalize">
                      {MONTHS_FR_LONG[zoom.monthIdx]} {zoom.year}
                    </span>
                  </>
                )}
              </h1>
              {zoom === null && (
                <p className="text-sm text-muted-foreground">
                  Trajectoire de l'année, échéances et épargne.
                </p>
              )}
            </div>
          </div>
          {zoom === null && (
            <div className="flex shrink-0 items-center gap-2">
              <Button
                onClick={onPrevView}
                disabled={!onPrevView}
                aria-label="Vers le glissant"
                variant="outline"
                size="iconRound"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                onClick={onNextView}
                disabled={!onNextView}
                aria-label="Vers les années passées"
                variant="outline"
                size="iconRound"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </header>

        <div className="relative">
          <div
            className={
              (zoom === null ? "opacity-100" : "pointer-events-none hidden") +
              " transition-opacity duration-300"
            }
          >
            {loading || error ? (
              <DataState
                status={error ? "error" : "loading"}
                label="la vue d'ensemble"
                onRetry={onRetry}
              />
            ) : verdict ? (
              <div className="space-y-6 sm:space-y-8">
                <FluxBlock
                  verdict={verdict}
                  flows={flows}
                  monthlyBudget={monthlyBudget}
                  upcoming={upcoming}
                  provision={provision}
                  liquidity={liquidity}
                  freshLabel={freshLabel}
                  reserveTo={reserveTo}
                  reserveSearch={reserveSearch}
                  onPickMonth={(year, monthIdx) => onZoom({ year, monthIdx })}
                />
                <CategoriesGrid cards={categories} mensuelTo={mensuelTo} />
              </div>
            ) : null}
          </div>
          <div
            className={
              (zoom !== null ? "opacity-100 block" : "hidden") + " transition-opacity duration-300"
            }
          >
            {zoom !== null && (
              <MonthView
                key={`${zoom.year}-${zoom.monthIdx}`}
                monthIdx={zoom.monthIdx}
                detail={month}
                planificationTo={planificationTo}
                onPrev={onPrevMonth}
                onNext={onNextMonth}
              />
            )}
          </div>
        </div>

        {children}
      </div>
    </div>
  );
}

/* ---- Verdict axes ---- */

function AxisStatus({
  axis,
  to,
  search,
}: {
  axis: VerdictAxisView;
  to?: string;
  search?: Record<string, unknown>;
}) {
  const c = axisCls[axis.tone];
  const inner = (
    <>
      <p className="flex items-center gap-1.5 text-2xs uppercase tracking-eyebrow text-muted-foreground">
        <span className={"h-1.5 w-1.5 rounded-full " + c.dot} /> {axis.label}
        {to && (
          <ChevronRight className="ml-auto h-3.5 w-3.5 text-muted-foreground/60 transition-transform group-hover/axis:translate-x-0.5" />
        )}
      </p>
      <div className="mt-1.5 flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <span className="text-lg leading-none tabular-nums text-foreground sm:text-xl">
          {axis.value}
        </span>
        {axis.pct && (
          <span className="text-sm tabular-nums text-muted-foreground">· {axis.pct}</span>
        )}
        <span
          className={
            "inline-flex items-center self-center rounded-full px-2.5 py-0.5 text-xs font-semibold " +
            c.bg +
            " " +
            c.fg
          }
        >
          {axis.tag}
        </span>
      </div>
      <p className="mt-2 text-sm leading-snug text-muted-foreground">{axis.explain}</p>
    </>
  );
  if (to) {
    return (
      <Link
        to={to}
        search={search}
        className="group/axis block h-full w-full text-left transition-all hover:-translate-y-0.5 hover:shadow-lift"
      >
        <Card variant="inset" as="div" className="hover:border-border">
          {inner}
        </Card>
      </Link>
    );
  }
  return (
    <Card variant="inset" as="div" className="text-left">
      {inner}
    </Card>
  );
}

// Default-looking tooltip, but each metric shown once: at the junction month both
// réel and projeté carry a value — pick réel when present, else projeté.
function FlowTip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  label?: string;
  payload?: { dataKey?: string | number; value?: number | null }[];
}) {
  if (!active || !payload?.length) return null;
  const v = (k: string) => {
    const hit = payload.find((p) => p.dataKey === k && p.value != null);
    return typeof hit?.value === "number" ? hit.value : null;
  };
  const rows = [
    {
      name: "Entrées",
      val: v("inReel") ?? v("inProj"),
      reel: v("inReel") != null,
      color: "var(--success)",
    },
    {
      name: "Dépenses",
      val: v("depReel") ?? v("depProj"),
      reel: v("depReel") != null,
      color: "var(--warm)",
    },
    {
      name: "Épargne",
      val: v("epReel") ?? v("epProj"),
      reel: v("epReel") != null,
      color: "var(--primary)",
    },
  ].filter((r) => r.val != null);
  const projected = rows.length > 0 && rows.every((r) => !r.reel);
  return (
    <div
      style={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 12 }}
      className="px-3 py-2 text-xs shadow-lift"
    >
      <p className="mb-1 font-semibold text-popover-foreground">
        {label}
        {projected && <span className="font-normal text-muted-foreground"> · projeté</span>}
      </p>
      {rows.map((r) => (
        <p key={r.name} className="tabular-nums" style={{ color: r.color }}>
          {r.name} : {eur(r.val!)}
        </p>
      ))}
    </div>
  );
}

/* ---- Liquidity callout — the sinking-fund signal the annual verdict hides ---- */

function LiquidityCallout({
  liquidity,
  onPickMonth,
}: {
  liquidity: LiquidityView;
  onPickMonth: (year: number, monthIdx: number) => void;
}) {
  if (liquidity.tight) {
    const { year, monthIdx, bill } = liquidity.tight;
    return (
      <button
        onClick={() => onPickMonth(year, monthIdx)}
        className="mt-4 flex w-full items-start gap-3 rounded-xl border border-warm/40 bg-warm/5 p-4 text-left transition-colors hover:bg-warm/10"
      >
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-warm/15 text-warm">
          <AlertTriangle className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-medium">
            Trésorerie tendue en {MONTHS_FR_LONG[monthIdx].toLowerCase()}
          </p>
          <p className="mt-0.5 text-[13px] leading-snug text-muted-foreground">
            {bill && (
              <>
                {bill.label} (<span className="tabular-nums text-warm">{eur(bill.amount)}</span>)
                tombe avant d'être provisionné — il manque{" "}
                <span className="tabular-nums font-medium text-warm">{eur(bill.shortfall)}</span>
                .{" "}
              </>
            )}
            Le plan s'équilibre sur l'année, mais ce mois-là sera serré.
          </p>
        </div>
      </button>
    );
  }
  if (liquidity.coveredProvision && liquidity.coveredProvision > 0) {
    return (
      <div className="mt-4 flex items-center gap-2.5 rounded-xl border border-success/30 bg-success/5 px-4 py-2.5 text-[13px] text-muted-foreground">
        <ShieldCheck className="h-4 w-4 shrink-0 text-success" />
        Trésorerie couverte — les échéances non-mensuelles sont provisionnées à temps (
        {eur(liquidity.coveredProvision)}/mois de côté).
      </div>
    );
  }
  return null;
}

function FluxBlock({
  verdict,
  flows,
  monthlyBudget,
  upcoming,
  provision,
  liquidity,
  freshLabel,
  reserveTo,
  reserveSearch,
  onPickMonth,
}: {
  verdict: VerdictView;
  flows: FlowPointView[];
  monthlyBudget: number;
  upcoming: UpcomingBillView[];
  provision: number;
  liquidity?: LiquidityView;
  freshLabel: string;
  reserveTo: string;
  reserveSearch?: Record<string, unknown>;
  onPickMonth: (year: number, monthIdx: number) => void;
}) {
  const flowAxis = useYAxis(
    flows.flatMap((f) => [f.inReel ?? 0, f.inProj ?? 0, f.depReel ?? 0, f.depProj ?? 0]),
    2000,
  );
  const lastImportX = flows.find((f) => f.isLastImport)?.m;
  const todayX = flows.find((f) => f.isToday)?.m;
  const total6m = upcoming.filter((b) => b.monthsAway < 6).reduce((s, b) => s + b.amount, 0);
  const provisionIn6m = provision * 6;

  return (
    <section
      className={
        "rounded-2xl border border-border/60 bg-card p-5 shadow-soft sm:p-7 anim-slide-up ring-1 " +
        ringOf(verdict.status)
      }
    >
      {/* Verdict integrated at the top — the curve below is its gauge */}
      <div>
        <h2 className="text-base tracking-tight sm:text-lg">Santé de l'année</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Sur base des imports jusqu'à {freshLabel} — la suite est projetée.
        </p>
        {/* Two independent statuses — each: the number (hero) + a status tag + a human line.
            The Réserve box links to its own page, carrying the current window. */}
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {verdict.axes.map((a) => (
            <AxisStatus
              key={a.label}
              axis={a}
              to={a.linksToReserve ? reserveTo : undefined}
              search={a.linksToReserve ? reserveSearch : undefined}
            />
          ))}
        </div>
      </div>

      {liquidity && <LiquidityCallout liquidity={liquidity} onPickMonth={onPickMonth} />}

      {/* One glissant view: past réel (solid) + futur projeté (dashed), présent marqué */}
      <div className="mt-6">
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <Eyebrow size="xs">Entrées · Dépenses · Épargne — par mois</Eyebrow>
          <div className="flex flex-wrap items-center gap-3 text-2xs uppercase tracking-eyebrow text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-0.5 w-3" style={{ background: "var(--success)" }} /> Entrées
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-0.5 w-3" style={{ background: "var(--warm)" }} /> Dépenses
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-0.5 w-3" style={{ background: "var(--primary)" }} /> Épargne
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-0.5 w-3 border-t border-dashed border-muted-foreground/60" />{" "}
              Projeté
            </span>
          </div>
        </div>
        <div className="h-56 w-full sm:h-72">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={flows} margin={{ top: 8, right: 8, left: -14, bottom: 0 }}>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="m"
                stroke="var(--muted-foreground)"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                interval={0}
              />
              <YAxis
                stroke="var(--muted-foreground)"
                fontSize={10}
                tickLine={false}
                axisLine={false}
                domain={[0, flowAxis.yTop]}
                ticks={flowAxis.yTicks}
                tickFormatter={(v) => `${Math.round(v / 1000)}k`}
                width={42}
              />
              <RTooltip content={<FlowTip />} />
              {lastImportX && (
                <ReferenceLine
                  x={lastImportX}
                  stroke="var(--foreground)"
                  strokeOpacity={0.28}
                  strokeDasharray="3 3"
                  label={{
                    value: "dernier import",
                    position: "insideTopLeft",
                    fontSize: 10,
                    fill: "var(--muted-foreground)",
                  }}
                />
              )}
              {todayX && todayX !== lastImportX && (
                <ReferenceLine
                  x={todayX}
                  stroke="var(--foreground)"
                  strokeOpacity={0.4}
                  strokeDasharray="2 4"
                  label={{
                    value: "aujourd'hui",
                    position: "top",
                    fontSize: 10,
                    fill: "var(--muted-foreground)",
                  }}
                />
              )}
              <Line
                type="monotone"
                dataKey="inReel"
                stroke="var(--success)"
                strokeWidth={2.5}
                dot={false}
                name="Entrées"
                connectNulls={false}
              />
              <Line
                type="monotone"
                dataKey="inProj"
                stroke="var(--success)"
                strokeWidth={2}
                strokeDasharray="5 4"
                dot={false}
                name="Entrées (proj.)"
                connectNulls={false}
              />
              <Line
                type="monotone"
                dataKey="depReel"
                stroke="var(--warm)"
                strokeWidth={2.5}
                dot={false}
                name="Dépenses"
                connectNulls={false}
              />
              <Line
                type="monotone"
                dataKey="depProj"
                stroke="var(--warm)"
                strokeWidth={2}
                strokeDasharray="5 4"
                dot={false}
                name="Dépenses (proj.)"
                connectNulls={false}
              />
              <Line
                type="monotone"
                dataKey="epReel"
                stroke="var(--primary)"
                strokeWidth={2.5}
                dot={false}
                name="Épargne"
                connectNulls={false}
              />
              <Line
                type="monotone"
                dataKey="epProj"
                stroke="var(--primary)"
                strokeWidth={2}
                strokeDasharray="5 4"
                dot={false}
                name="Épargne (proj.)"
                connectNulls={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Month strip — each box: écart vs budget (réel importé / projeté atténué) */}
      <div className="mt-6 border-t border-border/40 pt-4">
        <div className="mb-2 flex items-center justify-between text-2xs uppercase tracking-eyebrow text-muted-foreground">
          <span>Mois · écart au budget</span>
          <span className="hidden sm:inline">Cliquez pour ouvrir</span>
        </div>
        <div className="-mx-1 flex gap-1 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {flows.map((f) => {
            const ecart = Math.round(f.spend - monthlyBudget);
            const over = ecart > 0;
            const flat = Math.abs(ecart) < 25;
            // Spend sits structurally above the monthly category budget (which excludes the
            // annualised lumpy charges), so painting every overshoot red is noise — the number
            // stays neutral, colour is reserved for months that materially break the budget.
            const notable = ecart > monthlyBudget * 0.3;
            const under = ecart < -monthlyBudget * 0.1;
            const ecartCls = notable
              ? "text-warm"
              : under
                ? "text-success"
                : "text-muted-foreground";
            return (
              <button
                key={f.idx}
                onClick={() => onPickMonth(f.year, f.calIdx)}
                title={f.isReal ? "Réel" : "Projeté"}
                className={
                  "group relative flex min-w-[58px] flex-1 flex-col items-center gap-1 rounded-lg border bg-card px-1.5 py-2 transition-all hover:-translate-y-0.5 hover:shadow-lift " +
                  (f.isReal ? "border-solid border-border " : "border-transparent ") +
                  (f.isToday ? "ring-1 ring-primary/50 bg-primary/5 " : "")
                }
              >
                {!f.isReal && (
                  <svg
                    className="pointer-events-none absolute inset-[0.5px] h-[calc(100%-1px)] w-[calc(100%-1px)]"
                    aria-hidden
                  >
                    <rect
                      width="100%"
                      height="100%"
                      rx="7.5"
                      ry="7.5"
                      fill="none"
                      stroke="var(--border)"
                      strokeOpacity={0.7}
                      strokeWidth={1}
                      strokeDasharray="5 4"
                    />
                  </svg>
                )}
                <span className="flex items-center gap-1 text-xs uppercase tracking-wide text-muted-foreground">
                  {f.isLastImport && (
                    <span
                      className="h-1.5 w-1.5 rounded-full bg-foreground"
                      title="dernier import"
                    />
                  )}
                  {f.m}
                </span>
                <span className={"text-sm font-semibold tabular-nums " + ecartCls}>
                  {flat ? "≈" : (over ? "+" : "−") + eur(Math.abs(ecart))}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Échéances strip — upcoming non-monthly bills + coverage, fed by the Planification. */}
      {upcoming.length > 0 && (
        <div className="mt-4 border-t border-border/40 pt-4">
          <div className="mb-2 flex items-center justify-between text-2xs uppercase tracking-eyebrow text-muted-foreground">
            <span>Échéances à venir · couverture</span>
            <span className="hidden sm:inline">Cliquez pour ouvrir</span>
          </div>
          <div className="-mx-1 flex gap-1 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {upcoming.map((b) => {
              const dot =
                b.coverage === "covered"
                  ? "bg-success"
                  : b.coverage === "partial"
                    ? "bg-warm"
                    : "bg-destructive";
              return (
                <button
                  key={b.id}
                  onClick={() => onPickMonth(b.year, b.monthIdx)}
                  title={`${b.label} · couverture ${b.coveragePct}%`}
                  className="group flex min-w-[140px] shrink-0 items-center gap-2 rounded-lg border border-border/60 bg-card px-2.5 py-2 text-left transition-all hover:-translate-y-0.5 hover:shadow-lift"
                >
                  <span className={"h-1.5 w-1.5 shrink-0 rounded-full " + dot} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold leading-tight">
                      {b.label}
                    </span>
                    <span className="block text-xs uppercase tracking-wide text-muted-foreground">
                      {MONTHS_FR[b.monthIdx]} ·{" "}
                      <span className="tabular-nums text-warm">−{eur(b.amount)}</span>
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span>
              6 mois{" "}
              <span className="tabular-nums font-semibold text-foreground">{eur(total6m)}</span>
            </span>
            <span className="text-muted-foreground/40">·</span>
            <span>
              Provision{" "}
              <span className="tabular-nums font-semibold text-foreground">
                {eur(provisionIn6m)}
              </span>
            </span>
            <span className="text-muted-foreground/40">·</span>
            <span>
              Marge{" "}
              <span
                className={
                  "tabular-nums font-semibold " +
                  (provisionIn6m - total6m >= 0 ? "text-success" : "text-destructive")
                }
              >
                {eur(provisionIn6m - total6m)}
              </span>
            </span>
          </div>
        </div>
      )}
    </section>
  );
}

/* ---- Categories grid — the "why" ---- */

function CategoriesGrid({ cards, mensuelTo }: { cards: CategoryCardView[]; mensuelTo: string }) {
  if (cards.length === 0) return null;
  return (
    <section className="anim-slide-up">
      <header className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg tracking-tight sm:text-xl">Catégories</h2>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            Tendance sur 12 mois glissants (plein = réel, pointillé = anticipé) · le chip = écart au
            budget. Clic pour le détail.
          </p>
        </div>
        <Link to={mensuelTo} className="text-xs text-primary underline-offset-4 hover:underline">
          Vue mensuelle →
        </Link>
      </header>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {cards.map((c) => (
          <CategoryMiniCard key={c.key} card={c} mensuelTo={mensuelTo} />
        ))}
      </div>
    </section>
  );
}

function CategoryMiniCard({ card, mensuelTo }: { card: CategoryCardView; mensuelTo: string }) {
  const vsBudget = card.budget > 0 ? Math.round((card.avgSpent / card.budget - 1) * 100) : 0;
  const over = vsBudget > 5;
  const under = vsBudget < -5;
  const budgetChip = over
    ? "bg-warm/15 text-warm"
    : under
      ? "bg-success/15 text-success"
      : "bg-secondary text-muted-foreground";
  const first = card.trend[0]?.v ?? 0;
  const last = card.trend[card.trend.length - 1]?.v ?? 0;
  const periodDelta = first > 0 ? Math.round((last / first - 1) * 100) : 0;
  const TrendIcon = periodDelta >= 0 ? TrendingUp : TrendingDown;

  return (
    <Link
      to={mensuelTo}
      className="group flex flex-col rounded-xl border border-border/50 bg-card p-3 text-left shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-lift"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-secondary text-foreground/70">
            {card.icon}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{card.label}</p>
            <p className="truncate text-2xs tabular-nums text-muted-foreground">
              {card.budget > 0 ? `Budget ${eur(card.budget)}/mois` : "Pas de budget"}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 flex-col items-end gap-1">
          {card.budget > 0 && (
            <span
              className={
                "rounded-full px-1.5 py-0.5 text-2xs font-semibold tabular-nums " + budgetChip
              }
              title="Écart au budget, moyenne sur 12 mois"
            >
              {vsBudget >= 0 ? "+" : "−"}
              {Math.abs(vsBudget)}%
            </span>
          )}
          {card.yoy !== null && (
            <span className="text-2xs tabular-nums text-muted-foreground" title={card.yoyLabel}>
              {card.yoyLabel} {card.yoy >= 0 ? "+" : "−"}
              {Math.abs(card.yoy)}%
            </span>
          )}
        </div>
      </div>

      {/* Tendance — réel (plein) jusqu'au dernier import, projeté (pointillé) ensuite */}
      <div className="-mx-1 mt-3 h-12">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={card.trend} margin={{ top: 2, right: 2, left: 2, bottom: 0 }}>
            <defs>
              <linearGradient id={`cat-${card.key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={card.color} stopOpacity={0.35} />
                <stop offset="100%" stopColor={card.color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="m" hide />
            <RTooltip
              cursor={{ stroke: "var(--border)" }}
              contentStyle={{
                background: "var(--popover)",
                border: "1px solid var(--border)",
                borderRadius: 10,
                fontSize: 11,
                color: "var(--popover-foreground)",
                padding: "4px 8px",
              }}
              formatter={(val: unknown, name) => [
                typeof val === "number" ? eur(val) : "—",
                name as string,
              ]}
              labelFormatter={(l) => l as string}
            />
            <Area
              type="monotone"
              dataKey="real"
              name="Réel"
              stroke={card.color}
              strokeWidth={1.5}
              fill={`url(#cat-${card.key})`}
              connectNulls={false}
            />
            <Line
              type="monotone"
              dataKey="proj"
              name="Projeté"
              stroke={card.color}
              strokeWidth={1.5}
              strokeDasharray="4 3"
              dot={false}
              connectNulls={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <p
        className="mt-1 flex items-center justify-end gap-1 text-xs tabular-nums text-muted-foreground"
        title="Évolution sur la période affichée"
      >
        <TrendIcon className="h-3 w-3" /> Période {periodDelta >= 0 ? "+" : "−"}
        {Math.abs(periodDelta)}%
      </p>
    </Link>
  );
}

/* ============================ MONTH VIEW ============================ */

function MonthView({
  monthIdx,
  detail,
  planificationTo,
  onPrev,
  onNext,
}: {
  monthIdx: number;
  detail?: MonthDetailView;
  planificationTo: string;
  onPrev: () => void;
  onNext: () => void;
}) {
  // The zoom animation grows out of the month that was clicked in the strip.
  const origin = `${((monthIdx + 0.5) / 12) * 100}% 0%`;

  return (
    <div
      className="space-y-6"
      style={{
        animation: "pop-in 0.45s cubic-bezier(0.2,0.7,0.2,1) both",
        transformOrigin: origin,
      }}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        {detail ? <StateBadge state={detail.state} /> : <span />}
        <div className="flex items-center gap-2">
          <Button onClick={onPrev} variant="outline" size="iconRound">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button onClick={onNext} variant="outline" size="iconRound">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {!detail ? (
        <DataState status="loading" label="le mois" />
      ) : (
        <div className="space-y-6">
          <div className="grid gap-3 sm:grid-cols-3">
            {detail.stats.map((s) => (
              <SmallStat key={s.label} {...s} />
            ))}
          </div>

          {detail.state === "futur" ? (
            <PlannedSection
              planned={detail.planned ?? []}
              byDay={detail.plannedByDay ?? []}
              planificationTo={planificationTo}
            />
          ) : (
            <CategoriesSection
              categories={detail.categories}
              progress={detail.progress}
              closed={detail.state === "passe"}
            />
          )}

          {detail.bills.length > 0 && (
            <BillsBar
              bills={detail.bills}
              label={
                detail.state === "passe" ? "Échéances réalisées ce mois" : "Échéances de ce mois"
              }
            />
          )}
        </div>
      )}
    </div>
  );
}

function StateBadge({ state }: { state: MonthDetailView["state"] }) {
  const cfg =
    state === "passe"
      ? { label: "Mois clos · rapport", cls: "bg-secondary text-foreground/70", Icon: CheckCircle2 }
      : state === "en-cours"
        ? {
            label: "En cours · réel + projection",
            cls: "bg-primary/10 text-primary ring-1 ring-primary/30",
            Icon: Clock,
          }
        : { label: "À venir · projection", cls: "bg-warm/10 text-warm", Icon: CalendarClock };
  return (
    <span className={"inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs " + cfg.cls}>
      <cfg.Icon className="h-3.5 w-3.5" /> {cfg.label}
    </span>
  );
}

/** Passé and En cours share one shape: spending per category. What differs is
    whether the bar shows a variance (closed) or a frontier (running). */
function CategoriesSection({
  categories,
  progress,
  closed,
}: {
  categories: MonthCategoryView[];
  progress?: { day: number; total: number };
  closed: boolean;
}) {
  return (
    <Card
      variant="solid"
      title={closed ? "Prévu vs réel" : "Réel à date + projection"}
      subline={
        closed
          ? "Variance par catégorie pour ce mois clos."
          : "La barre marque la frontière entre les deux."
      }
      trailing={
        progress ? (
          <Eyebrow size="xs">
            Jour {progress.day}/{progress.total}
          </Eyebrow>
        ) : undefined
      }
    >
      {categories.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {closed ? "Aucune dépense pour ce mois." : "Aucune dépense enregistrée à ce jour."}
        </p>
      ) : (
        <ul className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {[...categories]
            .sort((a, b) => a.label.localeCompare(b.label, "fr"))
            .map((c) => {
              const hasBudget = c.budget > 0;
              const over = closed && hasBudget && c.actual > c.budget;
              const ref = hasBudget ? c.budget : c.actual;
              const pct = closed
                ? hasBudget
                  ? Math.min(100, (c.actual / c.budget) * 100)
                  : 100
                : ref > 0
                  ? Math.min(100, (c.actual / ref) * 100)
                  : 0;
              return (
                <li
                  key={c.key}
                  className={
                    "rounded-xl border bg-card/40 px-3 py-3 " +
                    (over ? "border-warm/30" : "border-border/40")
                  }
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={
                        "grid h-9 w-9 place-items-center rounded-full " +
                        (over ? "bg-warm/15 text-warm" : "bg-secondary text-foreground/70")
                      }
                    >
                      {c.icon}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <p className="truncate font-semibold">{c.label}</p>
                        {closed ? (
                          <p className="shrink-0 text-sm tabular-nums">
                            <span className={over ? "font-semibold text-warm" : ""}>
                              {eur(c.actual)}
                            </span>
                            {hasBudget && (
                              <span className="text-muted-foreground"> / {eur(c.budget)}</span>
                            )}
                          </p>
                        ) : (
                          <p className="shrink-0 text-xs tabular-nums text-muted-foreground">
                            <span className="text-foreground">{eur(c.actual)}</span>
                            {hasBudget && (
                              <span className="opacity-60">
                                {" "}
                                + {eur(Math.max(0, c.budget - c.actual))} prévu
                              </span>
                            )}
                          </p>
                        )}
                      </div>
                      {closed ? (
                        <BudgetBar value={pct} overflow={over ? Math.min(100, pct - 100) : 0} />
                      ) : (
                        <BudgetBar value={pct} projected={100} />
                      )}
                    </div>
                  </div>
                </li>
              );
            })}
        </ul>
      )}
    </Card>
  );
}

/** Futur — nothing happened yet, so the plan is all there is to show. */
function PlannedSection({
  planned,
  byDay,
  planificationTo,
}: {
  planned: MonthPlannedView[];
  byDay: { d: number; v: number }[];
  planificationTo: string;
}) {
  return (
    <section className="rounded-2xl border border-dashed border-border/60 bg-card/60 p-5 shadow-soft sm:p-7">
      <header className="mb-4 flex items-end justify-between gap-3">
        <div>
          <h3 className="text-lg tracking-tight">Postes prévus</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Projection issue de la Planification — aucune réelle dépense.
          </p>
        </div>
        <Link
          to={planificationTo}
          className="text-xs text-primary underline-offset-4 hover:underline"
        >
          Modifier →
        </Link>
      </header>

      {planned.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Aucun poste planifié ce mois-ci. La Planification alimentera cette projection.
        </p>
      ) : (
        <ul className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {[...planned]
            .sort((a, b) => a.label.localeCompare(b.label, "fr"))
            .map((g) => (
              <li key={g.key} className="rounded-xl border border-border/40 bg-card/40 px-3 py-3">
                <div className="flex items-center gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-secondary text-foreground/70">
                    {g.icon}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="truncate font-semibold">{g.label}</p>
                      <p className="shrink-0 text-sm tabular-nums text-warm">{eur(g.total)}</p>
                    </div>
                    <p className="mt-0.5 text-xs text-muted-foreground">{g.postes.join(" · ")}</p>
                  </div>
                </div>
              </li>
            ))}
        </ul>
      )}

      {byDay.length > 0 && (
        <div className="mt-5 h-32 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={byDay} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="futurGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--warm)" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="var(--warm)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="d"
                stroke="var(--muted-foreground)"
                fontSize={10}
                tickLine={false}
                axisLine={false}
              />
              <YAxis hide />
              <Area
                type="monotone"
                dataKey="v"
                stroke="var(--warm)"
                strokeWidth={1.5}
                fill="url(#futurGrad)"
                strokeDasharray="4 3"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  );
}

function BillsBar({ bills, label }: { bills: { label: string; amount: number }[]; label: string }) {
  return (
    <Card variant="solid" as="section">
      <Eyebrow size="xs">{label}</Eyebrow>
      <div className="mt-3 flex flex-wrap gap-2">
        {bills.map((b, i) => (
          <span
            key={i}
            className="inline-flex items-center gap-2 rounded-full border border-warm/30 bg-warm/10 px-3 py-1.5 text-sm text-warm"
          >
            {b.label}
            <span className="font-semibold tabular-nums">−{eur(b.amount)}</span>
          </span>
        ))}
      </div>
    </Card>
  );
}

function SmallStat({ label, value, tone, hint, signed }: MonthStatView) {
  const cls =
    tone === "warm"
      ? "text-warm"
      : tone === "mustard"
        ? "text-mustard"
        : tone === "success"
          ? "text-success"
          : "text-foreground";
  return (
    <Card as="div">
      <Eyebrow size="xs">{label}</Eyebrow>
      <p className={"mt-2 text-xl tracking-tight tabular-nums " + cls}>
        {signed && value > 0 ? "+" : ""}
        <CountUp to={Math.round(value)} />
        <span className="ml-1 text-sm text-muted-foreground">€</span>
      </p>
      {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
    </Card>
  );
}
