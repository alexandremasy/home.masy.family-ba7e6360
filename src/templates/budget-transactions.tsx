import { useMemo, useState, type ReactNode } from "react";
import { Search, X, Check, Pencil, ArrowUpDown, Loader2 } from "lucide-react";
import { eur2 } from "@/lib/budget-data";
import { Button } from "@/components/button";
import { Card } from "@/components/card";
import { Checkbox } from "@/components/checkbox";
import { DataState } from "@/components/data-state";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/table";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/select";
import { Eyebrow } from "@/components/eyebrow";

/* ─────────────────────────────────────────────────────────────────────────────
   The transaction journal, as a page.

   Its props are its OWN shapes, deliberately minimal — not the mock's types and
   not the api's. A row carries an opaque `key` and an ALREADY SIGNED amount: the
   mockup keeps the sign in its data, the api keeps a positive amount plus a
   `kind`, and neither convention reaches this file.

   What the caller owns is what its queries key on — the month, the search, the
   scope and the two toggles — because the api filters server-side while the
   mockup filters in memory, and the page must not care which. What stays here is
   what no data decides: the sort, the selection, and the inline edit.
   ──────────────────────────────────────────────────────────────────────────── */

/** A category the rows can be filed under, with its subcategories. */
export interface TxCategoryOption {
  /** Opaque category identity, handed back on recategorise. */
  key: string;
  label: string;
  /** The swatch colour in the table and the menu. */
  color?: string;
  /** Whatever marks the category in the menu — an icon, an emoji. */
  leading?: ReactNode;
  /** Its subcategories, offered as narrower filters. */
  subs?: { key: string; label: string }[];
}

/** One line of the journal. */
export interface TxRowView {
  /** Opaque row identity, handed back on every edit. */
  key: string;
  /** ISO date, `YYYY-MM-DD`. Only the day and month are shown. */
  date: string;
  label: string;
  /** Which category option this row sits in — the inline select's value. */
  categoryKey: string;
  categoryLabel: string;
  categoryColor?: string;
  subLabel?: string | null;
  /** SIGNED: negative spends, positive comes in. Each side owns its own convention. */
  amount: number;
  recurrence: string;
  /** Flags the row as "À trier" — it was never really categorised. */
  needsReview?: boolean;
  /** The row was edited by hand, so an import must not overwrite it. */
  edited?: boolean;
  /** A write is in flight for this row. */
  busy?: boolean;
}

export interface TransactionsTemplateProps {
  /** The rows to show, already filtered by whatever the caller filters on. */
  rows: TxRowView[];
  /** The category tree, for the filter menu and the inline edit. */
  categories: TxCategoryOption[];
  /** The recurrence values worth filtering on. */
  recurrences: string[];
  /** Months to offer. Omit (or pass one) and no month selector is rendered. */
  months?: string[];
  /** The month being shown. */
  month?: string | null;
  onMonthChange?: (month: string) => void;
  /** The label search. */
  query: string;
  onQueryChange: (query: string) => void;
  /** `all`, `cat:<categoryKey>`, or `sub:<categoryKey>|<subKey>`. */
  scope: string;
  onScopeChange: (scope: string) => void;
  /** `all` or one of `recurrences`. */
  recurrence: string;
  onRecurrenceChange: (recurrence: string) => void;
  /** Keep only what was never really categorised. */
  onlyUncategorized: boolean;
  onToggleUncategorized: () => void;
  /** Keep only what was edited by hand. */
  onlyEdited: boolean;
  onToggleEdited: () => void;
  /** File one row under another category. */
  onSetCategory: (rowKey: string, categoryKey: string) => void;
  /** Set one row's amount, SIGNED as it is displayed. */
  onSetAmount: (rowKey: string, amount: number) => void;
  /** File the whole selection under one category. */
  onBulkCategory: (rowKeys: string[], categoryKey: string) => void;
  /** A bulk write is in flight. */
  bulkPending?: boolean;
  /** The rows are still on their way. */
  loading?: boolean;
  /** The rows could not be loaded. */
  error?: boolean;
  onRetry?: () => void;
}

type SortKey = "date" | "label" | "category" | "amount";

export function TransactionsTemplate({
  rows,
  categories,
  recurrences,
  months,
  month,
  onMonthChange,
  query,
  onQueryChange,
  scope,
  onScopeChange,
  recurrence,
  onRecurrenceChange,
  onlyUncategorized,
  onToggleUncategorized,
  onlyEdited,
  onToggleEdited,
  onSetCategory,
  onSetAmount,
  onBulkCategory,
  bulkPending = false,
  loading = false,
  error = false,
  onRetry,
}: TransactionsTemplateProps) {
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: "date", dir: -1 });
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [editing, setEditing] = useState<{ key: string; field: "category" | "amount" } | null>(
    null,
  );
  const [bulkCat, setBulkCat] = useState<string>("");

  const sorted = useMemo(() => {
    const value = (r: TxRowView) =>
      sort.key === "category" ? r.categoryLabel : sort.key === "amount" ? r.amount : r[sort.key];
    return [...rows].sort((a, b) => {
      const va = value(a);
      const vb = value(b);
      if (va < vb) return -1 * sort.dir;
      if (va > vb) return 1 * sort.dir;
      return 0;
    });
  }, [rows, sort]);

  const runningTotal = sorted.reduce((s, x) => s + x.amount, 0);

  const toggleSelect = (key: string) =>
    setSelected((s) => {
      const n = new Set(s);
      if (n.has(key)) n.delete(key);
      else n.add(key);
      return n;
    });

  const applyBulk = () => {
    if (!bulkCat || selected.size === 0) return;
    onBulkCategory([...selected], bulkCat);
    setSelected(new Set());
    setBulkCat("");
  };

  return (
    <div className="space-y-6 anim-slide-up">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-3 sm:flex sm:flex-wrap sm:justify-between sm:gap-4">
        <div className="min-w-0">
          <Eyebrow size="xs">Budget · Transactions</Eyebrow>
          <h1 className="mt-1 truncate text-xl tracking-tight sm:text-4xl">Le journal</h1>
          <p className="mt-1 hidden text-sm text-muted-foreground sm:block">
            Recherchez, recatégorisez, éditez. Vos modifications restent protégées à l'import.
          </p>
        </div>
        <div className="text-right">
          <Eyebrow size="xs">Total filtré</Eyebrow>
          <p
            className={
              "text-lg tabular-nums sm:text-xl " +
              (runningTotal >= 0 ? "text-success" : "text-warm")
            }
          >
            {runningTotal >= 0 ? "+" : ""}
            {eur2(runningTotal)}
          </p>
        </div>
      </div>

      {/* Toolbar */}
      <Card as="div" padding="sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
          <div className="relative min-w-0 flex-1 sm:min-w-[200px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              placeholder="Rechercher un libellé…"
              className="w-full rounded-full border border-border/60 bg-background pl-9 pr-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
            />
            {query && (
              <button
                onClick={() => onQueryChange("")}
                className="absolute right-2 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-full hover:bg-secondary"
                aria-label="Effacer"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
            {/* Only worth a control once there is more than one month to sit in. */}
            {months && months.length > 1 && month && onMonthChange && (
              <Select value={month} onValueChange={onMonthChange}>
                <SelectTrigger
                  aria-label="Filtrer par mois"
                  className="w-auto shrink-0 gap-2 rounded-full bg-background"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {months.map((m) => (
                    <SelectItem key={m} value={m}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {/* A whole category, or one subcategory of it. Subcategory names recur
                across categories, so the value carries both. */}
            <Select value={scope} onValueChange={onScopeChange}>
              <SelectTrigger
                aria-label="Filtrer par catégorie"
                className="w-auto shrink-0 gap-2 rounded-full bg-background"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes catégories</SelectItem>
                {categories.map((c) => (
                  <SelectGroup key={c.key}>
                    <SelectLabel>
                      <span className="inline-flex items-center gap-1.5">
                        {c.leading}
                        {c.label}
                      </span>
                    </SelectLabel>
                    <SelectItem value={`cat:${c.key}`}>Toute la catégorie</SelectItem>
                    {c.subs?.map((s) => (
                      <SelectItem
                        key={s.key}
                        value={`sub:${c.key}|${s.key}`}
                      >{`› ${s.label}`}</SelectItem>
                    ))}
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>
            <Select value={recurrence} onValueChange={onRecurrenceChange}>
              <SelectTrigger
                aria-label="Filtrer par récurrence"
                className="w-auto shrink-0 gap-2 rounded-full bg-background"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toute récurrence</SelectItem>
                {recurrences.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Chip on={onlyUncategorized} onClick={onToggleUncategorized}>
              Non catégorisées
            </Chip>
            <Chip on={onlyEdited} onClick={onToggleEdited}>
              Modifiées localement
            </Chip>
          </div>
        </div>
      </Card>

      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div className="sticky top-[var(--nav-h)] z-20 flex flex-wrap items-center gap-3 rounded-2xl border border-primary/30 bg-primary/10 px-4 py-3 shadow-soft anim-slide-up">
          <span className="text-sm font-semibold">
            {selected.size} sélection{selected.size > 1 ? "s" : ""}
          </span>
          <Select value={bulkCat} onValueChange={setBulkCat}>
            <SelectTrigger
              aria-label="Recatégoriser la sélection"
              className="h-8 w-auto gap-2 rounded-full bg-background"
            >
              <SelectValue placeholder="Recatégoriser en…" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c.key} value={c.key}>
                  <span className="inline-flex items-center gap-1.5">
                    {c.leading}
                    {c.label}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            onClick={applyBulk}
            disabled={!bulkCat || bulkPending}
            variant="inverted"
            size="sm"
            className="gap-1 rounded-full"
          >
            {bulkPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Check className="h-3.5 w-3.5" />
            )}{" "}
            Appliquer
          </Button>
          <button
            onClick={() => setSelected(new Set())}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Annuler
          </button>
        </div>
      )}

      {/* Table */}
      {loading || error ? (
        <DataState
          status={error ? "error" : "loading"}
          label="les transactions"
          onRetry={onRetry}
        />
      ) : (
        <Card bleed padding="sm">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-border/60 text-left text-xs uppercase tracking-eyebrow text-muted-foreground hover:bg-transparent">
                <TableHead className="w-10 px-3 py-3">
                  <Checkbox
                    aria-label="Tout sélectionner"
                    checked={
                      selected.size === 0
                        ? false
                        : selected.size === sorted.length
                          ? true
                          : "indeterminate"
                    }
                    onCheckedChange={(c) =>
                      setSelected(c ? new Set(sorted.map((r) => r.key)) : new Set())
                    }
                    className="h-3.5 w-3.5"
                  />
                </TableHead>
                <ThSort label="Date" k="date" sort={sort} setSort={setSort} />
                <ThSort label="Libellé" k="label" sort={sort} setSort={setSort} />
                <ThSort label="Catégorie" k="category" sort={sort} setSort={setSort} />
                <ThSort
                  label="Montant"
                  k="amount"
                  sort={sort}
                  setSort={setSort}
                  className="text-right"
                />
                <TableHead className="px-3 py-3">Récurrence</TableHead>
                <TableHead className="px-3 py-3">Provenance</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sorted.map((r) => {
                const isSelected = selected.has(r.key);
                return (
                  <TableRow
                    key={r.key}
                    data-state={isSelected ? "selected" : undefined}
                    className={
                      "group border-b border-border/40 transition-colors " +
                      (isSelected ? "bg-primary/5" : "hover:bg-secondary/40") +
                      (r.busy ? " opacity-50" : "")
                    }
                  >
                    <TableCell className="px-3 py-2.5">
                      <Checkbox
                        aria-label={`Sélectionner ${r.label}`}
                        checked={isSelected}
                        onCheckedChange={() => toggleSelect(r.key)}
                        className="h-3.5 w-3.5"
                      />
                    </TableCell>
                    <TableCell className="px-3 py-2.5 tabular-nums text-muted-foreground whitespace-nowrap">
                      {r.date.slice(8, 10)}/{r.date.slice(5, 7)}
                    </TableCell>
                    <TableCell className="px-3 py-2.5">
                      <span className="font-semibold">{r.label}</span>
                      {r.needsReview && (
                        <span className="ml-2 inline-block rounded-full bg-warm/10 px-1.5 py-0.5 text-2xs uppercase tracking-wider text-warm">
                          À trier
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="px-3 py-2.5">
                      {editing?.key === r.key && editing.field === "category" ? (
                        // Inline edit: `open` is driven by the row's editing state, and
                        // closing it clears that state — no autoFocus/onBlur dance.
                        <Select
                          open
                          value={r.categoryKey}
                          onOpenChange={(o) => {
                            if (!o) setEditing(null);
                          }}
                          onValueChange={(v) => {
                            onSetCategory(r.key, v);
                            setEditing(null);
                          }}
                        >
                          <SelectTrigger
                            aria-label="Changer la catégorie"
                            className="h-8 w-auto gap-2 border-ring bg-background"
                          >
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map((c) => (
                              <SelectItem key={c.key} value={c.key}>
                                <span className="inline-flex items-center gap-1.5">
                                  {c.leading}
                                  {c.label}
                                </span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <button
                          onClick={() => setEditing({ key: r.key, field: "category" })}
                          className="inline-flex items-center gap-1.5 rounded-md px-1.5 py-0.5 hover:bg-secondary"
                        >
                          <span
                            className="h-2 w-2 rounded-sm"
                            style={{ background: r.categoryColor ?? "var(--muted-foreground)" }}
                          />
                          <span>{r.categoryLabel}</span>
                          {r.subLabel && (
                            <span className="text-muted-foreground"> › {r.subLabel}</span>
                          )}
                          <Pencil className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-50" />
                        </button>
                      )}
                    </TableCell>
                    <TableCell className="px-3 py-2.5 text-right">
                      {editing?.key === r.key && editing.field === "amount" ? (
                        <input
                          autoFocus
                          type="number"
                          defaultValue={r.amount}
                          step="0.01"
                          onBlur={(e) => {
                            const v = parseFloat(e.target.value);
                            setEditing(null);
                            if (!Number.isNaN(v) && v !== r.amount) onSetAmount(r.key, v);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                          }}
                          className="w-24 rounded-md border border-ring bg-background px-2 py-1 text-right text-sm"
                        />
                      ) : (
                        <button
                          onClick={() => setEditing({ key: r.key, field: "amount" })}
                          className={
                            "rounded-md px-1.5 py-0.5 tabular-nums hover:bg-secondary " +
                            (r.amount > 0 ? "text-success font-semibold" : "")
                          }
                        >
                          {r.amount > 0 ? "+" : ""}
                          {eur2(r.amount)}
                        </button>
                      )}
                    </TableCell>
                    <TableCell className="px-3 py-2.5 text-muted-foreground">
                      {r.recurrence}
                    </TableCell>
                    <TableCell className="px-3 py-2.5">
                      <span
                        className={
                          "inline-block rounded-full px-2 py-0.5 text-2xs uppercase tracking-wider " +
                          (r.edited
                            ? "bg-mustard/20 text-mustard"
                            : "bg-secondary text-muted-foreground")
                        }
                      >
                        {r.edited ? "Édité" : "Importé"}
                      </span>
                    </TableCell>
                  </TableRow>
                );
              })}
              {sorted.length === 0 && (
                <TableRow className="hover:bg-transparent">
                  <TableCell
                    colSpan={7}
                    className="px-3 py-10 text-center text-sm text-muted-foreground"
                  >
                    Aucune transaction ne correspond.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Card>
      )}
      <p className="text-center text-xs text-muted-foreground">
        {sorted.length} ligne{sorted.length > 1 ? "s" : ""} · Total {eur2(runningTotal)}
      </p>
    </div>
  );
}

function Chip({
  on,
  onClick,
  children,
}: {
  on: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={
        "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-colors " +
        (on
          ? "border-foreground/30 bg-foreground text-background"
          : "border-border/60 bg-card text-muted-foreground hover:text-foreground")
      }
    >
      <span
        className={"h-1.5 w-1.5 rounded-full " + (on ? "bg-background" : "bg-muted-foreground")}
      />
      {children}
    </button>
  );
}

function ThSort({
  label,
  k,
  sort,
  setSort,
  className = "",
}: {
  label: string;
  k: SortKey;
  sort: { key: SortKey; dir: 1 | -1 };
  setSort: (s: { key: SortKey; dir: 1 | -1 }) => void;
  className?: string;
}) {
  const active = sort.key === k;
  return (
    <TableHead className={"px-3 py-3 " + className}>
      <button
        onClick={() => setSort({ key: k, dir: active ? (sort.dir === 1 ? -1 : 1) : 1 })}
        className={
          "inline-flex items-center gap-1 transition-colors " +
          (active ? "text-foreground" : "hover:text-foreground")
        }
      >
        {label} <ArrowUpDown className="h-3 w-3 opacity-60" />
      </button>
    </TableHead>
  );
}
