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
  LockOpen,
  Gauge,
  Wifi,
  BatteryCharging,
  Snowflake,
  Flame,
  Wind,
  Car,
  Volume2,
  Lightbulb,
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
const Q_MONTHS_FR: Record<number, string[]> = {
  1: ["Jan", "Fév", "Mar"],
  2: ["Avr", "Mai", "Juin"],
  3: ["Juil", "Août", "Sep"],
  4: ["Oct", "Nov", "Déc"],
};

type MonthRow = { month: string; year: number; kWh: number; sessions: number; projected?: boolean };

function quarterKey(row: MonthRow) {
  return `${row.year}-Q${MONTH_TO_Q[row.month]}`;
}
function qLabel(year: number, q: number) {
  return `${year}.Q${q}`;
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

  // Projection: fill the missing months of the current quarter using the same month last year
  const currentQRaw = quartersMap.get(currentQKey)!;
  const presentNames = new Set(currentQRaw.months.map((m) => m.month));
  const projectedMonths: MonthRow[] = Q_MONTHS_FR[currentQ]
    .filter((m) => !presentNames.has(m))
    .map((m) => {
      const prior = history.find((h) => h.month === m && h.year === currentY - 1);
      return { month: m, year: currentY, kWh: prior?.kWh ?? 0, sessions: prior?.sessions ?? 0, projected: true };
    });
  const currentQuarter = {
    ...currentQRaw,
    months: [...currentQRaw.months, ...projectedMonths].sort(
      (a, b) => Q_MONTHS_FR[currentQ].indexOf(a.month) - Q_MONTHS_FR[currentQ].indexOf(b.month),
    ),
  };
  const realKWh = currentQRaw.kWh;
  const projectedKWh = projectedMonths.reduce((s, m) => s + m.kWh, 0);
  const estimatedKWh = realKWh + projectedKWh;

  const quarters = Array.from(quartersMap.values()).sort((a, b) =>
    a.year === b.year ? a.q - b.q : a.year - b.year,
  );

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

  const qDelta = estimatedKWh - (lastFullQ?.kWh ?? 0);
  const qBetter = qDelta < 0;
  const qDeltaPct = lastFullQ ? Math.round((Math.abs(qDelta) / lastFullQ.kWh) * 100) : 0;

  const cost = (kWh: number) => kWh * tesla.pricePerKWh;
  const fmtEur = (n: number) =>
    n.toLocaleString("fr-BE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });

  // Visible window: full quarters + current (which now always has 3 months thanks to projection)
  const visibleQuarters = quarters
    .filter((q) => q.monthsCounted === 3 || q.key === currentQKey)
    .map((q) => (q.key === currentQKey ? { ...q, months: currentQuarter.months, kWh: estimatedKWh, monthsCounted: 3 } : q));
  const maxMonth = Math.max(...visibleQuarters.flatMap((q) => q.months.map((m) => m.kWh)));

  return (
    <div className="space-y-8">
      <PageHeader title="Tesla" />

      {/* ============ 1. ÉTAT DE LA VOITURE ============ */}
      <section className="space-y-4">
        <h2 className="text-xs uppercase tracking-[0.18em] text-muted-foreground">État de la voiture</h2>

        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-serif text-xl text-foreground">{tesla.model}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              <MapPin className="mr-1 inline h-3 w-3" />
              {tesla.location}
            </p>
          </div>
          <span className={"inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] " + (tesla.charging ? "bg-primary text-primary-foreground" : tesla.pluggedIn ? "bg-secondary text-foreground" : "bg-secondary/60 text-muted-foreground")}>
            {tesla.charging ? <BatteryCharging className="h-3.5 w-3.5 anim-breathe" /> : <Plug className="h-3.5 w-3.5" />}
            {tesla.charging ? "En charge" : tesla.pluggedIn ? "Branchée" : "Débranchée"}
          </span>
        </div>

        {/* Car visual with floating stats — no card background */}
        <div className="relative grid grid-cols-[1fr_auto_1fr] items-center gap-4 py-2">
          <div className="flex flex-col items-end gap-3 text-right">
            <FloatStat label="Charge" value={`${tesla.charge}%`} accent />
            <FloatStat label="Autonomie" value={`${tesla.rangeKm} km`} />
            <FloatStat label="Intérieur" value={`${tesla.interior}°`} icon={<Flame className="h-3 w-3" />} />
          </div>

          <TeslaCar charging={tesla.charging} locked={tesla.locked} />

          <div className="flex flex-col items-start gap-3">
            <FloatStat label="Limite" value={`${tesla.chargeLimit}%`} />
            <FloatStat label="Odomètre" value={`${(tesla.odometerKm / 1000).toFixed(1)}k km`} icon={<Gauge className="h-3 w-3" />} />
            <FloatStat label="Extérieur" value={`${tesla.exterior}°`} icon={<Snowflake className="h-3 w-3" />} />
          </div>
        </div>

        <div className="relative mx-auto h-1.5 w-full max-w-md overflow-hidden rounded-full bg-secondary">
          <div className="absolute left-0 top-0 h-full rounded-full bg-primary transition-all duration-700" style={{ width: `${tesla.charge}%` }} />
          <div className="absolute top-0 h-full w-px bg-foreground/40" style={{ left: `${tesla.chargeLimit}%` }} />
        </div>

        {/* Quick actions — kept inside a card */}
        <div className="rounded-2xl border border-border/60 bg-card p-3 shadow-soft">
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
            <ActionBtn icon={tesla.locked ? <Lock className="h-4 w-4" /> : <LockOpen className="h-4 w-4" />} label={tesla.locked ? "Verrouillée" : "Ouverte"} active={tesla.locked} />
            <ActionBtn icon={<Flame className="h-4 w-4" />} label="Préchauffer" />
            <ActionBtn icon={<Wind className="h-4 w-4" />} label="Climatiser" />
            <ActionBtn icon={<Car className="h-4 w-4" />} label="Coffre" />
            <ActionBtn icon={<Lightbulb className="h-4 w-4" />} label="Phares" />
            <ActionBtn icon={<Volume2 className="h-4 w-4" />} label="Klaxon" />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
          <span className="inline-flex items-center gap-1.5"><Wifi className="h-3 w-3" /> Sync {tesla.lastSeen}</span>
          <span>Logiciel {tesla.software}</span>
          <span>{tesla.inGarage ? "Au garage" : "Hors garage"}</span>
        </div>
      </section>

      {/* ============ 2. TRIMESTRE EN COURS ============ */}
      <Section title={`Trimestre en cours · ${qLabel(currentY, currentQ)}`}>
        <div className="grid gap-3 sm:grid-cols-3">
          <BigStat
            icon={<Zap className="h-4 w-4" />}
            label="kWh à facturer"
            value={`${realKWh}`}
            sub={`${currentQRaw.monthsCounted}/3 mois · ${currentQRaw.sessions} sessions · projection ${estimatedKWh} kWh`}
            accent
          />
          <BigStat
            label="Estimation de montant"
            value={fmtEur(cost(estimatedKWh))}
            sub={`réel ${fmtEur(cost(realKWh))} · ${tesla.pricePerKWh.toFixed(3)} € / kWh`}
          />
          <BigStat
            label={lastFullQ ? `vs ${qLabel(lastFullQ.year, lastFullQ.q)}` : "vs précédent"}
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

            <div className="flex h-full items-end gap-5 sm:gap-6">
              {visibleQuarters.map((q) => {
                const isCurrent = q.key === currentQKey;
                const missing = 3 - q.monthsCounted;
                return (
                  <div key={q.key} className="flex h-full flex-1 items-end gap-1.5">
                    {q.months.map((m) => (
                      <div key={`${m.year}-${m.month}`} className="group relative flex h-full flex-1 flex-col justify-end">
                        <div
                          className={
                            "w-full rounded-t-md transition-all duration-700 " +
                            (isCurrent ? "bg-primary" : "bg-secondary group-hover:bg-secondary/70")
                          }
                          style={{ height: `${(m.kWh / maxMonth) * 100}%` }}
                        />
                        <div className="pointer-events-none absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-foreground px-1.5 py-0.5 text-[10px] text-background opacity-0 transition-opacity group-hover:opacity-100">
                          {m.kWh} kWh
                        </div>
                      </div>
                    ))}
                    {/* invisible placeholders so partial quarter aligns with its labels */}
                    {Array.from({ length: missing }).map((_, i) => (
                      <div key={`bph-${i}`} className="flex h-full flex-1 items-end">
                        <div className="w-full rounded-t-md border border-dashed border-border/60" style={{ height: "8%" }} />
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quarter axis: month labels + quarter total */}
          <div className="mt-2 flex gap-5 sm:gap-6">
            {visibleQuarters.map((q) => {
              const isCurrent = q.key === currentQKey;
              const partial = q.monthsCounted < 3;
              return (
                <div key={q.key} className="flex flex-1 flex-col items-stretch gap-1.5">
                  {/* month labels */}
                  <div className="flex gap-1.5">
                    {q.months.map((m) => (
                      <div key={`${m.year}-${m.month}-l`} className="flex-1 text-center text-[11px] text-muted-foreground">
                        {m.month.slice(0, 3)}
                      </div>
                    ))}
                    {Array.from({ length: 3 - q.monthsCounted }).map((_, i) => (
                      <div key={`ph-${i}`} className="flex-1 text-center text-[11px] text-muted-foreground/40">—</div>
                    ))}
                  </div>
                  {/* bracket */}
                  <div className="relative h-2">
                    <div className={"absolute inset-x-1 top-0 h-px " + (isCurrent ? "bg-primary" : "bg-border")} />
                    <div className={"absolute left-1 top-0 h-2 w-px " + (isCurrent ? "bg-primary" : "bg-border")} />
                    <div className={"absolute right-1 top-0 h-2 w-px " + (isCurrent ? "bg-primary" : "bg-border")} />
                  </div>
                  {/* quarter total */}
                  <div className="flex flex-col items-center gap-0.5">
                    <span className={"text-[11px] uppercase tracking-[0.14em] " + (isCurrent ? "text-primary font-medium" : "text-muted-foreground")}>
                      Q{q.q} '{String(q.year).slice(2)}
                      {partial && <span className="ml-1 normal-case tracking-normal opacity-70">(en cours)</span>}
                    </span>
                    <span className={"font-serif text-xl leading-none " + (isCurrent ? "text-primary" : "text-foreground")}>
                      {q.kWh}
                      <span className="ml-1 text-[11px] font-sans text-muted-foreground">kWh</span>
                    </span>
                    <span className="text-[11px] tabular-nums text-muted-foreground">{fmtEur(cost(q.kWh))}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <p className="mt-4 text-[11px] text-muted-foreground">
          Médiane <span className="text-foreground">mensuelle</span> ({medianMonth} kWh) calculée sur {previousFull.length} trimestres clos · moyenne trimestrielle {avgPrevKWh} kWh ({fmtEur(cost(avgPrevKWh))}).
        </p>
      </Section>
    </div>
  );
}

// ---------- Hero parts ----------

function FloatStat({
  label,
  value,
  icon,
  accent,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <div className="leading-tight">
      <p className="inline-flex items-center gap-1 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
        {icon}
        {label}
      </p>
      <p className={"font-serif text-lg " + (accent ? "text-primary" : "text-foreground")}>{value}</p>
    </div>
  );
}

function ActionBtn({ icon, label, active }: { icon: React.ReactNode; label: string; active?: boolean }) {
  return (
    <button
      type="button"
      className={
        "group flex flex-col items-center gap-1 rounded-xl border px-2 py-2.5 text-[10px] uppercase tracking-[0.12em] transition " +
        (active
          ? "border-primary/40 bg-primary/10 text-primary"
          : "border-border/60 bg-card text-muted-foreground hover:border-foreground/30 hover:text-foreground")
      }
    >
      <span className={"inline-flex h-8 w-8 items-center justify-center rounded-lg " + (active ? "bg-primary/15" : "bg-secondary group-hover:bg-secondary/70")}>
        {icon}
      </span>
      {label}
    </button>
  );
}

function TeslaCar({ charging, locked }: { charging: boolean; locked: boolean }) {
  return (
    <div className="relative flex flex-col items-center">
      <svg viewBox="0 0 240 90" className="h-24 w-44 sm:h-28 sm:w-52" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* shadow */}
        <ellipse cx="120" cy="82" rx="100" ry="4" className="fill-foreground/10" />
        {/* body */}
        <path
          d="M20 62 Q24 50 38 48 L70 44 Q88 28 120 26 Q152 28 170 44 L202 48 Q216 50 220 62 L220 68 Q220 72 216 72 L200 72 Q198 78 190 78 Q182 78 180 72 L60 72 Q58 78 50 78 Q42 78 40 72 L24 72 Q20 72 20 68 Z"
          className="fill-foreground"
        />
        {/* windows */}
        <path
          d="M76 46 L96 32 Q108 30 120 30 Q132 30 144 32 L164 46 Z"
          className="fill-primary/30"
        />
        <line x1="120" y1="30" x2="120" y2="46" className="stroke-foreground" strokeWidth="1.2" />
        {/* wheels */}
        <circle cx="50" cy="72" r="9" className="fill-background stroke-foreground" strokeWidth="2" />
        <circle cx="50" cy="72" r="3.5" className="fill-foreground" />
        <circle cx="190" cy="72" r="9" className="fill-background stroke-foreground" strokeWidth="2" />
        <circle cx="190" cy="72" r="3.5" className="fill-foreground" />
        {/* headlight */}
        <circle cx="216" cy="58" r="2" className="fill-primary" />
        {/* charge port glow */}
        {charging && (
          <g>
            <circle cx="28" cy="58" r="3" className="fill-primary anim-breathe" />
            <path d="M22 56 l4 -3 l-1 3 h3 l-4 4 l1 -3 z" className="fill-primary-foreground" />
          </g>
        )}
        {/* lock indicator */}
        <circle cx="120" cy="50" r="6" className={locked ? "fill-success/20" : "fill-warm/20"} />
        <circle cx="120" cy="50" r="2" className={locked ? "fill-success" : "fill-warm"} />
      </svg>
      <span className={"mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] " + (locked ? "bg-success/10 text-success" : "bg-warm/10 text-warm")}>
        {locked ? <Lock className="h-3 w-3" /> : <LockOpen className="h-3 w-3" />}
        {locked ? "Verrouillée" : "Ouverte"}
      </span>
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
