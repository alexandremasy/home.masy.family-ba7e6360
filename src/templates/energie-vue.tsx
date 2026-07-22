import { Link } from "@tanstack/react-router";
import { useMemo, useState, type ReactNode } from "react";
import { AreaChart, Area, BarChart, Bar, Cell, XAxis, YAxis, ReferenceLine } from "recharts";
import {
  AlertTriangle,
  ArrowRight,
  CalendarDays,
  Check,
  Droplet,
  Flame,
  Loader2,
  Moon,
  Pencil,
  Sparkles,
  Sun,
  SunMedium,
  X,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/button";
import { Card } from "@/components/card";
import { ChartContainer, ChartTooltip } from "@/components/chart";
import { DataState } from "@/components/data-state";
import { Eyebrow } from "@/components/eyebrow";
import { Input } from "@/components/input";
import { PageHeader } from "@/components/page-header";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/table";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/tabs";
import { TrendBadge, type TrendDirection } from "@/components/trend-badge";

/* ─────────────────────────────────────────────────────────────────────────────
   Énergie, as a page — what the house consumed and what is left in the tank.

   Its props are its OWN shapes and every judgement arrives made: a trend is a
   direction, a low tank is `alert`, a month with no reading is a `null` value.
   The page never decides whether 22% is low, and it never guesses a missing
   month: a null is drawn as a gap, a projection arrives flagged as one.

   The domain of the history chart is view state and stays here — nothing is
   fetched for it, the three series are passed together. What IS the caller's is
   the relevé correction: the row goes back out as values, and whether that
   reaches a mock store or an upsert is none of the page's business.
   ──────────────────────────────────────────────────────────────────────────── */

/** The three meters the house tracks. */
export type EnergieDomain = "elec" | "eau" | "mazout";

/** One month of the 12-month rolling history. */
export interface EnergieHistoryPointView {
  /** Short month label — "Jan". */
  label: string;
  year: number;
  /** The consumption, or `null` when nothing is known for that month. */
  value: number | null;
  /** Estimated rather than recorded — drawn dashed, and legended as such. */
  projected: boolean;
}

/** The electricity card. */
export interface EnergieElectricityView {
  /** Daily average over the covered period, kWh. */
  dailyKWh: number;
  /** Total over the covered month, kWh. */
  monthKWh: number;
  /** Day-rate meter over the covered month, kWh. */
  dayKWh: number;
  /** Night-rate meter over the covered month, kWh. */
  nightKWh: number;
  trend: TrendDirection;
  trendPct: number;
}

/** The water card. */
export interface EnergieWaterView {
  /** Daily average over the covered period, m³. */
  dailyM3: number;
  /** Total over the covered month, m³. */
  monthM3: number;
  trend: TrendDirection;
  trendPct: number;
}

/** The fuel-oil card — a level, not a counter. */
export interface EnergieOilView {
  /** Tank level, 0–100. */
  tankPct: number;
  /** Litres left in the tank. */
  tankLiters: number;
  /** Tank size, litres. */
  tankCapacity: number;
  /** Litres burnt over the last recorded month, `null` when unknown. */
  lastMonthLiters: number | null;
  /** Days of autonomy left at the recent rate, `null` when unknown. */
  autonomyDays: number | null;
  /** Low enough to warrant an order. The threshold is the caller's. */
  alert: boolean;
}

/** One monthly reading, as it was entered. */
export interface EnergieReleveView {
  /** Reading date, ISO `yyyy-mm-dd`. Identifies the row and is not editable. */
  date: string;
  /** Water meter, m³. */
  eau: number;
  /** Day-rate electricity meter, kWh. */
  jour: number;
  /** Night-rate electricity meter, kWh. */
  nuit: number;
  /** Fuel-oil tank level, %. */
  mazout: number;
  /** Solar injected on the grid, kWh. Absent everywhere hides the column. */
  solar?: number;
}

/** The four (or five) values a correction hands back. */
export type EnergieReleveValues = Omit<EnergieReleveView, "date">;

export interface EnergieVueProps {
  /** A monthly reading is overdue — swaps the header line for the call to action. */
  due: boolean;
  /** Date of the latest reading, ISO. `null` when nothing has ever been recorded. */
  lastReadingDate: string | null;
  electricity: EnergieElectricityView;
  water: EnergieWaterView;
  oil: EnergieOilView;
  /** The three rolling series, passed together — switching domain fetches nothing. */
  history: Record<EnergieDomain, EnergieHistoryPointView[]>;
  /** Where the "Saisir" / "Nouveau relevé" buttons land. */
  saisieTo: string;
  /** The raw readings, newest first. */
  releves: EnergieReleveView[];
  /** The relevés are still on their way. */
  relevesLoading?: boolean;
  /**
   * Persist a correction. Absent, the rows are read-only — a page that cannot write
   * should not show a pencil.
   */
  onSaveReleve?: (date: string, values: EnergieReleveValues) => Promise<void> | void;
  /** The summary and history are still on their way. */
  loading?: boolean;
  /** They failed. Shown instead of the page's body, never as a spinner. */
  error?: boolean;
  /** Retry handler for the failure state. */
  onRetry?: () => void;
}

// ---------- formatting ----------

const num = (n: number, decimals = 0) =>
  new Intl.NumberFormat("fr-BE", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(n);

const MONTH_NAMES = [
  "janvier",
  "février",
  "mars",
  "avril",
  "mai",
  "juin",
  "juillet",
  "août",
  "septembre",
  "octobre",
  "novembre",
  "décembre",
];

const DOMAIN_META: Record<EnergieDomain, { label: string; unit: string; icon: LucideIcon }> = {
  elec: { label: "Électricité", unit: "kWh", icon: Zap },
  eau: { label: "Eau", unit: "m³", icon: Droplet },
  mazout: { label: "Mazout", unit: "L", icon: Flame },
};

// ---------- sparkline ----------

// The last recorded months of a series, as a soft gradient area.
function Sparkline({ data, tone = "primary" }: { data: number[]; tone?: "primary" | "warm" }) {
  const color = tone === "warm" ? "var(--warm)" : "var(--primary)";
  const gid = `spark-fill-${tone}`;
  const chartData = (data.length > 1 ? data : [0, 0]).map((v, i) => ({ i, v }));
  return (
    <ChartContainer
      config={{ v: { color } }}
      className="aspect-auto h-7 w-full [&_.recharts-surface]:overflow-visible"
    >
      <AreaChart data={chartData} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.25} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          dataKey="v"
          type="monotone"
          stroke={color}
          strokeWidth={1.5}
          fill={`url(#${gid})`}
          dot={false}
          isAnimationActive={false}
        />
      </AreaChart>
    </ChartContainer>
  );
}

// The six most recent recorded months — a projection is not a measurement.
const sparkOf = (series: EnergieHistoryPointView[]) =>
  series
    .slice(-6)
    .filter((h) => h.value != null && !h.projected)
    .map((h) => h.value!);

// ---------- history chart ----------

type HistoDatum = {
  label: string;
  year: number;
  value: number;
  hasValue: boolean;
  projected: boolean;
  isNeg: boolean;
  isCurrent: boolean;
};

// Per-bar fill mirrors the states of the legend: recorded (current vs past), solar
// injection (negative), projected (dashed, faded). A month with no value at all
// renders invisible rather than as a zero.
function barStyle(d: HistoDatum): React.SVGProps<SVGRectElement> {
  if (!d.hasValue) return { fillOpacity: 0 };
  if (d.isNeg) {
    return d.projected
      ? {
          fill: "var(--success)",
          fillOpacity: 0.12,
          stroke: "var(--success)",
          strokeOpacity: 0.4,
          strokeDasharray: "4 4",
        }
      : { fill: "var(--success)", fillOpacity: 0.7 };
  }
  if (d.projected) {
    return {
      fill: "var(--muted-foreground)",
      fillOpacity: 0.1,
      stroke: "var(--muted-foreground)",
      strokeOpacity: 0.4,
      strokeDasharray: "4 4",
    };
  }
  return d.isCurrent ? { fill: "var(--primary)" } : { fill: "var(--secondary)" };
}

// Month label under each bar; the latest recorded month is emphasized.
function MonthTick({
  x,
  y,
  payload,
  index,
  currentIdx,
}: {
  // recharts injects x/y/payload/index at render; the JSX only sets currentIdx.
  x?: number;
  y?: number;
  payload?: { value?: string | number };
  index?: number;
  currentIdx: number;
}) {
  return (
    <text
      x={x}
      y={y}
      dy={10}
      textAnchor="middle"
      fontSize={12}
      className={index === currentIdx ? "fill-foreground font-semibold" : "fill-muted-foreground"}
    >
      {payload?.value}
    </text>
  );
}

function HistoTooltip({
  active,
  payload,
  unit,
}: {
  active?: boolean;
  payload?: Array<{ payload: HistoDatum }>;
  unit?: string;
}) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="rounded-lg border border-border/60 bg-popover px-2 py-1 text-xs shadow-lift">
      <p className="font-semibold capitalize">
        {d.label} {d.year}
      </p>
      <p className="tabular-nums text-muted-foreground">
        {d.hasValue ? `${num(d.value, 1)} ${unit}` : "—"}
        {d.isNeg ? " · injection solaire" : ""}
        {d.projected && d.hasValue ? " · projeté" : ""}
      </p>
    </div>
  );
}

// ---------- page ----------

/**
 * The Énergie overview: three meters, a rolling year, and the readings behind them.
 */
export function EnergieVueTemplate({
  due,
  lastReadingDate,
  electricity,
  water,
  oil,
  history,
  saisieTo,
  releves,
  relevesLoading = false,
  onSaveReleve,
  loading = false,
  error = false,
  onRetry,
}: EnergieVueProps) {
  const [domain, setDomain] = useState<EnergieDomain>("elec");

  const lastReading = lastReadingDate ? new Date(lastReadingDate) : null;
  const lastReadingFmt =
    lastReading?.toLocaleDateString("fr-BE", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }) ?? "—";
  // The reading on the 1st covers the previous month.
  const coveredMonth = lastReading
    ? new Date(lastReading.getFullYear(), lastReading.getMonth() - 1, 1)
    : null;
  const coveredMonthLabel =
    coveredMonth?.toLocaleDateString("fr-BE", { month: "long", year: "numeric" }) ?? "";
  const coveredMonthShort = coveredMonth?.toLocaleDateString("fr-BE", { month: "long" }) ?? "";

  const series = history[domain];
  const vals = series.map((h) => h.value).filter((v): v is number => v !== null);
  const maxPos = Math.max(0, ...vals, 1);
  const maxNeg = Math.abs(Math.min(0, ...vals));
  const cfg = DOMAIN_META[domain];
  const DomainIcon = cfg.icon;

  const yearGroups = series.reduce<{ year: number; start: number; end: number }[]>((acc, h, i) => {
    const last = acc[acc.length - 1];
    if (!last || last.year !== h.year) acc.push({ year: h.year, start: i, end: i });
    else last.end = i;
    return acc;
  }, []);

  const latestRecordedIdx = (() => {
    for (let i = series.length - 1; i >= 0; i--) if (!series[i].projected) return i;
    return -1;
  })();

  const hasProjected = series.some((h) => h.projected && h.value != null);

  const chartData: HistoDatum[] = series.map((h, i) => ({
    label: h.label,
    year: h.year,
    value: h.value ?? 0,
    hasValue: h.value != null,
    projected: h.projected,
    isNeg: (h.value ?? 0) < 0,
    isCurrent: i === latestRecordedIdx,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Énergie"
        subtitle="Vue d'ensemble de la consommation"
        icon={<Zap className="h-4 w-4" />}
      />

      {due ? (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-warm p-5 text-warm-foreground sm:p-6 anim-pop-in">
          <div>
            <Eyebrow tone="current" className="opacity-70">
              À faire
            </Eyebrow>
            <p className="mt-1 text-xl">Relevé mensuel à saisir</p>
          </div>
          <Button asChild variant="inverted" className="group gap-2 rounded-full">
            <Link to={saisieTo}>
              Saisir <ArrowRight className="h-4 w-4 icon-hover-x transition-transform" />
            </Link>
          </Button>
        </div>
      ) : (
        <Card
          padding="sm"
          title={
            <span className="inline-flex items-center gap-2 text-sm font-normal text-muted-foreground">
              <CalendarDays className="h-4 w-4" />
              Relevé du <strong className="font-semibold text-foreground">{lastReadingFmt}</strong>
              {coveredMonthLabel && (
                <span className="hidden sm:inline">
                  — consommation de{" "}
                  <strong className="font-semibold text-foreground capitalize">
                    {coveredMonthLabel}
                  </strong>
                </span>
              )}
            </span>
          }
          trailing={
            <Button asChild variant="inverted" size="sm" className="group gap-1.5 rounded-full">
              <Link to={saisieTo}>
                Nouveau relevé{" "}
                <ArrowRight className="h-3.5 w-3.5 icon-hover-x transition-transform" />
              </Link>
            </Button>
          }
        />
      )}

      {error ? (
        <DataState status="error" label="les données d'énergie" onRetry={onRetry} />
      ) : loading ? (
        <DataState status="loading" label="les données d'énergie" />
      ) : (
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="h-10 bg-secondary/70 p-1">
            <TabsTrigger value="dashboard" className="px-4">
              Vue d'ensemble
            </TabsTrigger>
            <TabsTrigger value="relevés" className="px-4">
              Relevés
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6 mt-0">
            <div className="grid gap-5 stagger lg:grid-cols-3">
              {/* ELECTRICITY */}
              <Card
                title="Électricité"
                icon={<Zap className="h-4 w-4 anim-glow" />}
                footer={<Sparkline data={sparkOf(history.elec)} />}
              >
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl tracking-tight">{num(electricity.dailyKWh, 1)}</span>
                  <span className="text-base text-muted-foreground">kWh / jour</span>
                </div>
                <div className="mt-2">
                  <TrendBadge
                    trend={electricity.trend}
                    pct={electricity.trendPct}
                    suffix="vs période préc."
                  />
                </div>

                <p className="mt-2 text-sm text-muted-foreground">
                  <span className="tabular-nums text-foreground">
                    {num(electricity.monthKWh)} kWh
                  </span>{" "}
                  en {coveredMonthLabel || "ce mois"}
                </p>

                <div className="mt-3 grid grid-cols-2 gap-2">
                  <Card variant="inset" padding="sm">
                    <p className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Sun className="h-3.5 w-3.5 text-warm" /> Jour
                    </p>
                    <p className="mt-1 text-lg tabular-nums">
                      {num(electricity.dayKWh)}
                      <span className="ml-1 text-xs text-muted-foreground">kWh</span>
                    </p>
                  </Card>
                  <Card variant="inset" padding="sm">
                    <p className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Moon className="h-3.5 w-3.5 text-foreground/70" /> Nuit
                    </p>
                    <p className="mt-1 text-lg tabular-nums">
                      {num(electricity.nightKWh)}
                      <span className="ml-1 text-xs text-muted-foreground">kWh</span>
                    </p>
                  </Card>
                </div>
              </Card>

              {/* WATER */}
              <Card
                title="Eau"
                icon={<Droplet className="h-4 w-4 anim-float" />}
                footer={<Sparkline data={sparkOf(history.eau)} />}
              >
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl tracking-tight">{num(water.dailyM3, 3)}</span>
                  <span className="text-base text-muted-foreground">m³ / jour</span>
                </div>
                <div className="mt-2">
                  <TrendBadge trend={water.trend} pct={water.trendPct} suffix="vs période préc." />
                </div>
                <p className="mt-2 text-sm text-muted-foreground tabular-nums">
                  ≈ {num(water.dailyM3 * 1000)} L par jour
                </p>

                <Card variant="inset" padding="sm" className="mt-5">
                  <p className="text-sm text-muted-foreground">
                    Total {coveredMonthShort || "ce mois"} —{" "}
                    <strong className="text-foreground tabular-nums">
                      {num(water.monthM3, 2)} m³
                    </strong>
                    <span className="ml-1 tabular-nums">({num(water.monthM3 * 1000)} L)</span>
                  </p>
                </Card>
              </Card>

              {/* OIL */}
              <Card
                title="Mazout"
                icon={
                  <Flame className={"h-4 w-4 " + (oil.alert ? "anim-wiggle" : "anim-breathe")} />
                }
                tone={oil.alert ? "warm" : "primary"}
                className={oil.alert ? "border-warm/40" : undefined}
                footer={
                  <Sparkline data={sparkOf(history.mazout)} tone={oil.alert ? "warm" : "primary"} />
                }
              >
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl tracking-tight">{num(oil.tankPct, 1)}</span>
                  <span className="text-base text-muted-foreground">% citerne</span>
                </div>
                <p className="mt-0.5 text-sm text-muted-foreground tabular-nums">
                  {num(oil.tankLiters)} / {num(oil.tankCapacity)} L
                </p>

                <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-secondary">
                  <div
                    className={
                      "h-full rounded-full transition-all duration-700 " +
                      (oil.alert ? "bg-warm" : "bg-primary")
                    }
                    style={{ width: `${oil.tankPct}%` }}
                  />
                </div>

                {oil.alert && (
                  <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-warm/15 px-2.5 py-1 text-sm text-warm">
                    <span className="relative grid h-5 w-5 place-items-center rounded-full anim-pulse-ring">
                      <AlertTriangle className="h-3.5 w-3.5" />
                    </span>
                    <span className="font-semibold tracking-tight">
                      Niveau faible — prévoir une commande
                    </span>
                  </div>
                )}

                <div className="mt-4 grid grid-cols-2 gap-2">
                  <Card variant="inset" padding="sm">
                    <p className="text-xs text-muted-foreground">Dernier mois</p>
                    <p className="mt-1 text-lg tabular-nums">
                      {oil.lastMonthLiters != null ? (
                        <>
                          {num(oil.lastMonthLiters)}
                          <span className="ml-1 text-xs text-muted-foreground">L</span>
                        </>
                      ) : (
                        "—"
                      )}
                    </p>
                  </Card>
                  <Card variant="inset" padding="sm">
                    <p className="text-xs text-muted-foreground">Autonomie</p>
                    <p className={"mt-1 text-lg tabular-nums " + (oil.alert ? "text-warm" : "")}>
                      {oil.autonomyDays != null ? (
                        <>
                          ~{num(oil.autonomyDays)}
                          <span className="ml-1 text-xs text-muted-foreground">j</span>
                        </>
                      ) : (
                        "—"
                      )}
                    </p>
                  </Card>
                </div>
              </Card>
            </div>

            {/* HISTORY CHART */}
            <Card
              className="anim-slide-up"
              icon={<DomainIcon className="h-4 w-4" />}
              title={`Historique ${cfg.label.toLowerCase()}`}
              subline="12 derniers mois — vue glissante"
              trailing={
                <div className="flex flex-wrap items-center justify-end gap-3">
                  {/* Domain switcher */}
                  <Tabs value={domain} onValueChange={(v) => setDomain(v as EnergieDomain)}>
                    <TabsList className="h-10 bg-secondary/70 p-1">
                      {(Object.keys(DOMAIN_META) as EnergieDomain[]).map((d) => {
                        const Icon = DOMAIN_META[d].icon;
                        return (
                          <TabsTrigger key={d} value={d} className="gap-1.5 px-3">
                            <Icon className="h-3.5 w-3.5" />
                            {DOMAIN_META[d].label}
                          </TabsTrigger>
                        );
                      })}
                    </TabsList>
                  </Tabs>
                  <span className="flex w-full flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-muted-foreground sm:w-auto">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-sm bg-primary" /> Relevé
                    </span>
                    {domain === "elec" && (
                      <span className="inline-flex items-center gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-sm bg-success/70" /> Injection solaire
                      </span>
                    )}
                    {hasProjected && (
                      <span className="inline-flex items-center gap-1.5">
                        <span className="h-2.5 w-2.5 rounded-sm border border-dashed border-muted-foreground/60" />{" "}
                        Projeté
                      </span>
                    )}
                  </span>
                </div>
              }
            >
              <ChartContainer config={{}} className="aspect-auto h-56 w-full">
                <BarChart
                  data={chartData}
                  margin={{ top: 8, right: 0, bottom: 0, left: 0 }}
                  barCategoryGap="18%"
                >
                  <YAxis hide domain={[maxNeg > 0 ? -maxNeg : 0, maxPos]} />
                  <XAxis
                    dataKey="label"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                    interval={0}
                    tick={<MonthTick currentIdx={latestRecordedIdx} />}
                  />
                  {maxNeg > 0 && <ReferenceLine y={0} stroke="var(--border)" />}
                  <ChartTooltip
                    cursor={{ fill: "var(--muted)", fillOpacity: 0.4 }}
                    content={<HistoTooltip unit={cfg.unit} />}
                  />
                  <Bar
                    dataKey="value"
                    maxBarSize={60}
                    radius={[6, 6, 0, 0]}
                    isAnimationActive={false}
                  >
                    {chartData.map((d, i) => (
                      <Cell key={i} {...barStyle(d)} />
                    ))}
                  </Bar>
                </BarChart>
              </ChartContainer>

              {/* Year axis */}
              <div className="mt-2 flex gap-2 sm:gap-3">
                {yearGroups.map((g) => {
                  const span = g.end - g.start + 1;
                  return (
                    <div
                      key={g.year}
                      className="flex min-w-0 items-center justify-center border-t border-border/60 pt-1.5 text-xs uppercase tracking-eyebrow text-muted-foreground"
                      style={{ flex: span }}
                    >
                      {g.year}
                    </div>
                  );
                })}
              </div>

              {hasProjected && (
                <p className="mt-4 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Sparkles className="h-3 w-3" />
                  Les barres en pointillés sont des estimations basées sur la moyenne récente, en
                  l'absence de relevé.
                </p>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="relevés" className="mt-0">
            <ReleveList rows={releves} loading={relevesLoading} onSave={onSaveReleve} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
}

// ---------- Relevés (editable list) ----------
//
// The date is the key and is not editable: a correction fixes what was read, it
// does not move the reading.

type ReleveField = "eau" | "jour" | "nuit" | "mazout" | "solar";
type ReleveFilter = "all" | ReleveField;

const FIELD_META: Record<
  ReleveField,
  { label: string; unit: string; icon: ReactNode; tone: string; decimals: number }
> = {
  eau: {
    label: "Eau",
    unit: "m³",
    icon: <Droplet className="h-3.5 w-3.5" />,
    tone: "text-primary",
    decimals: 2,
  },
  jour: {
    label: "Élec. jour",
    unit: "kWh",
    icon: <Sun className="h-3.5 w-3.5" />,
    tone: "text-warm",
    decimals: 1,
  },
  nuit: {
    label: "Élec. nuit",
    unit: "kWh",
    icon: <Moon className="h-3.5 w-3.5" />,
    tone: "text-foreground/70",
    decimals: 1,
  },
  mazout: {
    label: "Mazout",
    unit: "%",
    icon: <Flame className="h-3.5 w-3.5" />,
    tone: "text-warm",
    decimals: 1,
  },
  solar: {
    label: "Solaire",
    unit: "kWh",
    icon: <SunMedium className="h-3.5 w-3.5" />,
    tone: "text-success",
    decimals: 0,
  },
};

function ReleveList({
  rows,
  loading,
  onSave,
}: {
  rows: EnergieReleveView[];
  loading: boolean;
  onSave?: (date: string, values: EnergieReleveValues) => Promise<void> | void;
}) {
  const [filter, setFilter] = useState<ReleveFilter>("all");
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState<Record<ReleveField, string>>({
    eau: "",
    jour: "",
    nuit: "",
    mazout: "",
    solar: "",
  });
  const [saving, setSaving] = useState(false);

  // Solar is only recorded by some sources; an absent column is not an empty one.
  const hasSolar = rows.some((r) => r.solar != null);
  const fields = useMemo<ReleveField[]>(
    () => (["eau", "jour", "nuit", "mazout"] as ReleveField[]).concat(hasSolar ? ["solar"] : []),
    [hasSolar],
  );
  const visibleCols = useMemo<ReleveField[]>(
    () => (filter === "all" ? fields : [filter]),
    [filter, fields],
  );

  const startEdit = (row: EnergieReleveView) => {
    setEditing(row.date);
    setDraft({
      eau: String(row.eau),
      jour: String(row.jour),
      nuit: String(row.nuit),
      mazout: String(row.mazout),
      solar: row.solar != null ? String(row.solar) : "",
    });
  };
  const cancel = () => setEditing(null);

  const save = async (row: EnergieReleveView) => {
    if (!onSave) return;
    const values = {
      eau: Number(draft.eau),
      jour: Number(draft.jour),
      nuit: Number(draft.nuit),
      mazout: Number(draft.mazout),
      ...(hasSolar ? { solar: Number(draft.solar) } : {}),
    } as EnergieReleveValues;
    setSaving(true);
    try {
      await onSave(row.date, values);
      setEditing(null);
    } catch {
      // The caller owns what a bad value or a failed write means, and says so —
      // the row simply stays open so the correction is not lost.
    } finally {
      setSaving(false);
    }
  };

  const rowActions = (row: EnergieReleveView, isEditing: boolean) => {
    if (!onSave) return null;
    return isEditing ? (
      <div className="inline-flex gap-1">
        <button
          onClick={() => void save(row)}
          disabled={saving}
          className="grid h-7 w-7 place-items-center rounded-md bg-foreground text-background hover:opacity-90 disabled:opacity-60"
          aria-label="Enregistrer"
        >
          {saving ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Check className="h-3.5 w-3.5" />
          )}
        </button>
        <button
          onClick={cancel}
          disabled={saving}
          className="grid h-7 w-7 place-items-center rounded-md border border-border hover:bg-secondary disabled:opacity-60"
          aria-label="Annuler"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    ) : (
      <button
        onClick={() => startEdit(row)}
        className="grid h-7 w-7 place-items-center rounded-md border border-border/60 text-muted-foreground hover:text-foreground hover:bg-secondary"
        aria-label="Modifier"
      >
        <Pencil className="h-3.5 w-3.5" />
      </button>
    );
  };

  const monthOf = (iso: string) => {
    const d = new Date(iso);
    const covered = new Date(d.getFullYear(), d.getMonth() - 1, 1);
    return {
      covered: `${MONTH_NAMES[covered.getMonth()]} ${covered.getFullYear()}`,
      read: d.toLocaleDateString("fr-BE", { day: "numeric", month: "short", year: "numeric" }),
    };
  };

  const value = (row: EnergieReleveView, c: ReleveField) => {
    const v = row[c];
    return v == null ? "—" : num(v, FIELD_META[c].decimals);
  };

  return (
    <Card
      bleed
      title="Historique des relevés"
      subline={loading ? "Chargement…" : `${rows.length} entrées${onSave ? " — modifiables" : ""}`}
      trailing={
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Type</span>
          <Select value={filter} onValueChange={(v) => setFilter(v as ReleveFilter)}>
            <SelectTrigger className="h-9 w-[170px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les types</SelectItem>
              {fields.map((f) => (
                <SelectItem key={f} value={f}>
                  {FIELD_META[f].label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      }
    >
      {loading ? (
        <DataState status="loading" label="les relevés" className="py-10" />
      ) : rows.length === 0 ? (
        <DataState status="empty" label="les relevés" className="py-10" />
      ) : (
        <>
          {/* Desktop: table */}
          <div className="hidden sm:block">
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary/40 hover:bg-secondary/40">
                  <TableHead className="px-5 text-xs uppercase tracking-eyebrow">Date</TableHead>
                  {visibleCols.map((c) => (
                    <TableHead
                      key={c}
                      className="px-3 text-right text-xs uppercase tracking-eyebrow"
                    >
                      <div
                        className={"flex items-center justify-end gap-1.5 " + FIELD_META[c].tone}
                      >
                        {FIELD_META[c].icon}
                        {FIELD_META[c].label}
                        <span className="font-normal normal-case text-muted-foreground/70">
                          {FIELD_META[c].unit}
                        </span>
                      </div>
                    </TableHead>
                  ))}
                  <TableHead className="w-16" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row) => {
                  const isEditing = editing === row.date;
                  const m = monthOf(row.date);
                  return (
                    <TableRow key={row.date}>
                      <TableCell className="px-5 py-3">
                        <p className="font-semibold capitalize">{m.covered}</p>
                        <p className="text-xs text-muted-foreground">{m.read}</p>
                      </TableCell>
                      {visibleCols.map((c) => (
                        <TableCell key={c} className="px-3 py-3 text-right tabular-nums">
                          {isEditing ? (
                            <Input
                              type="number"
                              step="0.1"
                              value={draft[c]}
                              onChange={(e) => setDraft((dr) => ({ ...dr, [c]: e.target.value }))}
                              disabled={saving}
                              className="ml-auto h-8 w-24 text-right"
                            />
                          ) : (
                            <span>{value(row, c)}</span>
                          )}
                        </TableCell>
                      ))}
                      <TableCell className="px-3 py-3 text-right">
                        {rowActions(row, isEditing)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          {/* Mobile: stacked cards (a multi-column table can't fit a phone) */}
          <div className="divide-y divide-border/40 sm:hidden">
            {rows.map((row) => {
              const isEditing = editing === row.date;
              const m = monthOf(row.date);
              return (
                <div key={row.date} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold capitalize">{m.covered}</p>
                      <p className="text-xs text-muted-foreground">{m.read}</p>
                    </div>
                    {rowActions(row, isEditing)}
                  </div>
                  <div
                    className={
                      "mt-3 grid gap-2 " +
                      (visibleCols.length === 1 ? "grid-cols-1" : "grid-cols-2")
                    }
                  >
                    {visibleCols.map((c) => (
                      <div key={c} className="rounded-lg bg-secondary/50 px-3 py-2">
                        <p
                          className={
                            "inline-flex items-center gap-1.5 text-2xs uppercase tracking-eyebrow " +
                            FIELD_META[c].tone
                          }
                        >
                          {FIELD_META[c].icon}
                          {FIELD_META[c].label}
                        </p>
                        {isEditing ? (
                          <Input
                            type="number"
                            step="0.1"
                            value={draft[c]}
                            onChange={(e) => setDraft((dr) => ({ ...dr, [c]: e.target.value }))}
                            disabled={saving}
                            className="mt-1 h-8 w-full tabular-nums"
                          />
                        ) : (
                          <p className="mt-0.5 text-base tabular-nums">
                            {value(row, c)}
                            <span className="ml-1 text-xs text-muted-foreground">
                              {FIELD_META[c].unit}
                            </span>
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </Card>
  );
}
