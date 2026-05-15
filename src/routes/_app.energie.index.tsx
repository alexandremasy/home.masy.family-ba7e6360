import { createFileRoute, Link } from "@tanstack/react-router";
import { PageHeader } from "@/components/PageHeader";
import { energie } from "@/lib/mock-data";
import { ArrowRight, Droplet, Zap, Flame, TrendingDown, TrendingUp, Minus, AlertTriangle, CalendarDays, Sun, Moon, Sparkles } from "lucide-react";

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

// 12-month rolling history with year metadata
function buildHistory() {
  const monthLabels = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];
  const now = new Date();
  const recorded = new Map<string, number>();
  const currentYear = now.getFullYear();

  // Map mock history to recorded values within the current year (most-recent months)
  // Spread the recorded values across the months ending at the current month - 1.
  const recVals = energie.history.map((h) => h.jour + h.nuit);
  // Anchor recorded values to the most recent fully-completed months.
  const anchorEnd = now.getMonth() - 1; // last fully-completed month index
  for (let i = 0; i < recVals.length; i++) {
    const offset = recVals.length - 1 - i;
    const d = new Date(currentYear, anchorEnd - offset, 1);
    recorded.set(`${d.getFullYear()}-${d.getMonth()}`, recVals[i]);
  }

  // Average for projection (recent recorded values)
  const recent = recVals.slice(-3);
  const avg = recent.reduce((a, b) => a + b, 0) / Math.max(1, recent.length);

  const series: { key: string; label: string; year: number; monthIdx: number; kWh: number; projected: boolean }[] = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const m = d.getMonth();
    const y = d.getFullYear();
    const key = `${y}-${m}`;
    const has = recorded.has(key);
    // Seasonal projection: winter months trend higher
    const seasonal = [1.15, 1.18, 1.05, 0.95, 0.85, 0.75, 0.7, 0.75, 0.85, 0.95, 1.1, 1.18][m];
    series.push({
      key,
      label: monthLabels[m],
      year: y,
      monthIdx: m,
      kWh: has ? recorded.get(key)! : Math.round(avg * seasonal),
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
        "group relative overflow-hidden rounded-2xl border p-6 shadow-soft transition-all duration-300 hover:shadow-lift hover:-translate-y-0.5 " +
        (alert
          ? "border-warm/30 bg-warm/10 ring-1 ring-warm/30"
          : "border-border/60 bg-card hover:border-border")
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
  const history = buildHistory();
  const max = Math.max(...history.map((h) => h.kWh));
  const lastReadingFmt = new Date(lastReadingDate).toLocaleDateString("fr-BE", {
    day: "numeric", month: "long", year: "numeric",
  });

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

  return (
    <div className="space-y-6">
      <PageHeader title="Énergie" subtitle="Vue d'ensemble de la consommation" />

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/60 bg-card px-5 py-3 text-sm shadow-soft">
        <span className="inline-flex items-center gap-2 text-muted-foreground">
          <CalendarDays className="h-4 w-4" />
          Dernier relevé : <strong className="text-foreground">{lastReadingFmt}</strong>
        </span>
        <Link to="/energie/saisie" className="group inline-flex items-center gap-1.5 rounded-full bg-foreground px-4 py-1.5 text-xs font-medium text-background">
          Nouveau relevé <ArrowRight className="h-3.5 w-3.5 icon-hover-x transition-transform" />
        </Link>
      </div>

      {energie.monthlyDue && (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-warm p-6 text-warm-foreground sm:p-8 anim-pop-in">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] opacity-70">À faire</p>
            <p className="mt-1 font-serif text-2xl">Relevé mensuel à saisir</p>
          </div>
          <Link to="/energie/saisie" className="group inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background">
            Saisir <ArrowRight className="h-4 w-4 icon-hover-x transition-transform" />
          </Link>
        </div>
      )}

      <div className="grid gap-5 stagger lg:grid-cols-3">
        {/* ELECTRICITY */}
        <MetricCard label="Électricité" icon={<Zap className="h-4 w-4 anim-glow" />}>
          <div className="mt-4 flex items-baseline gap-1.5">
            <span className="font-serif text-5xl tracking-tight">{electricity.dailyKWh}</span>
            <span className="text-base text-muted-foreground">kWh / jour</span>
          </div>
          <div className="mt-2"><TrendBadge trend={electricity.trend} pct={electricity.trendPct} /></div>

          <div className="mt-4">
            <Sparkline data={elecSeries} />
          </div>

          <div className="mt-5 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Total ce mois</span>
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
        </MetricCard>

        {/* WATER */}
        <MetricCard label="Eau" icon={<Droplet className="h-4 w-4 anim-float" />}>
          <div className="mt-4 flex items-baseline gap-1.5">
            <span className="font-serif text-5xl tracking-tight">{water.dailyM3}</span>
            <span className="text-base text-muted-foreground">m³ / jour</span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground tabular-nums">≈ {water.dailyL} L par jour</p>
          <div className="mt-2"><TrendBadge trend={water.trend} pct={water.trendPct} suffix="vs période préc." /></div>

          <div className="mt-4">
            <Sparkline data={waterSeries} />
          </div>

          <div className="mt-5 rounded-xl bg-secondary/60 p-3 text-sm text-muted-foreground">
            Tendance stable sur les 30 derniers jours — aucune anomalie détectée.
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

          <div className="mt-4">
            <Sparkline data={oilSeries} tone="warm" />
          </div>

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
        </MetricCard>
      </div>

      {/* HISTORY CHART */}
      <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-soft sm:p-8 anim-slide-up">
        <header className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-serif text-2xl tracking-tight">Historique électricité</h2>
            <p className="mt-1 text-sm text-muted-foreground">12 derniers mois — vue glissante</p>
          </div>
          <span className="inline-flex items-center gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-primary" /> Relevé
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm border border-dashed border-muted-foreground/60" /> Projeté
            </span>
          </span>
        </header>

        <div className="flex h-56 items-end gap-2 sm:gap-3">
          {history.map((h, i) => {
            const isCurrent = i === history.length - 1;
            const heightPct = (h.kWh / max) * 100;
            return (
              <div key={h.key} className="group relative flex h-full flex-1 flex-col items-center justify-end gap-2">
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
                {/* Tooltip on hover */}
                <div className="pointer-events-none absolute -top-2 -translate-y-full rounded-lg border border-border/60 bg-popover px-2 py-1 text-xs shadow-lift opacity-0 transition-opacity group-hover:opacity-100 whitespace-nowrap">
                  <p className="font-medium">{h.label} {h.year}</p>
                  <p className="tabular-nums text-muted-foreground">{h.kWh} kWh{h.projected ? " · projeté" : ""}</p>
                </div>
                <p className={"text-[11px] sm:text-xs " + (isCurrent ? "font-medium text-foreground" : "text-muted-foreground")}>
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
    </div>
  );
}
