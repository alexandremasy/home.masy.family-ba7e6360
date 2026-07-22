import { createFileRoute } from "@tanstack/react-router";
import { tesla } from "@/lib/mock-data";
import { TeslaPageTemplate, type TeslaMonthView, type TeslaQuarterView } from "@/templates/tesla";

export const Route = createFileRoute("/_app/tesla")({
  component: TeslaPage,
  head: () => ({ meta: [{ title: "Bernard — Maison" }] }),
});

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

/**
 * The page is the template; this file only pretends to be a car and a database.
 *
 * The quarters, the projection and the median are measured here exactly as the
 * api measures them over there — the page receives them done.
 */
function TeslaPage() {
  const history = tesla.monthly.history as MonthRow[];
  const last = history[history.length - 1];
  const currentQ = MONTH_TO_Q[last.month];
  const currentY = last.year;
  const currentKey = `${currentY}-Q${currentQ}`;

  // Aggregate by quarter.
  const byQuarter = new Map<
    string,
    { key: string; year: number; q: number; kWh: number; sessions: number; months: MonthRow[] }
  >();
  for (const row of history) {
    const key = `${row.year}-Q${MONTH_TO_Q[row.month]}`;
    const cur = byQuarter.get(key) ?? {
      key,
      year: row.year,
      q: MONTH_TO_Q[row.month],
      kWh: 0,
      sessions: 0,
      months: [],
    };
    cur.kWh += row.kWh;
    cur.sessions += row.sessions;
    cur.months.push(row);
    byQuarter.set(key, cur);
  }

  // The months of the current quarter nobody has driven yet stand in from N-1.
  const current = byQuarter.get(currentKey)!;
  const present = new Set(current.months.map((m) => m.month));
  const projected: MonthRow[] = Q_MONTHS_FR[currentQ]
    .filter((m) => !present.has(m))
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
  const realKWh = Math.round(current.kWh);
  const estimatedKWh = realKWh + Math.round(projected.reduce((s, m) => s + m.kWh, 0));

  const all = [...byQuarter.values()].sort((a, b) =>
    a.year === b.year ? a.q - b.q : a.year - b.year,
  );
  const closed = all.filter((q) => q.key !== currentKey && q.months.length === 3);
  const lastClosed = closed[closed.length - 1];
  const avgQuarterKWh = closed.length
    ? Math.round(closed.reduce((s, q) => s + q.kWh, 0) / closed.length)
    : 0;
  const medianQuarter = (() => {
    if (!closed.length) return 0;
    const sorted = closed.map((q) => q.kWh).sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 ? sorted[mid] : Math.round((sorted[mid - 1] + sorted[mid]) / 2);
  })();

  const delta = estimatedKWh - (lastClosed?.kWh ?? 0);
  const monthView = (m: MonthRow): TeslaMonthView => ({
    key: `${m.year}-${m.month}`,
    label: m.month,
    kWh: Math.round(m.kWh),
    projected: m.projected,
  });

  const quarters: TeslaQuarterView[] = all
    .filter((q) => q.months.length === 3 || q.key === currentKey)
    .map((q) =>
      q.key === currentKey
        ? {
            key: q.key,
            label: `${q.year}.Q${q.q}`,
            kWh: estimatedKWh,
            current: true,
            months: [...q.months, ...projected]
              .sort(
                (a, b) =>
                  Q_MONTHS_FR[currentQ].indexOf(a.month) - Q_MONTHS_FR[currentQ].indexOf(b.month),
              )
              .map(monthView),
          }
        : {
            key: q.key,
            label: `${q.year}.Q${q.q}`,
            kWh: Math.round(q.kWh),
            months: q.months.map(monthView),
          },
    );

  return (
    <TeslaPageTemplate
      car={{
        model: tesla.model,
        charge: tesla.charge,
        rangeKm: tesla.rangeKm,
        chargeLimit: tesla.chargeLimit,
        interior: tesla.interior,
        exterior: tesla.exterior,
        odometerKm: tesla.odometerKm,
        software: tesla.software,
        lastSeen: tesla.lastSeen,
        location: tesla.location,
        charging: tesla.charging,
        pluggedIn: tesla.pluggedIn,
        locked: tesla.locked,
      }}
      pricePerKWh={tesla.pricePerKWh}
      currentQuarter={{
        label: `${currentY}.Q${currentQ}`,
        realKWh,
        estimatedKWh,
        monthsCounted: current.months.length,
        sessions: current.sessions,
        previous: lastClosed
          ? {
              label: `${lastClosed.year}.Q${lastClosed.q}`,
              kWh: Math.round(lastClosed.kWh),
              deltaPct: Math.round((Math.abs(delta) / lastClosed.kWh) * 100),
              better: delta < 0,
            }
          : undefined,
      }}
      quarters={quarters}
      medianMonth={medianQuarter ? Math.round(medianQuarter / 3) : 0}
      closedQuarters={closed.length}
      avgQuarterKWh={avgQuarterKWh}
    />
  );
}
