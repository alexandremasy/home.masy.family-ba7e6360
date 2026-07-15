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
import { envelopes, eur, savingsStockSeries, envelopeHistory, MONTHS_FR, type BudgetView } from "@/lib/budget-data";
import { Eyebrow } from "@/components/Eyebrow";
import { OverlayCloseLink } from "@/components/OverlayCloseLink";

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

  // Two data per envelope: (1) the amount + its MONTHLY history (1 point = 1 month) — editing
  // records a new monthly point (a reconciliation) so the sparkline is captured over time, not a
  // fixed mock; (2) the monthly savings rate (contribution), edited in place.
  const [histories, setHistories] = useState<Record<string, { m: string; v: number }[]>>(
    () => Object.fromEntries(envelopes.map((e) => [e.key, envelopeHistory(e)])),
  );
  const [contribs, setContribs] = useState<Record<string, number>>(
    () => Object.fromEntries(envelopes.map((e) => [e.key, e.contrib])),
  );
  const [editKey, setEditKey] = useState<string | null>(null);
  const [draftBal, setDraftBal] = useState<string>("");
  const [draftContrib, setDraftContrib] = useState<string>("");

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

  const displayed = envelopes.map((e) => {
    const history = histories[e.key];
    return { ...e, history, balance: history[history.length - 1].v, contrib: contribs[e.key] };
  });
  const total = displayed.reduce((s, e) => s + e.balance, 0);
  const contribTotal = displayed.reduce((s, e) => s + e.contrib, 0);
  const savAxis = useYAxis([...savings.series.flatMap((s) => [s.reel ?? 0, s.proj ?? 0]), savings.floor], 5000);
  const belowFloor = (savings.projectedEnd ?? 0) < savings.floor;

  const nextMonthFor = (h: { m: string; v: number }[]) => MONTHS_FR[(MONTHS_FR.indexOf(h[h.length - 1].m) + 1) % 12];
  const startEdit = (key: string, bal: number, contrib: number) => {
    setEditKey(key); setDraftBal(String(bal)); setDraftContrib(String(contrib));
  };
  const commitEdit = (key: string) => {
    const bal = Number(draftBal.replace(",", "."));
    const contrib = Number(draftContrib.replace(",", "."));
    if (![bal, contrib].every((n) => Number.isFinite(n) && n >= 0)) { toast.error("Valeur invalide"); return; }
    setHistories((hs) => {
      const h = hs[key];
      return { ...hs, [key]: [...h, { m: nextMonthFor(h), v: Math.round(bal) }].slice(-12) };
    });
    setContribs((cs) => ({ ...cs, [key]: Math.round(contrib) }));
    setEditKey(null);
    toast.success("Point ajouté · taux mis à jour");
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
                      <p className="flex items-baseline justify-end gap-2 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                        Total <span className="tabular-nums normal-case tracking-normal">+ {eur(contribTotal)}/mois</span>
                      </p>
                      <p className="mt-0.5 font-serif text-2xl tabular-nums text-foreground">
                        {/* key on total → re-count when an envelope edit changes it (CountUp only animates once per mount) */}
                        <CountUp key={total} to={total} /><span className="ml-1 text-sm text-muted-foreground">€</span>
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
                  <span className={"inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium " + (belowFloor ? "bg-destructive/15 text-destructive" : "bg-success/15 text-success")}>
                    <span className={"h-1.5 w-1.5 rounded-full " + (belowFloor ? "bg-destructive" : "bg-success")} />
                    {belowFloor ? "Sous le seuil" : "Au-dessus du seuil"}
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
                    const stroke = env.tone === "mustard" ? "var(--mustard)" : "var(--primary)";
                    const editing = editKey === env.key;
                    const nextM = nextMonthFor(env.history);
                    return (
                      <div key={env.key} className="group relative rounded-xl border border-border/50 bg-card/60 p-4 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-lift">
                        <div className="flex items-start justify-between">
                          <Eyebrow size="xs">{env.label}</Eyebrow>
                          {!editing && (
                            <button onClick={() => startEdit(env.key, env.balance, env.contrib)} aria-label="Modifier l'enveloppe"
                              className="opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100">
                              <Pencil className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                            </button>
                          )}
                        </div>

                        {editing ? (
                          <div className="mt-2 space-y-2">
                            <label className="block">
                              <span className="mb-0.5 block text-[9px] uppercase tracking-wide text-muted-foreground">Montant · nouveau point ({nextM})</span>
                              <input autoFocus value={draftBal} onChange={(e) => setDraftBal(e.target.value)}
                                onKeyDown={(e) => { if (e.key === "Enter") commitEdit(env.key); if (e.key === "Escape") setEditKey(null); }}
                                inputMode="decimal"
                                className="w-full rounded-md border border-border bg-background px-2 py-1 font-serif text-lg tabular-nums focus:border-primary focus:outline-none" />
                            </label>
                            <label className="block">
                              <span className="mb-0.5 block text-[9px] uppercase tracking-wide text-muted-foreground">Épargne / mois</span>
                              <input value={draftContrib} onChange={(e) => setDraftContrib(e.target.value)}
                                onKeyDown={(e) => { if (e.key === "Enter") commitEdit(env.key); if (e.key === "Escape") setEditKey(null); }}
                                inputMode="decimal"
                                className="w-full rounded-md border border-border bg-background px-2 py-1 text-sm tabular-nums focus:border-primary focus:outline-none" />
                            </label>
                            <div className="flex gap-1">
                              <button onClick={() => commitEdit(env.key)} className="inline-flex flex-1 items-center justify-center gap-1 rounded-md bg-primary px-2 py-1 text-xs font-medium text-primary-foreground hover:opacity-90">
                                <Check className="h-3.5 w-3.5" /> Enregistrer
                              </button>
                              <button onClick={() => setEditKey(null)} className="grid h-7 w-7 place-items-center rounded-md border border-border text-muted-foreground hover:bg-secondary">
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <p className="mt-2 font-serif text-xl tabular-nums">
                              <CountUp to={env.balance} /><span className="ml-1 text-xs text-muted-foreground">€</span>
                            </p>
                            <p className="mt-0.5 text-[11px] text-muted-foreground tabular-nums">+ {eur(env.contrib)} / mois</p>
                          </>
                        )}

                        <div className="-mx-2 mt-3 h-10">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={env.history} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
                              <defs>
                                <linearGradient id={`sav-${env.key}`} x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="0%" stopColor={stroke} stopOpacity={0.35} />
                                  <stop offset="100%" stopColor={stroke} stopOpacity={0} />
                                </linearGradient>
                              </defs>
                              <XAxis dataKey="m" hide />
                              <RTooltip cursor={{ stroke: "var(--border)" }}
                                contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 10, fontSize: 11, color: "var(--popover-foreground)", padding: "4px 8px" }}
                                formatter={(val: unknown) => [typeof val === "number" ? eur(val) : "—", ""]}
                                labelFormatter={(l) => l as string} />
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

      <OverlayCloseLink to="/budget/vue" />
    </div>,
    document.body,
  );
}
