import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  ReserveTemplate,
  type ReserveEnvelopeView,
  type ReservePointView,
} from "@/templates/budget-reserve";
import {
  envelopes,
  savingsStockSeries,
  envelopeHistory,
  MONTHS_FR,
  type BudgetView,
} from "@/lib/budget-data";

export const Route = createFileRoute("/_app/budget/vue/reserve")({
  component: ReserveOverlay,
  validateSearch: (s: Record<string, unknown>): { view: BudgetView } => ({
    view: typeof s.view === "number" ? s.view : "rolling",
  }),
});

const nextMonthFor = (h: { m: string; v: number }[]) =>
  MONTHS_FR[(MONTHS_FR.indexOf(h[h.length - 1].m) + 1) % 12];

/**
 * The page is the template; this file only pretends to be a backend.
 *
 * Editing an envelope records a new MONTHLY point, so the sparkline is captured
 * over time instead of being a fixed mock — the reconciliation gesture the
 * cockpit performs against the bank, felt here without a bank.
 */
function ReserveOverlay() {
  const { view } = Route.useSearch();
  const savings = useMemo(() => savingsStockSeries(view), [view]);

  const [histories, setHistories] = useState<Record<string, { m: string; v: number }[]>>(() =>
    Object.fromEntries(envelopes.map((e) => [e.key, envelopeHistory(e)])),
  );
  const [contribs, setContribs] = useState<Record<string, number>>(() =>
    Object.fromEntries(envelopes.map((e) => [e.key, e.contrib])),
  );

  const displayed = useMemo<ReserveEnvelopeView[]>(
    () =>
      envelopes.map((e) => {
        const history = histories[e.key];
        return {
          key: e.key,
          label: e.label,
          balance: history[history.length - 1].v,
          contrib: contribs[e.key],
          color: e.tone === "mustard" ? "var(--mustard)" : "var(--primary)",
          history,
          nextPointLabel: nextMonthFor(history),
        };
      }),
    [histories, contribs],
  );

  const series = useMemo<ReservePointView[]>(
    () => savings.series.map((p) => ({ m: p.m, reel: p.reel ?? null, proj: p.proj ?? null })),
    [savings],
  );

  return (
    <ReserveTemplate
      backTo="/budget/vue"
      total={displayed.reduce((s, e) => s + e.balance, 0)}
      contribTotal={displayed.reduce((s, e) => s + e.contrib, 0)}
      series={series}
      floor={savings.floor}
      belowFloor={(savings.projectedEnd ?? 0) < savings.floor}
      intro="L'épargne accumulée dans le temps, et si elle reste au-dessus du seuil sain."
      envelopes={displayed}
      onSaveEnvelope={(key, { balance, contrib }) => {
        setHistories((hs) => {
          const h = hs[key];
          return { ...hs, [key]: [...h, { m: nextMonthFor(h), v: balance }].slice(-12) };
        });
        setContribs((cs) => ({ ...cs, [key]: contrib }));
        toast.success("Point ajouté · taux mis à jour");
      }}
    />
  );
}
