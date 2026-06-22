import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { CalendarCheck, Plus, Repeat, Sparkles, AlertTriangle, Trash2 } from "lucide-react";
import { CountUp } from "@/components/CountUp";
import {
  categories, envelopes, postesSeed, MONTHS_FR, eur,
  defaultMonthsFor, annualisationProvision,
  type Poste, type Recurrence4, type CatKey,
} from "@/lib/budget-data";

export const Route = createFileRoute("/_app/budget/planification")({
  component: PlanificationPage,
  head: () => ({
    meta: [
      { title: "Planification — Budget" },
      { name: "description", content: "Définir les postes récurrents et la provision d'annualisation." },
    ],
  }),
});

function PlanificationPage() {
  const [postes, setPostes] = useState<Poste[]>(postesSeed);
  const [highlightId, setHighlightId] = useState<string | null>(null);

  const provision = useMemo(() => annualisationProvision(postes), [postes]);
  const totalMonthly = useMemo(
    () => postes.filter(p => p.recurrence === "Mensuelle").reduce((s, p) => s + p.amount, 0),
    [postes]
  );
  const totalAnnual = useMemo(
    () => postes.reduce((s, p) => s + p.amount * p.months.length, 0),
    [postes]
  );

  // Group by category > sub
  const grouped = useMemo(() => {
    const m = new Map<CatKey, Poste[]>();
    [...postes]
      .sort((a, b) => a.label.localeCompare(b.label, "fr"))
      .forEach(p => {
        if (!m.has(p.category)) m.set(p.category, []);
        m.get(p.category)!.push(p);
      });
    return [...m.entries()].sort(([a], [b]) => {
      const la = categories.find(c => c.key === a)?.label ?? a;
      const lb = categories.find(c => c.key === b)?.label ?? b;
      return la.localeCompare(lb, "fr");
    });
  }, [postes]);

  function update(id: string, patch: Partial<Poste>) {
    setPostes(ps => ps.map(p => p.id === id ? { ...p, ...patch } : p));
    setHighlightId(id);
    setTimeout(() => setHighlightId(null), 900);
  }
  function setRecurrence(id: string, rec: Recurrence4) {
    setPostes(ps => ps.map(p => p.id === id
      ? { ...p, recurrence: rec, months: defaultMonthsFor(rec, p.months[0] ?? 0) }
      : p));
    setHighlightId(id);
    setTimeout(() => setHighlightId(null), 900);
  }
  function toggleMonth(id: string, m: number) {
    setPostes(ps => ps.map(p => {
      if (p.id !== id) return p;
      const has = p.months.includes(m);
      const months = has ? p.months.filter(x => x !== m) : [...p.months, m].sort((a,b)=>a-b);
      return { ...p, months };
    }));
    setHighlightId(id);
    setTimeout(() => setHighlightId(null), 900);
  }
  function removePoste(id: string) {
    setPostes(ps => ps.filter(p => p.id !== id));
  }
  function addPoste(category: CatKey) {
    const id = "n" + Math.random().toString(36).slice(2, 8);
    setPostes(ps => [...ps, {
      id, category, sub: "Nouveau poste", label: "Nouveau poste",
      amount: 50, budget: 50, recurrence: "Mensuelle", months: defaultMonthsFor("Mensuelle"),
    }]);
    setHighlightId(id);
    setTimeout(() => setHighlightId(null), 900);
  }

  const doubleCount = postes.some(p => p.recurrence !== "Mensuelle"); // light heuristic

  return (
    <div className="space-y-8 anim-slide-up">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Budget · Planification</p>
          <h1 className="mt-1 font-serif text-3xl tracking-tight sm:text-4xl">L'atelier des budgets</h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            Définissez vos postes récurrents et leurs échéances. La provision d'annualisation et les projections
            de la <Link to="/budget/vue" className="underline-offset-4 hover:underline">Vue d'ensemble</Link> sont calculées en direct.
          </p>
        </div>
      </header>

      {/* Live KPIs */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 stagger">
        <StatCard label="Provision mensuelle" value={provision} suffix="€/mois" tone="primary" Icon={Sparkles} />
        <StatCard label="Charges fixes mensuelles" value={totalMonthly} suffix="€/mois" tone="warm" Icon={Repeat} />
        <StatCard label="Total annuel planifié" value={totalAnnual} suffix="€/an" tone="warm" Icon={CalendarCheck} />
        <StatCard label="Postes actifs" value={postes.length} suffix="" tone="success" Icon={Repeat} />
      </div>

      {doubleCount && (
        <div className="flex items-start gap-3 rounded-2xl border border-warm/30 bg-warm/5 p-4 text-sm">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warm" />
          <div>
            <p className="font-medium">Attention au double comptage</p>
            <p className="mt-0.5 text-muted-foreground">
              Si vos postes non-mensuels (eau, mazout, mutuelle…) sont aussi encodés comme dépenses dans iSaveMoney,
              vous risquez de les compter deux fois. Le cockpit reste la source de vérité.
            </p>
          </div>
        </div>
      )}

      {/* Categories */}
      <div className="space-y-6">
        {grouped.map(([catKey, list]) => {
          const cat = categories.find(c => c.key === catKey)!;
          const Icon = cat.icon;
          const catTotal = list.reduce((s, p) => s + p.amount * p.months.length, 0);
          return (
            <section key={catKey} className="rounded-2xl border border-border/60 bg-card p-5 shadow-soft sm:p-6">
              <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-secondary text-foreground/70">
                    <Icon className="h-4 w-4" />
                  </span>
                  <div>
                    <h2 className="font-serif text-xl tracking-tight">{cat.label}</h2>
                    <p className="text-xs text-muted-foreground tabular-nums">{eur(catTotal)} / an · {list.length} poste{list.length > 1 ? "s" : ""}</p>
                  </div>
                </div>
                <button
                  onClick={() => addPoste(catKey)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-border/60 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-foreground/40 hover:text-foreground"
                >
                  <Plus className="h-3.5 w-3.5" /> Ajouter un poste
                </button>
              </header>

              <ul className="space-y-3">
                {list.map(p => (
                  <PosteRow
                    key={p.id}
                    poste={p}
                    highlighted={highlightId === p.id}
                    onUpdate={(patch) => update(p.id, patch)}
                    onRecurrence={(r) => setRecurrence(p.id, r)}
                    onToggleMonth={(m) => toggleMonth(p.id, m)}
                    onRemove={() => removePoste(p.id)}
                  />
                ))}
              </ul>
            </section>
          );
        })}
      </div>

      {/* Annualisation plan */}
      <section className="rounded-2xl border border-border/60 bg-card p-5 shadow-soft sm:p-7">
        <header className="mb-4 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="font-serif text-2xl tracking-tight">Plan d'épargne · enveloppes</h2>
            <p className="mt-1 text-sm text-muted-foreground">Le set-aside mensuel d'annualisation est ventilé sur vos enveloppes.</p>
          </div>
          <p className="font-serif text-2xl tabular-nums">
            <CountUp to={provision} /><span className="ml-1 text-sm text-muted-foreground">€/mois</span>
          </p>
        </header>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {envelopes.map(env => (
            <div key={env.key} className="rounded-xl border border-border/40 bg-card/40 p-4">
              <p className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">{env.label}</p>
              <p className="mt-2 font-serif text-xl tabular-nums">{eur(env.contrib)}<span className="ml-1 text-xs text-muted-foreground">/mois</span></p>
              <p className="mt-0.5 text-[11px] text-muted-foreground tabular-nums">Solde {eur(env.balance)}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function StatCard({ label, value, suffix, tone, Icon }: { label: string; value: number; suffix: string; tone: "primary"|"warm"|"success"; Icon: typeof Sparkles }) {
  const cls =
    tone === "warm" ? "bg-warm/15 text-warm"
    : tone === "success" ? "bg-success/15 text-success"
    : "bg-primary/10 text-primary";
  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-lift">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
        <span className={"grid h-8 w-8 place-items-center rounded-full " + cls}><Icon className="h-4 w-4" /></span>
      </div>
      <p className="mt-3 font-serif text-3xl tracking-tight tabular-nums">
        <CountUp to={value} /><span className="ml-1 text-sm text-muted-foreground">{suffix}</span>
      </p>
    </div>
  );
}

function PosteRow({ poste, highlighted, onUpdate, onRecurrence, onToggleMonth, onRemove }: {
  poste: Poste;
  highlighted: boolean;
  onUpdate: (patch: Partial<Poste>) => void;
  onRecurrence: (r: Recurrence4) => void;
  onToggleMonth: (m: number) => void;
  onRemove: () => void;
}) {
  const yearly = poste.amount * poste.months.length;

  return (
    <li className={"group rounded-xl border bg-card/40 px-3 py-3 transition-all duration-300 " +
      (highlighted ? "border-primary/60 bg-primary/5 ring-1 ring-primary/30" : "border-border/40 hover:border-border")}>
      <div className="flex flex-wrap items-center gap-3">
        <input
          value={poste.label}
          onChange={(e) => onUpdate({ label: e.target.value })}
          className="min-w-[160px] flex-1 rounded-md border border-transparent bg-transparent px-2 py-1 text-sm font-medium outline-none transition-colors focus:border-border focus:bg-card"
        />
        <div className="flex items-center gap-1 rounded-full border border-border/60 bg-card p-0.5 text-[11px]">
          {(["Mensuelle","Trimestrielle","Annuelle","Au besoin"] as Recurrence4[]).map(r => (
            <button key={r}
              onClick={() => onRecurrence(r)}
              className={"rounded-full px-2.5 py-1 transition-colors " +
                (poste.recurrence === r ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground")}
            >{r}</button>
          ))}
        </div>
        <div className="inline-flex items-center gap-1 text-sm">
          <input
            type="number"
            value={poste.amount}
            onChange={(e) => onUpdate({ amount: Math.max(0, Number(e.target.value) || 0) })}
            className="w-20 rounded-md border border-border/60 bg-card px-2 py-1 text-right tabular-nums outline-none focus:border-foreground/40"
          />
          <span className="text-muted-foreground">€</span>
        </div>
        <p className="text-[11px] text-muted-foreground tabular-nums">
          = {eur(yearly)}/an
        </p>
        <button onClick={onRemove}
          className="grid h-7 w-7 place-items-center rounded-full text-muted-foreground/60 transition-colors hover:bg-warm/10 hover:text-warm"
          aria-label="Supprimer"
        ><Trash2 className="h-3.5 w-3.5" /></button>
      </div>

      {/* 12-month timeline */}
      <div className="mt-3 grid grid-cols-12 gap-1">
        {MONTHS_FR.map((m, i) => {
          const on = poste.months.includes(i);
          return (
            <button key={i}
              onClick={() => onToggleMonth(i)}
              className={"group/cell relative flex flex-col items-center rounded-md px-1 py-1 text-[10px] uppercase tracking-[0.1em] transition-all " +
                (on ? "bg-primary/15 text-primary ring-1 ring-primary/40" : "bg-secondary/60 text-muted-foreground hover:bg-secondary")}
              title={on ? `Échéance ${eur(poste.amount)}` : "Pas d'échéance"}
            >
              <span>{m}</span>
              <span className={"mt-0.5 inline-block h-1 w-1 rounded-full " + (on ? "bg-primary" : "bg-transparent")} />
            </button>
          );
        })}
      </div>
    </li>
  );
}
