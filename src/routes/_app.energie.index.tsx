import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/page-header";
import { energie } from "@/lib/mock-data";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/tabs";
import { Input } from "@/components/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/select";
import {
  ArrowRight,
  Droplet,
  Zap,
  Flame,
  TrendingDown,
  TrendingUp,
  Minus,
  AlertTriangle,
  CalendarDays,
  Sun,
  Moon,
  Sparkles,
  Pencil,
  Check,
  X,
  SunMedium,
} from "lucide-react";
import { Button } from "@/components/button";
import { Card } from "@/components/card";
import { Eyebrow } from "@/components/eyebrow";
import { ChartContainer, ChartTooltip } from "@/components/chart";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/table";
import { AreaChart, Area, BarChart, Bar, Cell, XAxis, YAxis, ReferenceLine } from "recharts";

export const Route = createFileRoute("/_app/energie/")({
  component: EnergiePage,
  head: () => ({ meta: [{ title: "Énergie — Maison" }] }),
});

type Trend = "up" | "down" | "stable";

// ---------- helpers ----------

function TrendBadge({
  trend,
  pct,
  suffix = "vs 90j",
}: {
  trend: Trend;
  pct: number;
  suffix?: string;
}) {
  const Icon = trend === "down" ? TrendingDown : trend === "up" ? TrendingUp : Minus;
  const tone =
    trend === "down" ? "text-success" : trend === "up" ? "text-mustard" : "text-muted-foreground";
  return (
    <span className={"inline-flex items-center gap-1 text-sm " + tone}>
      <Icon className="h-4 w-4" />
      <span className="font-semibold tabular-nums">
        {pct > 0 ? "+" : ""}
        {pct}%
      </span>
      <span className="text-muted-foreground">{suffix}</span>
    </span>
  );
}

function Sparkline({ data, tone = "primary" }: { data: number[]; tone?: "primary" | "warm" }) {
  const color = tone === "warm" ? "var(--warm)" : "var(--primary)";
  const gid = `spark-fill-${tone}`;
  const chartData = data.map((v, i) => ({ i, v }));
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

// 30-point sparkline series — derived from daily values with gentle noise
function makeSeries(base: number, count = 30, jitter = 0.12) {
  const out: number[] = [];
  for (let i = 0; i < count; i++) {
    const t = i / (count - 1);
    const wave = Math.sin(t * Math.PI * 2.2) * jitter * base;
    const noise = (Math.sin(i * 1.7) + Math.cos(i * 0.9)) * jitter * 0.4 * base;
    out.push(base + wave + noise);
  }
  return out;
}

type Domain = "elec" | "eau" | "mazout";

const domainConfig: Record<
  Domain,
  {
    label: string;
    unit: string;
    icon: typeof Zap;
    pick: (h: (typeof energie.history)[number]) => number;
    seasonal: number[];
  }
> = {
  elec: {
    label: "Électricité",
    unit: "kWh",
    icon: Zap,
    // Net grid consumption — negative when solar injection > consumption.
    pick: (h) => h.jour + h.nuit - (h.solar ?? 0),
    seasonal: [1.15, 1.18, 1.05, 0.95, 0.85, 0.75, 0.7, 0.75, 0.85, 0.95, 1.1, 1.18],
  },
  eau: {
    label: "Eau",
    unit: "m³",
    icon: Droplet,
    pick: (h) => h.eau,
    seasonal: [0.95, 0.95, 1, 1, 1.05, 1.1, 1.12, 1.1, 1.05, 1, 0.95, 0.95],
  },
  mazout: {
    label: "Mazout",
    unit: "L",
    icon: Flame,
    pick: (h) => h.mazout,
    seasonal: [1.3, 1.25, 1.05, 0.85, 0.6, 0.45, 0.4, 0.45, 0.65, 0.9, 1.15, 1.3],
  },
};

// 12-month rolling history with year metadata.
// Readings happen on the 1st of each month and cover the *previous* month.
// So the latest recorded month = (month of lastReadingDate) - 1.
function buildHistory(domain: Domain) {
  const monthLabels = [
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
  const now = new Date();
  const recorded = new Map<string, number>();
  const cfg = domainConfig[domain];

  const lastReading = new Date(energie.lastReadingDate);
  const anchor = new Date(lastReading.getFullYear(), lastReading.getMonth() - 1, 1);

  const recVals = energie.history.map(cfg.pick);
  for (let i = 0; i < recVals.length; i++) {
    const offset = recVals.length - 1 - i;
    const d = new Date(anchor.getFullYear(), anchor.getMonth() - offset, 1);
    recorded.set(`${d.getFullYear()}-${d.getMonth()}`, recVals[i]);
  }

  const recent = recVals.slice(-3);
  const avg = recent.reduce((a, b) => a + b, 0) / Math.max(1, recent.length);

  const series: {
    key: string;
    label: string;
    year: number;
    monthIdx: number;
    value: number;
    projected: boolean;
  }[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const m = d.getMonth();
    const y = d.getFullYear();
    const key = `${y}-${m}`;
    const has = recorded.has(key);
    const proj = avg * cfg.seasonal[m];
    series.push({
      key,
      label: monthLabels[m],
      year: y,
      monthIdx: m,
      value: has ? recorded.get(key)! : Math.round(proj * 10) / 10,
      projected: !has,
    });
  }
  return series;
}

// ---------- history chart ----------

type HistoDatum = {
  label: string;
  year: number;
  value: number;
  projected: boolean;
  isNeg: boolean;
  isCurrent: boolean;
};

// Per-bar fill mirrors the four states of the legend: recorded (current vs past),
// solar injection (negative), and projected (dashed, faded).
function barStyle(d: HistoDatum): React.SVGProps<SVGRectElement> {
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
  const d = payload[0].payload as HistoDatum;
  return (
    <div className="rounded-lg border border-border/60 bg-popover px-2 py-1 text-xs shadow-lift">
      <p className="font-semibold capitalize">
        {d.label} {d.year}
      </p>
      <p className="tabular-nums text-muted-foreground">
        {d.value} {unit}
        {d.isNeg ? " · injection solaire" : ""}
        {d.projected ? " · projeté" : ""}
      </p>
    </div>
  );
}

// ---------- page ----------

function EnergiePage() {
  const { electricity, water, oil, lastReadingDate } = energie;
  const [domain, setDomain] = useState<Domain>("elec");
  const history = buildHistory(domain);
  const maxPos = Math.max(0, ...history.map((h) => h.value));
  const maxNeg = Math.abs(Math.min(0, ...history.map((h) => h.value)));
  const cfg = domainConfig[domain];
  const DomainIcon = cfg.icon;
  const lastReading = new Date(lastReadingDate);
  const lastReadingFmt = lastReading.toLocaleDateString("fr-BE", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  // The reading on the 1st covers the previous month
  const coveredMonth = new Date(lastReading.getFullYear(), lastReading.getMonth() - 1, 1);
  const coveredMonthLabel = coveredMonth.toLocaleDateString("fr-BE", {
    month: "long",
    year: "numeric",
  });
  const coveredMonthShort = coveredMonth.toLocaleDateString("fr-BE", { month: "long" });

  // Build sparkline series for each top block
  const elecSeries = makeSeries(electricity.dailyKWh, 30, 0.18);
  const waterSeries = makeSeries(water.dailyM3, 30, 0.15);
  // Oil: declining tank level over 30 days
  const oilSeries = Array.from({ length: 30 }, (_, i) => {
    const t = i / 29;
    return oil.tankPct + (1 - t) * (oil.last30dLiters / oil.tankCapacity) * 100;
  });

  // Detect year transitions for the chart
  const yearGroups = history.reduce<{ year: number; start: number; end: number }[]>((acc, h, i) => {
    const last = acc[acc.length - 1];
    if (!last || last.year !== h.year) acc.push({ year: h.year, start: i, end: i });
    else last.end = i;
    return acc;
  }, []);

  // Index of the most recent recorded month (used to highlight the "current" bar)
  const latestRecordedIdx = (() => {
    for (let i = history.length - 1; i >= 0; i--) if (!history[i].projected) return i;
    return -1;
  })();

  const chartData: HistoDatum[] = history.map((h, i) => ({
    label: h.label,
    year: h.year,
    value: h.value,
    projected: h.projected,
    isNeg: h.value < 0,
    isCurrent: i === latestRecordedIdx,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Énergie"
        subtitle="Vue d'ensemble de la consommation"
        icon={<Zap className="h-4 w-4" />}
        back={null}
        size="sm"
      />

      {energie.monthlyDue ? (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-warm p-5 text-warm-foreground sm:p-6 anim-pop-in">
          <div>
            <Eyebrow tone="current" className="opacity-70">
              À faire
            </Eyebrow>
            <p className="mt-1 text-xl">Relevé mensuel à saisir</p>
          </div>
          <Button asChild variant="inverted" className="group gap-2 rounded-full">
            <Link to="/energie/saisie">
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
              <span className="hidden sm:inline">
                — consommation de{" "}
                <strong className="font-semibold text-foreground capitalize">
                  {coveredMonthLabel}
                </strong>
              </span>
            </span>
          }
          action={
            <Button asChild variant="inverted" size="sm" className="group gap-1.5 rounded-full">
              <Link to="/energie/saisie">
                Nouveau relevé{" "}
                <ArrowRight className="h-3.5 w-3.5 icon-hover-x transition-transform" />
              </Link>
            </Button>
          }
        />
      )}

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
              footer={<Sparkline data={elecSeries} />}
            >
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl tracking-tight">{electricity.dailyKWh}</span>
                <span className="text-base text-muted-foreground">kWh / jour</span>
              </div>
              <div className="mt-2">
                <TrendBadge trend={electricity.trend} pct={electricity.trendPct} />
              </div>

              <p className="mt-2 text-sm text-muted-foreground">
                <span className="tabular-nums text-foreground">{electricity.monthKWh} kWh</span> en{" "}
                {coveredMonthLabel}
              </p>

              <div className="mt-3 grid grid-cols-2 gap-2">
                <Card variant="inset" padding="sm">
                  <p className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Sun className="h-3.5 w-3.5 text-warm" /> Jour
                  </p>
                  <p className="mt-1 text-lg tabular-nums">
                    {electricity.dayTotal}
                    <span className="ml-1 text-xs text-muted-foreground">kWh</span>
                  </p>
                </Card>
                <Card variant="inset" padding="sm">
                  <p className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Moon className="h-3.5 w-3.5 text-foreground/70" /> Nuit
                  </p>
                  <p className="mt-1 text-lg tabular-nums">
                    {electricity.nightTotal}
                    <span className="ml-1 text-xs text-muted-foreground">kWh</span>
                  </p>
                </Card>
              </div>
            </Card>

            {/* WATER */}
            <Card
              title="Eau"
              icon={<Droplet className="h-4 w-4 anim-float" />}
              footer={<Sparkline data={waterSeries} />}
            >
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl tracking-tight">{water.dailyM3}</span>
                <span className="text-base text-muted-foreground">m³ / jour</span>
              </div>
              <div className="mt-2">
                <TrendBadge trend={water.trend} pct={water.trendPct} suffix="vs période préc." />
              </div>
              <p className="mt-2 text-sm text-muted-foreground tabular-nums">
                ≈ {water.dailyL} L par jour
              </p>

              <Card variant="inset" padding="sm" className="mt-5">
                <p className="text-muted-foreground">
                  Tendance stable sur les 30 derniers jours — aucune anomalie détectée.
                </p>
              </Card>
            </Card>

            {/* OIL */}
            <Card
              title="Mazout"
              icon={
                <Flame
                  className={"h-4 w-4 " + (oil.status === "alert" ? "anim-wiggle" : "anim-breathe")}
                />
              }
              tone={oil.status === "alert" ? "warm" : "primary"}
              className={oil.status === "alert" ? "border-warm/40" : undefined}
              footer={<Sparkline data={oilSeries} />}
            >
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl tracking-tight">{oil.tankPct}</span>
                <span className="text-base text-muted-foreground">% citerne</span>
              </div>
              <p className="mt-0.5 text-sm text-muted-foreground tabular-nums">
                {oil.tankLiters.toLocaleString("fr-BE")} /{" "}
                {oil.tankCapacity.toLocaleString("fr-BE")} L
              </p>

              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-secondary">
                <div
                  className={
                    "h-full rounded-full transition-all duration-700 " +
                    (oil.status === "alert" ? "bg-warm" : "bg-primary")
                  }
                  style={{ width: `${oil.tankPct}%` }}
                />
              </div>

              {oil.status === "alert" && (
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
                  <p className="text-xs text-muted-foreground">30 derniers jours</p>
                  <p className="mt-1 text-lg tabular-nums">
                    {oil.last30dLiters}
                    <span className="ml-1 text-xs text-muted-foreground">L</span>
                  </p>
                </Card>
                <Card variant="inset" padding="sm">
                  <p className="text-xs text-muted-foreground">Autonomie</p>
                  <p
                    className={
                      "mt-1 text-lg tabular-nums " + (oil.status === "alert" ? "text-warm" : "")
                    }
                  >
                    ~{oil.autonomyDays}
                    <span className="ml-1 text-xs text-muted-foreground">j</span>
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
            action={
              <div className="flex flex-wrap items-center justify-end gap-3">
                {/* Domain switcher */}
                <Tabs value={domain} onValueChange={(v) => setDomain(v as Domain)}>
                  <TabsList className="h-10 bg-secondary/70 p-1">
                    {(Object.keys(domainConfig) as Domain[]).map((d) => {
                      const Icon = domainConfig[d].icon;
                      return (
                        <TabsTrigger key={d} value={d} className="gap-1.5 px-3">
                          <Icon className="h-3.5 w-3.5" />
                          {domainConfig[d].label}
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
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-sm border border-dashed border-muted-foreground/60" />{" "}
                    Projeté
                  </span>
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

            <p className="mt-4 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
              <Sparkles className="h-3 w-3" />
              Les barres en pointillés sont des estimations basées sur la moyenne récente, en
              l'absence de relevé.
            </p>
          </Card>
        </TabsContent>

        <TabsContent value="relevés" className="mt-0">
          <ReleveList />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ---------- Relevés (editable list) ----------

type ReleveType = "all" | "eau" | "jour" | "nuit" | "mazout" | "solar";

type ReleveRow = {
  id: string;
  date: string; // ISO yyyy-mm-dd
  eau: number;
  jour: number;
  nuit: number;
  mazout: number;
  solar: number;
};

const monthNames = [
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

const typeMeta: Record<
  Exclude<ReleveType, "all">,
  { label: string; unit: string; icon: React.ReactNode; tone: string }
> = {
  eau: {
    label: "Eau",
    unit: "m³",
    icon: <Droplet className="h-3.5 w-3.5" />,
    tone: "text-primary",
  },
  jour: {
    label: "Élec. jour",
    unit: "kWh",
    icon: <Sun className="h-3.5 w-3.5" />,
    tone: "text-warm",
  },
  nuit: {
    label: "Élec. nuit",
    unit: "kWh",
    icon: <Moon className="h-3.5 w-3.5" />,
    tone: "text-foreground/70",
  },
  mazout: {
    label: "Mazout",
    unit: "L",
    icon: <Flame className="h-3.5 w-3.5" />,
    tone: "text-warm",
  },
  solar: {
    label: "Solaire",
    unit: "kWh",
    icon: <SunMedium className="h-3.5 w-3.5" />,
    tone: "text-success",
  },
};

function buildInitialReleves(): ReleveRow[] {
  const last = new Date(energie.lastReadingDate);
  const rows: ReleveRow[] = energie.history.map((h, i) => {
    const offset = energie.history.length - 1 - i;
    const d = new Date(last.getFullYear(), last.getMonth() - offset, 1);
    const iso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`;
    return {
      id: iso,
      date: iso,
      eau: h.eau,
      jour: h.jour,
      nuit: h.nuit,
      mazout: h.mazout,
      solar: h.solar,
    };
  });
  return rows.reverse(); // newest first
}

function ReleveList() {
  const [rows, setRows] = useState<ReleveRow[]>(() => buildInitialReleves());
  const [filter, setFilter] = useState<ReleveType>("all");
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState<Partial<ReleveRow>>({});

  const visibleCols = useMemo<Array<Exclude<ReleveType, "all">>>(
    () => (filter === "all" ? ["eau", "jour", "nuit", "mazout", "solar"] : [filter]),
    [filter],
  );

  const displayRows = useMemo(() => [...rows].sort((a, b) => b.date.localeCompare(a.date)), [rows]);

  const startEdit = (row: ReleveRow) => {
    setEditing(row.id);
    setDraft({ ...row });
  };
  const cancel = () => {
    setEditing(null);
    setDraft({});
  };
  const save = () => {
    setRows((rs) => rs.map((r) => (r.id === editing ? ({ ...r, ...draft } as ReleveRow) : r)));
    cancel();
  };

  const rowActions = (row: ReleveRow, isEditing: boolean) =>
    isEditing ? (
      <div className="inline-flex gap-1">
        <button
          onClick={save}
          className="grid h-7 w-7 place-items-center rounded-md bg-foreground text-background hover:opacity-90"
          aria-label="Enregistrer"
        >
          <Check className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={cancel}
          className="grid h-7 w-7 place-items-center rounded-md border border-border hover:bg-secondary"
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

  return (
    <Card
      bleed
      title="Historique des relevés"
      subline={`${rows.length} entrées — modifiables`}
      action={
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Type</span>
          <Select value={filter} onValueChange={(v) => setFilter(v as ReleveType)}>
            <SelectTrigger className="h-9 w-[170px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les types</SelectItem>
              <SelectItem value="eau">Eau</SelectItem>
              <SelectItem value="jour">Électricité jour</SelectItem>
              <SelectItem value="nuit">Électricité nuit</SelectItem>
              <SelectItem value="mazout">Mazout</SelectItem>
              <SelectItem value="solar">Solaire injecté</SelectItem>
            </SelectContent>
          </Select>
        </div>
      }
    >
      {/* Desktop: table */}
      <div className="hidden sm:block">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/40 hover:bg-secondary/40">
              <TableHead className="px-5 text-xs uppercase tracking-eyebrow">Date</TableHead>
              {visibleCols.map((c) => (
                <TableHead key={c} className="px-3 text-right text-xs uppercase tracking-eyebrow">
                  <div className={"flex items-center justify-end gap-1.5 " + typeMeta[c].tone}>
                    {typeMeta[c].icon}
                    {typeMeta[c].label}
                    <span className="font-normal normal-case text-muted-foreground/70">
                      {typeMeta[c].unit}
                    </span>
                  </div>
                </TableHead>
              ))}
              <TableHead className="w-16" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayRows.map((row) => {
              const d = new Date(row.date);
              const covered = new Date(d.getFullYear(), d.getMonth() - 1, 1);
              const isEditing = editing === row.id;
              return (
                <TableRow key={row.id}>
                  <TableCell className="px-5 py-3">
                    <p className="font-semibold capitalize">
                      {monthNames[covered.getMonth()]} {covered.getFullYear()}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {d.toLocaleDateString("fr-BE", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </TableCell>
                  {visibleCols.map((c) => (
                    <TableCell key={c} className="px-3 py-3 text-right tabular-nums">
                      {isEditing ? (
                        <Input
                          type="number"
                          step="0.1"
                          value={String((draft as Record<string, number>)[c] ?? row[c])}
                          onChange={(e) =>
                            setDraft((dr) => ({ ...dr, [c]: Number(e.target.value) }))
                          }
                          className="ml-auto h-8 w-24 text-right"
                        />
                      ) : (
                        <span>{row[c]}</span>
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

      {/* Mobile: stacked cards (a 7-column table can't fit a phone) */}
      <div className="divide-y divide-border/40 sm:hidden">
        {displayRows.map((row) => {
          const d = new Date(row.date);
          const covered = new Date(d.getFullYear(), d.getMonth() - 1, 1);
          const isEditing = editing === row.id;
          return (
            <div key={row.id} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold capitalize">
                    {monthNames[covered.getMonth()]} {covered.getFullYear()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {d.toLocaleDateString("fr-BE", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
                {rowActions(row, isEditing)}
              </div>
              <div
                className={
                  "mt-3 grid gap-2 " + (visibleCols.length === 1 ? "grid-cols-1" : "grid-cols-2")
                }
              >
                {visibleCols.map((c) => (
                  <div key={c} className="rounded-lg bg-secondary/50 px-3 py-2">
                    <p
                      className={
                        "inline-flex items-center gap-1.5 text-2xs uppercase tracking-eyebrow " +
                        typeMeta[c].tone
                      }
                    >
                      {typeMeta[c].icon}
                      {typeMeta[c].label}
                    </p>
                    {isEditing ? (
                      <Input
                        type="number"
                        step="0.1"
                        value={String((draft as Record<string, number>)[c] ?? row[c])}
                        onChange={(e) => setDraft((dr) => ({ ...dr, [c]: Number(e.target.value) }))}
                        className="mt-1 h-8 w-full tabular-nums"
                      />
                    ) : (
                      <p className="mt-0.5 text-base tabular-nums">
                        {row[c]}
                        <span className="ml-1 text-xs text-muted-foreground">
                          {typeMeta[c].unit}
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
    </Card>
  );
}
