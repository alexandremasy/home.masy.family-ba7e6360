import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, X, Check, Pencil, ArrowUpDown } from "lucide-react";
import {
  categories,
  transactionsSeed,
  RECURRENCES,
  eur2,
  type Transaction,
  type CatKey,
  type Recurrence,
} from "@/lib/budget-data";
import { Button } from "@/components/button";
import { Checkbox } from "@/components/checkbox";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/select";
import { Eyebrow } from "@/components/eyebrow";
import { Card } from "@/components/card";

export const Route = createFileRoute("/_app/budget/transactions")({
  component: TransactionsPage,
  head: () => ({
    meta: [
      { title: "Transactions — Budget" },
      { name: "description", content: "Table éditable des transactions importées." },
    ],
  }),
});

type SortKey = "date" | "label" | "category" | "amount";

function TransactionsPage() {
  const [rows, setRows] = useState<Transaction[]>(transactionsSeed);
  const [query, setQuery] = useState("");
  const [catFilter, setCatFilter] = useState<CatKey | "all">("all");
  const [recFilter, setRecFilter] = useState<Recurrence | "all">("all");
  const [onlyUncat, setOnlyUncat] = useState(false);
  const [onlyEdited, setOnlyEdited] = useState(false);
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: "date", dir: -1 });
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [editing, setEditing] = useState<{ id: string; field: "category" | "amount" } | null>(null);
  const [bulkCat, setBulkCat] = useState<CatKey | "">("");

  const filtered = useMemo(() => {
    let r = rows;
    if (query) {
      const q = query.toLowerCase();
      r = r.filter((x) => x.label.toLowerCase().includes(q));
    }
    if (catFilter !== "all") r = r.filter((x) => x.category === catFilter);
    if (recFilter !== "all") r = r.filter((x) => x.recurrence === recFilter);
    if (onlyUncat) r = r.filter((x) => x.category === "divers");
    if (onlyEdited) r = r.filter((x) => x.provenance === "Édité");
    r = [...r].sort((a, b) => {
      const k = sort.key;
      const va = k === "category" ? a.category : a[k];
      const vb = k === "category" ? b.category : b[k];
      if (va! < vb!) return -1 * sort.dir;
      if (va! > vb!) return 1 * sort.dir;
      return 0;
    });
    return r;
  }, [rows, query, catFilter, recFilter, onlyUncat, onlyEdited, sort]);

  const runningTotal = filtered.reduce((s, x) => s + x.amount, 0);

  function updateRow(id: string, patch: Partial<Transaction>) {
    setRows((rs) =>
      rs.map((r) => (r.id === id ? { ...r, ...patch, provenance: "Édité" as const } : r)),
    );
  }
  function toggleSelect(id: string) {
    setSelected((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  }
  function applyBulk() {
    if (!bulkCat) return;
    const sub = categories.find((c) => c.key === bulkCat)?.subs[0]?.label ?? "—";
    setRows((rs) =>
      rs.map((r) =>
        selected.has(r.id) ? { ...r, category: bulkCat, sub, provenance: "Édité" as const } : r,
      ),
    );
    setSelected(new Set());
    setBulkCat("");
  }

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
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher un libellé…"
              className="w-full rounded-full border border-border/60 bg-background pl-9 pr-3 py-2 text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-2 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-full hover:bg-secondary"
                aria-label="Effacer"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0">
            <Select value={catFilter} onValueChange={(v) => setCatFilter(v as CatKey | "all")}>
              <SelectTrigger
                aria-label="Filtrer par catégorie"
                className="w-auto shrink-0 gap-2 rounded-full bg-background"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes catégories</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.key} value={c.key}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={recFilter} onValueChange={(v) => setRecFilter(v as Recurrence | "all")}>
              <SelectTrigger
                aria-label="Filtrer par récurrence"
                className="w-auto shrink-0 gap-2 rounded-full bg-background"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toute récurrence</SelectItem>
                {RECURRENCES.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Chip on={onlyUncat} onClick={() => setOnlyUncat((v) => !v)}>
              Non catégorisées
            </Chip>
            <Chip on={onlyEdited} onClick={() => setOnlyEdited((v) => !v)}>
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
          <Select value={bulkCat} onValueChange={(v) => setBulkCat(v as CatKey)}>
            <SelectTrigger
              aria-label="Recatégoriser la sélection"
              className="h-8 w-auto gap-2 rounded-full bg-background"
            >
              <SelectValue placeholder="Recatégoriser en…" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c.key} value={c.key}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            onClick={applyBulk}
            disabled={!bulkCat}
            variant="inverted"
            size="sm"
            className="gap-1 rounded-full"
          >
            <Check className="h-3.5 w-3.5" /> Appliquer
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
                      : selected.size === filtered.length
                        ? true
                        : "indeterminate"
                  }
                  onCheckedChange={(c) =>
                    setSelected(c ? new Set(filtered.map((r) => r.id)) : new Set())
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
            {filtered.map((r) => {
              const cat = categories.find((c) => c.key === r.category);
              const isUncat = r.category === "divers";
              const isSelected = selected.has(r.id);
              return (
                <TableRow
                  key={r.id}
                  data-state={isSelected ? "selected" : undefined}
                  className={
                    "group border-b border-border/40 transition-colors " +
                    (isSelected ? "bg-primary/5" : "hover:bg-secondary/40")
                  }
                >
                  <TableCell className="px-3 py-2.5">
                    <Checkbox
                      aria-label={`Sélectionner ${r.label}`}
                      checked={isSelected}
                      onCheckedChange={() => toggleSelect(r.id)}
                      className="h-3.5 w-3.5"
                    />
                  </TableCell>
                  <TableCell className="px-3 py-2.5 tabular-nums text-muted-foreground">
                    {r.date.slice(8, 10)}/{r.date.slice(5, 7)}
                  </TableCell>
                  <TableCell className="px-3 py-2.5">
                    <span className="font-semibold">{r.label}</span>
                    {isUncat && (
                      <span className="ml-2 inline-block rounded-full bg-warm/10 px-1.5 py-0.5 text-2xs uppercase tracking-wider text-warm">
                        À trier
                      </span>
                    )}
                  </TableCell>
                  <TableCell className="px-3 py-2.5">
                    {editing?.id === r.id && editing.field === "category" ? (
                      // Inline edit: `open` is driven by the row's editing state, and
                      // closing it clears that state — no autoFocus/onBlur dance.
                      <Select
                        open
                        value={r.category}
                        onOpenChange={(o) => {
                          if (!o) setEditing(null);
                        }}
                        onValueChange={(v) => {
                          const k = v as CatKey;
                          const sub = categories.find((c) => c.key === k)?.subs[0]?.label ?? "—";
                          updateRow(r.id, { category: k, sub });
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
                              {c.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <button
                        onClick={() => setEditing({ id: r.id, field: "category" })}
                        className="inline-flex items-center gap-1.5 rounded-md px-1.5 py-0.5 hover:bg-secondary"
                      >
                        <span
                          className="h-2 w-2 rounded-sm"
                          style={{ background: cat?.color ?? "var(--muted-foreground)" }}
                        />
                        <span>{cat?.label ?? r.category}</span>
                        <span className="text-muted-foreground"> › {r.sub}</span>
                        <Pencil className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-50" />
                      </button>
                    )}
                  </TableCell>
                  <TableCell className="px-3 py-2.5 text-right">
                    {editing?.id === r.id && editing.field === "amount" ? (
                      <input
                        autoFocus
                        type="number"
                        defaultValue={r.amount}
                        step="0.01"
                        onBlur={(e) => {
                          updateRow(r.id, { amount: parseFloat(e.target.value) || 0 });
                          setEditing(null);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") (e.target as HTMLInputElement).blur();
                        }}
                        className="w-24 rounded-md border border-ring bg-background px-2 py-1 text-right text-sm"
                      />
                    ) : (
                      <button
                        onClick={() => setEditing({ id: r.id, field: "amount" })}
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
                        (r.provenance === "Édité"
                          ? "bg-mustard/20 text-mustard"
                          : "bg-secondary text-muted-foreground")
                      }
                    >
                      {r.provenance}
                    </span>
                  </TableCell>
                </TableRow>
              );
            })}
            {filtered.length === 0 && (
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
      <p className="text-center text-xs text-muted-foreground">
        {filtered.length} ligne{filtered.length > 1 ? "s" : ""} · Total {eur2(runningTotal)}
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
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-colors " +
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
