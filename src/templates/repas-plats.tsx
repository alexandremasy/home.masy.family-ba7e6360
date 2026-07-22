import { Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Input } from "@/components/input";
import { DishFilters, applyFilter, EMPTY_FILTER, type DishFilter } from "@/components/dish-filters";
import { Card } from "@/components/card";
import { DishCard } from "@/components/dish-card";
import { type Base, type Dish } from "@/lib/maison-data";
import { DataState } from "@/components/data-state";
import { Search, Plus } from "lucide-react";

/**
 * The dish catalogue, as a page.
 *
 * A template is a whole route's presentation with **no idea where its data comes
 * from**: this repo hands it the mock store, the cockpit hands it a TanStack Query
 * result, and neither shows up in here. That is what makes the page copyable — the
 * route file on either side is then the few lines that fetch and pass.
 *
 * Search and filter state stays inside: it is view state, not app data. Nothing
 * outside the page reads it and nothing persists it.
 */
export interface PlatsTemplateProps {
  /** The catalogue. Already fetched — sorting and filtering happen in here. */
  dishes: Dish[];
  /** Still on its way. The mock store is synchronous, the api is not. */
  loading?: boolean;
  /** The fetch failed — say so instead of showing an empty catalogue. */
  error?: boolean;
  /** Retry handler, offered on `error`. */
  onRetry?: () => void;
}

export function PlatsTemplate({
  dishes,
  loading = false,
  error = false,
  onRetry,
}: PlatsTemplateProps) {
  const [filter, setFilter] = useState<DishFilter>(EMPTY_FILTER);
  const [query, setQuery] = useState("");

  const allBases = useMemo(
    () => [...new Set(dishes.map((d) => d.base))].sort() as Base[],
    [dishes],
  );
  const results = useMemo(() => applyFilter(dishes, filter, query), [dishes, filter, query]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Chercher un plat ou un composant…"
            className="pl-8"
          />
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <p className="text-xs text-muted-foreground">
            {results.length} plat{results.length > 1 ? "s" : ""} sur {dishes.length}
          </p>
        </div>
      </div>

      <DishFilters value={filter} onChange={setFilter} bases={allBases} />

      {/* The catalogue is never "empty": the add-a-dish card is always there, so a
          zero-result search still shows the grid. Only loading and failure replace it. */}
      {loading || error ? (
        <DataState status={error ? "error" : "loading"} label="les plats" onRetry={onRetry} />
      ) : (
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {/* Adding a dish is the first card of the catalogue, not a header button. */}
          <AddDishCard />
          {results.map((d) => (
            <CatalogueCard key={d.id} dish={d} />
          ))}
        </div>
      )}
    </div>
  );
}

/** Add-a-dish affordance — an empty, dashed card at the head of the catalogue
 *  grid (the "+ new dish" lives here, not in a header button). */
function AddDishCard() {
  return (
    <Link
      to="/repas/plats/nouveau"
      className="flex min-h-[7rem] flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-border/70 p-3.5 text-muted-foreground transition-all hover:border-primary hover:bg-secondary/40 hover:text-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <Plus className="h-5 w-5" />
      <span className="text-sm font-medium">Nouveau plat</span>
    </Link>
  );
}

/**
 * The catalogue shell around the shared DishCard body. No status pill: the
 * catalogue says what a dish IS, the plan is another view's business. The id is
 * stringified because route params are strings and the api's is a number.
 */
function CatalogueCard({ dish }: { dish: Dish }) {
  return (
    <Card variant="solid" to={`/repas/plats/${String(dish.id)}`}>
      <DishCard dish={dish} />
    </Card>
  );
}
