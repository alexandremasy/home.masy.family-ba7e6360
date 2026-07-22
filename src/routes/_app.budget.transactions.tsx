import { createFileRoute } from "@tanstack/react-router";
import { createElement, useMemo, useState } from "react";
import {
  TransactionsTemplate,
  type TxCategoryOption,
  type TxRowView,
} from "@/templates/budget-transactions";
import {
  categories,
  transactionsSeed,
  RECURRENCES,
  type Transaction,
  type CatKey,
} from "@/lib/budget-data";

export const Route = createFileRoute("/_app/budget/transactions")({
  component: TransactionsPage,
  head: () => ({
    meta: [
      { title: "Transactions — Budget" },
      { name: "description", content: "Table éditable des transactions importées." },
    ],
  }),
});

/**
 * The page is the template; this file only pretends to be a backend.
 *
 * It keeps the journal in memory and filters it on the spot — enough to make the
 * page *feel* right. The cockpit hands the same template rows the api filtered
 * server-side, which is exactly why the search, the scope and the month are
 * props: they are what a query keys on, wherever that query runs.
 */
function TransactionsPage() {
  const [rows, setRows] = useState<Transaction[]>(transactionsSeed);
  const [query, setQuery] = useState("");
  const [scope, setScope] = useState("all");
  const [recurrence, setRecurrence] = useState("all");
  const [onlyUncategorized, setOnlyUncategorized] = useState(false);
  const [onlyEdited, setOnlyEdited] = useState(false);

  // Every month the journal covers, most recent last — the same `YYYY-MM` the
  // api reports.
  const months = useMemo(
    () => [...new Set(transactionsSeed.map((t) => t.date.slice(0, 7)))].sort(),
    [],
  );
  const [month, setMonth] = useState<string>(() => months.at(-1) ?? "");

  const options = useMemo<TxCategoryOption[]>(
    () =>
      categories.map((c) => ({
        key: c.key,
        label: c.label,
        color: c.color,
        leading: createElement(c.icon, { className: "h-3.5 w-3.5" }),
        subs: c.subs.map((s) => ({ key: s.label, label: s.label })),
      })),
    [],
  );

  // A subcategory selection carries its category too: subcategory names recur
  // across categories ("Entretien" is both Logement and Transport).
  const scopeCat = scope.startsWith("cat:")
    ? scope.slice(4)
    : scope.startsWith("sub:")
      ? scope.slice(4).split("|")[0]
      : undefined;
  const scopeSub = scope.startsWith("sub:") ? scope.slice(4).split("|")[1] : undefined;

  const shown = useMemo<TxRowView[]>(() => {
    const q = query.trim().toLowerCase();
    return rows
      .filter((t) => {
        if (month && !t.date.startsWith(month)) return false;
        if (q && !t.label.toLowerCase().includes(q)) return false;
        if (scopeCat && t.category !== scopeCat) return false;
        if (scopeSub && t.sub !== scopeSub) return false;
        if (recurrence !== "all" && t.recurrence !== recurrence) return false;
        if (onlyUncategorized && t.category !== "divers") return false;
        if (onlyEdited && t.provenance !== "Édité") return false;
        return true;
      })
      .map((t) => {
        const cat = categories.find((c) => c.key === t.category);
        return {
          key: t.id,
          date: t.date,
          label: t.label,
          categoryKey: t.category,
          categoryLabel: cat?.label ?? t.category,
          categoryColor: cat?.color,
          subLabel: t.sub,
          amount: t.amount,
          recurrence: t.recurrence,
          needsReview: t.category === "divers",
          edited: t.provenance === "Édité",
        };
      });
  }, [rows, month, query, scopeCat, scopeSub, recurrence, onlyUncategorized, onlyEdited]);

  const patch = (ids: Set<string> | string, patch: Partial<Transaction>) => {
    const match = (id: string) => (typeof ids === "string" ? ids === id : ids.has(id));
    setRows((rs) =>
      rs.map((r) => (match(r.id) ? { ...r, ...patch, provenance: "Édité" as const } : r)),
    );
  };

  const fileUnder = (key: string, categoryKey: string) => {
    const cat = categoryKey as CatKey;
    // Filing under a category drops the row into its first subcategory: the sub
    // it used to sit in belongs to the category it just left.
    const sub = categories.find((c) => c.key === cat)?.subs[0]?.label ?? "—";
    patch(key, { category: cat, sub });
  };

  return (
    <TransactionsTemplate
      rows={shown}
      categories={options}
      recurrences={[...RECURRENCES]}
      months={months}
      month={month}
      onMonthChange={setMonth}
      query={query}
      onQueryChange={setQuery}
      scope={scope}
      onScopeChange={setScope}
      recurrence={recurrence}
      onRecurrenceChange={setRecurrence}
      onlyUncategorized={onlyUncategorized}
      onToggleUncategorized={() => setOnlyUncategorized((v) => !v)}
      onlyEdited={onlyEdited}
      onToggleEdited={() => setOnlyEdited((v) => !v)}
      onSetCategory={fileUnder}
      onSetAmount={(key, amount) => patch(key, { amount })}
      onBulkCategory={(keys, categoryKey) => {
        const cat = categoryKey as CatKey;
        const sub = categories.find((c) => c.key === cat)?.subs[0]?.label ?? "—";
        patch(new Set(keys), { category: cat, sub });
      }}
    />
  );
}
