import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DishFilters, applyFilter, EMPTY_FILTER, type DishFilter } from "@/components/DishFilters";
import { useDishes } from "@/lib/dishes-store";
import { initialPlan, effortLevel, fmtMinutes, type Base, type Dish } from "@/lib/maison-data";
import { cap } from "@/lib/utils";
import { Search, Package, Repeat, Zap, Flame, Plus } from "lucide-react";

export const Route = createFileRoute("/_app/repas/plats/")({
  component: PlatsPage,
  head: () => ({ meta: [{ title: "Plats — Repas" }] }),
});

function PlatsPage() {
  const { dishes } = useDishes();
  const [filter, setFilter] = useState<DishFilter>(EMPTY_FILTER);
  const [query, setQuery] = useState("");

  const allBases = useMemo(() => [...new Set(dishes.map((d) => d.base))].sort() as Base[], [dishes]);
  const results = useMemo(() => applyFilter(dishes, filter, query), [dishes, filter, query]);

  // How often each dish is on the current plan — the catalogue's job is to show
  // what exists, but "never served" is the useful signal here.
  const planned = useMemo(() => {
    const m = new Map<string, number>();
    for (const e of initialPlan) m.set(e.dishId, (m.get(e.dishId) ?? 0) + 1);
    return m;
  }, []);

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
          <Button asChild size="sm" className="gap-1.5">
            <Link to="/repas/plats/nouveau"><Plus className="h-3.5 w-3.5" />Nouveau plat</Link>
          </Button>
        </div>
      </div>

      <DishFilters value={filter} onChange={setFilter} bases={allBases} />

      {results.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted-foreground">
          Aucun plat ne correspond à ces critères.
        </p>
      ) : (
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((d) => <DishCard key={d.id} dish={d} plannedCount={planned.get(d.id) ?? 0} />)}
        </div>
      )}
    </div>
  );
}

function DishCard({ dish, plannedCount }: { dish: Dish; plannedCount: number }) {
  return (
    <Link
      to="/repas/plats/$dishId"
      params={{ dishId: dish.id }}
      className="flex flex-col rounded-xl border border-border/60 bg-card p-3.5 transition-all hover:border-primary hover:bg-secondary/40 hover:shadow-lift focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <DishCard
        dish={dish}
        status={
          plannedCount > 0
            ? <StatusPill tone="primary">×{plannedCount} au plan</StatusPill>
            : undefined
        }
        footer={
          // The catalogue's own extra: the practical properties, at a glance.
          <div className="mt-3 flex flex-wrap items-center gap-2.5 text-[11px] text-muted-foreground">
            {dish.emportable && <span className="inline-flex items-center gap-1"><Package className="h-3 w-3" />emportable</span>}
            {dish.rendement > 1 && <span className="inline-flex items-center gap-1"><Repeat className="h-3 w-3" />{dish.rendement} créneaux</span>}
            <span className="inline-flex items-center gap-1">
              {dish.effort === 1 ? <Zap className="h-3 w-3" /> : <Flame className="h-3 w-3" />}
              {effortLevel(dish.effort).label.toLowerCase()} · {fmtMinutes(effortLevel(dish.effort).minutes)}
            </span>
          </div>
        }
      />
    </Link>
  );
}
