import type { ReactNode } from "react";
import { Card } from "@/components/card";
import { DataState } from "@/components/data-state";
import { Eyebrow } from "@/components/eyebrow";
import { PageHeader } from "@/components/page-header";
import { TeslaCar } from "@/components/tesla-car";
import {
  BarChart3,
  BatteryCharging,
  Flame,
  Gauge,
  Plug,
  Snowflake,
  TrendingDown,
  TrendingUp,
  Wifi,
  Zap,
} from "lucide-react";

/* ────────────────────────────────────────────────────────────────────────────
   The car, as a page — what it is doing now, and what it has cost this quarter.

   Every figure arrives measured: the quarters come aggregated, the projection
   comes flagged as one, the median is a number somebody else computed. The page
   groups months under their quarter and draws the bars; it never decides which
   month is missing or what should stand in for it.

   A missing value is `null`, never a zero — an odometer nobody could read and a
   car that has not moved are not the same thing, and they must not look alike.
   ─────────────────────────────────────────────────────────────────────────── */

/** What the car reports about itself. A `null` is a value nobody could read. */
export interface TeslaCarView {
  /** Shown under the name — "Model 3 Long Range". */
  model: string;
  /** Battery, 0–100. */
  charge: number | null;
  /** Estimated range, km. */
  rangeKm: number | null;
  /** Where charging stops, 0–100 — the tick on the bar. */
  chargeLimit: number | null;
  /** Cabin temperature, °C. */
  interior: number | null;
  /** Outside temperature, °C. */
  exterior: number | null;
  /** Total distance, km. Shown in thousands. */
  odometerKm: number | null;
  /** Software version, as the car names it. */
  software: string | null;
  /** When it last phoned home, already phrased — "il y a 5 min". */
  lastSeen: string | null;
  /** Where it is. */
  location: string | null;
  charging: boolean;
  pluggedIn: boolean;
  locked: boolean;
}

/** One month of charging. */
export interface TeslaMonthView {
  /** Identifies the bar. */
  key: string;
  /** Short month label — "Jan". */
  label: string;
  kWh: number;
  /** Stood in for from last year rather than measured. */
  projected?: boolean;
}

/** One quarter, and the months under it. */
export interface TeslaQuarterView {
  key: string;
  /** "2026.Q3". */
  label: string;
  /** The quarter's total, projection included. */
  kWh: number;
  months: TeslaMonthView[];
  /** The quarter in progress — drawn in full colour and marked "est.". */
  current?: boolean;
}

/** The quarter in progress, already measured. */
export interface TeslaCurrentQuarterView {
  label: string;
  /** What has actually been charged so far. */
  realKWh: number;
  /** Real plus projection. */
  estimatedKWh: number;
  /** How many of the three months are real. */
  monthsCounted: number;
  sessions: number;
  /** The last CLOSED quarter, to compare against. */
  previous?: {
    label: string;
    kWh: number;
    /** Signed variation in percent, absolute value — `better` carries the sign. */
    deltaPct: number;
    /** The current quarter is under the previous one. */
    better: boolean;
  };
}

export interface TeslaPageProps {
  car: TeslaCarView;
  /** What a kWh costs, in euros — every amount on the page is derived from it. */
  pricePerKWh: number;
  /** The quarter in progress. Absent while there is no charging history at all. */
  currentQuarter?: TeslaCurrentQuarterView;
  /** Closed quarters plus the current one, oldest first. */
  quarters: TeslaQuarterView[];
  /** Median monthly kWh over the closed quarters — the chart's baseline. */
  medianMonth: number;
  /** How many closed quarters the median rests on. */
  closedQuarters: number;
  /** Average kWh of a closed quarter. */
  avgQuarterKWh: number;
  /** The charging history is still on its way. */
  loading?: boolean;
  /** It failed. Shown instead of the figures, never as a spinner. */
  error?: boolean;
  /** Retry handler for the failure state. */
  onRetry?: () => void;
}

const fmtEur = (n: number) =>
  n.toLocaleString("fr-BE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });

const val = (n: number | null, unit: string) => (n == null ? "—" : `${n}${unit}`);

/** Bernard: his state, his quarter, and the months behind it. */
export function TeslaPageTemplate({
  car,
  pricePerKWh,
  currentQuarter,
  quarters,
  medianMonth,
  closedQuarters,
  avgQuarterKWh,
  loading = false,
  error = false,
  onRetry,
}: TeslaPageProps) {
  const cost = (kWh: number) => kWh * pricePerKWh;
  const maxMonth = Math.max(1, ...quarters.flatMap((q) => q.months.map((m) => m.kWh)));
  const better = currentQuarter?.previous?.better ?? false;

  const chargeBadge = (
    <span
      className={
        "inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium " +
        (car.charging
          ? "bg-primary/15 text-primary"
          : car.pluggedIn
            ? "bg-secondary text-foreground"
            : "bg-secondary/60 text-muted-foreground")
      }
    >
      {car.charging ? (
        <BatteryCharging className="h-3.5 w-3.5 anim-breathe" />
      ) : (
        <Plug className="h-3.5 w-3.5" />
      )}
      {car.charging ? "En charge" : car.pluggedIn ? "Branchée" : "Débranchée"}
    </span>
  );

  const odometer = car.odometerKm == null ? "—" : `${(car.odometerKm / 1000).toFixed(1)}k km`;

  return (
    <div className="space-y-6">
      {/* Standard overlay header, like Énergie — sticky glass PageHeader; the
          charging state rides along as the header action. */}
      <PageHeader title="Bernard" subtitle={car.model} trailing={chargeBadge} />

      {/* ============ 1. ÉTAT DE LA VOITURE ============ */}
      <section className="space-y-4">
        <SectionTitle
          icon={<Gauge className="h-4 w-4" />}
          sub={
            <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
              <span className="inline-flex items-center gap-1">
                <Wifi className="h-3 w-3" /> Sync {car.lastSeen ?? "—"}
              </span>
              <span>· Logiciel {car.software ?? "—"}</span>
            </span>
          }
        >
          État de la voiture
        </SectionTitle>

        {/* Car visual with floating stats — no card background */}
        <div className="relative flex flex-col items-center gap-3 py-2 sm:grid sm:grid-cols-[1fr_auto_1fr] sm:items-center sm:gap-4">
          <div className="order-2 grid w-full grid-cols-3 gap-3 sm:hidden">
            <FloatStat label="Charge" value={val(car.charge, "%")} accent />
            <FloatStat label="Autonomie" value={val(car.rangeKm, " km")} />
            <FloatStat label="Limite" value={val(car.chargeLimit, "%")} />
            <FloatStat
              label="Intérieur"
              value={val(car.interior, "°")}
              icon={<Flame className="h-3 w-3" />}
            />
            <FloatStat
              label="Extérieur"
              value={val(car.exterior, "°")}
              icon={<Snowflake className="h-3 w-3" />}
            />
            <FloatStat label="Odomètre" value={odometer} icon={<Gauge className="h-3 w-3" />} />
          </div>

          <div className="hidden flex-col items-end gap-3 text-right sm:flex">
            <FloatStat label="Charge" value={val(car.charge, "%")} accent />
            <FloatStat label="Autonomie" value={val(car.rangeKm, " km")} />
            <FloatStat
              label="Intérieur"
              value={val(car.interior, "°")}
              icon={<Flame className="h-3 w-3" />}
            />
          </div>

          <div className="order-1 sm:order-none">
            <TeslaCar charging={car.charging} locked={car.locked} location={car.location} />
          </div>

          <div className="hidden flex-col items-start gap-3 sm:flex">
            <FloatStat label="Limite" value={val(car.chargeLimit, "%")} />
            <FloatStat label="Odomètre" value={odometer} icon={<Gauge className="h-3 w-3" />} />
            <FloatStat
              label="Extérieur"
              value={val(car.exterior, "°")}
              icon={<Snowflake className="h-3 w-3" />}
            />
          </div>
        </div>

        <div className="relative mx-auto h-1.5 w-full max-w-md overflow-hidden rounded-full bg-secondary">
          <div
            className="absolute left-0 top-0 h-full rounded-full bg-primary transition-all duration-700"
            style={{ width: `${car.charge ?? 0}%` }}
          />
          <div
            className="absolute top-0 h-full w-px bg-foreground/40"
            style={{ left: `${car.chargeLimit ?? 0}%` }}
          />
        </div>
      </section>

      {/* ============ 2. TRIMESTRE EN COURS ============ */}
      <Card
        variant="glass"
        icon={<Zap className="h-4 w-4" />}
        title="Trimestre en cours"
        subline={currentQuarter?.label}
      >
        {error ? (
          <DataState status="error" label="l'historique de charge" onRetry={onRetry} />
        ) : loading ? (
          <DataState status="loading" label="l'historique de charge" />
        ) : !currentQuarter ? (
          <DataState status="empty" label="l'historique de charge" />
        ) : (
          <div className="grid grid-cols-3 divide-x divide-border/60">
            <BigStat
              icon={<Zap className="h-4 w-4" />}
              label="kWh"
              value={`${currentQuarter.realKWh}`}
              sub={`${currentQuarter.monthsCounted}/3 mois · ${currentQuarter.sessions} sessions · projection ${currentQuarter.estimatedKWh} kWh`}
              accent
            />
            <BigStat
              label="Montant ±"
              value={fmtEur(cost(currentQuarter.estimatedKWh))}
              sub={`réel ${fmtEur(cost(currentQuarter.realKWh))} · ${pricePerKWh.toFixed(3)} € / kWh`}
            />
            <BigStat
              label={
                currentQuarter.previous ? `vs ${currentQuarter.previous.label}` : "vs précédent"
              }
              value={
                currentQuarter.previous
                  ? `${better ? "−" : "+"}${currentQuarter.previous.deltaPct}%`
                  : "—"
              }
              sub={
                currentQuarter.previous
                  ? `${currentQuarter.previous.kWh} kWh · ${fmtEur(cost(currentQuarter.previous.kWh))}`
                  : undefined
              }
              trend={currentQuarter.previous ? (better ? "down" : "up") : undefined}
            />
          </div>
        )}
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
        trailing={
          currentQuarter?.previous ? (
            <span
              className={
                "inline-flex items-center gap-1 text-xs " + (better ? "text-success" : "text-warm")
              }
            >
              {better ? (
                <TrendingDown className="h-3.5 w-3.5" />
              ) : (
                <TrendingUp className="h-3.5 w-3.5" />
              )}
              {better ? "sous" : "au-dessus de"} la médiane
            </span>
          ) : undefined
        }
      >
        {error ? (
          <DataState status="error" label="l'historique de charge" onRetry={onRetry} />
        ) : loading ? (
          <DataState status="loading" label="l'historique de charge" />
        ) : quarters.length === 0 ? (
          <DataState status="empty" label="l'historique de charge" />
        ) : (
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
                {quarters.map((q) => (
                  <div key={q.key} className="flex h-full flex-1 items-end gap-1 sm:gap-1.5">
                    {q.months.map((m) => (
                      <div
                        key={m.key}
                        className="group relative flex h-full flex-1 flex-col justify-end"
                      >
                        <div
                          className={
                            "w-full rounded-t-md transition-all duration-700 " +
                            (m.projected
                              ? "bg-primary/25 ring-1 ring-inset ring-primary/50"
                              : q.current
                                ? "bg-primary"
                                : "bg-secondary group-hover:bg-secondary/70")
                          }
                          style={{ height: `${Math.max((m.kWh / maxMonth) * 100, 4)}%` }}
                        />
                        <div className="pointer-events-none absolute -top-7 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded bg-foreground px-1.5 py-0.5 text-2xs text-background opacity-0 transition-opacity group-hover:opacity-100">
                          {m.kWh} kWh{m.projected ? " · projection" : ""}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Quarter axis — month labels, then the quarter total under a top border */}
            <div className="flex gap-2.5 sm:gap-6">
              {quarters.map((q) => (
                <div key={q.key} className="min-w-0 flex-1">
                  <div className="flex gap-1 sm:gap-1.5">
                    {q.months.map((m) => (
                      <div
                        key={`${m.key}-l`}
                        className={
                          "min-w-0 flex-1 truncate text-center text-2xs " +
                          (m.projected
                            ? "italic text-muted-foreground/60"
                            : "text-muted-foreground")
                        }
                      >
                        {m.label}
                      </div>
                    ))}
                  </div>
                  <div
                    className={
                      "mt-1.5 flex flex-col items-center gap-0.5 border-t pt-1.5 " +
                      (q.current ? "border-primary" : "border-border/60")
                    }
                  >
                    <span
                      className={
                        "text-2xs font-medium uppercase tracking-eyebrow " +
                        (q.current ? "font-semibold text-primary" : "text-muted-foreground")
                      }
                    >
                      {q.label}
                      {q.current && (
                        <span className="ml-1 normal-case tracking-normal opacity-70">est.</span>
                      )}
                    </span>
                    <span
                      className={
                        "text-base leading-none " + (q.current ? "text-primary" : "text-foreground")
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
              ))}
            </div>

            <p className="text-xs text-muted-foreground">
              Médiane <span className="text-foreground">mensuelle</span> ({medianMonth} kWh) sur{" "}
              {closedQuarters} trimestres clos · moyenne trimestrielle {avgQuarterKWh} kWh (
              {fmtEur(cost(avgQuarterKWh))}). Les mois manquants du trimestre en cours sont projetés
              sur base de l&apos;année précédente.
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}

// ---------- section title ----------

// One header pattern for every section: a teal colour ball + a label, with an
// optional sub-line sitting right under it.
function SectionTitle({
  icon,
  sub,
  children,
}: {
  icon: ReactNode;
  sub?: ReactNode;
  children: ReactNode;
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

// ---------- hero parts ----------

function FloatStat({
  label,
  value,
  icon,
  accent,
}: {
  label: string;
  value: string;
  icon?: ReactNode;
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

function BigStat({
  icon,
  label,
  value,
  sub,
  accent,
  trend,
}: {
  icon?: ReactNode;
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
