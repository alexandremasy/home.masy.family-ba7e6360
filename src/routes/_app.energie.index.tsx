import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { energie } from "@/lib/mock-data";
import {
  EnergieVueTemplate,
  type EnergieDomain,
  type EnergieHistoryPointView,
  type EnergieReleveValues,
  type EnergieReleveView,
} from "@/templates/energie-vue";
import type { TrendDirection } from "@/components/trend-badge";

export const Route = createFileRoute("/_app/energie/")({
  component: EnergiePage,
  head: () => ({ meta: [{ title: "Énergie — Maison" }] }),
});

const MONTH_LABELS = [
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

// What the api computes server-side: the seasonal shape used to project a month
// nobody has read yet.
const SEASONAL: Record<EnergieDomain, number[]> = {
  elec: [1.15, 1.18, 1.05, 0.95, 0.85, 0.75, 0.7, 0.75, 0.85, 0.95, 1.1, 1.18],
  eau: [0.95, 0.95, 1, 1, 1.05, 1.1, 1.12, 1.1, 1.05, 1, 0.95, 0.95],
  mazout: [1.3, 1.25, 1.05, 0.85, 0.6, 0.45, 0.4, 0.45, 0.65, 0.9, 1.15, 1.3],
};

type MockMonth = (typeof energie.history)[number];

// Net grid consumption — negative when solar injection exceeds what was drawn.
const PICK: Record<EnergieDomain, (h: MockMonth) => number> = {
  elec: (h) => h.jour + h.nuit - (h.solar ?? 0),
  eau: (h) => h.eau,
  mazout: (h) => h.mazout,
};

const OIL_CAPACITY = energie.oil.tankCapacity;

// A reading on the 1st covers the previous month, so the newest recorded month is
// the one before the last reading.
function anchorMonth() {
  const last = new Date(energie.lastReadingDate);
  return new Date(last.getFullYear(), last.getMonth() - 1, 1);
}

// 12-month rolling series ending this month: recorded months carry their value,
// the rest are projected from the recent average scaled by the seasonal curve.
function buildHistory(domain: EnergieDomain): EnergieHistoryPointView[] {
  const anchor = anchorMonth();
  const values = energie.history.map(PICK[domain]);
  const recorded = new Map<string, number>();
  values.forEach((v, i) => {
    const offset = values.length - 1 - i;
    const d = new Date(anchor.getFullYear(), anchor.getMonth() - offset, 1);
    recorded.set(`${d.getFullYear()}-${d.getMonth()}`, v);
  });

  const recent = values.slice(-3);
  const avg = recent.reduce((a, b) => a + b, 0) / Math.max(1, recent.length);
  const now = new Date();

  return Array.from({ length: 12 }, (_, rev) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (11 - rev), 1);
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    const has = recorded.has(key);
    return {
      label: MONTH_LABELS[d.getMonth()],
      year: d.getFullYear(),
      value: has ? recorded.get(key)! : Math.round(avg * SEASONAL[domain][d.getMonth()] * 10) / 10,
      projected: !has,
    };
  });
}

// The last recorded month against the three before it, with a ±5% dead-band —
// the same call the api makes.
function trendOf(series: EnergieHistoryPointView[]): { trend: TrendDirection; pct: number } {
  const recorded = series.filter((h) => h.value != null && !h.projected).map((h) => h.value!);
  if (recorded.length < 2) return { trend: "stable", pct: 0 };
  const last = recorded[recorded.length - 1];
  const prev = recorded.slice(-4, -1);
  const avg = prev.reduce((a, b) => a + b, 0) / prev.length;
  if (avg === 0) return { trend: "stable", pct: 0 };
  const pct = Math.round(((last - avg) / avg) * 100);
  return { trend: pct > 5 ? "up" : pct < -5 ? "down" : "stable", pct };
}

// The raw entries behind the history: one row per reading date, newest first.
// The mazout column is a tank LEVEL, so it is walked back from today's level
// through what each month burnt, and refills show up as a jump.
function buildReleves(): EnergieReleveView[] {
  const anchor = anchorMonth();
  const newestFirst = [...energie.history].reverse();
  let level = energie.oil.tankPct;

  return newestFirst.map((h, i) => {
    // The reading that recorded this month happened on the 1st of the next one.
    const d = new Date(anchor.getFullYear(), anchor.getMonth() - i + 1, 1);
    const row: EnergieReleveView = {
      date: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-01`,
      eau: h.eau,
      jour: h.jour,
      nuit: h.nuit,
      mazout: Math.round(level * 10) / 10,
      solar: h.solar,
    };
    level = Math.min(98, level + (h.mazout / OIL_CAPACITY) * 100);
    return row;
  });
}

/** The page is the template; this file only pretends to be a backend. */
function EnergiePage() {
  const history = useMemo(
    () => ({
      elec: buildHistory("elec"),
      eau: buildHistory("eau"),
      mazout: buildHistory("mazout"),
    }),
    [],
  );
  const [releves, setReleves] = useState<EnergieReleveView[]>(() => buildReleves());

  const elecTrend = trendOf(history.elec);
  const waterTrend = trendOf(history.eau);
  const lastRecorded = energie.history[energie.history.length - 1];

  // The correction lands in memory here; over in the cockpit the same call is an
  // upsert on (meter, date).
  const saveReleve = (date: string, values: EnergieReleveValues) =>
    setReleves((rs) => rs.map((r) => (r.date === date ? { ...r, ...values } : r)));

  return (
    <EnergieVueTemplate
      due={energie.monthlyDue}
      lastReadingDate={energie.lastReadingDate}
      saisieTo="/energie/saisie"
      electricity={{
        dailyKWh: energie.electricity.dailyKWh,
        monthKWh: energie.electricity.monthKWh,
        dayKWh: energie.electricity.dayTotal,
        nightKWh: energie.electricity.nightTotal,
        trend: elecTrend.trend,
        trendPct: elecTrend.pct,
      }}
      water={{
        dailyM3: energie.water.dailyM3,
        monthM3: lastRecorded.eau,
        trend: waterTrend.trend,
        trendPct: waterTrend.pct,
      }}
      oil={{
        tankPct: energie.oil.tankPct,
        tankLiters: energie.oil.tankLiters,
        tankCapacity: OIL_CAPACITY,
        lastMonthLiters: lastRecorded.mazout,
        autonomyDays: energie.oil.autonomyDays,
        alert: energie.oil.status === "alert",
      }}
      history={history}
      releves={releves}
      onSaveReleve={saveReleve}
    />
  );
}
