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
  FileText,
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
const Q_MONTHS: Record<number, string[]> = {
  1: ["Jan", "Fév", "Mar"],
  2: ["Avr", "Mai", "Juin"],
  3: ["Juil", "Août", "Sep"],
  4: ["Oct", "Nov", "Déc"],
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
  const quartersMap = new Map<string, { key: string; year: number; q: number; kWh: number; sessions: number; monthsCounted: number }>();
  for (const row of history) {
    const k = quarterKey(row);
    const cur = quartersMap.get(k) ?? { key: k, year: row.year, q: MONTH_TO_Q[row.month], kWh: 0, sessions: 0, monthsCounted: 0 };
    cur.kWh += row.kWh;
    cur.sessions += row.sessions;
    cur.monthsCounted += 1;
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

  const qDelta = currentQuarter.kWh - (lastFullQ?.kWh ?? 0);
  const qBetter = qDelta < 0;
  const qDeltaPct = lastFullQ ? Math.round((Math.abs(qDelta) / lastFullQ.kWh) * 100) : 0;

  const cost = (kWh: number) => kWh * tesla.pricePerKWh;
  const fmtEur = (n: number) =>
    n.toLocaleString("fr-BE", { style: "currency", currency: "EUR", maximumFractionDigits: 0 });

  const maxQ = Math.max(...quarters.map((q) => q.kWh));
  const maxMonth = Math.max(...history.map((h) => h.kWh));

  return (
    <div className="space-y-8">
      <PageHeader title="Tesla" />

      {/* ============ 1. ÉTAT DE LA VOITURE ============ */}
      <section className="space-y-3">
        <h2 className="text-xs uppercase tracking-[0.18em] text-muted-foreground">État de la voiture</h2>

        {/* Battery hero */}
        <div className="rounded-2xl bg-foreground p-6 text-background shadow-soft">
          <div className="flex items-start justify-between gap-4">
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
          <div className="mt-5 relative h-2 w-full overflow-hidden rounded-full bg-background/15">
            <div className="absolute left-0 top-0 h-full rounded-full bg-primary transition-all duration-700" style={{ width: `${tesla.charge}%` }} />
            <div className="absolute top-0 h-full w-px bg-background/40" style={{ left: `${tesla.chargeLimit}%` }} />
          </div>
        </div>

        {/* Detailed state grid */}
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6 stagger">
          <Stat icon={<MapPin className="h-3.5 w-3.5" />} label="Position" value={tesla.inGarage ? "Garage" : "En route"} sub={tesla.location} />
          <Stat icon={<Thermometer className="h-3.5 w-3.5" />} label="Habitacle" value={`${tesla.interior}°`} sub={`Ext. ${tesla.exterior}°`} />
          <Stat icon={<Lock className="h-3.5 w-3.5" />} label="Verrouillage" value={tesla.locked ? "Verrouillée" : "Ouverte"} sub={tesla.locked ? "OK" : "À vérifier"} />
          <Stat icon={<Gauge className="h-3.5 w-3.5" />} label="Odomètre" value={`${tesla.odometerKm.toLocaleString("fr-BE")} km`} />
          <Stat icon={<Cpu className="h-3.5 w-3.5" />} label="Logiciel" value={tesla.software} sub="à jour" />
          <Stat icon={<Wifi className="h-3.5 w-3.5" />} label="Dernière sync" value={tesla.lastSeen} sub="connectée" />
        </div>
      </section>

      {/* ============ 2. FACTURATION TRIMESTRIELLE ============ */}
      <Section
        title={`Trimestre en cours · Q${currentQ} ${currentY}`}
        action={
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
            <FileText className="h-3.5 w-3.5" />
            Facture émise fin de trimestre
          </span>
        }
      >
        {/* Current quarter big numbers */}
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
            label={`vs Q${lastFullQ?.q} ${lastFullQ?.year}`}
            value={
              lastFullQ
                ? `${qBetter ? "−" : "+"}${qDeltaPct}%`
                : "—"
            }
            sub={lastFullQ ? `${lastFullQ.kWh} kWh · ${fmtEur(cost(lastFullQ.kWh))}` : undefined}
            trend={lastFullQ ? (qBetter ? "down" : "up") : undefined}
          />
        </div>

        {/* Quarter progress bar */}
        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between text-[11px] text-muted-foreground">
            <span>Avancement du trimestre</span>
            <span className="tabular-nums">{Math.round((currentQuarter.monthsCounted / 3) * 100)}%</span>
          </div>
          <div className="flex gap-1.5">
            {Q_MONTHS[currentQ].map((m, i) => {
              const filled = i < currentQuarter.monthsCounted;
              const row = history.find((h) => h.month === m && h.year === currentY);
              return (
                <div key={m} className="flex-1">
                  <div className={"h-1.5 rounded-full " + (filled ? "bg-primary" : "bg-secondary")} />
                  <div className="mt-1 flex items-baseline justify-between">
                    <span className="text-[10px] text-muted-foreground">{m}</span>
                    <span className="text-[10px] tabular-nums text-muted-foreground">{row ? `${row.kWh}` : "—"}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quarter comparison */}
        <div className="mt-7">
          <div className="mb-3 flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Comparaison trimestrielle</p>
            <span className="text-[11px] text-muted-foreground">
              moy. {avgPrevKWh} kWh · {fmtEur(cost(avgPrevKWh))}
            </span>
          </div>
          <div className="flex h-36 items-end gap-2 sm:gap-3">
            {quarters.map((q) => {
              const isCurrent = q.key === currentQKey;
              const isPartial = q.monthsCounted < 3;
              return (
                <div key={q.key} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
                  <span className="text-[10px] tabular-nums text-muted-foreground">{q.kWh}</span>
                  <div className="relative w-full" style={{ height: `${(q.kWh / maxQ) * 100}%` }}>
                    <div
                      className={
                        "absolute inset-0 rounded-t-md transition-all duration-700 " +
                        (isCurrent ? "bg-primary" : "bg-secondary")
                      }
                    />
                    {isPartial && (
                      <div className="absolute inset-0 rounded-t-md bg-[repeating-linear-gradient(45deg,transparent_0_4px,rgba(255,255,255,0.25)_4px_8px)]" />
                    )}
                  </div>
                  <div className="flex flex-col items-center">
                    <span className={"text-[10px] " + (isCurrent ? "font-medium text-foreground" : "text-muted-foreground")}>
                      Q{q.q}
                    </span>
                    <span className="text-[9px] text-muted-foreground">'{String(q.year).slice(2)}</span>
                  </div>
                </div>
              );
            })}
          </div>
          <p className="mt-3 text-[11px] text-muted-foreground">
            Le trimestre en cours est hachuré tant qu'il n'est pas complet.
          </p>
        </div>
      </Section>

      {/* ============ 3. DÉTAIL MENSUEL ============ */}
      <Section
        title="Détail mensuel"
        action={
          <span className={"inline-flex items-center gap-1 text-xs " + (qBetter ? "text-success" : "text-warm")}>
            {qBetter ? <TrendingDown className="h-3.5 w-3.5" /> : <TrendingUp className="h-3.5 w-3.5" />}
            tendance trimestre
          </span>
        }
      >
        <div className="flex h-32 items-end gap-1.5">
          {history.map((h) => {
            const inCurrentQ = MONTH_TO_Q[h.month] === currentQ && h.year === currentY;
            const qNum = MONTH_TO_Q[h.month];
            const tint =
              qNum === 1 ? "bg-secondary" :
              qNum === 2 ? "bg-secondary/80" :
              qNum === 3 ? "bg-secondary/60" :
              "bg-secondary/90";
            return (
              <div key={`${h.year}-${h.month}`} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
                <span className="text-[9px] tabular-nums text-muted-foreground">{h.kWh}</span>
                <div
                  className={"w-full rounded-t-sm transition-all duration-700 " + (inCurrentQ ? "bg-primary" : tint)}
                  style={{ height: `${(h.kWh / maxMonth) * 100}%` }}
                />
                <span className={"text-[9px] " + (inCurrentQ ? "font-medium text-foreground" : "text-muted-foreground")}>
                  {h.month}
                </span>
              </div>
            );
          })}
        </div>
      </Section>
    </div>
  );
}

function Stat({
  label,
  value,
  sub,
  icon,
}: {
  label: string;
  value: string;
  sub?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-card p-3">
      <div className="flex items-center gap-1 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
        {icon}
        {label}
      </div>
      <p className="mt-1.5 font-serif text-base leading-tight">{value}</p>
      {sub && <p className="text-[10px] text-muted-foreground">{sub}</p>}
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
