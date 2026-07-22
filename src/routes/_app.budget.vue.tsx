import { createFileRoute, Outlet } from "@tanstack/react-router";
import { createElement, useMemo, useState } from "react";
import {
  BudgetVueTemplate,
  type CategoryCardView,
  type FlowPointView,
  type LiquidityView,
  type MonthDetailView,
  type UpcomingBillView,
} from "@/templates/budget-vue";
import {
  categories,
  postesSeed,
  temporalState,
  currentMonthIdx,
  currentYear,
  incomeSources,
  annualisationProvision,
  annualVerdict,
  dataFreshness,
  viewTitle,
  flowsSeries,
  upcomingBills,
  nonMonthlyBills,
  categoryTrend12,
  categoryYoY,
  type BudgetView,
} from "@/lib/budget-data";

export const Route = createFileRoute("/_app/budget/vue")({
  component: VuePage,
  head: () => ({
    meta: [
      { title: "Vue d'ensemble — Budget" },
      {
        name: "description",
        content: "Trajectoire de l'année, échéances à venir et épargne — d'un coup d'œil.",
      },
    ],
  }),
});

// Navigator: rolling budget first (default), then calendar years going back.
const NAV_VIEWS: BudgetView[] = [
  "rolling",
  currentYear,
  currentYear - 1,
  currentYear - 2,
  currentYear - 3,
];

/**
 * The page is the template; this file only pretends to be a backend.
 *
 * Every judgement the page shows is measured here — the verdict's status, an
 * axis's tone, a bill's coverage — exactly as the api measures them server-side.
 * The template receives conclusions and draws them; it never decides whether the
 * year is going well.
 */
function VuePage() {
  const [navIdx, setNavIdx] = useState(0);
  const [zoom, setZoom] = useState<{ year: number; monthIdx: number } | null>(null);
  const view = NAV_VIEWS[navIdx];

  const verdict = useMemo(() => annualVerdict(view), [view]);
  const flows = useMemo<FlowPointView[]>(() => flowsSeries(view), [view]);
  const provision = annualisationProvision(postesSeed);
  const monthlyBudget = categories.reduce((s, c) => s + c.budget, 0);

  const upcoming = useMemo<UpcomingBillView[]>(
    () =>
      upcomingBills(12).map((b) => ({
        id: b.id,
        label: b.label,
        monthIdx: b.monthIdx,
        year: Math.floor((currentMonthIdx + b.monthsAway) / 12) + currentYear,
        amount: b.amount,
        monthsAway: b.monthsAway,
        coverage:
          b.coverage === "covered" ? "covered" : b.coverage === "partial" ? "partial" : "none",
        coveragePct: b.coveragePct,
      })),
    [],
  );

  // No forecast engine here — the first bill the provision cannot cover plays the
  // part, which is enough to feel what the callout is for.
  const liquidity = useMemo<LiquidityView>(() => {
    const short = upcoming.find((b) => b.coverage !== "covered" && b.monthsAway < 6);
    if (!short) return { coveredProvision: provision };
    return {
      tight: {
        year: short.year,
        monthIdx: short.monthIdx,
        bill: {
          label: short.label,
          amount: short.amount,
          shortfall: Math.round(short.amount * (1 - short.coveragePct / 100)),
        },
      },
    };
  }, [upcoming, provision]);

  const cards = useMemo<CategoryCardView[]>(
    () =>
      categories.map((c) => ({
        key: c.key,
        label: c.label,
        icon: createElement(c.icon, { className: "h-4 w-4" }),
        color: c.color,
        budget: c.budget,
        avgSpent: c.actual,
        yoy: categoryYoY(c),
        yoyLabel: `vs ${currentYear - 1}`,
        trend: categoryTrend12(c),
      })),
    [],
  );

  // What the zoomed month shows, in whichever of its three faces.
  const month = useMemo<MonthDetailView | undefined>(() => {
    if (!zoom) return undefined;
    const state = temporalState(zoom.monthIdx, zoom.year);
    const bills = nonMonthlyBills(postesSeed, zoom.monthIdx);
    const entrees = incomeSources.reduce((s, i) => s + i.value, 0);
    const catView = (scale = 1) =>
      categories.map((c) => ({
        key: c.key,
        label: c.label,
        icon: createElement(c.icon, { className: "h-4 w-4" }),
        actual: Math.round(c.actual * scale),
        budget: c.budget,
      }));

    if (state === "passe") {
      const spent = categories.reduce((s, c) => s + c.actual, 0);
      const planned = categories.reduce((s, c) => s + c.budget, 0);
      const delta = spent - planned;
      return {
        state,
        stats: [
          { label: "Entrées", value: entrees, tone: "primary" },
          { label: "Dépenses", value: spent, tone: "mustard" },
          {
            label: "Écart vs prévu",
            value: delta,
            tone: delta > 0 ? "warm" : "success",
            signed: true,
          },
        ],
        categories: catView(),
        bills,
      };
    }

    if (state === "en-cours") {
      const day = new Date().getDate();
      const total = new Date(currentYear, currentMonthIdx + 1, 0).getDate();
      const progress = day / total;
      return {
        state,
        stats: [
          { label: "Entrées", value: entrees, tone: "primary" },
          {
            label: "Déjà dépensé",
            value: Math.round(categories.reduce((s, c) => s + c.actual, 0) * progress),
            tone: "mustard",
            hint: `${Math.round(progress * 100)}% du mois`,
          },
          {
            label: "Encore prévu",
            value: Math.round(categories.reduce((s, c) => s + c.budget, 0) * (1 - progress)),
            tone: "primary",
            hint: "projection",
          },
        ],
        categories: catView(progress),
        progress: { day, total },
        bills,
      };
    }

    const ofMonth = postesSeed.filter((p) => p.months.includes(zoom.monthIdx));
    const prevuTotal = ofMonth.reduce((s, p) => s + p.amount, 0);
    const byCat = new Map<string, { label: string; total: number; postes: string[] }>();
    for (const p of ofMonth) {
      const cat = categories.find((c) => c.key === p.category);
      const label = cat?.label ?? p.category;
      const g = byCat.get(p.category) ?? { label, total: 0, postes: [] };
      g.total += p.amount;
      g.postes.push(p.label);
      byCat.set(p.category, g);
    }
    const byDay = Array.from({ length: 30 }, (_, i) => ({ d: i + 1, v: 0 }));
    ofMonth.forEach((p, i) => {
      byDay[(i * 7) % 28].v += p.amount;
    });
    return {
      state,
      stats: [
        { label: "Entrées prévues", value: entrees, tone: "primary", hint: "projection" },
        {
          label: "Dépenses prévues",
          value: prevuTotal,
          tone: "mustard",
          hint: `${ofMonth.length} postes`,
        },
        {
          label: "Net projeté",
          value: entrees - prevuTotal,
          tone: entrees - prevuTotal >= 0 ? "success" : "warm",
        },
      ],
      categories: [],
      planned: [...byCat.entries()].map(([key, g]) => ({
        key,
        label: g.label,
        icon: createElement(categories.find((c) => c.key === key)?.icon ?? categories[0].icon, {
          className: "h-4 w-4",
        }),
        total: g.total,
        postes: g.postes,
      })),
      plannedByDay: byDay,
      bills,
    };
  }, [zoom]);

  return (
    <BudgetVueTemplate
      title={viewTitle(view)}
      onPrevView={navIdx > 0 ? () => setNavIdx((i) => i - 1) : undefined}
      onNextView={navIdx < NAV_VIEWS.length - 1 ? () => setNavIdx((i) => i + 1) : undefined}
      zoom={zoom}
      onZoom={setZoom}
      onPrevMonth={() =>
        setZoom(
          (z) =>
            z &&
            (z.monthIdx > 0
              ? { ...z, monthIdx: z.monthIdx - 1 }
              : { year: z.year - 1, monthIdx: 11 }),
        )
      }
      onNextMonth={() =>
        setZoom(
          (z) =>
            z &&
            (z.monthIdx < 11
              ? { ...z, monthIdx: z.monthIdx + 1 }
              : { year: z.year + 1, monthIdx: 0 }),
        )
      }
      verdict={{
        status: verdict.status,
        axes: verdict.axes.map((a) => ({ ...a, linksToReserve: a.label === "Réserve" })),
      }}
      freshLabel={dataFreshness().lastMonth}
      flows={flows}
      monthlyBudget={monthlyBudget}
      upcoming={upcoming}
      provision={provision}
      liquidity={liquidity}
      categories={cards}
      month={month}
      reserveTo="/budget/vue/reserve"
      reserveSearch={{ view }}
      mensuelTo="/budget/mensuel"
      planificationTo="/budget/planification"
    >
      {/* Nested modal routes (e.g. /budget/vue/reserve) render here, over the vue */}
      <Outlet />
    </BudgetVueTemplate>
  );
}
