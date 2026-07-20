import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/page-header";
import { tesla } from "@/lib/mock-data";
import {
  BarChart3,
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
  Volume2,
  Lightbulb,
} from "lucide-react";
import { Eyebrow } from "@/components/eyebrow";
import { Card } from "@/components/card";

export const Route = createFileRoute("/_app/tesla")({
  component: TeslaPage,
  head: () => ({ meta: [{ title: "Bernard — Maison" }] }),
});

// --- Quarter helpers ---
const MONTH_TO_Q: Record<string, number> = {
  Jan: 1,
  Fév: 1,
  Mar: 1,
  Avr: 2,
  Mai: 2,
  Juin: 2,
  Juil: 3,
  Août: 3,
  Sep: 3,
  Oct: 4,
  Nov: 4,
  Déc: 4,
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
  const quartersMap = new Map<
    string,
    {
      key: string;
      year: number;
      q: number;
      kWh: number;
      sessions: number;
      monthsCounted: number;
      months: MonthRow[];
    }
  >();
  for (const row of history) {
    const k = quarterKey(row);
    const cur = quartersMap.get(k) ?? {
      key: k,
      year: row.year,
      q: MONTH_TO_Q[row.month],
      kWh: 0,
      sessions: 0,
      monthsCounted: 0,
      months: [],
    };
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
      return {
        month: m,
        year: currentY,
        kWh: prior?.kWh ?? 0,
        sessions: prior?.sessions ?? 0,
        projected: true,
      };
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
    .map((q) =>
      q.key === currentQKey
        ? { ...q, months: currentQuarter.months, kWh: estimatedKWh, monthsCounted: 3 }
        : q,
    );
  const maxMonth = Math.max(...visibleQuarters.flatMap((q) => q.months.map((m) => m.kWh)));

  const chargeBadge = (
    <span
      className={
        "inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium " +
        (tesla.charging
          ? "bg-primary/15 text-primary"
          : tesla.pluggedIn
            ? "bg-secondary text-foreground"
            : "bg-secondary/60 text-muted-foreground")
      }
    >
      {tesla.charging ? (
        <BatteryCharging className="h-3.5 w-3.5 anim-breathe" />
      ) : (
        <Plug className="h-3.5 w-3.5" />
      )}
      {tesla.charging ? "En charge" : tesla.pluggedIn ? "Branchée" : "Débranchée"}
    </span>
  );

  return (
    <div className="space-y-6">
      {/* Standard overlay header, like Énergie — sticky glass PageHeader; the
          charging state rides along as the header action. */}
      <PageHeader title="Bernard" subtitle={tesla.model} trailing={chargeBadge} />

      {/* ============ 1. ÉTAT DE LA VOITURE ============ */}
      <section className="space-y-4">
        <SectionTitle
          icon={<Gauge className="h-4 w-4" />}
          sub={
            <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
              <span className="inline-flex items-center gap-1">
                <Wifi className="h-3 w-3" /> Sync {tesla.lastSeen}
              </span>
              <span>· Logiciel {tesla.software}</span>
            </span>
          }
        >
          État de la voiture
        </SectionTitle>

        {/* Car visual with floating stats — no card background */}
        <div className="relative flex flex-col items-center gap-3 py-2 sm:grid sm:grid-cols-[1fr_auto_1fr] sm:items-center sm:gap-4">
          <div className="order-2 grid w-full grid-cols-3 gap-3 sm:hidden">
            <FloatStat label="Charge" value={`${tesla.charge}%`} accent />
            <FloatStat label="Autonomie" value={`${tesla.rangeKm} km`} />
            <FloatStat label="Limite" value={`${tesla.chargeLimit}%`} />
            <FloatStat
              label="Intérieur"
              value={`${tesla.interior}°`}
              icon={<Flame className="h-3 w-3" />}
            />
            <FloatStat
              label="Extérieur"
              value={`${tesla.exterior}°`}
              icon={<Snowflake className="h-3 w-3" />}
            />
            <FloatStat
              label="Odomètre"
              value={`${(tesla.odometerKm / 1000).toFixed(1)}k km`}
              icon={<Gauge className="h-3 w-3" />}
            />
          </div>

          <div className="hidden flex-col items-end gap-3 text-right sm:flex">
            <FloatStat label="Charge" value={`${tesla.charge}%`} accent />
            <FloatStat label="Autonomie" value={`${tesla.rangeKm} km`} />
            <FloatStat
              label="Intérieur"
              value={`${tesla.interior}°`}
              icon={<Flame className="h-3 w-3" />}
            />
          </div>

          <div className="order-1 sm:order-none">
            <TeslaCar charging={tesla.charging} locked={tesla.locked} location={tesla.location} />
          </div>

          <div className="hidden flex-col items-start gap-3 sm:flex">
            <FloatStat label="Limite" value={`${tesla.chargeLimit}%`} />
            <FloatStat
              label="Odomètre"
              value={`${(tesla.odometerKm / 1000).toFixed(1)}k km`}
              icon={<Gauge className="h-3 w-3" />}
            />
            <FloatStat
              label="Extérieur"
              value={`${tesla.exterior}°`}
              icon={<Snowflake className="h-3 w-3" />}
            />
          </div>
        </div>

        <div className="relative mx-auto h-1.5 w-full max-w-md overflow-hidden rounded-full bg-secondary">
          <div
            className="absolute left-0 top-0 h-full rounded-full bg-primary transition-all duration-700"
            style={{ width: `${tesla.charge}%` }}
          />
          <div
            className="absolute top-0 h-full w-px bg-foreground/40"
            style={{ left: `${tesla.chargeLimit}%` }}
          />
        </div>
      </section>

      {/* ============ 2. TRIMESTRE EN COURS ============ */}
      <Card
        variant="glass"
        icon={<Zap className="h-4 w-4" />}
        title="Trimestre en cours"
        subline={qLabel(currentY, currentQ)}
      >
        <div className="grid grid-cols-3 divide-x divide-border/60">
          <BigStat
            icon={<Zap className="h-4 w-4" />}
            label="kWh"
            value={`${realKWh}`}
            sub={`${currentQRaw.monthsCounted}/3 mois · ${currentQRaw.sessions} sessions · projection ${estimatedKWh} kWh`}
            accent
          />
          <BigStat
            label="Montant ±"
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
      </Card>

      {/* ============ 3. HISTORIQUE — MENSUEL GROUPÉ PAR TRIMESTRE ============ */}
      {/* Modelled on the Énergie history chart: icon-circle + eyebrow header, one
          responsive monthly bar chart with a median baseline and hover tooltips,
          then a grouped quarter axis under a top border. */}
      <Card
        variant="glass"
        icon={<BarChart3 className="h-4 w-4" />}
        title="Historique mensuel"
        subline={`Groupé par trimestre — médiane ${medianMonth} kWh/mois`}
        action={
          <span
            className={
              "inline-flex items-center gap-1 text-xs " + (qBetter ? "text-success" : "text-warm")
            }
          >
            {qBetter ? (
              <TrendingDown className="h-3.5 w-3.5" />
            ) : (
              <TrendingUp className="h-3.5 w-3.5" />
            )}
            {qBetter ? "sous" : "au-dessus de"} la médiane
          </span>
        }
      >
        <div className="space-y-4">
          {/* Legend */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-secondary" />
              trimestres clos
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-primary" />
              trimestre en cours
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-primary/30 ring-1 ring-primary/50" />
              projection (N-1)
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-px w-4 border-t border-dashed border-foreground/40" />
              médiane
            </span>
          </div>

          {/* Chart — one responsive monthly bar row, median baseline */}
          <div className="relative h-44">
            <div
              className="absolute inset-x-0 z-0 border-t border-dashed border-foreground/30"
              style={{ bottom: `${(medianMonth / maxMonth) * 100}%` }}
            >
              <span className="absolute -top-4 right-0 rounded bg-background/80 px-1 text-2xs tabular-nums text-muted-foreground">
                médiane {medianMonth}
              </span>
            </div>

            <div className="flex h-full items-end gap-2.5 sm:gap-6">
              {visibleQuarters.map((q) => {
                const isCurrent = q.key === currentQKey;
                return (
                  <div key={q.key} className="flex h-full flex-1 items-end gap-1 sm:gap-1.5">
                    {q.months.map((m) => {
                      const projected = !!m.projected;
                      return (
                        <div
                          key={`${m.year}-${m.month}`}
                          className="group relative flex h-full flex-1 flex-col justify-end"
                        >
                          <div
                            className={
                              "w-full rounded-t-md transition-all duration-700 " +
                              (projected
                                ? "bg-primary/25 ring-1 ring-inset ring-primary/50"
                                : isCurrent
                                  ? "bg-primary"
                                  : "bg-secondary group-hover:bg-secondary/70")
                            }
                            style={{ height: `${Math.max((m.kWh / maxMonth) * 100, 4)}%` }}
                          />
                          <div className="pointer-events-none absolute -top-7 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded bg-foreground px-1.5 py-0.5 text-2xs text-background opacity-0 transition-opacity group-hover:opacity-100">
                            {m.kWh} kWh{projected ? " · projection" : ""}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quarter axis — month labels, then the quarter total under a top border */}
          <div className="flex gap-2.5 sm:gap-6">
            {visibleQuarters.map((q) => {
              const isCurrent = q.key === currentQKey;
              return (
                <div key={q.key} className="min-w-0 flex-1">
                  <div className="flex gap-1 sm:gap-1.5">
                    {q.months.map((m) => (
                      <div
                        key={`${m.year}-${m.month}-l`}
                        className={
                          "min-w-0 flex-1 truncate text-center text-2xs " +
                          (m.projected
                            ? "italic text-muted-foreground/60"
                            : "text-muted-foreground")
                        }
                      >
                        {m.month.slice(0, 3)}
                      </div>
                    ))}
                  </div>
                  <div
                    className={
                      "mt-1.5 flex flex-col items-center gap-0.5 border-t pt-1.5 " +
                      (isCurrent ? "border-primary" : "border-border/60")
                    }
                  >
                    <span
                      className={
                        "text-2xs font-medium uppercase tracking-eyebrow " +
                        (isCurrent ? "font-semibold text-primary" : "text-muted-foreground")
                      }
                    >
                      {qLabel(q.year, q.q)}
                      {isCurrent && (
                        <span className="ml-1 normal-case tracking-normal opacity-70">est.</span>
                      )}
                    </span>
                    <span
                      className={
                        "text-base leading-none " + (isCurrent ? "text-primary" : "text-foreground")
                      }
                    >
                      {q.kWh}
                      <span className="ml-0.5 text-2xs font-sans text-muted-foreground">kWh</span>
                    </span>
                    <span className="text-2xs tabular-nums text-muted-foreground">
                      {fmtEur(cost(q.kWh))}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <p className="text-xs text-muted-foreground">
            Médiane <span className="text-foreground">mensuelle</span> ({medianMonth} kWh) sur{" "}
            {previousFull.length} trimestres clos · moyenne trimestrielle {avgPrevKWh} kWh (
            {fmtEur(cost(avgPrevKWh))}). Les mois manquants du trimestre en cours sont projetés sur
            base de l'année précédente.
          </p>
        </div>
      </Card>
    </div>
  );
}

// ---------- Section title ----------

// One header pattern for every section: a teal colour ball + a serif label, with
// an optional sub-line sitting right under the label (to the right of the ball).
function SectionTitle({
  icon,
  sub,
  children,
}: {
  icon: React.ReactNode;
  sub?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
        {icon}
      </span>
      <div className="min-w-0">
        <h2 className="text-base font-semibold leading-tight tracking-tight">{children}</h2>
        {sub && <div className="mt-0.5 text-xs text-muted-foreground">{sub}</div>}
      </div>
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
      <Eyebrow size="xs" className="inline-flex items-center gap-1 text-muted-foreground/60">
        {icon}
        {label}
      </Eyebrow>
      <p className={"text-base font-medium " + (accent ? "text-primary" : "text-foreground")}>
        {value}
      </p>
    </div>
  );
}

function TeslaCar({
  charging,
  locked,
  location,
}: {
  charging: boolean;
  locked: boolean;
  location: string;
}) {
  // Playful Tesla Model 3 illustration — red body, chunky wheels, sparkles
  return (
    <div className="relative flex flex-col items-center">
      <svg
        viewBox="0 0 260 130"
        className="h-32 w-52 sm:h-36 sm:w-60"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="teslaBody" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(0, 78%, 62%)" />
            <stop offset="55%" stopColor="hsl(0, 75%, 50%)" />
            <stop offset="100%" stopColor="hsl(0, 70%, 38%)" />
          </linearGradient>
          <linearGradient id="teslaGlass" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(210, 60%, 85%)" />
            <stop offset="100%" stopColor="hsl(210, 50%, 65%)" />
          </linearGradient>
          <linearGradient id="teslaTire" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="hsl(260, 30%, 30%)" />
            <stop offset="100%" stopColor="hsl(260, 35%, 18%)" />
          </linearGradient>
          <radialGradient id="teslaHub" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0%" stopColor="hsl(40, 100%, 70%)" />
            <stop offset="100%" stopColor="hsl(28, 95%, 55%)" />
          </radialGradient>
        </defs>

        {/* soft ground shadow */}
        <ellipse cx="130" cy="118" rx="105" ry="5" className="fill-foreground/10" />

        {/* lower bumper / chrome */}
        <path
          d="M22 92 Q26 84 36 84 L224 84 Q234 84 238 92 L236 100 L24 100 Z"
          className="fill-secondary"
        />

        {/* main body */}
        <path
          d="M30 88 Q34 70 56 66 L88 60 Q104 38 130 36 Q156 38 172 60 L204 66 Q226 70 230 88 L230 96 Q230 100 226 100 L210 100 Q208 108 198 108 Q188 108 186 100 L74 100 Q72 108 62 108 Q52 108 50 100 L34 100 Q30 100 30 96 Z"
          fill="url(#teslaBody)"
        />

        {/* highlight stripe */}
        <path d="M40 84 Q90 76 200 78 Q220 80 224 86 L40 86 Z" className="fill-white/20" />

        {/* greenhouse / windows */}
        <path d="M92 64 L108 44 Q119 40 130 40 Q141 40 152 44 L168 64 Z" fill="url(#teslaGlass)" />
        {/* B-pillar */}
        <line
          x1="130"
          y1="40"
          x2="130"
          y2="64"
          className="stroke-foreground/70"
          strokeWidth="1.4"
        />
        {/* window outline */}
        <path
          d="M92 64 L108 44 Q119 40 130 40 Q141 40 152 44 L168 64"
          className="stroke-foreground/40"
          strokeWidth="1"
          fill="none"
        />

        {/* door line */}
        <path d="M130 66 L130 84" className="stroke-foreground/15" strokeWidth="1" />
        {/* door handle */}
        <rect x="118" y="74" width="8" height="2" rx="1" className="fill-foreground/30" />
        <rect x="142" y="74" width="8" height="2" rx="1" className="fill-foreground/30" />

        {/* headlight */}
        <path d="M222 80 Q230 80 230 86 L222 86 Z" className="fill-primary-foreground" />
        {/* taillight */}
        <rect x="30" y="80" width="6" height="4" rx="1" className="fill-foreground/40" />

        {/* wheel arches */}
        <path d="M44 100 Q44 78 74 78 Q104 78 104 100 Z" className="fill-foreground/15" />
        <path d="M156 100 Q156 78 186 78 Q216 78 216 100 Z" className="fill-foreground/15" />

        {/* wheels */}
        <circle cx="74" cy="100" r="16" fill="url(#teslaTire)" />
        <circle cx="74" cy="100" r="9" fill="url(#teslaHub)" />
        <circle cx="74" cy="100" r="2.5" className="fill-foreground/70" />
        <circle cx="186" cy="100" r="16" fill="url(#teslaTire)" />
        <circle cx="186" cy="100" r="9" fill="url(#teslaHub)" />
        <circle cx="186" cy="100" r="2.5" className="fill-foreground/70" />

        {/* sparkles */}
        <g className="fill-white">
          <path
            d="M170 50 l1.5 3 l3 1.5 l-3 1.5 l-1.5 3 l-1.5 -3 l-3 -1.5 l3 -1.5 z"
            opacity="0.9"
          />
          <path d="M70 78 l1 2 l2 1 l-2 1 l-1 2 l-1 -2 l-2 -1 l2 -1 z" opacity="0.8" />
          <path d="M210 92 l1 2 l2 1 l-2 1 l-1 2 l-1 -2 l-2 -1 l2 -1 z" opacity="0.7" />
        </g>

        {/* charge port glow */}
        {charging && (
          <g className="anim-breathe">
            <circle cx="34" cy="74" r="5" className="fill-primary/40" />
            <circle cx="34" cy="74" r="2.5" className="fill-primary" />
          </g>
        )}

        {/* lock indicator on roof */}
        <g>
          <circle cx="130" cy="52" r="6" className={locked ? "fill-success/25" : "fill-warm/25"} />
          <circle cx="130" cy="52" r="2.5" className={locked ? "fill-success" : "fill-warm"} />
        </g>
      </svg>
      <div className="mt-1 flex flex-wrap items-center justify-center gap-2 text-2xs">
        <span
          className={
            "inline-flex items-center gap-1 rounded-full px-2 py-0.5 " +
            (locked ? "bg-success/10 text-success" : "bg-warm/10 text-warm")
          }
        >
          {locked ? <Lock className="h-3 w-3" /> : <LockOpen className="h-3 w-3" />}
          {locked ? "Verrouillée" : "Ouverte"}
        </span>
        <span className="inline-flex items-center gap-1 text-muted-foreground">
          <MapPin className="h-3 w-3" />
          {location}
        </span>
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
    <div className="px-3 py-4 first:pl-0 last:pr-0">
      <Eyebrow as="div" size="xs" className="flex items-center gap-1 text-muted-foreground/60">
        {icon}
        {label}
      </Eyebrow>
      <p
        className={
          "mt-1.5 text-lg font-semibold " +
          (accent
            ? "text-primary"
            : trend === "down"
              ? "text-success"
              : trend === "up"
                ? "text-mustard"
                : "text-foreground")
        }
      >
        {value}
      </p>
      {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}
