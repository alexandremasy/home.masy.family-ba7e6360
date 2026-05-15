import { createFileRoute, Link } from "@tanstack/react-router";
import { Section } from "@/components/Card";
import { PageHeader } from "@/components/PageHeader";
import { energie } from "@/lib/mock-data";
import { ArrowRight, Droplet, Zap, Flame, TrendingDown, TrendingUp, Minus, AlertTriangle, CalendarDays } from "lucide-react";

export const Route = createFileRoute("/_app/energie/")({
  component: EnergiePage,
  head: () => ({ meta: [{ title: "Énergie — Maison" }] }),
});

type Trend = "up" | "down" | "stable";

function trendIcon(t: Trend, invertColor = false) {
  // For consumption, "down" is good (green), "up" is bad (warm).
  const goodClass = "text-success";
  const badClass = "text-warm";
  const neutralClass = "text-muted-foreground";
  if (t === "stable") return <Minus className={"h-3.5 w-3.5 " + neutralClass} />;
  const isGood = invertColor ? t === "up" : t === "down";
  const cls = isGood ? goodClass : badClass;
  return t === "down"
    ? <TrendingDown className={"h-3.5 w-3.5 " + cls} />
    : <TrendingUp className={"h-3.5 w-3.5 " + cls} />;
}

// Build a rolling 12-month window ending on the current month.
// Months without recorded data are flagged "projected" using the recent average.
function buildHistory() {
  const monthLabels = ["Jan", "Fév", "Mar", "Avr", "Mai", "Juin", "Juil", "Août", "Sep", "Oct", "Nov", "Déc"];
  const now = new Date();
  const series: { key: string; label: string; year: number; monthIdx: number; kWh: number; projected: boolean }[] = [];

  // recorded values (assume the existing mock history is the most recent recorded months of current year)
  const recorded = new Map<string, number>();
  const currentYear = now.getFullYear();
  energie.history.forEach((h) => {
    const idx = monthLabels.indexOf(h.month);
    if (idx >= 0) recorded.set(`${currentYear}-${idx}`, h.jour + h.nuit);
  });

  // recent average for projection
  const recentValues = energie.history.slice(-3).map((h) => h.jour + h.nuit);
  const avg = recentValues.reduce((a, b) => a + b, 0) / Math.max(1, recentValues.length);

  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const m = d.getMonth();
    const y = d.getFullYear();
    const key = `${y}-${m}`;
    const has = recorded.has(key);
    series.push({
      key,
      label: monthLabels[m],
      year: y,
      monthIdx: m,
      kWh: has ? recorded.get(key)! : Math.round(avg + (Math.sin(i) * 8)),
      projected: !has,
    });
  }
  return series;
}

function EnergiePage() {
  const { electricity, water, oil, lastReadingDate } = energie;
  const history = buildHistory();
  const max = Math.max(...history.map((h) => h.kWh));
  const lastReadingFmt = new Date(lastReadingDate).toLocaleDateString("fr-BE", {
    day: "numeric", month: "long", year: "numeric",
  });

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

      <div className="grid gap-6 lg:grid-cols-3">
        {/* ELECTRICITY */}
        <Section title="Électricité">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Moyenne / jour</p>
              <p className="mt-1 font-serif text-4xl tracking-tight">
                {electricity.dailyKWh}
                <span className="text-base text-muted-foreground"> kWh</span>
              </p>
            </div>
            <span className="grid h-9 w-9 place-items-center rounded-full bg-primary/10 text-primary">
              <Zap className="h-4 w-4 anim-glow" />
            </span>
          </div>

          <div className="mt-3 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            {trendIcon(electricity.trend)}
            <span>
              <strong className="text-foreground">{electricity.trendPct > 0 ? "+" : ""}{electricity.trendPct}%</strong> vs moyenne 90j
            </span>
          </div>

          <div className="mt-5 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Total ce mois</span>
              <strong className="tabular-nums">{electricity.monthKWh} kWh</strong>
            </div>
            <DayNightSplit day={electricity.dayTotal} night={electricity.nightTotal} />
          </div>
        </Section>

        {/* WATER */}
        <Section title="Eau">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Moyenne / jour</p>
              <p className="mt-1 font-serif text-4xl tracking-tight">
                {water.dailyM3}
                <span className="text-base text-muted-foreground"> m³</span>
              </p>
              <p className="mt-1 text-xs text-muted-foreground tabular-nums">{water.dailyL} L / jour</p>
            </div>
            <span className="grid h-9 w-9 place-items-center rounded-full bg-primary/10 text-primary">
              <Droplet className="h-4 w-4" />
            </span>
          </div>

          <div className="mt-3 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            {trendIcon(water.trend)}
            <span>
              <strong className="text-foreground">{water.trendPct > 0 ? "+" : ""}{water.trendPct}%</strong> vs période précédente
            </span>
          </div>

          <div className="mt-6 rounded-xl bg-secondary/60 p-3 text-xs text-muted-foreground">
            Tendance stable sur les dernières semaines — pas d'anomalie détectée.
          </div>
        </Section>

        {/* OIL */}
        <Section title="Mazout">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">Citerne</p>
              <p className="mt-1 font-serif text-4xl tracking-tight">
                {oil.tankPct}<span className="text-base text-muted-foreground">%</span>
              </p>
              <p className="mt-1 text-xs text-muted-foreground tabular-nums">
                {oil.tankLiters.toLocaleString("fr-BE")} / {oil.tankCapacity.toLocaleString("fr-BE")} L
              </p>
            </div>
            <span className={"grid h-9 w-9 place-items-center rounded-full " + (oil.status === "alert" ? "bg-warm/15 text-warm" : "bg-primary/10 text-primary")}>
              <Flame className="h-4 w-4" />
            </span>
          </div>

          <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className={"h-full rounded-full transition-all " + (oil.status === "alert" ? "bg-warm" : "bg-primary")}
              style={{ width: `${oil.tankPct}%` }}
            />
          </div>

          {oil.status === "alert" && (
            <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-warm/15 px-2.5 py-1 text-xs text-warm">
              <AlertTriangle className="h-3.5 w-3.5" />
              Niveau faible — prévoir une commande
            </div>
          )}

          <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded-xl bg-secondary/60 p-3">
              <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">30 derniers jours</p>
              <p className="mt-1 font-serif text-xl tabular-nums">{oil.last30dLiters} L</p>
            </div>
            <div className="rounded-xl bg-secondary/60 p-3">
              <p className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">Autonomie</p>
              <p className="mt-1 font-serif text-xl tabular-nums">~{oil.autonomyDays} j</p>
            </div>
          </div>
        </Section>
      </div>

      {/* HISTORY CHART */}
      <Section
        title="Historique électricité"
        action={
          <span className="inline-flex items-center gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-primary" /> Relevé
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm border border-dashed border-muted-foreground/60 bg-transparent" /> Projeté
            </span>
          </span>
        }
      >
        <div className="flex h-56 items-end gap-2 stagger sm:gap-4">
          {history.map((h, i) => {
            const isCurrent = i === history.length - 1;
            const heightPct = (h.kWh / max) * 100;
            return (
              <div key={h.key} className="group flex h-full flex-1 flex-col items-center justify-end gap-2">
                <span className="text-[10px] tabular-nums text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100">
                  {h.kWh}{h.projected ? "*" : ""}
                </span>
                <div
                  className={
                    "w-full max-w-[60px] rounded-t-xl transition-all duration-700 hover:scale-y-105 origin-bottom " +
                    (h.projected
                      ? "border border-dashed border-muted-foreground/50 bg-muted-foreground/10"
                      : isCurrent
                        ? "bg-primary"
                        : "bg-secondary")
                  }
                  style={{ height: `${heightPct}%` }}
                  title={`${h.label} ${h.year} — ${h.kWh} kWh${h.projected ? " (projection)" : ""}`}
                />
                <p className={"text-[10px] sm:text-xs " + (isCurrent ? "font-medium text-foreground" : "text-muted-foreground")}>
                  {h.label}
                </p>
              </div>
            );
          })}
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          12 derniers mois. Les barres en pointillés sont des estimations basées sur la moyenne récente, en l'absence de relevé.
        </p>
      </Section>
    </div>
  );
}

function DayNightSplit({ day, night }: { day: number; night: number }) {
  const total = day + night;
  const dayPct = (day / total) * 100;
  return (
    <div>
      <div className="flex h-2 w-full overflow-hidden rounded-full bg-secondary">
        <div className="h-full bg-warm" style={{ width: `${dayPct}%` }} />
        <div className="h-full bg-foreground/70" style={{ width: `${100 - dayPct}%` }} />
      </div>
      <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-warm" />
          Jour <strong className="text-foreground tabular-nums">{day} kWh</strong>
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-foreground/70" />
          Nuit <strong className="text-foreground tabular-nums">{night} kWh</strong>
        </span>
      </div>
    </div>
  );
}
