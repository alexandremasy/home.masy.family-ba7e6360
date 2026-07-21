import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Fuel, ChevronLeft, ChevronRight, Coins, Lock, PencilRuler, Plus, X } from "lucide-react";
import { CountUp } from "@/components/count-up";
import { Dialog, DialogContent } from "@/components/dialog";
import {
  MONTHS_FR,
  eur,
  PLAN_CATS,
  planPostesSeed,
  planPostesForYear,
  defaultMonthsFor,
  planPosteYear,
  planCascade,
  posteMonthly,
  planReelYear,
  planReelMedian,
  planKindOf,
  prevuMonthly,
  planPostePrevYear,
  currentYear,
  PLAN_MIN_YEAR,
  PLAN_MAX_YEAR,
  type PlanPoste,
  type PlanRecurrence,
  type PlanOccurrence,
  type PlanKind,
  type Recurrence4,
} from "@/lib/budget-data";
import { energie } from "@/lib/mock-data";
import { Button } from "@/components/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/select";
import { Eyebrow } from "@/components/eyebrow";
import { Card } from "@/components/card";

export const Route = createFileRoute("/_app/budget/planification")({
  component: PlanificationPage,
  head: () => ({
    meta: [
      { title: "Planification — Budget" },
      { name: "description", content: "Le prévu face au réel importé, poste par poste." },
    ],
  }),
});

const RECS: PlanRecurrence[] = ["Mensuelle", "Trimestrielle", "Annuelle", "Ponctuel", "Au besoin"];
const recShort = (r: PlanRecurrence) =>
  r === "Mensuelle"
    ? "Mensuel"
    : r === "Trimestrielle"
      ? "Trimestre"
      : r === "Annuelle"
        ? "Annuel"
        : r === "Ponctuel"
          ? "Ponctuel"
          : "Au besoin";

// The three plan families — the top-level separation (Entrées · Sorties · Épargne).
const FAMILIES: { kind: PlanKind; label: string; accent: string }[] = [
  { kind: "entree", label: "Entrées", accent: "text-success" },
  { kind: "depense", label: "Sorties", accent: "text-foreground/70" },
  { kind: "epargne", label: "Épargne", accent: "text-primary" },
];
const catKindOf = (cat: string): PlanKind =>
  PLAN_CATS.find((c) => c.cat === cat)?.kind ?? "depense";

function FamilyDivider({ label, accent }: { label: string; accent: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className={"text-base font-semibold uppercase tracking-eyebrow " + accent}>
        {label}
      </span>
      <div className="h-px flex-1 bg-border/50" />
    </div>
  );
}

// Zone widths — three zones (plan · année · statut), shared by the sticky header and rows.
const Z = {
  poste: "w-[150px] min-w-0 shrink-0",
  prevu: "w-[66px] shrink-0 text-right",
  freq: "w-[78px] shrink-0 text-center",
  reel: "w-[76px] shrink-0 text-right",
  ecart: "w-[62px] shrink-0 text-right",
  left: "flex shrink-0 items-center gap-2 pr-3",
  center: "flex min-w-[452px] flex-1 items-center border-l border-border/50 px-3",
  right: "flex shrink-0 items-center gap-2 border-l border-border/50 pl-3",
};

function PlanificationPage() {
  const [year, setYear] = useState(currentYear);
  // Editable plans live in state, keyed by year: the current year + next year's draft. Past
  // years are read-only archives, derived on the fly.
  const [plans, setPlans] = useState<Record<number, PlanPoste[]>>(() => ({
    [currentYear]: planPostesSeed,
    [currentYear + 1]: planPostesForYear(currentYear + 1),
  }));
  const [editingId, setEditingId] = useState<string | null>(null);

  // Three states: past = archive (read-only), current = editable, next = editable draft.
  const archive = year < currentYear; // consult, don't rewrite history
  const draft = year > currentYear; // next year's plan, prepared before it starts
  const editable = !archive;
  const showReal = year <= currentYear; // a future year has no imported réel yet
  const displayed = editable ? (plans[year] ?? planPostesForYear(year)) : planPostesForYear(year);

  const cascade = useMemo(() => planCascade(displayed), [displayed]);
  const editing = editable ? (displayed.find((p) => p.id === editingId) ?? null) : null;

  const tree = useMemo(() => {
    return PLAN_CATS.map(({ cat, icon }) => {
      const inCat = displayed.filter((p) => p.cat === cat);
      const groups: { group: string; items: PlanPoste[] }[] = [];
      for (const p of inCat) {
        let g = groups.find((x) => x.group === p.group);
        if (!g) {
          g = { group: p.group, items: [] };
          groups.push(g);
        }
        g.items.push(p);
      }
      return { cat, icon, groups };
    }).filter((c) => c.groups.length);
  }, [displayed]);

  function patch(id: string, p: Partial<PlanPoste>) {
    setPlans((prev) => ({
      ...prev,
      [year]: (prev[year] ?? []).map((x) => (x.id === id ? { ...x, ...p } : x)),
    }));
  }
  // Jump to a family's zone from the equilibrium boxes — scrolls the currently visible tree
  // (desktop or mobile), skipping the display:none one.
  function jumpTo(kind: PlanKind) {
    document.querySelectorAll<HTMLElement>(`[data-zone="${kind}"]`).forEach((el) => {
      if (el.offsetParent !== null) el.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  return (
    <div className="space-y-6 anim-slide-up sm:space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <Eyebrow size="xs">Budget · Planification</Eyebrow>
          <h1 className="mt-1 text-xl tracking-tight sm:text-4xl">L'atelier des budgets</h1>
        </div>
        <div className="flex items-center gap-3">
          {archive && (
            <Eyebrow
              size="xs"
              as="span"
              className="flex items-center gap-1.5 rounded-full border border-border/60 bg-secondary/40 px-2.5 py-1"
            >
              <Lock className="h-3 w-3" /> Archive · lecture seule
            </Eyebrow>
          )}
          {draft && (
            <Eyebrow
              tone="current"
              size="xs"
              as="span"
              className="flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-2.5 py-1 text-primary"
            >
              <PencilRuler className="h-3 w-3" /> Préparation
            </Eyebrow>
          )}
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setYear((y) => Math.max(PLAN_MIN_YEAR, y - 1))}
              disabled={year <= PLAN_MIN_YEAR}
              aria-label="Année précédente"
              variant="outline"
              size="iconRound"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="w-12 text-center text-lg tabular-nums">{year}</span>
            <Button
              onClick={() => setYear((y) => Math.min(PLAN_MAX_YEAR, y + 1))}
              disabled={year >= PLAN_MAX_YEAR}
              aria-label="Année suivante"
              variant="outline"
              size="iconRound"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <Cascade c={cascade} onJump={jumpTo} />

      <div className="hidden lg:block">
        <div className="min-w-[940px] space-y-10">
          {FAMILIES.map((fam) => {
            const cats = tree.filter((t) => catKindOf(t.cat) === fam.kind);
            if (!cats.length) return null;
            const single = fam.kind !== "depense";
            return (
              <div key={fam.kind} data-zone={fam.kind} className="scroll-mt-24 space-y-4">
                <FamilyDivider label={fam.label} accent={fam.accent} />
                {cats.map(({ cat, icon: Icon, groups }) => (
                  <div key={cat} className={single ? "" : "pt-5"}>
                    {!single && (
                      <div className="mb-3 flex items-center gap-2.5 px-1">
                        <span className="grid h-8 w-8 place-items-center rounded-full bg-secondary text-foreground/70">
                          <Icon className="h-4 w-4" />
                        </span>
                        <h2 className="text-lg tracking-tight">{cat}</h2>
                      </div>
                    )}
                    <div className="space-y-3">
                      {groups.map(({ group, items }) => (
                        <div key={group}>
                          {/* Sticky sub-category header — carries the column labels */}
                          <div className="sticky top-[var(--nav-h)] z-10 flex items-stretch overflow-hidden rounded-t-xl border border-border/60 bg-card/95 shadow-soft backdrop-blur">
                            <div className={Z.left + " py-2 pl-3"}>
                              <span
                                className={
                                  Z.poste +
                                  " text-xs font-semibold uppercase tracking-eyebrow text-foreground/80 truncate"
                                }
                              >
                                {group}
                              </span>
                              <span
                                className={
                                  Z.freq +
                                  " text-2xs uppercase tracking-eyebrow text-muted-foreground"
                                }
                              >
                                Fréq.
                              </span>
                              <span
                                className={
                                  Z.prevu +
                                  " text-2xs uppercase tracking-eyebrow text-muted-foreground"
                                }
                              >
                                Prévu
                              </span>
                            </div>
                            <div className={Z.center + " py-2"}>
                              <div className="grid min-w-0 flex-1 grid-cols-12 gap-x-1">
                                {MONTHS_FR.map((m, i) => (
                                  <span
                                    key={i}
                                    className="text-center text-2xs uppercase text-muted-foreground/60"
                                  >
                                    {m[0]}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <div className={Z.right + " py-2 pr-3"}>
                              <span
                                className={
                                  Z.reel +
                                  " text-2xs uppercase tracking-eyebrow text-muted-foreground"
                                }
                              >
                                Réel
                              </span>
                              <span
                                className={
                                  Z.ecart +
                                  " text-2xs uppercase tracking-eyebrow text-muted-foreground"
                                }
                              >
                                Écart
                              </span>
                            </div>
                          </div>
                          {/* Rows */}
                          <div className="divide-y divide-border/30 rounded-b-xl border border-t-0 border-border/50 bg-card">
                            {items.map((p) => (
                              <PosteRow
                                key={p.id}
                                poste={p}
                                reel={showReal}
                                onEdit={editable ? () => setEditingId(p.id) : undefined}
                              />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile — compact list, monthly detail lives in the modal */}
      <div className="space-y-8 lg:hidden">
        {FAMILIES.map((fam) => {
          const cats = tree.filter((t) => catKindOf(t.cat) === fam.kind);
          if (!cats.length) return null;
          const single = fam.kind !== "depense";
          return (
            <div key={fam.kind} data-zone={fam.kind} className="scroll-mt-20 space-y-3">
              <FamilyDivider label={fam.label} accent={fam.accent} />
              {cats.map(({ cat, icon: Icon, groups }) => (
                <div key={cat} className={single ? "" : "pt-4"}>
                  {!single && (
                    <div className="mb-3 flex items-center gap-2.5 px-1">
                      <span className="grid h-8 w-8 place-items-center rounded-full bg-secondary text-foreground/70">
                        <Icon className="h-4 w-4" />
                      </span>
                      <h2 className="text-lg tracking-tight">{cat}</h2>
                    </div>
                  )}
                  {groups.map(({ group, items }) => (
                    <div
                      key={group}
                      className="mb-3 overflow-hidden rounded-xl border border-border/50 bg-card"
                    >
                      <Eyebrow
                        tone="current"
                        size="xs"
                        className="border-b border-border/40 bg-secondary/20 px-3 py-1.5 text-muted-foreground/70"
                      >
                        {group}
                      </Eyebrow>
                      <div className="divide-y divide-border/30">
                        {items.map((p) => (
                          <MobileRow
                            key={p.id}
                            poste={p}
                            reel={showReal}
                            onEdit={editable ? () => setEditingId(p.id) : undefined}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          );
        })}
      </div>

      <EditModal
        poste={editing}
        reel={showReal}
        year={year}
        onClose={() => setEditingId(null)}
        onPatch={patch}
      />
    </div>
  );
}

/* ---------- Cascade ---------- */

function Cascade({
  c,
  onJump,
}: {
  c: ReturnType<typeof planCascade>;
  onJump: (k: PlanKind) => void;
}) {
  const red = c.marge < 0;
  const margeTint = red ? "text-warm" : "text-success";
  const margeBox = red ? "border-warm/50 bg-warm/5" : "border-success/50 bg-success/5";
  return (
    <Card>
      <Eyebrow size="xs" className="mb-3">
        Équilibre du plan · sur l'année
      </Eyebrow>

      {/* Desktop — inline equation with operators; provision after the margin (there's room) */}
      <div className="hidden flex-wrap items-stretch gap-3 sm:flex">
        <Bucket
          label="Entrées"
          value={c.entrees}
          tint="text-success"
          onClick={() => onJump("entree")}
        />
        <Op sign="−" />
        <Bucket
          label="Dépenses"
          value={c.depenses}
          tint="text-foreground"
          onClick={() => onJump("depense")}
        />
        <Op sign="−" />
        <Bucket
          label="Épargne (cibles)"
          value={c.epargne}
          tint="text-primary"
          onClick={() => onJump("epargne")}
        />
        <Op sign="=" />
        <Bucket label="Marge" value={c.marge} tint={margeTint} box={margeBox} signed />
        <ProvisionBox provision={c.provision} auBesoin={c.auBesoin} className="flex-1" />
      </div>

      {/* Mobile — 2-col grid, provision full width below */}
      <div className="grid grid-cols-2 gap-2 sm:hidden">
        <Bucket
          label="Entrées"
          value={c.entrees}
          tint="text-success"
          onClick={() => onJump("entree")}
        />
        <Bucket
          label="Dépenses"
          value={c.depenses}
          tint="text-foreground"
          onClick={() => onJump("depense")}
        />
        <Bucket
          label="Épargne (cibles)"
          value={c.epargne}
          tint="text-primary"
          onClick={() => onJump("epargne")}
        />
        <Bucket label="Marge" value={c.marge} tint={margeTint} box={margeBox} signed />
        <ProvisionBox provision={c.provision} auBesoin={c.auBesoin} className="col-span-2" />
      </div>
    </Card>
  );
}

function ProvisionBox({
  provision,
  auBesoin,
  className = "",
}: {
  provision: number;
  auBesoin: number;
  className?: string;
}) {
  return (
    <Card
      variant="inset"
      as="div"
      padding="sm"
      className={"min-w-0 border-primary/30 bg-primary/5 " + className}
    >
      <div className="flex min-w-0 flex-1 items-center gap-2.5">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-primary/15 text-primary">
          <Coins className="h-5 w-5" />
        </span>
        <div className="min-w-0">
          <Eyebrow size="xs" className="truncate">
            Provision /mois
          </Eyebrow>
          <p className="text-lg tabular-nums tracking-tight text-primary sm:text-xl">
            {eur(provision)}
          </p>
          <p className="mt-1 text-2xs leading-snug text-muted-foreground">
            L'au besoin ({eur(auBesoin)}/an) reste hors plan.
          </p>
        </div>
      </div>
    </Card>
  );
}

function Bucket({
  label,
  value,
  tint,
  box,
  signed,
  onClick,
}: {
  label: string;
  value: number;
  tint: string;
  box?: string;
  signed?: boolean;
  onClick?: () => void;
}) {
  const card = (
    <Card
      variant="inset"
      as="div"
      padding="sm"
      className={
        "min-w-0 flex-1 text-left " +
        (box ?? "") +
        (onClick
          ? " transition-colors group-hover/bucket:border-foreground/30 group-hover/bucket:bg-secondary/40"
          : "")
      }
    >
      <Eyebrow size="xs" className="truncate">
        {label}
      </Eyebrow>
      <p className={"mt-1.5 text-lg tabular-nums tracking-tight sm:text-xl " + tint}>
        {signed && value >= 0 ? "+" : ""}
        <CountUp to={value} group />
        <span className="ml-0.5 text-xs text-muted-foreground">€/an</span>
      </p>
    </Card>
  );
  return onClick ? (
    <button onClick={onClick} className="group/bucket min-w-0 flex-1 cursor-pointer text-left">
      {card}
    </button>
  ) : (
    card
  );
}

function Op({ sign }: { sign: string }) {
  return (
    <div className="hidden shrink-0 items-center justify-center px-0.5 text-lg text-muted-foreground/60 sm:flex">
      {sign}
    </div>
  );
}

/* ---------- Poste row (read-only, click to edit) ---------- */

function PosteRow({
  poste,
  onEdit,
  reel = true,
}: {
  poste: PlanPoste;
  onEdit?: () => void;
  reel?: boolean;
}) {
  const monthly = useMemo(() => posteMonthly(poste), [poste]);
  const prevu = poste.recurrence === "Ponctuel" ? planPosteYear(poste) : poste.amount; // colonne Prévu (cadence)
  const realYear = planReelYear(poste); // total réel de l'année
  const realMedian = planReelMedian(poste); // médiane des mois où ça tombe
  const prevuYear = planPosteYear(poste);
  const ecart = realYear - prevuYear; // écart sur base annuelle (total vs total)
  const pct = prevuYear > 0 ? Math.round((ecart / prevuYear) * 100) : 0;
  const auBesoin = poste.recurrence === "Au besoin";
  const mazout = poste.sensor === "mazout";
  // Tint the months the prévision covers: all 12 for Mensuelle, the occurrence months for
  // scheduled cadences, none for Au besoin (no schedule — an envelope, not a dated event).
  const plannedSet = new Set(
    poste.recurrence === "Mensuelle"
      ? [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
      : poste.recurrence === "Au besoin"
        ? []
        : poste.months,
  );

  // Over prévu is BAD for dépenses (spent more), GOOD for entrées/épargne (earned/saved more).
  const goodOver = planKindOf(poste) !== "depense";
  const sev = Math.abs(pct) < 5 ? "flat" : ecart > 0 ? "over" : "under";
  const good = "text-success bg-success/10";
  const bad = "text-warm bg-warm/10";
  const ecartCls = auBesoin
    ? "text-muted-foreground bg-secondary/60"
    : sev === "over"
      ? goodOver
        ? good
        : bad
      : sev === "under"
        ? goodOver
          ? bad
          : good
        : "text-muted-foreground bg-secondary/60";

  return (
    <button
      onClick={onEdit}
      disabled={!onEdit}
      className={
        "group flex w-full items-stretch text-left transition-colors " +
        (onEdit ? "hover:bg-secondary/25" : "cursor-default")
      }
    >
      {/* LEFT — plan */}
      <div className={Z.left + " py-2 pl-3"}>
        <span className={Z.poste + " flex items-center gap-1.5"}>
          <span className="truncate text-sm">{poste.label}</span>
          {mazout && <Fuel className="h-3 w-3 shrink-0 text-warm" />}
        </span>
        <span className={Z.freq}>
          <span className="rounded-full bg-secondary/70 px-1.5 py-0.5 text-2xs text-muted-foreground">
            {recShort(poste.recurrence)}
          </span>
        </span>
        <span className={Z.prevu + " text-sm tabular-nums"}>{eur(prevu)}</span>
      </div>

      {/* CENTER — the year */}
      <div className={Z.center + " py-2"}>
        <div className="grid min-w-0 flex-1 grid-cols-12 gap-x-1">
          {monthly.map((v, i) => {
            const hit = reel && v > 0; // no imported réel for a future year — dots only
            const planned = plannedSet.has(i);
            return (
              <span
                key={i}
                className={
                  "rounded py-1 text-center text-sm tabular-nums " +
                  (planned ? "bg-primary/[0.10] " : "") +
                  (hit ? "text-foreground/75" : "text-muted-foreground/25")
                }
              >
                {hit ? eur(Math.round(v)) : "·"}
              </span>
            );
          })}
        </div>
      </div>

      {/* RIGHT — status (no réel yet for a future year) */}
      <div className={Z.right + " py-2 pr-3"}>
        {reel ? (
          <>
            <span className={Z.reel + " flex flex-col items-end leading-tight"}>
              <span className="text-sm tabular-nums text-foreground/70">{eur(realYear)}</span>
              <span className="text-2xs tabular-nums text-muted-foreground/60">
                méd. {eur(realMedian)}
              </span>
            </span>
            <span className={Z.ecart}>
              <span
                className={
                  "inline-block rounded-md px-1.5 py-0.5 text-xs font-semibold tabular-nums " +
                  ecartCls
                }
              >
                {auBesoin ? "—" : (ecart >= 0 ? "+" : "−") + eur(Math.abs(ecart))}
              </span>
            </span>
          </>
        ) : (
          <span className="flex-1 text-right text-xs italic text-muted-foreground/50">à venir</span>
        )}
      </div>
    </button>
  );
}

/* ---------- Mobile row (compact) ---------- */

function MobileRow({
  poste,
  onEdit,
  reel = true,
}: {
  poste: PlanPoste;
  onEdit?: () => void;
  reel?: boolean;
}) {
  const realYear = planReelYear(poste);
  const realMedian = planReelMedian(poste);
  const prevu = poste.recurrence === "Ponctuel" ? planPosteYear(poste) : poste.amount;
  const prevuYear = planPosteYear(poste);
  const ecart = realYear - prevuYear;
  const pct = prevuYear > 0 ? Math.round((ecart / prevuYear) * 100) : 0;
  const auBesoin = poste.recurrence === "Au besoin";
  const ponctuel = poste.recurrence === "Ponctuel";
  const hasEcheance = poste.recurrence === "Trimestrielle" || poste.recurrence === "Annuelle";
  const mazout = poste.sensor === "mazout";
  const goodOver = planKindOf(poste) !== "depense";
  const sev = Math.abs(pct) < 5 ? "flat" : ecart > 0 ? "over" : "under";
  const good = "text-success bg-success/10";
  const bad = "text-warm bg-warm/10";
  const ecartCls = auBesoin
    ? "text-muted-foreground bg-secondary/60"
    : sev === "over"
      ? goodOver
        ? good
        : bad
      : sev === "under"
        ? goodOver
          ? bad
          : good
        : "text-muted-foreground bg-secondary/60";

  return (
    <button
      onClick={onEdit}
      disabled={!onEdit}
      className={
        "flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left transition-colors " +
        (onEdit ? "active:bg-secondary/30" : "cursor-default")
      }
    >
      <div className="min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="truncate text-sm">{poste.label}</span>
          {mazout && <Fuel className="h-3 w-3 shrink-0 text-warm" />}
        </div>
        <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="rounded-full bg-secondary/70 px-1.5 py-0.5 text-2xs">
            {recShort(poste.recurrence)}
          </span>
          {ponctuel ? (
            <span>
              {(poste.occurrences ?? [])
                .map((o) => MONTHS_FR[o.m].slice(0, 3).toLowerCase())
                .join(" · ")}
            </span>
          ) : (
            hasEcheance && <span>éch. {MONTHS_FR[poste.months[0] ?? 0]}</span>
          )}
        </div>
      </div>
      <div className="shrink-0 text-right">
        <div className="text-sm tabular-nums">
          {eur(prevu)}
          <span className="ml-0.5 text-2xs text-muted-foreground">prévu</span>
        </div>
        {reel ? (
          <div className="mt-1 flex items-center justify-end gap-1.5">
            <span className="text-xs tabular-nums text-muted-foreground">
              réel {eur(realYear)} · méd. {eur(realMedian)}
            </span>
            <span
              className={"rounded-md px-1.5 py-0.5 text-2xs font-semibold tabular-nums " + ecartCls}
            >
              {auBesoin ? "—" : (ecart >= 0 ? "+" : "−") + eur(Math.abs(ecart))}
            </span>
          </div>
        ) : (
          <div className="mt-1 text-xs italic text-muted-foreground/50">à venir</div>
        )}
      </div>
    </button>
  );
}

/* ---------- Prévu vs réel — 3-series comparison (plan · année en cours · année passée) ---------- */

function PrevuReelCompare({ poste, year }: { poste: PlanPoste; year: number }) {
  const prevu = prevuMonthly(poste);
  const reelN = posteMonthly(poste);
  const prevPoste = planPostePrevYear(poste, year);
  const reelP = prevPoste ? posteMonthly(prevPoste) : new Array(12).fill(0);
  const planned = (i: number) =>
    poste.recurrence === "Mensuelle"
      ? true
      : poste.recurrence === "Au besoin"
        ? false
        : poste.months.includes(i);

  const row = (label: string, values: number[], cls: string) => (
    <div className="flex items-center">
      <span className={"w-12 shrink-0 pr-2 text-right text-xs " + cls}>{label}</span>
      <div className="grid min-w-[540px] flex-1 grid-cols-12 gap-1">
        {values.map((v, i) => (
          <span
            key={i}
            className={
              "rounded py-1 text-center text-xs tabular-nums " +
              (planned(i) ? "bg-primary/[0.10] " : "") +
              (v > 0 ? cls : "text-muted-foreground/20")
            }
          >
            {v > 0 ? eur(Math.round(v)) : "·"}
          </span>
        ))}
      </div>
    </div>
  );

  return (
    <div>
      <Eyebrow size="xs" as="span" className="mb-1.5 block">
        Prévu vs réel · 12 mois
      </Eyebrow>
      <div className="overflow-x-auto rounded-xl border border-border/40 bg-card/40 p-2 [scrollbar-width:thin]">
        <div className="space-y-1">
          {/* Month letters */}
          <div className="flex items-center">
            <span className="w-12 shrink-0" />
            <div className="grid min-w-[540px] flex-1 grid-cols-12 gap-1">
              {MONTHS_FR.map((m, i) => (
                <span key={i} className="text-center text-2xs uppercase text-muted-foreground/50">
                  {m[0]}
                </span>
              ))}
            </div>
          </div>
          {row("prévu", prevu, "text-primary")}
          {row(String(year), reelN, "font-semibold text-foreground/80")}
          {row(String(year - 1), reelP, "text-muted-foreground/50")}
        </div>
      </div>
    </div>
  );
}

/* ---------- Edit modal ---------- */

function EditModal({
  poste,
  onClose,
  onPatch,
  reel = true,
  year,
}: {
  poste: PlanPoste | null;
  onClose: () => void;
  onPatch: (id: string, p: Partial<PlanPoste>) => void;
  reel?: boolean;
  year: number;
}) {
  const ponctuel = poste ? poste.recurrence === "Ponctuel" : false;
  // Only Trimestrielle & Annuelle carry a single anchor month. Au besoin has no schedule.
  const nonMensuel = poste
    ? poste.recurrence === "Trimestrielle" || poste.recurrence === "Annuelle"
    : false;

  // Occurrence edits touch both the list and the mirror `months` (drives strip tinting), sorted.
  function setOccs(occs: PlanOccurrence[]) {
    if (!poste) return;
    const sorted = [...occs].sort((a, b) => a.m - b.m);
    onPatch(poste.id, { occurrences: sorted, months: sorted.map((o) => o.m) });
  }

  return (
    <Dialog
      open={!!poste}
      onOpenChange={(o) => {
        if (!o) onClose();
      }}
    >
      {poste && (
        <DialogContent
          className="sm:max-w-3xl max-h-[calc(100dvh-6rem)]"
          title={poste.label}
          subline={`${poste.cat} › ${poste.group}`}
        >
          <div className="min-w-0 space-y-4">
            {/* Fields — Ponctuel drops the single amount for a dated occurrence list */}
            <div className="grid grid-cols-2 gap-3">
              <div className={ponctuel ? "col-span-2 block" : "block"}>
                <Eyebrow size="xs" as="span" className="mb-1 block">
                  Fréquence
                </Eyebrow>
                <Select
                  value={poste.recurrence}
                  onValueChange={(v) => {
                    const rec = v as PlanRecurrence;
                    if (rec === "Ponctuel") {
                      const seed = poste.occurrences ?? [
                        { m: poste.months[0] ?? 0, amount: poste.amount || 0 },
                      ];
                      onPatch(poste.id, {
                        recurrence: rec,
                        occurrences: seed,
                        months: seed.map((o) => o.m),
                      });
                    } else {
                      const amount =
                        ponctuel && poste.occurrences?.length
                          ? poste.occurrences[0].amount
                          : poste.amount;
                      onPatch(poste.id, {
                        recurrence: rec,
                        months: defaultMonthsFor(rec, poste.months[0] ?? 0),
                        occurrences: undefined,
                        amount,
                      });
                    }
                  }}
                >
                  <SelectTrigger aria-label="Fréquence" className="w-full bg-card">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {RECS.map((r) => (
                      <SelectItem key={r} value={r}>
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {!ponctuel && (
                <label className="block">
                  <Eyebrow size="xs" as="span" className="mb-1 block">
                    Montant prévu
                  </Eyebrow>
                  <div className="flex items-center rounded-lg border border-border/60 bg-card px-2.5 py-2 focus-within:border-foreground/40">
                    <input
                      type="number"
                      value={poste.amount}
                      onChange={(e) =>
                        onPatch(poste.id, { amount: Math.max(0, Number(e.target.value) || 0) })
                      }
                      className="w-full bg-transparent text-sm tabular-nums outline-none"
                    />
                    <span className="text-sm text-muted-foreground">€</span>
                  </div>
                </label>
              )}
              {nonMensuel && (
                <div className="block">
                  <Eyebrow size="xs" as="span" className="mb-1 block">
                    Mois d'échéance
                  </Eyebrow>
                  <Select
                    value={String(poste.months[0] ?? 0)}
                    onValueChange={(v) =>
                      onPatch(poste.id, {
                        months: defaultMonthsFor(poste.recurrence as Recurrence4, Number(v)),
                      })
                    }
                  >
                    <SelectTrigger aria-label="Mois d'échéance" className="w-full bg-card">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MONTHS_FR.map((m, i) => (
                        <SelectItem key={i} value={String(i)}>
                          {m}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            {/* Occurrence editor — dated, per-hit amounts (pécule mai · 13e déc) */}
            {ponctuel && (
              <Card variant="inset" as="div" padding="sm">
                <div className="mb-2 flex items-center justify-between">
                  <Eyebrow size="xs" as="span">
                    Échéances
                  </Eyebrow>
                  <span className="text-xs tabular-nums text-muted-foreground">
                    total {eur(planPosteYear(poste))}/an
                  </span>
                </div>
                <div className="space-y-2">
                  {(poste.occurrences ?? []).map((o, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Select
                        value={String(o.m)}
                        onValueChange={(v) =>
                          setOccs(
                            (poste.occurrences ?? []).map((x, j) =>
                              j === i ? { ...x, m: Number(v) } : x,
                            ),
                          )
                        }
                      >
                        <SelectTrigger
                          aria-label="Mois de l'échéance"
                          className="w-32 shrink-0 bg-card"
                        >
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {MONTHS_FR.map((m, k) => (
                            <SelectItem key={k} value={String(k)}>
                              {m}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className="flex min-w-0 flex-1 items-center rounded-lg border border-border/60 bg-card px-2.5 py-2 focus-within:border-foreground/40">
                        <input
                          type="number"
                          value={o.amount}
                          onChange={(e) =>
                            setOccs(
                              (poste.occurrences ?? []).map((x, j) =>
                                j === i
                                  ? { ...x, amount: Math.max(0, Number(e.target.value) || 0) }
                                  : x,
                              ),
                            )
                          }
                          className="w-full bg-transparent text-sm tabular-nums outline-none"
                        />
                        <span className="text-sm text-muted-foreground">€</span>
                      </div>
                      <button
                        type="button"
                        aria-label="Retirer l'échéance"
                        onClick={() => setOccs((poste.occurrences ?? []).filter((_, j) => j !== i))}
                        className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-border/60 text-muted-foreground hover:bg-secondary hover:text-foreground"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setOccs([...(poste.occurrences ?? []), { m: 0, amount: 0 }])}
                  className="mt-2 flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs text-primary hover:bg-primary/10"
                >
                  <Plus className="h-3.5 w-3.5" /> Ajouter une échéance
                </button>
              </Card>
            )}

            {/* Prévu vs réel — 3 séries: le plan, l'année en cours, l'année passée. */}
            {reel ? (
              <PrevuReelCompare poste={poste} year={year} />
            ) : (
              <p className="rounded-xl border border-dashed border-border/50 bg-card/40 px-3 py-4 text-center text-xs italic text-muted-foreground/60">
                Aucun réel importé — cette année n'a pas encore commencé.
              </p>
            )}

            {poste.sensor === "mazout" && (
              <p className="flex items-start gap-1.5 rounded-lg bg-warm/5 px-3 py-2 text-xs text-warm">
                <Fuel className="mt-0.5 h-3 w-3 shrink-0" />
                Cuve à {energie.oil.tankPct}% — un plein approche (~
                {energie.oil.tankCapacity - energie.oil.tankLiters} L). Ajuste l'échéance en
                conséquence.
              </p>
            )}
          </div>
        </DialogContent>
      )}
    </Dialog>
  );
}
