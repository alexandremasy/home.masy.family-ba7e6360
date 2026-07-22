import { Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import {
  Area,
  AreaChart,
  ComposedChart,
  CartesianGrid,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip as RTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";
import { PiggyBank, Pencil, Check, X } from "lucide-react";
import { CountUp } from "@/components/count-up";
import { Card } from "@/components/card";
import { DataState } from "@/components/data-state";
import { eur } from "@/lib/budget-data";
import { Eyebrow } from "@/components/eyebrow";
import { OverlayCloseLink } from "@/components/overlay-close-link";

/* ─────────────────────────────────────────────────────────────────────────────
   The reserve, as a page — a MODAL with its own route, on the same overlay
   system as the Maison room pages: blurred backdrop, max-w-5xl panel, a fixed
   centered close pill. The Vue stays mounted behind and the URL is shareable.

   Its props are its OWN shapes. The trajectory arrives as points already split
   into real and projected, because who decides where the frontier sits is the
   caller: a mock draws it, an api computes it. The page draws a solid line, a
   dashed one, and a floor.

   The envelope edit keeps its draft here — that is a form, not data — and hands
   the committed values back. Whether they are persisted, or kept in memory, or
   refused, is none of this page's business.
   ──────────────────────────────────────────────────────────────────────────── */

/** One point of the reserve trajectory. */
export interface ReservePointView {
  /** The x label, already worded. */
  m: string;
  /** Measured stock. `null` past the frontier. */
  reel: number | null;
  /** Projected stock. `null` before it — set on the last real point too, so the
      dashed line starts where the solid one ends instead of floating. */
  proj: number | null;
}

/** One savings envelope, with the monthly history behind its sparkline. */
export interface ReserveEnvelopeView {
  /** Opaque envelope identity, handed back on save. */
  key: string;
  label: string;
  /** What it holds now. */
  balance: number;
  /** What goes in every month. */
  contrib: number;
  /** The sparkline's stroke — a CSS colour, the caller's palette. */
  color?: string;
  /** One point per month. */
  history: { m: string; v: number }[];
  /** How the next point would be labelled, shown while editing. */
  nextPointLabel: string;
}

export interface ReserveTemplateProps {
  /** Where the overlay goes back to, and what the close pill closes onto. */
  backTo: string;
  /** The headline figure. */
  total: number;
  /** What all the envelopes take in every month, together. */
  contribTotal: number;
  /** The trajectory. Empty renders the unavailable state. */
  series: ReservePointView[];
  /** The healthy floor, drawn as a dashed reference line. */
  floor: number;
  /** Is the projected end under the floor — drives the verdict pill. */
  belowFloor: boolean;
  /** The line under the chart, when there is something to qualify. */
  chartNote?: string;
  /** The sentence under the title. */
  intro: string;
  envelopes: ReserveEnvelopeView[];
  /** A reconciliation was committed: a new balance point, and the monthly rate. */
  onSaveEnvelope: (key: string, values: { balance: number; contrib: number }) => void;
  /** The reserve is still on its way. */
  loading?: boolean;
  /** It could not be loaded. */
  error?: boolean;
  onRetry?: () => void;
}

function useYAxis(values: number[], step = 5000) {
  return useMemo(() => {
    const top = Math.max(step, Math.ceil(Math.max(...values, 0) / step) * step);
    return { yTop: top, yTicks: Array.from({ length: top / step + 1 }, (_, i) => i * step) };
  }, [values.join(",")]); // eslint-disable-line react-hooks/exhaustive-deps
}

export function ReserveTemplate({
  backTo,
  total,
  contribTotal,
  series,
  floor,
  belowFloor,
  chartNote,
  intro,
  envelopes,
  onSaveEnvelope,
  loading = false,
  error = false,
  onRetry,
}: ReserveTemplateProps) {
  const [editKey, setEditKey] = useState<string | null>(null);
  const [draftBal, setDraftBal] = useState("");
  const [draftContrib, setDraftContrib] = useState("");

  // Portal to <body>: the budget <main> is transformed (mode-enter animation), which would make a
  // `fixed` child anchor to main instead of the viewport — leaving the TopNav uncovered and the
  // close pill mis-placed. Rendering into body (like the Maison root-level overlay) fixes both.
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden"; // lock scroll, same as the room overlay
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  const axis = useYAxis([...series.flatMap((s) => [s.reel ?? 0, s.proj ?? 0]), floor], 5000);

  const startEdit = (env: ReserveEnvelopeView) => {
    setEditKey(env.key);
    setDraftBal(String(env.balance));
    setDraftContrib(String(env.contrib));
  };
  const commitEdit = (key: string) => {
    const balance = Number(draftBal.replace(",", "."));
    const contrib = Number(draftContrib.replace(",", "."));
    if (![balance, contrib].every((n) => Number.isFinite(n) && n >= 0)) {
      toast.error("Valeur invalide");
      return;
    }
    onSaveEnvelope(key, { balance: Math.round(balance), contrib: Math.round(contrib) });
    setEditKey(null);
  };

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-40 overflow-y-auto overflow-x-hidden overlay-enter [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      role="dialog"
      aria-modal="true"
    >
      <Link
        to={backTo}
        aria-label="Fermer"
        className="overlay-backdrop fixed inset-0 z-0 bg-foreground/30 backdrop-blur-md"
      />

      <div className="overlay-panel relative z-10 mx-0 mt-16 mb-8 w-screen max-w-none sm:mx-auto sm:mt-24 sm:w-full sm:max-w-5xl sm:px-6">
        <div className="relative overflow-clip border border-border/60 bg-background shadow-lift sm:rounded-3xl">
          <div className="px-5 py-7 sm:px-8 sm:py-10">
            <div className="space-y-6">
              {/* Same page-header as a room page */}
              <div className="page-header sticky top-0 z-20 -mx-5 -mt-7 px-5 pt-7 pb-4 sm:-mx-8 sm:-mt-10 sm:px-8 sm:pt-10">
                <div className="page-header__bg pointer-events-none absolute inset-0 bg-background/85 backdrop-blur-xl" />
                <div className="page-header__fade pointer-events-none absolute inset-x-0 top-full h-8 bg-gradient-to-b from-background to-transparent" />
                <div className="relative">
                  <Link
                    to={backTo}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    ← Vue d'ensemble
                  </Link>
                  <div className="mt-2 flex items-center gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-2xl bg-primary/12 text-primary">
                      <PiggyBank className="h-5 w-5 anim-float" />
                    </span>
                    <h1 className="text-3xl tracking-tight sm:text-4xl">Réserve</h1>
                    <div className="ml-auto text-right">
                      <p className="flex items-baseline justify-end gap-2 text-2xs uppercase tracking-eyebrow text-muted-foreground">
                        Total{" "}
                        <span className="tabular-nums normal-case tracking-normal">
                          + {eur(contribTotal)}/mois
                        </span>
                      </p>
                      <p className="mt-0.5 text-xl tabular-nums text-foreground">
                        {/* key on the total → re-count when it changes (CountUp only animates once per mount) */}
                        <CountUp key={total} to={total} />
                        <span className="ml-1 text-sm text-muted-foreground">€</span>
                      </p>
                    </div>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{intro}</p>
                </div>
              </div>

              {loading || error ? (
                <DataState
                  status={error ? "error" : "loading"}
                  label="la réserve"
                  onRetry={onRetry}
                />
              ) : (
                <>
                  <Card
                    variant="solid"
                    title="Évolution de la réserve"
                    trailing={
                      series.length > 0 ? (
                        <span
                          className={
                            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold " +
                            (belowFloor
                              ? "bg-destructive/15 text-destructive"
                              : "bg-success/15 text-success")
                          }
                        >
                          <span
                            className={
                              "h-1.5 w-1.5 rounded-full " +
                              (belowFloor ? "bg-destructive" : "bg-success")
                            }
                          />
                          {belowFloor ? "Sous le seuil" : "Au-dessus du seuil"}
                        </span>
                      ) : undefined
                    }
                  >
                    {series.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        Données de réserve indisponibles.
                      </p>
                    ) : (
                      <div className="h-56 w-full sm:h-72">
                        <ResponsiveContainer width="100%" height="100%">
                          <ComposedChart
                            data={series}
                            margin={{ top: 8, right: 8, left: -14, bottom: 0 }}
                          >
                            <CartesianGrid
                              stroke="var(--border)"
                              strokeDasharray="3 3"
                              vertical={false}
                            />
                            <XAxis
                              dataKey="m"
                              stroke="var(--muted-foreground)"
                              fontSize={10}
                              tickLine={false}
                              axisLine={false}
                              interval={1}
                            />
                            <YAxis
                              stroke="var(--muted-foreground)"
                              fontSize={10}
                              tickLine={false}
                              axisLine={false}
                              domain={[0, axis.yTop]}
                              ticks={axis.yTicks}
                              tickFormatter={(v) => `${Math.round(v / 1000)}k`}
                              width={42}
                            />
                            <RTooltip
                              contentStyle={{
                                background: "var(--popover)",
                                border: "1px solid var(--border)",
                                borderRadius: 12,
                                fontSize: 12,
                                color: "var(--popover-foreground)",
                              }}
                              formatter={(v: unknown, n) =>
                                typeof v === "number" ? [eur(v), n as string] : ["—", n as string]
                              }
                            />
                            <ReferenceLine
                              y={floor}
                              stroke="var(--destructive)"
                              strokeOpacity={0.55}
                              strokeDasharray="4 4"
                              label={{
                                value: `Seuil sain · ${eur(floor)}`,
                                position: "insideTopRight",
                                fontSize: 10,
                                fill: "var(--destructive)",
                              }}
                            />
                            <Area
                              type="monotone"
                              dataKey="reel"
                              stroke="var(--primary)"
                              strokeWidth={2.5}
                              fill="var(--primary)"
                              fillOpacity={0.1}
                              name="Réserve"
                              connectNulls={false}
                            />
                            <Line
                              type="monotone"
                              dataKey="proj"
                              stroke="var(--primary)"
                              strokeWidth={2}
                              strokeDasharray="5 4"
                              dot={false}
                              name="Projeté"
                              connectNulls={false}
                            />
                          </ComposedChart>
                        </ResponsiveContainer>
                      </div>
                    )}
                    {chartNote && (
                      <p className="mt-2 text-2xs text-muted-foreground">{chartNote}</p>
                    )}
                  </Card>

                  <Card
                    variant="solid"
                    title="Enveloppes"
                    trailing={
                      <span className="text-xs text-muted-foreground">
                        Ajustez à la main pour refléter la banque
                      </span>
                    }
                  >
                    {envelopes.length === 0 ? (
                      <p className="text-sm text-muted-foreground">
                        Aucune enveloppe d'épargne détectée sur la période.
                      </p>
                    ) : (
                      /* Cells of one card, divided by hairlines — same shape as Bernard's
                         "Trimestre en cours". A card inside a card is one box too many. */
                      <div className="grid divide-y divide-border/60 sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-4 [&>*]:py-4 sm:[&>*]:px-4 sm:[&>*:not(:first-child)]:border-l sm:[&>*:not(:first-child)]:border-border/60 sm:[&>*]:py-0 sm:[&>*:first-child]:pl-0 sm:[&>*:last-child]:pr-0">
                        {envelopes.map((env) => {
                          const stroke = env.color ?? "var(--primary)";
                          const editing = editKey === env.key;
                          return (
                            <div key={env.key} className="group relative">
                              <div className="flex items-start justify-between">
                                <Eyebrow size="xs">{env.label}</Eyebrow>
                                {!editing && (
                                  <button
                                    onClick={() => startEdit(env)}
                                    aria-label="Modifier l'enveloppe"
                                    className="opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100"
                                  >
                                    <Pencil className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                                  </button>
                                )}
                              </div>

                              {editing ? (
                                <div className="mt-2 space-y-2">
                                  <label className="block">
                                    <span className="mb-0.5 block text-2xs uppercase tracking-wide text-muted-foreground">
                                      Montant · nouveau point ({env.nextPointLabel})
                                    </span>
                                    <input
                                      autoFocus
                                      value={draftBal}
                                      onChange={(e) => setDraftBal(e.target.value)}
                                      onKeyDown={(e) => {
                                        if (e.key === "Enter") commitEdit(env.key);
                                        if (e.key === "Escape") setEditKey(null);
                                      }}
                                      inputMode="decimal"
                                      className="w-full rounded-md border border-border bg-background px-2 py-1 text-lg tabular-nums focus:border-primary focus:outline-none"
                                    />
                                  </label>
                                  <label className="block">
                                    <span className="mb-0.5 block text-2xs uppercase tracking-wide text-muted-foreground">
                                      Épargne / mois
                                    </span>
                                    <input
                                      value={draftContrib}
                                      onChange={(e) => setDraftContrib(e.target.value)}
                                      onKeyDown={(e) => {
                                        if (e.key === "Enter") commitEdit(env.key);
                                        if (e.key === "Escape") setEditKey(null);
                                      }}
                                      inputMode="decimal"
                                      className="w-full rounded-md border border-border bg-background px-2 py-1 text-sm tabular-nums focus:border-primary focus:outline-none"
                                    />
                                  </label>
                                  <div className="flex gap-1">
                                    <button
                                      onClick={() => commitEdit(env.key)}
                                      className="inline-flex flex-1 items-center justify-center gap-1 rounded-md bg-primary px-2 py-1 text-xs font-semibold text-primary-foreground hover:opacity-90"
                                    >
                                      <Check className="h-3.5 w-3.5" /> Enregistrer
                                    </button>
                                    <button
                                      onClick={() => setEditKey(null)}
                                      className="grid h-7 w-7 place-items-center rounded-md border border-border text-muted-foreground hover:bg-secondary"
                                    >
                                      <X className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <>
                                  <p className="mt-2 text-lg tabular-nums">
                                    <CountUp to={env.balance} />
                                    <span className="ml-1 text-xs text-muted-foreground">€</span>
                                  </p>
                                  <p className="mt-0.5 text-xs text-muted-foreground tabular-nums">
                                    + {eur(env.contrib)} / mois
                                  </p>
                                </>
                              )}

                              <div className="-mx-2 mt-3 h-10">
                                <ResponsiveContainer width="100%" height="100%">
                                  <AreaChart
                                    data={env.history}
                                    margin={{ top: 4, right: 4, left: 4, bottom: 0 }}
                                  >
                                    <defs>
                                      <linearGradient
                                        id={`sav-${env.key}`}
                                        x1="0"
                                        y1="0"
                                        x2="0"
                                        y2="1"
                                      >
                                        <stop offset="0%" stopColor={stroke} stopOpacity={0.35} />
                                        <stop offset="100%" stopColor={stroke} stopOpacity={0} />
                                      </linearGradient>
                                    </defs>
                                    <XAxis dataKey="m" hide />
                                    <RTooltip
                                      cursor={{ stroke: "var(--border)" }}
                                      contentStyle={{
                                        background: "var(--popover)",
                                        border: "1px solid var(--border)",
                                        borderRadius: 10,
                                        fontSize: 11,
                                        color: "var(--popover-foreground)",
                                        padding: "4px 8px",
                                      }}
                                      formatter={(val: unknown) => [
                                        typeof val === "number" ? eur(val) : "—",
                                        "",
                                      ]}
                                      labelFormatter={(l) => l as string}
                                    />
                                    <Area
                                      type="monotone"
                                      dataKey="v"
                                      stroke={stroke}
                                      strokeWidth={1.5}
                                      fill={`url(#sav-${env.key})`}
                                    />
                                  </AreaChart>
                                </ResponsiveContainer>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </Card>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <OverlayCloseLink to={backTo} />
    </div>,
    document.body,
  );
}
