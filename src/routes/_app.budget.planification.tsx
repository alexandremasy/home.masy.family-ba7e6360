import { createFileRoute } from "@tanstack/react-router";
import { createElement, useMemo, useState } from "react";
import {
  PlanificationTemplate,
  type PlanCategoryView,
  type PlanEditView,
  type PlanFamilyKind,
  type PlanRowView,
} from "@/templates/budget-planification";
import {
  MONTHS_FR,
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
  type PlanKind,
  type Recurrence4,
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

const catKindOf = (cat: string): PlanKind =>
  PLAN_CATS.find((c) => c.cat === cat)?.kind ?? "depense";
/** The mock's three families, in the template's words. */
const FAMILY: Record<PlanKind, PlanFamilyKind> = {
  entree: "income",
  depense: "expense",
  epargne: "saving",
};

/**
 * The page is the template; this file only pretends to be a backend.
 *
 * Everything the row shows is computed here — the year's total, the median, the
 * écart and, crucially, whether that écart reads good or bad (over prévu is bad
 * for a spend, good for an income). The api does the same server-side. The page
 * receives a tone and prints it.
 */
function PlanificationPage() {
  const [year, setYear] = useState(currentYear);
  // Editable plans live in state, keyed by year: the current year + next year's draft. Past
  // years are read-only archives, derived on the fly.
  const [plans, setPlans] = useState<Record<number, PlanPoste[]>>(() => ({
    [currentYear]: planPostesSeed,
    [currentYear + 1]: planPostesForYear(currentYear + 1),
  }));
  const [editingId, setEditingId] = useState<string | null>(null);

  const archive = year < currentYear; // consult, don't rewrite history
  const preparing = year > currentYear; // next year's plan, prepared before it starts
  const editable = !archive;
  const showReal = year <= currentYear; // a future year has no imported réel yet
  const displayed = editable ? (plans[year] ?? planPostesForYear(year)) : planPostesForYear(year);

  const cascade = useMemo(() => planCascade(displayed), [displayed]);

  const rowOf = (p: PlanPoste): PlanRowView => {
    const prevuYear = planPosteYear(p);
    const realYear = planReelYear(p);
    const ecart = realYear - prevuYear;
    const pct = prevuYear > 0 ? Math.round((ecart / prevuYear) * 100) : 0;
    const auBesoin = p.recurrence === "Au besoin";
    // Over prévu is BAD for dépenses (spent more), GOOD for entrées/épargne.
    const goodOver = planKindOf(p) !== "depense";
    const flat = Math.abs(pct) < 5;
    const ponctuel = p.recurrence === "Ponctuel";
    const hasEcheance = p.recurrence === "Trimestrielle" || p.recurrence === "Annuelle";
    return {
      key: p.id,
      label: p.label,
      frequency: recShort(p.recurrence),
      prevu: ponctuel ? prevuYear : p.amount,
      monthly: posteMonthly(p),
      // Tint the months the prévision covers: all 12 for Mensuelle, the occurrence
      // months for scheduled cadences, none for Au besoin (an envelope, not a date).
      plannedMonths:
        p.recurrence === "Mensuelle"
          ? [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
          : auBesoin
            ? []
            : p.months,
      reelYear: realYear,
      reelMedian: planReelMedian(p),
      ecart: auBesoin ? null : ecart,
      tone: auBesoin || flat ? "flat" : ecart > 0 === goodOver ? "good" : "bad",
      flagged: p.sensor === "mazout",
      scheduleLabel: ponctuel
        ? (p.occurrences ?? []).map((o) => MONTHS_FR[o.m].slice(0, 3).toLowerCase()).join(" · ")
        : hasEcheance
          ? `éch. ${MONTHS_FR[p.months[0] ?? 0]}`
          : undefined,
    };
  };

  const categories = useMemo<PlanCategoryView[]>(
    () =>
      PLAN_CATS.map(({ cat, icon }) => {
        const inCat = displayed.filter((p) => p.cat === cat);
        const groups: { key: string; title: string; rows: PlanRowView[] }[] = [];
        for (const p of inCat) {
          let g = groups.find((x) => x.title === p.group);
          if (!g) {
            g = { key: p.group, title: p.group, rows: [] };
            groups.push(g);
          }
          g.rows.push(rowOf(p));
        }
        return {
          key: cat,
          label: cat,
          kind: FAMILY[catKindOf(cat)],
          icon: createElement(icon, { className: "h-4 w-4" }),
          groups,
        };
      }).filter((c) => c.groups.length),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [displayed],
  );

  const editingPoste = editable ? (displayed.find((p) => p.id === editingId) ?? null) : null;

  const edit = useMemo<PlanEditView | null>(() => {
    const p = editingPoste;
    if (!p) return null;
    const prev = planPostePrevYear(p, year);
    return {
      title: p.label,
      subtitle: `${p.cat} › ${p.group}`,
      recurrence: p.recurrence,
      amount: p.amount,
      months: p.months,
      occurrences: p.occurrences,
      plannedMonths: p.recurrence === "Au besoin" ? [] : p.months,
      compare: showReal
        ? {
            prevu: prevuMonthly(p),
            current: posteMonthly(p),
            previous: prev ? posteMonthly(prev) : new Array(12).fill(0),
          }
        : null,
      note:
        p.sensor === "mazout" ? (
          <>
            Cuve à {energie.oil.tankPct}% — un plein approche (~
            {energie.oil.tankCapacity - energie.oil.tankLiters} L). Ajuste l'échéance en
            conséquence.
          </>
        ) : undefined,
    };
  }, [editingPoste, showReal, year]);

  /** A cadence decides its own schedule — the template only hands back the anchor. */
  function patchEdit(patch: {
    recurrence?: string;
    amount?: number;
    months?: number[];
    occurrences?: { m: number; amount: number }[] | null;
  }) {
    const p = editingPoste;
    if (!p) return;
    const next: Partial<PlanPoste> = {};
    if (patch.amount != null) next.amount = patch.amount;
    if (patch.occurrences) {
      next.occurrences = patch.occurrences;
      next.months = patch.occurrences.map((o) => o.m);
    }
    if (patch.months && !patch.occurrences) {
      next.months = defaultMonthsFor(p.recurrence as Recurrence4, patch.months[0] ?? 0);
    }
    if (patch.recurrence) {
      const rec = patch.recurrence as PlanRecurrence;
      next.recurrence = rec;
      if (rec === "Ponctuel") {
        const seed = p.occurrences ?? [{ m: p.months[0] ?? 0, amount: p.amount || 0 }];
        next.occurrences = seed;
        next.months = seed.map((o) => o.m);
      } else {
        next.occurrences = undefined;
        next.months = defaultMonthsFor(rec as Recurrence4, p.months[0] ?? 0);
        if (p.recurrence === "Ponctuel" && p.occurrences?.length) {
          next.amount = p.occurrences[0].amount;
        }
      }
    }
    setPlans((prev) => ({
      ...prev,
      [year]: (prev[year] ?? []).map((x) => (x.id === p.id ? { ...x, ...next } : x)),
    }));
  }

  return (
    <PlanificationTemplate
      year={year}
      minYear={PLAN_MIN_YEAR}
      maxYear={PLAN_MAX_YEAR}
      onYearChange={setYear}
      archive={archive}
      preparing={preparing}
      editable={editable}
      showReal={showReal}
      cascade={{
        entrees: cascade.entrees,
        depenses: cascade.depenses,
        epargne: cascade.epargne,
        marge: cascade.marge,
        provision: cascade.provision,
        auBesoin: cascade.auBesoin,
      }}
      categories={categories}
      recurrences={RECS}
      edit={edit}
      onOpenRow={setEditingId}
      onCloseEdit={() => setEditingId(null)}
      onPatchEdit={patchEdit}
    />
  );
}
