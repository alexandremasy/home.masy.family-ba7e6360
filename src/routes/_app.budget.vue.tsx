import { createFileRoute, Link, Outlet } from "@tanstack/react-router";
import { useMemo, useState } from "react";
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
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  PiggyBank,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle2,
  CalendarClock,
} from "lucide-react";
import { CountUp } from "@/components/count-up";
import {
  categories,
  postesSeed,
  MONTHS_FR,
  MONTHS_FR_LONG,
  eur,
  temporalState,
  currentMonthIdx,
  currentYear,
  incomeSources,
  annualisationProvision,
  annualVerdict,
  dataFreshness,
  viewTitle,
  flowsSeries,
  upcomingBills,
  nonMonthlyBills,
  categoryTrend12,
  categoryYoY,
  type TemporalState,
  type UpcomingBill,
  type BudgetView,
} from "@/lib/budget-data";
import { Button } from "@/components/button";
import { BudgetBar } from "@/components/budget-bar";
import { Eyebrow } from "@/components/eyebrow";
import { Card } from "@/components/card";

export const Route = createFileRoute("/_app/budget/vue")({
  component: VuePage,
  head: () => ({
    meta: [
      { title: "Vue d'ensemble — Budget" },
      {
        name: "description",
        content: "Trajectoire de l'année, échéances à venir et épargne — d'un coup d'œil.",
      },
    ],
  }),
});

// Navigator: rolling budget first (default), then calendar years going back.
const NAV_VIEWS: BudgetView[] = [
  "rolling",
  currentYear,
  currentYear - 1,
  currentYear - 2,
  currentYear - 3,
];

function VuePage() {
  const [navIdx, setNavIdx] = useState(0);
  const [zoom, setZoom] = useState<{ year: number; monthIdx: number } | null>(null);
  const view = NAV_VIEWS[navIdx];

  return (
    // Full-bleed stage with the anniversaires-style teal wash header: cancel the
    // shell px so the wash reaches edge to edge, the inner wrapper re-adds padding.
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
                onClick={() => setZoom(null)}
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
                  viewTitle(view)
                ) : (
                  <>
                    <button
                      onClick={() => setZoom(null)}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {viewTitle(view)}
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
                onClick={() => setNavIdx((i) => Math.max(0, i - 1))}
                disabled={navIdx === 0}
                aria-label="Vers le glissant"
                variant="outline"
                size="iconRound"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                onClick={() => setNavIdx((i) => Math.min(NAV_VIEWS.length - 1, i + 1))}
                disabled={navIdx === NAV_VIEWS.length - 1}
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
            <YearView view={view} onPickMonth={(year, monthIdx) => setZoom({ year, monthIdx })} />
          </div>
          <div
            className={
              (zoom !== null ? "opacity-100 block" : "hidden") + " transition-opacity duration-300"
            }
          >
            {zoom !== null && (
              <MonthView
                key={`${zoom.year}-${zoom.monthIdx}`}
                year={zoom.year}
                monthIdx={zoom.monthIdx}
                onPrev={() =>
                  setZoom(
                    (z) =>
                      z &&
                      (z.monthIdx > 0
                        ? { ...z, monthIdx: z.monthIdx - 1 }
                        : { year: z.year - 1, monthIdx: 11 }),
                  )
                }
                onNext={() =>
                  setZoom(
                    (z) =>
                      z &&
                      (z.monthIdx < 11
                        ? { ...z, monthIdx: z.monthIdx + 1 }
                        : { year: z.year + 1, monthIdx: 0 }),
                  )
                }
              />
            )}
          </div>
        </div>

        {/* Nested modal routes (e.g. /budget/vue/reserve) render here, over the vue */}
        <Outlet />
      </div>
    </div>
  );
}

/* ============================ YEAR VIEW ============================ */

function YearView({
  view,
  onPickMonth,
}: {
  view: BudgetView;
  onPickMonth: (year: number, monthIdx: number) => void;
}) {
  const verdict = useMemo(() => annualVerdict(view), [view]);
  const flows = useMemo(() => flowsSeries(view), [view]);
  const upcoming = useMemo(() => upcomingBills(12), []);
  const provision = annualisationProvision(postesSeed);

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* FLUX — verdict integrated on top, then the glissant curve; + categories drill-down.
          The Réserve verdict box links to its own page (/budget/reserve), room-page style. */}
      <FluxBlock
        verdict={verdict}
        flows={flows}
        upcoming={upcoming}
        provision={provision}
        view={view}
        onPickMonth={onPickMonth}
      />
      <CategoriesGrid />
    </div>
  );
}

/* ---- 1. Verdict header — integrated into the Flux block; the curve is its gauge ---- */

const axisCls = {
  ok: { fg: "text-success", dot: "bg-success", bg: "bg-success/15" },
  warn: { fg: "text-warm", dot: "bg-warm", bg: "bg-warm/15" },
  over: { fg: "text-destructive", dot: "bg-destructive", bg: "bg-destructive/15" },
} as const;

function AxisStatus({
  axis,
  to,
}: {
  axis: ReturnType<typeof annualVerdict>["axes"][number];
  to?: { view: BudgetView };
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
        to="/budget/vue/reserve"
        search={to}
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

// Same look as the default recharts tooltip, but shows each metric once: at the
// junction month both réel and projeté carry a value (for line continuity) — we pick
// réel when present, else projeté. Recharts' default can't drop the duplicate row.
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

/* Two independent statuses — each: the number (hero) + a status tag + a human line.
   The Réserve box links to its own page (/budget/reserve), carrying the current view. */
function VerdictAxes({
  verdict,
  view,
}: {
  verdict: ReturnType<typeof annualVerdict>;
  view: BudgetView;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {verdict.axes.map((a) => (
        <AxisStatus key={a.label} axis={a} to={a.label === "Réserve" ? { view } : undefined} />
      ))}
    </div>
  );
}

function SecondaryReading({
  label,
  primary,
  secondary,
  tone,
}: {
  label: string;
  primary: string;
  secondary?: string;
  tone: "primary" | "warm" | "mustard" | "success" | "destructive";
}) {
  const cls =
    tone === "warm"
      ? "text-warm"
      : tone === "success"
        ? "text-success"
        : tone === "destructive"
          ? "text-destructive"
          : "text-foreground";
  return (
    <div className="rounded-xl bg-secondary/40 p-3 lg:bg-transparent lg:p-0">
      <Eyebrow size="xs">{label}</Eyebrow>
      <p className={"mt-1 text-lg leading-none tabular-nums sm:text-xl " + cls}>{primary}</p>
      {secondary && (
        <p className="mt-1.5 text-xs tabular-nums text-muted-foreground">{secondary}</p>
      )}
    </div>
  );
}

function MicroStat({
  label,
  primary,
  secondary,
  tone,
}: {
  label: string;
  primary: string;
  secondary?: string;
  tone: "primary" | "warm" | "mustard" | "success" | "destructive";
}) {
  const cls =
    tone === "warm"
      ? "text-warm"
      : tone === "success"
        ? "text-success"
        : tone === "destructive"
          ? "text-destructive"
          : "text-foreground";
  return (
    <div className="rounded-xl bg-secondary/40 p-2.5 lg:bg-transparent lg:p-0">
      <Eyebrow size="xs" className="sm:text-2xs">
        {label}
      </Eyebrow>
      <p className={"mt-1 text-lg leading-none tabular-nums sm:text-lg " + cls}>{primary}</p>
      {secondary && <p className="mt-1 text-2xs tabular-nums text-muted-foreground">{secondary}</p>}
    </div>
  );
}

/* ---- 2. Consolidated year charts: flux + épargne (R2) ---- */

function useYAxis(values: number[], step = 15000) {
  return useMemo(() => {
    const top = Math.max(step, Math.ceil(Math.max(...values, 0) / step) * step);
    return { yTop: top, yTicks: Array.from({ length: top / step + 1 }, (_, i) => i * step) };
  }, [values.join(",")]); // eslint-disable-line react-hooks/exhaustive-deps
}

function FluxBlock({
  verdict,
  flows,
  upcoming,
  provision,
  view,
  onPickMonth,
}: {
  verdict: ReturnType<typeof annualVerdict>;
  flows: ReturnType<typeof flowsSeries>;
  upcoming: UpcomingBill[];
  provision: number;
  view: BudgetView;
  onPickMonth: (year: number, monthIdx: number) => void;
}) {
  const total6m = upcoming.filter((b) => b.monthsAway < 6).reduce((s, b) => s + b.amount, 0);
  const provisionIn6m = provision * 6;
  const flowAxis = useYAxis(
    flows.flatMap((f) => [f.inReel ?? 0, f.inProj ?? 0, f.depReel ?? 0, f.depProj ?? 0]),
    2000,
  );
  const monthlyBudget = categories.reduce((s, c) => s + c.budget, 0);
  const lastImportX = flows.find((f) => f.isLastImport)?.m;
  const todayX = flows.find((f) => f.isToday)?.m;
  const freshness = dataFreshness();
  return (
    <Card
      className="anim-slide-up"
      title="Santé de l'année"
      subline={`Sur base des imports jusqu'à ${freshness.lastMonth} — la suite est projetée.`}
    >
      {/* Verdict integrated at the top — the curve below is its gauge */}
      <VerdictAxes verdict={verdict} view={view} />

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
                stroke="var(--mustard)"
                strokeWidth={2.5}
                dot={false}
                name="Dépenses"
                connectNulls={false}
              />
              <Line
                type="monotone"
                dataKey="depProj"
                stroke="var(--mustard)"
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

      {/* Échéances strip — same compact language as the months: what's coming + coverage */}
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
              const year = Math.floor((currentMonthIdx + b.monthsAway) / 12) + currentYear;
              return (
                <button
                  key={b.id}
                  onClick={() => onPickMonth(year, b.monthIdx)}
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
    </Card>
  );
}

/* ---- 5. Categories grid — the "why" (R7) ---- */

function CategoriesGrid() {
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
        <Link
          to="/budget/mensuel"
          className="text-xs text-primary underline-offset-4 hover:underline"
        >
          Vue mensuelle →
        </Link>
      </header>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {categories.map((c) => (
          <CategoryMiniCard key={c.key} cat={c} />
        ))}
      </div>
    </section>
  );
}

function CategoryMiniCard({ cat }: { cat: (typeof categories)[number] }) {
  const Icon = cat.icon;
  // Glissant reading — this is NOT a single month: a trailing-12-month TREND (où dépense-t-on plus ?)
  // + how the average sits vs the budget (au-dessus / en-dessous des prévisions) + a year-over-year
  // delta (vs l'an dernier). No progress bar (meaningless without a fixed-year cumul).
  const trend = categoryTrend12(cat);
  const avg = Math.round(trend.reduce((s, p) => s + p.v, 0) / trend.length);
  const vsBudget = cat.budget > 0 ? Math.round((avg / cat.budget - 1) * 100) : 0;
  const over = vsBudget > 5;
  const under = vsBudget < -5;
  const yoy = categoryYoY(cat);
  const budgetChip = over
    ? "bg-warm/15 text-warm"
    : under
      ? "bg-success/15 text-success"
      : "bg-secondary text-muted-foreground";
  // Évolution sur la période affichée (début → fin de la fenêtre glissante).
  const periodDelta =
    trend[0].v > 0 ? Math.round((trend[trend.length - 1].v / trend[0].v - 1) * 100) : 0;
  const TrendIcon = periodDelta >= 0 ? TrendingUp : TrendingDown;

  return (
    <Card
      to="/budget/mensuel"
      icon={<Icon className="h-4 w-4" />}
      title={cat.label}
      subline={`Budget ${eur(cat.budget)}/mois`}
      action={
        <div className="flex shrink-0 flex-col items-end gap-1">
          <span
            className={
              "rounded-full px-1.5 py-0.5 text-2xs font-semibold tabular-nums " + budgetChip
            }
            title="Écart au budget, moyenne sur 12 mois"
          >
            {vsBudget >= 0 ? "+" : "−"}
            {Math.abs(vsBudget)}%
          </span>
          <span
            className="text-2xs tabular-nums text-muted-foreground"
            title={`Vs ${currentYear - 1}`}
          >
            vs {currentYear - 1} {yoy >= 0 ? "+" : "−"}
            {Math.abs(yoy)}%
          </span>
        </div>
      }
    >
      {/* Tendance — 12 mois glissants : réel (plein) jusqu'au dernier import, projeté (pointillé) ensuite */}
      <div className="-mx-1 h-12">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={trend} margin={{ top: 2, right: 2, left: 2, bottom: 0 }}>
            <defs>
              <linearGradient id={`cat-${cat.key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={cat.color} stopOpacity={0.35} />
                <stop offset="100%" stopColor={cat.color} stopOpacity={0} />
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
              stroke={cat.color}
              strokeWidth={1.5}
              fill={`url(#cat-${cat.key})`}
              connectNulls={false}
            />
            <Line
              type="monotone"
              dataKey="proj"
              name="Projeté"
              stroke={cat.color}
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
    </Card>
  );
}

/* keep unused-import guards happy */
void incomeSources;
void nonMonthlyBills;
void ArrowRight;
void Sparkles;
void CheckCircle2;
void Clock;

/* ============================ MONTH VIEW ============================ */

function MonthView({
  year,
  monthIdx,
  onPrev,
  onNext,
}: {
  year: number;
  monthIdx: number;
  onPrev: () => void;
  onNext: () => void;
}) {
  const state = temporalState(monthIdx, year);
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
        <StateBadge state={state} />
        <div className="flex items-center gap-2">
          <Button onClick={onPrev} disabled={monthIdx === 0} variant="outline" size="iconRound">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button onClick={onNext} disabled={monthIdx === 11} variant="outline" size="iconRound">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {state === "passe" && <PasseView monthIdx={monthIdx} />}
      {state === "en-cours" && <EnCoursView monthIdx={monthIdx} />}
      {state === "futur" && <FuturView monthIdx={monthIdx} />}
    </div>
  );
}

function StateBadge({ state }: { state: TemporalState }) {
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

/* ---- Passé ---- */
function PasseView({ monthIdx }: { monthIdx: number }) {
  const entrees = incomeSources.reduce((s, i) => s + i.value, 0);
  const totalActual = categories.reduce((s, c) => s + c.actual, 0);
  const totalBudget = categories.reduce((s, c) => s + c.budget, 0);
  const delta = totalActual - totalBudget;
  const bills = nonMonthlyBills(postesSeed, monthIdx);

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-3">
        <SmallStat label="Entrées" value={entrees} tone="primary" />
        <SmallStat label="Dépenses" value={totalActual} tone="mustard" />
        <SmallStat
          label="Écart vs prévu"
          value={delta}
          tone={delta > 0 ? "warm" : "success"}
          signed
        />
      </div>

      <Card
        variant="solid"
        title="Prévu vs réel"
        subline="Variance par catégorie pour ce mois clos."
      >
        <ul className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {[...categories]
            .sort((a, b) => a.label.localeCompare(b.label, "fr"))
            .map((c) => {
              const over = c.actual > c.budget;
              const pct = Math.min(100, (c.actual / c.budget) * 100);
              const Icon = c.icon;
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
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <p className="truncate font-semibold">{c.label}</p>
                        <p className="shrink-0 text-sm tabular-nums">
                          <span className={over ? "font-semibold text-warm" : ""}>
                            {eur(c.actual)}
                          </span>
                          <span className="text-muted-foreground"> / {eur(c.budget)}</span>
                        </p>
                      </div>
                      <BudgetBar value={pct} overflow={over ? Math.min(100, pct - 100) : 0} />
                    </div>
                  </div>
                </li>
              );
            })}
        </ul>
      </Card>

      {bills.length > 0 && <BillsBar bills={bills} label="Échéances réalisées ce mois" />}
    </div>
  );
}

/* ---- En cours ---- */
function EnCoursView({ monthIdx }: { monthIdx: number }) {
  const day = new Date().getDate();
  const total = new Date(currentYear, currentMonthIdx + 1, 0).getDate();
  const progress = day / total;
  const fullActual = categories.reduce((s, c) => s + c.actual, 0);
  const dejaDepense = Math.round(fullActual * progress);
  const encorePrevu = Math.round(categories.reduce((s, c) => s + c.budget, 0) * (1 - progress));
  const entrees = incomeSources.reduce((s, i) => s + i.value, 0);
  const bills = nonMonthlyBills(postesSeed, monthIdx);

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-3">
        <SmallStat label="Entrées" value={entrees} tone="primary" />
        <SmallStat
          label="Déjà dépensé"
          value={dejaDepense}
          tone="mustard"
          hint={`${Math.round(progress * 100)}% du mois`}
        />
        <SmallStat label="Encore prévu" value={encorePrevu} tone="primary" hint="projection" />
      </div>

      <Card
        variant="solid"
        title="Réel à date + projection"
        subline="La barre marque la frontière entre les deux."
        action={
          <Eyebrow size="xs">
            Jour {day}/{total}
          </Eyebrow>
        }
      >
        <ul className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {[...categories]
            .sort((a, b) => a.label.localeCompare(b.label, "fr"))
            .map((c) => {
              const realPct = Math.min(100, ((c.actual * progress) / c.budget) * 100);
              const projPct = Math.min(100, (c.budget / c.budget) * 100);
              const Icon = c.icon;
              return (
                <li key={c.key} className="rounded-xl border border-border/40 bg-card/40 px-3 py-3">
                  <div className="flex items-center gap-3">
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-secondary text-foreground/70">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <p className="truncate font-semibold">{c.label}</p>
                        <p className="shrink-0 text-xs tabular-nums text-muted-foreground">
                          <span className="text-foreground">
                            {eur(Math.round(c.actual * progress))}
                          </span>
                          <span className="opacity-60">
                            {" "}
                            + {eur(c.budget - Math.round(c.actual * progress))} prévu
                          </span>
                        </p>
                      </div>
                      <BudgetBar value={realPct} projected={projPct} />
                    </div>
                  </div>
                </li>
              );
            })}
        </ul>
      </Card>

      {bills.length > 0 && <BillsBar bills={bills} label="Échéances de ce mois" />}
    </div>
  );
}

/* ---- Futur ---- */
function FuturView({ monthIdx }: { monthIdx: number }) {
  const ofMonth = postesSeed.filter((p) => p.months.includes(monthIdx));
  const prevuTotal = ofMonth.reduce((s, p) => s + p.amount, 0);
  const byCat = ofMonth.reduce<
    Record<string, { label: string; total: number; postes: typeof ofMonth }>
  >((acc, p) => {
    const c = categories.find((c) => c.key === p.category)!;
    acc[c.key] ??= { label: c.label, total: 0, postes: [] };
    acc[c.key].total += p.amount;
    acc[c.key].postes.push(p);
    return acc;
  }, {});

  const synth = Array.from({ length: 30 }, (_, i) => ({ d: i + 1, v: 0 }));
  ofMonth.forEach((p) => {
    const day = ((p.id.charCodeAt(2) ?? 0) % 28) + 1;
    synth[day - 1].v += p.amount;
  });

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-3">
        <SmallStat label="Entrées prévues" value={5200} tone="primary" hint="salaire net" />
        <SmallStat
          label="Dépenses prévues"
          value={prevuTotal}
          tone="mustard"
          hint={`${ofMonth.length} postes`}
        />
        <SmallStat
          label="Net projeté"
          value={5200 - prevuTotal}
          tone={5200 - prevuTotal >= 0 ? "success" : "warm"}
        />
      </div>

      <Card
        className="border-dashed"
        title="Postes prévus"
        subline="Projection issue de la Planification — aucune réelle dépense."
        action={
          <Link
            to="/budget/planification"
            className="text-xs text-primary underline-offset-4 hover:underline"
          >
            Modifier →
          </Link>
        }
      >
        {ofMonth.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucun poste planifié ce mois-ci.</p>
        ) : (
          <ul className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {Object.entries(byCat)
              .sort((a, b) => a[1].label.localeCompare(b[1].label, "fr"))
              .map(([k, g]) => {
                const cat = categories.find((c) => c.key === k)!;
                const Icon = cat.icon;
                return (
                  <li key={k} className="rounded-xl border border-border/40 bg-card/40 px-3 py-3">
                    <div className="flex items-center gap-3">
                      <span className="grid h-9 w-9 place-items-center rounded-full bg-secondary text-foreground/70">
                        <Icon className="h-4 w-4" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-baseline justify-between gap-2">
                          <p className="truncate font-semibold">{g.label}</p>
                          <p className="shrink-0 text-sm tabular-nums text-warm">{eur(g.total)}</p>
                        </div>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {g.postes.map((p) => p.label).join(" · ")}
                        </p>
                      </div>
                    </div>
                  </li>
                );
              })}
          </ul>
        )}

        <div className="mt-5 h-32 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={synth} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="futurGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--mustard)" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="var(--mustard)" stopOpacity={0} />
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
                stroke="var(--mustard)"
                strokeWidth={1.5}
                fill="url(#futurGrad)"
                strokeDasharray="4 3"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  );
}

function BillsBar({ bills, label }: { bills: { label: string; amount: number }[]; label: string }) {
  return (
    <Card variant="solid">
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

function SmallStat({
  label,
  value,
  tone,
  hint,
  signed,
}: {
  label: string;
  value: number;
  tone: "primary" | "warm" | "mustard" | "success";
  hint?: string;
  signed?: boolean;
}) {
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
        <CountUp to={value} />
        <span className="ml-1 text-sm text-muted-foreground">€</span>
      </p>
      {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
    </Card>
  );
}
