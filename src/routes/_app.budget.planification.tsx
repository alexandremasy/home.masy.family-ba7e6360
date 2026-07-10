import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Fuel, ChevronDown, Coins } from "lucide-react";
import { CountUp } from "@/components/CountUp";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  MONTHS_FR, eur,
  PLAN_CATS, planPostesSeed, defaultMonthsFor,
  planCascade, posteMonthly, planReelCadence, planKindOf,
  type PlanPoste, type Recurrence4, type PlanKind,
} from "@/lib/budget-data";
import { energie } from "@/lib/mock-data";

export const Route = createFileRoute("/_app/budget/planification")({
  component: PlanificationPage,
  head: () => ({
    meta: [
      { title: "Planification — Budget" },
      { name: "description", content: "Le prévu face au réel importé, poste par poste." },
    ],
  }),
});

const RECS: Recurrence4[] = ["Mensuelle", "Trimestrielle", "Annuelle", "Au besoin"];
const recShort = (r: Recurrence4) =>
  r === "Mensuelle" ? "Mensuel" : r === "Trimestrielle" ? "Trimestre" : r === "Annuelle" ? "Annuel" : "Au besoin";

// The three plan families — the top-level separation (Entrées · Sorties · Épargne).
const FAMILIES: { kind: PlanKind; label: string; accent: string }[] = [
  { kind: "entree", label: "Entrées", accent: "text-success" },
  { kind: "depense", label: "Sorties", accent: "text-foreground/70" },
  { kind: "epargne", label: "Épargne", accent: "text-primary" },
];
const catKindOf = (cat: string): PlanKind => PLAN_CATS.find(c => c.cat === cat)?.kind ?? "depense";

function FamilyDivider({ label, accent }: { label: string; accent: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className={"text-xs font-semibold uppercase tracking-[0.22em] " + accent}>{label}</span>
      <div className="h-px flex-1 bg-border/50" />
    </div>
  );
}

// Zone widths — three zones (plan · année · statut), shared by the sticky header and rows.
const Z = {
  poste: "w-[150px] min-w-0 shrink-0",
  prevu: "w-[66px] shrink-0 text-right",
  freq: "w-[78px] shrink-0",
  reel: "w-[76px] shrink-0 text-right",
  ecart: "w-[62px] shrink-0 text-right",
  left: "flex shrink-0 items-center gap-2 pr-3",
  center: "flex min-w-[452px] flex-1 items-center border-l border-border/50 px-3",
  right: "flex shrink-0 items-center gap-2 border-l border-border/50 pl-3",
};

function PlanificationPage() {
  const [postes, setPostes] = useState<PlanPoste[]>(planPostesSeed);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const cascade = useMemo(() => planCascade(postes), [postes]);
  const editing = postes.find(p => p.id === editingId) ?? null;

  const tree = useMemo(() => {
    return PLAN_CATS.map(({ cat, icon }) => {
      const inCat = postes.filter(p => p.cat === cat);
      const groups: { group: string; items: PlanPoste[] }[] = [];
      for (const p of inCat) {
        let g = groups.find(x => x.group === p.group);
        if (!g) { g = { group: p.group, items: [] }; groups.push(g); }
        g.items.push(p);
      }
      return { cat, icon, groups };
    }).filter(c => c.groups.length);
  }, [postes]);

  function patch(id: string, p: Partial<PlanPoste>) {
    setPostes(ps => ps.map(x => x.id === id ? { ...x, ...p } : x));
  }
  function toggle(cat: string) {
    setCollapsed(s => { const n = new Set(s); n.has(cat) ? n.delete(cat) : n.add(cat); return n; });
  }

  return (
    <div className="space-y-6 anim-slide-up sm:space-y-8">
      <header className="min-w-0">
        <p className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Budget · Planification</p>
        <h1 className="mt-1 font-serif text-2xl tracking-tight sm:text-4xl">L'atelier des budgets</h1>
      </header>

      <Cascade c={cascade} />

      <div className="hidden lg:block">
        <div className="min-w-[940px] space-y-8">
          {FAMILIES.map(fam => {
            const cats = tree.filter(t => catKindOf(t.cat) === fam.kind);
            if (!cats.length) return null;
            const single = fam.kind !== "depense";
            return (
              <div key={fam.kind} className="space-y-4">
                <FamilyDivider label={fam.label} accent={fam.accent} />
                {cats.map(({ cat, icon: Icon, groups }) => {
                  const isOpen = single || !collapsed.has(cat);
                  return (
                    <div key={cat}>
                      {!single && (
                        <button onClick={() => toggle(cat)}
                          className="flex w-full items-center gap-2 px-1 pb-1 text-left">
                          <ChevronDown className={"h-4 w-4 text-muted-foreground transition-transform " + (isOpen ? "" : "-rotate-90")} />
                          <span className="grid h-6 w-6 place-items-center rounded-full bg-secondary text-foreground/70">
                            <Icon className="h-3.5 w-3.5" />
                          </span>
                          <h2 className="font-serif text-base tracking-tight">{cat}</h2>
                        </button>
                      )}

                      {isOpen && (
                        <div className="space-y-3">
                          {groups.map(({ group, items }) => (
                            <div key={group}>
                              {/* Sticky sub-category header — carries the column labels */}
                        <div className="sticky top-[66px] z-10 flex items-stretch overflow-hidden rounded-t-xl border border-border/60 bg-card/95 shadow-soft backdrop-blur">
                          <div className={Z.left + " py-2 pl-3"}>
                            <span className={Z.poste + " text-xs font-semibold uppercase tracking-[0.1em] text-foreground/80 truncate"}>{group}</span>
                            <span className={Z.prevu + " text-[10px] uppercase tracking-[0.12em] text-muted-foreground"}>Prévu</span>
                            <span className={Z.freq + " text-[10px] uppercase tracking-[0.12em] text-muted-foreground"}>Fréq.</span>
                          </div>
                          <div className={Z.center + " py-2"}>
                            <div className="grid min-w-0 flex-1 grid-cols-12 gap-x-1">
                              {MONTHS_FR.map((m, i) => (
                                <span key={i} className="text-center text-[10px] uppercase text-muted-foreground/60">{m[0]}</span>
                              ))}
                            </div>
                          </div>
                          <div className={Z.right + " py-2 pr-3"}>
                            <span className={Z.reel + " text-[10px] uppercase tracking-[0.12em] text-muted-foreground"}>Réel</span>
                            <span className={Z.ecart + " text-[10px] uppercase tracking-[0.12em] text-muted-foreground"}>Écart</span>
                          </div>
                        </div>
                        {/* Rows */}
                        <div className="divide-y divide-border/30 rounded-b-xl border border-t-0 border-border/50 bg-card">
                          {items.map(p => (
                            <PosteRow key={p.id} poste={p} onEdit={() => setEditingId(p.id)} />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile — compact list, monthly detail lives in the modal */}
      <div className="space-y-7 lg:hidden">
        {FAMILIES.map(fam => {
          const cats = tree.filter(t => catKindOf(t.cat) === fam.kind);
          if (!cats.length) return null;
          const single = fam.kind !== "depense";
          return (
            <div key={fam.kind} className="space-y-3">
              <FamilyDivider label={fam.label} accent={fam.accent} />
              {cats.map(({ cat, icon: Icon, groups }) => {
                const isOpen = single || !collapsed.has(cat);
                return (
                  <div key={cat}>
                    {!single && (
                      <button onClick={() => toggle(cat)} className="flex w-full items-center gap-2 px-1 pb-1 text-left">
                        <ChevronDown className={"h-4 w-4 text-muted-foreground transition-transform " + (isOpen ? "" : "-rotate-90")} />
                        <span className="grid h-6 w-6 place-items-center rounded-full bg-secondary text-foreground/70">
                          <Icon className="h-3.5 w-3.5" />
                        </span>
                        <h2 className="font-serif text-base tracking-tight">{cat}</h2>
                      </button>
                    )}
                    {isOpen && groups.map(({ group, items }) => (
                      <div key={group} className="mb-3 overflow-hidden rounded-xl border border-border/50 bg-card">
                        <p className="border-b border-border/40 bg-secondary/20 px-3 py-1.5 text-[10px] uppercase tracking-[0.16em] text-muted-foreground/70">{group}</p>
                        <div className="divide-y divide-border/30">
                          {items.map(p => (
                            <MobileRow key={p.id} poste={p} onEdit={() => setEditingId(p.id)} />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      <EditModal poste={editing} onClose={() => setEditingId(null)} onPatch={patch} />
    </div>
  );
}

/* ---------- Cascade ---------- */

function Cascade({ c }: { c: ReturnType<typeof planCascade> }) {
  const red = c.marge < 0;
  return (
    <section className="rounded-2xl border border-border/60 bg-card p-4 shadow-soft sm:p-6">
      <p className="mb-3 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Équilibre du plan · sur l'année</p>
      <div className="flex flex-wrap items-stretch gap-2 sm:gap-3">
        <Bucket label="Entrées" value={c.entrees} tint="text-success" />
        <Op sign="−" />
        <Bucket label="Dépenses" value={c.depenses} tint="text-foreground" />
        <Op sign="−" />
        <Bucket label="Épargne (cibles)" value={c.epargne} tint="text-foreground" />
        <Op sign="=" />
        <Bucket label="Marge" value={c.marge} tint={red ? "text-warm" : "text-success"}
          box={red ? "border-warm/50 bg-warm/5" : "border-success/50 bg-success/5"} signed />
      </div>

      {/* Provision — the plan's key actionable output */}
      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border border-primary/30 bg-primary/5 px-4 py-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary/15 text-primary">
          <Coins className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Provision d'annualisation</p>
          <p className="font-serif text-2xl tabular-nums text-primary">
            {eur(c.provision)}<span className="ml-1.5 text-sm font-normal text-muted-foreground">/mois à mettre de côté</span>
          </p>
        </div>
        <p className="text-[11px] leading-snug text-muted-foreground sm:ml-auto sm:max-w-[260px]">
          De quoi couvrir le non-mensuel (annuel + trimestriel) le jour où il tombe. L'au besoin ({eur(c.auBesoin)}/an) reste hors plan.
        </p>
      </div>
    </section>
  );
}

function Bucket({ label, value, tint, box, signed }: {
  label: string; value: number; tint: string; box?: string; signed?: boolean;
}) {
  return (
    <div className={"min-w-0 flex-1 rounded-xl border px-3 py-3 sm:px-4 " + (box ?? "border-border/40 bg-card/40")}>
      <p className="truncate text-[10px] uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
      <p className={"mt-1.5 font-serif text-xl tabular-nums tracking-tight sm:text-2xl " + tint}>
        {signed && value >= 0 ? "+" : ""}<CountUp to={value} group /><span className="ml-0.5 text-xs text-muted-foreground">€/an</span>
      </p>
    </div>
  );
}

function Op({ sign }: { sign: string }) {
  return <div className="hidden shrink-0 items-center justify-center px-0.5 text-lg text-muted-foreground/60 sm:flex">{sign}</div>;
}

/* ---------- Poste row (read-only, click to edit) ---------- */

function PosteRow({ poste, onEdit }: { poste: PlanPoste; onEdit: () => void }) {
  const monthly = useMemo(() => posteMonthly(poste), [poste]);
  const real = planReelCadence(poste);
  const ecart = real - poste.amount;
  const pct = poste.amount > 0 ? Math.round((ecart / poste.amount) * 100) : 0;
  const auBesoin = poste.recurrence === "Au besoin";
  const mazout = poste.sensor === "mazout";
  // Tint the months the prévision covers: all 12 for Mensuelle, the occurrence months otherwise.
  const plannedSet = new Set(poste.recurrence === "Mensuelle" ? [0,1,2,3,4,5,6,7,8,9,10,11] : poste.months);

  // Over prévu is BAD for dépenses (spent more), GOOD for entrées/épargne (earned/saved more).
  const goodOver = planKindOf(poste) !== "depense";
  const sev = Math.abs(pct) < 5 ? "flat" : ecart > 0 ? "over" : "under";
  const good = "text-success bg-success/10";
  const bad = "text-warm bg-warm/10";
  const ecartCls =
    auBesoin ? "text-muted-foreground bg-secondary/60" :
    sev === "over" ? (goodOver ? good : bad) :
    sev === "under" ? (goodOver ? bad : good) :
    "text-muted-foreground bg-secondary/60";

  return (
    <button onClick={onEdit} className="group flex w-full items-stretch text-left transition-colors hover:bg-secondary/25">
      {/* LEFT — plan */}
      <div className={Z.left + " py-2 pl-3"}>
        <span className={Z.poste + " flex items-center gap-1.5"}>
          <span className="truncate text-sm">{poste.label}</span>
          {mazout && <Fuel className="h-3 w-3 shrink-0 text-warm" />}
        </span>
        <span className={Z.prevu + " text-sm tabular-nums"}>{eur(poste.amount)}</span>
        <span className={Z.freq}>
          <span className="rounded-full bg-secondary/70 px-1.5 py-0.5 text-[10px] text-muted-foreground">{recShort(poste.recurrence)}</span>
        </span>
      </div>

      {/* CENTER — the year */}
      <div className={Z.center + " py-2"}>
        <div className="grid min-w-0 flex-1 grid-cols-12 gap-x-1">
          {monthly.map((v, i) => {
            const hit = v > 0;
            const planned = plannedSet.has(i);
            return (
              <span key={i}
                className={"rounded py-1 text-center text-sm tabular-nums " +
                  (planned ? "bg-primary/[0.10] " : "") +
                  (hit ? "text-foreground/75" : "text-muted-foreground/25")}>
                {hit ? eur(Math.round(v)) : "·"}
              </span>
            );
          })}
        </div>
      </div>

      {/* RIGHT — status */}
      <div className={Z.right + " py-2 pr-3"}>
        <span className={Z.reel + " text-sm tabular-nums text-foreground/70"}>{eur(real)}</span>
        <span className={Z.ecart}>
          <span className={"inline-block rounded-md px-1.5 py-0.5 text-[11px] font-medium tabular-nums " + ecartCls}>
            {auBesoin ? "—" : (ecart >= 0 ? "+" : "−") + eur(Math.abs(ecart))}
          </span>
        </span>
      </div>
    </button>
  );
}

/* ---------- Mobile row (compact) ---------- */

function MobileRow({ poste, onEdit }: { poste: PlanPoste; onEdit: () => void }) {
  const real = planReelCadence(poste);
  const ecart = real - poste.amount;
  const pct = poste.amount > 0 ? Math.round((ecart / poste.amount) * 100) : 0;
  const auBesoin = poste.recurrence === "Au besoin";
  const nonMensuel = poste.recurrence !== "Mensuelle";
  const mazout = poste.sensor === "mazout";
  const goodOver = planKindOf(poste) !== "depense";
  const sev = Math.abs(pct) < 5 ? "flat" : ecart > 0 ? "over" : "under";
  const good = "text-success bg-success/10";
  const bad = "text-warm bg-warm/10";
  const ecartCls =
    auBesoin ? "text-muted-foreground bg-secondary/60" :
    sev === "over" ? (goodOver ? good : bad) :
    sev === "under" ? (goodOver ? bad : good) :
    "text-muted-foreground bg-secondary/60";

  return (
    <button onClick={onEdit} className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left transition-colors active:bg-secondary/30">
      <div className="min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="truncate text-sm">{poste.label}</span>
          {mazout && <Fuel className="h-3 w-3 shrink-0 text-warm" />}
        </div>
        <div className="mt-1 flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <span className="rounded-full bg-secondary/70 px-1.5 py-0.5 text-[10px]">{recShort(poste.recurrence)}</span>
          {nonMensuel && <span>éch. {MONTHS_FR[poste.months[0] ?? 0]}</span>}
        </div>
      </div>
      <div className="shrink-0 text-right">
        <div className="text-sm tabular-nums">{eur(poste.amount)}<span className="ml-0.5 text-[10px] text-muted-foreground">prévu</span></div>
        <div className="mt-1 flex items-center justify-end gap-1.5">
          <span className="text-[11px] tabular-nums text-muted-foreground">réel {eur(real)}</span>
          <span className={"rounded-md px-1.5 py-0.5 text-[10px] font-medium tabular-nums " + ecartCls}>
            {auBesoin ? "—" : (ecart >= 0 ? "+" : "−") + eur(Math.abs(ecart))}
          </span>
        </div>
      </div>
    </button>
  );
}

/* ---------- Edit modal ---------- */

function EditModal({ poste, onClose, onPatch }: {
  poste: PlanPoste | null;
  onClose: () => void;
  onPatch: (id: string, p: Partial<PlanPoste>) => void;
}) {
  const nonMensuel = poste ? poste.recurrence !== "Mensuelle" : false;

  return (
    <Dialog open={!!poste} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="sm:max-w-lg">
        {poste && (
          <>
            <DialogHeader>
              <DialogTitle className="font-serif text-xl">{poste.label}</DialogTitle>
              <p className="text-xs text-muted-foreground">{poste.cat} › {poste.group}</p>
            </DialogHeader>

            <div className="space-y-4 pt-2">
              {/* Three uniform fields */}
              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className="mb-1 block text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Montant prévu</span>
                  <div className="flex items-center rounded-lg border border-border/60 bg-card px-2.5 py-2 focus-within:border-foreground/40">
                    <input type="number" value={poste.amount} autoFocus
                      onChange={(e) => onPatch(poste.id, { amount: Math.max(0, Number(e.target.value) || 0) })}
                      className="w-full bg-transparent text-sm tabular-nums outline-none" />
                    <span className="text-sm text-muted-foreground">€</span>
                  </div>
                </label>
                <label className="block">
                  <span className="mb-1 block text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Fréquence</span>
                  <select value={poste.recurrence}
                    onChange={(e) => {
                      const rec = e.target.value as Recurrence4;
                      onPatch(poste.id, { recurrence: rec, months: defaultMonthsFor(rec, poste.months[0] ?? 0) });
                    }}
                    className="w-full rounded-lg border border-border/60 bg-card px-2.5 py-2 text-sm outline-none focus:border-foreground/40">
                    {RECS.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </label>
                {nonMensuel && (
                  <label className="block">
                    <span className="mb-1 block text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Mois d'échéance</span>
                    <select value={poste.months[0] ?? 0}
                      onChange={(e) => onPatch(poste.id, { months: defaultMonthsFor(poste.recurrence, Number(e.target.value)) })}
                      className="w-full rounded-lg border border-border/60 bg-card px-2.5 py-2 text-sm outline-none focus:border-foreground/40">
                      {MONTHS_FR.map((m, i) => <option key={i} value={i}>{m}</option>)}
                    </select>
                  </label>
                )}
              </div>

              {/* Réel — 12 mois (graphical) */}
              <div>
                <span className="mb-1.5 block text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Réel · 12 mois</span>
                <div className="overflow-x-auto rounded-xl border border-border/40 bg-card/40 p-2 [scrollbar-width:thin]">
                  <div className="grid min-w-[540px] grid-cols-12 gap-1">
                    {posteMonthly(poste).map((v, i) => {
                      const hit = v > 0;
                      const planned = poste.recurrence === "Mensuelle" ? true : poste.months.includes(i);
                      return (
                        <div key={i} className={"flex flex-col items-center gap-1 rounded-md py-1.5 " + (planned ? "bg-primary/[0.10]" : "")}>
                          <span className="text-[9px] uppercase text-muted-foreground/50">{MONTHS_FR[i][0]}</span>
                          <span className={"text-[10px] tabular-nums " + (hit ? "text-foreground/75" : "text-muted-foreground/25")}>{hit ? eur(Math.round(v)) : "·"}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {poste.sensor === "mazout" && (
                <p className="flex items-start gap-1.5 rounded-lg bg-warm/5 px-3 py-2 text-[11px] text-warm">
                  <Fuel className="mt-0.5 h-3 w-3 shrink-0" />
                  Cuve à {energie.oil.tankPct}% — un plein approche (~{energie.oil.tankCapacity - energie.oil.tankLiters} L). Ajuste l'échéance en conséquence.
                </p>
              )}
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
