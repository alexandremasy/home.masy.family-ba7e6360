import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageHeader } from "@/components/PageHeader";
import { energie } from "@/lib/mock-data";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRight, Droplet, Zap, Flame, TrendingDown, TrendingUp, Minus, AlertTriangle, CalendarDays, Sun, Moon, Sparkles, Pencil, Check, X, SunMedium } from "lucide-react";

export const Route = createFileRoute("/_app/energie/")({
  component: EnergiePage,
  head: () => ({ meta: [{ title: "Énergie — Maison" }] }),
});

type Trend = "up" | "down" | "stable";

// ---------- helpers ----------

function TrendBadge({ trend, pct, suffix = "vs 90j" }: { trend: Trend; pct: number; suffix?: string }) {
  const Icon = trend === "down" ? TrendingDown : trend === "up" ? TrendingUp : Minus;
  const tone = trend === "down" ? "text-success" : trend === "up" ? "text-warm" : "text-muted-foreground";
  return (
    <span className={"inline-flex items-center gap-1 text-sm " + tone}>
      <Icon className="h-4 w-4" />
      <span className="font-medium tabular-nums">{pct > 0 ? "+" : ""}{pct}%</span>
      <span className="text-muted-foreground">{suffix}</span>
    </span>
  );
}

function Sparkline({ data, tone = "primary" }: { data: number[]; tone?: "primary" | "warm" }) {
  const w = 100;
  const h = 28;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const step = w / (data.length - 1);
  const points = data.map((v, i) => {
    const x = i * step;
    const y = h - ((v - min) / range) * h;
    return [x, y] as const;
  });
  const path = points.map(([x, y], i) => (i === 0 ? `M${x},${y}` : `L${x},${y}`)).join(" ");
  const area = `${path} L${w},${h} L0,${h} Z`;
  const stroke = tone === "warm" ? "var(--warm)" : "var(--primary)";
  const id = `spark-${tone}-${data.length}`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="block h-7 w-full">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.25" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${id})`} />
      <path d={path} fill="none" stroke={stroke} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      {points.length > 0 && (
        <circle cx={points[points.length - 1][0]} cy={points[points.length - 1][1]} r={1.8} fill={stroke} />
      )}
    </svg>
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

const domainConfig: Record<Domain, { label: string; unit: string; icon: typeof Zap; pick: (h: typeof energie.history[number]) => number; seasonal: number[] }> = {
  elec: {
    label: "Électricité", unit: "kWh", icon: Zap,
    // Net grid consumption — negative when solar injection > consumption.
    pick: (h) => h.jour + h.nuit - (h.solar ?? 0),
    seasonal: [1.15, 1.18, 1.05, 0.95, 0.85, 0.75, 0.7, 0.75, 0.85, 0.95, 1.1, 1.18],
  },
  eau: {
    label: "Eau", unit: "m³", icon: Droplet,
    pick: (h) => h.eau,
    seasonal: [0.95, 0.95, 1, 1, 1.05, 1.1, 1.12, 1.1, 1.05, 1, 0.95, 0.95],
  },
  mazout: {
    label: "Mazout", unit: "L", icon: Flame,
    pick: (h) => h.mazout,
    seasonal: [1.3, 1.25, 1.05, 0.85, 0.6, 0.45, 0.4, 0.45, 0.65, 0.9, 1.15, 1.3],
  },
};

// 12-month rolling history with year metadata.
// Readings happen on the 1st of each month and cover the *previous* month.
// So the latest recorded month = (month of lastReadingDate) - 1.
function buildHistory(domain: Domain) {
  const monthLabels = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];
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

  const series: { key: string; label: string; year: number; monthIdx: number; value: number; projected: boolean }[] = [];
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


// ---------- card shell ----------

function MetricCard({
  label, icon, accent = "primary", alert = false, animatedIcon, children,
}: {
  label: string;
  icon: React.ReactNode;
  accent?: "primary" | "warm";
  alert?: boolean;
  animatedIcon?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={
        "group relative flex h-full flex-col overflow-hidden rounded-2xl border bg-card p-6 shadow-soft transition-all duration-300 hover:shadow-lift hover:-translate-y-0.5 " +
        (alert
          ? "border-warm/40 hover:border-warm/60"
          : "border-border/60 hover:border-border")
      }
    >
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
        <span
          className={
            "grid h-9 w-9 place-items-center rounded-full " +
            (accent === "warm" || alert
              ? "bg-warm/15 text-warm"
              : "bg-primary/10 text-primary") +
            (animatedIcon ? " " : "")
          }
        >
          {icon}
        </span>
      </div>
      {children}
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
  const totalRange = maxPos + maxNeg || 1;
  const posZonePct = (maxPos / totalRange) * 100;
  const negZonePct = (maxNeg / totalRange) * 100;
  const cfg = domainConfig[domain];
  const lastReading = new Date(lastReadingDate);
  const lastReadingFmt = lastReading.toLocaleDateString("fr-BE", {
    day: "numeric", month: "long", year: "numeric",
  });
  // The reading on the 1st covers the previous month
  const coveredMonth = new Date(lastReading.getFullYear(), lastReading.getMonth() - 1, 1);
  const coveredMonthLabel = coveredMonth.toLocaleDateString("fr-BE", { month: "long", year: "numeric" });
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

  return (
    <div className="space-y-6">
      <PageHeader title="Énergie" subtitle="Vue d'ensemble de la consommation" />

      {energie.monthlyDue ? (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-warm p-6 text-warm-foreground sm:p-8 anim-pop-in">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] opacity-70">À faire</p>
            <p className="mt-1 font-serif text-2xl">Relevé mensuel à saisir</p>
          </div>
          <Link to="/energie/saisie" className="group inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background">
            Saisir <ArrowRight className="h-4 w-4 icon-hover-x transition-transform" />
          </Link>
        </div>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/60 bg-card px-5 py-3 text-sm shadow-soft">
          <span className="inline-flex items-center gap-2 text-muted-foreground">
            <CalendarDays className="h-4 w-4" />
            Relevé du <strong className="text-foreground">{lastReadingFmt}</strong>
            <span className="hidden sm:inline">— consommation de <strong className="text-foreground capitalize">{coveredMonthLabel}</strong></span>
          </span>
          <Link to="/energie/saisie" className="group inline-flex items-center gap-1.5 rounded-full bg-foreground px-4 py-1.5 text-xs font-medium text-background">
            Nouveau relevé <ArrowRight className="h-3.5 w-3.5 icon-hover-x transition-transform" />
          </Link>
        </div>
      )}

      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="h-10 bg-secondary/70 p-1">
          <TabsTrigger value="dashboard" className="px-4">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="relevés" className="px-4">Relevés</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6 mt-0">

      <div className="grid gap-5 stagger lg:grid-cols-3">
        {/* ELECTRICITY */}
        <MetricCard label="Électricité" icon={<Zap className="h-4 w-4 anim-glow" />}>
          <div className="mt-4 flex items-baseline gap-1.5">
            <span className="font-serif text-5xl tracking-tight">{electricity.dailyKWh}</span>
            <span className="text-base text-muted-foreground">kWh / jour</span>
          </div>
          <div className="mt-2"><TrendBadge trend={electricity.trend} pct={electricity.trendPct} /></div>

          <div className="mt-5 flex items-center justify-between text-sm">
            <span className="text-muted-foreground capitalize">Total {coveredMonthShort}</span>
            <strong className="font-serif text-lg tabular-nums">{electricity.monthKWh} kWh</strong>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <div className="rounded-xl bg-secondary/60 p-3">
              <p className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <Sun className="h-3.5 w-3.5 text-warm" /> Jour
              </p>
              <p className="mt-1 font-serif text-xl tabular-nums">{electricity.dayTotal}<span className="ml-1 text-xs text-muted-foreground">kWh</span></p>
            </div>
            <div className="rounded-xl bg-secondary/60 p-3">
              <p className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <Moon className="h-3.5 w-3.5 text-foreground/70" /> Nuit
              </p>
              <p className="mt-1 font-serif text-xl tabular-nums">{electricity.nightTotal}<span className="ml-1 text-xs text-muted-foreground">kWh</span></p>
            </div>
          </div>

          <div className="mt-auto pt-5">
            <Sparkline data={elecSeries} />
          </div>
        </MetricCard>

        {/* WATER */}
        <MetricCard label="Eau" icon={<Droplet className="h-4 w-4 anim-float" />}>
          <div className="mt-4 flex items-baseline gap-1.5">
            <span className="font-serif text-5xl tracking-tight">{water.dailyM3}</span>
            <span className="text-base text-muted-foreground">m³ / jour</span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground tabular-nums">≈ {water.dailyL} L par jour</p>
          <div className="mt-2"><TrendBadge trend={water.trend} pct={water.trendPct} suffix="vs période préc." /></div>

          <div className="mt-5 rounded-xl bg-secondary/60 p-3 text-sm text-muted-foreground">
            Tendance stable sur les 30 derniers jours — aucune anomalie détectée.
          </div>

          <div className="mt-auto pt-5">
            <Sparkline data={waterSeries} />
          </div>
        </MetricCard>

        {/* OIL */}
        <MetricCard
          label="Mazout"
          icon={<Flame className={"h-4 w-4 " + (oil.status === "alert" ? "anim-wiggle" : "anim-breathe")} />}
          accent={oil.status === "alert" ? "warm" : "primary"}
          alert={oil.status === "alert"}
        >
          <div className="mt-4 flex items-baseline gap-1.5">
            <span className="font-serif text-5xl tracking-tight">{oil.tankPct}</span>
            <span className="text-base text-muted-foreground">% citerne</span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground tabular-nums">
            {oil.tankLiters.toLocaleString("fr-BE")} / {oil.tankCapacity.toLocaleString("fr-BE")} L
          </p>

          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className={"h-full rounded-full transition-all duration-700 " + (oil.status === "alert" ? "bg-warm" : "bg-primary")}
              style={{ width: `${oil.tankPct}%` }}
            />
          </div>

          {oil.status === "alert" && (
            <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-warm/15 px-2.5 py-1 text-sm text-warm">
              <span className="relative grid h-5 w-5 place-items-center rounded-full anim-pulse-ring">
                <AlertTriangle className="h-3.5 w-3.5" />
              </span>
              <span className="font-medium tracking-tight">Niveau faible — prévoir une commande</span>
            </div>
          )}

          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="rounded-xl bg-secondary/60 p-3">
              <p className="text-xs text-muted-foreground">30 derniers jours</p>
              <p className="mt-1 font-serif text-xl tabular-nums">{oil.last30dLiters}<span className="ml-1 text-xs text-muted-foreground">L</span></p>
            </div>
            <div className="rounded-xl bg-secondary/60 p-3">
              <p className="text-xs text-muted-foreground">Autonomie</p>
              <p className={"mt-1 font-serif text-xl tabular-nums " + (oil.status === "alert" ? "text-warm" : "")}>~{oil.autonomyDays}<span className="ml-1 text-xs text-muted-foreground">j</span></p>
            </div>
          </div>

          <div className="mt-auto pt-5">
            <Sparkline data={oilSeries} />
          </div>
        </MetricCard>
      </div>

      {/* HISTORY CHART */}
      <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-soft sm:p-8 anim-slide-up">
        <header className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-serif text-2xl tracking-tight">Historique {cfg.label.toLowerCase()}</h2>
            <p className="mt-1 text-sm text-muted-foreground">12 derniers mois — vue glissante</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {/* Domain switcher */}
            <div className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-secondary/50 p-1">
              {(Object.keys(domainConfig) as Domain[]).map((d) => {
                const Icon = domainConfig[d].icon;
                const active = d === domain;
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDomain(d)}
                    className={
                      "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all " +
                      (active
                        ? "bg-foreground text-background shadow-soft"
                        : "text-muted-foreground hover:text-foreground")
                    }
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {domainConfig[d].label}
                  </button>
                );
              })}
            </div>
            <span className="hidden items-center gap-3 text-xs text-muted-foreground sm:inline-flex">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-primary" /> Relevé
              </span>
              {domain === "elec" && (
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-sm bg-success/70" /> Injection solaire
                </span>
              )}
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm border border-dashed border-muted-foreground/60" /> Projeté
              </span>
            </span>
          </div>
        </header>

        <div className="flex h-56 gap-2 sm:gap-3">
          {history.map((h, i) => {
            const isCurrent = i === latestRecordedIdx;
            const isNeg = h.value < 0;
            const heightPct = isNeg
              ? (Math.abs(h.value) / (maxNeg || 1)) * 100
              : (h.value / (maxPos || 1)) * 100;
            return (
              <div key={h.key} className="group relative flex h-full flex-1 flex-col">
                {/* Positive zone */}
                <div style={{ height: `${posZonePct}%` }} className="flex items-end justify-center">
                  {!isNeg && (
                    <div
                      className={
                        "w-full max-w-[60px] rounded-t-xl transition-all duration-700 hover:scale-y-105 origin-bottom " +
                        (h.projected
                          ? "border border-dashed border-muted-foreground/40 bg-muted-foreground/10"
                          : isCurrent
                            ? "bg-primary"
                            : "bg-secondary")
                      }
                      style={{ height: `${heightPct}%` }}
                    />
                  )}
                </div>
                {/* Zero baseline */}
                {maxNeg > 0 && <div className="h-px bg-border/60" />}
                {/* Negative zone (solar surplus) */}
                {maxNeg > 0 && (
                  <div style={{ height: `${negZonePct}%` }} className="flex items-start justify-center">
                    {isNeg && (
                      <div
                        className={
                          "w-full max-w-[60px] rounded-b-xl transition-all duration-700 hover:scale-y-105 origin-top " +
                          (h.projected
                            ? "border border-dashed border-success/40 bg-success/10"
                            : "bg-success/70")
                        }
                        style={{ height: `${heightPct}%` }}
                      />
                    )}
                  </div>
                )}
                {/* Tooltip on hover */}
                <div className="pointer-events-none absolute -top-2 left-1/2 -translate-x-1/2 -translate-y-full rounded-lg border border-border/60 bg-popover px-2 py-1 text-xs shadow-lift opacity-0 transition-opacity group-hover:opacity-100 whitespace-nowrap z-10">
                  <p className="font-medium capitalize">{h.label} {h.year}</p>
                  <p className="tabular-nums text-muted-foreground">
                    {h.value} {cfg.unit}
                    {isNeg ? " · injection solaire" : ""}
                    {h.projected ? " · projeté" : ""}
                  </p>
                </div>
                <p className={"mt-1 w-full text-center text-[11px] sm:text-xs " + (isCurrent ? "font-medium text-foreground" : "text-muted-foreground")}>
                  {h.label}
                </p>
              </div>
            );
          })}
        </div>

        {/* Year axis */}
        <div className="mt-2 flex gap-2 sm:gap-3">
          {yearGroups.map((g) => {
            const span = g.end - g.start + 1;
            return (
              <div
                key={g.year}
                className="flex items-center justify-center border-t border-border/60 pt-1.5 text-[11px] uppercase tracking-[0.16em] text-muted-foreground"
                style={{ flex: span }}
              >
                {g.year}
              </div>
            );
          })}
        </div>

        <p className="mt-4 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <Sparkles className="h-3 w-3" />
          Les barres en pointillés sont des estimations basées sur la moyenne récente, en l'absence de relevé.
        </p>
      </div>
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

const monthNames = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];

const typeMeta: Record<Exclude<ReleveType, "all">, { label: string; unit: string; icon: React.ReactNode; tone: string }> = {
  eau: { label: "Eau", unit: "m³", icon: <Droplet className="h-3.5 w-3.5" />, tone: "text-primary" },
  jour: { label: "Élec. jour", unit: "kWh", icon: <Sun className="h-3.5 w-3.5" />, tone: "text-warm" },
  nuit: { label: "Élec. nuit", unit: "kWh", icon: <Moon className="h-3.5 w-3.5" />, tone: "text-foreground/70" },
  mazout: { label: "Mazout", unit: "L", icon: <Flame className="h-3.5 w-3.5" />, tone: "text-warm" },
  solar: { label: "Solaire", unit: "kWh", icon: <SunMedium className="h-3.5 w-3.5" />, tone: "text-success" },
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
  const cancel = () => { setEditing(null); setDraft({}); };
  const save = () => {
    setRows((rs) => rs.map((r) => (r.id === editing ? { ...r, ...draft } as ReleveRow : r)));
    cancel();
  };

  return (
    <div className="rounded-2xl border border-border/60 bg-card shadow-soft overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 px-5 py-4">
        <div>
          <h2 className="font-serif text-xl tracking-tight">Historique des relevés</h2>
          <p className="text-xs text-muted-foreground mt-0.5">{rows.length} entrées — modifiables</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Type</span>
          <Select value={filter} onValueChange={(v) => setFilter(v as ReleveType)}>
            <SelectTrigger className="h-9 w-[170px]"><SelectValue /></SelectTrigger>
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
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-xs sm:text-sm">
          <thead>
            <tr className="border-b border-border/60 bg-secondary/40 text-left text-xs uppercase tracking-[0.12em] text-muted-foreground">
              <th className="px-1.5 py-1.5 sm:px-5 sm:py-2.5 font-medium">Date</th>
              {visibleCols.map((c) => (
                <th key={c} className="px-1.5 py-1.5 sm:px-3 sm:py-2.5 font-medium text-right">
                  <div className={"flex flex-col items-end sm:flex-row sm:items-center sm:justify-end gap-0.5 sm:gap-1.5 leading-tight " + typeMeta[c].tone}>
                    <span className="hidden sm:inline-flex sm:items-center sm:gap-1 text-sm">
                      {typeMeta[c].icon}
                      {typeMeta[c].label}
                    </span>
                    <span className="sm:hidden text-[11px]">{typeMeta[c].label}</span>
                    <span className="text-[10px] sm:text-xs text-muted-foreground/70 font-normal">{typeMeta[c].unit}</span>
                  </div>
                </th>
              ))}
              <th className="px-2 py-2 sm:px-3 sm:py-2.5 w-12 sm:w-16"></th>
            </tr>
          </thead>
          <tbody>
            {displayRows.map((row) => {
              const d = new Date(row.date);
              const covered = new Date(d.getFullYear(), d.getMonth() - 1, 1);
              const isEditing = editing === row.id;
              return (
                <tr key={row.id} className="border-b border-border/40 last:border-0 hover:bg-secondary/30 transition-colors">
                  <td className="px-1.5 py-1.5 sm:px-5 sm:py-3">
                    <p className="font-medium text-xs sm:text-sm capitalize">
                      <span className="hidden sm:inline">{monthNames[covered.getMonth()]} {covered.getFullYear()}</span>
                      <span className="sm:hidden">{covered.toLocaleDateString("fr-BE", { month: "short", year: "numeric" })}</span>
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      <span className="hidden sm:inline">{d.toLocaleDateString("fr-BE", { day: "numeric", month: "short", year: "numeric" })}</span>
                      <span className="sm:hidden">{d.toLocaleDateString("fr-BE", { day: "numeric", month: "short" })}</span>
                    </p>
                  </td>
                  {visibleCols.map((c) => (
                    <td key={c} className="px-2 py-2 sm:px-3 sm:py-3 text-right tabular-nums">
                      {isEditing ? (
                        <Input
                          type="number"
                          step="0.1"
                          value={String((draft as any)[c] ?? row[c])}
                          onChange={(e) => setDraft((dr) => ({ ...dr, [c]: Number(e.target.value) }))}
                          className="h-8 w-16 sm:w-24 ml-auto text-right"
                        />
                      ) : (
                        <span>{row[c]}</span>
                      )}
                    </td>
                  ))}
                  <td className="px-2 py-2 sm:px-3 sm:py-3 text-right">
                    {isEditing ? (
                      <div className="inline-flex gap-1">
                        <button onClick={save} className="grid h-7 w-7 place-items-center rounded-md bg-foreground text-background hover:opacity-90" aria-label="Enregistrer">
                          <Check className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={cancel} className="grid h-7 w-7 place-items-center rounded-md border border-border hover:bg-secondary" aria-label="Annuler">
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button onClick={() => startEdit(row)} className="grid h-7 w-7 place-items-center rounded-md border border-border/60 text-muted-foreground hover:text-foreground hover:bg-secondary ml-auto" aria-label="Modifier">
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
