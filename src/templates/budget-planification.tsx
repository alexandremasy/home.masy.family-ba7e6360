import { useState, type ReactNode } from "react";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Coins,
  Fuel,
  Loader2,
  Lock,
  PencilRuler,
  Plus,
  TriangleAlert,
  X,
} from "lucide-react";
import { CountUp } from "@/components/count-up";
import { Dialog, DialogContent } from "@/components/dialog";
import { MONTHS_FR, eur } from "@/lib/budget-data";
import { Button } from "@/components/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/select";
import { Eyebrow } from "@/components/eyebrow";
import { Card } from "@/components/card";
import { DataState } from "@/components/data-state";

/* ─────────────────────────────────────────────────────────────────────────────
   The plan workshop, as a page.

   Its props are its OWN shapes, and they keep apart what the two sides keep
   apart: a ROW is what a poste looks like once everything is computed — the
   figures, the tints, the flags — and an EDIT is the handful of fields a form
   changes. The mockup mutates one object and recomputes; the api computes the
   row server-side and takes the edit back as a plan item. Neither model reaches
   this file, which is what lets it show both.

   Nothing here is derived from an amount: the écart's colour arrives as a tone,
   the frequency as a worded chip, "—" as a null. Deciding that over prévu is
   good for an income and bad for a spend is domain knowledge, and it belongs
   with whoever owns the domain.
   ──────────────────────────────────────────────────────────────────────────── */

export type PlanFamilyKind = "income" | "expense" | "saving";

/** One poste, fully computed. */
export interface PlanRowView {
  /** Opaque row identity, handed back when it is opened. */
  key: string;
  label: string;
  /** The cadence chip, already worded. Absent when the poste is not in the plan. */
  frequency?: string;
  /** Planned amount at its cadence. `null` prints "—". */
  prevu: number | null;
  /** Twelve months of real spend. */
  monthly: number[];
  /** Month indices the plan covers — they get the tinted background. */
  plannedMonths: number[];
  /** Real total over the year. `null` prints "—". */
  reelYear: number | null;
  /** Median of the months it lands on. `null` hides the line. */
  reelMedian: number | null;
  /** Real minus planned. `null` prints "—" (no plan to compare against). */
  ecart: number | null;
  /** How the écart reads. The caller decides — over is bad for a spend, good for an income. */
  tone: "good" | "bad" | "flat";
  /** Real spend with no plan line behind it. */
  offPlan?: boolean;
  /** Carries a flag icon — a poste tied to something physical, like the oil tank. */
  flagged?: boolean;
  /** Mobile only: when it falls due, already worded. */
  scheduleLabel?: string;
}

/** A block of rows under one sticky header. */
export interface PlanGroupView {
  key: string;
  title: string;
  rows: PlanRowView[];
}

/** One category of the tree. */
export interface PlanCategoryView {
  key: string;
  label: string;
  kind: PlanFamilyKind;
  icon?: ReactNode;
  groups: PlanGroupView[];
}

/** The year's equilibrium, as the boxes read it. */
export interface PlanCascadeView {
  entrees: number;
  depenses: number;
  epargne: number;
  marge: number;
  /** What the non-monthly bills cost per month, set aside. */
  provision: number;
  /** What stays outside the plan entirely. */
  auBesoin: number;
}

/** What the modal edits — the fields a form owns, nothing computed. */
export interface PlanEditView {
  title: string;
  subtitle?: string;
  recurrence: string;
  amount: number;
  months: number[];
  occurrences?: { m: number; amount: number }[] | null;
  /** The three series of the 12-month comparison. Absent renders the "not started" note. */
  compare?: { prevu: number[]; current: number[]; previous: number[] } | null;
  /** Month indices the plan covers, for the comparison's tinting. */
  plannedMonths: number[];
  /** Anything worth saying about this poste — the oil tank's level, typically. */
  note?: ReactNode;
}

export interface PlanificationTemplateProps {
  year: number;
  /** Bounds for the year arrows. */
  minYear: number;
  maxYear: number;
  onYearChange: (year: number) => void;
  /** A past year: consulted, never rewritten. */
  archive: boolean;
  /** A future year: next year's plan, prepared before it starts. */
  preparing: boolean;
  /** Are rows clickable — a year that can still be planned. */
  editable: boolean;
  /** Is there imported réel to show. A future year has none. */
  showReal: boolean;
  /** Auto-save indicator. Omit when nothing is persisted. */
  saveStatus?: "saved" | "saving" | "error";
  cascade?: PlanCascadeView;
  categories: PlanCategoryView[];
  /** The cadences the modal offers. */
  recurrences: string[];
  /** The poste being edited, or nothing. */
  edit: PlanEditView | null;
  onOpenRow: (rowKey: string) => void;
  onCloseEdit: () => void;
  /**
   * A field changed — only the changed ones are sent, and the caller finishes the
   * job. `months` carries the ANCHOR the reader picked, not the schedule: turning
   * one anchor into four quarterly hits, or seeding occurrences when the cadence
   * becomes Ponctuel, is what a cadence MEANS, and that is domain knowledge.
   */
  onPatchEdit: (
    patch: Partial<Pick<PlanEditView, "recurrence" | "amount" | "months" | "occurrences">>,
  ) => void;
  /** The plan is still on its way. */
  loading?: boolean;
  /** It could not be loaded. */
  error?: boolean;
  onRetry?: () => void;
}

// The three families — the top-level separation (Entrées · Sorties · Épargne).
const FAMILIES: { kind: PlanFamilyKind; label: string; accent: string }[] = [
  { kind: "income", label: "Entrées", accent: "text-success" },
  { kind: "expense", label: "Sorties", accent: "text-foreground/70" },
  { kind: "saving", label: "Épargne", accent: "text-primary" },
];

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

const toneClasses = (tone: PlanRowView["tone"]) =>
  tone === "good"
    ? "text-success bg-success/10"
    : tone === "bad"
      ? "text-warm bg-warm/10"
      : "text-muted-foreground bg-secondary/60";

export function PlanificationTemplate({
  year,
  minYear,
  maxYear,
  onYearChange,
  archive,
  preparing,
  editable,
  showReal,
  saveStatus,
  cascade,
  categories,
  recurrences,
  edit,
  onOpenRow,
  onCloseEdit,
  onPatchEdit,
  loading = false,
  error = false,
  onRetry,
}: PlanificationTemplateProps) {
  // Jump to a family's zone from the equilibrium boxes — scrolls the currently visible tree
  // (desktop or mobile), skipping the display:none one.
  const jumpTo = (kind: PlanFamilyKind) => {
    document.querySelectorAll<HTMLElement>(`[data-zone="${kind}"]`).forEach((el) => {
      if (el.offsetParent !== null) el.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  return (
    <div className="space-y-6 anim-slide-up sm:space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <Eyebrow size="xs">Budget · Planification</Eyebrow>
          <h1 className="mt-1 text-xl tracking-tight sm:text-4xl">L'atelier des budgets</h1>
        </div>
        <div className="flex items-center gap-3">
          {saveStatus && editable && <SaveStatus status={saveStatus} />}
          {archive && (
            <Eyebrow
              size="xs"
              as="span"
              className="flex items-center gap-1.5 rounded-full border border-border/60 bg-secondary/40 px-2.5 py-1"
            >
              <Lock className="h-3 w-3" /> Archive · lecture seule
            </Eyebrow>
          )}
          {preparing && (
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
              onClick={() => onYearChange(Math.max(minYear, year - 1))}
              disabled={year <= minYear}
              aria-label="Année précédente"
              variant="outline"
              size="iconRound"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="w-12 text-center text-lg tabular-nums">{year}</span>
            <Button
              onClick={() => onYearChange(Math.min(maxYear, year + 1))}
              disabled={year >= maxYear}
              aria-label="Année suivante"
              variant="outline"
              size="iconRound"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {loading || error ? (
        <DataState status={error ? "error" : "loading"} label="le plan" onRetry={onRetry} />
      ) : (
        <>
          {cascade && <Cascade c={cascade} onJump={jumpTo} />}

          {/* Desktop — aligned 3-zone table */}
          <div className="hidden lg:block">
            <div className="min-w-[940px] space-y-10">
              {FAMILIES.map((fam) => {
                const cats = categories.filter((c) => c.kind === fam.kind);
                if (!cats.length) return null;
                const single = fam.kind !== "expense";
                return (
                  <div key={fam.kind} data-zone={fam.kind} className="scroll-mt-24 space-y-4">
                    <FamilyDivider label={fam.label} accent={fam.accent} />
                    {cats.map((cat) => (
                      <div key={cat.key} className={single ? "" : "pt-5"}>
                        {!single && (
                          <div className="mb-3 flex items-center gap-2.5 px-1">
                            <span className="grid h-8 w-8 place-items-center rounded-full bg-secondary text-foreground/70">
                              {cat.icon}
                            </span>
                            <h2 className="text-lg tracking-tight">{cat.label}</h2>
                          </div>
                        )}
                        <div className="space-y-3">
                          {cat.groups.map((group) => (
                            <div key={group.key}>
                              {/* Sticky sub-category header — carries the column labels */}
                              <div className="sticky top-[var(--nav-h)] z-10 flex items-stretch overflow-hidden rounded-t-xl border border-border/60 bg-card/95 shadow-soft backdrop-blur">
                                <div className={Z.left + " py-2 pl-3"}>
                                  <span
                                    className={
                                      Z.poste +
                                      " text-xs font-semibold uppercase tracking-eyebrow text-foreground/80 truncate"
                                    }
                                  >
                                    {group.title}
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
                                {group.rows.map((row) => (
                                  <PosteRow
                                    key={row.key}
                                    row={row}
                                    reel={showReal}
                                    onEdit={editable ? () => onOpenRow(row.key) : undefined}
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
              const cats = categories.filter((c) => c.kind === fam.kind);
              if (!cats.length) return null;
              const single = fam.kind !== "expense";
              return (
                <div key={fam.kind} data-zone={fam.kind} className="scroll-mt-20 space-y-3">
                  <FamilyDivider label={fam.label} accent={fam.accent} />
                  {cats.map((cat) => (
                    <div key={cat.key} className={single ? "" : "pt-4"}>
                      {!single && (
                        <div className="mb-3 flex items-center gap-2.5 px-1">
                          <span className="grid h-8 w-8 place-items-center rounded-full bg-secondary text-foreground/70">
                            {cat.icon}
                          </span>
                          <h2 className="text-lg tracking-tight">{cat.label}</h2>
                        </div>
                      )}
                      {cat.groups.map((group) => (
                        <div
                          key={group.key}
                          className="mb-3 overflow-hidden rounded-xl border border-border/50 bg-card"
                        >
                          {group.title !== cat.label && (
                            <Eyebrow
                              tone="current"
                              size="xs"
                              className="border-b border-border/40 bg-secondary/20 px-3 py-1.5 text-muted-foreground/70"
                            >
                              {group.title}
                            </Eyebrow>
                          )}
                          <div className="divide-y divide-border/30">
                            {group.rows.map((row) => (
                              <MobileRow
                                key={row.key}
                                row={row}
                                reel={showReal}
                                onEdit={editable ? () => onOpenRow(row.key) : undefined}
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
        </>
      )}

      <EditModal
        edit={edit}
        year={year}
        recurrences={recurrences}
        onClose={onCloseEdit}
        onPatch={onPatchEdit}
      />
    </div>
  );
}

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

/* ---------- Auto-save status ---------- */

function SaveStatus({ status }: { status: "saved" | "saving" | "error" }) {
  const base = "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs";
  if (status === "saving")
    return (
      <span className={base + " text-muted-foreground"}>
        <Loader2 className="h-3.5 w-3.5 animate-spin" /> Enregistrement…
      </span>
    );
  if (status === "error")
    return (
      <span className={base + " text-warm"}>
        <TriangleAlert className="h-3.5 w-3.5" /> Non enregistré
      </span>
    );
  return (
    <span className={base + " text-muted-foreground/70"}>
      <Check className="h-3.5 w-3.5 text-success" /> Enregistré
    </span>
  );
}

/* ---------- Cascade ---------- */

function Cascade({ c, onJump }: { c: PlanCascadeView; onJump: (k: PlanFamilyKind) => void }) {
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
          onClick={() => onJump("income")}
        />
        <Op sign="−" />
        <Bucket
          label="Dépenses"
          value={c.depenses}
          tint="text-foreground"
          onClick={() => onJump("expense")}
        />
        <Op sign="−" />
        <Bucket
          label="Épargne (cibles)"
          value={c.epargne}
          tint="text-primary"
          onClick={() => onJump("saving")}
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
          onClick={() => onJump("income")}
        />
        <Bucket
          label="Dépenses"
          value={c.depenses}
          tint="text-foreground"
          onClick={() => onJump("expense")}
        />
        <Bucket
          label="Épargne (cibles)"
          value={c.epargne}
          tint="text-primary"
          onClick={() => onJump("saving")}
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
  row,
  onEdit,
  reel = true,
}: {
  row: PlanRowView;
  onEdit?: () => void;
  reel?: boolean;
}) {
  const planned = new Set(row.plannedMonths);
  return (
    <button
      onClick={onEdit}
      disabled={!onEdit}
      className={
        "group flex w-full items-stretch text-left transition-colors " +
        (onEdit ? "hover:bg-secondary/25 " : "cursor-default ") +
        (row.offPlan ? "opacity-70" : "")
      }
    >
      {/* LEFT — plan */}
      <div className={Z.left + " py-2 pl-3"}>
        <span className={Z.poste + " flex items-center gap-1.5"}>
          <span className="truncate text-sm">{row.label}</span>
          {row.flagged && <Fuel className="h-3 w-3 shrink-0 text-warm" />}
          {row.offPlan && (
            <span className="shrink-0 rounded-full bg-secondary/70 px-1 text-2xs uppercase text-muted-foreground">
              hors plan
            </span>
          )}
        </span>
        <span className={Z.freq}>
          {row.frequency && (
            <span className="rounded-full bg-secondary/70 px-1.5 py-0.5 text-2xs text-muted-foreground">
              {row.frequency}
            </span>
          )}
        </span>
        <span className={Z.prevu + " text-sm tabular-nums"}>
          {row.prevu != null ? eur(row.prevu) : "—"}
        </span>
      </div>

      {/* CENTER — the year */}
      <div className={Z.center + " py-2"}>
        <div className="grid min-w-0 flex-1 grid-cols-12 gap-x-1">
          {row.monthly.map((v, i) => {
            const hit = reel && v > 0; // no imported réel for a future year → dots only
            return (
              <span
                key={i}
                className={
                  "rounded py-1 text-center text-sm tabular-nums " +
                  (planned.has(i) ? "bg-primary/[0.10] " : "") +
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
              <span className="text-sm tabular-nums text-foreground/70">
                {row.reelYear != null ? eur(row.reelYear) : "—"}
              </span>
              {row.reelMedian != null && (
                <span className="text-2xs tabular-nums text-muted-foreground/60">
                  méd. {eur(row.reelMedian)}
                </span>
              )}
            </span>
            <span className={Z.ecart}>
              <span
                className={
                  "inline-block rounded-md px-1.5 py-0.5 text-xs font-semibold tabular-nums " +
                  toneClasses(row.tone)
                }
              >
                {row.ecart != null ? (row.ecart >= 0 ? "+" : "−") + eur(Math.abs(row.ecart)) : "—"}
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
  row,
  onEdit,
  reel = true,
}: {
  row: PlanRowView;
  onEdit?: () => void;
  reel?: boolean;
}) {
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
          <span className="truncate text-sm">{row.label}</span>
          {row.flagged && <Fuel className="h-3 w-3 shrink-0 text-warm" />}
          {row.offPlan && (
            <span className="shrink-0 rounded-full bg-secondary/70 px-1 text-2xs uppercase text-muted-foreground">
              hors plan
            </span>
          )}
        </div>
        <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
          {row.frequency && (
            <span className="rounded-full bg-secondary/70 px-1.5 py-0.5 text-2xs">
              {row.frequency}
            </span>
          )}
          {row.scheduleLabel && <span>{row.scheduleLabel}</span>}
        </div>
      </div>
      <div className="shrink-0 text-right">
        <div className="text-sm tabular-nums">
          {row.prevu != null ? eur(row.prevu) : "—"}
          <span className="ml-0.5 text-2xs text-muted-foreground">prévu</span>
        </div>
        {reel ? (
          <div className="mt-1 flex items-center justify-end gap-1.5">
            <span className="text-xs tabular-nums text-muted-foreground">
              réel {row.reelYear != null ? eur(row.reelYear) : "—"}
              {row.reelMedian != null && <> · méd. {eur(row.reelMedian)}</>}
            </span>
            <span
              className={
                "rounded-md px-1.5 py-0.5 text-2xs font-semibold tabular-nums " +
                toneClasses(row.tone)
              }
            >
              {row.ecart != null ? (row.ecart >= 0 ? "+" : "−") + eur(Math.abs(row.ecart)) : "—"}
            </span>
          </div>
        ) : (
          <div className="mt-1 text-xs italic text-muted-foreground/50">à venir</div>
        )}
      </div>
    </button>
  );
}

/* ---------- Prévu vs réel — 3-series comparison (plan · année N · année N-1) ---------- */

function PrevuReelCompare({
  compare,
  plannedMonths,
  year,
}: {
  compare: NonNullable<PlanEditView["compare"]>;
  plannedMonths: number[];
  year: number;
}) {
  const planned = new Set(plannedMonths);
  const row = (label: string, values: number[], cls: string) => (
    <div className="flex items-center">
      <span className={"w-12 shrink-0 pr-2 text-right text-xs " + cls}>{label}</span>
      <div className="grid min-w-[540px] flex-1 grid-cols-12 gap-1">
        {values.map((v, i) => (
          <span
            key={i}
            className={
              "rounded py-1 text-center text-xs tabular-nums " +
              (planned.has(i) ? "bg-primary/[0.10] " : "") +
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
          {row("prévu", compare.prevu, "text-primary")}
          {row(String(year), compare.current, "font-semibold text-foreground/80")}
          {row(String(year - 1), compare.previous, "text-muted-foreground/50")}
        </div>
      </div>
    </div>
  );
}

/* ---------- Edit modal ---------- */

function EditModal({
  edit,
  year,
  recurrences,
  onClose,
  onPatch,
}: {
  edit: PlanEditView | null;
  year: number;
  recurrences: string[];
  onClose: () => void;
  onPatch: PlanificationTemplateProps["onPatchEdit"];
}) {
  const ponctuel = edit?.recurrence === "Ponctuel";
  // Only Trimestrielle & Annuelle carry a single anchor month. Au besoin has no schedule.
  const nonMensuel =
    edit?.recurrence === "Trimestrielle" || edit?.recurrence === "Annuelle" || false;
  const occs = edit?.occurrences ?? [];
  // Occurrence edits touch both the list and the mirror `months` (drives strip tinting), sorted.
  const setOccs = (next: { m: number; amount: number }[]) => {
    const sorted = [...next].sort((a, b) => a.m - b.m);
    onPatch({ occurrences: sorted, months: sorted.map((o) => o.m) });
  };

  return (
    <Dialog
      open={!!edit}
      onOpenChange={(o) => {
        if (!o) onClose();
      }}
    >
      {edit && (
        <DialogContent
          className="sm:max-w-3xl max-h-[calc(100dvh-6rem)] overflow-y-auto"
          title={edit.title}
          subline={edit.subtitle}
        >
          <div className="min-w-0 space-y-4">
            {/* Fields — Ponctuel drops the single amount for a dated occurrence list */}
            <div className="grid grid-cols-2 gap-3">
              <div className={ponctuel ? "col-span-2 block" : "block"}>
                <Eyebrow size="xs" as="span" className="mb-1 block">
                  Fréquence
                </Eyebrow>
                <Select value={edit.recurrence} onValueChange={(v) => onPatch({ recurrence: v })}>
                  <SelectTrigger aria-label="Fréquence" className="w-full bg-card">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {recurrences.map((r) => (
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
                      value={edit.amount}
                      onChange={(e) =>
                        onPatch({ amount: Math.max(0, Number(e.target.value) || 0) })
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
                    value={String(edit.months[0] ?? 0)}
                    onValueChange={(v) => onPatch({ months: [Number(v)] })}
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
                    total {eur(occs.reduce((s, o) => s + o.amount, 0))}/an
                  </span>
                </div>
                <div className="space-y-2">
                  {occs.map((o, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Select
                        value={String(o.m)}
                        onValueChange={(v) =>
                          setOccs(occs.map((x, j) => (j === i ? { ...x, m: Number(v) } : x)))
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
                              occs.map((x, j) =>
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
                        onClick={() => setOccs(occs.filter((_, j) => j !== i))}
                        className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-border/60 text-muted-foreground hover:bg-secondary hover:text-foreground"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setOccs([...occs, { m: 0, amount: 0 }])}
                  className="mt-2 flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs text-primary hover:bg-primary/10"
                >
                  <Plus className="h-3.5 w-3.5" /> Ajouter une échéance
                </button>
              </Card>
            )}

            {/* Prévu vs réel — 3 séries: le plan, l'année en cours, l'année passée. */}
            {edit.compare ? (
              <PrevuReelCompare
                compare={edit.compare}
                plannedMonths={edit.plannedMonths}
                year={year}
              />
            ) : (
              <p className="rounded-xl border border-dashed border-border/50 bg-card/40 px-3 py-4 text-center text-xs italic text-muted-foreground/60">
                Aucun réel importé — cette année n'a pas encore commencé.
              </p>
            )}

            {edit.note && (
              <p className="flex items-start gap-1.5 rounded-lg bg-warm/5 px-3 py-2 text-xs text-warm">
                <Fuel className="mt-0.5 h-3 w-3 shrink-0" />
                {edit.note}
              </p>
            )}
          </div>
        </DialogContent>
      )}
    </Dialog>
  );
}
