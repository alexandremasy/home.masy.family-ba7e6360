import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Area, AreaChart, ComposedChart, CartesianGrid, Line, ReferenceLine,
  ResponsiveContainer, Tooltip as RTooltip, XAxis, YAxis,
} from "recharts";
import { toast } from "sonner";
import { Pencil, Check, X } from "lucide-react";
import { CountUp } from "@/components/CountUp";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { envelopes, eur, savingsStockSeries, envelopeSeries, type BudgetView } from "@/lib/budget-data";

// A MODAL with its own route (nested under /budget/vue): the Vue d'ensemble stays mounted behind,
// the reserve detail opens as an overlay, and the URL is shareable / back-button closes it.
export const Route = createFileRoute("/_app/budget/vue/reserve")({
  component: ReserveModal,
  validateSearch: (s: Record<string, unknown>): { view: BudgetView } => ({
    view: typeof s.view === "number" ? s.view : "rolling",
  }),
});

function useYAxis(values: number[], step = 5000) {
  return useMemo(() => {
    const top = Math.max(step, Math.ceil(Math.max(...values, 0) / step) * step);
    return { yTop: top, yTicks: Array.from({ length: top / step + 1 }, (_, i) => i * step) };
  }, [values.join(",")]); // eslint-disable-line react-hooks/exhaustive-deps
}

function ReserveModal() {
  const { view } = Route.useSearch();
  const navigate = useNavigate();
  const savings = useMemo(() => savingsStockSeries(view), [view]);

  const [overrides, setOverrides] = useState<Record<string, number>>({});
  const [editKey, setEditKey] = useState<string | null>(null);
  const [draft, setDraft] = useState<string>("");

  const displayed = envelopes.map((e) => ({ ...e, balance: overrides[e.key] ?? e.balance }));
  const total = displayed.reduce((s, e) => s + e.balance, 0);
  const contribTotal = displayed.reduce((s, e) => s + e.contrib, 0);
  const savAxis = useYAxis([...savings.series.flatMap((s) => [s.reel ?? 0, s.proj ?? 0]), savings.floor], 5000);
  const belowFloor = (savings.projectedEnd ?? 0) < savings.floor;

  const startEdit = (key: string, current: number) => { setEditKey(key); setDraft(String(current)); };
  const commitEdit = (key: string) => {
    const v = Number(draft.replace(",", "."));
    if (!Number.isFinite(v) || v < 0) { toast.error("Montant invalide"); return; }
    setOverrides((o) => ({ ...o, [key]: Math.round(v) }));
    setEditKey(null);
    toast.success("Épargne mise à jour");
  };

  return (
    <Dialog open onOpenChange={(o) => { if (!o) navigate({ to: "/budget/vue" }); }}>
      <DialogContent className="max-h-[88vh] overflow-y-auto sm:max-w-3xl duration-300 data-[state=open]:slide-in-from-top-4 data-[state=closed]:slide-out-to-top-2 data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95">
        <DialogHeader>
          <DialogTitle className="font-serif text-2xl">Réserve</DialogTitle>
        </DialogHeader>

        <div className="flex flex-wrap items-end justify-between gap-3">
          <p className="max-w-sm text-sm text-muted-foreground">
            L'épargne accumulée dans le temps, et si elle reste au-dessus du seuil sain.
          </p>
          <div className="text-right">
            <p className="flex items-baseline justify-end gap-2 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              Total <span className="tabular-nums normal-case tracking-normal">+ {eur(contribTotal)}/mois</span>
            </p>
            <p className="mt-0.5 font-serif text-2xl tabular-nums text-foreground">
              <CountUp to={total} /><span className="ml-1 text-sm text-muted-foreground">€</span>
            </p>
          </div>
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between gap-2 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            <span>Évolution de la réserve</span>
            <span className={belowFloor ? "text-destructive" : "text-success"}>
              {belowFloor ? "sous le seuil sain" : "au-dessus du seuil"}
            </span>
          </div>
          <div className="h-52 w-full sm:h-60">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={savings.series} margin={{ top: 8, right: 8, left: -14, bottom: 0 }}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="m" stroke="var(--muted-foreground)" fontSize={10} tickLine={false} axisLine={false} interval={1} />
                <YAxis stroke="var(--muted-foreground)" fontSize={10} tickLine={false} axisLine={false}
                  domain={[0, savAxis.yTop]} ticks={savAxis.yTicks} tickFormatter={(v) => `${Math.round(v / 1000)}k`} width={42} />
                <RTooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12, color: "var(--popover-foreground)" }}
                  formatter={(v: unknown, n) => (typeof v === "number" ? [eur(v), n as string] : ["—", n as string])} />
                <ReferenceLine y={savings.floor} stroke="var(--destructive)" strokeOpacity={0.55} strokeDasharray="4 4"
                  label={{ value: `Seuil sain · ${eur(savings.floor)}`, position: "insideTopRight", fontSize: 10, fill: "var(--destructive)" }} />
                <Area type="monotone" dataKey="reel" stroke="var(--primary)" strokeWidth={2.5} fill="var(--primary)" fillOpacity={0.1} name="Réserve" connectNulls={false} />
                <Line type="monotone" dataKey="proj" stroke="var(--primary)" strokeWidth={2} strokeDasharray="5 4" dot={false} name="Projeté" connectNulls={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div>
          <p className="mb-3 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Enveloppes · ajustez à la main pour refléter la banque</p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {displayed.map((env) => {
              const data = envelopeSeries(env);
              const stroke = env.tone === "warm" ? "var(--warm)" : env.tone === "accent" ? "var(--accent)" : "var(--primary)";
              const editing = editKey === env.key;
              return (
                <div key={env.key} className="group relative rounded-xl border border-border/50 bg-card/60 p-4 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-lift">
                  <div className="flex items-start justify-between">
                    <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">{env.label}</p>
                    {!editing && (
                      <button onClick={() => startEdit(env.key, env.balance)} aria-label="Ajuster le solde"
                        className="opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100">
                        <Pencil className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                      </button>
                    )}
                  </div>
                  {editing ? (
                    <div className="mt-2 flex items-center gap-1">
                      <input autoFocus value={draft} onChange={(e) => setDraft(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") commitEdit(env.key); if (e.key === "Escape") setEditKey(null); }}
                        inputMode="decimal"
                        className="min-w-0 flex-1 rounded-md border border-border bg-background px-2 py-1 font-serif text-lg tabular-nums focus:border-primary focus:outline-none" />
                      <button onClick={() => commitEdit(env.key)} className="grid h-7 w-7 place-items-center rounded-md bg-primary text-primary-foreground hover:opacity-90">
                        <Check className="h-3.5 w-3.5" />
                      </button>
                      <button onClick={() => setEditKey(null)} className="grid h-7 w-7 place-items-center rounded-md border border-border text-muted-foreground hover:bg-secondary">
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <p className="mt-2 font-serif text-xl tabular-nums">
                      <CountUp to={env.balance} /><span className="ml-1 text-xs text-muted-foreground">€</span>
                    </p>
                  )}
                  <p className="mt-0.5 text-[11px] text-muted-foreground tabular-nums">+ {eur(env.contrib)} / mois</p>
                  <div className="-mx-2 mt-3 h-10">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={data} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
                        <defs>
                          <linearGradient id={`sav-${env.key}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={stroke} stopOpacity={0.35} />
                            <stop offset="100%" stopColor={stroke} stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <Area type="monotone" dataKey="v" stroke={stroke} strokeWidth={1.5} fill={`url(#sav-${env.key})`} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
