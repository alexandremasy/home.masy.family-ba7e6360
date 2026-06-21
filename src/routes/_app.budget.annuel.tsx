import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Legend, ReferenceLine,
  ResponsiveContainer, Tooltip as RTooltip, XAxis, YAxis,
} from "recharts";
import { Flame, PiggyBank, ChevronLeft, ChevronRight } from "lucide-react";
import { CountUp } from "@/components/CountUp";
import {
  categories, rolling12, calendarBills, envelopes,
  monthlyAnnualProvision, annualBalance, MONTHS_FR, eur,
  type CatKey,
} from "@/lib/budget-data";

export const Route = createFileRoute("/_app/budget/annuel")({
  component: AnnuelPage,
  head: () => ({
    meta: [
      { title: "Annuel — Budget" },
      { name: "description", content: "Vue annuelle : évolution, pression et zoom sur catégorie." },
    ],
  }),
});

function AnnuelPage() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [zoomCat, setZoomCat] = useState<CatKey>("energie");
  const navigate = useNavigate();

  const totalSpend = rolling12.reduce((s, r) => s + r.spend, 0);
  const totalIncome = rolling12.reduce((s, r) => s + r.income, 0);
  const net = totalIncome - totalSpend;
  const epargneRate = Math.round((net / totalIncome) * 100);
  const avgSpend = Math.round(totalSpend / rolling12.length);
  const currentIdx = rolling12.length - 1;

  // Grouped bar (Income vs Outcome per month) — calendar Jan..Dec
  const grouped = useMemo(() => MONTHS_FR.map((m, i) => {
    const r = rolling12[i] ?? { spend: 4200, income: 5200 };
    return { m, Entrées: r.income, Dépenses: r.spend };
  }), []);

  // Pressure strip
  const pressure = MONTHS_FR.map((_, idx) => {
    const bills = calendarBills[idx] ?? [];
    return bills.filter((b) => b.kind !== "income").reduce((s, b) => s + b.amount, 0);
  });
  const maxP = Math.max(...pressure, 1);

  // Category zoom — fake 12-month trend
  const zoom = categories.find((c) => c.key === zoomCat)!;
  const zoomData = useMemo(() => MONTHS_FR.map((m, i) => ({
    m,
    v: Math.round(zoom.actual * (0.85 + Math.sin(i * 0.9 + zoomCat.length) * 0.18 + (i === 9 ? 0.4 : 0))),
  })), [zoom, zoomCat]);
  const zoomAvg = Math.round(zoomData.reduce((s, d) => s + d.v, 0) / zoomData.length);

  return (
    <div className="space-y-8 anim-slide-up">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Budget · Annuel</p>
          <h1 className="mt-1 font-serif text-3xl tracking-tight sm:text-4xl">Année {year}</h1>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setYear((y) => y - 1)}
            className="grid h-9 w-9 place-items-center rounded-full border border-border/60 text-muted-foreground hover:bg-secondary hover:text-foreground"
          ><ChevronLeft className="h-4 w-4" /></button>
          <button onClick={() => setYear((y) => Math.min(now.getFullYear(), y + 1))}
            disabled={year >= now.getFullYear()}
            className="grid h-9 w-9 place-items-center rounded-full border border-border/60 text-muted-foreground hover:bg-secondary hover:text-foreground disabled:opacity-30"
          ><ChevronRight className="h-4 w-4" /></button>
        </div>
      </div>

      {/* Big totals */}
      <div className="grid gap-3 stagger sm:grid-cols-2 lg:grid-cols-4">
        <BigStat label="Dépenses annuelles" value={totalSpend} suffix="€" tone="warm" />
        <BigStat label="Entrées annuelles"  value={totalIncome} suffix="€" tone="primary" />
        <BigStat label="Net" value={net} suffix="€" tone={net >= 0 ? "success" : "warm"} />
        <BigStat label="Taux d'épargne" value={epargneRate} suffix="%" tone="success" />
      </div>

      {/* Grouped bar — flow per month */}
      <section className="rounded-2xl border border-border/60 bg-card p-5 shadow-soft sm:p-7 anim-slide-up">
        <header className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-serif text-2xl tracking-tight">Flux mensuels</h2>
            <p className="mt-1 text-sm text-muted-foreground">Entrées vs dépenses — les pics sont les mois lourds</p>
          </div>
        </header>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={grouped} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="m" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false}
                tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
              <RTooltip
                contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12, color: "var(--popover-foreground)" }}
                formatter={(v: number) => eur(v)}
                cursor={{ fill: "var(--secondary)", opacity: 0.4 }}
              />
              <Legend iconType="circle" wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="Entrées" fill="var(--primary)" radius={[4,4,0,0]} maxBarSize={18} />
              <Bar dataKey="Dépenses" fill="var(--warm)" radius={[4,4,0,0]} maxBarSize={18} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Rolling area */}
      <section className="rounded-2xl border border-border/60 bg-card p-5 shadow-soft sm:p-7 anim-slide-up">
        <header className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-serif text-2xl tracking-tight">Évolution</h2>
            <p className="mt-1 text-sm text-muted-foreground">12 mois glissants — moyenne {eur(avgSpend)}/mois</p>
          </div>
        </header>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={rolling12} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="aIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="var(--primary)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="aSpend" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--warm)" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="var(--warm)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="m" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false}
                tickFormatter={(v) => `${Math.round(v / 1000)}k`} />
              <RTooltip
                contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12, color: "var(--popover-foreground)" }}
                formatter={(v: number) => eur(v)}
              />
              <ReferenceLine y={avgSpend} stroke="var(--muted-foreground)" strokeDasharray="4 4" />
              <ReferenceLine x={rolling12[currentIdx].m} stroke="var(--foreground)" strokeOpacity={0.25} strokeDasharray="2 4" />
              <Area type="monotone" dataKey="income" name="Entrées" stroke="var(--primary)" strokeWidth={2} fill="url(#aIncome)" />
              <Area type="monotone" dataKey="spend"  name="Dépenses" stroke="var(--warm)"   strokeWidth={2} fill="url(#aSpend)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* Pressure + annualisation */}
      <section className="rounded-2xl border border-border/60 bg-card p-5 shadow-soft sm:p-7 anim-slide-up">
        <header className="mb-4 flex items-end justify-between">
          <div>
            <h2 className="font-serif text-2xl tracking-tight">Pression de l'année</h2>
            <p className="mt-1 text-sm text-muted-foreground">Cellules de chaleur + chips des grosses échéances</p>
          </div>
          <span className="grid h-9 w-9 place-items-center rounded-full bg-primary/10 text-primary">
            <Flame className="h-4 w-4 anim-breathe" />
          </span>
        </header>

        <div className="grid grid-cols-6 gap-2 sm:grid-cols-12">
          {MONTHS_FR.map((m, idx) => {
            const bills = calendarBills[idx] ?? [];
            const cost = pressure[idx];
            const intensity = cost / maxP;
            const isCurrent = idx === new Date().getMonth();
            return (
              <button
                key={m}
                onClick={() => navigate({ to: "/budget/mensuel" })}
                className={
                  "group relative flex min-h-[72px] flex-col rounded-xl border p-2 text-left transition-all duration-300 hover:-translate-y-0.5 " +
                  (isCurrent ? "border-foreground/60" : "border-border/40")
                }
                style={{
                  background: `linear-gradient(180deg, color-mix(in oklab, var(--warm) ${Math.round(intensity * 22)}%, var(--card)) 0%, var(--card) 100%)`,
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">{m}</span>
                  {cost > 0 && (
                    <span className="inline-block h-1.5 w-1.5 rounded-full"
                      style={{ background: `color-mix(in oklab, var(--warm) ${30 + intensity * 70}%, transparent)` }} />
                  )}
                </div>
                <div className="mt-1.5 flex flex-1 flex-col gap-1">
                  {bills.length === 0 && <span className="text-[10px] text-muted-foreground/50">—</span>}
                  {bills.map((b) => (
                    <span key={b.label}
                      className={"truncate rounded-md px-1.5 py-0.5 text-[10px] font-medium leading-tight " +
                        (b.kind === "income" ? "bg-success/15 text-success" : "bg-warm/15 text-warm")}
                      title={`${b.label} · ${eur(b.amount)}`}
                    >{b.label}</span>
                  ))}
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-6 grid gap-4 border-t border-border/40 pt-5 sm:grid-cols-2">
          <div>
            <p className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Provision mensuelle</p>
            <p className="mt-1 font-serif text-3xl tracking-tight tabular-nums">
              <CountUp to={monthlyAnnualProvision} /><span className="ml-1 text-sm text-muted-foreground">€/mois</span>
            </p>
          </div>
          <div className="rounded-xl bg-secondary/60 p-4">
            <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Solde d'annualisation</p>
            <p className="mt-1 font-serif text-2xl tabular-nums">{eur(annualBalance)}</p>
            <p className="mt-2 text-xs text-muted-foreground">
              Lisse les grosses factures (mazout, assurance, taxes) pour qu'aucun mois ne soit écrasé.
            </p>
          </div>
        </div>
      </section>

      {/* Category zoom */}
      <section className="rounded-2xl border border-border/60 bg-card p-5 shadow-soft sm:p-7 anim-slide-up">
        <header className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-serif text-2xl tracking-tight">Zoom sur une catégorie</h2>
            <p className="mt-1 text-sm text-muted-foreground">Tendance 12 mois — moyenne {eur(zoomAvg)}/mois</p>
          </div>
          <div className="flex flex-wrap gap-1">
            {categories.map((c) => (
              <button key={c.key}
                onClick={() => setZoomCat(c.key)}
                className={"inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs transition-colors " +
                  (zoomCat === c.key ? "bg-foreground text-background" : "bg-secondary text-muted-foreground hover:text-foreground")}
              >
                {c.label}
              </button>
            ))}
          </div>
        </header>
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={zoomData} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="zoomGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={zoom.color} stopOpacity={0.45} />
                  <stop offset="100%" stopColor={zoom.color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="m" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false}
                tickFormatter={(v) => `${v}€`} />
              <RTooltip
                contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12, color: "var(--popover-foreground)" }}
                formatter={(v: number) => eur(v)}
              />
              <ReferenceLine y={zoomAvg} stroke="var(--muted-foreground)" strokeDasharray="4 4" />
              <Area type="monotone" dataKey="v" stroke={zoom.color} strokeWidth={2} fill="url(#zoomGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 grid gap-2 text-sm sm:grid-cols-3">
          {zoom.subs.map((s) => (
            <div key={s.label} className="flex items-center justify-between rounded-lg bg-secondary/40 px-3 py-2">
              <span className="text-muted-foreground">{s.label}</span>
              <span className="tabular-nums">{eur(s.actual)}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Envelopes */}
      <section className="anim-slide-up">
        <header className="mb-4 flex items-end justify-between">
          <h2 className="font-serif text-2xl tracking-tight">Enveloppes d'épargne</h2>
          <p className="text-xs text-muted-foreground tabular-nums">{eur(envelopes.reduce((s,e)=>s+e.contrib,0))}/mois</p>
        </header>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {envelopes.map((env) => {
            const data = Array.from({ length: 12 }, (_, i) => ({
              i, v: Math.max(0, env.balance - env.contrib * (11 - i)) + Math.sin(i * 1.3) * env.contrib * 0.15,
            }));
            const toneRing =
              env.tone === "warm" ? "bg-warm/15 text-warm"
              : env.tone === "accent" ? "bg-accent/20 text-accent-foreground"
              : "bg-primary/10 text-primary";
            const stroke = env.tone === "warm" ? "var(--warm)" : env.tone === "accent" ? "var(--accent)" : "var(--primary)";
            return (
              <div key={env.key} className="group rounded-2xl border border-border/60 bg-card p-5 shadow-soft transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift">
                <div className="flex items-center justify-between">
                  <p className="text-xs uppercase tracking-[0.16em] text-muted-foreground">{env.label}</p>
                  <span className={"grid h-8 w-8 place-items-center rounded-full " + toneRing}><PiggyBank className="h-4 w-4" /></span>
                </div>
                <p className="mt-3 font-serif text-2xl tracking-tight tabular-nums">
                  <CountUp to={env.balance} /><span className="ml-1 text-sm text-muted-foreground">€</span>
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground tabular-nums">+ {eur(env.contrib)} / mois</p>
                <div className="-mx-2 mt-3 h-10">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data} margin={{ top: 4, right: 4, left: 4, bottom: 0 }}>
                      <defs>
                        <linearGradient id={`env-${env.key}`} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor={stroke} stopOpacity={0.3} />
                          <stop offset="100%" stopColor={stroke} stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <Area type="monotone" dataKey="v" stroke={stroke} strokeWidth={1.5} fill={`url(#env-${env.key})`} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function BigStat({ label, value, suffix, tone }: { label: string; value: number; suffix: string; tone: "primary"|"warm"|"success" }) {
  const cls = tone === "warm" ? "text-warm" : tone === "success" ? "text-success" : "text-foreground";
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-soft">
      <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <p className={"mt-2 font-serif text-3xl tracking-tight tabular-nums " + cls}>
        <CountUp to={value} /><span className="ml-1 text-base text-muted-foreground">{suffix}</span>
      </p>
    </div>
  );
}
