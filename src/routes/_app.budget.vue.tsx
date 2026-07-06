import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Area, AreaChart, CartesianGrid, Line, LineChart, ReferenceArea, ReferenceLine,
  ResponsiveContainer, Tooltip as RTooltip, XAxis, YAxis,
} from "recharts";
import { toast } from "sonner";
import {
  ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, PiggyBank, Sparkles,
  TrendingUp, TrendingDown, Clock, CheckCircle2, CalendarClock, AlertTriangle,
  ShieldCheck, ShieldAlert, Pencil, Check, X,
} from "lucide-react";
import { CountUp } from "@/components/CountUp";
import {
  categories, envelopes, postesSeed, MONTHS_FR, MONTHS_FR_LONG, eur,
  temporalState, currentMonthIdx, currentYear, incomeSources,
  annualisationProvision, annualVerdict, cumulativeSeries, upcomingBigBills,
  envelopeSeries, categoryTrend, nextBillForCategory, nonMonthlyBills,
  type TemporalState, type UpcomingBill,
} from "@/lib/budget-data";

export const Route = createFileRoute("/_app/budget/vue")({
  component: VuePage,
  head: () => ({
    meta: [
      { title: "Vue d'ensemble — Budget" },
      { name: "description", content: "Trajectoire de l'année, échéances à venir et épargne — d'un coup d'œil." },
    ],
  }),
});

function VuePage() {
  const [year, setYear] = useState(currentYear);
  const [zoomMonth, setZoomMonth] = useState<number | null>(null);

  return (
    <div className="space-y-6 anim-slide-up sm:space-y-8">
      <header className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-3 sm:flex sm:flex-wrap sm:justify-between sm:gap-4">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          {zoomMonth !== null && (
            <button
              onClick={() => setZoomMonth(null)}
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-border/60 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              aria-label="Retour à l'année"
            ><ArrowLeft className="h-4 w-4" /></button>
          )}
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
              Budget · {zoomMonth === null ? "Vue d'ensemble" : "Mois"}
            </p>
            <h1 className="mt-1 truncate font-serif text-2xl tracking-tight sm:text-4xl">
              {zoomMonth === null
                ? `Année ${year}`
                : <>
                    <button onClick={() => setZoomMonth(null)} className="text-muted-foreground hover:text-foreground transition-colors">{year}</button>
                    <span className="mx-2 text-muted-foreground/50">/</span>
                    <span className="capitalize">{MONTHS_FR_LONG[zoomMonth]}</span>
                  </>}
            </h1>
          </div>
        </div>
        {zoomMonth === null && (
          <div className="flex shrink-0 items-center gap-2">
            <button onClick={() => setYear(y => y - 1)}
              className="grid h-9 w-9 place-items-center rounded-full border border-border/60 text-muted-foreground hover:bg-secondary hover:text-foreground"
            ><ChevronLeft className="h-4 w-4" /></button>
            <button onClick={() => setYear(y => Math.min(currentYear + 1, y + 1))}
              disabled={year >= currentYear + 1}
              className="grid h-9 w-9 place-items-center rounded-full border border-border/60 text-muted-foreground hover:bg-secondary hover:text-foreground disabled:opacity-30"
            ><ChevronRight className="h-4 w-4" /></button>
          </div>
        )}
      </header>

      <div className="relative">
        <div className={(zoomMonth === null ? "opacity-100" : "pointer-events-none hidden") + " transition-opacity duration-300"}>
          <YearView year={year} onPickMonth={setZoomMonth} />
        </div>
        <div className={(zoomMonth !== null ? "opacity-100 block" : "hidden") + " transition-opacity duration-300"}>
          {zoomMonth !== null && (
            <MonthView
              key={zoomMonth}
              year={year}
              monthIdx={zoomMonth}
              onPrev={() => setZoomMonth((m) => (m! > 0 ? m! - 1 : m))}
              onNext={() => setZoomMonth((m) => (m! < 11 ? m! + 1 : m))}
            />
          )}
        </div>
      </div>
    </div>
  );
}

/* ============================ YEAR VIEW ============================ */

function YearView({ year, onPickMonth }: { year: number; onPickMonth: (i: number) => void }) {
  const isCurrentYear = year === currentYear;
  const verdict = useMemo(() => annualVerdict(), []);
  const series = useMemo(() => cumulativeSeries(), []);
  const upcoming = useMemo(() => upcomingBigBills(5), []);
  const provision = annualisationProvision(postesSeed);

  return (
    <div className="space-y-6 sm:space-y-8">
      <VerdictBanner verdict={verdict} />
      <ContinuousYearChart series={series} isCurrentYear={isCurrentYear} onPickMonth={onPickMonth} year={year} />
      <UpcomingBillsBlock bills={upcoming} provision={provision} />
      <SavingsBlock />
      <CategoriesGrid />
    </div>
  );
}

/* ---- 1. Verdict banner (R1) ---- */

function VerdictBanner({ verdict }: { verdict: ReturnType<typeof annualVerdict> }) {
  const { status, label, hint, budgetYear, realisedYTD, projectedRest, projectedTotal,
          deltaEur, deltaPct, expectedByNow, netProjected, savingsRate } = verdict;
  const tone = status === "ok"
    ? { ring: "ring-success/30", bg: "bg-success/10", fg: "text-success", Icon: ShieldCheck, bar: "bg-success" }
    : status === "warn"
    ? { ring: "ring-warm/40", bg: "bg-warm/15", fg: "text-warm", Icon: AlertTriangle, bar: "bg-warm" }
    : { ring: "ring-destructive/40", bg: "bg-destructive/10", fg: "text-destructive", Icon: ShieldAlert, bar: "bg-destructive" };

  const realisedPct = Math.min(100, (realisedYTD / budgetYear) * 100);
  const projectedPct = Math.min(100, (projectedTotal / budgetYear) * 100);
  const expectedPct = Math.min(100, (expectedByNow / budgetYear) * 100);

  return (
    <section className={"relative overflow-hidden rounded-2xl border border-border/60 bg-card p-5 shadow-soft sm:p-7 ring-1 " + tone.ring}>
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:gap-8">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <span className={"grid h-10 w-10 shrink-0 place-items-center rounded-full " + tone.bg + " " + tone.fg}>
              <tone.Icon className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Trajectoire annuelle</p>
              <h2 className={"mt-0.5 font-serif text-2xl tracking-tight sm:text-3xl " + tone.fg}>{label}</h2>
            </div>
          </div>
          <p className="mt-3 max-w-prose text-sm text-muted-foreground">{hint}</p>

          {/* Gauge */}
          <div className="mt-5">
            <div className="relative h-3 w-full overflow-hidden rounded-full bg-secondary">
              {/* projected extension (soft) */}
              <div className={"absolute inset-y-0 left-0 rounded-full opacity-40 transition-[width] duration-700 " + tone.bar}
                   style={{ width: `${projectedPct}%` }} />
              {/* realised (solid) */}
              <div className="absolute inset-y-0 left-0 rounded-full bg-foreground/80 transition-[width] duration-700"
                   style={{ width: `${realisedPct}%` }} />
              {/* expected-by-now marker */}
              <div className="absolute inset-y-[-4px] w-0.5 bg-foreground" style={{ left: `${expectedPct}%` }} />
            </div>
            <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-[11px] text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-sm bg-foreground/80" /> Réalisé <span className="tabular-nums text-foreground">{eur(realisedYTD)}</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className={"h-2 w-2 rounded-sm opacity-40 " + tone.bar} /> + projeté <span className="tabular-nums text-foreground">{eur(projectedRest)}</span>
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-3 border-l-2 border-foreground" /> Attendu à ce jour
              </span>
              <span className="tabular-nums">Budget {eur(budgetYear)}</span>
            </div>
          </div>
        </div>

        {/* Right rail */}
        <div className="grid grid-cols-3 gap-3 lg:grid-cols-1 lg:gap-2 lg:border-l lg:border-border/40 lg:pl-8">
          <MicroStat label="Écart" primary={(deltaEur >= 0 ? "+" : "") + eur(deltaEur)}
                     secondary={(deltaPct >= 0 ? "+" : "") + deltaPct.toFixed(1) + " %"}
                     tone={status === "ok" ? "success" : status === "warn" ? "warm" : "destructive"} />
          <MicroStat label="Net projeté" primary={eur(netProjected)} tone={netProjected >= 0 ? "success" : "warm"} />
          <MicroStat label="Épargne" primary={savingsRate + " %"} tone="primary" />
        </div>
      </div>
    </section>
  );
}

function MicroStat({ label, primary, secondary, tone }: {
  label: string; primary: string; secondary?: string;
  tone: "primary" | "warm" | "success" | "destructive";
}) {
  const cls = tone === "warm" ? "text-warm"
    : tone === "success" ? "text-success"
    : tone === "destructive" ? "text-destructive"
    : "text-foreground";
  return (
    <div className="rounded-xl bg-secondary/40 p-2.5 lg:bg-transparent lg:p-0">
      <p className="text-[9px] uppercase tracking-[0.16em] text-muted-foreground sm:text-[10px]">{label}</p>
      <p className={"mt-1 font-serif text-lg leading-none tabular-nums sm:text-xl " + cls}>{primary}</p>
      {secondary && <p className="mt-1 text-[10px] tabular-nums text-muted-foreground">{secondary}</p>}
    </div>
  );
}

/* ---- 2. Continuous year chart (R2) ---- */

function ContinuousYearChart({ series, isCurrentYear, onPickMonth, year }: {
  series: ReturnType<typeof cumulativeSeries>;
  isCurrentYear: boolean;
  onPickMonth: (i: number) => void;
  year: number;
}) {
  return (
    <section className="rounded-2xl border border-border/60 bg-card p-4 shadow-soft sm:p-7 anim-slide-up">
      <header className="mb-4 flex flex-wrap items-end justify-between gap-3 sm:mb-5">
        <div className="min-w-0">
          <h2 className="font-serif text-xl tracking-tight sm:text-2xl">L'année en continu</h2>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            Dépenses cumulées vs budget — la marche de l'année, sans rupture.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
          <span className="inline-flex items-center gap-1.5"><span className="h-0.5 w-3 bg-foreground" /> Réalisé</span>
          <span className="inline-flex items-center gap-1.5"><span className="h-0.5 w-3 border-t border-dashed border-warm" /> Projeté</span>
          <span className="inline-flex items-center gap-1.5"><span className="h-0.5 w-3 bg-muted-foreground/50" /> Budget</span>
        </div>
      </header>

      <div className="h-56 w-full sm:h-72">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={series} margin={{ top: 8, right: 8, left: -14, bottom: 0 }}>
            <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="m" stroke="var(--muted-foreground)" fontSize={10} tickLine={false} axisLine={false} interval={0} />
            <YAxis stroke="var(--muted-foreground)" fontSize={10} tickLine={false} axisLine={false}
              tickFormatter={(v) => `${Math.round(v / 1000)}k`} width={36} />
            <RTooltip
              contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12, color: "var(--popover-foreground)" }}
              formatter={(v: number | null, n) => v == null ? ["—", n] : [eur(v), n]}
            />
            {/* Tolerance band around budget */}
            <ReferenceArea y1={0} y2={0} fill="transparent" />
            <Line type="monotone" dataKey="tolMax" stroke="var(--muted-foreground)" strokeOpacity={0.15} strokeWidth={1} dot={false} name="Tolérance +5%" />
            <Line type="monotone" dataKey="tolMin" stroke="var(--muted-foreground)" strokeOpacity={0.15} strokeWidth={1} dot={false} name="Tolérance -5%" />
            <Line type="monotone" dataKey="budget" stroke="var(--muted-foreground)" strokeWidth={1.5} strokeDasharray="4 4" dot={false} name="Budget cumulé" />
            <Line type="monotone" dataKey="reel" stroke="var(--foreground)" strokeWidth={2.5} dot={false} name="Réalisé cumulé" connectNulls={false} />
            <Line type="monotone" dataKey="projete" stroke="var(--warm)" strokeWidth={2} strokeDasharray="5 4" dot={false} name="Projeté cumulé" connectNulls={false} />
            {isCurrentYear && (
              <ReferenceLine x={MONTHS_FR[currentMonthIdx]} stroke="var(--foreground)" strokeOpacity={0.35} strokeDasharray="2 4" />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Mini month strip */}
      <div className="mt-4 border-t border-border/40 pt-4">
        <div className="mb-2 flex items-center justify-between text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          <span>Zoom mois</span>
          <span className="hidden sm:inline">Cliquez un mois pour l'ouvrir</span>
        </div>
        <div className="-mx-1 flex gap-1 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {MONTHS_FR.map((m, idx) => {
            const st = temporalState(idx, year);
            const isCur = year === currentYear && idx === currentMonthIdx;
            return (
              <button key={m} onClick={() => onPickMonth(idx)}
                className={"group min-w-[56px] flex-1 rounded-lg border px-2 py-1.5 text-[11px] transition-all hover:-translate-y-0.5 hover:shadow-lift " +
                  (isCur ? "border-foreground/60 bg-primary/5 " : "border-border/40 bg-card ") +
                  (st === "futur" ? "opacity-70" : "")}>
                <span className="block text-muted-foreground">{m}</span>
                <span className={"mx-auto mt-1 block h-1 w-1 rounded-full " +
                  (st === "passe" ? "bg-foreground/40" : st === "en-cours" ? "bg-primary" : "bg-muted-foreground/30")} />
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ---- 3. Upcoming bills + coverage (R3 + R4) ---- */

function UpcomingBillsBlock({ bills, provision }: { bills: UpcomingBill[]; provision: number }) {
  const total6m = bills.filter(b => b.monthsAway < 6).reduce((s, b) => s + b.amount, 0);
  const provisionIn6m = provision * 6;

  return (
    <section className="rounded-2xl border border-border/60 bg-card p-4 shadow-soft sm:p-7 anim-slide-up">
      <header className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <h2 className="font-serif text-xl tracking-tight sm:text-2xl">Grosses échéances à venir</h2>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            Ce qui arrive, et si c'est couvert par la provision d'annualisation.
          </p>
        </div>
        <Link to="/budget/planification" className="text-xs text-primary underline-offset-4 hover:underline">
          Modifier la planification →
        </Link>
      </header>

      <div className="-mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="flex gap-3 overflow-x-auto pb-2 [scrollbar-width:thin] sm:grid sm:grid-cols-2 sm:overflow-visible lg:grid-cols-5">
          {bills.map(b => <BillCard key={b.id} bill={b} />)}
        </div>
      </div>

      <div className="mt-6 grid gap-4 border-t border-border/40 pt-5 sm:grid-cols-3">
        <FootStat label="À venir · 6 mois" value={eur(total6m)} tone="warm" />
        <FootStat label="Provision cumulée" value={eur(provisionIn6m)} sub={`${eur(provision)}/mois`} tone="primary" />
        <FootStat label="Marge" value={eur(provisionIn6m - total6m)}
          tone={provisionIn6m - total6m >= 0 ? "success" : "destructive"} />
      </div>
    </section>
  );
}

function BillCard({ bill }: { bill: UpcomingBill }) {
  const cat = categories.find(c => c.key === bill.category)!;
  const Icon = cat.icon;
  const cov = bill.coverage === "covered"
    ? { label: "Couverte", cls: "bg-success/15 text-success", bar: "bg-success" }
    : bill.coverage === "partial"
    ? { label: "Partielle", cls: "bg-warm/15 text-warm", bar: "bg-warm" }
    : { label: "À combler", cls: "bg-destructive/10 text-destructive", bar: "bg-destructive" };
  const when = bill.monthsAway === 0 ? "Ce mois" : bill.monthsAway === 1 ? "Le mois prochain" : `Dans ${bill.monthsAway} mois`;

  return (
    <article className="w-[240px] shrink-0 rounded-xl border border-border/50 bg-card/60 p-3 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-lift sm:w-auto">
      <div className="flex items-center justify-between gap-2">
        <span className="grid h-8 w-8 place-items-center rounded-full bg-secondary text-foreground/70">
          <Icon className="h-4 w-4" />
        </span>
        <span className={"inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide " + cov.cls}>
          {cov.label}
        </span>
      </div>
      <p className="mt-3 truncate text-sm font-medium">{bill.label}</p>
      <p className="mt-0.5 text-[11px] text-muted-foreground">
        <span className="capitalize">{bill.monthLabel}</span> · {when}
      </p>
      <p className="mt-2 font-serif text-xl tabular-nums text-warm">−{eur(bill.amount)}</p>
      <div className="mt-2">
        <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-secondary">
          <div className={"absolute inset-y-0 left-0 rounded-full transition-[width] duration-700 " + cov.bar}
               style={{ width: `${bill.coveragePct}%` }} />
        </div>
        <p className="mt-1 text-[10px] tabular-nums text-muted-foreground">
          Provision {eur(bill.provisionAvailable)} · {bill.coveragePct}%
        </p>
      </div>
    </article>
  );
}

function FootStat({ label, value, sub, tone }: { label: string; value: string; sub?: string; tone: "primary"|"warm"|"success"|"destructive" }) {
  const cls = tone === "warm" ? "text-warm"
    : tone === "success" ? "text-success"
    : tone === "destructive" ? "text-destructive"
    : "text-foreground";
  return (
    <div>
      <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">{label}</p>
      <p className={"mt-1 font-serif text-2xl tabular-nums " + cls}>{value}</p>
      {sub && <p className="mt-0.5 text-[11px] text-muted-foreground">{sub}</p>}
    </div>
  );
}

/* ---- 4. Savings — transparent + editable (R5 + R6) ---- */

function SavingsBlock() {
  const [overrides, setOverrides] = useState<Record<string, number>>({});
  const [editKey, setEditKey] = useState<string | null>(null);
  const [draft, setDraft] = useState<string>("");

  const displayed = envelopes.map(e => ({ ...e, balance: overrides[e.key] ?? e.balance }));
  const total = displayed.reduce((s, e) => s + e.balance, 0);
  const contribTotal = displayed.reduce((s, e) => s + e.contrib, 0);

  const startEdit = (key: string, current: number) => {
    setEditKey(key);
    setDraft(String(current));
  };
  const commitEdit = (key: string) => {
    const v = Number(draft.replace(",", "."));
    if (!Number.isFinite(v) || v < 0) {
      toast.error("Montant invalide");
      return;
    }
    setOverrides(o => ({ ...o, [key]: Math.round(v) }));
    setEditKey(null);
    toast.success("Épargne mise à jour");
  };

  return (
    <section className="rounded-2xl border border-border/60 bg-card p-4 shadow-soft sm:p-7 anim-slide-up">
      <header className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <h2 className="font-serif text-xl tracking-tight sm:text-2xl">Épargne</h2>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
            État réel des enveloppes — ajustez à la main pour refléter la banque.
          </p>
        </div>
        <div className="flex items-baseline gap-3 text-right">
          <div>
            <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Total</p>
            <p className="mt-0.5 font-serif text-2xl tabular-nums text-foreground">
              <CountUp to={total} /><span className="ml-1 text-sm text-muted-foreground">€</span>
            </p>
          </div>
          <p className="text-[11px] tabular-nums text-muted-foreground">+ {eur(contribTotal)}/mois</p>
        </div>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {displayed.map(env => {
          const data = envelopeSeries(env);
          const stroke = env.tone === "warm" ? "var(--warm)" : env.tone === "accent" ? "var(--accent)" : "var(--primary)";
          const editing = editKey === env.key;
          return (
            <div key={env.key} className="group relative rounded-xl border border-border/50 bg-card/60 p-4 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-lift">
              <div className="flex items-start justify-between">
                <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">{env.label}</p>
                {!editing && (
                  <button onClick={() => startEdit(env.key, env.balance)}
                    aria-label="Ajuster le solde"
                    className="opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100">
                    <Pencil className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                  </button>
                )}
              </div>
              {editing ? (
                <div className="mt-2 flex items-center gap-1">
                  <input
                    autoFocus
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") commitEdit(env.key);
                      if (e.key === "Escape") setEditKey(null);
                    }}
                    inputMode="decimal"
                    className="min-w-0 flex-1 rounded-md border border-border bg-background px-2 py-1 font-serif text-lg tabular-nums focus:border-primary focus:outline-none"
                  />
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
    </section>
  );
}

/* ---- 5. Categories grid — the "why" (R7) ---- */

function CategoriesGrid() {
  return (
    <section className="anim-slide-up">
      <header className="mb-4 flex items-end justify-between gap-3">
        <div>
          <h2 className="font-serif text-xl tracking-tight sm:text-2xl">Catégories</h2>
          <p className="mt-1 text-xs text-muted-foreground sm:text-sm">Où va l'argent — clic pour ouvrir le détail.</p>
        </div>
        <Link to="/budget/mensuel" className="text-xs text-primary underline-offset-4 hover:underline">
          Vue mensuelle →
        </Link>
      </header>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {categories.map(c => <CategoryMiniCard key={c.key} cat={c} />)}
      </div>
    </section>
  );
}

function CategoryMiniCard({ cat }: { cat: typeof categories[number] }) {
  const Icon = cat.icon;
  const over = cat.actual > cat.budget;
  const pct = Math.min(100, (cat.actual / cat.budget) * 100);
  const trend = categoryTrend(cat);
  const nextBill = nextBillForCategory(cat.key);
  const first = trend[0].v, last = trend[trend.length - 1].v;
  const trendUp = last > first;

  return (
    <Link to="/budget/mensuel"
      className="group flex flex-col rounded-xl border border-border/50 bg-card p-3 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-lift">
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <span className={"grid h-8 w-8 shrink-0 place-items-center rounded-full " + (over ? "bg-warm/15 text-warm" : "bg-secondary text-foreground/70")}>
            <Icon className="h-4 w-4" />
          </span>
          <p className="truncate text-sm font-medium">{cat.label}</p>
        </div>
        <span className={"inline-flex items-center gap-0.5 text-[10px] tabular-nums " + (trendUp ? "text-warm" : "text-success")}>
          {trendUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
        </span>
      </div>

      <div className="mt-2 flex items-baseline justify-between gap-2 text-xs">
        <span className={"tabular-nums " + (over ? "font-semibold text-warm" : "text-foreground")}>{eur(cat.actual)}</span>
        <span className="tabular-nums text-muted-foreground">/ {eur(cat.budget)}</span>
      </div>
      <div className="relative mt-1.5 h-1 w-full overflow-hidden rounded-full bg-secondary">
        <div className={"absolute inset-y-0 left-0 rounded-full transition-[width] duration-700 " + (over ? "bg-warm" : "bg-primary")}
             style={{ width: `${pct}%` }} />
      </div>

      <div className="-mx-1 mt-2 h-8">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={trend} margin={{ top: 2, right: 2, left: 2, bottom: 0 }}>
            <defs>
              <linearGradient id={`cat-${cat.key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={cat.color} stopOpacity={0.35} />
                <stop offset="100%" stopColor={cat.color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area type="monotone" dataKey="v" stroke={cat.color} strokeWidth={1.5} fill={`url(#cat-${cat.key})`} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {nextBill && (
        <p className="mt-2 inline-flex items-center gap-1 truncate text-[10px] text-muted-foreground">
          <CalendarClock className="h-3 w-3" />
          <span className="truncate capitalize">{MONTHS_FR_LONG[nextBill.monthIdx]} · {nextBill.label}</span>
        </p>
      )}
    </Link>
  );
}

/* keep unused-import guards happy */
void incomeSources; void nonMonthlyBills; void ArrowRight; void Sparkles; void PiggyBank; void CheckCircle2; void Clock;




/* ============================ MONTH VIEW ============================ */

function MonthView({ year, monthIdx, onPrev, onNext }: { year: number; monthIdx: number; onPrev: () => void; onNext: () => void }) {
  const state = temporalState(monthIdx, year);
  const origin = `${((monthIdx + 0.5) / 12) * 100}% 0%`;

  return (
    <div
      className="space-y-6"
      style={{ animation: "pop-in 0.45s cubic-bezier(0.2,0.7,0.2,1) both", transformOrigin: origin }}
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <StateBadge state={state} />
        <div className="flex items-center gap-2">
          <button onClick={onPrev} disabled={monthIdx === 0}
            className="grid h-9 w-9 place-items-center rounded-full border border-border/60 text-muted-foreground hover:bg-secondary hover:text-foreground disabled:opacity-30"
          ><ChevronLeft className="h-4 w-4" /></button>
          <button onClick={onNext} disabled={monthIdx === 11}
            className="grid h-9 w-9 place-items-center rounded-full border border-border/60 text-muted-foreground hover:bg-secondary hover:text-foreground disabled:opacity-30"
          ><ChevronRight className="h-4 w-4" /></button>
        </div>
      </div>

      {state === "passe" && <PasseView monthIdx={monthIdx} />}
      {state === "en-cours" && <EnCoursView monthIdx={monthIdx} />}
      {state === "futur" && <FuturView monthIdx={monthIdx} />}
    </div>
  );
}

function StateBadge({ state }: { state: TemporalState }) {
  const cfg = state === "passe"
    ? { label: "Mois clos · rapport", cls: "bg-secondary text-foreground/70", Icon: CheckCircle2 }
    : state === "en-cours"
      ? { label: "En cours · réel + projection", cls: "bg-primary/10 text-primary ring-1 ring-primary/30", Icon: Clock }
      : { label: "À venir · projection", cls: "bg-warm/10 text-warm", Icon: CalendarClock };
  return (
    <span className={"inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs " + cfg.cls}>
      <cfg.Icon className="h-3.5 w-3.5" /> {cfg.label}
    </span>
  );
}

/* ---- Passé ---- */
function PasseView({ monthIdx }: { monthIdx: number }) {
  const entrees = incomeSources.reduce((s, i) => s + i.value, 0);
  const totalActual = categories.reduce((s, c) => s + c.actual, 0);
  const totalBudget = categories.reduce((s, c) => s + c.budget, 0);
  const delta = totalActual - totalBudget;
  const bills = nonMonthlyBills(postesSeed, monthIdx);

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-3">
        <SmallStat label="Entrées" value={entrees} tone="primary" />
        <SmallStat label="Dépenses" value={totalActual} tone="warm" />
        <SmallStat label="Écart vs prévu" value={delta} tone={delta > 0 ? "warm" : "success"} signed />
      </div>

      <section className="rounded-2xl border border-border/60 bg-card p-5 shadow-soft sm:p-7">
        <header className="mb-4">
          <h3 className="font-serif text-xl tracking-tight">Prévu vs réel</h3>
          <p className="mt-1 text-sm text-muted-foreground">Variance par catégorie pour ce mois clos.</p>
        </header>
        <ul className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {[...categories].sort((a,b)=>a.label.localeCompare(b.label,"fr")).map((c) => {
            const over = c.actual > c.budget;
            const pct = Math.min(100, (c.actual / c.budget) * 100);
            const Icon = c.icon;
            return (
              <li key={c.key} className={"rounded-xl border bg-card/40 px-3 py-3 " + (over ? "border-warm/30" : "border-border/40")}>
                <div className="flex items-center gap-3">
                  <span className={"grid h-9 w-9 place-items-center rounded-full " + (over ? "bg-warm/15 text-warm" : "bg-secondary text-foreground/70")}>
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="truncate font-medium">{c.label}</p>
                      <p className="shrink-0 text-sm tabular-nums">
                        <span className={over ? "font-semibold text-warm" : ""}>{eur(c.actual)}</span>
                        <span className="text-muted-foreground"> / {eur(c.budget)}</span>
                      </p>
                    </div>
                    <div className="relative mt-2 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                      <div className={"absolute inset-y-0 left-0 rounded-full transition-[width] duration-700 ease-out " + (over ? "bg-warm" : "bg-primary")}
                        style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      {bills.length > 0 && <BillsBar bills={bills} label="Échéances réalisées ce mois" />}
    </div>
  );
}

/* ---- En cours ---- */
function EnCoursView({ monthIdx }: { monthIdx: number }) {
  const day = new Date().getDate();
  const total = new Date(currentYear, currentMonthIdx + 1, 0).getDate();
  const progress = day / total;
  const fullActual = categories.reduce((s, c) => s + c.actual, 0);
  const dejaDepense = Math.round(fullActual * progress);
  const encorePrevu = Math.round(categories.reduce((s,c)=>s+c.budget,0) * (1 - progress));
  const entrees = incomeSources.reduce((s, i) => s + i.value, 0);
  const bills = nonMonthlyBills(postesSeed, monthIdx);

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-3">
        <SmallStat label="Entrées" value={entrees} tone="primary" />
        <SmallStat label="Déjà dépensé" value={dejaDepense} tone="warm" hint={`${Math.round(progress*100)}% du mois`} />
        <SmallStat label="Encore prévu" value={encorePrevu} tone="primary" hint="projection" />
      </div>

      <section className="rounded-2xl border border-border/60 bg-card p-5 shadow-soft sm:p-7">
        <header className="mb-4 flex items-end justify-between gap-3">
          <div>
            <h3 className="font-serif text-xl tracking-tight">Réel à date + projection</h3>
            <p className="mt-1 text-sm text-muted-foreground">La barre marque la frontière entre les deux.</p>
          </div>
          <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Jour {day}/{total}</p>
        </header>
        <ul className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
          {[...categories].sort((a,b)=>a.label.localeCompare(b.label,"fr")).map((c) => {
            const realPct = Math.min(100, (c.actual * progress / c.budget) * 100);
            const projPct = Math.min(100, (c.budget / c.budget) * 100);
            const Icon = c.icon;
            return (
              <li key={c.key} className="rounded-xl border border-border/40 bg-card/40 px-3 py-3">
                <div className="flex items-center gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-secondary text-foreground/70">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="truncate font-medium">{c.label}</p>
                      <p className="shrink-0 text-xs tabular-nums text-muted-foreground">
                        <span className="text-foreground">{eur(Math.round(c.actual*progress))}</span>
                        <span className="opacity-60"> + {eur(c.budget - Math.round(c.actual*progress))} prévu</span>
                      </p>
                    </div>
                    <div className="relative mt-2 h-1.5 w-full overflow-hidden rounded-full bg-secondary">
                      <div className="absolute inset-y-0 left-0 rounded-full bg-warm/40 transition-[width] duration-700"
                        style={{ width: `${projPct}%` }} />
                      <div className="absolute inset-y-0 left-0 rounded-full bg-primary transition-[width] duration-700"
                        style={{ width: `${realPct}%` }} />
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      {bills.length > 0 && <BillsBar bills={bills} label="Échéances de ce mois" />}
    </div>
  );
}

/* ---- Futur ---- */
function FuturView({ monthIdx }: { monthIdx: number }) {
  const ofMonth = postesSeed.filter(p => p.months.includes(monthIdx));
  const prevuTotal = ofMonth.reduce((s, p) => s + p.amount, 0);
  const byCat = ofMonth.reduce<Record<string, { label: string; total: number; postes: typeof ofMonth }>>((acc, p) => {
    const c = categories.find(c => c.key === p.category)!;
    acc[c.key] ??= { label: c.label, total: 0, postes: [] };
    acc[c.key].total += p.amount;
    acc[c.key].postes.push(p);
    return acc;
  }, {});

  const synth = Array.from({ length: 30 }, (_, i) => ({ d: i + 1, v: 0 }));
  ofMonth.forEach((p) => {
    const day = ((p.id.charCodeAt(2) ?? 0) % 28) + 1;
    synth[day - 1].v += p.amount;
  });

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-3">
        <SmallStat label="Entrées prévues" value={5200} tone="primary" hint="salaire net" />
        <SmallStat label="Dépenses prévues" value={prevuTotal} tone="warm" hint={`${ofMonth.length} postes`} />
        <SmallStat label="Net projeté" value={5200 - prevuTotal} tone={(5200 - prevuTotal) >= 0 ? "success" : "warm"} />
      </div>

      <section className="rounded-2xl border border-dashed border-border/60 bg-card/60 p-5 shadow-soft sm:p-7">
        <header className="mb-4 flex items-end justify-between gap-3">
          <div>
            <h3 className="font-serif text-xl tracking-tight">Postes prévus</h3>
            <p className="mt-1 text-sm text-muted-foreground">Projection issue de la Planification — aucune réelle dépense.</p>
          </div>
          <Link to="/budget/planification" className="text-xs text-primary underline-offset-4 hover:underline">Modifier →</Link>
        </header>

        {ofMonth.length === 0 ? (
          <p className="text-sm text-muted-foreground">Aucun poste planifié ce mois-ci.</p>
        ) : (
          <ul className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {Object.entries(byCat).sort((a,b)=>a[1].label.localeCompare(b[1].label,"fr")).map(([k, g]) => {
              const cat = categories.find(c => c.key === k as any)!;
              const Icon = cat.icon;
              return (
                <li key={k} className="rounded-xl border border-border/40 bg-card/40 px-3 py-3">
                  <div className="flex items-center gap-3">
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-secondary text-foreground/70">
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <p className="truncate font-medium">{g.label}</p>
                        <p className="shrink-0 text-sm tabular-nums text-warm">{eur(g.total)}</p>
                      </div>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">{g.postes.map(p=>p.label).join(" · ")}</p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        <div className="mt-5 h-32 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={synth} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="futurGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--warm)" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="var(--warm)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="d" stroke="var(--muted-foreground)" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis hide />
              <Area type="monotone" dataKey="v" stroke="var(--warm)" strokeWidth={1.5} fill="url(#futurGrad)" strokeDasharray="4 3" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}

function BillsBar({ bills, label }: { bills: { label: string; amount: number }[]; label: string }) {
  return (
    <section className="rounded-2xl border border-border/60 bg-card p-5 shadow-soft sm:p-7">
      <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {bills.map((b, i) => (
          <span key={i} className="inline-flex items-center gap-2 rounded-full border border-warm/30 bg-warm/10 px-3 py-1.5 text-sm text-warm">
            {b.label}
            <span className="font-medium tabular-nums">−{eur(b.amount)}</span>
          </span>
        ))}
      </div>
    </section>
  );
}

function SmallStat({ label, value, tone, hint, signed }: { label: string; value: number; tone: "primary"|"warm"|"success"; hint?: string; signed?: boolean }) {
  const cls = tone === "warm" ? "text-warm" : tone === "success" ? "text-success" : "text-foreground";
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-soft">
      <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <p className={"mt-2 font-serif text-2xl tracking-tight tabular-nums " + cls}>
        {signed && value > 0 ? "+" : ""}<CountUp to={value} /><span className="ml-1 text-sm text-muted-foreground">€</span>
      </p>
      {hint && <p className="mt-0.5 text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}
