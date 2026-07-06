import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, ReferenceLine,
  ResponsiveContainer, Tooltip as RTooltip, XAxis, YAxis, Cell,
} from "recharts";
import {
  ArrowLeft, ChevronLeft, ChevronRight, Flame, PiggyBank, Sparkles,
  TrendingUp, TrendingDown, Clock, CheckCircle2, CalendarClock,
} from "lucide-react";
import { CountUp } from "@/components/CountUp";
import {
  categories, rolling12, envelopes, postesSeed, MONTHS_FR, MONTHS_FR_LONG, eur,
  temporalState, currentMonthIdx, currentYear, projectedForMonth, budgetForMonth,
  nonMonthlyBills, annualisationProvision, actualForMonth, incomeSources,
  type TemporalState,
} from "@/lib/budget-data";

export const Route = createFileRoute("/_app/budget/vue")({
  component: VuePage,
  head: () => ({
    meta: [
      { title: "Vue d'ensemble — Budget" },
      { name: "description", content: "Année zoomable, rapport du passé et projection du futur." },
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
              Budget · {zoomMonth === null ? "Année" : "Mois"}
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

  // Per-month numbers: past/current use rolling12 actuals, future uses projections.
  const monthly = useMemo(() => MONTHS_FR.map((m, idx) => {
    const state = temporalState(idx, year);
    const projected = projectedForMonth(postesSeed, idx);
    const actual = state === "futur" ? 0 : (rolling12[idx]?.spend ?? actualForMonth(idx, state));
    const income = state === "futur" ? 5200 : (rolling12[idx]?.income ?? 5200);
    return { m, idx, state, projected, actual, income, spend: state === "futur" ? projected : actual };
  }), [year]);

  const realisedYTD = monthly.filter(x => x.state !== "futur").reduce((s, x) => s + x.actual, 0);
  const projectedRest = monthly.filter(x => x.state === "futur").reduce((s, x) => s + x.projected, 0);
  const totalIncome = monthly.reduce((s, x) => s + x.income, 0);
  const totalSpend = realisedYTD + projectedRest;
  const net = totalIncome - totalSpend;
  const tauxEpargne = Math.max(0, Math.round((net / totalIncome) * 100));
  const provision = annualisationProvision(postesSeed);

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 stagger lg:grid-cols-4">
        <Kpi label="Réalisé cette année" value={realisedYTD} icon={CheckCircle2} tone="primary" hint={`${monthly.filter(x => x.state !== "futur").length} mois`} />
        <Kpi label="Projeté restant" value={projectedRest} icon={CalendarClock} tone="warm" hint={`${monthly.filter(x => x.state === "futur").length} mois`} />
        <Kpi label="Net projeté" value={net} icon={net >= 0 ? TrendingUp : TrendingDown} tone={net >= 0 ? "success" : "warm"} />
        <Kpi label="Taux d'épargne" value={tauxEpargne} suffix="%" icon={PiggyBank} tone="success" />
      </div>

      {/* Big combined: flow chart + pressure strip — one block */}
      <section className="rounded-2xl border border-border/60 bg-card p-4 shadow-soft sm:p-7 anim-slide-up">
        <header className="mb-4 flex flex-wrap items-end justify-between gap-3 sm:mb-5">
          <div className="min-w-0">
            <h2 className="font-serif text-xl tracking-tight sm:text-2xl">L'année en continu</h2>
            <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
              Flux mensuels et pression — <span className="text-foreground/70">réalisé</span> à gauche,
              <span className="text-foreground/70"> projeté</span> à droite.
            </p>
          </div>
          <Legend />
        </header>

        <div className="h-56 w-full sm:h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={monthly} margin={{ top: 8, right: 4, left: -18, bottom: 0 }}>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="m" stroke="var(--muted-foreground)" fontSize={10} tickLine={false} axisLine={false} interval={0} />
              <YAxis stroke="var(--muted-foreground)" fontSize={10} tickLine={false} axisLine={false}
                tickFormatter={(v) => `${Math.round(v / 1000)}k`} width={36} />
              <RTooltip
                contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12, color: "var(--popover-foreground)" }}
                formatter={(v: number, n) => [eur(v), n]}
              />
              {isCurrentYear && <ReferenceLine x={MONTHS_FR[currentMonthIdx]} stroke="var(--foreground)" strokeOpacity={0.3} strokeDasharray="2 4" />}
              <Bar dataKey="income" name="Entrées" radius={[4,4,0,0]} maxBarSize={14}>
                {monthly.map((d) => (
                  <Cell key={d.idx} fill="var(--primary)" fillOpacity={d.state === "futur" ? 0.35 : 1} />
                ))}
              </Bar>
              <Bar dataKey="spend" name="Dépenses" radius={[4,4,0,0]} maxBarSize={14}>
                {monthly.map((d) => (
                  <Cell key={d.idx} fill="var(--warm)" fillOpacity={d.state === "futur" ? 0.35 : 1} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pressure strip — horizontal scroll on mobile, trimester grid on sm+ */}
        <div className="mt-6 border-t border-border/40 pt-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Pression de l'année</p>
            <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              <Flame className="h-3 w-3 anim-breathe" />
              <span className="hidden sm:inline">Cliquez un mois pour zoomer</span>
              <span className="sm:hidden">Tap un mois</span>

            </span>
          </div>

          {/* Mobile: horizontal scroll, 12 tiles in a row */}
          <div className="-mx-4 px-4 sm:hidden">
            <div className="flex gap-2 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden snap-x snap-mandatory">
              {monthly.map((d) => (
                <div key={d.idx} className="w-[104px] shrink-0 snap-start">
                  <MonthTile data={d} onClick={() => onPickMonth(d.idx)} year={year} />
                </div>
              ))}
            </div>
          </div>

          {/* Desktop: trimester grid */}
          <div className="hidden grid-cols-4 gap-3 sm:grid sm:gap-4">
            {[0,1,2,3].map(q => (
              <div key={q} className="space-y-1">
                <p className="text-[9px] uppercase tracking-[0.22em] text-muted-foreground/70">T{q+1}</p>
                <div className="grid grid-cols-3 gap-1.5">
                  {monthly.slice(q*3, q*3+3).map((d) => (
                    <MonthTile key={d.idx} data={d} onClick={() => onPickMonth(d.idx)} year={year} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* Annualisation + envelopes */}
      <section className="grid gap-4 sm:gap-5 lg:grid-cols-3">
        <div className="rounded-2xl border border-border/60 bg-card p-4 shadow-soft sm:p-7">
          <header className="mb-3 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Provision d'annualisation</p>
              <p className="mt-2 font-serif text-2xl tracking-tight tabular-nums sm:text-3xl">
                <CountUp to={provision} /><span className="ml-1 text-sm text-muted-foreground">€/mois</span>
              </p>
            </div>
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary/10 text-primary">
              <Sparkles className="h-4 w-4" />
            </span>
          </header>
          <p className="text-xs text-muted-foreground">
            Lisse les grosses échéances (mazout, assurance, mutuelle, vacances, impôts). Calculée à partir de la Planification.
          </p>
          <Link to="/budget/planification" className="mt-4 inline-flex items-center gap-1 text-xs text-primary underline-offset-4 hover:underline">
            Modifier la planification →
          </Link>
        </div>
        <div className="lg:col-span-2 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {envelopes.map(env => (
            <div key={env.key} className="rounded-2xl border border-border/60 bg-card p-3 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-lift sm:p-4">
              <p className="truncate text-[10px] uppercase tracking-[0.16em] text-muted-foreground">{env.label}</p>
              <p className="mt-2 font-serif text-lg tabular-nums sm:text-xl">
                <CountUp to={env.balance} /><span className="ml-1 text-xs text-muted-foreground">€</span>
              </p>
              <p className="mt-0.5 text-[11px] text-muted-foreground tabular-nums">+ {eur(env.contrib)} / mois</p>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}

function MonthTile({ data, onClick, year }: { data: { m: string; idx: number; state: TemporalState; actual: number; projected: number; spend: number }; onClick: () => void; year: number }) {
  const bills = nonMonthlyBills(postesSeed, data.idx);
  const isCurrent = year === currentYear && data.idx === currentMonthIdx;
  const stateBg =
    data.state === "passe"   ? "bg-card"
    : data.state === "en-cours" ? "bg-primary/5 ring-1 ring-primary/30"
    : "bg-card";
  const stateLabel =
    data.state === "passe" ? "clos" : data.state === "en-cours" ? "en cours" : "à venir";
  const stateDot =
    data.state === "passe" ? "bg-foreground/40" : data.state === "en-cours" ? "bg-primary" : "bg-muted-foreground/30";

  // Heat intensity from bills total
  const pressure = bills.reduce((s, b) => s + b.amount, 0);
  const intensity = Math.min(1, pressure / 1500);

  return (
    <button
      onClick={onClick}
      className={
        "group relative flex min-h-[88px] flex-col rounded-xl border p-2 text-left transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift " +
        (isCurrent ? "border-foreground/60 " : "border-border/40 ") + stateBg
      }
      style={{
        background: data.state === "futur"
          ? `repeating-linear-gradient(135deg, color-mix(in oklab, var(--warm) ${Math.round(intensity*14)}%, var(--card)) 0 6px, var(--card) 6px 12px)`
          : `linear-gradient(180deg, color-mix(in oklab, var(--warm) ${Math.round(intensity * 22)}%, var(--card)) 0%, var(--card) 100%)`,
      }}
    >
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">{data.m}</span>
        <span className={"inline-flex items-center gap-1 rounded-full bg-secondary/70 px-1.5 py-0.5 text-[9px] uppercase tracking-[0.1em] text-muted-foreground"}>
          <span className={"h-1 w-1 rounded-full " + stateDot} />
          {stateLabel}
        </span>
      </div>
      <div className="mt-1.5 flex flex-1 flex-col gap-1">
        {bills.length === 0 ? (
          <span className="text-[10px] text-muted-foreground/40">—</span>
        ) : bills.slice(0, 2).map((b, i) => (
          <span key={i} className="truncate rounded-md bg-warm/15 px-1.5 py-0.5 text-[10px] font-medium leading-tight text-warm"
            title={`${b.label} · ${eur(b.amount)}`}>{b.label}</span>
        ))}
        {bills.length > 2 && <span className="text-[10px] text-muted-foreground">+{bills.length - 2}</span>}
      </div>
      <p className="mt-1 text-[10px] tabular-nums text-muted-foreground">
        {data.state === "futur" ? "prévu " : ""}{eur(data.spend)}
      </p>
    </button>
  );
}

function Legend() {
  return (
    <div className="flex flex-wrap items-center gap-3 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
      <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-primary" /> Entrées</span>
      <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-sm bg-warm" /> Dépenses</span>
      <span className="inline-flex items-center gap-1.5 opacity-60"><span className="h-2 w-2 rounded-sm bg-warm/40" /> Projeté</span>
    </div>
  );
}

function Kpi({ label, value, suffix, icon: Icon, tone, hint }: {
  label: string; value: number; suffix?: string;
  icon: typeof TrendingUp;
  tone: "primary" | "warm" | "success"; hint?: string;
}) {
  const toneCls =
    tone === "warm" ? "bg-warm/15 text-warm"
    : tone === "success" ? "bg-success/15 text-success"
    : "bg-primary/10 text-primary";
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card p-4 shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift sm:p-5">
      <div className="flex items-center justify-between gap-2">
        <p className="min-w-0 truncate text-[10px] uppercase tracking-[0.18em] text-muted-foreground sm:text-xs">{label}</p>
        <span className={"grid h-7 w-7 shrink-0 place-items-center rounded-full sm:h-8 sm:w-8 " + toneCls}>
          <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </span>
      </div>
      <p className="mt-2 font-serif text-2xl tracking-tight tabular-nums sm:mt-3 sm:text-3xl">
        <CountUp to={value} /><span className="ml-1 text-sm text-muted-foreground sm:text-base">{suffix ?? "€"}</span>
      </p>
      {hint && <p className="mt-1 text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}


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
