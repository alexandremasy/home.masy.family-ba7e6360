import { createFileRoute } from "@tanstack/react-router";
import { Section } from "@/components/Card";
import { PageHeader } from "@/components/PageHeader";
import { tesla } from "@/lib/mock-data";
import {
  Plug,
  Thermometer,
  MapPin,
  TrendingDown,
  TrendingUp,
  Zap,
  Lock,
  Gauge,
  Cpu,
  Wifi,
  BatteryCharging,
  Snowflake,
  Sun,
} from "lucide-react";

export const Route = createFileRoute("/_app/tesla")({
  component: TeslaPage,
  head: () => ({ meta: [{ title: "Tesla — Maison" }] }),
});

// --- Quarter helpers ---
const MONTH_TO_Q: Record<string, number> = {
  Jan: 1, Fév: 1, Mar: 1,
  Avr: 2, Mai: 2, Juin: 2,
  Juil: 3, Août: 3, Sep: 3,
  Oct: 4, Nov: 4, Déc: 4,
};

type MonthRow = { month: string; year: number; kWh: number; sessions: number };

function quarterKey(row: MonthRow) {
  return `${row.year}-Q${MONTH_TO_Q[row.month]}`;
}

function TeslaPage() {
  const { history } = tesla.monthly;
  const last = history[history.length - 1];
  const currentQ = MONTH_TO_Q[last.month];
  const currentY = last.year;
  const currentQKey = `${currentY}-Q${currentQ}`;

  // Aggregate by quarter
  const quartersMap = new Map<string, { key: string; year: number; q: number; kWh: number; sessions: number; monthsCounted: number; months: MonthRow[] }>();
  for (const row of history) {
    const k = quarterKey(row);
    const cur = quartersMap.get(k) ?? { key: k, year: row.year, q: MONTH_TO_Q[row.month], kWh: 0, sessions: 0, monthsCounted: 0, months: [] };
    cur.kWh += row.kWh;
    cur.sessions += row.sessions;
    cur.monthsCounted += 1;
    cur.months.push(row);
    quartersMap.set(k, cur);
  }
  const quarters = Array.from(quartersMap.values()).sort((a, b) =>
    a.year === b.year ? a.q - b.q : a.year - b.year,
  );

  const currentQuarter = quartersMap.get(currentQKey)!;
  const previousFull = quarters.filter((q) => q.key !== currentQKey && q.monthsCounted === 3);
  const lastFullQ = previousFull[previousFull.length - 1];
  const avgPrevKWh = previousFull.length
    ? Math.round(previousFull.reduce((s, q) => s + q.kWh, 0) / previousFull.length)
    : 0;
  // median of full quarters (used as reference line)
  const medianQ = (() => {
    if (!previousFull.length) return 0;
    const sorted = [...previousFull].map((q) => q.kWh).sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 ? sorted[mid] : Math.round((sorted[mid - 1] + sorted[mid]) / 2);
  })();
  const medianMonth = medianQ ? Math.round(medianQ / 3) : 0;

  const qDelta = currentQuarter.kWh - (lastFullQ?.kWh ?? 0);
  const qBetter = qDelta < 0;
  const qDeltaPct = lastFullQ ? Math.round((Math.abs(qDelta) / lastFullQ.kWh) * 100) : 0;

  const cost = (kWh: number) => kWh * tesla.pricePerKWh;
  const fmtEur = (n: number) =>
    n.toLocaleString("fr-BE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });

  // Visible window: only full quarters (groups of 3 months)
  const visibleQuarters = quarters.filter((q) => q.monthsCounted === 3 || q.key === currentQKey);
  const maxMonth = Math.max(...visibleQuarters.flatMap((q) => q.months.map((m) => m.kWh)));

  return (
    <div className="space-y-8">
      <PageHeader title="Tesla" />

      {/* ============ 1. ÉTAT DE LA VOITURE ============ */}
      <section className="space-y-3">
        <h2 className="text-xs uppercase tracking-[0.18em] text-muted-foreground">État de la voiture</h2>

        {/* Battery hero */}
        <div className="relative overflow-hidden rounded-2xl bg-foreground p-6 text-background shadow-soft">
          {/* decorative gradient */}
          <div className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-primary/30 blur-3xl" />
          <div className="relative flex items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] opacity-60">{tesla.model}</p>
              <p className="mt-2 font-serif text-6xl tracking-tight leading-none">
                {tesla.charge}
                <span className="text-2xl opacity-60">%</span>
              </p>
              <p className="mt-1 text-sm opacity-70">{tesla.rangeKm} km estimés</p>
            </div>
            <div className="flex flex-col items-end gap-2 text-right">
              <span className={"inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs " + (tesla.charging ? "bg-primary text-primary-foreground" : tesla.pluggedIn ? "bg-background/15" : "bg-background/10 opacity-70")}>
                {tesla.charging ? <BatteryCharging className="h-3.5 w-3.5 anim-breathe" /> : <Plug className="h-3.5 w-3.5" />}
                {tesla.charging ? "En charge" : tesla.pluggedIn ? "Branchée" : "Débranchée"}
              </span>
              <span className="text-[11px] opacity-60">Limite {tesla.chargeLimit}%</span>
            </div>
          </div>
          <div className="relative mt-5 h-2 w-full overflow-hidden rounded-full bg-background/15">
            <div className="absolute left-0 top-0 h-full rounded-full bg-primary transition-all duration-700" style={{ width: `${tesla.charge}%` }} />
            <div className="absolute top-0 h-full w-px bg-background/40" style={{ left: `${tesla.chargeLimit}%` }} />
          </div>
        </div>

        {/* Detailed state grid — more graphic */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6 stagger">
          <GraphicTile
            icon={<MapPin className="h-4 w-4" />}
            label="Position"
            value={tesla.inGarage ? "Garage" : "En route"}
            sub={tesla.location}
            tone={tesla.inGarage ? "neutral" : "accent"}
          />
          <TempTile interior={tesla.interior} exterior={tesla.exterior} />
          <GraphicTile
            icon={<Lock className="h-4 w-4" />}
            label="Verrouillage"
            value={tesla.locked ? "Verrouillée" : "Ouverte"}
            sub={tesla.locked ? "Sécurisée" : "À vérifier"}
            tone={tesla.locked ? "success" : "warm"}
          />
          <OdoTile km={tesla.odometerKm} />
          <GraphicTile
            icon={<Cpu className="h-4 w-4" />}
            label="Logiciel"
            value={tesla.software}
            sub="à jour"
            tone="neutral"
          />
          <GraphicTile
            icon={<Wifi className="h-4 w-4" />}
            label="Sync"
            value={tesla.lastSeen}
            sub="connectée"
            tone="success"
            pulse
          />
        </div>
      </section>

      {/* ============ 2. TRIMESTRE EN COURS ============ */}
      <Section title={`Trimestre en cours · Q${currentQ} ${currentY}`}>
        <div className="grid gap-3 sm:grid-cols-3">
          <BigStat
            icon={<Zap className="h-4 w-4" />}
            label="kWh à facturer"
            value={`${currentQuarter.kWh}`}
            sub={`${currentQuarter.monthsCounted}/3 mois · ${currentQuarter.sessions} sessions`}
            accent
          />
          <BigStat
            label="Montant"
            value={fmtEur(cost(currentQuarter.kWh))}
            sub={`${tesla.pricePerKWh.toFixed(3)} € / kWh`}
          />
          <BigStat
            label={lastFullQ ? `vs Q${lastFullQ.q} ${lastFullQ.year}` : "vs précédent"}
            value={lastFullQ ? `${qBetter ? "−" : "+"}${qDeltaPct}%` : "—"}
            sub={lastFullQ ? `${lastFullQ.kWh} kWh · ${fmtEur(cost(lastFullQ.kWh))}` : undefined}
            trend={lastFullQ ? (qBetter ? "down" : "up") : undefined}
          />
        </div>
      </Section>

      {/* ============ 3. HISTORIQUE — MENSUEL GROUPÉ PAR TRIMESTRE ============ */}
      <Section
        title="Historique mensuel"
        action={
          <span className={"inline-flex items-center gap-1 text-xs " + (qBetter ? "text-success" : "text-warm")}>
            {qBetter ? <TrendingDown className="h-3.5 w-3.5" /> : <TrendingUp className="h-3.5 w-3.5" />}
            {qBetter ? "sous" : "au-dessus de"} la médiane
          </span>
        }
      >
        {/* Legend */}
        <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-secondary" />trimestres clos</span>
          <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-primary" />trimestre en cours</span>
          <span className="inline-flex items-center gap-1.5"><span className="h-px w-4 border-t border-dashed border-foreground/40" />médiane {medianMonth} kWh/mois</span>
        </div>

        {/* Chart */}
        <div className="relative">
          {/* median dashed line — sits behind bars */}
          <div className="relative h-40">
            <div
              className="absolute left-0 right-0 border-t border-dashed border-foreground/30"
              style={{ bottom: `${(medianMonth / maxMonth) * 100}%` }}
            >
              <span className="absolute -top-4 right-0 rounded bg-background/80 px-1 text-[9px] tabular-nums text-muted-foreground">
                médiane
              </span>
            </div>

            <div className="flex h-full items-end gap-4 sm:gap-5">
              {visibleQuarters.map((q) => {
                const isCurrent = q.key === currentQKey;
                return (
                  <div key={q.key} className="flex h-full flex-1 items-end gap-1">
                    {q.months.map((m) => (
                      <div key={`${m.year}-${m.month}`} className="group relative flex h-full flex-1 flex-col justify-end">
                        <div
                          className={
                            "w-full rounded-t-sm transition-all duration-700 " +
                            (isCurrent ? "bg-primary" : "bg-secondary group-hover:bg-secondary/70")
                          }
                          style={{ height: `${(m.kWh / maxMonth) * 100}%` }}
                        />
                        {/* tooltip on hover */}
                        <div className="pointer-events-none absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-foreground px-1.5 py-0.5 text-[9px] text-background opacity-0 transition-opacity group-hover:opacity-100">
                          {m.kWh} kWh
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quarter axis: month labels + quarter total */}
          <div className="mt-2 flex gap-4 sm:gap-5">
            {visibleQuarters.map((q) => {
              const isCurrent = q.key === currentQKey;
              const partial = q.monthsCounted < 3;
              return (
                <div key={q.key} className="flex flex-1 flex-col items-stretch gap-1">
                  {/* month labels */}
                  <div className="flex gap-1">
                    {q.months.map((m) => (
                      <div key={`${m.year}-${m.month}-l`} className="flex-1 text-center text-[9px] text-muted-foreground">
                        {m.month.slice(0, 3)}
                      </div>
                    ))}
                    {/* placeholders for missing months in current quarter to keep widths aligned */}
                    {partial && Array.from({ length: 3 - q.monthsCounted }).map((_, i) => (
                      <div key={`ph-${i}`} className="flex-1" />
                    ))}
                  </div>
                  {/* bracket */}
                  <div className="relative h-1.5">
                    <div className={"absolute inset-x-1 top-0 h-px " + (isCurrent ? "bg-primary" : "bg-border")} />
                    <div className={"absolute left-1 top-0 h-1.5 w-px " + (isCurrent ? "bg-primary" : "bg-border")} />
                    <div className={"absolute right-1 top-0 h-1.5 w-px " + (isCurrent ? "bg-primary" : "bg-border")} />
                  </div>
                  {/* quarter total */}
                  <div className="flex flex-col items-center">
                    <span className={"text-[10px] uppercase tracking-wider " + (isCurrent ? "text-primary" : "text-muted-foreground")}>
                      Q{q.q} '{String(q.year).slice(2)}
                    </span>
                    <span className={"font-serif text-base leading-none " + (isCurrent ? "text-primary" : "text-foreground")}>
                      {q.kWh}
                      <span className="ml-0.5 text-[9px] font-sans text-muted-foreground">kWh</span>
                    </span>
                    <span className="text-[9px] tabular-nums text-muted-foreground">{fmtEur(cost(q.kWh))}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <p className="mt-4 text-[11px] text-muted-foreground">
          Médiane calculée sur {previousFull.length} trimestres clos · moyenne {avgPrevKWh} kWh ({fmtEur(cost(avgPrevKWh))}).
        </p>
      </Section>
    </div>
  );
}

// ---------- Tiles ----------

function GraphicTile({
  icon,
  label,
  value,
  sub,
  tone = "neutral",
  pulse,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  tone?: "neutral" | "accent" | "success" | "warm";
  pulse?: boolean;
}) {
  const toneBg =
    tone === "accent" ? "bg-primary/10 text-primary"
    : tone === "success" ? "bg-success/10 text-success"
    : tone === "warm" ? "bg-warm/10 text-warm"
    : "bg-secondary text-foreground";
  return (
    <div className="rounded-xl border border-border/60 bg-card p-3">
      <div className="flex items-center gap-2">
        <span className={"relative inline-flex h-7 w-7 items-center justify-center rounded-lg " + toneBg}>
          {icon}
          {pulse && <span className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-success anim-breathe" />}
        </span>
        <span className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">{label}</span>
      </div>
      <p className="mt-2 font-serif text-base leading-tight">{value}</p>
      {sub && <p className="text-[10px] text-muted-foreground">{sub}</p>}
    </div>
  );
}

function TempTile({ interior, exterior }: { interior: number; exterior: number }) {
  return (
    <div className="rounded-xl border border-border/60 bg-card p-3">
      <div className="flex items-center gap-2">
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-secondary">
          <Thermometer className="h-4 w-4" />
        </span>
        <span className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Température</span>
      </div>
      <div className="mt-2 flex items-baseline gap-3">
        <div>
          <p className="font-serif text-base leading-none">{interior}°</p>
          <p className="mt-0.5 inline-flex items-center gap-0.5 text-[9px] text-muted-foreground">
            <Sun className="h-2.5 w-2.5" /> intérieur
          </p>
        </div>
        <div className="opacity-70">
          <p className="font-serif text-base leading-none">{exterior}°</p>
          <p className="mt-0.5 inline-flex items-center gap-0.5 text-[9px] text-muted-foreground">
            <Snowflake className="h-2.5 w-2.5" /> extérieur
          </p>
        </div>
      </div>
    </div>
  );
}

function OdoTile({ km }: { km: number }) {
  // visualize a 200k km lifetime gauge
  const pct = Math.min(100, (km / 200000) * 100);
  return (
    <div className="rounded-xl border border-border/60 bg-card p-3">
      <div className="flex items-center gap-2">
        <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-secondary">
          <Gauge className="h-4 w-4" />
        </span>
        <span className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Odomètre</span>
      </div>
      <p className="mt-2 font-serif text-base leading-tight">{km.toLocaleString("fr-BE")} km</p>
      <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-secondary">
        <div className="h-full rounded-full bg-foreground/70 transition-all duration-700" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function BigStat({
  icon,
  label,
  value,
  sub,
  accent,
  trend,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
  trend?: "up" | "down";
}) {
  return (
    <div className={"rounded-xl border border-border/60 p-4 " + (accent ? "bg-primary/8" : "bg-card")}>
      <div className="flex items-center gap-1 text-xs uppercase tracking-[0.16em] text-muted-foreground">
        {icon}
        {label}
      </div>
      <p className={"mt-2 font-serif text-2xl " + (trend === "down" ? "text-success" : trend === "up" ? "text-warm" : "")}>
        {value}
      </p>
      {sub && <p className="mt-0.5 text-[11px] text-muted-foreground">{sub}</p>}
    </div>
  );
}
