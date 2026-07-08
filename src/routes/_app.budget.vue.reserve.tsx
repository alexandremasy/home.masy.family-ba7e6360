import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  Area, AreaChart, ComposedChart, CartesianGrid, Line, ReferenceLine,
  ResponsiveContainer, Tooltip as RTooltip, XAxis, YAxis,
} from "recharts";
import { toast } from "sonner";
import { PiggyBank, Pencil, Check, X } from "lucide-react";
import { CountUp } from "@/components/CountUp";
import { Section } from "@/components/Card";
import { envelopes, eur, savingsStockSeries, envelopeSeries, type BudgetView } from "@/lib/budget-data";

// A MODAL with its own route (nested under /budget/vue), rendered with the SAME overlay system as
// the Maison room pages: blurred backdrop + max-w-5xl panel + a fixed centered close pill, plus the
// in-panel "← Vue d'ensemble" back link. The Vue stays mounted behind; the URL is shareable.
export const Route = createFileRoute("/_app/budget/vue/reserve")({
  component: ReserveOverlay,
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

function ReserveOverlay() {
  const { view } = Route.useSearch();
  const savings = useMemo(() => savingsStockSeries(view), [view]);

  const [overrides, setOverrides] = useState<Record<string, number>>({});
  const [editKey, setEditKey] = useState<string | null>(null);
  const [draft, setDraft] = useState<string>("");

  // Portal to <body>: the budget <main> is transformed (mode-enter animation), which would make a
  // `fixed` child anchor to main instead of the viewport — leaving the TopNav uncovered and the
  // close pill mis-placed. Rendering into body (like the Maison root-level overlay) fixes both.
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden"; // lock scroll, same as the room overlay
    return () => { document.body.style.overflow = prev; };
  }, []);

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

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-40 overflow-y-auto overflow-x-hidden overlay-enter [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      role="dialog"
      aria-modal="true"
    >
      <Link to="/budget/vue" aria-label="Fermer" className="overlay-backdrop fixed inset-0 z-0 bg-foreground/30 backdrop-blur-md" />

      <div className="overlay-panel relative z-10 mx-0 mt-16 mb-8 w-screen max-w-none sm:mx-auto sm:mt-24 sm:w-full sm:max-w-5xl sm:px-6">
        <div className="relative overflow-clip border border-border/60 bg-background shadow-lift sm:rounded-3xl">
          <div className="px-5 py-7 sm:px-8 sm:py-10">
            <div className="space-y-6">
              {/* Same page-header as a room page */}
              <div className="page-header sticky top-0 z-20 -mx-5 -mt-7 px-5 pt-7 pb-4 sm:-mx-8 sm:-mt-10 sm:px-8 sm:pt-10">
                <div className="page-header__bg pointer-events-none absolute inset-0 bg-background/85 backdrop-blur-xl" />
                <div className="page-header__fade pointer-events-none absolute inset-x-0 top-full h-8 bg-gradient-to-b from-background to-transparent" />
                <div className="relative">
                  <Link to="/budget/vue" className="text-sm text-muted-foreground transition-colors hover:text-foreground">← Vue d'ensemble</Link>
                  <div className="mt-2 flex items-center gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-2xl bg-primary/12 text-primary">
                      <PiggyBank className="h-5 w-5 anim-float" />
                    </span>
                    <h1 className="font-serif text-3xl tracking-tight sm:text-4xl">Réserve</h1>
                    <div className="ml-auto text-right">
                      <p className="flex items-baseline justify-end gap-2 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                        Total <span className="tabular-nums normal-case tracking-normal">+ {eur(contribTotal)}/mois</span>
                      </p>
                      <p className="mt-0.5 font-serif text-2xl tabular-nums text-foreground">
                        <CountUp to={total} /><span className="ml-1 text-sm text-muted-foreground">€</span>
                      </p>
                    </div>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">
                    L'épargne accumulée dans le temps, et si elle reste au-dessus du seuil sain.
                  </p>
                </div>
              </div>

              <Section
                title="Évolution de la réserve"
                action={
                  <span className={"text-sm " + (belowFloor ? "text-destructive" : "text-success")}>
                    {belowFloor ? "sous le seuil sain" : "au-dessus du seuil"}
                  </span>
                }
              >
                <div className="h-56 w-full sm:h-72">
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
              </Section>

              <Section
                title="Enveloppes"
                action={<span className="text-xs text-muted-foreground">Ajustez à la main pour refléter la banque</span>}
              >
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
              </Section>
            </div>
          </div>
        </div>
      </div>

      {/* Close pill — same as the room overlay: fixed, centered at the top of the viewport */}
      <Link
        to="/budget/vue"
        aria-label="Fermer"
        className="fixed left-1/2 top-4 z-30 grid h-9 w-9 -translate-x-1/2 place-items-center rounded-full bg-secondary text-foreground/70 shadow-soft transition-colors hover:bg-secondary/80 hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:top-6"
      >
        <X className="h-4 w-4" />
      </Link>
    </div>,
    document.body,
  );
}
