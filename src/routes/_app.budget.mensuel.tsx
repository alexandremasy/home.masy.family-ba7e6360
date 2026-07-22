import { createFileRoute } from "@tanstack/react-router";
import { createElement, useMemo, useState } from "react";
import {
  MensuelTemplate,
  type MonthCategoryView,
  type MonthPressureView,
} from "@/templates/budget-mensuel";
import {
  categories,
  calendarBills,
  envelopes,
  incomeSources,
  monthlyAnnualProvision,
  MONTHS_FR_LONG,
} from "@/lib/budget-data";

export const Route = createFileRoute("/_app/budget/mensuel")({
  component: MensuelPage,
  head: () => ({
    meta: [
      { title: "Mensuel — Budget" },
      {
        name: "description",
        content: "Vue mensuelle : entrées, dépenses, prévu vs réel et catégories.",
      },
    ],
  }),
});

/**
 * The page is the template; this file only pretends to be a backend.
 *
 * The figures do not actually change with the month — the mock has one set of
 * categories — but the controls do move, which is enough to feel the shape. The
 * cockpit fetches a summary per month, and a merge of twelve for the rolling
 * window; the template only ever sees the numbers that came out of it.
 */
function MensuelPage() {
  const [monthOffset, setMonthOffset] = useState(0);
  const [rolling, setRolling] = useState(false);

  const viewDate = useMemo(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth() + monthOffset, 1);
  }, [monthOffset]);
  const monthLabel = `${MONTHS_FR_LONG[viewDate.getMonth()]} ${viewDate.getFullYear()}`;

  const cats = useMemo<MonthCategoryView[]>(
    () =>
      categories.map((c) => ({
        key: c.key,
        label: c.label,
        color: c.color,
        icon: createElement(c.icon, { className: "h-4 w-4" }),
        actual: c.actual,
        budget: c.budget,
        subs: c.subs,
      })),
    [],
  );

  // The mock only marks the incomes; anything unmarked is money going out.
  const pressure = useMemo<MonthPressureView[]>(
    () =>
      (calendarBills[viewDate.getMonth()] ?? []).map((b) => ({
        label: b.label,
        amount: b.amount,
        kind: b.kind === "income" ? "income" : "expense",
      })),
    [viewDate],
  );

  const income = incomeSources.reduce((s, i) => s + i.value, 0);
  const expenses = cats.reduce((s, c) => s + c.actual, 0);
  const budget = cats.reduce((s, c) => s + c.budget, 0);

  return (
    <MensuelTemplate
      monthLabel={monthLabel}
      rolling={rolling}
      onRollingChange={setRolling}
      onPrevMonth={() => setMonthOffset((o) => o - 1)}
      onNextMonth={monthOffset < 0 ? () => setMonthOffset((o) => Math.min(0, o + 1)) : undefined}
      income={income}
      expenses={expenses}
      net={income - expenses - monthlyAnnualProvision}
      savings={envelopes.reduce((s, e) => s + e.contrib, 0)}
      expenseDelta={expenses - budget}
      incomeSources={incomeSources}
      categories={cats}
      pressure={pressure}
      transactionsTo="/budget/transactions"
    />
  );
}
