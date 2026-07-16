import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  upcomingMeals, initialPlan, frLongDay, addDays, iso, TODAY,
  type UpcomingMeal, type Slot,
} from "@/lib/maison-data";
import { Check, Plus, Minus, X, ShoppingBasket, UtensilsCrossed, Undo2, Sun, Moon, ChevronUp } from "lucide-react";
import { Eyebrow } from "@/components/Eyebrow";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { DishCard } from "@/components/DishCard";
import { Drawer, DrawerTrigger, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";

export const Route = createFileRoute("/_app/repas/courses")({
  component: CoursesPage,
  head: () => ({ meta: [{ title: "Courses — Repas" }] }),
});

// A component is added to the global list when `${mealKey}::${name}` is selected.
const compKey = (mealKey: string, name: string) => `${mealKey}::${name}`;
// Manual input follows the data convention (capitalised) so it merges with the
// meal-derived ingredient of the same name instead of forming a second entry.
const norm = (s: string) => (s ? s[0].toUpperCase() + s.slice(1) : s);

type ListItem = { name: string; qty: number };

function CoursesPage() {
  const meals = useMemo(() => upcomingMeals(initialPlan), []);

  // Every component of every upcoming meal starts checked — the list is
  // pre-filled and the user prunes, rather than building from nothing.
  const [selected, setSelected] = useState<Set<string>>(() => {
    const s = new Set<string>();
    for (const m of meals) for (const c of m.components) s.add(compKey(m.key, c.name));
    return s;
  });
  // Manual adjustment per ingredient name (can be negative). The list quantity is
  // `meal count + adjustment`, so a hand-added item and a meal-derived one of the
  // same name are ONE entry. A hand-add is just adjustment +1.
  const [adjust, setAdjust] = useState<Record<string, number>>({});
  const [newName, setNewName] = useState("");
  // The bottom bar is portaled to <body> to escape the route's `mode-enter`
  // container, which keeps a `transform: scale(1)` (fill-mode: both) and would
  // otherwise anchor `position: fixed` to itself instead of the viewport.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  // Meal count per ingredient (a batch of the same dish counts its slots once —
  // upcomingMeals already excludes leftovers). This is the quantity's base.
  const mealCount = useMemo(() => {
    const c = new Map<string, number>();
    for (const m of meals) for (const comp of m.components) {
      if (selected.has(compKey(m.key, comp.name))) c.set(comp.name, (c.get(comp.name) ?? 0) + 1);
    }
    return c;
  }, [meals, selected]);

  // One entry per ingredient: cooked (base > 0) or hand-added (adjustment > 0).
  const items: ListItem[] = (() => {
    const names = new Set<string>();
    for (const [n, c] of mealCount) if (c > 0) names.add(n);
    for (const [n, d] of Object.entries(adjust)) if (d > 0) names.add(n);
    const out: ListItem[] = [];
    for (const name of names) {
      const qty = (mealCount.get(name) ?? 0) + (adjust[name] ?? 0);
      if (qty > 0) out.push({ name, qty });
    }
    return out;
  })();

  // The shopping list is always one flat, alphabetical list — no category buckets.
  const sortedItems = [...items].sort((a, b) => a.name.localeCompare(b.name, "fr"));

  // The full day grid for the left column: every day of the window, both slots.
  // A slot either holds a meal (toggleable) or nothing planned (an empty card).
  const WINDOW_DAYS = 10;
  type SlotCell = { slot: Slot; meal: UpcomingMeal | null };
  const days = (() => {
    const mealByKey = new Map(meals.map((m) => [m.key, m]));
    return Array.from({ length: WINDOW_DAYS }, (_, i) => {
      const di = iso(addDays(TODAY, i));
      const cells: SlotCell[] = (["midi", "soir"] as const).map((slot) => ({
        slot,
        meal: mealByKey.get(`${di}|${slot}`) ?? null,
      }));
      return { date: di, cells };
    });
  })();

  // ---- handlers ----------------------------------------------------------
  const toggleComponent = (mealKey: string, name: string) => {
    const k = compKey(mealKey, name);
    const removing = selected.has(k);
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(k)) next.delete(k); else next.add(k);
      return next;
    });
    // If that was the last meal carrying this ingredient, drop a leftover negative
    // adjustment so a later re-add doesn't resurface a stale quantity.
    if (removing) {
      const stillHas = meals.some((m) => m.key !== mealKey && selected.has(compKey(m.key, name)));
      if (!stillHas && (adjust[name] ?? 0) <= 0) setAdjust((a) => { const c = { ...a }; delete c[name]; return c; });
    }
  };

  const setQty = (name: string, next: number) => {
    const base = mealCount.get(name) ?? 0;
    if (next <= 0) {
      // The one rule: 0 unchecks every meal carrying it and drops the adjustment,
      // so it leaves the list entirely.
      if (base > 0) setSelected((prev) => {
        const s = new Set(prev);
        for (const m of meals) s.delete(compKey(m.key, name));
        return s;
      });
      setAdjust((a) => { const c = { ...a }; delete c[name]; return c; });
      return;
    }
    // Store the delta from the meal base — positive above it, negative below.
    setAdjust((a) => ({ ...a, [name]: next - base }));
  };

  const addManual = () => {
    const name = norm(newName.trim());
    if (!name) return;
    setAdjust((a) => ({ ...a, [name]: (a[name] ?? 0) + 1 }));
    setNewName("");
  };

  const resetAll = () => {
    const s = new Set<string>();
    for (const m of meals) for (const c of m.components) s.add(compKey(m.key, c.name));
    setSelected(s);
    setAdjust({});
  };

  const totalItems = items.length;

  // The shopping list body is shared verbatim between the desktop side panel and
  // the mobile bottom drawer — one source, two shells.
  const listBody = (
    <>
      <div className="mb-3 flex items-center gap-1.5">
        <Input
          placeholder="Ajouter un article…"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") addManual(); }}
          className="h-9"
        />
        <Button size="sm" onClick={addManual} className="h-9 shrink-0 gap-1">
          <Plus className="h-3.5 w-3.5" />Ajouter
        </Button>
      </div>

      {items.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border/60 py-8 text-center text-sm text-muted-foreground">
          Liste vide — coche des composants dans les repas.
        </p>
      ) : (
        <ul className="divide-y divide-border/50">
          {sortedItems.map((it) => (
            <li key={it.name} className="group flex items-center gap-2 py-1.5">
              <p className="min-w-0 flex-1 truncate text-sm">{it.name}</p>
              <div className="flex shrink-0 items-center gap-0.5 rounded-md border border-border/60 bg-background">
                <button
                  onClick={() => setQty(it.name, it.qty - 1)}
                  aria-label="Diminuer"
                  className="grid h-7 w-7 place-items-center text-muted-foreground hover:text-foreground"
                >
                  <Minus className="h-3 w-3" />
                </button>
                <span className="min-w-[1.75rem] text-center text-xs tabular-nums">{it.qty}</span>
                <button
                  onClick={() => setQty(it.name, it.qty + 1)}
                  aria-label="Augmenter"
                  className="grid h-7 w-7 place-items-center text-muted-foreground hover:text-foreground"
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>
              {/* Touch has no hover: keep the remove button visible on mobile,
                  hover-revealed on desktop. */}
              <button
                onClick={() => setQty(it.name, 0)}
                aria-label="Retirer"
                className="grid h-7 w-7 shrink-0 place-items-center rounded-md text-muted-foreground/60 transition-colors hover:text-destructive"
              >
                <X className="h-3 w-3" />
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-4 flex items-center justify-between border-t border-border/50 pt-3">
        <span className="inline-flex items-center gap-1 text-2xs text-muted-foreground">
          <ShoppingBasket className="h-3 w-3" />{totalItems} article{totalItems > 1 ? "s" : ""}
        </span>
        <Button size="sm" variant="ghost" onClick={resetAll} className="h-7 gap-1 text-xs">
          <Undo2 className="h-3 w-3" />Réinitialiser
        </Button>
      </div>
    </>
  );

  return (
    <div className="pb-24">
      {/* ── Left: meals and their components — no framed panel, just the list ── */}
      <div className="anim-slide-up">
        <header className="mb-5 flex items-end justify-between gap-4">
          <h2 className="font-serif text-xl tracking-tight text-foreground">Prochains repas</h2>
          <Eyebrow size="xs" as="span">{meals.length} repas</Eyebrow>
        </header>
        <p className="mb-4 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
          <UtensilsCrossed className="h-3 w-3 text-primary" />
          Coche un composant pour l'ajouter à la liste — décoche pour le retirer.
        </p>
        <div className="space-y-5">
          {days.map(({ date, cells }) => (
            <div key={date}>
              <Eyebrow size="xs" className="mb-2">{frLongDay(new Date(date))}</Eyebrow>
              <div className="grid items-stretch gap-3 sm:grid-cols-2">
                {cells.map((cell) => {
                  // The slot marker lives OUTSIDE the card — a sun for midi, a
                  // moon for soir, matching the planning grid.
                  const Icon = cell.slot === "midi" ? Sun : Moon;
                  const label = cell.slot === "midi" ? "Midi" : "Soir";
                  return (
                    <div key={cell.slot} className="flex flex-col gap-1.5">
                      <Icon className="h-4 w-4 shrink-0 text-muted-foreground" aria-label={label} />
                      {!cell.meal ? (
                        <Empty className="flex-1 rounded-xl border border-border/60 p-4 md:p-6">
                          <EmptyHeader>
                            <EmptyMedia variant="icon" className="text-muted-foreground/60"><UtensilsCrossed /></EmptyMedia>
                            <EmptyTitle className="text-base font-normal text-muted-foreground/70">Rien de planifié</EmptyTitle>
                          </EmptyHeader>
                        </Empty>
                      ) : (
                        <div className="flex flex-1 flex-col rounded-xl border border-border/60 bg-card p-3.5">
                          <DishCard
                            dish={cell.meal.dish}
                            footer={
                              <div className="mt-3 flex flex-wrap gap-1.5">
                                {cell.meal.components.map((c) => {
                                  const checked = selected.has(compKey(cell.meal!.key, c.name));
                                  return (
                                    <button
                                      key={c.name}
                                      onClick={() => toggleComponent(cell.meal!.key, c.name)}
                                      aria-pressed={checked}
                                      className={
                                        "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs transition-colors " +
                                        (checked
                                          ? "border-primary/30 bg-primary/10 text-primary"
                                          : "border-border/60 text-muted-foreground hover:border-border hover:text-foreground")
                                      }
                                    >
                                      {checked ? <Check className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
                                      {c.name}
                                    </button>
                                  );
                                })}
                              </div>
                            }
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── The list lives in a bottom sheet, its bar always visible.
          Portaled to <body> so `position: fixed` anchors to the viewport. ── */}
      {mounted && createPortal(
        <Drawer>
          <DrawerTrigger asChild>
            <button className="fixed inset-x-0 bottom-0 z-50 flex items-center justify-between gap-3 border-t border-border/60 bg-card/95 px-4 py-3 shadow-lift backdrop-blur supports-[backdrop-filter]:bg-card/80">
              <span className="inline-flex items-center gap-2 text-sm font-medium">
                <ShoppingBasket className="h-4 w-4 text-primary" />
                Liste · {totalItems} article{totalItems > 1 ? "s" : ""}
              </span>
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            </button>
          </DrawerTrigger>
          <DrawerContent className="max-h-[85dvh]">
            <DrawerHeader className="text-left">
              <DrawerTitle className="font-serif text-xl tracking-tight">Liste de courses</DrawerTitle>
            </DrawerHeader>
            <div className="overflow-y-auto px-4 pb-8">{listBody}</div>
          </DrawerContent>
        </Drawer>,
        document.body,
      )}
    </div>
  );
}
